const fs = require('fs');
const assert = require('assert');

const views = fs.readFileSync('views.jsx', 'utf8');
const css = fs.readFileSync('frame.css', 'utf8');
let checks = 0;
const check = (condition, message) => { assert.ok(condition, message); checks += 1; };

check(views.includes('frame-fluid-card'), 'la tarjeta semanal debe declarar su contenedor fluido');
check(views.includes('frame-card-actions-compact'), 'debe existir una alternativa compacta para las acciones');
check(views.includes('aria-label="Acciones de la tarjeta"'), 'el menú compacto debe conservar un nombre accesible');
check(views.includes('frame-card-title'), 'el título debe tener una regla específica de ajuste');
check(views.includes('truncate min-w-0'), 'los metadatos largos deben poder encogerse');
check(css.includes('container-type: inline-size'), 'la adaptación debe depender del ancho de la tarjeta');
check(css.includes('@container (max-width: 229px)'), 'las acciones deben condensarse en columnas estrechas');
check(css.includes('overflow-wrap: anywhere'), 'los títulos largos no deben salir de la tarjeta');
check(css.includes('flex: 1 1 auto'), 'la zona de etiquetas debe ceder espacio a las acciones');
check(css.includes('.frame-card-badges'), 'las etiquetas deben tener un límite propio');
check(css.includes('.frame-card-actions { display: none; }'), 'las acciones completas deben ocultarse al mostrar el menú compacto');

console.log(`responsive-card-contract: ${checks} checks passed`);
