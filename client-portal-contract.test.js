const fs = require('fs');
const assert = require('assert');

const portal = fs.readFileSync('portal.jsx', 'utf8');
const app = fs.readFileSync('app.jsx', 'utf8');
const clients = fs.readFileSync('clients.jsx', 'utf8');
const rules = fs.readFileSync('firestore.rules.v2', 'utf8');
const index = fs.readFileSync('index.html', 'utf8');
let checks = 0;
const check = (value, message) => { assert.ok(value, message); checks += 1; };

check(index.includes('src="portal.jsx"'), 'el portal debe cargarse antes de montar la app');
check(app.includes('portalToken ? <ClientPortal'), 'el enlace debe abrir el portal sin entrar al gestor');
check(portal.includes('crypto.getRandomValues'), 'el token debe usar entropía criptográfica');
check(portal.includes("filter(project => String(project.client"), 'el portal debe limitarse al cliente correcto');
check(portal.includes('project.clientVisible !== false'), 'las tareas del cliente deben publicarse salvo exclusión explícita');
check(fs.readFileSync('data.jsx', 'utf8').includes('clientVisible: p.clientVisible !== false'), 'los documentos anteriores deben ser visibles por compatibilidad');
check(!portal.includes('comments:'), 'la proyección no debe exponer comentarios internos');
check(!portal.includes('budget:'), 'la proyección no debe exponer presupuesto');
check(!portal.includes('assignees:'), 'la proyección no debe exponer responsables');
check(clients.includes('Publicar portal'), 'el perfil debe permitir publicar el portal');
check(clients.includes("p.clientVisible !== false ? 'Visible' : 'Oculta'"), 'cada tarea debe mostrar su visibilidad');
check(rules.includes('match /frame_client_portals/{token}'), 'las reglas deben cubrir la colección nueva');
check(rules.includes('allow get: if resource.data.published == true'), 'sólo un portal publicado debe ser legible');
check(rules.includes('allow list: if false'), 'nadie debe enumerar portales');
check(rules.includes('data.tasks.size() <= 100'), 'la proyección debe tener un límite');
check(rules.includes("data.keys().hasOnly(['workspaceId', 'clientId', 'clientName', 'studioName', 'published', 'updatedAt', 'tasks'])"), 'el documento público debe rechazar campos privados');

console.log(`client-portal-contract: ${checks} checks passed`);
