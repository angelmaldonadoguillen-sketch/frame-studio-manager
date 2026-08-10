// ─────────────────────────────────────────────────────────────────
// SEED DATA — content studio sample dataset (May 2026)
// ─────────────────────────────────────────────────────────────────

const USERS = [
  { id: 'u1', name: 'Lucía Mendoza',   role: 'Director',    initials: 'LM', color: '#D4FF4F' },
  { id: 'u2', name: 'Mateo Vargas',    role: 'Editor',      initials: 'MV', color: '#FF7A59' },
  { id: 'u3', name: 'Sofía Reyes',     role: 'Fotógrafa',   initials: 'SR', color: '#6CC4FF' },
  { id: 'u4', name: 'Diego Cruz',      role: 'Productor',   initials: 'DC', color: '#C089FF' },
  { id: 'u5', name: 'Ana Torres',      role: 'Asistente',   initials: 'AT', color: 'var(--warn)' },
];

const PROJECT_TYPES = [
  { id: 'reel',     label: 'Reel',              color: '#C089FF', icon: 'film' },
  { id: 'photo',    label: 'Fotografía',        color: '#6CC4FF', icon: 'camera' },
  { id: 'corp',     label: 'Video corporativo', color: '#7DD3C0', icon: 'briefcase' },
  { id: 'campaign', label: 'Campaign',          color: '#FF7A59', icon: 'zap' },
  { id: 'bts',      label: 'BTS',               color: 'var(--warn)', icon: 'film' },
  { id: 'podcast',  label: 'Podcast',           color: '#FB7185', icon: 'mic' },
  { id: 'other',    label: 'Otro',              color: '#9A9AA3', icon: 'folder' },
];

const STATUSES = [
  { id: 'briefing',  label: 'Briefing',           color: '#9A9AA3' },
  { id: 'producing', label: 'En producción',      color: 'var(--warn)' },
  { id: 'editing',   label: 'Edición',            color: '#6CC4FF' },
  { id: 'review',    label: 'Revisión cliente',   color: '#C089FF' },
  { id: 'delivered', label: 'Entregado',          color: '#7DD3C0' },
  { id: 'archived',  label: 'Archivado',          color: '#62626B' },
];

const PRIORITIES = [
  { id: 'high',   label: 'Alta',  color: 'var(--danger)' },
  { id: 'medium', label: 'Media', color: 'var(--warn)' },
  { id: 'low',    label: 'Baja',  color: '#7DD3C0' },
];

// Fecha actual real
const TODAY = new Date();

// ── Fecha ISO en hora LOCAL ──────────────────────────────────────
// toISOString() convierte a UTC antes de formatear, así que en cualquier
// zona al oeste de Greenwich devuelve el día siguiente a partir de cierta
// hora de la tarde (en Honduras, UTC-6, desde las 18:00). Una tarjeta
// creada de noche quedaba fechada al día equivocado.
//
// Vive acá porque data.jsx es el primer archivo que carga; el resto de la
// app lo usa desde este punto en adelante.
const localISO = (dt) => {
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const day = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const d = (offset) => {
  const dt = new Date(TODAY);
  dt.setDate(dt.getDate() + offset);
  return localISO(dt);
};

const COVER_IMAGES = {
  // Use Unsplash source URLs as covers — falls back gracefully
  campaign:  'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=70',
  corp:      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=70',
  bts:       'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=70',
  podcast:   'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=1200&q=70',
  reels:     'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=1200&q=70',
  product:   'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1200&q=70',
  fashion:   'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=70',
  music:     'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1200&q=70',
};

const SEED_PROJECTS = [
  {
    id: 'p1',
    title: 'Campaña de Lanzamiento — Marca Volcán',
    client: 'Volcán Activewear',
    type: 'campaign',
    status: 'producing',
    priority: 'high',
    assignees: ['u1', 'u3', 'u4'],
    startDate: d(-8),
    deadline: d(2),
    sessionDate: d(1),
    budget: 24000,
    currency: 'USD',
    tags: ['lanzamiento', 'multiformato', 'top-tier'],
    cover: { type: 'image', value: COVER_IMAGES.campaign },
    description: [
      { type: 'p', text: 'Campaña 360 para el lanzamiento de la nueva línea técnica de Volcán. Mix de reel hero + serie de fotografía editorial + cortes para paid social.' },
      { type: 'b', text: 'Entregables clave' },
      { type: 'ul', items: ['1× Reel hero 60s', '12× Fotografías editoriales', '6× Cortes verticales 9:16', 'BTS 30s'] },
    ],
    checklist: [
      { id: 'c1', text: 'Pre-producción y moodboard aprobado', done: true },
      { id: 'c2', text: 'Casting de talento confirmado', done: true },
      { id: 'c3', text: 'Scout de locación', done: true },
      { id: 'c4', text: 'Día de rodaje — Sesión principal', done: false },
      { id: 'c5', text: 'Edición v1 reel hero', done: false },
      { id: 'c6', text: 'Color grading', done: false },
      { id: 'c7', text: 'Selección y retoque fotográfico', done: false },
      { id: 'c8', text: 'Entrega final master + cortes', done: false },
    ],
    deliverables: [
      { id: 'd1', name: 'Reel hero 60s — master 4K', kind: 'video', status: 'pending' },
      { id: 'd2', name: 'Pack fotos editoriales (RAW + retoque)', kind: 'photos', status: 'pending' },
      { id: 'd3', name: 'Cortes verticales x6', kind: 'video', status: 'pending' },
    ],
    timeline: [
      { id: 't1', label: 'Kickoff con cliente', date: d(-12), status: 'done' },
      { id: 't2', label: 'Aprobación moodboard', date: d(-7), status: 'done' },
      { id: 't3', label: 'Día de rodaje', date: d(1),  status: 'pending' },
      { id: 't4', label: 'Entrega final',   date: d(2),  status: 'pending' },
    ],
    comments: [
      { id: 'cm1', userId: 'u4', text: 'Confirmé locación para el viernes. Llegamos 6am para luz dorada.', at: d(-2) + 'T09:24' },
      { id: 'cm2', userId: 'u1', text: '@Mateo Vargas ojo con el ratio de cortes verticales — el cliente quiere también 4:5.', at: d(-1) + 'T16:12' },
      { id: 'cm3', userId: 'u2', text: 'Perfecto, agrego 4:5 a la lista de exports.', at: d(-1) + 'T17:02' },
      { id: 'cm4', userId: 'u3', text: 'Subí el moodboard final v3 a la carpeta compartida 📎', at: d(0) + 'T11:48' },
    ],
  },

  {
    id: 'p2',
    title: 'Video Corporativo — Holding Norte',
    client: 'Holding Norte',
    type: 'corp',
    status: 'editing',
    priority: 'medium',
    assignees: ['u2', 'u4'],
    startDate: d(-20),
    deadline: d(5),
    sessionDate: d(-10),
    budget: 8500,
    currency: 'USD',
    tags: ['B2B', 'institucional'],
    cover: { type: 'image', value: COVER_IMAGES.corp },
    description: [
      { type: 'p', text: 'Pieza institucional 2:30 sobre los 25 años de la compañía. Mix de entrevistas con directivos + b-roll de operaciones.' },
    ],
    checklist: [
      { id: 'c1', text: 'Guion aprobado por comunicación', done: true },
      { id: 'c2', text: 'Rodaje entrevistas (3 directivos)', done: true },
      { id: 'c3', text: 'Captura de b-roll planta + oficinas', done: true },
      { id: 'c4', text: 'Edición v1', done: true },
      { id: 'c5', text: 'Color + sonido', done: false },
      { id: 'c6', text: 'Subtitulado ES/EN', done: false },
    ],
    deliverables: [
      { id: 'd1', name: 'Master 2:30 — 4K', kind: 'video', status: 'pending' },
      { id: 'd2', name: 'Versión sin subtítulos', kind: 'video', status: 'pending' },
      { id: 'd3', name: 'Cortes 30s para LinkedIn', kind: 'video', status: 'pending' },
    ],
    timeline: [
      { id: 't1', label: 'Aprobación guion', date: d(-18), status: 'done' },
      { id: 't2', label: 'Rodaje',           date: d(-10), status: 'done' },
      { id: 't3', label: 'Revisión interna v1', date: d(-1), status: 'done' },
      { id: 't4', label: 'Entrega final',    date: d(5),  status: 'pending' },
    ],
    comments: [
      { id: 'cm1', userId: 'u4', text: 'Recibido feedback del cliente — pidió bajar la música en la intro.', at: d(-1) + 'T14:00' },
      { id: 'cm2', userId: 'u2', text: 'Hecho. v2 lista para revisión interna.', at: d(0) + 'T10:30' },
    ],
  },

  {
    id: 'p3',
    title: 'BTS Colección Otoño — Studio Lumen',
    client: 'Studio Lumen',
    type: 'bts',
    status: 'review',
    priority: 'medium',
    assignees: ['u2', 'u3'],
    startDate: d(-14),
    deadline: d(0),
    sessionDate: d(-12),
    budget: 3200,
    currency: 'USD',
    tags: ['fashion', 'BTS'],
    cover: { type: 'image', value: COVER_IMAGES.fashion },
    description: [
      { type: 'p', text: 'Documental corto detrás de cámaras de la sesión de la nueva colección Otoño. Estética fílmica, super 16 simulado.' },
    ],
    checklist: [
      { id: 'c1', text: 'Briefing creativo', done: true },
      { id: 'c2', text: 'Día de rodaje BTS', done: true },
      { id: 'c3', text: 'Selecta', done: true },
      { id: 'c4', text: 'Edición v1', done: true },
      { id: 'c5', text: 'Revisión cliente — round 1', done: true },
      { id: 'c6', text: 'Revisión cliente — round 2', done: false },
      { id: 'c7', text: 'Master final', done: false },
    ],
    deliverables: [
      { id: 'd1', name: 'BTS 90s — versión cliente', kind: 'video', status: 'ready' },
      { id: 'd2', name: 'Master final aprobado', kind: 'video', status: 'pending' },
    ],
    timeline: [
      { id: 't1', label: 'Rodaje BTS',     date: d(-12), status: 'done' },
      { id: 't2', label: 'Revisión cliente', date: d(-3),  status: 'done' },
      { id: 't3', label: 'Entrega master',  date: d(0),   status: 'pending' },
    ],
    comments: [
      { id: 'cm1', userId: 'u3', text: 'El cliente pidió un par de cambios menores en el tercer acto.', at: d(-2) + 'T15:30' },
      { id: 'cm2', userId: 'u1', text: '@Mateo Vargas dale prioridad — entrega es hoy.', at: d(0) + 'T08:15' },
    ],
  },

  {
    id: 'p4',
    title: 'Podcast mensual — Episodio 12',
    client: 'Tinta Negra',
    type: 'podcast',
    status: 'producing',
    priority: 'low',
    assignees: ['u4', 'u5'],
    startDate: d(-3),
    deadline: d(8),
    sessionDate: d(3),
    budget: 1800,
    currency: 'USD',
    tags: ['recurrente', 'audio+video'],
    cover: { type: 'color', value: '#1a1a1f' },
    description: [
      { type: 'p', text: 'Episodio 12 de la serie mensual. Invitada confirmada: Carla Iturri (arquitecta). Set 3 cámaras + audio multipista.' },
    ],
    checklist: [
      { id: 'c1', text: 'Confirmación invitada', done: true },
      { id: 'c2', text: 'Preparar set y luces', done: false },
      { id: 'c3', text: 'Grabación (90 min)', done: false },
      { id: 'c4', text: 'Edición video + audio', done: false },
      { id: 'c5', text: 'Cortes para redes (5×)', done: false },
      { id: 'c6', text: 'Publicación plataformas', done: false },
    ],
    deliverables: [
      { id: 'd1', name: 'Episodio completo 60min', kind: 'video', status: 'pending' },
      { id: 'd2', name: 'Audio master MP3', kind: 'audio', status: 'pending' },
      { id: 'd3', name: '5× cortes verticales 60s', kind: 'video', status: 'pending' },
    ],
    timeline: [
      { id: 't1', label: 'Grabación',  date: d(3), status: 'pending' },
      { id: 't2', label: 'Publicación', date: d(8), status: 'pending' },
    ],
    comments: [
      { id: 'cm1', userId: 'u5', text: 'Carla confirmó horario para el lunes 10am. Llegará 9:30.', at: d(-1) + 'T13:20' },
    ],
  },

  {
    id: 'p5',
    title: 'Reels Redes Sociales — Paquete Mayo',
    client: 'Café Origen',
    type: 'reel',
    status: 'producing',
    priority: 'high',
    assignees: ['u1', 'u2'],
    startDate: d(-5),
    deadline: d(4),
    sessionDate: d(-2),
    budget: 4200,
    currency: 'USD',
    tags: ['social', 'paquete', 'mensual'],
    cover: { type: 'image', value: COVER_IMAGES.reels },
    description: [
      { type: 'p', text: 'Paquete mensual de 8 reels para Instagram + TikTok. Mix de producto + lifestyle + recetas.' },
    ],
    checklist: [
      { id: 'c1', text: 'Calendario editorial mayo', done: true },
      { id: 'c2', text: 'Sesión de grabación (8 piezas)', done: true },
      { id: 'c3', text: 'Edición lote 1 (4 reels)', done: true },
      { id: 'c4', text: 'Edición lote 2 (4 reels)', done: false },
      { id: 'c5', text: 'Aprobación cliente', done: false },
      { id: 'c6', text: 'Programación en Later', done: false },
    ],
    deliverables: [
      { id: 'd1', name: '8× Reels 9:16 — 30 a 45s', kind: 'video', status: 'pending' },
      { id: 'd2', name: 'Subtítulos burned-in', kind: 'video', status: 'pending' },
    ],
    timeline: [
      { id: 't1', label: 'Sesión rodaje',  date: d(-2), status: 'done' },
      { id: 't2', label: 'Entrega cliente', date: d(4), status: 'pending' },
    ],
    comments: [
      { id: 'cm1', userId: 'u2', text: 'Subí los 4 primeros a la carpeta de revisión.', at: d(0) + 'T09:00' },
      { id: 'cm2', userId: 'u1', text: 'Buenísimos. @Sofía Reyes ¿puedes revisar el color del reel 03? Está un toque cálido.', at: d(0) + 'T10:14' },
      { id: 'cm3', userId: 'u3', text: 'Mirando ahora — ajusto el WB y subo de nuevo.', at: d(0) + 'T10:42' },
    ],
  },

  {
    id: 'p6',
    title: 'Fotografía de producto — Línea Premium',
    client: 'Atelier Sur',
    type: 'photo',
    status: 'briefing',
    priority: 'medium',
    assignees: ['u3', 'u5'],
    startDate: d(0),
    deadline: d(12),
    sessionDate: d(6),
    budget: 5600,
    currency: 'USD',
    tags: ['producto', 'estudio'],
    cover: { type: 'image', value: COVER_IMAGES.product },
    description: [
      { type: 'p', text: 'Sesión de producto en estudio para la nueva línea premium. 24 SKUs, fondo neutro + lifestyle minimalista.' },
    ],
    checklist: [
      { id: 'c1', text: 'Recibir muestras de producto', done: false },
      { id: 'c2', text: 'Definir paleta y referencias', done: false },
      { id: 'c3', text: 'Sesión estudio día 1 (12 SKUs)', done: false },
      { id: 'c4', text: 'Sesión estudio día 2 (12 SKUs)', done: false },
      { id: 'c5', text: 'Selección + retoque', done: false },
      { id: 'c6', text: 'Entrega ecommerce + redes', done: false },
    ],
    deliverables: [
      { id: 'd1', name: '24× fotos producto fondo neutro', kind: 'photos', status: 'pending' },
      { id: 'd2', name: '12× fotos lifestyle', kind: 'photos', status: 'pending' },
    ],
    timeline: [
      { id: 't1', label: 'Briefing creativo', date: d(0), status: 'pending' },
      { id: 't2', label: 'Sesión',            date: d(6), status: 'pending' },
      { id: 't3', label: 'Entrega final',     date: d(12), status: 'pending' },
    ],
    comments: [],
  },

  {
    id: 'p7',
    title: 'Video Musical — Tonia "Aurora"',
    client: 'Sello Norte',
    type: 'reel',
    status: 'review',
    priority: 'high',
    assignees: ['u1', 'u2', 'u4'],
    startDate: d(-25),
    deadline: d(1),
    sessionDate: d(-15),
    budget: 18500,
    currency: 'USD',
    tags: ['music-video', 'narrativo'],
    cover: { type: 'image', value: COVER_IMAGES.music },
    description: [
      { type: 'p', text: 'Video musical narrativo 3:40 para el single "Aurora". Locación: dunas + casa abandonada. VFX ligeros.' },
    ],
    checklist: [
      { id: 'c1', text: 'Storyboard aprobado', done: true },
      { id: 'c2', text: 'Casting + locaciones', done: true },
      { id: 'c3', text: 'Rodaje 2 días', done: true },
      { id: 'c4', text: 'Edición v1', done: true },
      { id: 'c5', text: 'VFX + color', done: true },
      { id: 'c6', text: 'Aprobación artista', done: false },
      { id: 'c7', text: 'Master final', done: false },
    ],
    deliverables: [
      { id: 'd1', name: 'Master 4K — versión completa', kind: 'video', status: 'pending' },
      { id: 'd2', name: 'Vertical 9:16', kind: 'video', status: 'pending' },
    ],
    timeline: [
      { id: 't1', label: 'Rodaje',           date: d(-15), status: 'done' },
      { id: 't2', label: 'Aprobación artista', date: d(0), status: 'pending' },
      { id: 't3', label: 'Entrega',          date: d(1),  status: 'pending' },
    ],
    comments: [
      { id: 'cm1', userId: 'u1', text: 'Mandé v3 a Tonia ayer. Espero feedback hoy.', at: d(-1) + 'T20:10' },
      { id: 'cm2', userId: 'u4', text: 'El sello pidió ver una versión sin el plano de las dunas en el minuto 2:10.', at: d(0) + 'T07:45' },
      { id: 'cm3', userId: 'u2', text: 'Listo, hago el corte alternativo y lo subo en 1h.', at: d(0) + 'T08:30' },
    ],
  },

  {
    id: 'p8',
    title: 'Documental corto — Oficios del Sur',
    client: 'Fundación Raíz',
    type: 'corp',
    status: 'delivered',
    priority: 'low',
    assignees: ['u1', 'u3', 'u5'],
    startDate: d(-60),
    deadline: d(-3),
    sessionDate: d(-40),
    budget: 12000,
    currency: 'USD',
    tags: ['documental', 'fundación'],
    cover: { type: 'image', value: COVER_IMAGES.bts },
    description: [
      { type: 'p', text: 'Documental 8 minutos sobre oficios tradicionales del sur. Tres capítulos, narración off, música original.' },
    ],
    checklist: [
      { id: 'c1', text: 'Investigación', done: true },
      { id: 'c2', text: 'Rodaje en terreno (2 semanas)', done: true },
      { id: 'c3', text: 'Edición + narración', done: true },
      { id: 'c4', text: 'Música original', done: true },
      { id: 'c5', text: 'Entrega', done: true },
    ],
    deliverables: [
      { id: 'd1', name: 'Master 8min — 4K', kind: 'video', status: 'ready' },
      { id: 'd2', name: 'Trailer 60s', kind: 'video', status: 'ready' },
    ],
    timeline: [
      { id: 't1', label: 'Rodaje',  date: d(-40), status: 'done' },
      { id: 't2', label: 'Entrega', date: d(-3),  status: 'done' },
    ],
    comments: [
      { id: 'cm1', userId: 'u1', text: 'Cliente súper feliz. Posible segunda temporada.', at: d(-2) + 'T18:00' },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────

const getUser   = (id) => {
  const live = window.__liveTeam;
  if (live) { const u = live.find(u => u.id === id); if (u) return u; }
  return USERS.find(u => u.id === id) || null;
};
// FRAME_CUSTOM_TYPES tiene prioridad — puede sobreescribir color/label de tipos default
const getType   = (id) => (window.FRAME_CUSTOM_TYPES || []).find(t => t.id === id) || PROJECT_TYPES.find(t => t.id === id) || PROJECT_TYPES[PROJECT_TYPES.length - 1];
const getStatus = (id) => STATUSES.find(s => s.id === id) || STATUSES[0];
const getPrio   = (id) => PRIORITIES.find(p => p.id === id) || PRIORITIES[0];

const fmtMoney = (n, c = 'USD') => new Intl.NumberFormat('en-US', { style: 'currency', currency: c, maximumFractionDigits: 0 }).format(n);
const fmtDate  = (iso) => {
  const dt = new Date(iso + 'T00:00');
  return dt.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
};
const fmtDateLong = (iso) => {
  const dt = new Date(iso + 'T00:00');
  return dt.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
};

const daysUntil = (iso) => {
  const dt = new Date(iso + 'T00:00');
  const today = new Date(TODAY); today.setHours(0,0,0,0);
  return Math.round((dt - today) / 86400000);
};

const relativeTime = (isoDateTime) => {
  const dt = new Date(isoDateTime);
  const diff = (TODAY.getTime() + (TODAY.getHours()*3600 + 12*3600)*1000 - dt.getTime()) / 1000;
  // Use a stable "now" relative to TODAY noon
  const ref = new Date(TODAY); ref.setHours(14, 0, 0, 0);
  const diffSec = (ref.getTime() - dt.getTime()) / 1000;
  if (diffSec < 60) return 'ahora';
  if (diffSec < 3600) return `hace ${Math.floor(diffSec/60)} min`;
  if (diffSec < 86400) return `hace ${Math.floor(diffSec/3600)} h`;
  const days = Math.floor(diffSec/86400);
  if (days < 7) return `hace ${days} d`;
  return new Date(isoDateTime).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
};

const progressOf = (project) => {
  if (!project.checklist?.length) return 0;
  return Math.round((project.checklist.filter(c => c.done).length / project.checklist.length) * 100);
};

Object.assign(window, {
  USERS, PROJECT_TYPES, STATUSES, PRIORITIES, SEED_PROJECTS, COVER_IMAGES,
  TODAY, d,
  getUser, getType, getStatus, getPrio,
  fmtMoney, fmtDate, fmtDateLong, daysUntil, relativeTime, progressOf,
});
