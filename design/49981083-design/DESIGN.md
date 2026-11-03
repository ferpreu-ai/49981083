# Panel de investigación — DESIGN.md

> Generado con skillui y corregido a mano contra `styles.css` e `index.html`.
> Fuente de verdad: las variables de `:root` en `styles.css`.

---

## 1. Atmósfera visual

Interfaz **clara, plana y sobria**: un fondo gris muy suave (`--bg`), superficies blancas separadas por bordes finos y un único color de acento azul. Pensada para leer tablas de registros agrupados, sin adornos. Sin sombras, sin gradientes, sin blur, sin dark mode.

---

## 2. Colores (tokens reales)

| Token | Hex | Uso |
|---|---|---|
| `--bg` | `#f5f6f8` | Fondo de página y de los campos de formulario |
| `--surface` | `#ffffff` | Header, toolbar, tarjetas de grupo, estado vacío |
| `--border` | `#e2e5ea` | Todos los bordes y separadores (nunca como fondo) |
| `--text` | `#1c2128` | Texto principal |
| `--text-muted` | `#6b7280` | Etiquetas, metadatos, encabezados de tabla, resumen |
| `--accent` | `#2f6feb` | Badges, fechas recientes, foco, acciones |
| `--accent-soft` | `#e8f0fe` | Fondo del encabezado de cada grupo |

Un solo valor suelto fuera de los tokens: `#fafbfc` (hover de fila de tabla). Si se vuelve a usar, convertirlo en token.

```css
:root {
  --bg: #f5f6f8;
  --surface: #ffffff;
  --border: #e2e5ea;
  --text: #1c2128;
  --text-muted: #6b7280;
  --accent: #2f6feb;
  --accent-soft: #e8f0fe;
  --radius: 10px;
}
```

---

## 3. Tipografía

**Familia:** `"Segoe UI", system-ui, -apple-system, Roboto, sans-serif`, definida en `:root`. No mezclar familias.

| Rol | Tamaño | Peso | Notas |
|---|---|---|---|
| Título de página (h1) | 1.4rem | por defecto (bold) | Solo en el header |
| Nombre de grupo | 1rem | 600 | |
| Texto de tabla | 0.88rem | 400 | |
| Campos y selects | 0.9rem | 400 | |
| Subtítulo del header | 0.9rem | 400 | Color `--text-muted` |
| Etiquetas del toolbar, resumen | 0.85rem | 400 | Color `--text-muted` |
| Meta de grupo | 0.8rem | 400 | Color `--text-muted` |
| Encabezado de tabla | 0.75rem | 600 | MAYÚSCULAS, `letter-spacing: 0.03em`, `--text-muted` |
| Badge | 0.75rem | 600 | |

Reglas: la jerarquía secundaria se hace con `--text-muted`, no con más tamaños. Los encabezados de tabla son siempre mayúsculas y pequeños.

---

## 4. Layout y espaciado

- Contenido centrado: `max-width: 1080px`, `margin: 24px auto`, padding lateral 24px, 48px abajo.
- Header: padding `20px 32px`, flex con `gap: 16px` y `flex-wrap`.
- Separación entre tarjetas de grupo: 18px. Entre toolbar y lista: 20px.
- Gaps habituales: 4px (título/subtítulo), 12px (entre controles), 16px.
- Padding interno: toolbar `14px 16px`, encabezado de grupo `14px 18px`, celdas `10px 18px`.
- No hay breakpoints: la adaptación a pantallas chicas depende de `flex-wrap`. Si se agrega mobile, definirlo acá primero.

---

## 5. Radios, bordes y elevación

- `--radius: 10px` → tarjetas de grupo, toolbar, estado vacío.
- `6px` → campos de formulario (select, search).
- `999px` → solo badges (píldora).
- Elevación **solo con bordes** de 1px `--border` y cambios de fondo. Sin `box-shadow`.
- Estado vacío: borde **punteado** (`1px dashed`).

---

## 6. Componentes

**Header (`.app-header`)**: fondo `--surface`, borde inferior, título + subtítulo a la izquierda.

**Toolbar (`.toolbar`)**: caja blanca con borde y `--radius`. Contiene filtros (label + control), un `.spacer` con `flex: 1` y el resumen alineado a la derecha.

**Campos (`select`, `input[type=search]`)**: borde `--border`, radio 6px, padding `7px 10px`, fondo `--bg`, texto `--text`. El buscador tiene `min-width: 220px`.

**Tarjeta de grupo (`.group-section`)**: fondo `--surface`, borde, `--radius`, `overflow: hidden`, margen inferior 18px.
- Encabezado (`.group-header`): fondo `--accent-soft`, borde inferior, nombre a la izquierda y meta a la derecha.

**Badge (`.badge`)**: fondo `--accent`, texto blanco, radio 999px, padding `2px 10px`, 0.75rem, peso 600, `margin-left: 8px`.

**Tabla (`table.records`)**: ancho completo, bordes solo horizontales de 1px, sin borde en la última fila, hover `#fafbfc`, sin zebra.

**Fecha reciente (`.fecha-reciente`)**: color `--accent`, peso 600.

**Estado vacío (`.empty-state`)**: centrado, `--text-muted`, padding `40px 20px`, fondo `--surface`, borde punteado.

---

## 7. Recetas para construir UI nueva

### Tarjeta
```
Fondo: var(--surface)
Borde: 1px solid var(--border)
Radio: var(--radius)  (10px)
Padding: 14px 18px
Sin sombra
```

### Botón (no existe todavía en la app; propuesta coherente)
```
Primario: fondo var(--accent), texto #fff, radio 6px, padding 7px 14px
Secundario: fondo var(--surface), borde 1px var(--border), texto var(--text)
Foco: borde var(--accent)
```

### Campo de formulario
```
Fondo: var(--bg)
Borde: 1px solid var(--border)
Radio: 6px
Padding: 7px 10px
Etiqueta: 0.85rem, var(--text-muted)
```

### Píldora / badge
```
Fondo: var(--accent), texto #fff, radio 999px, padding 2px 10px, 0.75rem, peso 600
```

---

## 8. Sí y no

**Sí**
- Usar siempre las variables de `:root`; si falta un color, agregarlo ahí primero.
- Separar con bordes de 1px, no con sombras.
- Usar `--radius` para contenedores, 6px para campos y 999px solo para badges.
- Resaltar con `--accent` solo lo importante (fechas recientes, conteos).

**No**
- No agregar sombras, gradientes ni blur.
- No usar `--border` como color de fondo.
- No mezclar familias tipográficas ni inventar tamaños nuevos.
- No usar radios de píldora en tarjetas o campos.
- No agregar zebra en tablas.
