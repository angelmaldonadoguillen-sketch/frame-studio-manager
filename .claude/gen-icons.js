// Genera los PNG del manifiesto sin dependencias externas.
//
// El ícono son los seis bloques del logo (FRAME LOOOGO.svg / brand.jsx),
// dibujados como rectángulos: sale idéntico en cualquier máquina, sin
// depender de fuentes ni de un conversor de SVG. Cada pixel se muestrea
// 4×4 veces para que los bordes y las esquinas salgan suaves.
//
//   node .claude/gen-icons.js
const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

const ACENTO = [0xd4, 0xff, 0x4f];
const TINTA  = [0x1d, 0x1d, 0x1b];   // color del logo original

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
// propio redondeo). escala: qué proporción del alto del lienzo ocupa la marca.
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

  // La marca: columna de cuatro bloques y dos a la derecha, en unidades del SVG.
  const CAJA = { ancho: 37.99, alto: 47.39 };
  const BLOQUES = [[0, 0], [0, 12.62], [19.86, 0], [0, 25.24], [0, 37.86], [19.86, 24.9]];
  const unidad = lado * escala / CAJA.alto;
  const x0 = (lado - CAJA.ancho * unidad) / 2;
  const y0 = (lado - CAJA.alto * unidad) / 2;
  const bw = 18.13 * unidad, bh = 9.53 * unidad, rb = 0.93 * unidad;
  const enBloque = (x, y) => BLOQUES.some(([bx, by]) => {
    const l = x0 + bx * unidad, t = y0 + by * unidad;
    if (x < l || x >= l + bw || y < t || y >= t + bh) return false;
    const cx = Math.min(Math.max(x, l + rb), l + bw - rb), cy = Math.min(Math.max(y, t + rb), t + bh - rb);
    return (x - cx) ** 2 + (y - cy) ** 2 <= rb * rb;
  });

  const N = 4; // muestras por lado de cada pixel
  for (let y = 0; y < lado; y++) {
    for (let x = 0; x < lado; x++) {
      const i = (y * lado + x) * 4;
      let fondo = 0, marca = 0;
      for (let sy = 0; sy < N; sy++) for (let sx = 0; sx < N; sx++) {
        const px_ = x + (sx + 0.5) / N, py_ = y + (sy + 0.5) / N;
        if (!dentro(px_, py_)) continue;
        if (enBloque(px_, py_)) marca++; else fondo++;
      }
      const total = fondo + marca;
      if (!total) { px[i + 3] = 0; continue; }
      for (let c = 0; c < 3; c++) px[i + c] = Math.round((TINTA[c] * marca + ACENTO[c] * fondo) / total);
      px[i + 3] = Math.round(total / (N * N) * 255);
    }
  }
  return png(lado, lado, px);
};

const raiz = path.resolve(__dirname, '..');
const salidas = [
  // 'any': lleva su propio redondeo porque se muestra tal cual.
  ['icon-192.png',          icono(192, 0.22, 0.60)],
  ['icon-512.png',          icono(512, 0.22, 0.60)],
  // 'maskable': a sangre y con la marca chica — el sistema recorta los
  // bordes y hay que dejarle margen o se come parte de los bloques.
  ['icon-maskable-512.png', icono(512, 0,    0.40)],
  // iOS no admite transparencia acá y pone su propio redondeo.
  ['apple-touch-icon.png',  icono(180, 0,    0.60)],
];
salidas.forEach(([nombre, buf]) => {
  fs.writeFileSync(path.join(raiz, nombre), buf);
  console.log('  ' + nombre.padEnd(24) + (buf.length / 1024).toFixed(1) + ' KB');
});
