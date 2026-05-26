// ─────────────────────────────────────────────────────────────────
// APP — Sidebar + Header + Filters + Active view + Modal
// ─────────────────────────────────────────────────────────────────

const { useReducer, useEffect } = React;

// ── Initial state + reducer ─────────────────────────────────────
const initialState = {
  projects: [],
  loading: true,
  currentUserId: 'u1',
  view: 'kanban', // calendar | kanban | gallery | list
  search: '',
  filters: {
    status: [],   // status ids
    type: [],     // type ids
    assignee: [], // user ids
    priority: [], // priority ids
  },
  openProjectId: null,
  showNewProject: false,
};

function reducer(state, action) {
  switch (action.type) {
    case 'set_view':       return { ...state, view: action.view };
    case 'set_search':     return { ...state, search: action.value };
    case 'set_user':       return { ...state, currentUserId: action.id };
    case 'open_project':   return { ...state, openProjectId: action.id };
    case 'close_project':  return { ...state, openProjectId: null };
    case 'update_project': return {
      ...state,
      projects: state.projects.map(p => p.id === action.project.id ? action.project : p),
    };
    case 'create_project': return {
      ...state,
      projects: [action.project, ...state.projects],
      openProjectId: action.project.id,
      showNewProject: false,
    };
    case 'show_new':       return { ...state, showNewProject: true };
    case 'hide_new':       return { ...state, showNewProject: false };
    case 'toggle_filter': {
      const cur = state.filters[action.key];
      const next = cur.includes(action.value) ? cur.filter(x => x !== action.value) : [...cur, action.value];
      return { ...state, filters: { ...state.filters, [action.key]: next } };
    }
    case 'clear_filter':   return { ...state, filters: { ...state.filters, [action.key]: state.filters[action.key].filter(x => x !== action.value) } };
    case 'clear_all_filters': return { ...state, filters: { status: [], type: [], assignee: [], priority: [] }, search: '' };
    case 'set_projects':  return { ...state, projects: action.projects, loading: false };
    default: return state;
  }
}

// ── Sidebar ─────────────────────────────────────────────────────
const Sidebar = ({ state, dispatch }) => {
  const recentProjects = state.projects.slice(0, 5);
  const me = getUser(state.currentUserId);

  const counts = {
    all: state.projects.length,
    mine: state.projects.filter(p => p.assignees.includes(state.currentUserId)).length,
    urgent: state.projects.filter(p => {
      const d = daysUntil(p.deadline);
      return d >= 0 && d < 3 && p.status !== 'delivered' && p.status !== 'archived';
    }).length,
    delivered: state.projects.filter(p => p.status === 'delivered').length,
  };

  return (
    <aside className="w-[240px] flex-shrink-0 border-r border-app flex flex-col" style={{ background: 'var(--surface)' }}>
      {/* Logo */}
      <div className="px-5 py-5 border-b border-app">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent)' }}>
            <span className="font-display font-black text-lg" style={{ color: '#0a0a0b', letterSpacing: '-0.03em' }}>F</span>
          </div>
          <div>
            <div className="font-display font-bold text-[15px]" style={{ letterSpacing: '-0.02em' }}>FRAME</div>
            <div className="text-[9px] tracking-[0.2em] text-[var(--text-muted)] uppercase">Studio Manager</div>
          </div>
        </div>
      </div>

      {/* User selector */}
      <div className="px-3 py-3 border-b border-app">
        <Dropdown
          width={232}
          trigger={
            <button className="w-full flex items-center gap-2.5 p-2 rounded-md hover:bg-[var(--surface-2)]">
              <Avatar user={me} size={32} />
              <div className="flex-1 text-left min-w-0">
                <div className="text-[12.5px] font-semibold truncate">{me.name}</div>
                <div className="text-[10px] text-[var(--text-muted)]">{me.role}</div>
              </div>
              <Icon name="chevronDown" size={12} className="text-[var(--text-muted)]" />
            </button>
          }
        >
          {(close) => (
            <>
              <div className="text-[10px] tracking-[0.18em] uppercase text-[var(--text-muted)] px-2 py-1.5">Cambiar de usuario</div>
              {USERS.map(u => (
                <MenuItem key={u.id} active={u.id === state.currentUserId} onClick={() => { dispatch({ type: 'set_user', id: u.id }); close(); }}>
                  <Avatar user={u} size={22} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] truncate">{u.name}</div>
                    <div className="text-[10px] text-[var(--text-muted)]">{u.role}</div>
                  </div>
                  {u.id === state.currentUserId && <Icon name="check" size={12} style={{ color: 'var(--accent)' }} />}
                </MenuItem>
              ))}
            </>
          )}
        </Dropdown>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        <div className="text-[10px] tracking-[0.18em] uppercase text-[var(--text-muted)] px-2 py-1.5">Espacios</div>
        <NavItem icon="layers" label="Todos los proyectos" count={counts.all} active />
        <NavItem icon="users" label="Asignados a mí" count={counts.mine} />
        <NavItem icon="alert" label="Deadlines urgentes" count={counts.urgent} accent />
        <NavItem icon="check" label="Entregados" count={counts.delivered} />
        <NavItem icon="archive" label="Archivo" />

        <div className="text-[10px] tracking-[0.18em] uppercase text-[var(--text-muted)] px-2 py-1.5 mt-4">Trabajo</div>
        <NavItem icon="briefcase" label="Clientes" />
        <NavItem icon="users" label="Equipo" />
        <NavItem icon="folder" label="Archivos" />
        <NavItem icon="settings" label="Ajustes" />

        <div className="mt-5">
          <div className="flex items-center justify-between px-2 py-1.5">
            <div className="text-[10px] tracking-[0.18em] uppercase text-[var(--text-muted)]">Recientes</div>
            <Icon name="chevronDown" size={11} className="text-[var(--text-muted)]" />
          </div>
          <div className="space-y-0.5">
            {recentProjects.map(p => (
              <button
                key={p.id}
                onClick={() => dispatch({ type: 'open_project', id: p.id })}
                className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-md text-[12px] text-[var(--text-dim)] hover:text-white hover:bg-[var(--surface-2)] transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: getType(p.type).color }}></span>
                <span className="truncate">{p.title}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Team */}
      <div className="border-t border-app p-3">
        <div className="text-[10px] tracking-[0.18em] uppercase text-[var(--text-muted)] mb-2 px-1">Equipo en línea</div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {USERS.slice(0, 5).map(u => (
            <div key={u.id} className="relative" title={u.name}>
              <Avatar user={u} size={26} />
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full ring-2 ring-[var(--surface)]" style={{ background: '#7DD3C0' }}></span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

const NavItem = ({ icon, label, count, active, accent }) => (
  <button
    className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-[12.5px] transition-colors group ${active ? 'bg-[var(--surface-2)] text-white' : 'text-[var(--text-dim)] hover:text-white hover:bg-[var(--surface-2)]'}`}
  >
    <Icon name={icon} size={14} className={accent ? '' : ''} style={{ color: accent ? '#FF6B6B' : undefined }} />
    <span className="flex-1 text-left">{label}</span>
    {count !== undefined && (
      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${active ? 'bg-[var(--surface-3)] text-white' : 'text-[var(--text-muted)]'}`}>
        {count}
      </span>
    )}
  </button>
);

// ── Header ──────────────────────────────────────────────────────
const Header = ({ state, dispatch, filteredCount }) => {
  const me = getUser(state.currentUserId);
  const activeFilters = [
    ...state.filters.status.map(v => ({ key: 'status', value: v, label: getStatus(v).label, color: getStatus(v).color })),
    ...state.filters.type.map(v => ({ key: 'type', value: v, label: getType(v).label, color: getType(v).color })),
    ...state.filters.assignee.map(v => ({ key: 'assignee', value: v, label: getUser(v).name, color: getUser(v).color })),
    ...state.filters.priority.map(v => ({ key: 'priority', value: v, label: getPrio(v).label, color: getPrio(v).color })),
  ];

  return (
    <header className="border-b border-app">
      {/* Top row */}
      <div className="flex items-center gap-3 px-5 py-3">
        {/* View switcher */}
        <div className="flex items-center gap-0.5 p-0.5 rounded-md surface-2">
          {[
            { id: 'kanban',   icon: 'kanban',   label: 'Tablero' },
            { id: 'calendar', icon: 'calendar', label: 'Calendario' },
            { id: 'gallery',  icon: 'grid',     label: 'Galería' },
            { id: 'list',     icon: 'list',     label: 'Lista' },
          ].map(v => (
            <button
              key={v.id}
              onClick={() => dispatch({ type: 'set_view', view: v.id })}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[12px] font-medium transition-all ${state.view === v.id ? 'bg-[var(--surface-3)] text-white' : 'text-[var(--text-dim)] hover:text-white'}`}
            >
              <Icon name={v.icon} size={13} />
              <span>{v.label}</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md surface-2 flex-1 max-w-md">
          <Icon name="search" size={13} className="text-[var(--text-muted)]" />
          <input
            value={state.search}
            onChange={(e) => dispatch({ type: 'set_search', value: e.target.value })}
            placeholder="Buscar proyectos, clientes…"
            className="flex-1 text-[12.5px]"
          />
          {state.search && (
            <button onClick={() => dispatch({ type: 'set_search', value: '' })} className="text-[var(--text-muted)] hover:text-white">
              <Icon name="x" size={12} />
            </button>
          )}
        </div>

        {/* Filter dropdowns */}
        <FilterDropdown label="Estado" icon="dot" filterKey="status" options={STATUSES} state={state} dispatch={dispatch} />
        <FilterDropdown label="Tipo"   icon="film" filterKey="type"   options={PROJECT_TYPES} state={state} dispatch={dispatch} />
        <FilterDropdown label="Equipo" icon="users" filterKey="assignee" options={USERS.map(u => ({ id: u.id, label: u.name, color: u.color }))} state={state} dispatch={dispatch} />

        <div className="flex-1"></div>

        <button className="p-2 rounded-md hover:bg-[var(--surface-2)] text-[var(--text-dim)] hover:text-white relative">
          <Icon name="bell" size={15} />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }}></span>
        </button>

        <button
          onClick={() => dispatch({ type: 'show_new' })}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12.5px] font-semibold transition-all hover:brightness-110"
          style={{ background: 'var(--accent)', color: '#0a0a0b' }}
        >
          <Icon name="plus" size={13} strokeWidth={2.4} />
          Nuevo proyecto
        </button>
      </div>

      {/* Filter chips row */}
      {activeFilters.length > 0 && (
        <div className="flex items-center gap-2 px-5 py-2 border-t border-app flex-wrap">
          <span className="text-[10px] tracking-[0.18em] uppercase text-[var(--text-muted)]">Filtros activos</span>
          {activeFilters.map((f, i) => (
            <button
              key={i}
              onClick={() => dispatch({ type: 'clear_filter', key: f.key, value: f.value })}
              className="group flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium hover:brightness-125 transition"
              style={{ background: f.color + '22', color: f.color }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: f.color }}></span>
              {f.label}
              <Icon name="x" size={10} className="opacity-60 group-hover:opacity-100" />
            </button>
          ))}
          <button
            onClick={() => dispatch({ type: 'clear_all_filters' })}
            className="text-[11px] text-[var(--text-muted)] hover:text-white px-1"
          >
            Limpiar todo
          </button>
          <span className="ml-auto text-[10px] text-[var(--text-muted)] font-mono">{filteredCount} resultado{filteredCount !== 1 ? 's' : ''}</span>
        </div>
      )}
    </header>
  );
};

const FilterDropdown = ({ label, icon, filterKey, options, state, dispatch }) => {
  const active = state.filters[filterKey];
  const isActive = active.length > 0;
  return (
    <Dropdown
      width={220}
      trigger={
        <button className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[12px] font-medium transition-colors border ${isActive ? 'bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent)]/40' : 'text-[var(--text-dim)] hover:text-white border-transparent hover:bg-[var(--surface-2)]'}`}>
          <Icon name={icon} size={12} />
          <span>{label}</span>
          {isActive && (
            <span className="text-[10px] font-mono px-1 rounded" style={{ background: 'var(--accent)', color: '#0a0a0b' }}>
              {active.length}
            </span>
          )}
        </button>
      }
    >
      <div className="text-[10px] tracking-[0.18em] uppercase text-[var(--text-muted)] px-2 py-1.5">Filtrar por {label.toLowerCase()}</div>
      {options.map(o => {
        const id = o.id;
        const isOn = active.includes(id);
        const color = o.color;
        return (
          <MenuItem key={id} onClick={() => dispatch({ type: 'toggle_filter', key: filterKey, value: id })} active={isOn}>
            <span className={`check ${isOn ? 'on' : ''}`}>
              {isOn && <Icon name="check" size={10} strokeWidth={3} />}
            </span>
            <span className="w-2 h-2 rounded-full" style={{ background: color }}></span>
            <span className="text-[12px]">{o.label}</span>
          </MenuItem>
        );
      })}
    </Dropdown>
  );
};

// ── Filtering ───────────────────────────────────────────────────
const applyFilters = (state) => {
  const q = state.search.trim().toLowerCase();
  return state.projects.filter(p => {
    if (q && !p.title.toLowerCase().includes(q) && !p.client.toLowerCase().includes(q) && !p.tags.some(t => t.toLowerCase().includes(q))) return false;
    if (state.filters.status.length && !state.filters.status.includes(p.status)) return false;
    if (state.filters.type.length && !state.filters.type.includes(p.type)) return false;
    if (state.filters.priority.length && !state.filters.priority.includes(p.priority)) return false;
    if (state.filters.assignee.length && !p.assignees.some(a => state.filters.assignee.includes(a))) return false;
    return true;
  });
};

// ── Stats bar (kanban) ──────────────────────────────────────────
const StatusStatsBar = ({ projects }) => {
  return (
    <div className="flex items-center gap-1 px-5 py-2 border-b border-app overflow-x-auto" style={{ background: 'var(--surface)' }}>
      {STATUSES.filter(s => s.id !== 'archived').map(s => {
        const n = projects.filter(p => p.status === s.id).length;
        return (
          <div key={s.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-md" style={{ background: s.color + '14' }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }}></span>
            <span className="text-[11px]" style={{ color: s.color }}>{s.label}</span>
            <span className="text-[11px] font-mono font-semibold" style={{ color: s.color }}>{n}</span>
          </div>
        );
      })}
    </div>
  );
};

// ── New project quick form ──────────────────────────────────────
const NewProjectModal = ({ onCreate, onClose }) => {
  const [title, setTitle] = useState('');
  const [client, setClient] = useState('');
  const [type, setType] = useState('reel');
  const [priority, setPriority] = useState('medium');
  const [deadline, setDeadline] = useState(() => {
    const dt = new Date(TODAY); dt.setDate(dt.getDate() + 14);
    return dt.toISOString().slice(0, 10);
  });

  const submit = () => {
    if (!title.trim() || !client.trim()) return;
    const id = 'p' + Date.now();
    onCreate({
      id,
      title: title.trim(),
      client: client.trim(),
      type,
      status: 'briefing',
      priority,
      assignees: [],
      startDate: new Date(TODAY).toISOString().slice(0, 10),
      deadline,
      sessionDate: deadline,
      budget: 0,
      currency: 'USD',
      tags: [],
      cover: { type: 'color', value: '#1a1a1f' },
      description: [{ type: 'p', text: 'Briefing inicial — añadí el contexto del proyecto acá.' }],
      checklist: [],
      deliverables: [],
      timeline: [],
      comments: [],
    });
  };

  return (
    <div className="fixed inset-0 z-50 backdrop flex items-center justify-center p-6 anim-fade-in" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-2xl border anim-scale-in overflow-hidden"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-app">
          <div>
            <div className="font-display text-lg font-semibold" style={{ letterSpacing: '-0.01em' }}>Nuevo proyecto</div>
            <div className="text-[11px] text-[var(--text-muted)]">Creá un proyecto en blanco — completá los detalles después</div>
          </div>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-[var(--surface-2)] text-[var(--text-dim)]">
            <Icon name="x" size={15} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-[10px] tracking-[0.18em] uppercase text-[var(--text-muted)] mb-1.5">Título del proyecto</label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Campaña verano 2026 — Marca X"
              className="w-full px-3 py-2.5 rounded-md text-[14px] surface-2 border border-app focus:border-[var(--accent)]/60"
            />
          </div>
          <div>
            <label className="block text-[10px] tracking-[0.18em] uppercase text-[var(--text-muted)] mb-1.5">Cliente</label>
            <input
              value={client}
              onChange={(e) => setClient(e.target.value)}
              placeholder="Ej: Volcán Activewear"
              className="w-full px-3 py-2.5 rounded-md text-[13.5px] surface-2 border border-app focus:border-[var(--accent)]/60"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] tracking-[0.18em] uppercase text-[var(--text-muted)] mb-1.5">Tipo</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2.5 rounded-md text-[13px] surface-2 border border-app appearance-none cursor-pointer"
                style={{ colorScheme: 'dark' }}
              >
                {PROJECT_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] tracking-[0.18em] uppercase text-[var(--text-muted)] mb-1.5">Prioridad</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2.5 rounded-md text-[13px] surface-2 border border-app appearance-none cursor-pointer"
                style={{ colorScheme: 'dark' }}
              >
                {PRIORITIES.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[10px] tracking-[0.18em] uppercase text-[var(--text-muted)] mb-1.5">Deadline</label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3 py-2.5 rounded-md text-[13px] surface-2 border border-app cursor-pointer"
              style={{ colorScheme: 'dark' }}
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-app">
          <button onClick={onClose} className="px-3 py-1.5 rounded-md text-[12.5px] hover:bg-[var(--surface-2)] text-[var(--text-dim)]">
            Cancelar
          </button>
          <button
            onClick={submit}
            disabled={!title.trim() || !client.trim()}
            className="px-3 py-1.5 rounded-md text-[12.5px] font-semibold disabled:opacity-40 transition-all"
            style={{ background: 'var(--accent)', color: '#0a0a0b' }}
          >
            Crear proyecto
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Loading screen ───────────────────────────────────────────────
const LoadingScreen = () => (
  <div className="h-screen flex items-center justify-center flex-col gap-4" style={{ background: 'var(--bg)' }}>
    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent)' }}>
      <span className="font-display font-black text-2xl" style={{ color: '#0a0a0b', letterSpacing: '-0.03em' }}>F</span>
    </div>
    <div className="text-[13px] text-[var(--text-muted)] font-mono tracking-wider">Conectando con Firebase…</div>
    <div className="flex gap-1.5">
      {[0,1,2].map(i => (
        <div key={i} className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--accent)', animationDelay: `${i * 200}ms`, opacity: 0.6 }}></div>
      ))}
    </div>
  </div>
);

// ── App root ────────────────────────────────────────────────────
const App = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const filtered = useMemo(() => applyFilters(state), [state]);
  const openProject = state.openProjectId ? state.projects.find(p => p.id === state.openProjectId) : null;

  // ── Firestore sync ──────────────────────────────────────────
  useEffect(() => {
    const col = window.db.collection('frame_projects');

    const unsub = col.onSnapshot(async (snap) => {
      if (snap.empty) {
        // Primera vez: sembrar con datos de ejemplo
        const batch = window.db.batch();
        SEED_PROJECTS.forEach(p => batch.set(col.doc(p.id), p));
        await batch.commit();
        // El listener disparará de nuevo con los datos sembrados
      } else {
        const projects = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        dispatch({ type: 'set_projects', projects });
      }
    }, (err) => {
      console.error('Firestore error:', err);
      // Fallback a datos locales si hay error de conexión / permisos
      dispatch({ type: 'set_projects', projects: SEED_PROJECTS });
    });

    return () => unsub();
  }, []);

  // ── Escrituras a Firestore ──────────────────────────────────
  const handleUpdateProject = (project) => {
    dispatch({ type: 'update_project', project }); // optimistic: actualiza UI al instante
    window.db.collection('frame_projects').doc(project.id).set(project)
      .catch(err => console.error('Error al guardar proyecto:', err));
  };

  const handleCreateProject = async (project) => {
    try {
      const ref = await window.db.collection('frame_projects').add(project);
      dispatch({ type: 'create_project', project: { ...project, id: ref.id } });
    } catch (err) {
      console.error('Error al crear proyecto:', err);
      // Fallback local
      dispatch({ type: 'create_project', project });
    }
  };

  if (state.loading) return <LoadingScreen />;

  return (
    <div className="h-screen flex" style={{ background: 'var(--bg)', position: 'relative', zIndex: 1 }}>
      <Sidebar state={state} dispatch={dispatch} />

      <main className="flex-1 flex flex-col overflow-hidden">
        <Header state={state} dispatch={dispatch} filteredCount={filtered.length} />
        {state.view === 'kanban' && <StatusStatsBar projects={filtered} />}

        <div className="flex-1 overflow-hidden">
          {filtered.length === 0 && state.view !== 'kanban' && state.view !== 'calendar' ? (
            <EmptyState />
          ) : (
            <>
              {state.view === 'kanban'   && <KanbanView   projects={filtered} onOpenProject={(id) => dispatch({ type: 'open_project', id })} onUpdateProject={handleUpdateProject} />}
              {state.view === 'calendar' && <CalendarView projects={filtered} onOpenProject={(id) => dispatch({ type: 'open_project', id })} />}
              {state.view === 'gallery'  && <GalleryView  projects={filtered} onOpenProject={(id) => dispatch({ type: 'open_project', id })} />}
              {state.view === 'list'     && <ListView     projects={filtered} onOpenProject={(id) => dispatch({ type: 'open_project', id })} />}
            </>
          )}
        </div>
      </main>

      {openProject && (
        <ProjectModal
          project={openProject}
          currentUserId={state.currentUserId}
          onClose={() => dispatch({ type: 'close_project' })}
          onUpdate={handleUpdateProject}
        />
      )}

      {state.showNewProject && (
        <NewProjectModal
          onCreate={handleCreateProject}
          onClose={() => dispatch({ type: 'hide_new' })}
        />
      )}
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
