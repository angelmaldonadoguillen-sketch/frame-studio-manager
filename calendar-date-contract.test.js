const assert = require('node:assert/strict');
const fs = require('node:fs');

const views = fs.readFileSync('views.jsx', 'utf8');
const app = fs.readFileSync('app.jsx', 'utf8');

// La posición del calendario pertenece a startDate; deadline conserva el
// compromiso de entrega y no debe cambiar al reprogramar una tarjeta.
assert.match(views, /const date = p\.startDate \|\| p\.sessionDate \|\| p\.deadline/);
assert.match(views, /onUpdateProject\s*&&\s*onUpdateProject\(\{ \.\.\.project, startDate: iso \}\)/);
assert.match(views, /onUpdateProject\s*&&\s*onUpdateProject\(\{ \.\.\.cleanProject, startDate: iso \}\)/);
assert.doesNotMatch(views, /onUpdateProject\([^\n]*deadline:\s*iso/);
assert.match(app, /startDate:\s+start/);
assert.match(app, /before\.startDate !== after\.startDate/);

console.log('calendar-date-contract: 6 checks passed');
