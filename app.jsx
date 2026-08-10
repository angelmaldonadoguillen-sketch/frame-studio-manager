// ─────────────────────────────────────────────────────────────────
// APP — Sidebar + Header + Filters + Active view + Modal
// ─────────────────────────────────────────────────────────────────

const { useReducer, useEffect, useState, useMemo, useRef } = React;

// ── Persistencia de navegación en localStorage ──────────────────
const _savedNav = (() => {
  try { return JSON.parse(localStorage.getItem('frame_nav') || '{}'); }
  catch { return {}; }
})();
// Vista fija: si hay una pinneada, se abre siempre en esa (anula el historial de nav)
const _pinnedView = localStorage.getItem('frame_pinned_view') || null;

// ── Initial state + reducer ─────────────────────────────────────
const initialState = {
  // ── Proyectos ──
  projects: [],
  loading: true,
  currentUserId: 'u1',
  view: _pinnedView || _savedNav.view || 'kanban', // fija > historial > default
  pinnedView: _pinnedView,          // null | 'kanban' | 'calendar' | 'gallery' | 'list'
  search: '',
  filters: {
    status: [],
    type: [],
    assignee: [],
    priority: [],
    client: [],
  },
  openProjectId: null,
  showNewProject: false,
  sidebarFilter: _savedNav.sidebarFilter || 'all',
  // ── Clientes ──
  clients: [],
  clientsLoading: true,
  openClientId: null,
  // ── Equipo ──
  team: [],
  teamLoading: true,
  openMemberId: null,
  // ── Navegación ──
  section: _savedNav.section || 'projects', // 'projects' | 'clients' | 'team'
  // ── Notificaciones ──
  notifications: [],
  notifsLoading: true,
  // ── Columnas Kanban ──
  kanbanColumns: [],
  // ── Tipos personalizados ──
  customTypes: [],
  // ── Papelera ──
  trash: [],
  trashLoading: true,
  // ── Vista previa en tarjetas ──
  previewFields: {
    tipo: true, cliente: true, estado: true,
    prioridad: true, responsables: true,
    deadline: true, presupuesto: false,
    tags: false, progreso: true,
  },
  // ── Carry-over de proyectos ──
  carryOverProjects: false,
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
    // Alta rápida inline (no abre el modal — la tarjeta aparece para rellenar en su lugar)
    case 'create_project_quiet': return {
      ...state,
      projects: [action.project, ...state.projects],
    };
    case 'show_new':       return { ...state, showNewProject: true };
    case 'hide_new':       return { ...state, showNewProject: false };
    case 'toggle_filter': {
      const cur = state.filters[action.key];
      const next = cur.includes(action.value) ? cur.filter(x => x !== action.value) : [...cur, action.value];
      return { ...state, filters: { ...state.filters, [action.key]: next } };
    }
    case 'clear_filter':   return { ...state, filters: { ...state.filters, [action.key]: state.filters[action.key].filter(x => x !== action.value) } };
    case 'clear_all_filters': return { ...state, filters: { status: [], type: [], assignee: [], priority: [], client: [] }, search: '' };
    case 'set_projects':       return { ...state, projects: action.projects, loading: false };
    case 'delete_project':     return { ...state, projects: state.projects.filter(p => p.id !== action.id), openProjectId: state.openProjectId === action.id ? null : state.openProjectId };
    case 'set_sidebar_filter': return { ...state, sidebarFilter: action.filter, section: action.filter === 'trash' ? 'trash' : 'projects' };
    // ── Papelera ──
    case 'set_trash':          return { ...state, trash: action.trash, trashLoading: false };
    case 'remove_from_trash':  return { ...state, trash: state.trash.filter(t => t.id !== action.id) };
    case 'restore_project':    return { ...state, projects: [action.project, ...state.projects], trash: state.trash.filter(t => t.id !== action.project.id) };
    case 'duplicate_project':  return { ...state, projects: [action.project, ...state.projects] };
    // ── Clientes ──
    case 'set_clients':   return { ...state, clients: action.clients, clientsLoading: false };
    case 'create_client': return { ...state, clients: [action.client, ...state.clients], openClientId: action.client.id };
    case 'update_client': return { ...state, clients: state.clients.map(c => c.id === action.client.id ? action.client : c) };
    case 'delete_client': return { ...state, clients: state.clients.filter(c => c.id !== action.id), openClientId: state.openClientId === action.id ? null : state.openClientId };
    case 'open_client':   return { ...state, openClientId: action.id };
    case 'close_client':  return { ...state, openClientId: null };
    // ── Equipo ──
    case 'set_team':      return { ...state, team: action.team, teamLoading: false };
    case 'create_member': return { ...state, team: [action.member, ...state.team], openMemberId: action.member.id };
    case 'update_member': return { ...state, team: state.team.map(m => m.id === action.member.id ? action.member : m) };
    case 'delete_member': return { ...state, team: state.team.filter(m => m.id !== action.id), openMemberId: state.openMemberId === action.id ? null : state.openMemberId };
    case 'open_member':   return { ...state, openMemberId: action.id };
    case 'close_member':  return { ...state, openMemberId: null };
    // ── Navegación ──
    case 'set_section':   return { ...state, section: action.section };
    // ── Columnas Kanban ──
    case 'set_columns':    return { ...state, kanbanColumns: action.columns };
    case 'update_column':  return { ...state, kanbanColumns: state.kanbanColumns.map(c => c.id === action.column.id ? action.column : c) };
    case 'add_column':     return { ...state, kanbanColumns: [...state.kanbanColumns, action.column] };
    case 'delete_column':  return { ...state, kanbanColumns: state.kanbanColumns.filter(c => c.id !== action.id) };
    // ── Vista previa ──
    case 'set_preview_fields':    return { ...state, previewFields: action.fields };
    case 'toggle_preview_field':  return { ...state, previewFields: { ...state.previewFields, [action.key]: !state.previewFields[action.key] } };
    // ── Carry-over proyectos ──
    case 'set_carryover_projects': return { ...state, carryOverProjects: action.value };
    // ── Vista fija ──
    case 'set_pinned_view': return { ...state, pinnedView: action.view };
    // ── Tipos personalizados ──
    case 'set_custom_types':    return { ...state, customTypes: action.types };
    case 'add_custom_type':     return { ...state, customTypes: [...state.customTypes, action.typeObj] };
    case 'update_custom_type':  return { ...state, customTypes: state.customTypes.map(t => t.id === action.id ? { ...t, ...action.patch } : t) };
    case 'delete_custom_type':  return { ...state, customTypes: state.customTypes.filter(t => t.id !== action.id) };
    // ── Notificaciones ──
    case 'set_notifs':           return { ...state, notifications: action.notifications, notifsLoading: false };
    case 'mark_notif_read':      return { ...state, notifications: state.notifications.map(n => n.id === action.id ? { ...n, read: true } : n) };
    case 'mark_all_notifs_read': return { ...state, notifications: state.notifications.map(n => ({ ...n, read: true })) };
    case 'resolve_notif':        return { ...state, notifications: state.notifications.map(n => n.id === action.id ? { ...n, read: true, resolved: true, resolvedAction: action.action } : n) };
    default: return state;
  }
}

// ── Helper global para crear notificaciones ──────────────────────────────
window.pushNotif = (toUserId, data) => {
  if (!toUserId) return;
  const id = 'n' + Date.now() + Math.random().toString(36).slice(2, 6);
  return window.db
    .collection('frame_notifications')
    .doc(String(toUserId))
    .collection('items')
    .doc(id)
    .set({ id, ...data, read: false, createdAt: new Date().toISOString() })
    .catch(err => console.error('pushNotif error:', err));
};

// ── Sidebar ─────────────────────────────────────────────────────
const Sidebar = ({ state, dispatch, onSignOut }) => {
  const recentProjects = state.projects.slice(0, 5);
  const me = state.team.find(m => m.id === state.currentUserId) || getUser(state.currentUserId);

  const counts = {
    all:       state.projects.filter(p => p.status !== 'archived').length,
    favorites: state.projects.filter(p => p.favorite).length,
    mine:      state.projects.filter(p => p.assignees.includes(state.currentUserId) && p.status !== 'archived').length,
    urgent:    state.projects.filter(p => { const d = daysUntil(p.deadline); return d >= 0 && d < 3 && p.status !== 'delivered' && p.status !== 'archived'; }).length,
    delivered: state.projects.filter(p => p.status === 'delivered').length,
    archived:  state.projects.filter(p => p.status === 'archived').length,
    trash:     state.trash.length,
  };
  const sf = state.sidebarFilter;
  const setFilter = (f) => dispatch({ type: 'set_sidebar_filter', filter: f });

  return (
    <aside className="w-[240px] flex-shrink-0 border-r border-app flex flex-col" style={{ background: 'var(--surface)' }}>
      {/* Logo — click va a inicio */}
      <div className="px-5 py-5 border-b border-app">
        <button
          onClick={() => {
            dispatch({ type: 'set_section', section: 'projects' });
            dispatch({ type: 'set_sidebar_filter', filter: 'all' });
            if (state.pinnedView) dispatch({ type: 'set_view', view: state.pinnedView });
          }}
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
          title="Ir al inicio"
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent)' }}>
            <span className="font-display font-black text-lg" style={{ color: '#0a0a0b', letterSpacing: '-0.03em' }}>F</span>
          </div>
          <div>
            <div className="font-display font-bold text-[15px]" style={{ letterSpacing: '-0.02em' }}>FRAME</div>
            <div className="text-[10px] tracking-[0.2em] text-[var(--text-muted)] uppercase">Studio Manager</div>
          </div>
        </button>
      </div>

      {/* Usuario autenticado */}
      <div className="px-3 py-3 border-b border-app">
        <div className="flex items-center gap-2.5 px-2 py-1.5">
          <Avatar user={me} size={32} />
          <div className="flex-1 min-w-0 select-none">
            <div className="text-[13px] font-semibold truncate">{me.name}</div>
            <div className="text-[10px] text-[var(--text-muted)] truncate">{me.role}</div>
          </div>
          <button
            onClick={onSignOut}
            title="Cerrar sesión"
            className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger-soft)] transition-colors flex-shrink-0"
          >
            <Icon name="logOut" size={14} />
          </button>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        <div className="text-[10px] tracking-[0.18em] uppercase text-[var(--text-muted)] px-2 py-1.5 select-none">Espacios</div>
        <NavItem icon="layers"  label="Todos los proyectos" count={counts.all}                    active={sf === 'all'}       onClick={() => setFilter('all')} />
        <NavItem icon="star"    label="Favoritos"           count={counts.favorites || undefined} active={sf === 'favorites'} onClick={() => setFilter('favorites')} />
        <NavItem icon="users"   label="Asignados a mí"     count={counts.mine}                   active={sf === 'mine'}      onClick={() => setFilter('mine')} />
        <NavItem icon="alert"   label="Deadlines urgentes" count={counts.urgent}                 active={sf === 'urgent'}    accent onClick={() => setFilter('urgent')} />
        <NavItem icon="check"   label="Entregados"         count={counts.delivered}              active={sf === 'delivered'} onClick={() => setFilter('delivered')} />
        <NavItem icon="trash"   label="Papelera"           count={counts.trash || undefined}     active={sf === 'trash'}     onClick={() => setFilter('trash')} />

        <div className="text-[10px] tracking-[0.18em] uppercase text-[var(--text-muted)] px-2 py-1.5 mt-4 select-none">Trabajo</div>
        <NavItem icon="briefcase" label="Clientes"  active={state.section === 'clients'}   onClick={() => dispatch({ type: 'set_section', section: 'clients' })} />
        <NavItem icon="users"     label="Equipo"    active={state.section === 'team'}      onClick={() => dispatch({ type: 'set_section', section: 'team' })} />
        <NavItem icon="zap"       label="Analytics" active={state.section === 'analytics'} onClick={() => dispatch({ type: 'set_section', section: 'analytics' })} />
        <NavItem icon="settings"  label="Ajustes"   active={state.section === 'settings'}  onClick={() => dispatch({ type: 'set_section', section: 'settings' })} />

        <div className="mt-5">
          <div className="flex items-center justify-between px-2 py-1.5">
            <div className="text-[10px] tracking-[0.18em] uppercase text-[var(--text-muted)] select-none">Recientes</div>
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
        <div className="text-[10px] tracking-[0.18em] uppercase text-[var(--text-muted)] mb-2 px-1 select-none">Equipo en línea</div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {(state.team || []).slice(0, 5).map(u => (
            <div key={u.id} className="relative" title={u.name}>
              <Avatar user={u} size={26} />
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full ring-2 ring-[var(--surface)]" style={{ background: '#7DD3C0' }}></span>
            </div>
          ))}
          {(state.team || []).length === 0 && (
            <span className="text-[10px] text-[var(--text-muted)]">Sin integrantes</span>
          )}
        </div>
      </div>
    </aside>
  );
};

const NavItem = ({ icon, label, count, active, accent, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-[13px] transition-colors group ${active ? 'bg-[var(--surface-2)] text-white' : 'text-[var(--text-dim)] hover:text-white hover:bg-[var(--surface-2)]'}`}
  >
    <Icon name={icon} size={14} className={accent ? '' : ''} style={{ color: accent ? 'var(--danger)' : undefined }} />
    <span className="flex-1 text-left">{label}</span>
    {count !== undefined && (
      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${active ? 'bg-[var(--surface-3)] text-white' : 'text-[var(--text-muted)]'}`}>
        {count}
      </span>
    )}
  </button>
);

// ── Notification Panel ──────────────────────────────────────────
const NotificationPanel = ({ notifications, team = [], onMarkRead, onMarkAllRead, onOpenProject, onApproveUser, onRejectUser }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const unread = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const timeAgo = (iso) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'ahora';
    if (mins < 60) return `hace ${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `hace ${hrs}h`;
    return `hace ${Math.floor(hrs / 24)}d`;
  };

  const notifIcon = (type) => {
    if (type === 'mention')          return 'at';
    if (type === 'comment')          return 'message';
    if (type === 'status')           return 'zap';
    if (type === 'approval_request') return 'users';
    return 'bell';
  };

  const notifColor = (type, read) => {
    if (type === 'approval_request') return { bg: read ? 'var(--surface-3)' : '#6CC4FF22', fg: '#6CC4FF' };
    return { bg: read ? 'var(--surface-3)' : 'var(--accent-soft)', fg: read ? 'var(--text-muted)' : 'var(--accent)' };
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className={`p-2 rounded-md transition-colors relative ${open ? 'bg-[var(--surface-2)] text-white' : 'text-[var(--text-dim)] hover:text-white hover:bg-[var(--surface-2)]'}`}
      >
        <Icon name="bell" size={15} />
        {unread > 0 && (
          <span
            className="absolute top-0.5 right-0.5 min-w-[14px] h-3.5 px-0.5 rounded-full text-[10px] font-bold flex items-center justify-center"
            style={{ background: 'var(--accent)', color: '#0a0a0b' }}
          >
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-80 rounded-xl border shadow-2xl overflow-hidden anim-scale-in z-50"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          {/* Panel header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-app">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[13px]">Notificaciones</span>
              {unread > 0 && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: 'var(--accent)', color: '#0a0a0b' }}>{unread}</span>
              )}
            </div>
            {unread > 0 && (
              <button onClick={onMarkAllRead} className="text-[11px] text-[var(--text-muted)] hover:text-white transition-colors">
                Marcar todo leído
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[420px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <Icon name="bell" size={22} className="mx-auto mb-2 text-[var(--text-muted)]" />
                <div className="text-[12px] text-[var(--text-muted)]">Sin notificaciones</div>
              </div>
            ) : (
              notifications.slice(0, 25).map(n => {
                const nc = notifColor(n.type, n.read);

                // ── Solicitud de acceso ──────────────────────────
                if (n.type === 'approval_request') {
                  const reqUser  = team.find(m => m.id === n.userId);
                  const isPending = !n.resolved && (!reqUser || reqUser.status === 'pending');
                  const wasApproved = n.resolvedAction === 'approved' || reqUser?.status === 'active';
                  return (
                    <div
                      key={n.id}
                      className={`px-4 py-3 border-b border-app ${!n.read ? 'bg-[var(--accent-soft)]' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ background: nc.bg, color: nc.fg }}>
                          <Icon name="users" size={13} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[12px] leading-snug font-medium">{n.body}</div>
                          <div className="text-[11px] mt-0.5 font-mono" style={{ color: 'var(--text-muted)' }}>{n.userEmail}</div>
                          <div className="text-[10px] mt-0.5 font-mono" style={{ color: 'var(--text-muted)' }}>{timeAgo(n.createdAt)}</div>
                          {isPending ? (
                            <div className="flex gap-1.5 mt-2.5">
                              <button
                                onClick={() => { onApproveUser && onApproveUser(n.userId, n.id); }}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[12px] font-bold transition-all hover:brightness-110"
                                style={{ background: 'var(--accent)', color: '#0a0a0b' }}
                              >
                                <Icon name="check" size={11} strokeWidth={2.5} />
                                Aprobar
                              </button>
                              <button
                                onClick={() => { onRejectUser && onRejectUser(n.userId, n.id); }}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[12px] font-medium transition-all hover:bg-[var(--danger-soft)] hover:text-[var(--danger)]"
                                style={{ background: 'var(--surface-3)', color: 'var(--text-muted)' }}
                              >
                                Rechazar
                              </button>
                            </div>
                          ) : (
                            <div className="mt-1.5 text-[11px] font-semibold flex items-center gap-1"
                              style={{ color: wasApproved ? 'var(--accent)' : 'var(--danger)' }}>
                              <Icon name={wasApproved ? 'check' : 'x'} size={11} strokeWidth={2.5} />
                              {wasApproved ? 'Acceso aprobado' : 'Acceso denegado'}
                            </div>
                          )}
                        </div>
                        {!n.read && (
                          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-2.5" style={{ background: 'var(--accent)' }}></span>
                        )}
                      </div>
                    </div>
                  );
                }

                // ── Notificación regular ─────────────────────────
                return (
                  <button
                    key={n.id}
                    onClick={() => {
                      onMarkRead(n.id);
                      if (n.projectId) { onOpenProject(n.projectId); setOpen(false); }
                    }}
                    className={`w-full text-left flex items-start gap-3 px-4 py-3 border-b border-app hover:bg-[var(--surface-2)] transition-colors last:border-b-0 ${!n.read ? 'bg-[var(--accent-soft)]' : ''}`}
                  >
                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: nc.bg, color: nc.fg }}>
                      <Icon name={notifIcon(n.type)} size={13} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] leading-snug">{n.body}</div>
                      {n.projectTitle && (
                        <div className="text-[11px] text-[var(--text-muted)] truncate mt-0.5">{n.projectTitle}</div>
                      )}
                      <div className="text-[10px] text-[var(--text-muted)] mt-1 font-mono">{timeAgo(n.createdAt)}</div>
                    </div>
                    {!n.read && (
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-2.5" style={{ background: 'var(--accent)' }}></span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Header ──────────────────────────────────────────────────────
const Header = ({ state, dispatch, filteredCount, notifications, onMarkRead, onMarkAllRead, onOpenProject, onApproveUser, onRejectUser, onPinView }) => {
  const me = getUser(state.currentUserId);
  const activeFilters = [
    ...state.filters.status.map(v => ({ key: 'status', value: v, label: getStatus(v).label, color: getStatus(v).color })),
    ...state.filters.type.map(v => ({ key: 'type', value: v, label: getType(v).label, color: getType(v).color })),
    ...state.filters.assignee.map(v => ({ key: 'assignee', value: v, label: getUser(v)?.name ?? v, color: getUser(v)?.color ?? '#9A9AA3' })),
    ...state.filters.priority.map(v => ({ key: 'priority', value: v, label: getPrio(v).label, color: getPrio(v).color })),
    ...(state.filters.client || []).map(v => { const cl = (state.clients || []).find(c => c.name === v); return { key: 'client', value: v, label: v, color: cl?.color || '#9A9AA3' }; }),
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
          ].map(v => {
            const isPinned = state.pinnedView === v.id;
            return (
              <div key={v.id} className="relative group">
                {/* Botón de vista */}
                <button
                  onClick={() => dispatch({ type: 'set_view', view: v.id })}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[12px] font-medium transition-all select-none ${state.view === v.id ? 'bg-[var(--surface-3)] text-white' : 'text-[var(--text-dim)] hover:text-white'}`}
                >
                  <Icon name={v.icon} size={13} />
                  <span>{v.label}</span>
                  {/* Dot indicador cuando está fijada */}
                  {isPinned && (
                    <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: 'var(--accent)' }} />
                  )}
                </button>
                {/* Pin button — aparece al hover, siempre visible si está fijada */}
                <button
                  onClick={(e) => { e.stopPropagation(); onPinView && onPinView(v.id); }}
                  className={`absolute -top-1.5 -right-1 w-[18px] h-[18px] rounded-full flex items-center justify-center transition-all ${isPinned ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                  style={{
                    background: isPinned ? 'var(--accent)' : 'var(--surface-3)',
                    color:      isPinned ? '#0a0a0b'       : 'var(--text-muted)',
                    border:     `1px solid ${isPinned ? 'transparent' : 'var(--border)'}`,
                    boxShadow:  '0 1px 6px rgba(0,0,0,0.4)',
                    zIndex: 10,
                  }}
                  title={isPinned ? 'Quitar vista fija' : 'Fijar como vista principal'}
                >
                  <Icon name="pin" size={9} />
                </button>
              </div>
            );
          })}
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md surface-2 flex-1 max-w-md">
          <Icon name="search" size={13} className="text-[var(--text-muted)]" />
          <input
            value={state.search}
            onChange={(e) => dispatch({ type: 'set_search', value: e.target.value })}
            placeholder="Buscar proyectos, clientes…"
            className="flex-1 text-[13px]"
          />
          {state.search && (
            <button onClick={() => dispatch({ type: 'set_search', value: '' })} className="text-[var(--text-muted)] hover:text-white">
              <Icon name="x" size={12} />
            </button>
          )}
        </div>

        {/* Filter dropdowns */}
        <FilterDropdown label="Estado"    icon="dot"       filterKey="status"   options={state.kanbanColumns.length > 0 ? state.kanbanColumns : STATUSES}    state={state} dispatch={dispatch} />
        <FilterDropdown label="Tipo"      icon="film"      filterKey="type"     options={state.customTypes.length > 0 ? state.customTypes : PROJECT_TYPES}    state={state} dispatch={dispatch} />
        <FilterDropdown label="Prioridad" icon="flag"      filterKey="priority" options={PRIORITIES}                                                              state={state} dispatch={dispatch} />
        <FilterDropdown label="Equipo"    icon="users"     filterKey="assignee" options={(state.team || []).map(u => ({ id: u.id, label: u.name, color: u.color }))} state={state} dispatch={dispatch} />
        <FilterDropdown label="Cliente"   icon="briefcase" filterKey="client"   options={[...new Map((state.projects || []).filter(p => p.client).map(p => { const cl = (state.clients || []).find(c => c.name === p.client); return [p.client, { id: p.client, label: p.client, color: cl?.color || '#9A9AA3' }]; })).values()]} state={state} dispatch={dispatch} />

        <div className="flex-1"></div>

        <NotificationPanel
          notifications={notifications}
          team={state.team}
          onMarkRead={onMarkRead}
          onMarkAllRead={onMarkAllRead}
          onOpenProject={onOpenProject}
          onApproveUser={onApproveUser}
          onRejectUser={onRejectUser}
        />

        <button
          onClick={() => dispatch({ type: 'show_new' })}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-semibold transition-all hover:brightness-110"
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
    // ── Sidebar filter ──
    if (state.sidebarFilter === 'favorites' && !p.favorite) return false;
    if (state.sidebarFilter === 'mine' && !p.assignees.includes(state.currentUserId)) return false;
    if (state.sidebarFilter === 'urgent') {
      const d = daysUntil(p.deadline);
      if (!(d >= 0 && d < 3 && p.status !== 'delivered' && p.status !== 'archived')) return false;
    }
    if (state.sidebarFilter === 'delivered' && p.status !== 'delivered') return false;
    if (state.sidebarFilter === 'archived'  && p.status !== 'archived')  return false;
    // En vista 'all' ocultar archivados salvo que se filtren explícitamente por estado
    if (state.sidebarFilter === 'all' && p.status === 'archived' && !state.filters.status.includes('archived')) return false;
    // ── Búsqueda ──
    if (q && !p.title.toLowerCase().includes(q) && !p.client.toLowerCase().includes(q) && !p.tags.some(t => t.toLowerCase().includes(q))) return false;
    // ── Filtros de cabecera ──
    if (state.filters.status.length   && !state.filters.status.includes(p.status))                              return false;
    if (state.filters.type.length     && !state.filters.type.includes(p.type))                                  return false;
    if (state.filters.priority.length && !state.filters.priority.includes(p.priority))                          return false;
    if (state.filters.assignee.length && !p.assignees.some(a => state.filters.assignee.includes(a)))            return false;
    if (state.filters.client.length   && !state.filters.client.includes(p.client))                              return false;
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
const NewProjectModal = ({ onCreate, onClose, clients = [], onCreateClient, customTypes = [] }) => {
  const [title, setTitle] = useState('');
  const [client, setClient] = useState('');
  const [type, setType] = useState('reel');
  const [priority, setPriority] = useState('medium');
  const [deadline, setDeadline] = useState(() => {
    const dt = new Date(TODAY); dt.setDate(dt.getDate() + 14);
    return localISO(dt);
  });

  const submit = () => {
    if (!title.trim() || !client.trim()) return;
    const id = 'p' + Date.now() + Math.random().toString(36).slice(2, 5);
    onCreate({
      id,
      title: title.trim(),
      client: client.trim(),
      type,
      status: 'briefing',
      priority,
      assignees: [],
      startDate: localISO(new Date(TODAY)),
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
              className="w-full px-3 py-2.5 rounded-md text-[15px] surface-2 border border-app focus:border-[var(--accent)]/60"
            />
          </div>
          <div>
            <label className="block text-[10px] tracking-[0.18em] uppercase text-[var(--text-muted)] mb-1.5">Cliente</label>
            <ClientAutocomplete
              value={client}
              onChange={setClient}
              clients={clients}
              onCreateClient={onCreateClient}
              fieldMode={true}
              placeholder="Ej: Volcán Activewear"
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
                {[...PROJECT_TYPES, ...customTypes].map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
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
          <button onClick={onClose} className="px-3 py-1.5 rounded-md text-[13px] hover:bg-[var(--surface-2)] text-[var(--text-dim)]">
            Cancelar
          </button>
          <button
            onClick={submit}
            disabled={!title.trim() || !client.trim()}
            className="px-3 py-1.5 rounded-md text-[13px] font-semibold disabled:opacity-40 transition-all"
            style={{ background: 'var(--accent)', color: '#0a0a0b' }}
          >
            Crear proyecto
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Pantalla: esperando aprobación ──────────────────────────────
const PendingApprovalScreen = ({ member, onSignOut }) => (
  <div className="h-screen flex flex-col items-center justify-center gap-6 px-6" style={{ background: 'var(--bg)', position: 'relative', zIndex: 1 }}>
    <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'var(--accent)', boxShadow: '0 0 40px rgba(212,255,79,0.2)' }}>
      <span className="font-display font-black text-[26px]" style={{ color: '#0a0a0b', letterSpacing: '-0.04em' }}>F</span>
    </div>
    <div className="flex gap-1.5">
      {[0, 1, 2].map(i => (
        <div key={i} className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--text-muted)', animationDelay: `${i * 200}ms` }}></div>
      ))}
    </div>
    <div className="text-center max-w-sm">
      <h2 className="font-display text-[22px] font-bold mb-2" style={{ letterSpacing: '-0.02em' }}>Esperando aprobación</h2>
      <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
        Tu solicitud fue recibida. Un miembro del estudio revisará tu acceso y te dará ingreso en breve.
      </p>
    </div>
    {member && (
      <div className="rounded-xl border px-5 py-3 flex items-center gap-3" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-[13px] flex-shrink-0"
          style={{ background: member.color + '1a', color: member.color, border: `1.5px solid ${member.color}44` }}
        >
          {member.avatar
            ? <img src={member.avatar} alt={member.initials} className="w-9 h-9 rounded-full object-cover" />
            : member.initials}
        </div>
        <div>
          <div className="text-[13px] font-semibold">{member.name}</div>
          <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{member.email}</div>
        </div>
        <span className="ml-2 text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: 'var(--warn-soft-2)', color: 'var(--warn)' }}>
          Pendiente
        </span>
      </div>
    )}
    <button onClick={onSignOut} className="flex items-center gap-1.5 text-[12px] transition-colors hover:text-white" style={{ color: 'var(--text-muted)' }}>
      <Icon name="logOut" size={13} />
      Cerrar sesión
    </button>
  </div>
);

// ── Pantalla: acceso denegado ────────────────────────────────────
const RejectedScreen = ({ member, onSignOut }) => (
  <div className="h-screen flex flex-col items-center justify-center gap-6 px-6" style={{ background: 'var(--bg)', position: 'relative', zIndex: 1 }}>
    <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'var(--danger-soft)', border: '1.5px solid var(--danger-soft-2)' }}>
      <Icon name="x" size={24} style={{ color: 'var(--danger)' }} />
    </div>
    <div className="text-center max-w-sm">
      <h2 className="font-display text-[22px] font-bold mb-2" style={{ letterSpacing: '-0.02em', color: 'var(--danger)' }}>Acceso denegado</h2>
      <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
        Tu solicitud fue rechazada. Contactá al administrador del estudio para más información.
      </p>
    </div>
    {member && (
      <div className="rounded-xl border px-5 py-3 flex items-center gap-3" style={{ background: 'var(--surface)', borderColor: 'var(--danger-soft-2)' }}>
        <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-[13px] flex-shrink-0"
          style={{ background: member.color + '1a', color: member.color, border: `1.5px solid ${member.color}44` }}>
          {member.initials}
        </div>
        <div>
          <div className="text-[13px] font-semibold">{member.name}</div>
          <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{member.email}</div>
        </div>
      </div>
    )}
    <button onClick={onSignOut}
      className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium transition-colors hover:text-white"
      style={{ background: 'var(--surface)', color: 'var(--text-dim)', border: '1px solid var(--border)' }}>
      <Icon name="logOut" size={13} />
      Cerrar sesión
    </button>
  </div>
);

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

// ── Settings section ────────────────────────────────────────────
const PREVIEW_FIELD_LABELS = [
  { key: 'tipo',         label: 'Tipo',          icon: 'film'     },
  { key: 'cliente',      label: 'Cliente',        icon: 'briefcase'},
  { key: 'estado',       label: 'Estado',         icon: 'dot'      },
  { key: 'prioridad',    label: 'Prioridad',      icon: 'flag'     },
  { key: 'responsables', label: 'Responsables',   icon: 'users'    },
  { key: 'deadline',     label: 'Deadline',       icon: 'calendar' },
  { key: 'presupuesto',  label: 'Presupuesto',    icon: 'zap'      },
  { key: 'tags',         label: 'Tags',           icon: 'hash'     },
  { key: 'progreso',     label: 'Progreso',       icon: 'layers'   },
];

const SettingsSection = ({ previewFields, onToggle, carryOverProjects, onToggleCarryOverProjects }) => {
  const [carryOver, setCarryOver] = useState(false);

  useEffect(() => {
    const ref = window.db.collection('frame_config').doc('daily_routine');
    const unsub = ref.onSnapshot(snap => {
      if (snap.exists) setCarryOver(snap.data()?.config?.carryOver || false);
    }, () => {});
    return () => unsub();
  }, []);

  const toggleCarryOver = () => {
    const next = !carryOver;
    setCarryOver(next);
    window.db.collection('frame_config').doc('daily_routine')
      .update({ 'config.carryOver': next })
      .catch(err => console.error('[FRAME] CarryOver toggle:', err));
    // Al desactivar, limpiar deuda acumulada
    if (!next) {
      window.db.collection('frame_config').doc('daily_routine')
        .update({ 'today.debt': {} })
        .catch(() => {});
    }
  };

  const ToggleRow = ({ active, onClick, icon, label, description }) => (
    <button
      onClick={onClick}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all text-left w-full"
      style={{
        background:  active ? 'var(--accent-soft)'    : 'var(--surface-2)',
        borderColor: active ? 'rgba(212,255,79,0.3)'  : 'var(--border)',
      }}
    >
      <div
        className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-all"
        style={{
          background: active ? 'var(--accent)'    : 'var(--surface-3)',
          border:     active ? 'none'              : '1.5px solid var(--border-2)',
        }}
      >
        {active && <Icon name="check" size={10} strokeWidth={3} style={{ color: '#0a0a0b' }} />}
      </div>
      <Icon name={icon} size={13} style={{ color: active ? 'var(--accent)' : 'var(--text-muted)' }} />
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium" style={{ color: active ? 'var(--text)' : 'var(--text-dim)' }}>
          {label}
        </div>
        {description && (
          <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{description}</div>
        )}
      </div>
    </button>
  );

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="font-display text-2xl font-bold mb-1" style={{ letterSpacing: '-0.02em' }}>Ajustes</h1>
          <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>Configuración del espacio de trabajo</p>
        </div>

        {/* Vista previa de tarjetas */}
        <div className="rounded-xl border p-5" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2 mb-1">
            <Icon name="layers" size={15} style={{ color: 'var(--accent)' }} />
            <h2 className="font-display font-semibold text-[17px]">Vista previa de tarjetas</h2>
          </div>
          <p className="text-[12px] mb-5" style={{ color: 'var(--text-muted)' }}>
            Elegí qué campos se muestran en las tarjetas del tablero, calendario y galería.
          </p>
          <div className="grid grid-cols-1 gap-1">
            {PREVIEW_FIELD_LABELS.map(({ key, label, icon }) => (
              <ToggleRow
                key={key}
                active={previewFields[key]}
                onClick={() => onToggle(key)}
                icon={icon}
                label={label}
              />
            ))}
          </div>
          <p className="text-[11px] mt-4" style={{ color: 'var(--text-muted)' }}>
            Los cambios se aplican instantáneamente en todas las vistas y se sincronizan en la nube.
          </p>
        </div>

        {/* Rutina diaria */}
        <div className="rounded-xl border p-5" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2 mb-1">
            <Icon name="sun" size={15} style={{ color: 'var(--accent)' }} />
            <h2 className="font-display font-semibold text-[17px]">Rutina diaria</h2>
          </div>
          <p className="text-[12px] mb-4" style={{ color: 'var(--text-muted)' }}>
            Comportamiento de las tareas cuando no se completan en el día.
          </p>
          <ToggleRow
            active={carryOver}
            onClick={toggleCarryOver}
            icon="alert"
            label="Arrastrar tareas pendientes al día siguiente"
            description="Las tareas sin completar acumulan días (+1d, +2d…) y se marcan como urgentes hasta que las hagás"
          />
        </div>

        {/* Proyectos */}
        <div className="rounded-xl border p-5" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2 mb-1">
            <Icon name="layers" size={15} style={{ color: 'var(--accent)' }} />
            <h2 className="font-display font-semibold text-[17px]">Proyectos</h2>
          </div>
          <p className="text-[12px] mb-4" style={{ color: 'var(--text-muted)' }}>
            Automatizaciones sobre las tarjetas de proyecto al iniciar cada día.
          </p>
          <ToggleRow
            active={carryOverProjects}
            onClick={onToggleCarryOverProjects}
            icon="alert"
            label="Mover proyectos con checklist pendiente al día siguiente"
            description="Al abrir la app, los proyectos con checklist incompleta y fecha de sesión pasada se replazan a hoy automáticamente"
          />
        </div>

      </div>
    </div>
  );
};

// ── App root ────────────────────────────────────────────────────
const App = () => {
  const [state, dispatch]         = useReducer(reducer, initialState);
  const [authUser, setAuthUser]   = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  const filtered    = useMemo(() => applyFilters(state), [state]);
  const openProject = state.openProjectId ? state.projects.find(p => p.id === state.openProjectId) : null;

  // ── Persistir navegación en localStorage ───────────────────
  useEffect(() => {
    try {
      localStorage.setItem('frame_nav', JSON.stringify({
        section:       state.section,
        sidebarFilter: state.sidebarFilter,
        view:          state.view,
      }));
    } catch {}
  }, [state.section, state.sidebarFilter, state.view]);

  // ── Firestore sync ──────────────────────────────────────────
  // IMPORTANTE: todas las suscripciones esperan a que haya sesión.
  // Un onSnapshot que arranca sin auth falla con permission-denied y el
  // listener queda muerto para siempre (no se reconecta al loguearse).
  useEffect(() => {
    if (!authUser) return;
    const col = window.db.collection('frame_projects');

    const unsub = col.onSnapshot((snap) => {
      // normalizeProject garantiza la forma en el borde: de acá para adentro
      // nadie tiene que preguntarse si tags o assignees existen.
      const projects = snap.docs.map(d => normalizeProject({ ...d.data(), id: d.id }));
      dispatch({ type: 'set_projects', projects });
    }, (err) => {
      console.error('Firestore error:', err);
      dispatch({ type: 'set_projects', projects: [] });
    });

    return () => unsub();
  }, [authUser?.uid]);

  // ── Firestore: equipo ───────────────────────────────────────
  useEffect(() => {
    if (!authUser) return;
    const col = window.db.collection('frame_users');
    const unsub = col.onSnapshot((snap) => {
      // No seeding — only real registered users
      const team = snap.docs.map(doc => normalizeMember({ ...doc.data(), id: doc.id }));
      window.__liveTeam = team; // registro global para getUser / AvatarStack
      dispatch({ type: 'set_team', team });
    }, (err) => {
      console.error('Firestore team error:', err);
      dispatch({ type: 'set_team', team: [] });
    });
    return () => unsub();
  }, [authUser?.uid]);

  // ── Firestore: clientes ─────────────────────────────────────
  useEffect(() => {
    if (!authUser) return;
    const col = window.db.collection('frame_clients');
    const unsub = col.onSnapshot((snap) => {
      const clients = snap.docs.map(doc => normalizeClient({ ...doc.data(), id: doc.id }));
      dispatch({ type: 'set_clients', clients });
    }, (err) => {
      console.error('Firestore clients error:', err);
      dispatch({ type: 'set_clients', clients: [] });
    });
    return () => unsub();
  }, [authUser?.uid]);

  // ── Firebase Auth: sesión ───────────────────────────────────
  useEffect(() => {
    const unsub = firebase.auth().onAuthStateChanged((user) => {
      setAuthUser(user);
      setAuthChecked(true);
    });
    return () => unsub();
  }, []);

  // ── Sync email autenticado → currentUserId del equipo ───────
  useEffect(() => {
    if (!authUser || state.team.length === 0) return;
    const email  = (authUser.email || '').toLowerCase();
    const member = state.team.find(m => (m.email || '').toLowerCase() === email);
    if (member && member.id !== state.currentUserId) {
      dispatch({ type: 'set_user', id: member.id });
    }
  }, [authUser, state.team.length]);

  // ── Firestore: display settings (vista previa + carry-over) ───
  useEffect(() => {
    if (!authUser) return;
    const ref = window.db.collection('frame_config').doc('display_settings');
    const unsub = ref.onSnapshot((snap) => {
      if (!snap.exists) return;
      const data = snap.data();
      if (data.previewFields)               dispatch({ type: 'set_preview_fields',    fields: data.previewFields });
      if (data.carryOverProjects !== undefined) dispatch({ type: 'set_carryover_projects', value: data.carryOverProjects });
      // Sincronizar vista fija desde Firestore (cross-device)
      if ('pinnedView' in data) {
        const pv = data.pinnedView || null;
        dispatch({ type: 'set_pinned_view', view: pv });
        if (pv) localStorage.setItem('frame_pinned_view', pv);
        else    localStorage.removeItem('frame_pinned_view');
      }
    }, (err) => console.error('Display settings error:', err));
    return () => unsub();
  }, [authUser?.uid]);

  const handleTogglePreviewField = (key) => {
    const next = { ...state.previewFields, [key]: !state.previewFields[key] };
    dispatch({ type: 'set_preview_fields', fields: next });
    window.db.collection('frame_config').doc('display_settings')
      .set({ previewFields: next }, { merge: true })
      .catch(err => console.error('Error guardando display settings:', err));
  };

  const handlePinView = (view) => {
    const next = state.pinnedView === view ? null : view; // toggle: misma → quitar
    dispatch({ type: 'set_pinned_view', view: next });
    dispatch({ type: 'set_view',        view: next || view }); // ir a la vista al pinear
    if (next) localStorage.setItem('frame_pinned_view', next);
    else      localStorage.removeItem('frame_pinned_view');
    window.db.collection('frame_config').doc('display_settings')
      .set({ pinnedView: next }, { merge: true })
      .catch(err => console.error('[FRAME] PinView:', err));
  };

  const handleToggleCarryOverProjects = () => {
    const next = !state.carryOverProjects;
    dispatch({ type: 'set_carryover_projects', value: next });
    window.db.collection('frame_config').doc('display_settings')
      .set({ carryOverProjects: next }, { merge: true })
      .catch(err => console.error('[FRAME] CarryOver projects toggle:', err));
  };

  // ── Carry-over de proyectos con checklist pendiente ───────────
  useEffect(() => {
    if (!state.carryOverProjects || state.loading || state.projects.length === 0) return;

    const today = localISO(new Date());
    const storageKey = 'frame_carryover_' + today;
    if (localStorage.getItem(storageKey)) return; // Ya corrió hoy
    localStorage.setItem(storageKey, '1');

    const toUpdate = state.projects.filter(p => {
      // Solo con checklist parcial (tiene ítems y al menos uno sin completar)
      if (!p.checklist?.length || progressOf(p) >= 100) return false;
      // No archivar ni entregados
      if (p.status === 'delivered' || p.status === 'archived') return false;
      // La fecha de sesión o deadline tiene que ser pasada
      const refDate = p.sessionDate || p.deadline;
      return refDate && refDate < today;
    });

    if (toUpdate.length === 0) return;

    const batch = window.db.batch();
    toUpdate.forEach(p => {
      // Actualizar deadline Y sessionDate juntos → proyecto no aparece en dos días del calendario
      const updated = { ...p, sessionDate: today, deadline: today };
      dispatch({ type: 'update_project', project: updated });
      batch.update(window.db.collection('frame_projects').doc(p.id), { sessionDate: today, deadline: today });
    });
    batch.commit()
      .then(() => console.log(`[FRAME] CarryOver: ${toUpdate.length} proyecto(s) movido(s) a hoy`))
      .catch(err => console.error('[FRAME] CarryOver batch error:', err));
  }, [state.carryOverProjects, state.loading, state.projects.length]);

  // ── Firestore: columnas Kanban ─────────────────────────────
  useEffect(() => {
    if (!authUser) return;
    const ref = window.db.collection('frame_config').doc('kanban_columns');
    const unsub = ref.onSnapshot((snap) => {
      if (!snap.exists) {
        // Primera vez: sembrar con columnas por defecto
        const defaults = STATUSES
          .filter(s => s.id !== 'archived')
          .map(s => ({ id: s.id, label: s.label, color: s.color }));
        ref.set({ columns: defaults });
        dispatch({ type: 'set_columns', columns: defaults });
      } else {
        dispatch({ type: 'set_columns', columns: snap.data().columns || [] });
      }
    }, (err) => {
      console.error('Kanban columns error:', err);
      const defaults = STATUSES.filter(s => s.id !== 'archived').map(s => ({ id: s.id, label: s.label, color: s.color }));
      dispatch({ type: 'set_columns', columns: defaults });
    });
    return () => unsub();
  }, [authUser?.uid]);

  // ── Firestore: tipos de proyecto ──────────────────────────────
  useEffect(() => {
    if (!authUser) return;
    const ref = window.db.collection('frame_config').doc('project_types');
    const unsub = ref.onSnapshot((snap) => {
      if (!snap.exists) {
        // Primera vez: sembrar con los tipos predefinidos para que sean editables
        ref.set({ types: PROJECT_TYPES });
      } else {
        const types = snap.data().types || [];
        window.FRAME_CUSTOM_TYPES = types;
        dispatch({ type: 'set_custom_types', types });
      }
    }, (err) => {
      console.error('Custom types error:', err);
      window.FRAME_CUSTOM_TYPES = PROJECT_TYPES;
      dispatch({ type: 'set_custom_types', types: PROJECT_TYPES });
    });
    return () => unsub();
  }, [authUser?.uid]);

  const saveTypes = (types) =>
    window.db.collection('frame_config').doc('project_types').set({ types })
      .catch(err => console.error('Error al guardar tipos:', err));

  // ── Firestore: papelera de reciclaje ──────────────────────────
  useEffect(() => {
    if (!authUser) return;
    const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000;
    const col = window.db.collection('frame_trash');
    const unsub = col.onSnapshot(async (snap) => {
      const now = Date.now();
      // Auto-purge items older than 5 days
      const expired = snap.docs.filter(d => {
        const deletedAt = d.data().deletedAt;
        return deletedAt && (now - new Date(deletedAt).getTime()) > FIVE_DAYS_MS;
      });
      if (expired.length > 0) {
        await Promise.all(expired.map(d => d.ref.delete()));
      }
      const remaining = snap.docs
        .filter(d => {
          const deletedAt = d.data().deletedAt;
          return deletedAt && (now - new Date(deletedAt).getTime()) <= FIVE_DAYS_MS;
        })
        .map(d => normalizeProject({ ...d.data(), id: d.id }));
      dispatch({ type: 'set_trash', trash: remaining });
    }, (err) => {
      console.error('Trash listener error:', err);
      dispatch({ type: 'set_trash', trash: [] });
    });
    return () => unsub();
  }, [authUser?.uid]);

  const handleCreateCustomType = (typeObj) => {
    // Actualizar global ANTES del dispatch para que getType() lea datos correctos en el siguiente render
    window.FRAME_CUSTOM_TYPES = [...(window.FRAME_CUSTOM_TYPES || []), typeObj];
    dispatch({ type: 'add_custom_type', typeObj });
    window.db.collection('frame_config').doc('project_types').get()
      .then(snap => {
        const existing = snap.exists ? (snap.data().types || []) : PROJECT_TYPES;
        return saveTypes([...existing, typeObj]);
      })
      .catch(err => console.error('Error al crear tipo:', err));
  };
  const handleUpdateCustomType = (id, patch) => {
    // Sincronizar global antes del dispatch (optimistic sync)
    window.FRAME_CUSTOM_TYPES = (window.FRAME_CUSTOM_TYPES || []).map(t => t.id === id ? { ...t, ...patch } : t);
    dispatch({ type: 'update_custom_type', id, patch });
    window.db.collection('frame_config').doc('project_types').get()
      .then(snap => {
        const existing = snap.exists ? (snap.data().types || []) : PROJECT_TYPES;
        return saveTypes(existing.map(t => t.id === id ? { ...t, ...patch } : t));
      })
      .catch(err => console.error('Error al editar tipo:', err));
  };
  const handleDeleteCustomType = (id) => {
    window.FRAME_CUSTOM_TYPES = (window.FRAME_CUSTOM_TYPES || []).filter(t => t.id !== id);
    dispatch({ type: 'delete_custom_type', id });
    window.db.collection('frame_config').doc('project_types').get()
      .then(snap => {
        const existing = snap.exists ? (snap.data().types || []) : PROJECT_TYPES;
        return saveTypes(existing.filter(t => t.id !== id));
      })
      .catch(err => console.error('Error al eliminar tipo:', err));
  };

  const saveColumns = (cols) => {
    window.db.collection('frame_config').doc('kanban_columns').set({ columns: cols })
      .catch(err => console.error('Error guardando columnas:', err));
  };

  const handleUpdateColumn = (col) => {
    const updated = state.kanbanColumns.map(c => c.id === col.id ? col : c);
    dispatch({ type: 'update_column', column: col });
    saveColumns(updated);
  };
  const handleAddColumn = (col) => {
    const updated = [...state.kanbanColumns, col];
    dispatch({ type: 'add_column', column: col });
    saveColumns(updated);
  };
  const handleDeleteColumn = (id) => {
    const updated = state.kanbanColumns.filter(c => c.id !== id);
    dispatch({ type: 'delete_column', id });
    saveColumns(updated);
  };
  const handleReorderColumns = (newOrder) => {
    dispatch({ type: 'set_columns', columns: newOrder });
    saveColumns(newOrder);
  };

  // ── Firestore: notificaciones en tiempo real ────────────────
  useEffect(() => {
    if (!state.currentUserId) return;
    const col = window.db
      .collection('frame_notifications')
      .doc(String(state.currentUserId))
      .collection('items');
    const unsub = col.orderBy('createdAt', 'desc').limit(50).onSnapshot((snap) => {
      const notifs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      dispatch({ type: 'set_notifs', notifications: notifs });
    }, (err) => {
      console.error('Notifications listener error:', err);
      dispatch({ type: 'set_notifs', notifications: [] });
    });
    return () => unsub();
  }, [state.currentUserId]);

  // ── Notificaciones: handlers ────────────────────────────────
  const handleMarkRead = (id) => {
    dispatch({ type: 'mark_notif_read', id });
    window.db
      .collection('frame_notifications')
      .doc(String(state.currentUserId))
      .collection('items')
      .doc(id)
      .update({ read: true })
      .catch(err => console.error('Error al marcar notificación:', err));
  };

  const handleMarkAllRead = () => {
    const unread = state.notifications.filter(n => !n.read);
    if (unread.length === 0) return;
    dispatch({ type: 'mark_all_notifs_read' });
    const batch = window.db.batch();
    unread.forEach(n => {
      const ref = window.db
        .collection('frame_notifications')
        .doc(String(state.currentUserId))
        .collection('items')
        .doc(n.id);
      batch.update(ref, { read: true });
    });
    batch.commit().catch(err => console.error('Error al marcar todas leídas:', err));
  };

  // ── Escrituras a Firestore ──────────────────────────────────
  const handleDeleteProject = async (id) => {
    // 1. Grab full project data before removing from UI
    const project = state.projects.find(p => p.id === id);
    // 2. Optimistic UI removal
    dispatch({ type: 'delete_project', id });
    const col = window.db.collection('frame_projects');
    try {
      // 3. Move to frame_trash with deletedAt timestamp
      if (project) {
        const trashItem = { ...project, deletedAt: new Date().toISOString() };
        await window.db.collection('frame_trash').doc(id).set(trashItem);
        console.log('[FRAME] Proyecto movido a papelera:', id);
      }
      // 4. Remove from frame_projects
      const snap = await col.doc(id).get();
      if (snap.exists) {
        await col.doc(id).delete();
      } else {
        const q = await col.where('id', '==', id).get();
        if (!q.empty) {
          await Promise.all(q.docs.map(d => d.ref.delete()));
        }
      }
    } catch (err) {
      console.error('[FRAME] Error al mover a papelera:', err);
    }
  };

  const handleRestoreProject = async (item) => {
    // Strip deletedAt before restoring
    const { deletedAt, ...project } = item;
    // Optimistic: add back to projects, remove from trash
    dispatch({ type: 'restore_project', project });
    try {
      await window.db.collection('frame_projects').doc(project.id).set(project);
      await window.db.collection('frame_trash').doc(item.id).delete();
      console.log('[FRAME] Proyecto restaurado:', item.id);
    } catch (err) {
      console.error('[FRAME] Error al restaurar proyecto:', err);
    }
  };

  const handlePermanentDelete = async (id) => {
    dispatch({ type: 'remove_from_trash', id });
    try {
      await window.db.collection('frame_trash').doc(id).delete();
      console.log('[FRAME] Proyecto eliminado permanentemente:', id);
    } catch (err) {
      console.error('[FRAME] Error al eliminar permanentemente:', err);
    }
  };

  const handleDuplicateProject = (id) => {
    const original = state.projects.find(p => p.id === id);
    if (!original) return;
    const newId  = 'p' + Date.now() + Math.random().toString(36).slice(2, 5);
    const copy   = {
      ...original,
      id:        newId,
      title:     original.title + ' (copia)',
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'duplicate_project', project: copy });
    window.db.collection('frame_projects').doc(newId).set(copy)
      .catch(err => console.error('[FRAME] Error al duplicar proyecto:', err));
  };

  const handleUpdateProject = (project) => {
    dispatch({ type: 'update_project', project }); // optimistic: actualiza UI al instante
    window.db.collection('frame_projects').doc(project.id).set(project)
      .catch(err => console.error('Error al guardar proyecto:', err));
  };

  const handleCreateProject = (project) => {
    // Optimistic: dispatch first → snapshot replaces array (no duplicate)
    dispatch({ type: 'create_project', project });
    window.db.collection('frame_projects').doc(project.id).set(project)
      .catch(err => console.error('Error al crear proyecto:', err));
  };

  // ── Alta rápida inline desde tablero / calendario / galería ──────
  // Crea una tarjeta "vacía" con el título tipeado, heredando el contexto
  // donde se pulsó el "+" (estado de columna, fecha del día). No abre el modal.
  const handleQuickCreate = (opts = {}) => {
    const { title, status, sessionDate, deadline, type } = opts;
    const id = 'p' + Date.now() + Math.random().toString(36).slice(2, 5);
    const todayISO = localISO(new Date(TODAY));
    const defDeadline = (() => { const dt = new Date(TODAY); dt.setDate(dt.getDate() + 14); return localISO(dt); })();
    const dl = deadline || defDeadline;
    const project = {
      id,
      title:      (title && title.trim()) || 'Nuevo proyecto',
      client:     '',
      type:       type   || 'reel',
      status:     status || (state.kanbanColumns[0] && state.kanbanColumns[0].id) || 'briefing',
      priority:   'medium',
      assignees:  [],
      startDate:  todayISO,
      deadline:   dl,
      sessionDate: sessionDate || dl,
      budget:     0,
      currency:   'USD',
      tags:       [],
      cover:      { type: 'color', value: '#1a1a1f' },
      description: [{ type: 'p', text: '' }],
      checklist:   [],
      deliverables: [],
      timeline:    [],
      comments:    [],
    };
    dispatch({ type: 'create_project_quiet', project });
    window.db.collection('frame_projects').doc(id).set(project)
      .catch(err => console.error('[FRAME] Quick create:', err));
  };

  const handleToggleFavorite = (id) => {
    const project = state.projects.find(p => p.id === id);
    if (!project) return;
    const updated = { ...project, favorite: !project.favorite };
    dispatch({ type: 'update_project', project: updated });
    window.db.collection('frame_projects').doc(id).set(updated)
      .catch(err => console.error('[FRAME] Error al guardar favorito:', err));
  };

  const handleDeleteMember = (id) => {
    dispatch({ type: 'delete_member', id });
    window.db.collection('frame_users').doc(id).delete()
      .catch(err => console.error('Error al eliminar integrante:', err));
  };

  // ── Aprobación de nuevos usuarios ──────────────────────────────
  const handleApproveUser = (userId, notifId) => {
    const member = state.team.find(m => m.id === userId);
    if (member) dispatch({ type: 'update_member', member: { ...member, status: 'active' } });
    window.db.collection('frame_users').doc(userId).update({ status: 'active' })
      .catch(err => console.error('[FRAME] Error al aprobar usuario:', err));
    if (notifId) {
      dispatch({ type: 'resolve_notif', id: notifId, action: 'approved' });
      window.db.collection('frame_notifications')
        .doc(state.currentUserId).collection('items').doc(notifId)
        .update({ read: true, resolved: true, resolvedAction: 'approved' })
        .catch(err => console.error('[FRAME] Error al resolver notif:', err));
    }
  };

  const handleRejectUser = (userId, notifId) => {
    const member = state.team.find(m => m.id === userId);
    if (member) dispatch({ type: 'update_member', member: { ...member, status: 'rejected' } });
    window.db.collection('frame_users').doc(userId).update({ status: 'rejected' })
      .catch(err => console.error('[FRAME] Error al rechazar usuario:', err));
    if (notifId) {
      dispatch({ type: 'resolve_notif', id: notifId, action: 'rejected' });
      window.db.collection('frame_notifications')
        .doc(state.currentUserId).collection('items').doc(notifId)
        .update({ read: true, resolved: true, resolvedAction: 'rejected' })
        .catch(err => console.error('[FRAME] Error al resolver notif:', err));
    }
  };

  const handleUpdateMember = (member) => {
    dispatch({ type: 'update_member', member });
    window.db.collection('frame_users').doc(member.id).set(member)
      .catch(err => console.error('Error al guardar integrante:', err));
  };

  const handleCreateMember = (member) => {
    dispatch({ type: 'create_member', member });
    window.db.collection('frame_users').doc(member.id).set(member)
      .catch(err => console.error('Error al crear integrante:', err));
  };

  const handleDeleteClient = (id) => {
    dispatch({ type: 'delete_client', id });
    window.db.collection('frame_clients').doc(id).delete()
      .catch(err => console.error('Error al eliminar cliente:', err));
  };

  const handleUpdateClient = (client) => {
    dispatch({ type: 'update_client', client });
    window.db.collection('frame_clients').doc(client.id).set(client)
      .catch(err => console.error('Error al guardar cliente:', err));
  };

  const handleCreateClient = (client) => {
    dispatch({ type: 'create_client', client });
    window.db.collection('frame_clients').doc(client.id).set(client)
      .catch(err => console.error('Error al crear cliente:', err));
  };

  // El orden importa: los listeners de Firestore ahora solo corren con sesión
  // activa, así que teamLoading/loading siguen en true mientras no haya login.
  // Hay que descartar el caso "sin sesión" ANTES de mirar los flags de carga,
  // o la pantalla de login nunca llegaría a renderizarse.
  if (!authChecked) return <LoadingScreen />;
  if (!authUser)    return <LoginScreen />;
  if (state.teamLoading) return <LoadingScreen />;

  // Verificar estado de aprobación del usuario autenticado
  const _authEmail  = (authUser.email || '').toLowerCase();
  const _authMember = state.team.find(m => (m.email || '').toLowerCase() === _authEmail);
  if (_authMember?.status === 'pending')  return <PendingApprovalScreen member={_authMember} onSignOut={() => firebase.auth().signOut()} />;
  if (_authMember?.status === 'rejected') return <RejectedScreen        member={_authMember} onSignOut={() => firebase.auth().signOut()} />;

  if (state.loading) return <LoadingScreen />;

  return (
    <div className="h-screen flex" style={{ background: 'var(--bg)', position: 'relative', zIndex: 1 }}>
      <Sidebar state={state} dispatch={dispatch} onSignOut={() => firebase.auth().signOut()} />

      {state.section === 'clients' ? (
        <ClientsSection
          clients={state.clients}
          projects={state.projects}
          onCreateClient={handleCreateClient}
          onUpdateClient={handleUpdateClient}
          onDeleteClient={handleDeleteClient}
          openClientId={state.openClientId}
          onOpenClient={(id) => dispatch({ type: 'open_client', id })}
          onCloseClient={() => dispatch({ type: 'close_client' })}
        />
      ) : state.section === 'team' ? (
        <TeamSection
          team={state.team}
          projects={state.projects}
          onCreateMember={handleCreateMember}
          onUpdateMember={handleUpdateMember}
          onDeleteMember={handleDeleteMember}
          openMemberId={state.openMemberId}
          onOpenMember={(id) => dispatch({ type: 'open_member', id })}
          onCloseMember={() => dispatch({ type: 'close_member' })}
          currentUserId={state.currentUserId}
        />
      ) : state.section === 'analytics' ? (
        <AnalyticsSection
          projects={state.projects}
          clients={state.clients}
          team={state.team}
          currentUserId={state.currentUserId}
        />
      ) : state.section === 'settings' ? (
        <SettingsSection
          previewFields={state.previewFields}
          onToggle={handleTogglePreviewField}
          carryOverProjects={state.carryOverProjects}
          onToggleCarryOverProjects={handleToggleCarryOverProjects}
        />
      ) : state.section === 'trash' ? (
        <TrashSection
          trash={state.trash}
          onRestore={handleRestoreProject}
          onPermanentDelete={handlePermanentDelete}
        />
      ) : (
        <main className="flex-1 flex flex-col overflow-hidden">
          <Header
            state={state}
            dispatch={dispatch}
            filteredCount={filtered.length}
            notifications={state.notifications}
            onMarkRead={handleMarkRead}
            onMarkAllRead={handleMarkAllRead}
            onOpenProject={(id) => dispatch({ type: 'open_project', id })}
            onApproveUser={handleApproveUser}
            onRejectUser={handleRejectUser}
            onPinView={handlePinView}
          />
          {state.view === 'kanban' && <StatusStatsBar projects={filtered} />}

          <div className="flex-1 overflow-hidden">
            {filtered.length === 0 && state.view !== 'kanban' && state.view !== 'calendar' && state.view !== 'gallery' ? (
              <EmptyState />
            ) : (
              <>
                {state.view === 'kanban'   && <KanbanView
                  projects={filtered}
                  onOpenProject={(id) => dispatch({ type: 'open_project', id })}
                  onUpdateProject={handleUpdateProject}
                  onDeleteProject={handleDeleteProject}
                  onDuplicateProject={handleDuplicateProject}
                  onToggleFavorite={handleToggleFavorite}
                  onQuickCreate={handleQuickCreate}
                  columns={state.kanbanColumns}
                  onUpdateColumn={handleUpdateColumn}
                  onAddColumn={handleAddColumn}
                  onDeleteColumn={handleDeleteColumn}
                  onReorderColumns={handleReorderColumns}
                  previewFields={state.previewFields}
                />}
                {state.view === 'calendar' && <CalendarView projects={filtered} onOpenProject={(id) => dispatch({ type: 'open_project', id })} onDeleteProject={handleDeleteProject} onDuplicateProject={handleDuplicateProject} onToggleFavorite={handleToggleFavorite} onUpdateProject={handleUpdateProject} onQuickCreate={handleQuickCreate} previewFields={state.previewFields} />}
                {state.view === 'gallery'  && <GalleryView  projects={filtered} onOpenProject={(id) => dispatch({ type: 'open_project', id })} onDeleteProject={handleDeleteProject} onDuplicateProject={handleDuplicateProject} onToggleFavorite={handleToggleFavorite} onQuickCreate={handleQuickCreate} previewFields={state.previewFields} />}
                {state.view === 'list'     && <ListView     projects={filtered} onOpenProject={(id) => dispatch({ type: 'open_project', id })} onDeleteProject={handleDeleteProject} onDuplicateProject={handleDuplicateProject} onToggleFavorite={handleToggleFavorite} />}
              </>
            )}
          </div>
        </main>
      )}

      {openProject && (
        <ProjectModal
          key={openProject.id}
          project={openProject}
          projects={filtered}
          onNavigate={(id) => dispatch({ type: 'open_project', id })}
          currentUserId={state.currentUserId}
          team={state.team}
          clients={state.clients}
          onCreateClient={handleCreateClient}
          onClose={() => dispatch({ type: 'close_project' })}
          onUpdate={handleUpdateProject}
          onDelete={handleDeleteProject}
          customTypes={state.customTypes}
          onCreateCustomType={handleCreateCustomType}
          onUpdateCustomType={handleUpdateCustomType}
          onDeleteCustomType={handleDeleteCustomType}
        />
      )}

      {state.showNewProject && (
        <NewProjectModal
          onCreate={handleCreateProject}
          onClose={() => dispatch({ type: 'hide_new' })}
          clients={state.clients}
          onCreateClient={handleCreateClient}
          customTypes={state.customTypes}
        />
      )}

      {/* Widget flotante de rutina diaria */}
      <RoutineWidget />
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
