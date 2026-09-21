// Banco de pruebas de las vistas del tablero, sin Firestore ni CDN: sirve los
// archivos reales de FRAME compilados con el Babel local y los monta con datos
// de mentira. Lo usa board-motion.test.cjs para mirar cómo se mueven las
// tarjetas entre columnas, días y filas.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const root = __dirname;
const deps = process.env.FRAME_TEST_DEPS || 'C:/Users/ANGEL M/Documents/TOONED-OS/node_modules';
const babel = require(path.join(deps, '@babel/standalone'));

// Los mismos archivos que carga index.html, en el mismo orden.
const FUENTES = ['icons.jsx', 'data.jsx', 'modal.jsx', 'views.jsx'];

const MONTAJE = `
  const hoy = new Date();
  // Con ?bandeja el banco simula Mi tablero: dos tableros, y tarjetas del otro
  // metidas acá adentro —una con un estado que este tablero no tiene—.
  const BANDEJA = new URLSearchParams(location.search).has('bandeja');
  const NOMBRES = { wsA:'Mi tablero', wsB:'Estudio Norte' };
  if (BANDEJA) window.__frameBoards = { activeId:'wsA', names:NOMBRES };
  const MIAS = STATUSES.filter(s => s.id !== 'archived');
  const AJENAS = { wsB: [...MIAS, { id:'rodaje', label:'Rodaje', color:'#f5a524' }] };
  const dia = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return localISO(d); };
  const lista = (n, hechos) => Array.from({length:n}, (_, i) => ({ id:'c'+i, text:'Paso '+(i+1), done: i < hechos }));
  window.__liveTeam = [
    { id:'u1', name:'Angel Maldonado', initials:'AM', color:'#d4ff4f', status:'active' },
    { id:'u2', name:'Ronal Banegas',   initials:'RB', color:'#ff7a59', status:'active' },
  ];
  const BASE = [
    { id:'p1', title:'Reel — ID Motos Nacaome', client:'ID Motos', type:'reel', status:'editing',
      priority:'high', assignees:['u1'], deadline:dia(-2), sessionDate:dia(0), budget:8500, currency:'USD',
      tags:['publicidad'], checklist:lista(13,8), cover:{type:'color',value:'#252527'}, description:[] },
    { id:'p2', title:'Carrusel lanzamiento', client:'Tooned HN', type:'campaign', status:'editing',
      priority:'medium', assignees:['u1'], deadline:dia(0), sessionDate:dia(0), budget:0, currency:'USD',
      tags:['redes'], checklist:lista(10,9), cover:{type:'color',value:'#252527'}, description:[] },
    { id:'p3', title:'Institucional — Clínica Vega', client:'Clínica Vega', type:'corp', status:'producing',
      priority:'high', assignees:['u2'], deadline:dia(3), sessionDate:dia(1), budget:14000, currency:'USD',
      tags:['corporativo'], checklist:lista(12,3), cover:{type:'color',value:'#252527'}, description:[] },
    { id:'p4', title:'Behind the scenes', client:'Interno', type:'reel', status:'briefing',
      priority:'low', assignees:[], deadline:dia(18), sessionDate:dia(2), budget:0, currency:'USD',
      tags:[], checklist:lista(10,1), cover:{type:'color',value:'#252527'}, description:[] },
  ].map(p => ({ ...p, workspaceId:'wsA', workspaceIds:['wsA'] })).map(normalizeProject);

  // Dos tarjetas del otro tablero: una en una columna que existe en los dos,
  // y otra en una que sólo existe allá.
  const AJENAS_TARJETAS = [
    { id:'p5', title:'Spot — Estudio Norte', client:'Norte', type:'corp', status:'editing',
      priority:'medium', assignees:['u2'], deadline:dia(4), sessionDate:dia(1), budget:0, currency:'USD',
      tags:[], checklist:lista(6,2), cover:{type:'color',value:'#252527'}, description:[] },
    { id:'p6', title:'Rodaje exteriores', client:'Norte', type:'reel', status:'rodaje',
      priority:'high', assignees:['u2'], deadline:dia(6), sessionDate:dia(2), budget:0, currency:'USD',
      tags:[], checklist:lista(4,1), cover:{type:'color',value:'#252527'}, description:[] },
  ].map(p => ({ ...p, workspaceId:'wsB', workspaceIds:['wsB'] })).map(normalizeProject);

  const CAMPOS = { tipo:true, cliente:true, estado:true, prioridad:true, responsables:true, deadline:true, presupuesto:true, tags:true, progreso:true };

  const Banco = () => {
    const [datos, setDatos] = React.useState(BANDEJA ? [...BASE, ...AJENAS_TARJETAS] : BASE);
    // Igual que la app: getStatus lee este global, así que la columna prestada
    // tiene que estar ahí o la tarjeta ajena sale con el nombre de otra.
    const COLUMNAS = BANDEJA ? boardColumns(MIAS, datos, AJENAS, NOMBRES) : MIAS;
    window.FRAME_KANBAN_COLUMNS = COLUMNAS;
    const [vista, setVista] = React.useState(new URLSearchParams(location.search).get('vista') || 'tablero');
    // La prueba mueve tarjetas desde afuera, igual que haría soltar una.
    window.__moverEstado = (id, status) => setDatos(d => d.map(p => p.id === id ? { ...p, status } : p));
    window.__moverFecha  = (id, fecha)  => setDatos(d => d.map(p => p.id === id ? { ...p, sessionDate: fecha } : p));
    window.__reordenar   = (ids)        => setDatos(d => ids.map(id => d.find(p => p.id === id)));
    const porFecha = {};
    datos.forEach(p => { const f = p.sessionDate || p.deadline; (porFecha[f] = porFecha[f] || []).push(p); });
    const comunes = { projects: datos, onOpenProject: () => {}, onDeleteProject: () => {}, onDuplicateProject: () => {}, onToggleFavorite: () => {}, previewFields: CAMPOS };
    return (
      <CardEditingContext.Provider value={{ columns: STATUSES, types: PROJECT_TYPES, members: [], shared: false, update: () => {} }}>
        <div style={{ height:'100vh', display:'flex', flexDirection:'column' }}>
          <div style={{ display:'flex', gap:6, padding:8, borderBottom:'1px solid var(--border)' }}>
            {['tablero','calendario','galeria','lista'].map(v => (
              <button key={v} data-vista={v} onClick={() => setVista(v)}
                style={{ padding:'4px 10px', borderRadius:6, background: vista===v ? 'var(--surface-3)' : 'var(--surface-2)', color:'var(--text)', fontSize:12 }}>{v}</button>
            ))}
          </div>
          <div style={{ flex:1, minHeight:0 }}>
            {vista === 'tablero' && <KanbanView {...comunes} allProjects={datos} columns={COLUMNAS} onUpdateColumn={() => {}} onReorderColumns={() => {}} onUpdateProject={p => setDatos(d => d.map(x => x.id===p.id ? p : x))} />}
            {vista === 'calendario' && <CalendarView {...comunes} onUpdateProject={p => setDatos(d => d.map(x => x.id===p.id ? p : x))} />}
            {vista === 'galeria' && <GalleryView {...comunes} />}
            {vista === 'lista' && <ListView {...comunes} />}
          </div>
        </div>
      </CardEditingContext.Provider>
    );
  };
  ReactDOM.createRoot(document.getElementById('root')).render(<Banco />);
`;

const createServer = () => http.createServer((request, response) => {
  const url = new URL(request.url, 'http://localhost');
  const estaticos = {
    '/react.js': path.join(deps, 'react/umd/react.production.min.js'),
    '/react-dom.js': path.join(deps, 'react-dom/umd/react-dom.production.min.js'),
    '/style.css': path.join(root, 'frame.css'),
  };
  if (estaticos[url.pathname]) {
    response.setHeader('Content-Type', url.pathname.endsWith('css') ? 'text/css' : 'text/javascript');
    return response.end(fs.readFileSync(estaticos[url.pathname]));
  }
  if (url.pathname === '/app.js') {
    response.setHeader('Content-Type', 'text/javascript');
    const fuente = FUENTES.map(file => fs.readFileSync(path.join(root, file), 'utf8')).join('\n') + MONTAJE;
    return response.end(babel.transform(fuente, { presets: ['react'] }).code);
  }
  if (url.pathname !== '/') { response.writeHead(404); return response.end(); }
  response.setHeader('Content-Type', 'text/html; charset=utf-8');
  response.end('<!doctype html><html lang="es"><head><meta charset="utf-8"><title>FRAME — banco del tablero</title>'
    + '<link rel="stylesheet" href="/style.css"><style>body{margin:0;background:var(--bg);color:var(--text);font:13px/1.45 system-ui}button{cursor:pointer;font:inherit;color:inherit;background:none;border:0}'
    + ".h-full{height:100%}.w-full{width:100%}.min-w-0{min-width:0}.min-h-0{min-height:0}.flex{display:flex}\n.flex-col{flex-direction:column}.flex-1{flex:1 1 0%}.flex-shrink-0{flex-shrink:0}.flex-wrap{flex-wrap:wrap}\n.items-center{align-items:center}.items-start{align-items:flex-start}.items-baseline{align-items:baseline}\n.justify-between{justify-content:space-between}.justify-center{justify-content:center}\n.gap-1{gap:4px}.gap-1\\.5{gap:6px}.gap-2{gap:8px}.gap-2\\.5{gap:10px}.gap-3{gap:12px}.gap-4{gap:16px}\n.p-1\\.5{padding:6px}.p-2{padding:8px}.p-4{padding:16px}.p-6{padding:24px}.p-8{padding:32px}\n.px-3{padding-left:12px;padding-right:12px}.py-3{padding-top:12px;padding-bottom:12px}\n.px-5{padding-left:20px;padding-right:20px}.mb-1{margin-bottom:4px}.mt-2{margin-top:8px}\n.space-y-1\\.5>*+*{margin-top:6px}.space-y-2>*+*{margin-top:8px}.space-y-3>*+*{margin-top:12px}\n.overflow-x-auto{overflow-x:auto}.overflow-y-auto{overflow-y:auto}.overflow-hidden{overflow:hidden}.overflow-auto{overflow:auto}\n.relative{position:relative}.absolute{position:absolute}.sticky{position:sticky}.top-0{top:0}\n.grid{display:grid}.grid-cols-7{grid-template-columns:repeat(7,minmax(0,1fr))}\n.rounded-xl{border-radius:12px}.rounded-lg{border-radius:8px}.border{border-width:1px;border-style:solid}\n.border-b{border-bottom-width:1px;border-bottom-style:solid}.border-r{border-right-width:1px;border-right-style:solid}\n.w-\\[280px\\]{width:280px}.min-h-\\[110px\\]{min-height:110px}.max-w-3xl{max-width:768px}.mx-auto{margin-left:auto;margin-right:auto}\n.truncate{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.text-left{text-align:left}\ntable{width:100%;border-collapse:collapse}" + '</style>'
    + '</head><body><div id="root"></div><script src="/react.js"></script><script src="/react-dom.js"></script><script src="/app.js"></script></body></html>');
});

module.exports = { createServer };
if (require.main === module) createServer().listen(4186, '127.0.0.1', () => console.log('Banco del tablero: http://127.0.0.1:4186'));
