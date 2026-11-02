# Explainers de Escala Humana

Guía para los videos de difusión y explicación de Escala Humana, con la voz de Fernando. Se usa cuando el perfil dice `estilo: Escala Humana` o cuando el tema es el programa, sus dimensiones o su potencial.

## Antes de escribir el guion

1. Llamá a la skill `escala-humana`. Te devuelve **un ángulo** que no se haya usado y el dato exacto del modelo. Un video, un ángulo.
2. Llamá a la skill `voz-fernando-preumayr` para el guion. Esta guía manda en el formato de video; la de voz manda en el estilo.
3. Usá solo datos de `escala-humana/modelo.md`. Si falta un dato, marcá `[VERIFICAR]` y preguntale a Fernando. No lo inventes.
4. Al terminar, proponé anotar el ángulo en `angulos-usados.md`. Se anota solo con el OK de Fernando.

## La idea central: un mapa, no un puntaje

Del documento de marca "La Escala Humana: un mapa de decisiones":

- **Concepto en una línea:** La Escala Humana no es una herramienta de evaluación. Es un mapa de decisiones sobre lo que más importa: tu gente.
- Un mapa ubica a la empresa en un punto ("acá estás") y señala hacia dónde puede avanzar. Es una brújula para decidir, no una calificación.
- El recorrido de madurez (Reactivo, Definido, Estratégico) es literalmente un camino con un punto de partida y un destino posible.
- Decidir bien sobre las personas no es un gesto blando: es una decisión de negocio, tan concreta como elegir qué sembrar o cuándo cosechar.

Frases autorizadas (usalas tal cual, una por video):

- No te dejamos un puntaje. Te dejamos un mapa.
- La Escala Humana no te mide: te orienta.
- Donde otros ven un diagnóstico, nosotros dibujamos un mapa.
- Un mapa para decidir sobre lo que ningún tablero del campo te muestra.
- En el agro nadie entra a un lote sin mirar el mapa. Con las personas, tampoco deberíamos.

Si el video habla del programa, no digas "evaluación" ni "test". Decí "mapa", "diagnóstico" o "lectura".

## Tres piezas tipo

| Pieza | Para qué | Formato | Duración | Variante |
|---|---|---|---|---|
| **Difusión** | Dar a conocer el programa en Instagram o LinkedIn | Vertical 9:16 o feed 4:5 | 30–45 s | Verde al abrir y cerrar, claro al medio |
| **Explicación** | Contar qué es y cómo se usa, para un productor o una reunión | Horizontal 16:9 | 60–90 s | Claro |
| **Potencial** | Mostrar lo que se logra: método, 4 dimensiones, vínculos, re-medición | Horizontal 16:9 | 2–3 min | Claro, cierre en verde |

Estructura de cada una, en bloques:

- **Difusión (5–6 bloques):** escena del agro → "se mide cada hectárea y cada litro, pero la gente a ojo" (o el ángulo elegido) → el mapa → un dato del modelo → frase corta → pregunta final.
- **Explicación (7–9 bloques):** escena → el problema → qué es el mapa → las 4 dimensiones en una escena → "acá estás" → próximo paso → cierre con preguntas.
- **Potencial (12–18 bloques):** puede recorrer el método de 6 semanas (medir, prescribir, implementar en red, re-medir) o un solo ángulo en profundidad. Para más de 3 minutos, partilo en capítulos.

## Guion con la voz de Fernando

- **Persona:** plural inclusivo ("nuestra gente", "nuestras empresas") y "vos" para interpelar al productor. Sin "yo", salvo que Fernando cuente una escena propia.
- **Apertura:** una escena o una pregunta del agro. Nunca una definición. Nunca "Hoy vamos a hablar de".
- **Preguntas en cascada** en el cierre: dos o tres seguidas, que lleven al oyente a su propia empresa. Es el cierre por defecto.
- **Frases cortas** que se quedan rondando: una o dos por video. Que funcionen solas.
- **Cierre:** pregunta-espejo o frase breve. No resumas.
- **Frase ancla** "La diferencia está en la gente": solo al final y solo en piezas de marca. No en cada video.
- **Cero jerga consultora:** nada de "stakeholders", "engagement", "KPIs". Traducí el concepto.
- **Sin sermón:** si hablás de valores, bajalo a una práctica concreta (delegar, dar feedback, escuchar al encargado).
- **Sin casos reales.** Las escenas del campo son genéricas. Nunca nombres empresas.
- **Números del piloto:** siempre "del piloto en la red CREA, 11 empresas". Sin redondear ni extrapolar. Los números de comparativa (n=121, n=17) solo si Fernando los pasa.
- **Largo:** 2,5 palabras por segundo, como en `SKILL.md`. Leelo en voz baja antes de entregarlo.

Antes de mostrar el guion, pasá la calibración de la skill de voz: escena en los primeros bloques, al menos 2 preguntas en cascada, una o dos frases destiladas, plural inclusivo, cierre que vuelve a la persona, algo que se pueda hacer el lunes a la mañana.

## Pares de contraste en pantalla

El documento de marca define pares que "funcionan solos para placas y láminas":

| Una herramienta… | Un mapa… |
|---|---|
| te mide. | te orienta. |
| te dice cómo estás. | te dice para dónde ir. |
| te clasifica con un puntaje. | te mueve hacia el próximo paso. |
| se archiva como un número. | se camina. |

Esto es una **excepción a la regla de "sin texto en pantalla"**, igual que el prompt para copiar. Condiciones:

- Un par por escena, nunca dos.
- Máximo 4 palabras por lado.
- Aparece el lado "herramienta", se tacha o se apaga, y entra el lado "mapa" con el acento. Anclá cada lado a la palabra de la voz con `F.at('palabra')`.
- Poné `noSubs: true` en esa escena, así no se duplica el texto.
- Este es el único texto que se permite en pantalla en una escena. El dibujo del mapa va debajo, sin texto.

## Motivos visuales

El dibujo es el mapa. Todo se dibuja en canvas con los tokens del estilo, sin imágenes externas.

| Idea | Cómo se dibuja |
|---|---|
| El mapa | Vista aérea de lotes: rectángulos y curvas de nivel finas en `--line`. La cámara baja desde arriba hasta el lote. |
| "Acá estás" | Un pin en el acento que cae y rebota una vez sobre el punto. Un anillo que se abre desde el pin. |
| Los 3 niveles | Un camino que serpentea entre tres paradas: Reactivo, Definido, Estratégico. El pin avanza. Sin rótulos: tres hitos de altura creciente. |
| Las 4 dimensiones | Cuatro lotes de un mismo campo, cada uno con su ícono de trabajo: estructura (organigrama simple, hecho de cajas), procesos (engranaje o flujo), personas (figuras), incentivos (semilla que brota). Gestión Escala Humana al centro: un molino o una brújula que une los cuatro. |
| Los vínculos | Caminos entre lotes. Un camino se corta o se estrecha donde hay alerta. Son 6 cruces posibles. |
| Desbalance | Cuatro columnas de alturas desparejas: un campo con una sola punta que sobresale. El ángulo "los desbalances dicen más que el puntaje". |
| Medir sin actuar | Un pluviómetro que se llena y nadie lo mira, junto a un tractor que siembra a ciegas. |
| Re-medición | El mismo mapa dos veces: el pin se corrió. Es la prueba visual de que hay avance. |
| Gente | Figuras simples, sin cara, en perfil. Un capataz con sombrero y un encargado con mate bastan. Sin estereotipos ni fotos. |

Reglas:

- Ninguna escena muestra un puntaje, un radar con números ni una escala de 1 a 5 escrita. Si hace falta un número, lo dice la voz.
- El héroe de cada escena es el pin o un lote. Un solo movimiento principal.
- En el gancho, cámara grande: zoom desde el mapa completo hasta un lote.
- En la variante verde, el mapa se dibuja en líneas crema sobre verde y el pin en lima.

## Qué no hacer

- Ningún video promete resultados ni precios. Precios y propuesta comercial no están en el modelo y no se tocan.
- No expliques las cuatro dimensiones, los cinco niveles, los 24 indicadores y las tres etapas en un mismo video. Es lo mismo de siempre y no deja una idea para llevarse.
- No muestres una empresa real ni su nombre, ni siquiera anonimizada con datos que la delaten.
- No uses "evaluación" como sinónimo de Escala Humana.
- No publiques ni programes nada. Se entrega el HTML, el guion y, si hay herramientas, el MP4. Fernando publica.

## Entrega

Además de la entrega de `SKILL.md`:

1. Decí qué **ángulo** usaste y cuál es el dato del modelo que lo respalda.
2. Pegá el guion limpio, un bloque por escena.
3. Ofrecé una **versión más corta** (la mitad) para Instagram.
4. Proponé anotar el ángulo en el registro, con el OK de Fernando.
