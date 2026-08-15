const assert = require('node:assert/strict');
const fs = require('node:fs');

const app = fs.readFileSync('app.jsx', 'utf8');
const modal = fs.readFileSync('modal.jsx', 'utf8');
const rules = fs.readFileSync('firestore.rules.v2', 'utf8');
const storage = fs.readFileSync('storage.rules', 'utf8');

assert.match(rules, /allow update:\s+if memberOfExisting\(\) && memberOfIncoming\(\)/);
assert.match(storage, /projectDoc\.data\.workspaceId/);
assert.match(modal, /Trasladar a otro tablero/);
assert.match(modal, /workspaces\.filter\(w => w\.id !== project\.workspaceId/);
assert.match(app, /const handleMoveProject = async \(project, targetWorkspaceId\)/);
assert.match(app, /workspaceId: targetWorkspaceId/);
assert.match(app, /assignees: \(project\.assignees \|\| \[\]\)\.filter/);
assert.match(app, /status: targetStatus/);
assert.match(app, /types: \[\.\.\.targetTypes, sourceType\]/);
assert.match(app, /set_active_workspace', id: targetWorkspaceId/);

console.log('workspace-move-contract: 10 checks passed');
