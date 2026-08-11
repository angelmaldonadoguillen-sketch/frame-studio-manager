const assert = require('node:assert/strict');
const fs = require('node:fs');

const app = fs.readFileSync('app.jsx', 'utf8');
const routine = fs.readFileSync('routine.jsx', 'utf8');
const modal = fs.readFileSync('modal.jsx', 'utf8');
const firestore = fs.readFileSync('firestore.rules.v2', 'utf8');
const storage = fs.readFileSync('storage.rules', 'utf8');
const firebase = JSON.parse(fs.readFileSync('firebase.json', 'utf8'));

assert.doesNotMatch(app + routine, /collection\(['"]frame_config['"]\)/);
assert.match(routine, /frame_workspaces[\s\S]*daily_routine/);
assert.match(app, /includeMetadataChanges:\s*true/);
assert.match(app, /_hasPendingWrites/);
assert.match(firestore, /match \/config\/\{doc\}/);
assert.match(firestore, /'daily_routine'/);
assert.match(firestore, /match \/comments\/\{commentId\}/);
assert.doesNotMatch(modal, /batch\.set\(col\.doc\(c\.id\), c\)/);
assert.match(modal, /_legacy:\s*true/);
assert.match(storage, /match \/frame-covers\/\{projectId\}\/\{fileName\}/);
assert.match(storage, /match \/frame-descriptions\/\{projectId\}\/\{fileName\}/);
assert.match(storage, /status == 'active'/);
assert.equal(firebase.storage.rules, 'storage.rules');

console.log('security-contract: 13 checks passed');
