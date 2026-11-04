# Presentaciones de Fernando: estilo "plano de ingeniería" — DESIGN.md

> **Valores provisorios.** No existía un sistema de diseño previo (nivel L0). Estos valores se tomaron de las diapositivas del taller original (generadas en NotebookLM) y se ajustaron a ojo. Conviene revisarlos con Fernando antes de tratarlos como definitivos.
> Alcance: presentaciones de clases y talleres (formato 16:9, lienzo de 1920×1080 px). No aplica al panel de investigación (`design/49981083-design/DESIGN.md`).

---

## 1. Atmósfera

Despojado, sobrio, de pocas palabras. Dos familias de diapositiva que se alternan: **azul de plano** (aperturas, divisorias, actividades) y **papel cuadriculado** (contenido). Anotaciones "a mano" en naranja o amarillo flúor, como si alguien hubiera subrayado el plano. Sin sombras, sin gradientes, sin fotos de stock.

Una idea por diapositiva. Hasta unas 25 palabras en pantalla; el resto va a las notas del orador.

---

## 2. Color

### Base

| Token | Hex | Uso |
|---|---|---|
| `plano` | `#0F2A57` | Fondo de las diapositivas azules |
| `plano-panel` | `#17376B` | Tarjetas sobre azul |
| `marco-plano` | `#5B7BB0` | Marco fino sobre azul |
| `papel` | `#F4F2E6` | Fondo de las diapositivas claras |
| `papel-2` | `#E0DECB` | Segundo tono de fondo claro |
| `tinta` | `#1E2226` | Texto principal sobre claro |
| `tinta-suave` | `#5A5A4E` | Etiquetas y texto secundario sobre claro |
| `marco-papel` | `#4B4E52` | Marco fino sobre claro |
| `blanco-suave` | `#DCE4F3` | Texto de cuerpo sobre azul |
| `apagado` | `#B7C4DE` | Texto secundario sobre azul |

### Acentos de anotación

| Token | Hex | Uso |
|---|---|---|
| `flúor` | `#E4FF2C` | Acento sobre azul (etiquetas, números grandes) |
| `naranja` | `#FF8A2A` | Notas a mano sobre azul |
| `naranja-papel` | `#C2570C` | Notas a mano sobre claro (cumple contraste en tamaño grande) |
| `marcador` | `#F2EE5C` | Resaltador sobre claro (siempre con texto `tinta`) |

### Los cuatro colores del modelo (Cerebro Integral)

El color **nunca va solo**: siempre acompañado del nombre de la dimensión.

| Dimensión | Color | Hex | Texto encima |
|---|---|---|---|
| Acción (Resultados) | Azul | `#3F6DB0` | `#FFFFFF` |
| Gestión (Procesos) | Verde | `#7FB93A` | `#1E2226` |
| Vinculación (Personas) | Rojo | `#C93B30` | `#FFFFFF` |
| Visión (Estrategia) | Amarillo | `#F2C230` | `#1E2226` |

Posición fija en el esquema: Acción arriba a la izquierda, Visión arriba a la derecha, Gestión abajo a la izquierda, Vinculación abajo a la derecha. Lo visible a la izquierda, lo invisible a la derecha.

---

## 3. Tipografía

| Rol | Familia | Peso | Tamaños |
|---|---|---|---|
| Títulos y texto | Roboto (Google Fonts) | 400, 500, 700 | 120 / 76 / 44 / 32 / 24 px |
| Anotaciones a mano | Caveat (Google Fonts) | 700 | 44 a 68 px |

Reglas: nada por debajo de 24 px. La jerarquía se hace con peso y color, no con más tamaños. Las notas a mano van inclinadas entre −1° y −4°, una por diapositiva, con una frase corta en minúscula.

---

## 4. Espaciado y estructura

- Base de **8 px**. Márgenes de la diapositiva: **128 px** (inferior 160 px cuando lleva pie).
- Separaciones habituales: 24, 32, 40, 48 px. Se usa `gap`, no márgenes.
- Marco fino inscrito a **40 px** del borde, 2 px de grosor, con cruces de registro (círculo de 16 px de radio) en las cuatro esquinas.
- Trama de fondo: líneas cada **60 px**, 1 px, opacidad 0,07 (blanca sobre azul, tinta sobre papel).
- Radios: 6 a 12 px en tarjetas; 999 px solo en etiquetas tipo píldora.
- Títulos arriba, nunca centrados con el cuerpo; así no "saltan" entre diapositivas.

---

## 5. Tipos de diapositiva

| Tipo | Fondo | Estructura |
|---|---|---|
| Portada / divisoria de bloque | plano | Número gigante con solo contorno en `flúor` a la derecha; etiqueta, título, subtítulo y nota a mano a la izquierda |
| Idea central / pregunta | plano o papel | Una frase de 88 a 108 px y una nota a mano |
| Escalera por dimensión | papel | Cuatro tarjetas que suben de izquierda a derecha, con borde superior del color de la dimensión; solo número y nombre del nivel |
| Esquema de cuatro bloques | papel | Cuadrados de color en esquinas, círculos concéntricos al centro con la E; el anillo de la etapa activa se marca grueso y los anteriores punteados |
| Vista de conjunto de círculos | papel | Cuatro esquemas pequeños en fila, con barras de fase arriba y las palabras de cada etapa abajo |
| Tabla de etapas | papel | Cuadrícula de 5 columnas; la fila crítica se resalta con `marcador` |
| Actividad / consigna | plano | Etiqueta con minutos, título, 3 pasos numerados y una regla a mano |
| Ficha para completar | papel | Campos en blanco sobre fondo blanco, etiquetas en mayúscula pequeña |
| Imagen del taller | — | Imagen a pantalla completa (1376×768 escalada), con alt descriptivo y notas del orador |

---

## 6. Principios de la skill de diseño aplicados

Minimal (poco texto), perceptible (color + nombre, contraste de 4,5:1 en cuerpo), whitespace primero, proximidad (lo que va junto, junto), variedad de estructuras entre diapositivas para que 49 no se sientan iguales, y un solo ritmo de espaciado.

---

## 7. Tema alternativo: Escala Humana

Para piezas de la marca Escala Humana (variante clara y verde), usar los tokens de la plantilla oficial: verde `#07503F`, lima `#E8FE85`, crema `#F4F2E6`, carbón `#212529`, Georgia para títulos y Helvetica Neue para texto (respaldo: Gelasio y Arimo). Un solo acento por fondo: lima sobre verde, verde sobre crema; nunca los dos juntos.

---

## 8. Pendientes de validar

- Confirmar si el azul `#0F2A57` y el flúor `#E4FF2C` coinciden con el original del taller (se sacaron a ojo de las imágenes).
- Decidir un único juego de nombres para las dimensiones: Acción, Gestión, Vinculación y Visión (usado acá) o Resultados, Procesos, Personas y Estrategia (usado en el taller).
