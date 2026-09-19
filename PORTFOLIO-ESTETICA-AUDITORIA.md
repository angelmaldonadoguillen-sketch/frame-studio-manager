# FRAME Portfolio — auditoría de estética

Fecha: 2026-09-18 · Pantalla: el personalizador (editor de portfolio, escritorio)

## Cómo se hizo

No se leyó el CSS y se opinó: se abrió el editor con la demo completa (11
secciones, 10 tipos de módulo) a 1440×900 en Edge, en tema oscuro y en claro,
y se midió lo que el navegador realmente dibuja. Inventario de todos los
elementos del editor fuera del lienzo: tamaño y peso de letra, color y
contraste, radios, rellenos, separaciones, alturas de control y bordes
izquierdos. Las capturas están en el scratchpad de la sesión.

Se auditó sólo la estética de la pantalla de personalización. Nada del
comportamiento, nada de la página publicada, nada de la versión de teléfono.

---

## Estado: los diez, arreglados

Medido otra vez después de los cambios, con el mismo método:

| # | Hallazgo | Antes | Ahora |
|---|---|---|---|
| 1 | Ninguna acción pesa | 0 botones con relleno en reposo | Publicar con relleno; Guardar toma el relevo si hay cambios |
| 2 | Escalas sin escala | 10 alturas · 6 radios · espaciados de 3, 7 y 9 | 4 alturas (24·28·32·36) · 3 radios (4·7·10) · todo múltiplo de 4 |
| 3 | La tipografía no ordena | 5 tamaños · 4 pesos · grupo más pesado que el título | 4 tamaños (11·12·13·14) · 3 pesos · el grupo manda sobre sus etiquetas |
| 4 | Tres maneras de marcar lo elegido | relleno / borde / tilde | borde + fondo + tilde, igual en los tres |
| 5 | Selección igual al hover | 7 % vs 13 % de blanco | barra del editor y nombre en 600 |
| 6 | La lista vive cortada | 7 de 11 nombres · 113 px para el nombre | 1 de 11 · 158 px, en un panel de 280 |
| 7 | Color fuera del sistema | tres azules escritos a mano | tokens `--fp-edit-*`, y cambian con el tema |
| 8 | Sombra invisible en oscuro | 13 % de negro sobre `#131315` | filo de luz + sombra al 55 %, y la de claro aparte |
| 9 | Pie del inspector | dos íconos, uno rojo siempre | «Duplicar» y «Quitar», el rojo sólo al apuntarlo |
| 10 | Lo que ves no es lo que publicás | 856 px de una página de 1200 | el lienzo dibuja 1200 (o 1440) a escala |

Dos cosas salieron distintas de lo propuesto, y quedan dichas: la escala de
letra terminó en cuatro tamaños y no tres —13 px es el de los campos y el
cuerpo, y bajarlo a 12 los volvía incómodos de escribir—, y a las tres alturas
se les sumó 24 px, que es lo que miden los botones de ícono dentro de una fila.
En teléfono siguen creciendo a 44 px, como estaban.

Lo cubre `portfolio-estetica.test.cjs`: mide la pantalla entera y falla si
vuelve a aparecer una altura, un radio, un espaciado o un tamaño de letra fuera
de escala, si hay dos acciones principales a la vez, si lo elegido deja de
distinguirse o si vuelve a escribirse un color a mano.

---

## Lo que está bien y no hay que tocar

- **Contraste**: el texto peor parado de la pantalla da **5,95:1** (el mínimo
  exigido es 4,5). No hay un solo texto flojo.
- **Paleta disciplinada**: dos colores de texto (blanco y blanco al 60 %) y
  cuatro superficies. Cero ruido de color.
- **El tema claro funciona**: los paneles cambian por tokens, sin parches.
- **Los segmentados son un solo componente**: los seis grupos del panel de
  Diseño comparten contenedor, borde, radio, alto (32 px) y forma de marcar lo
  elegido. Es el control mejor resuelto de la pantalla.
- **Ritmo vertical del panel de Diseño**: todos los grupos respiran igual
  (20 px arriba, 12 px abajo).
- **Miniaturas**: las de Composición y las del insertador hablan el mismo
  idioma visual.

---

## Hallazgos, por lo que más se nota

### 1 · En reposo, ninguna acción pesa

| Botón | Fondo | Borde | Peso |
|---|---|---|---|
| Vista previa | transparente | — | 400 |
| Guardado (deshabilitado) | transparente | 84,84,88 · 40 % | 400 |
| **Publicar** | transparente | 84,84,88 · 60 % | 600 |

Publicar —la acción que justifica la pantalla— se distingue del estado
*deshabilitado* de al lado por **20 puntos de opacidad de un borde**. El único
relleno de toda la pantalla es Guardar, y sólo aparece cuando hay cambios sin
guardar (`#f5f5f7` con texto `#0a0a0b`).

El resultado: con todo guardado, la barra superior es una fila de cinco
elementos grises donde el ojo no sabe dónde parar.

**Propuesta:** Publicar toma el relleno cuando no hay nada pendiente (se
turnan: si hay cambios manda Guardar, si no manda Publicar). Y «Guardado»
deja de ser un botón deshabilitado para ser texto con tilde: hoy parece un
botón roto.

### 2 · Escalas sin escala

- **Alturas de control: 10 valores** — 30, 31, 32, 34, 36, 37, 38, 39, 40, 43.
  El mismo `.fp-button` mide **30, 32, 34, 36 y 37** según dónde esté.
- **Radios: 6 valores** — 4 (opción de segmentado), 5 (agregar sección),
  6 (campos, filas), 7 (botones), 8 (selector de dispositivo), 10 (menú ⋯).
- **Separaciones: 2, 3, 4, 6, 7, 8, 9, 12 y 20 px**, y rellenos como 7/4, 6/3,
  7/2, 12/2, 9/10. Nada de eso cae en una cuadrícula.

No se ve como un error puntual: se ve como que cada control se resolvió el día
que se necesitó.

**Propuesta:** tres alturas (28 chico · 32 normal · 36 grande, y 44 para
lo táctil), tres radios (4 interno · 7 control · 10 flotante) y todo el
espaciado en múltiplos de 4.

### 3 · La tipografía no ordena

Cinco tamaños entre 10 y 14 px (10 px ×3, 11 px ×43, 12 px ×78, 13 px ×21,
14 px ×3) y cuatro pesos. Con tan poco rango, el peso es el que tiene que
ordenar, y ordena al revés:

- Título de grupo («Composición», «Imágenes»): **12 px / 700**
- Título del panel («Ideas que toman forma.»): **14 px / 600**

El subtítulo pesa más que el título. Y dos contadores que significan
exactamente lo mismo están escritos distinto: «Página de inicio **11**»
(11 px / 600, atenuado) y «Bloques **1**» (12 px / 700, blanco).

**Propuesta:** 11 px para etiquetas atenuadas · 12 px para el cuerpo del panel
· 14 px para el título, con pesos 400 y 600 nada más. El título de grupo, en
12/600 atenuado. Un solo estilo de contador.

### 4 · Tres maneras de decir «esto está elegido»

| Dónde | Cómo se marca |
|---|---|
| Segmentados (Fondo, Tamaño, Espaciado…) | relleno `#2f2f31` |
| Miniaturas de Composición | borde claro alrededor |
| Tarjetas de Apariencia (Editorial/Estudio/Arena) | tilde al costado |

Tres idiomas en dos paneles, para la misma idea.

**Propuesta:** uno solo. Relleno para los segmentados; para cualquier tarjeta
o miniatura, borde de acento **más** tilde, siempre en el mismo lugar.

### 5 · Cuesta ver qué sección estás editando

| Estado de la fila | Fondo |
|---|---|
| normal | transparente |
| el mouse encima | blanco 7 % |
| **elegida** | blanco 13 % |

Seis puntos de opacidad separan «estoy pasando por arriba» de «esto es lo que
estás editando», y no hay ninguna otra señal: ni barra, ni peso, ni color.

**Propuesta:** barra de acento de 2 px a la izquierda de la fila elegida, o el
texto en 600. Tiene que leerse sin comparar con las de al lado.

### 6 · La lista vive cortada y el margen izquierdo baila

**7 de los 11 títulos terminan en puntos suspensivos** («Una marca que se r…»,
«De la idea a la entr…», «Movimiento con int…»).

Presupuesto real de una fila de 227 px:

| Parte | Ancho |
|---|---|
| agarradera | 20 px |
| **nombre de la sección** | **113 px** (necesita 257) |
| ojo (mostrar/ocultar) | 32 px |
| flecha (desplegar) | 32 px |

El nombre se queda con menos de la mitad de la fila. Y el borde izquierdo del
panel salta cuatro veces: pestañas a 8 px · encabezado a 16 · ícono a 30 ·
texto a 56.

**Propuesta:** mostrar el ojo y la flecha sólo al pasar por encima (devuelve
64 px al nombre), alinear el encabezado con el texto de las filas, y evaluar
subir el panel de 244 a 280 px.

### 7 · El color del lienzo no es del sistema

`frame.css:894-909` tiene tres colores escritos a mano: `#345876` (etiqueta de
sección y de bloque), `#6583a3` (contorno de la sección y línea de inserción) y
`#8886` (líneas punteadas). Es **el único tono con color de toda la pantalla**,
no sale de ningún token y no cambia con el tema.

**Propuesta:** es una decisión de marca, no un bug. O el editor es monocromo y
ese azul se va al acento del sistema, o el azul es «estás editando» — y
entonces también lo usan la fila elegida y el anillo de foco. Lo que no puede
seguir es que exista un color y aparezca sólo ahí.

### 8 · Una sombra que no existe

`.fp-browser-frame` lleva `0 12px 40px rgba(0,0,0,.13)` sobre un fondo
`#131315`: en oscuro es **invisible**. En claro sí se ve, así que la página
flota en un tema y no en el otro.

**Propuesta:** en oscuro la profundidad se hace con luz, no con sombra — es la
regla que el propio `frame.css` se escribió para las superficies de la app.
Un filo claro arriba del marco, y listo.

### 9 · El pie del inspector

Dos íconos sueltos, sin etiqueta, y uno es **rojo `#ff453a`**: el único color
saturado de la pantalla está puesto en la acción destructiva, que es la que
menos conviene invitar a tocar. Además arranca a 15 px del borde del panel
cuando el resto del contenido arranca a 17 y 19.

**Propuesta:** el rojo, sólo en la confirmación. Íconos con etiqueta. Y el pie
alineado con el resto del panel.

### 10 · Lo que ves no es lo que publicás

El lienzo dibuja la página a **856 px** de ancho cuando está diseñada para
1200 (o 1440 en Amplio). Las proporciones que ves mientras trabajás no son las
que se publican: columnas más apretadas, títulos que cortan distinto.

**Propuesta:** el zoom que ya existe para la vista previa, aplicado también al
modo edición.

---

## La escala, tal como quedó

Vive en tokens al principio de `.fp-editor`, en `frame.css`:

| | Antes | Ahora |
|---|---|---|
| Alturas de control | 10 valores (30–43) | `--fp-h-sm` 28 · `--fp-h-md` 32 · `--fp-h-lg` 36, más 24 para íconos en fila (44 en teléfono) |
| Radios | 6 valores (4–10) | `--fp-r-in` 4 · `--fp-r` 7 · `--fp-r-float` 10 |
| Espaciado | 2,3,4,6,7,8,9,12,20 | múltiplos de 4 |
| Tamaños de letra | 10,11,12,13,14 | 11 etiqueta · 12 interfaz · 13 campo · 14 título |
| Pesos | 400,500,600,700 | 400 · 500 · 600 |
| Colores de texto | 2 | 2 (no hacía falta tocarlos) |
| Color del editor | 3 azules a mano | `--fp-edit-mark` · `--fp-edit-line` · `--fp-edit-guide` |

Las tarjetas —apariencias, anchos, composiciones, zona de subida— crecen con su
contenido: la escala de alturas es para los controles, no para ellas.
