// Service worker mínimo, a propósito.
//
// Existe por una sola razón: Chrome no ofrece "Instalar aplicación" si la
// página no registra uno con un manejador de fetch. No guarda nada en caché.
//
// Esto último es deliberado. FRAME se publica en GitHub Pages y ya cuesta que
// el navegador suelte los .jsx viejos —de ahí el Ctrl+Shift+R de siempre—. Un
// service worker que cachee agregaría una segunda capa de archivos viejos,
// esta vez una que sobrevive al recargar y que hay que ir a borrar a mano
// desde las herramientas del navegador. La app quedaría congelada en una
// versión sin forma evidente de actualizarla.
//
// Si algún día hace falta que FRAME funcione sin señal, esto se reemplaza por
// una estrategia de red primero con respaldo en caché, con una versión en el
// nombre del caché y limpieza en 'activate'. No antes.

self.addEventListener('install', () => {
  // Sin espera: no hay caché viejo que preservar.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Toma el control de las pestañas ya abiertas sin exigir una recarga.
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', () => {
  // Sin respondWith: cada petición sigue de largo a la red, igual que si el
  // service worker no existiera. El manejador está sólo para que el navegador
  // considere la app instalable.
});
