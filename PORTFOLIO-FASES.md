# Constructor de portfolios — plan

## Hito testeable local

Ejecutar `node portfolio-preview-server.cjs` y abrir http://127.0.0.1:4185. Este servidor no carga Firebase ni sirve la app de producción. Usa las dependencias indicadas abajo. Permite editar, importar/exportar JSON, elegir temas, subir imágenes comprimidas y crear/despublicar una copia de prueba en otra pestaña. El enlace solo funciona en este navegador y dispositivo: no se puede enviar a clientes.

Las imágenes locales se comprimen a JPG y se incrustan en el respaldo (máximo 250 KB por imagen y 3 MB por borrador). No se conservan originales ni transparencia. No es todavía una biblioteca Storage. YouTube/Vimeo se incrustan al tocar; los videos siguen dependiendo del proveedor, permisos y conexión. Prueba automática bloquea medios externos: verifica el reproductor generado, no una reproducción real con sonido.

Pruebas adicionales: `node portfolio-flow.test.cjs`. No modifica cuentas, datos, reglas ni hosting remoto. La fase 4 de nube/permisos y la fase 5 de publicación real siguen pendientes; el hito sustituye temporalmente esas operaciones por simulación local explícita.

Independiente de tareas y del portal de clientes. Los módulos contienen contenido propio; no se importan datos privados automáticamente.

1. **Base y borrador local:** contrato versionado de módulos, editor inicial, agregar/ordenar/duplicar/ocultar, texto y vistas previas estructurales. Guardado local por usuario y tablero, exportación de respaldo. No publicación.
2. **Biblioteca flexible:** galerías grid/mosaico/carrusel; imagen + texto; precios/paquetes con moneda e inclusiones; servicios, contacto, portada, navegación y pie. Elementos repetibles, validación y controles de contenido/diseño.
3. **Medios y tema:** biblioteca de imágenes propia, cargas recuperables, YouTube/Vimeo por enlaces aprobados, portadas y reproducción al tocar; colores, tipografías, escritorio/móvil y accesibilidad. Subida directa de video fuera del piloto.
4. **Persistencia segura:** borradores en Firebase independientes, permisos por usuario/equipo, reglas versionadas y pruebas aisladas. Recuperación, conflictos y límites. No sobrescribir ni migrar tareas.
5. **Publicación web:** snapshot público separado del borrador, enlace estable, actualizar/despublicar, metadatos SEO y controles de contenido público. Definir dominio/hosting y desplegar con autorización; no prometer privacidad por conocer solo un enlace.
6. **Piloto:** pruebas visuales y de permisos, dispositivos, video, rendimiento, restauración y costos. Después: dominios propios, más variantes, analítica y video alojado especializado.

Cada fase se verifica antes de avanzar. Fase 1 no es aún un constructor publicable ni una biblioteca multimedia completa. Guardado del navegador no sustituye respaldo ni sincronización entre dispositivos.

## Avance local — fases 1 y 2

- Navegación Portfolio integrada en el panel de escritorio. Editor adaptable a móvil; el acceso desde la navegación específica de teléfono aún debe integrarse.
- Verificado en Chrome aislado: edición, paquetes con precio/inclusiones, guardado/reapertura, ancho móvil y protección de borrador corrupto.
- Biblioteca: texto, galerías por enlaces HTTPS, precios, servicios, contacto, imagen + texto, portada, navegación y pie. Elementos agregables, editables, reordenables y removibles. Galería carrusel mediante desplazamiento horizontal; mosaico/grid mediante composición CSS.
- La vista previa admite enlaces externos seguros; en las pruebas se bloquea todo acceso externo. Imágenes por enlace no son copias archivadas: dependen del host original. Cargas propias y reproductores quedan en fase 3.
- Precios son presentación/cotización, nunca cobros. No hay publicación pública ni sincronización Firebase.
- Comandos: `node --test *test.js`, `node portfolio-browser.test.cjs`. La prueba de navegador usa las dependencias locales de TOONED-OS; se puede definir FRAME_TEST_DEPS con otra ruta de node_modules que contenga React, ReactDOM, Babel Standalone y Playwright. Usa Chrome instalado y perfil temporal, sin credenciales.
- Pendientes de cierre: importación del respaldo, recuperación explícita dentro de la misma aplicación al salir del editor, controles avanzados de columnas/espaciado y pruebas visuales completas de todas las variantes. No se certifican todavía las fases completas para producción.
