#!/usr/bin/env python3
"""Ordena tu carpeta

Cómo se usa (tres pasos):

  1. python3 ordena.py preparar "<carpeta>"
     Saca miniaturas y las junta en hojas numeradas (40 por hoja).
     Claude mira las hojas y escribe la propuesta en <carpeta>/.ordena/plan.json

  2. python3 ordena.py ver "<carpeta>"
     Abre http://localhost:8765 y enseña la propuesta. Desde ahí se mueven
     los archivos (o se deshace todo).

Formato de plan.json (lo escribe Claude):

  {
    "grupos": [
      {
        "carpeta": "Playa en Mallorca",
        "descripcion": "Día de playa con la familia",          (opcional)
        "archivos": [
          {"n": 12, "nombre": "Atardecer en el puerto"},
          {"n": 13, "nombre": "Niños haciendo un castillo"}
        ]
      }
    ]
  }

  - "n" es el número que aparece en la hoja y en archivos.json.
  - "nombre" va sin extensión; el programa conserva la original.
  - Lo que no aparezca en el plan se queda donde está.
"""

import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import threading
import webbrowser
from datetime import datetime
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFont, ImageOps
except ImportError:
    sys.exit("Falta Pillow. Instálalo con:  python3 -m pip install Pillow")

try:  # opcional: si está instalado, Pillow podrá leer HEIC directamente
    import pillow_heif  # type: ignore

    pillow_heif.register_heif_opener()
except Exception:
    pass

AQUI = Path(__file__).resolve().parent
PUERTO = 8765

FOTOS = {".jpg", ".jpeg", ".png", ".heic", ".webp", ".gif"}
VIDEOS = {".mov", ".mp4", ".m4v"}

MINI_LADO = 320          # lado largo de las miniaturas sueltas (para la página)
COLUMNAS, FILAS = 8, 5   # 40 miniaturas por hoja
CELDA_W, CELDA_H, HUECO = 188, 141, 4
POR_HOJA = COLUMNAS * FILAS

# ---------------------------------------------------------------- utilidades


def rutas(carpeta: Path) -> dict:
    base = carpeta / ".ordena"
    return {
        "base": base,
        "minis": base / "miniaturas",
        "hojas": base / "hojas",
        "archivos": base / "archivos.json",
        "plan": base / "plan.json",
        "diario": base / "movimientos.jsonl",
    }


def leer_json(ruta: Path, defecto=None):
    try:
        return json.loads(ruta.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return defecto


def escribir_json(ruta: Path, datos) -> None:
    ruta.parent.mkdir(parents=True, exist_ok=True)
    tmp = ruta.with_suffix(ruta.suffix + ".tmp")
    tmp.write_text(json.dumps(datos, ensure_ascii=False, indent=2), encoding="utf-8")
    os.replace(tmp, ruta)


def carpeta_valida(texto: str) -> Path:
    carpeta = Path(texto).expanduser().resolve()
    if not carpeta.is_dir():
        sys.exit(f"No encuentro la carpeta: {carpeta}")
    return carpeta


def hay_movimientos_activos(r: dict) -> bool:
    return r["diario"].exists() and r["diario"].stat().st_size > 0


# ---------------------------------------------------------------- metadatos


def _num(valor):
    try:
        return float(valor)
    except (TypeError, ValueError):
        return None


def meta_mac(ruta: Path) -> dict:
    """Fecha y coordenadas con mdls (solo Mac)."""
    if not shutil.which("mdls"):
        return {}
    try:
        salida = subprocess.run(
            ["mdls", "-raw", "-name", "kMDItemContentCreationDate",
             "-name", "kMDItemLatitude", "-name", "kMDItemLongitude", str(ruta)],
            capture_output=True, text=True, timeout=10,
        ).stdout
    except Exception:
        return {}
    partes = salida.split("\0")
    if len(partes) < 3:
        return {}
    res = {}
    fecha = partes[0].strip()
    if fecha and fecha != "(null)":
        try:
            res["fecha"] = datetime.strptime(fecha[:19], "%Y-%m-%d %H:%M:%S").isoformat()
        except ValueError:
            pass
    lat, lon = _num(partes[1]), _num(partes[2])
    if lat is not None and lon is not None:
        res["lat"], res["lon"] = lat, lon
    return res


def _grados(valor, ref):
    try:
        d, m, s = (float(x) for x in valor)
        g = d + m / 60 + s / 3600
        return -g if str(ref).upper() in ("S", "W") else g
    except Exception:
        return None


def meta_exif(img: Image.Image) -> dict:
    res = {}
    try:
        exif = img.getexif()
        fecha = None
        try:
            fecha = exif.get_ifd(0x8769).get(36867)  # DateTimeOriginal
        except Exception:
            pass
        fecha = fecha or exif.get(306)  # DateTime
        if fecha:
            res["fecha"] = datetime.strptime(str(fecha)[:19], "%Y:%m:%d %H:%M:%S").isoformat()
        gps = exif.get_ifd(0x8825)
        if gps and 2 in gps and 4 in gps:
            lat = _grados(gps[2], gps.get(1, "N"))
            lon = _grados(gps[4], gps.get(3, "E"))
            if lat is not None and lon is not None:
                res["lat"], res["lon"] = lat, lon
    except Exception:
        pass
    return res


def meta_video(ruta: Path) -> dict:
    if not shutil.which("ffprobe"):
        return {}
    try:
        salida = subprocess.run(
            ["ffprobe", "-v", "quiet", "-print_format", "json", "-show_format", str(ruta)],
            capture_output=True, text=True, timeout=20,
        ).stdout
        tags = json.loads(salida).get("format", {}).get("tags", {})
    except Exception:
        return {}
    tags = {k.lower(): v for k, v in tags.items()}
    res = {}
    if tags.get("creation_time"):
        try:
            res["fecha"] = datetime.fromisoformat(tags["creation_time"].replace("Z", "+00:00")) \
                .replace(tzinfo=None).isoformat(timespec="seconds")
        except ValueError:
            pass
    loc = tags.get("com.apple.quicktime.location.iso6709") or tags.get("location")
    if loc:
        m = re.match(r"([+-]\d+(?:\.\d+)?)([+-]\d+(?:\.\d+)?)", loc)
        if m:
            res["lat"], res["lon"] = float(m.group(1)), float(m.group(2))
    return res


# ---------------------------------------------------------------- miniaturas


def _abrir_imagen(ruta: Path) -> Image.Image:
    try:
        img = Image.open(ruta)
        if img.format == "JPEG":
            img.draft("RGB", (MINI_LADO * 2, MINI_LADO * 2))
        img.load()
        return img
    except Exception:
        if ruta.suffix.lower() == ".heic" and shutil.which("sips"):  # Mac sin pillow-heif
            with tempfile.TemporaryDirectory() as tmp:
                salida = Path(tmp) / "x.jpg"
                subprocess.run(["sips", "-s", "format", "jpeg", "-Z", str(MINI_LADO * 2),
                                str(ruta), "--out", str(salida)],
                               capture_output=True, timeout=60, check=True)
                img = Image.open(salida)
                img.load()
                return img
        raise


def _fotograma_video(ruta: Path) -> Image.Image:
    if not shutil.which("ffmpeg"):
        raise RuntimeError("falta ffmpeg")
    with tempfile.TemporaryDirectory() as tmp:
        salida = Path(tmp) / "f.jpg"
        for inicio in ("1", "0"):  # si dura menos de 1 s, el primer fotograma
            subprocess.run(
                ["ffmpeg", "-v", "error", "-y", "-ss", inicio, "-i", str(ruta),
                 "-frames:v", "1", "-vf", f"scale='min({MINI_LADO * 2},iw)':-2", str(salida)],
                capture_output=True, timeout=60,
            )
            if salida.exists() and salida.stat().st_size > 0:
                break
        img = Image.open(salida)
        img.load()
        return img


def _marcador(texto: str, tam=(MINI_LADO, int(MINI_LADO * 0.75))) -> Image.Image:
    img = Image.new("RGB", tam, (60, 60, 66))
    d = ImageDraw.Draw(img)
    d.text((tam[0] // 2, tam[1] // 2), texto, fill=(200, 200, 205),
           font=fuente(18), anchor="mm")
    return img


_FUENTES = {}


def fuente(tam: int):
    if tam in _FUENTES:
        return _FUENTES[tam]
    candidatas = [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf",
        "C:\\Windows\\Fonts\\arialbd.ttf",
    ]
    f = None
    for c in candidatas:
        try:
            f = ImageFont.truetype(c, tam)
            break
        except Exception:
            continue
    if f is None:
        try:
            f = ImageFont.load_default(size=tam)
        except TypeError:
            f = ImageFont.load_default()
    _FUENTES[tam] = f
    return f


def hacer_miniatura(ruta: Path, es_video: bool, destino: Path) -> tuple[bool, dict]:
    """Guarda la miniatura. Devuelve (ok, metadatos sacados de la imagen)."""
    meta = {}
    try:
        img = _fotograma_video(ruta) if es_video else _abrir_imagen(ruta)
        if not es_video:
            meta = meta_exif(img)
        img = ImageOps.exif_transpose(img)
        if img.mode in ("RGBA", "LA", "P"):
            img = img.convert("RGBA")
            fondo = Image.new("RGB", img.size, (255, 255, 255))
            fondo.paste(img, mask=img.split()[-1])
            img = fondo
        else:
            img = img.convert("RGB")
        img.thumbnail((MINI_LADO, MINI_LADO), Image.LANCZOS)
        ok = True
    except Exception as e:
        print(f"    (no pude leer {ruta.name}: {str(e)[:60]})")
        img = _marcador("VÍDEO" if es_video else "NO SE PUDO LEER")
        ok = False
    img.save(destino, "JPEG", quality=82)
    return ok, meta


def hacer_hoja(lote: list, minis: Path, destino: Path) -> None:
    ancho = COLUMNAS * CELDA_W + (COLUMNAS + 1) * HUECO
    alto = FILAS * CELDA_H + (FILAS + 1) * HUECO
    hoja = Image.new("RGB", (ancho, alto), (22, 22, 26))
    d = ImageDraw.Draw(hoja)
    f_num, f_tag = fuente(21), fuente(12)
    for i, a in enumerate(lote):
        fila, col = divmod(i, COLUMNAS)
        x = HUECO + col * (CELDA_W + HUECO)
        y = HUECO + fila * (CELDA_H + HUECO)
        with Image.open(minis / f"{a['n']:04d}.jpg") as m:
            m = m.copy()
        m.thumbnail((CELDA_W, CELDA_H), Image.LANCZOS)
        hoja.paste(m, (x + (CELDA_W - m.width) // 2, y + (CELDA_H - m.height) // 2))
        # número bien visible: amarillo sobre negro, esquina superior izquierda
        txt = str(a["n"])
        l, t, r, b = d.textbbox((0, 0), txt, font=f_num)
        d.rectangle((x, y, x + (r - l) + 12, y + (b - t) + 10), fill=(0, 0, 0))
        d.text((x + 6, y + 4 - t), txt, font=f_num, fill=(255, 221, 0))
        if a["tipo"] == "video":
            d.rectangle((x, y + CELDA_H - 17, x + 48, y + CELDA_H - 1), fill=(20, 80, 200))
            d.text((x + 5, y + CELDA_H - 15), "VÍDEO", font=f_tag, fill=(255, 255, 255))
    hoja.save(destino, "JPEG", quality=86)


# ---------------------------------------------------------------- preparar


def preparar(carpeta: Path) -> None:
    r = rutas(carpeta)
    if hay_movimientos_activos(r):
        sys.exit("Esta carpeta ya tiene archivos movidos. Primero pulsa «Deshacer» "
                 "en la página (python3 ordena.py ver ...), y luego vuelve a preparar.")
    nombres = sorted(
        (p for p in carpeta.iterdir()
         if p.is_file() and not p.name.startswith(".")
         and p.suffix.lower() in FOTOS | VIDEOS),
        key=lambda p: p.name.lower(),
    )
    if not nombres:
        sys.exit("No hay fotos ni vídeos en el primer nivel de esa carpeta.")

    for d in (r["minis"], r["hojas"]):
        if d.exists():
            shutil.rmtree(d)
        d.mkdir(parents=True)
    if r["plan"].exists():  # la numeración puede cambiar: no arrastrar un plan viejo
        os.replace(r["plan"], r["base"] / "plan.anterior.json")
        print("(El plan anterior se guardó como plan.anterior.json)")

    print(f"Preparando {len(nombres)} archivos en {carpeta} ...")
    archivos = []
    for n, p in enumerate(nombres, 1):
        es_video = p.suffix.lower() in VIDEOS
        ok, meta_img = hacer_miniatura(p, es_video, r["minis"] / f"{n:04d}.jpg")
        meta = meta_mac(p)
        for k, v in (meta_video(p) if es_video else meta_img).items():
            meta.setdefault(k, v)
        a = {"n": n, "nombre": p.name, "tipo": "video" if es_video else "foto"}
        a.update(meta)
        if not ok:
            a["sin_miniatura"] = True
        archivos.append(a)
        if n % 50 == 0:
            print(f"  {n}/{len(nombres)}")

    hojas = []
    for i in range(0, len(archivos), POR_HOJA):
        lote = archivos[i:i + POR_HOJA]
        nombre = f"hoja-{i // POR_HOJA + 1:02d}.jpg"
        hacer_hoja(lote, r["minis"], r["hojas"] / nombre)
        hojas.append({"archivo": nombre, "desde": lote[0]["n"], "hasta": lote[-1]["n"]})

    escribir_json(r["archivos"], {
        "carpeta": str(carpeta), "total": len(archivos), "hojas": hojas, "archivos": archivos,
    })
    print(f"\nListo: {len(archivos)} archivos, {len(hojas)} hojas en {r['hojas']}")
    print("Ahora Claude mira las hojas y escribe:", r["plan"])


# ---------------------------------------------------------------- plan


_PROHIBIDOS = re.compile(r'[\\/:*?"<>|\x00-\x1f]')


def limpiar_nombre(texto, defecto: str) -> str:
    t = _PROHIBIDOS.sub("-", str(texto or ""))
    t = re.sub(r"\s+", " ", t).strip(" .")
    t = t[:100].strip(" .")
    return t or defecto


def _libre(dir_: Path, base: str, ext: str, reservados: set) -> str:
    """Nombre que no choca con nada (ni con lo ya reservado en el plan)."""
    i, nombre = 1, base + ext
    while nombre.lower() in reservados or os.path.lexists(dir_ / nombre):
        i += 1
        nombre = f"{base} {i}{ext}"
    reservados.add(nombre.lower())
    return nombre


def cargar_plan(carpeta: Path):
    """Lee plan.json y lo valida. Devuelve None si aún no existe."""
    r = rutas(carpeta)
    crudo = leer_json(r["plan"])
    datos = leer_json(r["archivos"])
    if crudo is None or datos is None:
        return None
    por_n = {a["n"]: a for a in datos["archivos"]}
    avisos, usados, grupos, por_carpeta = [], set(), [], {}

    lista = crudo.get("grupos") if isinstance(crudo, dict) else None
    if not isinstance(lista, list):
        return {"grupos": [], "sin_clasificar": sorted(por_n),
                "avisos": ["plan.json no tiene la forma esperada (falta la lista «grupos»)."]}

    for g in lista:
        if not isinstance(g, dict):
            continue
        nombre_c = limpiar_nombre(g.get("carpeta"), "Sin nombre")
        if nombre_c.lower() == ".ordena":
            nombre_c = "Ordenadas"
        clave = nombre_c.lower()
        if clave not in por_carpeta:
            grp = {"carpeta": nombre_c, "descripcion": str(g.get("descripcion") or ""), "items": []}
            por_carpeta[clave] = grp
            grupos.append(grp)
        grp = por_carpeta[clave]
        for it in g.get("archivos", []):
            n = it.get("n") if isinstance(it, dict) else it
            if isinstance(n, bool) or not isinstance(n, int) or n not in por_n:
                avisos.append(f"El número {n!r} no existe y se ignora.")
                continue
            if n in usados:
                avisos.append(f"El {n} aparece dos veces; se usa solo la primera.")
                continue
            usados.add(n)
            a = por_n[n]
            ext = Path(a["nombre"]).suffix
            propio = it.get("nombre") if isinstance(it, dict) else None
            grp["items"].append({
                "n": n, "original": a["nombre"], "ext": ext,
                "base": limpiar_nombre(propio, Path(a["nombre"]).stem),
            })

    # nombres finales sin choques
    for grp in grupos:
        destino = carpeta / grp["carpeta"]
        reservados = set()
        for it in grp["items"]:
            it["final"] = _libre(destino, it["base"], it["ext"], reservados)
    grupos = [g for g in grupos if g["items"]]
    return {"grupos": grupos, "avisos": avisos,
            "sin_clasificar": sorted(n for n in por_n if n not in usados)}


# ---------------------------------------------------------------- mover / deshacer


class Error(Exception):
    pass


def _anotar(diario: Path, **linea) -> None:
    with open(diario, "a", encoding="utf-8") as f:
        f.write(json.dumps(linea, ensure_ascii=False) + "\n")
        f.flush()
        os.fsync(f.fileno())


def mover(carpeta: Path) -> dict:
    r = rutas(carpeta)
    if hay_movimientos_activos(r):
        raise Error("Ya se movieron los archivos. Pulsa «Deshacer» si quieres volver atrás.")
    plan = cargar_plan(carpeta)
    if not plan or not plan["grupos"]:
        raise Error("Todavía no hay una propuesta que aplicar.")

    movidos, faltan, carpetas = 0, [], 0
    for grp in plan["grupos"]:
        destino = carpeta / grp["carpeta"]
        if os.path.lexists(destino) and not destino.is_dir():
            raise Error(f"Ya existe un archivo llamado «{grp['carpeta']}»; no puedo crear esa carpeta.")
        creada = False
        for it in grp["items"]:
            origen = carpeta / it["original"]
            if not origen.is_file():
                faltan.append(it["original"])
                continue
            if not destino.exists():
                destino.mkdir()
                _anotar(r["diario"], op="crear", ruta=grp["carpeta"])
                creada = True
                carpetas += 1
            final = it["final"]
            if os.path.lexists(destino / final):  # por si algo cambió desde la vista previa
                final = _libre(destino, Path(final).stem, Path(final).suffix, set())
            # primero se anota la intención, luego se mueve: si se corta, se puede deshacer igual
            _anotar(r["diario"], op="mover", de=it["original"], a=f"{grp['carpeta']}/{final}")
            os.rename(origen, destino / final)
            movidos += 1
    return {"movidos": movidos, "carpetas": carpetas, "no_encontrados": faltan}


def deshacer(carpeta: Path) -> dict:
    r = rutas(carpeta)
    if not hay_movimientos_activos(r):
        raise Error("No hay nada que deshacer.")
    lineas = []
    for texto in r["diario"].read_text(encoding="utf-8").splitlines():
        try:
            lineas.append(json.loads(texto))
        except ValueError:
            pass

    devueltos, problemas, pendientes = 0, [], []
    for l in reversed(lineas):
        if l.get("op") != "mover":
            continue
        a, de = carpeta / l["a"], carpeta / l["de"]
        if not os.path.lexists(a):
            continue  # la intención se anotó pero el movimiento no llegó a hacerse
        if os.path.lexists(de):
            problemas.append(f"No pude devolver «{l['a']}»: ya existe «{l['de']}».")
            pendientes.append(l)
            continue
        os.rename(a, de)
        devueltos += 1
    for l in reversed(lineas):
        if l.get("op") == "crear":
            try:
                (carpeta / l["ruta"]).rmdir()  # solo si quedó vacía
            except OSError:
                pass

    if problemas:
        r["diario"].write_text(
            "".join(json.dumps(l, ensure_ascii=False) + "\n" for l in reversed(pendientes)),
            encoding="utf-8")
    else:
        os.replace(r["diario"], r["base"] / f"deshecho-{datetime.now():%Y%m%d-%H%M%S}.jsonl")
    return {"devueltos": devueltos, "problemas": problemas}


# ---------------------------------------------------------------- servidor


def estado(carpeta: Path) -> dict:
    r = rutas(carpeta)
    datos = leer_json(r["archivos"])
    if datos is None:
        return {"preparada": False, "carpeta": str(carpeta)}
    movido = hay_movimientos_activos(r)
    plan = cargar_plan(carpeta) if not movido else cargar_plan_movido(carpeta, r)
    return {
        "preparada": True,
        "carpeta": str(carpeta),
        "nombre_carpeta": carpeta.name or str(carpeta),
        "total": datos["total"],
        "hojas": datos["hojas"],
        "archivos": {a["n"]: a for a in datos["archivos"]},
        "plan": plan,
        "movido": movido,
    }


def cargar_plan_movido(carpeta: Path, r: dict):
    """Con los archivos ya movidos, la vista muestra lo que se hizo (según el diario)."""
    datos = leer_json(r["archivos"])
    por_nombre = {a["nombre"]: a["n"] for a in datos["archivos"]}
    grupos, orden = {}, []
    for texto in r["diario"].read_text(encoding="utf-8").splitlines():
        try:
            l = json.loads(texto)
        except ValueError:
            continue
        if l.get("op") != "mover" or l["de"] not in por_nombre:
            continue
        c, final = l["a"].split("/", 1)
        if c not in grupos:
            grupos[c] = {"carpeta": c, "descripcion": "", "items": []}
            orden.append(c)
        grupos[c]["items"].append({"n": por_nombre[l["de"]], "original": l["de"], "final": final})
    usados = {i["n"] for g in grupos.values() for i in g["items"]}
    return {"grupos": [grupos[c] for c in orden], "avisos": [],
            "sin_clasificar": sorted(n for n in por_nombre.values() if n not in usados)}


class Manejador(BaseHTTPRequestHandler):
    carpeta: Path
    server_version = "OrdenaTuCarpeta/1.0"

    def log_message(self, *a):  # silencio
        pass

    def _host_ok(self) -> bool:
        host = (self.headers.get("Host") or "").split(":")[0]
        return host in ("localhost", "127.0.0.1")

    def _enviar(self, codigo: int, cuerpo: bytes, tipo: str, cache=False):
        self.send_response(codigo)
        self.send_header("Content-Type", tipo)
        self.send_header("Content-Length", str(len(cuerpo)))
        self.send_header("Cache-Control", "max-age=3600" if cache else "no-store")
        self.end_headers()
        self.wfile.write(cuerpo)

    def _json(self, datos, codigo=200):
        self._enviar(codigo, json.dumps(datos, ensure_ascii=False).encode("utf-8"),
                     "application/json; charset=utf-8")

    def do_GET(self):
        if not self._host_ok():
            return self._enviar(403, b"", "text/plain")
        ruta = self.path.split("?")[0]
        r = rutas(self.carpeta)
        if ruta in ("/", "/index.html"):
            try:
                return self._enviar(200, (AQUI / "index.html").read_bytes(), "text/html; charset=utf-8")
            except OSError:
                return self._enviar(500, "Falta index.html junto a ordena.py".encode(), "text/plain; charset=utf-8")
        if ruta == "/api/estado":
            return self._json(estado(self.carpeta))
        m = re.fullmatch(r"/miniaturas/(\d{4})\.jpg", ruta)
        if m:
            return self._archivo(r["minis"] / f"{m.group(1)}.jpg")
        m = re.fullmatch(r"/hojas/(hoja-\d{2})\.jpg", ruta)
        if m:
            return self._archivo(r["hojas"] / f"{m.group(1)}.jpg")
        self._enviar(404, b"No encontrado", "text/plain; charset=utf-8")

    def _archivo(self, ruta: Path):
        try:
            self._enviar(200, ruta.read_bytes(), "image/jpeg", cache=True)
        except OSError:
            self._enviar(404, b"", "text/plain")

    def do_POST(self):
        # La cabecera propia obliga al navegador a pedir permiso si viniera de otra web.
        if not self._host_ok() or self.headers.get("X-Ordena") != "1":
            return self._enviar(403, b"", "text/plain")
        try:
            if self.path == "/api/mover":
                return self._json({"ok": True, **mover(self.carpeta)})
            if self.path == "/api/deshacer":
                return self._json({"ok": True, **deshacer(self.carpeta)})
        except Error as e:
            return self._json({"ok": False, "error": str(e)}, 400)
        except OSError as e:
            return self._json({"ok": False, "error": f"No pude mover un archivo: {e}"}, 500)
        self._enviar(404, b"No encontrado", "text/plain; charset=utf-8")


def ver(carpeta: Path, puerto: int, abrir: bool) -> None:
    if not rutas(carpeta)["archivos"].exists():
        sys.exit(f'Primero prepara la carpeta:  python3 ordena.py preparar "{carpeta}"')
    Manejador.carpeta = carpeta
    try:
        servidor = ThreadingHTTPServer(("127.0.0.1", puerto), Manejador)
    except OSError:
        sys.exit(f"El puerto {puerto} está ocupado (¿ya tienes la página abierta en otra ventana?).")
    url = f"http://localhost:{puerto}"
    print(f"Mostrando «{carpeta.name}» en {url}   (Ctrl+C para cerrar)")
    if abrir:
        threading.Timer(0.5, lambda: webbrowser.open(url)).start()
    try:
        servidor.serve_forever()
    except KeyboardInterrupt:
        print("\nCerrado.")


def main() -> None:
    ap = argparse.ArgumentParser(
        prog="ordena.py", description="Ordena tu carpeta de fotos y vídeos.",
        formatter_class=argparse.RawDescriptionHelpFormatter, epilog=__doc__)
    sub = ap.add_subparsers(dest="orden", required=True)
    p1 = sub.add_parser("preparar", help="saca miniaturas y hojas numeradas")
    p1.add_argument("carpeta")
    p2 = sub.add_parser("ver", help="abre la página con la propuesta")
    p2.add_argument("carpeta")
    p2.add_argument("--puerto", type=int, default=PUERTO)
    p2.add_argument("--no-abrir", action="store_true", help="no abrir el navegador")
    args = ap.parse_args()
    carpeta = carpeta_valida(args.carpeta)
    if args.orden == "preparar":
        preparar(carpeta)
    else:
        ver(carpeta, args.puerto, not args.no_abrir)


if __name__ == "__main__":
    main()
