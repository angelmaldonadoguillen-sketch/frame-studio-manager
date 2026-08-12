// Servidor estático mínimo para probar el harness con recargas reales:
// el panel de vista previa no vuelve a leer los file:// desde disco.
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(process.argv[2] || '.');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.jsx': 'text/babel',
                '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml' };

http.createServer((req, res) => {
  const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || 'preview-ui.html';
  const file = path.join(ROOT, rel);
  if (!file.startsWith(ROOT)) { res.writeHead(403).end(); return; }
  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(404).end('404 ' + rel); return; }
    res.writeHead(200, {
      'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    res.end(buf);
  });
}).listen(8777, () => console.log('sirviendo en http://localhost:8777'));
