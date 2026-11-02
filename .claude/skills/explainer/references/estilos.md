# Estilos visuales y tono del guion

Cada estilo trae tokens para `:root`, un link de fuentes y reglas de trazo. Reemplazá los tokens y el link de la plantilla. Ajustá la paleta al mundo del tema, pero mantené un solo acento.

## Reglas comunes

- Un solo color de acento. Marca al héroe y la palabra dicha en los subtítulos.
- Los subtítulos necesitan contraste de 4,5:1 sobre lo que tienen detrás.
- Sin emojis ni imágenes externas. Todo se dibuja en canvas con los tokens.
- Sin degradés violetas, destellos ni partículas de decoración. Son el look genérico.
- `--track` es el fondo de las barras de progreso. En estilos claros, usá negro con transparencia.

## Noche (default)

Fondo oscuro, íconos de trazo fino y un acento cálido. Sirve para tecnología, ciencia y noticias.

```css
--bg:#0A0E1F; --panel:#11172E; --panel-2:#182042; --line:#27305A; --glass:rgba(10,14,31,.82);
--ink:#F2F3FA; --muted:#8F97BF; --accent:#FFB454; --accent-2:#6FB6FF; --ok:#7EDDB3; --warn:#FF7A6B;
--sub-ink:#FFFFFF; --sub-edge:#0A0E1F; --track:rgba(255,255,255,.22);
--display:"Bricolage Grotesque",system-ui,sans-serif; --body:"Atkinson Hyperlegible",system-ui,sans-serif; --mono:"JetBrains Mono",ui-monospace,monospace;
color-scheme:dark;
```

Fuentes: `family=Atkinson+Hyperlegible:wght@400;700&family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,300..800&family=JetBrains+Mono:wght@400;600`

Trazo: líneas de 0,5 a 0,8 unidades. Rellenos con el color al 8 %–20 %. Brillos suaves solo en fuentes de luz.

## Papel

Fondo claro, tinta negra y un rojo editorial. Sirve para historia, negocios, cultura y clases.

```css
--bg:#F3EDE2; --panel:#FFFDF8; --panel-2:#E9E1D3; --line:#D2C7B5; --glass:rgba(243,237,226,.88);
--ink:#1D1B18; --muted:#6E665B; --accent:#D9442B; --accent-2:#2C59C9; --ok:#2E8C5F; --warn:#D9442B;
--sub-ink:#1D1B18; --sub-edge:#F3EDE2; --track:rgba(0,0,0,.15);
--display:"Fraunces",Georgia,serif; --body:"Instrument Sans",system-ui,sans-serif; --mono:"JetBrains Mono",ui-monospace,monospace;
color-scheme:light;
```

Fuentes: `family=Fraunces:opsz,wght@9..144,400..900&family=Instrument+Sans:wght@400..700&family=JetBrains+Mono:wght@400;600`

Trazo: tinta de 0,6 a 0,9 unidades. Rellenos planos en tonos de papel. El rojo solo en el héroe. Para la textura del papel, sumá un grano fijo:

```js
const GRAIN = (() => { const r = rng(3); return Array.from({ length: 600 }, () => [r(), r(), r()]); })();
function grain(F) { ctx.save(); ctx.fillStyle = C.ink; for (const [x, y, a] of GRAIN) { ctx.globalAlpha = .04 + a * .05; ctx.fillRect(lerp(F.left, F.right, x), lerp(F.top, F.bottom, y), .3, .3); } ctx.restore(); }
```

## Pizarra

Tiza sobre verde oscuro, trazo a mano. Sirve para educación y explicaciones paso a paso.

```css
--bg:#1E2A25; --panel:#25342E; --panel-2:#2C3E36; --line:#3E5249; --glass:rgba(30,42,37,.85);
--ink:#EDEEE6; --muted:#9DAAA2; --accent:#F5D45E; --accent-2:#86CBF5; --ok:#A3E29B; --warn:#F2948A;
--sub-ink:#FFFFFF; --sub-edge:#141D19; --track:rgba(255,255,255,.22);
--display:"Kalam",cursive; --body:"Atkinson Hyperlegible",system-ui,sans-serif; --mono:"JetBrains Mono",ui-monospace,monospace;
color-scheme:dark;
```

Fuentes: `family=Kalam:wght@400;700&family=Atkinson+Hyperlegible:wght@400;700&family=JetBrains+Mono:wght@400;600`

Trazo: tiza con temblor fijo. La semilla hace que el temblor no cambie entre cuadros.

```js
function chalk(x0, y0, x1, y1, seed, color = C.ink, lw = .7, k = 1) {
  const r = rng(seed), n = Math.max(4, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 3));
  ctx.save(); ctx.strokeStyle = color; ctx.lineCap = 'round';
  for (let pass = 0; pass < 2; pass++) {
    ctx.globalAlpha = pass ? .4 : .9; ctx.lineWidth = pass ? lw * .6 : lw;
    ctx.beginPath();
    for (let i = 0; i <= n * k; i++) { const q = i / n, j = (r() - .5) * lw; const x = lerp(x0, x1, q) + j, y = lerp(y0, y1, q) + j; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke();
  }
  ctx.restore();
}
```

`k` de 0 a 1 dibuja el trazo de a poco, como una mano que escribe.

## Plano color

Formas planas, saturadas y redondeadas. Sirve para productos, marketing y temas para todo público.

```css
--bg:#14213D; --panel:#1C2D52; --panel-2:#243A66; --line:#2F4677; --glass:rgba(20,33,61,.85);
--ink:#FFFFFF; --muted:#AAB7D4; --accent:#FF6B35; --accent-2:#2EC4B6; --ok:#9BE564; --warn:#FF3366;
--sub-ink:#FFFFFF; --sub-edge:#14213D; --track:rgba(255,255,255,.22);
--display:"Rubik",system-ui,sans-serif; --body:"Rubik",system-ui,sans-serif; --mono:"JetBrains Mono",ui-monospace,monospace;
color-scheme:dark;
```

Fuentes: `family=Rubik:wght@400..900&family=JetBrains+Mono:wght@400;600`

Trazo: casi sin contornos. Figuras rellenas con esquinas redondeadas. Sombras como la misma figura, más oscura, corrida 1 unidad abajo. Tres o cuatro colores por escena como máximo.

## Plano técnico

Grilla azul, líneas finas y letra mono. Sirve para ingeniería, software, arquitectura y procesos.

```css
--bg:#0B2545; --panel:#0F2F57; --panel-2:#13396A; --line:#1D4E89; --glass:rgba(11,37,69,.85);
--ink:#E8F1FF; --muted:#8FB1DA; --accent:#FFD166; --accent-2:#4CC9F0; --ok:#80ED99; --warn:#FF6B6B;
--sub-ink:#FFFFFF; --sub-edge:#071A33; --track:rgba(255,255,255,.22);
--display:"IBM Plex Sans Condensed",system-ui,sans-serif; --body:"IBM Plex Sans Condensed",system-ui,sans-serif; --mono:"IBM Plex Mono",ui-monospace,monospace;
color-scheme:dark;
```

Fuentes: `family=IBM+Plex+Sans+Condensed:wght@400;700&family=IBM+Plex+Mono:wght@400;600`

Trazo: líneas de 0,3 a 0,5 unidades. Cotas y flechas finas. Grilla de fondo en el mundo, así se mueve con la cámara:

```js
function grid(F, step = 5) {
  ctx.save(); ctx.strokeStyle = C.line; ctx.lineWidth = .15;
  for (let x = Math.floor(F.left * 3 / step) * step; x < F.right * 3; x += step) line(x, F.top * 3, x, F.bottom * 3);
  for (let y = Math.floor(F.top * 3 / step) * step; y < F.bottom * 3; y += step) line(F.left * 3, y, F.right * 3, y);
  ctx.restore();
}
```

## Escala Humana (marca de Fernando)

Paleta y tipografía de la marca Escala Humana (Ferpreu Consultora), tomadas de la plantilla oficial `Escala-Humana-Plantilla.pptx`. Dos variantes: **claro** (default, para explicar) y **verde** (para ganchos, aperturas y cierres). Se pueden alternar entre escenas, pero un video usa una sola como base.

**Claro (default):**

```css
--bg:#F4F2E6; --panel:#FFFFFF; --panel-2:#E0DECB; --line:#C7D6CC; --glass:rgba(244,242,230,.90);
--ink:#212529; --muted:#5A5A4E; --accent:#07503F; --accent-2:#07503F; --ok:#07503F; --warn:#B4B2A9;
--hl:#E8FE85; --sub-ink:#212529; --sub-edge:#F4F2E6; --track:rgba(0,0,0,.15);
--display:Georgia,"Gelasio","Times New Roman",serif; --body:"Helvetica Neue","Arimo",Helvetica,Arial,sans-serif; --mono:"Helvetica Neue","Arimo",Helvetica,Arial,sans-serif;
color-scheme:light;
```

**Verde (oscuro):**

```css
--bg:#07503F; --panel:#0B5E4A; --panel-2:#0E6B54; --line:#2F7A66; --glass:rgba(7,80,63,.88);
--ink:#F4F2E6; --muted:#C7D6CC; --accent:#E8FE85; --accent-2:#E8FE85; --ok:#E8FE85; --warn:#B4B2A9;
--hl:#E8FE85; --sub-ink:#F4F2E6; --sub-edge:#07503F; --track:rgba(255,255,255,.22);
--display:Georgia,"Gelasio","Times New Roman",serif; --body:"Helvetica Neue","Arimo",Helvetica,Arial,sans-serif; --mono:"Helvetica Neue","Arimo",Helvetica,Arial,sans-serif;
color-scheme:dark;
```

Fuentes (respaldo para renderizar sin Georgia ni Helvetica Neue, métricamente compatibles): `family=Gelasio:wght@400;700&family=Arimo:wght@400;700`

Reglas de marca:

- Un solo acento: el verde `#07503F` en claro, el lima `#E8FE85` en verde. Nunca los dos sobre el mismo fondo: el lima sobre crema no se lee.
- `--hl` (lima) es el marcador: resalta la palabra dicha en el karaoke de la variante clara, como un subrayador sobre el verde de la tinta. En la variante verde, es el acento.
- Títulos en Georgia, texto en Helvetica Neue. Sin mono: en la marca no existe. Para números usá Georgia.
- Trazo: líneas de 0,5 a 0,8 unidades, planas, sin sombras ni brillos. Rellenos en crema y verde al 8 %–20 %. Aire generoso: la marca es sobria.
- Contraste de subtítulos: carbón sobre crema (13:1) y crema sobre verde (9:1). Ambos pasan 4,5:1.
- El logo, si lo pasa, va solo en la última escena, chico, en una esquina segura. No lo inventes ni lo dibujes a mano.
- Motivos visuales de la marca (mapa, lote, camino, brújula): ver `references/escala-humana.md`.

## Tu marca

Pedí tres colores en hex: fondo, texto y acento. Pedí una tipografía de Google Fonts. Derivá el resto:

- `--panel` y `--panel-2`: el fondo un 4 % y un 8 % más claro, o más oscuro en fondos claros.
- `--line`: el fondo un 15 % hacia el texto.
- `--muted`: el texto al 60 % sobre el fondo.
- `--sub-edge`: el fondo. `--sub-ink`: el texto.
- Verificá contraste de 4,5:1 entre `--sub-ink` y `--sub-edge`.

Si pasa un logo en SVG, ponelo solo en la última escena, chico, en una esquina segura.

## Tono del guion

El perfil define el tono. Estas reglas valen para todos:

- Frase de apertura con gancho. Nunca "Hoy vamos a hablar de".
- Números concretos. Si falta un dato, marcá `[VERIFICAR]`. No lo inventes.
- Una analogía física por cada idea abstracta.
- Cierre que no resume.
- Evitá "no es X, es Y", "en resumen", "en conclusión" y "sin más preámbulos".

| Tono | Cómo suena |
|---|---|
| Cercano y con humor | Segunda persona, frases que fluyen, un chiste de observación por guion como máximo. |
| Claro y neutro | Frases medianas, vocabulario común, sin modismos regionales. |
| Formal | Tercera persona o "usted", sin humor, verbos precisos. |
| Voz de Fernando | Plural inclusivo, escena del agro, preguntas en cascada, frases cortas que se quedan. Ver `references/escala-humana.md`. |
| Imitá un texto mío | Ver abajo. |

### Imitar un texto del usuario

1. Leé el texto que pegó.
2. Anotá cinco rasgos: largo de frase, persona gramatical, muletillas, tipo de humor y forma de cerrar.
3. Mostrá los cinco rasgos en una línea y escribí el guion con ellos.
4. Guardá los rasgos en `perfil.md` como `referencia_de_voz`.
