// Genera los PNG del manifiesto sin dependencias externas.
//
// La "F" se dibuja con tres rectángulos en vez de tipografía: así el ícono
// sale idéntico en cualquier máquina, sin depender de qué fuente esté
// instalada ni de cómo la sustituya el sistema.
//
//   node .claude/gen-icons.js
const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

const ACENTO = [0xd4, 0xff, 0x4f];
const TINTA  = [0x0a, 0x0a, 0x0b];

// ── PNG mínimo (RGBA, sin filtros) ───────────────────────────────
const crcTabla = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();
const crc32 = (buf) => {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = crcTabla[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
};
const chunk = (tipo, datos) => {
  const largo = Buffer.alloc(4);
  largo.writeUInt32BE(datos.length);
  const cuerpo = Buffer.concat([Buffer.from(tipo, 'ascii'), datos]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(cuerpo));
  return Buffer.concat([largo, cuerpo, crc]);
};
const png = (ancho, alto, pixeles) => {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(ancho, 0);
  ihdr.writeUInt32BE(alto, 4);
  ihdr[8] = 8;   // bits por canal
  ihdr[9] = 6;   // RGBA
  // Cada fila lleva adelante un byte de filtro; 0 = sin filtro.
  const conFiltro = Buffer.alloc(alto * (ancho * 4 + 1));
  for (let y = 0; y < alto; y++) {
    conFiltro[y * (ancho * 4 + 1)] = 0;
    pixeles.copy(conFiltro, y * (ancho * 4 + 1) + 1, y * ancho * 4, (y + 1) * ancho * 4);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(conFiltro, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
};

// ── El ícono ─────────────────────────────────────────────────────
// radio: 0 = cuadrado a sangre (para 'maskable' y para iOS, que pone su
// propio redondeo). escala: qué proporción del lienzo ocupa la F.
const icono = (lado, radio, escala) => {
  const px = Buffer.alloc(lado * lado * 4);
  const r = radio * lado;

  // Distancia al borde redondeado, para saber si el punto entra.
  const dentro = (x, y) => {
    if (r <= 0) return true;
    const cx = Math.min(Math.max(x, r), lado - r);
    const cy = Math.min(Math.max(y, r), lado - r);
    const dx = x - cx, dy = y - cy;
    return dx * dx + dy * dy <= r * r;
  };

  // La F: barra vertical, brazo de arriba, brazo del medio.
  const alto  = lado * escala;
  const ancho = alto * 0.62;
  const x0 = (lado - ancho) / 2;
  const y0 = (lado - alto) / 2;
  const grosor = alto * 0.21;
  const barras = [
    [x0, y0, grosor, alto],                                  // vertical
    [x0, y0, ancho, grosor],                                 // brazo superior
    [x0, y0 + (alto - grosor) * 0.47, ancho * 0.78, grosor], // brazo medio
  ];
  const enLaF = (x, y) => barras.some(([bx, by, bw, bh]) =>
    x >= bx && x < bx + bw && y >= by && y < by + bh);

  for (let y = 0; y < lado; y++) {
    for (let x = 0; x < lado; x++) {
      const i = (y * lado + x) * 4;
      if (!dentro(x + 0.5, y + 0.5)) { px[i + 3] = 0; continue; }
      const c = enLaF(x + 0.5, y + 0.5) ? TINTA : ACENTO;
      px[i] = c[0]; px[i + 1] = c[1]; px[i + 2] = c[2]; px[i + 3] = 255;
    }
  }
  return png(lado, lado, px);
};

const raiz = path.resolve(__dirname, '..');
const salidas = [
  // 'any': lleva su propio redondeo porque se muestra tal cual.
  ['icon-192.png',          icono(192, 0.22, 0.60)],
  ['icon-512.png',          icono(512, 0.22, 0.60)],
  // 'maskable': a sangre y con la F chica — el sistema recorta los bordes
  // y hay que dejarle margen o se come parte de la letra.
  ['icon-maskable-512.png', icono(512, 0,    0.40)],
  // iOS no admite transparencia acá y pone su propio redondeo.
  ['apple-touch-icon.png',  icono(180, 0,    0.60)],
];
salidas.forEach(([nombre, buf]) => {
  fs.writeFileSync(path.join(raiz, nombre), buf);
  console.log('  ' + nombre.padEnd(24) + (buf.length / 1024).toFixed(1) + ' KB');
});
