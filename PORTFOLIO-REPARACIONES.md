# FRAME Portfolio — estado del editor local

## Experiencia implementada

- Editor a pantalla completa con salida a FRAME y acceso desde el perfil móvil.
- Barra superior compacta: escritorio/móvil, deshacer/rehacer, vista previa y guardar.
- Árbol de filas compactas, bloques plegables y selección sincronizada con el lienzo.
- Arrastre de secciones y de bloques dentro de su sección. Controles equivalentes para teclado y móvil en el inspector.
- Inspector contextual: campos del bloque seleccionado, contenido de sección o ajustes de diseño.
- Catálogo con búsqueda, miniaturas estructurales, variantes y cierre con Escape.
- Galerías: columnas, formato de imagen, esquinas, espaciado y alineación. Valores validados al importar.
- Animaciones de entrada opcionales en portada, texto, imagen con texto, galerías, servicios y precios. Efectos según el módulo: aparecer, subir, acercamiento sutil o bloques en secuencia; tres velocidades y botón de prueba. Desactivadas por defecto, sin alterar el espacio de los módulos ni animar cada edición. Respetan «Reducir movimiento», incluso al activarlo durante una animación.
- Vista previa sin controles de selección. Los enlaces y videos se activan en ese modo.
- Imágenes mediante selector, arrastre, pegado o enlace. Límites locales, errores y reintento; la carga conserva el bloque de destino.
- Historial de 30 cambios durante la sesión y recuperación del borrador pendiente en sessionStorage al volver al editor. Guardado explícito en localStorage.
- Documento de ejemplo separado del documento de trabajo: /?demo=1 usa otro identificador y no sobrescribe documentos existentes.

## Verificación

- Tema → Tipografía y ancho: ancho global de contenido entre 640 y 1600 px con adaptación automática a móvil; fuentes independientes para títulos y cuerpo. Incluye 11 familias curadas de Google Fonts y la opción sin descarga «Fuente del tema». Solo las familias elegidas se solicitan mediante CSS API v2 con display=swap y fallbacks serif/sans-serif.
- portfolio-theme-style.test.cjs verifica ancho renderizado, fuente de títulos/texto, una única solicitud dinámica, ajuste móvil sin desbordamiento, guardado/recarga y restablecer/deshacer. El esquema rechaza anchos, fuentes y campos importados fuera de la lista permitida.

- Tema → Logo: selector y arrastre para SVG, PNG, JPG, WebP y AVIF, progreso de procesamiento, vista previa, cambiar/quitar y controles de ancho independientes (64–320 px en escritorio, 48–240 px en móvil). Los raster se convierten a WebP; los SVG se analizan, se limpian y vuelven a validar antes de guardarse. La cabecera vuelve al nombre textual cuando no hay logo.
- portfolio-logo.test.cjs verifica carga SVG, bloqueo de contenido ejecutable, tamaños responsive, guardado/recarga y quitar/deshacer. También pasaron las regresiones de demo completa, paleta, carga por scroll y animaciones.

- Tema → Carga de módulos: progresivo (predeterminado) o estático. Progresivo usa content-visibility:auto para diferir renderizado y loading=lazy para imágenes; las animaciones entran una vez al llegar a pantalla. El documento completo sigue disponible en el DOM, no es paginación ni descarga de datos por módulos. Estático renderiza todo, carga imágenes eager y desactiva entradas automáticas sin borrar sus ajustes. El editor no difiere módulos y los videos siempre requieren pulsar reproducir.
- portfolio-loading.test.cjs verifica persistencia, renderizado progresivo/estático, imágenes eager/lazy, activación al hacer scroll y movimiento reducido. También pasaron modelo y regresión de animaciones.

- Demo completa en /?demo=full: 11 secciones, los 10 tipos de módulo, imágenes locales de muestra, precios ficticios, video externo bajo demanda, colores y animaciones. Usa el almacenamiento demo-full separado de demo y del documento real; no sobrescribe pruebas anteriores.
- Guardar muestra check animado y «Guardado» durante 2,2 segundos tras éxito; respeta movimiento reducido y no confirma fallos. portfolio-demo.test.cjs verifica cobertura de módulos, almacenamiento separado, éxito/error de guardado, recarga y móvil. También pasaron las regresiones de paleta y animaciones.

- Paleta personalizable en Tema: fondo, texto, tarjetas y acento. Selector nativo de espectro y entrada HEX (3/6 dígitos, normalizada al confirmar), avisos de contraste, restablecer y deshacer. Cambiar la apariencia conserva los colores personalizados. No modifica el tema de FRAME.
- portfolio-palette.test.cjs: HEX, valores inválidos, selector de color, avisos, renderizado de tarjetas, persistencia, vista previa, restablecer/deshacer y ancho móvil. Captura revisada: test-results/portfolio-palette.png. El diálogo nativo del sistema se abre desde input color; la prueba automatizada verifica su valor, no la interfaz del sistema operativo.

- portfolio-browser.test.cjs: selección, arrastre de secciones/bloques, historial, diseños renderizados, ocultar, catálogo, persistencia, vista previa, scroll real, móvil/landscape, tema claro y protección de archivo corrupto.
- portfolio-flow.test.cjs: imagen local, video vertical cargado solo en vista previa, exportación, copia local y recuperación pendiente. Plataformas externas bloqueadas en las pruebas; no se certifica reproducción remota.
- portfolio-model.test.js: esquema de diseños, versiones anteriores y valores de importación inválidos.
- portfolio-animation.test.cjs: activación voluntaria, prueba manual, estabilidad de altura, secuencia de bloques, guardado/recarga, vista previa y cancelación al activar movimiento reducido. Ejecutada junto con las pruebas del modelo tras añadir animaciones.
- Suite de 19 archivos test.js y compilación JSX de las pantallas modificadas.
- Capturas revisadas: test-results/portfolio-desktop.png, portfolio-mobile.png, portfolio-light.png y portfolio-catalog.png.

## Límites actuales

El guardado sigue siendo por dispositivo. No hay publicación web pública ni guardado en Firebase. La copia de publicación de prueba se ofrece solo en el servidor local de pruebas, no en la app. El historial de deshacer no sobrevive a una recarga. El borrador pendiente se recupera mientras la sesión del navegador conserva sessionStorage; para conservarlo de forma duradera hay que guardar o exportar. No se han subido cambios ni modificado servicios remotos.
