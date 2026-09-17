# FRAME Portfolio — auditoría de experiencia

Fecha: 2026-09-16 · Módulo: `portfolio.jsx` (beta)

## Cómo se hizo

No se leyó el código y se opinó. Se usó el editor: modo demo completo (11
secciones, 10 tipos de módulo) en Edge, a 1440px y a 375px, con capturas de
cada estado y medición de cada pantalla — botones visibles, textos de ayuda,
tamaños de letra, blancos táctiles, solapamientos.

La vara es la que pediste: **que se sienta moderno y que el minimalismo sea
la regla**. Buena parte de lo que sigue no se arregla agregando, sino sacando.

---

## Lo que ya está bien y no hay que tocar

- **Deshacer y rehacer**, con atajos de teclado.
- **Composición con tarjetas visuales** (A la izquierda / Centrada): es la
  idea correcta, el problema es que el resto del panel no la sigue.
- **Aviso al salir con cambios sin guardar.**
- **Nada desborda en horizontal**, en ningún ancho.
- **Barra de navegación inferior en el teléfono**: es el patrón correcto.
- **Base sólida**: modelo de datos validado, SVG saneados, 12 pruebas de
  navegador que pasan. Lo que falla es la experiencia, no los cimientos.

---

## 1 · Bugs

### 1.1 La barra superior se pisa en teléfonos de 375px

Medido: a 375px **"Estudio Forma · Demo c…" queda 33px debajo del botón
Guardar**, y "Portfolio" 7px. A 414px ya no pasa, así que le pega a los
teléfonos más chicos, que son de los más usados.

### 1.2 El selector escritorio/móvil aparece estando en el teléfono

Con el teléfono en la mano, la barra ofrece "ver como escritorio / ver como
móvil" — y arranca en escritorio. En esa pantalla no significa nada y ocupa
una fila entera.

---

## 2 · Estructura: lo que lo hace sentir de otra época

### 2.1 Se edita en formularios, no en la página · el de mayor impacto

Para cambiar el título de una sección hay que escribirlo en un campo del panel
derecho, mientras el mismo título se ve en grande en el lienzo. **No hay un
solo texto editable en el lienzo** (0 usos de edición directa).

Es el patrón de los constructores de hace diez años. Framer, Notion, Webflow,
Squarespace o Carrd dejan hacer clic en el texto y escribir ahí. Lo que ves es
lo que editás, sin duplicado ni ida y vuelta de la vista.

### 2.2 "Guardar" es la acción principal

El botón blanco más visible de la barra es **Guardar**, al lado de "Sin
guardar", y si te olvidás aparece el aviso del navegador al salir.

Guardar a mano es un trámite heredado. Toda herramienta moderna de edición
guarda sola y avisa en voz baja ("Guardado"). El control de verdad ya existe:
es Deshacer.

### 2.3 Dos paneles de ajustes abiertos a la vez

El tema de la página vive en el panel **izquierdo**; el diseño de la sección
seleccionada, en el **derecho**. Al abrir Tema quedan los dos a la vista,
uno global y otro local, sin que se note cuál manda.

En el teléfono pasa lo mismo en otra forma: pestañas *Secciones / Tema*
adentro del panel, y abajo *Secciones / Página / Ajustes*. Dos niveles de
pestañas que se superponen en significado.

### 2.4 Agregar una sección son tres pasos en una ventana

Lista de tipos → dibujo gris genérico → elegir presentación → "Agregar a la
página". El dibujo es igual para cualquier tema, así que no muestra cómo se va
a ver en tu página.

Lo moderno es un "+" entre secciones que abre miniaturas con tu tema aplicado:
un clic, la sección aparece donde estabas, y se ajusta ahí.

---

## 3 · Ruido que le gana al minimalismo

### 3.1 17 textos de ayuda

Algunos de los que se ven al usarlo:

- "Seleccioná una sección para editar"
- "Arrastrá las secciones para ordenarlas."
- "Seleccioná esta sección y agregá tu contenido."
- "Estos ajustes se aplican a toda la página."
- "Subí tu marca y ajustá su ancho para cada pantalla."
- "SVG, PNG, JPG, WebP o AVIF · Hasta 10 MB. Los SVG se limpian antes de
  guardarse."
- "Cambiar la apariencia conserva tus colores personalizados."
- "Progresivo: renderiza al acercarte y anima al entrar en pantalla.
  Estática: muestra todo sin animaciones de entrada…"
- "Podés cambiar el diseño después."
- "Así se verá tu página."

Es lo mismo que ya se sacó del resto de FRAME. Una interfaz que necesita
explicarse en cada panel está pidiendo que la rediseñen, no que la expliquen.
Los formatos y límites de archivo tienen que aparecer **cuando algo falla**,
no de antemano.

### 3.2 69 botones a la vista con una sección seleccionada

La mayoría vienen de que la estructura aparece **dos veces**: el panel
izquierdo lista cada sección y cada bloque de adentro (FORMA, OBJETO, RITMO,
TRAMA…), que ya se ven en el lienzo. "Agregar bloque" está en el árbol y en
el panel derecho; "Agregar sección" aparece en cinco lugares.

### 3.3 Una ventana de navegador falsa alrededor del lienzo

Tres puntitos, título y un ícono de enlace externo, dibujados sobre la página.
Es un adorno que imita una ventana, ocupa alto — mucho en el teléfono — y no
hace nada que el lienzo solo no haga.

### 3.4 11 a 12 tamaños de letra en pantalla

El sistema visual de FRAME define 9. El editor usa más, con varios textos de
10-11px que se leen con esfuerzo ("Página de inicio", "Sección 1 de 11",
"FRAME Portfolio" al pie).

---

## 4 · Controles

| Qué hay | Por qué se siente viejo | Moderno |
|---|---|---|
| **8 `<select>` nativos** (Alineación, Espaciado…) | Menú del sistema operativo dentro de un editor oscuro propio, al lado de las tarjetas visuales de Composición: dos lenguajes en el mismo panel. "A la izquierda" y "Izquierda" además se leen igual | Controles segmentados con íconos |
| **3 casillas** "Mostrar sección en la página" | Casilla de formulario para algo que es mostrar u ocultar | Ícono de ojo en la sección |
| **2 `window.confirm`** (restaurar respaldo, retirar página) | La ventanita gris del navegador rompe el sistema visual | Confirmación propia, o acción directa con Deshacer |
| **Flechas subir/bajar + arrastrar + "Sección 1 de 11"** | Tres formas de ordenar más un contador | Arrastrar, y teclado para accesibilidad |
| **21 blancos de menos de 32px** (14 en teléfono) | En pantalla táctil, Apple pide 44px | Mínimo 44px en táctil |
| **"Publicar prueba"** | No queda claro si publica o no | "Publicar" |
| **Vista previa con toda la barra del editor** | Guardar, Publicar, deshacer y dos carteles siguen ahí | Vista limpia con un solo "Volver" |

---

## Orden sugerido

Ordenado para que cada fase deje algo usable y no dependa de la siguiente.

| Fase | Qué | Riesgo |
|---|---|---|
| **1 · Sacar** | Textos de ayuda, ventana falsa, selector de dispositivo en el teléfono, contador de secciones, vista previa limpia, "Publicar". Arreglar la barra a 375px | Bajo |
| **2 · Controles** | Segmentados en vez de `<select>`, ojo en vez de casilla, confirmación propia, fuera las flechas, blancos de 44px | Bajo |
| **3 · Guardado automático** | Guarda solo, estado en voz baja, fuera el botón Guardar. Deshacer queda como red | Medio: toca cómo se escribe el borrador |
| **4 · Edición en el lienzo** | Clic en el texto y escribir ahí. El panel derecho queda solo para diseño; el árbol, solo para secciones | Alto: es el cambio grande |
| **5 · Agregar en línea** | "+" entre secciones con miniaturas del tema real, un clic | Medio |

Las fases 1 y 2 se pueden hacer ya y cambian la sensación más de lo que
parece. La 4 es la que convierte esto en un editor moderno de verdad, y
conviene hacerla con las anteriores terminadas para no rediseñar dos veces.
