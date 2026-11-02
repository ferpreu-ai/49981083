# Formatos: zonas, cámara y composición

Leé este archivo antes de dibujar la primera escena.

La regla: el dibujo toca los cuatro bordes del cuadro. No hay franja, no hay caja vacía y la parte de abajo no queda vacía.

## Zonas de cada formato

Los valores están en fracción del alto del cuadro. Salen de `FORMATS` en la plantilla.

| Formato | Uso | Punto de cámara | Zona de acción | Subtítulos | Palabras por grupo |
|---|---|---|---|---|---|
| 9:16 | TikTok, Reels, Shorts | 40 % | 8 % a 62 % | 65,5 % a 82 % | 4, hasta 20 letras |
| 16:9 | YouTube, clases, presentaciones | 44 % | 7 % a 74 % | 79 % a 92 % | 7, hasta 38 letras |
| 1:1 | Feed cuadrado, LinkedIn, X | 42 % | 7 % a 70 % | 75 % a 90 % | 5, hasta 26 letras |
| 4:5 | Feed de Instagram | 41 % | 7 % a 68 % | 72 % a 88 % | 5, hasta 24 letras |

Zonas que no llevan información clave:

- **9:16:** el 18 % inferior y la columna derecha de la mitad de abajo. TikTok, Reels y Shorts ponen ahí la descripción y los botones. El dibujo sí llega al borde.
- **16:9:** el 8 % inferior. YouTube muestra ahí los controles al pasar el mouse.
- **Todos:** el 6 % superior. Ahí van las barras de progreso.

## Mundo y cámara

- El lado corto del cuadro mide 100 unidades. En 9:16 se ven 100 de ancho y unas 178 de alto. En 16:9 se ven unas 178 de ancho y 100 de alto.
- El origen `(0, 0)` es el punto de la cámara.
- En un celular más alto que 9:16, el mundo muestra más arriba y más abajo. Extendé fondos y cuerpos más allá de los bordes.
- Cada clave de cámara es `[t, x, y, zoom]`. Entre claves, la cámara usa ease-in-out-quart y el zoom crece en escala exponencial.
- Un corte es una clave repetida 0,01 s después.
- Las líneas se escalan con el zoom. Usá grosores de 0,4 a 1 unidad.
- `cam` puede ser una función de `F`. Así las claves usan `F.at('palabra')`.

```js
cam: F => [[0, 0, -30, 3], [F.at('estadio'), 0, 0, 1], [F.at('estadio') + .01, 20, 10, 2]]
```

## Composición por formato

Medí todo con `F.area`, nunca con números fijos. Así una escena funciona en cualquier formato.

```js
const A = F.area;
const heroe = F.horizontal ? { x: A.x0 + A.w * .3, y: A.cy } : { x: A.cx, y: A.y0 + A.h * .35 };
const tam = A.s * .12;
```

### Vertical 9:16

- Apilá el sujeto de arriba abajo. Por ejemplo, la cabeza arriba, el objeto en el medio y el cuerpo hasta el borde.
- Una línea de tiempo va de arriba abajo, o en zigzag.
- Para mostrar "muchos", sumá copias del sujeto al fondo, más chicas y al 30 %.
- Detrás de los subtítulos dibujá superficies oscuras: un suelo, un cuerpo, el fondo del objeto.

### Horizontal 16:9

- Repartí de izquierda a derecha. El sentido de lectura marca el tiempo: antes a la izquierda, después a la derecha.
- Usá los tercios: el héroe en un tercio y el contexto en el otro.
- Las comparaciones van lado a lado. Las líneas de tiempo, de izquierda a derecha.
- Un héroe solo en el centro deja dos costados vacíos. Llenalos con contexto, copias al fondo o paralaje.
- Los subtítulos quedan abajo. La acción vive arriba del 74 %.

### Cuadrado 1:1 y feed 4:5

- Componé como un vertical compacto. Hay menos alto: usá un héroe por plano.
- Evitá líneas de tiempo largas. Mostrá tres puntos, no diez.

## Cambiar de formato

- `?formato=16:9` en la URL fuerza otro formato. Sirve para previsualizar.
- Una escena medida con `F.area` se ve bien en otro formato. Una escena con números fijos se rompe.
- Para entregar otro formato, cambiá `CONFIG.formato` y revisá cada escena con fotos. Recomponé las que queden con zonas vacías.

## Lista del laboratorio

En cada foto, contestá:

1. ¿El dibujo toca los cuatro bordes?
2. ¿Hay una zona vacía más grande que un cuarto del cuadro?
3. ¿Se ve un borde recto de algo que no termina, por ejemplo el fondo de un cuerpo?
4. ¿La acción clave queda dentro de la zona de acción?
5. ¿Los subtítulos se leen sobre lo que tienen detrás?
6. ¿Hay información clave en una zona de la plataforma?

Si alguna respuesta falla, corregí antes de entregar.
