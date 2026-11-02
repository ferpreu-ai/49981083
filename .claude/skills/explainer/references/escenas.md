# Escenas: patrones, errores e íconos

Leé este archivo al armar el storyboard y antes de dibujar cada escena.

## Patrones que funcionan

Cada patrón traduce una idea del guion en una acción visual. Ninguno usa texto explicativo.

### Historias y noticias

| Idea del guion | Acción visual |
|---|---|
| Algo escondido que alguien encuentra | Una mira recorre varios objetos, se fija en uno, hace zoom y suena un pulso cuando aparece el hallazgo |
| La herramienta que se usó | Un ícono chico de la herramienta aparece justo cuando la voz la nombra |
| Datos públicos que cualquiera descarga | Los datos caen como puntos en una línea de tiempo y viajan a varias computadoras |
| Un fenómeno físico | El fenómeno con su gráfico mínimo, sin ejes rotulados: el objeto cruza y la curva baja |
| Una magnitud difícil de imaginar | La analogía del guion dibujada literal: un estadio de 2.000 luces y una sola que se apaga |
| Una señal escondida en ruido | Miles de puntos se reordenan y se apilan hasta que aparece la forma; la zona clave toma el acento |
| Un volumen enorme de trabajo | Pocos archivos que se escriben; después la cámara se aleja y muestra un muro de mil |
| El criterio humano | Una persona con una burbuja "?" que pasa a "✓"; algunos elementos se marcan y el resto se apaga |
| Varias pruebas o controles | Una mini animación por prueba, en secuencia, cada una con su insignia ✓ |
| Ocultar datos y predecir | Una tapa con un ojo tachado cubre una parte; aparecen predicciones punteadas; la tapa se levanta y coinciden |
| Descartar alternativas | Una grilla de candidatos; un anillo pasa por cada uno, lo apaga y le pone una cruz |
| Auditoría o corrección | Una lupa recorre un documento, marca una línea, la tacha y la línea desaparece |
| Algo sin confirmar | El objeto dibujado punteado y titilando |
| Un evento futuro con fecha | Un calendario con la fecha |
| Un compromiso previo | Una tarjeta con marcas que se escriben y un candado que se cierra |
| Antes y ahora | La herramienta vieja se desvanece; la nueva repite el hallazgo de la primera escena |

### Conceptos y clases

| Idea del guion | Acción visual |
|---|---|
| Una mezcla que se separa | Un haz entra en un prisma y se abre en sus partes |
| Una propiedad que distingue | Cada parte se vuelve una forma distinta; la clave se resalta y el resto baja al 30 % |
| Un proceso por pasos | Un objeto cruza una tira de estaciones y cambia de forma en cada una |
| Causa y efecto | El objeto de la causa choca o empuja; el efecto ocurre en el cuadro de la palabra clave |
| Algo que rebota o se dispersa | Un punto recorre un zigzag entre obstáculos con un pulso en cada choque |
| Algo que pasa sin cambios | Una línea recta cruza la misma escena sin desviarse |
| Un espacio limitado | Un renglón se pasa del borde y la parte de afuera se borra |
| Releer cada vez | Una barra recorre el objeto entero antes de cada respuesta, cada vez más rápido |
| Lo que parece una cosa y es otra | Una capa se disuelve y debajo aparece la verdadera |

### Tutoriales y productos

| Idea del guion | Acción visual |
|---|---|
| Un elemento que acompaña todo el video | Una barra fija junta una ficha por instrucción; al final baja al centro |
| Sin instrucciones contra con instrucciones | La versión genérica salta a la versión nítida en la palabra clave |
| "En menos de un minuto" | Un cronómetro se llena hasta 50 de 60 y frena |
| Un texto o una idea como entrada | Un documento y una lamparita vuelan a la barra |
| Planificar antes de construir | Cuadros punteados; en "construí" se vuelven sólidos |
| Menos texto | Un muro de renglones se borra y quedan cuatro barras |
| Una idea que se vuelve acción | Una palabra se transforma en pelota y salta con anticipación, estirar y aplastar |
| Magnitud a escala | Zoom de cámara en escala logarítmica, de lo chico a lo enorme |

### Datos

| Idea del guion | Acción visual |
|---|---|
| Un crecimiento | Una barra o una línea crece en el cuadro de la palabra clave; la cámara la sigue |
| Una proporción | Una grilla de 100 figuras; la parte se pinta con el acento |
| Una comparación | Dos objetos a escala real, lado a lado; el chico aparece después y parece diminuto |
| Un promedio engañoso | Los puntos se apilan; aparece el valor atípico que corre el promedio |

El cierre funciona mejor cuando retoma la imagen de la primera escena. Cierra el círculo sin texto.

## Lo que no funciona

| Error | Problema | Reemplazo |
|---|---|---|
| Un título grande por escena, como "7 años" | Repite la voz | Sacarlo: la voz y los subtítulos ya lo dicen |
| Un chip fijo de estado, como "sin confirmar" | Texto permanente | El objeto punteado en la escena que habla del estado |
| Rótulos de ejes, unidades y anotaciones | Ruido visual | El gráfico solo, con acento en la parte clave |
| Un contador que repite un número de la voz | Lectura duplicada | La acción de marcar y apilar |
| Una terminal con un texto largo | Escena de lectura | Archivos que se escriben y un zoom out |
| Un checklist con texto | Lista para leer | Mini animaciones con insignia ✓ |
| Una cuenta regresiva sin contexto | Número raro | Un calendario y el objeto que vuelve |
| Animación en una franja con un tercio vacío | Desperdicia el cuadro | Cuadro completo: el dibujo toca los cuatro bordes |
| Todo aparece a la vez | Nadie sabe dónde mirar | Un héroe por plano; el resto 150 ms después |

## Lo que corrigió el laboratorio

| Falla vista en la foto | Arreglo |
|---|---|
| La palabra resaltada pisaba la de al lado | Margen lateral de 0,05 em y escala 1,06 |
| Un anillo aparecía antes que su objeto | Dibujar el anillo solo desde su instante de inicio |
| Un zoom grande invadía los subtítulos | Componer con `F.area` y oscurecer con `scrim()` |
| El acento se perdía sobre una textura | Bajar el fondo al 45 % en el momento del hallazgo |
| Una persona chica en un cuadro grande | Medirla con `F.area.s`: al menos 20 % del lado menor |

## Íconos del motor

Todos se dibujan en canvas con trazos simples y los tokens. Reciben posición, tamaño en unidades de mundo y opacidad.

| Función | Dibuja |
|---|---|
| `ring(x, y, r, a, color, lw)` | Anillo de pulso o de señalamiento |
| `brackets(x, y, s, a, color)` | Mira de cuatro esquinas |
| `arrow(x0, y0, x1, y1, a, color, lw)` | Flecha con punta |
| `check(x, y, r, a)` | Insignia verde con ✓ |
| `cross(x, y, s, a, color)` | Cruz de descarte |
| `person(x, y, s, color, a)` | Busto de persona |
| `bubble(x, y, s, glyph, fill, a)` | Globo de diálogo con un signo |
| `doc(x, y, s, a, lines)` | Documento con renglones |
| `laptop(x, y, s, a, glow)` | Computadora |
| `terminal(x, y, s, a)` | Ventana de terminal con prompt |
| `magnifier(x, y, r, a)` | Lupa |
| `padlock(x, y, s, closed, a)` | Candado que se cierra de 0 a 1 |
| `calendar(x, y, s, month, day, a)` | Calendario con mes y día |
| `clock(x, y, r, k, a)` | Cronómetro que se llena de 0 a 1 |
| `bulb(x, y, s, on, a)` | Lamparita que se prende de 0 a 1 |

Ayudantes de animación:

- `seg(t, a, b)`: progreso de 0 a 1 entre dos instantes.
- `ease`, `easeIO`, `q4`, `outExpo`, `inExpo`, `outBack`: curvas.
- `pop(t, a)`: aparición con rebote chico. Sirve como escala de un ícono.
- `spring(t, zeta, f)`: resorte como función pura de t.
- `lerp(a, b, k)` y `mix(hex1, hex2, k)`: interpolación de números y colores.
- `rng(seed)` y `gauss(r)`: azar reproducible.

Para un ícono nuevo, escribí una función con la misma firma: posición, tamaño y opacidad. Usá trazos de 0,4 a 1 unidad y los colores de `C`. Probalo con el simulador.
