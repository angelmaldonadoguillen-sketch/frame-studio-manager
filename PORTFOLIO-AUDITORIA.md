# Auditoría de Portfolio — 15 de septiembre de 2026

Diagnóstico de código y reproducción en Chrome local aislado. No se modificó la interfaz ni Firebase. El prototipo no es una versión terminada.

## Bloqueantes

- **Scroll inaccesible:** frame.css fija html/body/root al 100% y body con overflow:hidden. El editor tiene overflow:auto pero no altura limitada ni min-height:0 dentro de un contenedor que lo restrinja. Medición a 1280×720: editor 872 px, clientHeight=scrollHeight; rueda de 700 px deja windowY/editorY/panelY en cero. Panel y preview tampoco son scroll containers. La captura fullPage anterior ocultaba este defecto.
- **Prueba fuera de FRAME:** el servidor establece Arial y variables de fondo/acento propias; no monta Sidebar/Header ni el sistema de componentes. Los botones carecen del tratamiento completo de FRAME y pueden verse como controles nativos. El editor debe heredar tokens/tipografía/componentes; solo el documento de portfolio tiene identidad independiente.
- **Acceso móvil ausente:** App devuelve MobileApp antes de alcanzar PortfolioEditor; no hay entrada Portfolio en ese árbol móvil.
- **Publicación de prueba no portable:** publishTest abre /?view=published, ruta comprendida solo por el servidor de pruebas. No funciona como publicación en GitHub Pages ni dentro de FRAME. La copia reside en localStorage del mismo origen/perfil; no sirve para clientes.

## Fiabilidad y seguridad

- Guardado manual local. El estado inicial siempre dice cambios sin guardar incluso tras restaurar un borrador válido.
- beforeunload no protege al cambiar de sección dentro de React: se puede perder el trabajo no guardado al desmontar el editor.
- Importar mantiene una copia _recovery, pero no hay una acción de restauración de esa copia ni historial/deshacer.
- Validación no cubre todos los campos opcionales: theme, video, currency, inclusions, featured/from, tamaños de textos de items y unicidad de sus IDs. Renderizar un respaldo malformado puede fallar, por ejemplo si inclusions no es string.
- Subida async usa updateItem de la selección capturada, pero update trabaja sobre selected del render que inició la operación. Una importación o cambios simultáneos pueden dejar el resultado obsoleto. Hace falta actualización por sectionId/itemId y política de cancelación/desmontaje.
- Imágenes fallidas se ocultan sin aviso; cambiar su URL no garantiza restablecer display. Se requiere estado de error/reintento y conservación del espacio.
- Copia publicada de prueba clonada desde draft, no construida mediante lista explícita de campos públicos. Una importación permite propiedades adicionales que sobreviven al snapshot. Antes de publicación real: proyección pública validada, permisos y contenido oculto excluido en servidor.

## Funciones incompletas

- Las variantes de video wide/vertical/with-text no cambian el iframe: siempre 16:9. Tema global no gobierna todos los colores/tipografías internos, hay valores fijos que pueden afectar contraste.
- Módulos usan un renderer genérico: algunas variantes son escasas o equivalentes. Contacto no tiene formulario; navegación no tiene anclas internas; no hay logo, lightbox, filtros de galería ni paginación.
- No se pueden eliminar secciones, duplicar items ni deshacer. Falta selección de módulos desde el lienzo, panel de propiedades independiente y traducción de variantes.
- No hay controles de columnas, espacio, proporción, alineación, colores por sección, tipografía ni edición rica de texto.
- Medios: sin biblioteca propia, pegado, progreso porcentual ni cancelación. JPG local pierde transparencia/original y los límites son del prototipo, no de Storage.
- Firebase/persistencia compartida, reglas, enlaces públicos, SEO, hosting y controles contra abuso todavía no están implementados.

## Orden de reparación

1. Shell FRAME real, altura definida, toolbar persistente y scroll independiente de lista/propiedades/preview. Pruebas wheel/teclado/táctil y último campo accesible a 720px y móvil.
2. Separar lista de módulos, propiedades seleccionadas y lienzo; limpiar botones; acceso móvil real; controles usando tokens/componentes FRAME.
3. Proteger navegación y recuperación, completar schema y pruebas de respaldos inválidos, corregir errores y carreras de medios.
4. Completar variantes y controles de módulos/tema con QA de contraste y responsive; mantener semántica propia de galería/precios/video/contacto.
5. Preparar nube y snapshot público en entorno aislado antes de solicitar despliegue. Ningún enlace actual debe presentarse como compartible.

Las pruebas existentes verifican subsets de edición y snapshot, no usabilidad integral. En particular scroll, navegación interna, todas las variantes y reproducción real externa no estaban cubiertos.
