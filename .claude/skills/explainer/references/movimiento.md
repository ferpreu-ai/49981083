# Movimiento: números y laboratorio

Cada adjetivo que no reemplazás por un número es una decisión que toma el modelo. Esas decisiones son el look genérico. Este archivo convierte adjetivos en números.

La idea sale del artículo "Opus 5.5 Motion Lab" de Florence (@flxrnc).

## Curvas

| Nombre | cubic-bezier | Función en la plantilla | Uso |
|---|---|---|---|
| ease-out-expo | 0.16, 1, 0.3, 1 | `outExpo` | Aparición de texto y logo |
| ease-out-cubic | 0.33, 1, 0.68, 1 | `ease` | Entradas comunes |
| ease-in-out-quart | 0.76, 0, 0.24, 1 | `q4` | Movimientos y cámara |
| ease-in-expo | 0.7, 0, 0.84, 0 | `inExpo` | Salidas rápidas |
| ease-out-back | 0.34, 1.56, 0.64, 1 | `outBack` | Aparición con rebote |

- Entrá con ease-out.
- Salí con ease-in.
- Hacé las salidas entre 40 % y 50 % más cortas que las entradas.
- Cruzá la pantalla con ease-in-out.
- Usá movimiento lineal solo para rotaciones, barras de progreso y fases de un loop.

## Resortes

La razón de amortiguación `zeta` traduce cualquier librería.

| zeta | Sensación |
|---|---|
| 1 | Sin rebote |
| 0,7 a 0,85 | Premium |
| 0,4 a 0,6 | Juguetón |
| Menos de 0,3 | Dibujo animado |

- La posición y el tamaño pueden rebotar.
- La opacidad y el color nunca rebotan.

## Duraciones

| Elemento | Duración |
|---|---|
| Respuesta de interfaz | 100 a 200 ms |
| Movimiento de interfaz | 200 a 500 ms |
| Aparición del héroe | 600 a 900 ms |
| Separación entre palabras | 60 a 120 ms |
| Separación entre ítems | 40 a 80 ms |
| Texto quieto en pantalla | 0,3 s por palabra más 0,5 s |

- Arrancá el siguiente elemento cuando el anterior va por 30 % a 50 %.
- Todo en secuencia se ve robótico. Todo junto se ve barato.
- A 30 fps, 400 ms son 12 cuadros.

## Jerarquía

- Un solo héroe por plano.
- Bajá el resto al 40 % o dejalo quieto.
- Los secundarios recorren entre 50 % y 70 % de lo que recorre el héroe.
- Los secundarios arrancan entre 100 y 200 ms después del héroe.
- El movimiento ambiente queda debajo del 5 % del recorrido del héroe. Usá un seno lento con `F.g`.

## Cámara

- Dale a la cámara las curvas más suaves. La plantilla usa ease-in-out-quart.
- Dale a los objetos las curvas más rápidas.
- Paralaje: frente 1,0, medio 0,5, fondo 0,2.
- Durante una espera, un empuje lento de 2 % mantiene vivo el cuadro.

## Principios de animación en números

| Principio | Número |
|---|---|
| Anticipación | Agachada de 11 cuadros a 1,2 × 0,75 |
| Estirar y aplastar | Estirar a 0,85 × 1,28 al salir; aplastar a 1,25 × 0,7 al caer |
| Acción superpuesta | Las partes arrancan 4 a 6 cuadros después del cuerpo |
| Arcos | Los saltos siguen un arco, nunca una recta |
| Tiempo | La cantidad de cuadros define el peso |

En pantalla de celular, exagerá las poses clave entre 10 % y 30 %. El feed achica todo.

## Contraste y destellos

- Texto con contraste de 4,5:1 en cada cuadro.
- No más de 3 destellos por segundo.

## Laboratorio

El primer render es un borrador. Dos a cuatro rondas son lo normal.

```bash
node SKILL_DIR/scripts/render.mjs explainer.html --fotos gancho     # cada 0,5 s en los primeros 10 s
node SKILL_DIR/scripts/render.mjs explainer.html --fotos finales    # el final de cada escena
node SKILL_DIR/scripts/render.mjs explainer.html --fotos 3.1,7.4    # segundos puntuales
node SKILL_DIR/scripts/render.mjs explainer.html --hoja 12          # 12 cuadros repartidos
```

- El script abre el HTML sin ventana, llama a `window.renderAt(t)` y guarda PNG exactos.
- El viewport sale del formato del explainer. El lado corto mide 1080 px.
- `?t=12.5` en la URL congela ese cuadro en el navegador.
- Abrí `out/hoja.png` con Read y leela como un storyboard.

### Notas que funcionan

Cada nota apunta a cuadros, no a sensaciones. Usá una o dos por ronda.

- Describí cada foto en una frase como un espectador. Compará con el storyboard. Corregí lo que no coincide.
- Marcá cada cuadro donde se mueven dos cosas a la vez. Corregí la jerarquía.
- Revisá como un motion designer: 10 notas por impacto, cada una con escena, segundo y cambio de código. Aplicá las 5 primeras.
- Está cargado: sacá 30 % del movimiento. Dejá solo lo que guía la mirada.
- El final es abrupto: sumá una espera de 1 s con empuje de 2 %.

### Sensaciones traducidas

| Nota | Número |
|---|---|
| "Que explote" | Escala 1,0 → 1,08 → 1,0 en 6 cuadros, pico en la palabra clave |
| "Que se vea premium" | ease-out-quint en entradas, resortes de 0,8, texto sin rebote |
| "Se arrastra" | Acortá cada espera 0,4 s |
| "Está cargado" | Un héroe a la vez; el resto 150 ms después al 60 % del recorrido |
| "Parece hecho con IA" | Listá los defaults que aparecieron, prohibilos por nombre y renderizá de nuevo |

### Fallas comunes

| Síntoma | Arreglo |
|---|---|
| Parpadeo o temblor | Cada valor sale de t. Azar con semilla. Sin timers. |
| Tipografía de reemplazo en el render | La plantilla carga las fuentes con `display=block` y espera `document.fonts.ready`. |
| Todo se mueve a la vez | Un héroe a la vez. |
| El texto se mueve mientras se lee | Esperá 0,3 s por palabra más 0,5 s antes de moverlo. |
| Un evento cae antes de su palabra | Anclalo con `F.at('palabra')`. |
