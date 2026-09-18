const assert = require('node:assert/strict');
const fs = require('node:fs');

const app = fs.readFileSync('app.jsx', 'utf8');
const editor = fs.readFileSync('portfolio.jsx', 'utf8');
const model = fs.readFileSync('portfolio-model.js', 'utf8');
const functions = fs.readFileSync('functions/index.js', 'utf8');
const firestore = fs.readFileSync('firestore.rules.v2', 'utf8');
const storage = fs.readFileSync('storage.rules', 'utf8');
const html = fs.readFileSync('index.html', 'utf8');
const css = fs.readFileSync('frame.css', 'utf8');

assert.match(app, /label="Mi portfolio"/);
// La página publicada se desplaza con la ventana; la app, por dentro.
assert.ok(app.includes("classList.add('fp-public-route')"), 'app.jsx no marca la ruta de la página publicada');
assert.ok(css.includes('.fp-public-route #root { height: auto'), 'frame.css no le devuelve el scroll a la página publicada');
assert.match(app, /key=\{state\.currentUserId\}/);
assert.match(editor, /frame_portfolio_v2_'\+userId/);
assert.match(editor, /frame_portfolio_drafts/);
assert.match(editor, /doc\(userId\)/);
assert.doesNotMatch(editor, /doc\(workspaceId\)/);
assert.match(editor, /PortfolioLoadingScreen/);
assert.match(editor, /FP_STORAGE_LIMIT=1024\*1024\*1024/);
assert.match(editor, /httpsCallable\('reservePortfolioAsset'\)/);
assert.match(model, /const encodeDraft/);
assert.match(model, /const decodeDraft/);
assert.match(html, /firebase-functions-compat\.js/);
assert.match(functions, /PORTFOLIO_STORAGE_LIMIT = 1024 \* 1024 \* 1024/);
assert.match(functions, /exports\.reservePortfolioAsset = onCall/);
assert.match(functions, /exports\.accountPortfolioAsset = onObjectFinalized/);
assert.match(functions, /exports\.releasePortfolioAsset = onObjectDeleted/);
assert.match(firestore, /match \/frame_portfolio_drafts\/\{uid\}/);
assert.match(firestore, /match \/frame_portfolios\/\{uid\}/);
assert.match(storage, /match \/frame-portfolios\/\{uid\}\/\{assetId\}/);

console.log('portfolio-beta-contract: 18 checks passed');
