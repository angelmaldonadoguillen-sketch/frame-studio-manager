# Auditoría de retícula y zonas seguras — FRAME Portfolio

Fecha: 16 de septiembre de 2026  
Alcance: editor y página publicada, escritorio y móvil.  
Estado: diagnóstico únicamente; no se modificó la interfaz del producto.

## Conclusión ejecutiva

La retícula exterior existe y funciona: a 1440 px deja aproximadamente 101 px por lado y a 390 px deja 23 px. El problema está dentro de los módulos. Todos comparten una base genérica, pero varias variantes no tienen reglas propias para padding, ancho de lectura, orden o adaptación móvil. Esto produce cajas con texto pegado, variantes que se ven casi iguales y estilos de una variante que se filtran a otra.

Los defectos más visibles son:

1. Servicios en tarjetas no tiene padding interior: 0 px entre la caja y el texto.
2. Precios en lista conserva el borde de tarjeta, pero pierde el padding horizontal: queda aproximadamente 1 px entre borde y contenido.
3. Pie de página en columnas mantiene tres columnas en móvil.
4. Navegación centrada no tiene un comportamiento visual propio y la navegación se presenta como una sección de contenido de gran tamaño.
5. Contacto tipo banner no tiene todavía estructura de banner, fondo, zona segura ni jerarquía de llamada a la acción.
6. Texto secundario y enlaces quedan entre 13–14 px; los enlaces medidos tienen 39 px de alto y el enlace externo del video solo 17 px. En móvil deberían llegar a 16 px de lectura y 44 px de área táctil.

## Método de revisión

- Revisión de los 10 tipos y sus 24 variantes.
- Medición automática a 1440 × 900 y 390 × 844.
- Comprobación de desbordamiento horizontal.
- Revisión de padding exterior, padding interior, ancho de lectura y tamaño de enlaces.
- Inspección del CSS compartido para detectar reglas heredadas entre variantes.
- Contraste con criterios de legibilidad, reflujo, jerarquía, objetivos táctiles y responsive.

Resultado general: no hubo desbordamiento horizontal, pero sí fallos de retícula interior y pérdida de identidad entre variantes.

## Auditoría por módulo

### 1. Texto

Variantes: simple, columnas y cita.

- Simple: base estable. El ancho máximo de lectura es correcto y mantiene la retícula exterior.
- Columnas: funciona en escritorio y vuelve a una columna en móvil. El bloque completo está limitado a 65ch, por lo que cada columna puede quedar demasiado estrecha con determinadas fuentes.
- Cita: el ancho depende del tamaño tipográfico; en la medición llegó a 957 px, demasiado ancho para una cita. Visualmente existe, pero semánticamente sigue siendo un párrafo y no un `blockquote`.
- El control de alineación no reposiciona el bloque de texto: centra o alinea el contenido dentro de una caja que puede seguir anclada a la izquierda.

Prioridad: media.

### 2. Galería

Variantes: cuadrícula, mosaico y carrusel.

- Cuadrícula: es la variante más consistente. Imagen y texto comparten eje y no necesitan una caja interna adicional mientras no exista fondo de tarjeta.
- Mosaico: funciona en escritorio y se reduce a una columna en móvil. La primera pieza domina correctamente, pero falta controlar composiciones con 2, 4 o 5 elementos para evitar huecos visuales.
- Carrusel: conserva el desplazamiento horizontal y el snap, pero no tiene controles accesibles, indicador de posición, padding final ni pista visual clara de que hay más contenido.
- Los títulos empiezan exactamente en el borde de la imagen, lo cual es válido para una composición editorial, pero debería ser una decisión del estilo, no una consecuencia fija.

Prioridad: media.

### 3. Precios y paquetes

Variantes: tarjetas, lista y comparación.

- Tarjetas: tiene una zona segura correcta de 24–25 px. Es la referencia interior mejor resuelta.
- Lista: defecto crítico de retícula. La regla genérica de lista reemplaza el padding de tarjeta por `16px 0`, pero conserva el borde exterior. Resultado medido: 1 px entre borde y texto.
- Comparación: mantiene 24 px de padding en escritorio, pero al apilarse en móvil conserva bordes laterales pensados para columnas. Deja de comunicar comparación y pasa a parecer una serie de cajas mal cerradas.
- Los enlaces de acción miden 39 px de alto, por debajo del objetivo táctil recomendado de 44 px.
- El color de superficie puede coincidir con el fondo del tema; en ese caso, la tarjeta depende únicamente del borde para existir.

Prioridad: alta.

### 4. Video

Variantes: horizontal, vertical y video con texto.

- Horizontal: estructura sencilla y estable.
- Vertical: el reproductor se limita a 360 px y se centra, pero el título y la descripción vuelven al ancho completo. El eje del contenido no coincide con el eje del video.
- Video con texto: el reparto en dos columnas y el gap de 24 px funcionan; en móvil se apila correctamente.
- El enlace “Ver en plataforma original” mide cerca de 17 px de alto y usa texto de 11 px: es insuficiente como objetivo táctil y como texto funcional.
- Falta una zona reservada o skeleton para estados de carga del iframe después de pulsar.

Prioridad: media-alta.

### 5. Imagen + texto

Variantes: imagen izquierda e imagen derecha.

- Es uno de los módulos mejor encaminados: dos columnas, gap de 24 px y alineación vertical centrada.
- En móvil ambas variantes vuelven al mismo orden, que es lo esperado para lectura lineal.
- Falta definir una distancia mayor en escritorio para páginas anchas; 24 px se siente como una separación de tarjeta, no como una composición editorial.
- Si no existe imagen, la variante pierde su estructura y queda como un bloque de texto sin intención alternativa.
- El título y texto introductor de la sección viven fuera de la composición imagen–texto, generando hasta tres jerarquías consecutivas.

Prioridad: media.

### 6. Servicios

Variantes: tarjetas y lista.

- Tarjetas: defecto crítico de zona segura. Tiene fondo de superficie, pero 0 px de padding interior. El texto toca el borde conceptual de la caja.
- En el tema Editorial, superficie y fondo pueden ser idénticos; la tarjeta desaparece visualmente aunque siga ocupando una cuadrícula.
- Lista: la separación por líneas funciona mejor, pero usa la misma regla genérica que precios y no tiene una jerarquía propia para nombre, descripción y posible enlace.
- No hay una decisión consistente sobre imágenes: el modelo las admite, pero el editor no muestra placeholder para servicios vacíos.

Prioridad: alta.

### 7. Contacto

Variantes: banner y enlaces.

- Banner: todavía no es un banner. Hereda la cuadrícula general, sin contenedor, fondo, padding interior, contraste o alineación clara entre mensaje y acción.
- Enlaces: usa flex y wrapping, pero las acciones conservan solo 39 px de alto.
- Las dos variantes se distinguen poco; hoy describen nombres distintos para comportamientos casi iguales.
- Falta separar información de contacto directa —correo, teléfono, redes— de una llamada principal a trabajar juntos.

Prioridad: alta.

### 8. Portada

Variantes: centrada y dividida.

- Centrada: tiene una tesis visual clara, ancho de título controlado y composición estable.
- Dividida: solo se vuelve realmente dividida cuando existe un bloque hijo. El título principal y la introducción permanecen arriba a ancho completo; luego aparece otra pareja de imagen y texto. No es una portada split real.
- En ausencia de bloque hijo, centrada y dividida se diferencian muy poco.
- La portada puede terminar mostrando título de sección, texto de sección, título del bloque y texto del bloque: demasiadas capas para el primer impacto.

Prioridad: alta.

### 9. Navegación

Variantes: izquierda y centrada.

- Se renderiza como un `article` de contenido con un `h2` grande, no como navegación del sitio.
- La variante centrada no tiene una regla propia; cambiar de izquierda a centro no garantiza ningún cambio visible.
- Convive con la cabecera automática de marca, por lo que puede producir dos encabezados consecutivos.
- Los enlaces miden 39 px y no tienen una zona táctil suficiente en móvil.
- Al ser una sección reordenable, puede terminar a mitad de la página, algo incoherente con su función.

Prioridad: alta.

### 10. Pie de página

Variantes: simple y columnas.

- Simple: estructura aceptable, con borde superior y links flexibles.
- Columnas: mantiene `repeat(3, 1fr)` incluso a 390 px porque su selector gana al responsive genérico. Esto comprime el contenido en tres columnas móviles.
- Los enlaces vuelven a medir 39 px.
- Se renderiza como `article`, no como `footer`, y puede moverse a cualquier posición.
- Falta una zona inferior consistente para copyright, identidad y enlaces legales.

Prioridad: alta.

## Problemas transversales

### Retícula

- Existe gutter de página, pero no hay tokens separados para `section padding`, `card padding`, `media gap` y `action gap`.
- Las variantes heredan reglas por nombre genérico (`list`, `cards`) y eso genera conflictos entre módulos.
- La alineación cambia `text-align`, pero no siempre cambia la posición o el ancho del bloque.

### Tipografía

- Texto principal: 14 px.
- Texto de tarjeta: 13 px.
- Enlace externo de video: 11 px.
- En móvil, estas medidas quedan por debajo del piso recomendable de 16 px para lectura continua.
- Las citas necesitan un ancho propio de aproximadamente 34–42ch, no el mismo límite de 65ch escalado a 24 px.

### Accesibilidad e interacción

- Enlaces principales medidos en 39 px; objetivo recomendado: mínimo 44 px.
- El carrusel no ofrece controles ni estado accesible.
- Navegación y pie no usan elementos semánticos propios.
- La página pública no define un foco visual consistente con las paletas configurables.

### Responsive

- No hay overflow global a 390 px.
- Pie de página en columnas falla en móvil.
- Tabla de precios pierde su lógica comparativa al apilarse.
- Los módulos con media se apilan correctamente, pero algunos pierden el eje de lectura o el orden editorial.

## Orden recomendado para reparación

### Fase A — Base de retícula

1. Crear tokens únicos para gutter, ancho de lectura, padding de tarjeta y gaps.
2. Separar reglas por módulo y variante; dejar de usar selectores genéricos que afecten precios, servicios y otros módulos al mismo tiempo.
3. Corregir alineación real del contenido y piso tipográfico/táctil móvil.

### Fase B — Defectos visibles

1. Servicios / tarjetas.
2. Precios / lista y comparación móvil.
3. Footer / columnas móvil.
4. Contacto / banner.

### Fase C — Variantes incompletas

1. Navegación izquierda/centro como cabecera real.
2. Hero dividido como composición real de dos zonas.
3. Video vertical y enlace externo.
4. Carrusel con controles y zona segura final.

### Fase D — Semántica y pulido

1. `nav`, `blockquote` y `footer` reales.
2. Foco visible compatible con cada paleta.
3. Pruebas visuales de cada variante en 1440, 768 y 390 px.

## Criterio de salida para la siguiente fase

La reparación estará lista cuando cada variante:

- tenga un comportamiento visual distinto y justificable;
- respete al menos 18 px de padding interior móvil y 24 px en escritorio cuando exista una caja;
- mantenga una lectura de 45–75 caracteres por línea;
- ofrezca objetivos táctiles de 44 px;
- no produzca más de una columna legible en 390 px salvo carruseles intencionales;
- preserve el mismo eje visual entre título, texto, media y acciones;
- pueda distinguirse y entenderse dentro del ecosistema FRAME sin parecer un componente genérico aislado.
