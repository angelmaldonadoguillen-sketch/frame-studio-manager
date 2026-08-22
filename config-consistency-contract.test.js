const fs = require('fs');
const assert = require('assert');

const app = fs.readFileSync('app.jsx', 'utf8');
const modal = fs.readFileSync('modal.jsx', 'utf8');
const views = fs.readFileSync('views.jsx', 'utf8');
const clients = fs.readFileSync('clients.jsx', 'utf8');
const functions = fs.readFileSync('functions/index.js', 'utf8');

assert.match(app, /filters: freshFilters\(\), search: '', sidebarFilter: 'all'/);
assert.match(app, /status: initialStatus/);
assert.match(app, /const availableTypes = customTypes\.length \? customTypes : PROJECT_TYPES/);
assert.match(app, /kanbanColumns=\{state\.kanbanColumns\}/);
assert.match(modal, /allStatuses\.map/);
assert.doesNotMatch(modal, /\(close\) => STATUSES\.map/);
assert.match(views, /allProjects = projects/);
assert.match(views, /projectCount=\{totalItems\.length\}/);
assert.match(views, /allProjects\.filter\(x => x\.status === statusId\)/);
assert.match(clients, /columns\.length \? columns/);
assert.match(app, /startDate: today, sessionDate: today/);
assert.match(functions, /completedStatuses\.has\(data\.status\)/);
assert.match(functions, /startDate: today/);
assert.match(app, /columns: \[\.\.\.columns, sourceStatus\]/);
assert.match(app, /localStorage\.removeItem\(storageKey\)/);

console.log('config-consistency-contract: 15 checks passed');
