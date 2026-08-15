const assert = require('node:assert/strict');
const fs = require('node:fs');

const html = fs.readFileSync('index.html', 'utf8');
const css = fs.readFileSync('frame.css', 'utf8');
const app = fs.readFileSync('app.jsx', 'utf8');
const modal = fs.readFileSync('modal.jsx', 'utf8');
const mobile = fs.readFileSync('mobile.jsx', 'utf8');

assert.match(html, /frame_theme/);
assert.match(html, /window\.setFrameTheme/);
assert.match(html, /document\.documentElement\.dataset\.theme/);
assert.match(html, /meta\[name="theme-color"\]/);
assert.match(css, /html\[data-theme="light"\]/);
assert.match(css, /--color-scheme:\s*light/);
assert.match(css, /--bg:\s*#f4f4f7/);
assert.match(css, /--surface:\s*#ffffff/);
assert.match(css, /\.text-white\s*\{\s*color:\s*var\(--text\)/);
assert.match(app, /label="Modo claro"/);
assert.match(app, /window\.setFrameTheme\(next\)/);
assert.match(mobile, /window\.setFrameTheme\(next\)/);
assert.match(mobile, /Cambiar a modo oscuro/);
assert.match(mobile, /Cambiar a modo claro/);
assert.doesNotMatch(app + modal, /colorScheme:\s*'dark'/);

console.log('theme-contract: 15 checks passed');
