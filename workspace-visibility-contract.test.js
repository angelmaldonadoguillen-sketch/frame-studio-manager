const assert = require('node:assert/strict');
const fs = require('node:fs');

const app = fs.readFileSync('app.jsx', 'utf8');
const modal = fs.readFileSync('modal.jsx', 'utf8');
const data = fs.readFileSync('data.jsx', 'utf8');
const rules = fs.readFileSync('firestore.rules.v2', 'utf8');
const storage = fs.readFileSync('storage.rules', 'utf8');

assert.match(data, /workspaceIds: Array\.isArray\(p\.workspaceIds\)/);
assert.match(data, /viewerIds:\s+Array\.isArray\(p\.viewerIds\)/);
assert.match(app, /where\('viewerIds', 'array-contains', authUser\.uid\)/);
assert.match(app, /project\.workspaceIds \|\| \[\]\)\.includes\(wsId\)/);
assert.match(app, /const handleSetProjectWorkspaces = async \(project, requestedIds\)/);
assert.match(app, /workspaceIds, viewerIds/);
assert.match(app, /sharedTaskIds:[\s\S]*firebase\.firestore\.FieldValue\.arrayUnion\(project\.id\)/);
assert.match(app, /viewerIds: firebase\.firestore\.FieldValue\.arrayUnion\(authUser\.uid\)/);
assert.match(app, /workspaceIds: \[wsId\]/);
assert.match(app, /Sólo el tablero principal puede eliminar esta tarea/);
assert.match(modal, /Mostrar esta tarea en/);
assert.match(modal, /Guardar tableros/);
assert.match(rules, /function hasProjectAccess\(data\)/);
assert.match(rules, /myUid\(\) in data\.viewerIds/);
assert.match(rules, /request\.resource\.data\.workspaceId == resource\.data\.workspaceId/);
assert.match(rules, /Sólo un miembro del tablero principal cambia la ACL/);
assert.match(rules, /request\.resource\.data\.viewerIds == resource\.data\.viewerIds\.concat\(\[myUid\(\)\]\)/);
assert.match(storage, /request\.auth\.uid in projectDoc\.data\.viewerIds/);
assert.doesNotMatch(app + modal, /handleMoveProject|onMoveWorkspace|Trasladar a otro tablero/);

console.log('workspace-visibility-contract: 19 checks passed');
