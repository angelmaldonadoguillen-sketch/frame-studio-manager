// ─────────────────────────────────────────────────────────────────
// PORTAL DE CLIENTE — proyección pública, nunca el documento interno
// ─────────────────────────────────────────────────────────────────

const createClientPortalToken = () => {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
};

const clientPortalUrl = (token) => {
  const url = new URL(window.location.href);
  url.search = '';
  url.hash = '';
  url.searchParams.set('portal', token);
  return url.toString();
};

const buildClientPortalDocument = (client, projects, workspace, published = client.portalPublished === true) => {
  const name = String(client.name || '').trim().toLowerCase();
  const visible = (projects || [])
    // Visible por defecto: al publicar un cliente entran todas sus tareas.
    // Sólo se excluye una cuando el creativo lo decide explícitamente.
    .filter(project => String(project.client || '').trim().toLowerCase() === name && project.clientVisible !== false)
    .map(project => {
      const checklist = project.checklist || [];
      const completed = checklist.filter(item => item.done).length;
      return {
        id: String(project.id),
        title: String(project.title || ''),
        type: getType(project.type).label,
        status: getStatus(project.status).label,
        statusId: String(project.status || ''),
        startDate: String(project.startDate || ''),
        deadline: String(project.deadline || ''),
        progress: checklist.length ? Math.round((completed / checklist.length) * 100) : (isClosed(project) ? 100 : 0),
        deliverables: (project.deliverables || []).filter(item => item.status === 'ready').map(item => ({
          name: String(item.name || 'Entregable'),
          kind: String(item.kind || 'file'),
          url: /^https:\/\//i.test(String(item.url || '')) ? String(item.url) : '',
        })).slice(0, 20),
      };
    })
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

  return {
    workspaceId: String(client.workspaceId || workspace?.id || ''),
    clientId: String(client.id),
    clientName: String(client.name || 'Cliente'),
    clientInitials: String(client.initials || String(client.name || 'Cliente').slice(0, 2).toUpperCase()).slice(0, 4),
    clientColor: String(client.color || 'var(--resource-blue)').slice(0, 64),
    studioName: String(workspace?.name || 'FRAME Studio'),
    studioAvatar: String(workspace?.members?.[workspace?.ownerId]?.avatar || ''),
    published: published === true,
    updatedAt: new Date().toISOString(),
    taskIds: published ? visible.slice(0, 100).map(task => task.id) : [],
    tasks: published ? visible.slice(0, 100) : [],
  };
};

const ClientPortal = ({ token }) => {
  const [portal, setPortal] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [unavailable, setUnavailable] = React.useState(false);
  const [calendarDate, setCalendarDate] = React.useState(() => new Date(TODAY));
  const [openTask, setOpenTask] = React.useState(null);
  const calendarScrollRef = React.useRef(null);

  React.useEffect(() => {
    if (!/^[a-f0-9]{48}$/.test(token || '')) { setUnavailable(true); setLoading(false); return; }
    const unsub = window.db.collection('frame_client_portals').doc(token).onSnapshot(doc => {
      if (!doc.exists || doc.data()?.published !== true) setUnavailable(true);
      else { setPortal(doc.data()); setUnavailable(false); }
      setLoading(false);
    }, () => { setUnavailable(true); setLoading(false); });
    return () => unsub();
  }, [token]);

  // Trackpad y Shift+rueda: el calendario es más ancho que el teléfono o una
  // ventana estrecha, pero algunos navegadores consumen deltaX antes de mover
  // un overflow anidado. El listener no pasivo sólo intercepta el gesto
  // claramente horizontal y conserva el scroll vertical de la página.
  React.useEffect(() => {
    const calendar = calendarScrollRef.current;
    if (!calendar) return;
    const onWheel = event => {
      const horizontalGesture = Math.abs(event.deltaX) > Math.abs(event.deltaY) * 0.75;
      if (!horizontalGesture && !event.shiftKey) return;
      const rawDelta = horizontalGesture ? event.deltaX : event.deltaY;
      const scale = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? calendar.clientWidth : 1;
      const before = calendar.scrollLeft;
      calendar.scrollLeft += rawDelta * scale;
      if (calendar.scrollLeft !== before) event.preventDefault();
    };
    calendar.addEventListener('wheel', onWheel, { passive: false });
    return () => calendar.removeEventListener('wheel', onWheel);
  }, [portal]);

  if (loading) return <LoadingScreen />;
  if (unavailable || !portal) return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bg)' }}>
      <div className="surf-panel max-w-md w-full p-8 text-center">
        <div className="w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center font-display font-bold text-xl" style={{ background: 'var(--accent)', color: 'var(--accent-on)' }}>F</div>
        <h1 className="font-display text-xl font-bold mb-2">Enlace no disponible</h1>
        <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>Este seguimiento no existe o el estudio dejó de compartirlo. Solicitá un enlace actualizado.</p>
      </div>
    </div>
  );

  const tasks = portal.tasks || [];
  const completed = tasks.filter(task => task.progress >= 100 || ['delivered', 'archived'].includes(task.statusId)).length;
  const overall = tasks.length ? Math.round(tasks.reduce((sum, task) => sum + Number(task.progress || 0), 0) / tasks.length) : 0;
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const first = new Date(year, month, 1);
  const gridStart = new Date(year, month, 1 - ((first.getDay() + 6) % 7));
  const calendarDays = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    return date;
  });
  const tasksByDate = tasks.reduce((map, task) => {
    const date = task.startDate || task.deadline;
    if (!date) return map;
    (map[date] ||= []).push(task);
    return map;
  }, {});
  const moveMonth = delta => setCalendarDate(new Date(year, month + delta, 1));

  return (
    // body está bloqueado por la aplicación principal. El portal necesita su
    // propio viewport desplazable; min-height lo hacía crecer fuera de una
    // página que no podía scrollear.
    <div className="h-screen overflow-y-auto overscroll-contain portal-page-scroll" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <header className="px-5 sm:px-8 py-5 border-b border-app" style={{ background: 'var(--surface)' }}>
        <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center font-display font-bold" style={{ background: 'var(--accent)', color: 'var(--accent-on)' }}>F</div>
            <div className="min-w-0"><div className="font-semibold truncate">{portal.studioName}</div><div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Seguimiento compartido</div></div>
          </div>
          <div className="text-[11px] tnum" style={{ color: 'var(--text-muted)' }}>Actualizado {relativeTime(portal.updatedAt)}</div>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto px-5 sm:px-8 py-8 sm:py-12">
        <div className="mb-10 max-w-5xl">
          <div className="text-[11px] uppercase tracking-[0.18em] mb-2" style={{ color: 'var(--text-muted)' }}>Progreso para</div>
          <h1 className="font-display text-3xl sm:text-5xl font-bold balance mb-6">{portal.clientName}</h1>
          <div className="surf-panel p-5 sm:p-6">
            <div className="flex items-end justify-between gap-4 mb-4"><div><div className="text-[12px]" style={{ color: 'var(--text-muted)' }}>Avance general</div><div className="font-display text-4xl font-bold tnum">{overall}%</div></div><div className="text-right text-[12px]" style={{ color: 'var(--text-muted)' }}>{completed} de {tasks.length} tareas completadas</div></div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--surface-3)' }}><div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${overall}%`, background: 'var(--accent)' }} /></div>
          </div>
        </div>

        <section>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div><h2 className="font-display text-lg font-bold">Calendario de trabajo</h2><div className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{tasks.length} tareas visibles</div></div>
            <div className="flex items-center gap-1">
              <button onClick={() => moveMonth(-1)} className="p-2 rounded-md hover:bg-[var(--surface-2)]" aria-label="Mes anterior"><Icon name="chevronLeft" size={14} /></button>
              <button onClick={() => setCalendarDate(new Date(TODAY))} className="px-3 py-1.5 rounded-md text-[11px] font-semibold hover:bg-[var(--surface-2)]">Hoy</button>
              <button onClick={() => moveMonth(1)} className="p-2 rounded-md hover:bg-[var(--surface-2)]" aria-label="Mes siguiente"><Icon name="chevronRight" size={14} /></button>
            </div>
          </div>

          <div className="surf-panel overflow-hidden">
            <div className="px-4 sm:px-5 py-4 border-b border-app font-display text-xl font-bold capitalize">
              {calendarDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
            </div>
            <div ref={calendarScrollRef} className="portal-calendar-scroll overflow-x-auto" style={{ overscrollBehaviorX: 'contain' }}>
              <div className="portal-calendar" role="grid" aria-label="Calendario mensual del trabajo">
                {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => <div key={day} className="portal-calendar-weekday">{day}</div>)}
                {calendarDays.map(date => {
                  const iso = localISO(date);
                  const dayTasks = tasksByDate[iso] || [];
                  const inMonth = date.getMonth() === month;
                  const today = iso === localISO(new Date(TODAY));
                  return (
                    <div key={iso} className="portal-calendar-day" data-outside={!inMonth || undefined} data-today={today || undefined} role="gridcell">
                      <div className="flex items-center justify-between mb-2"><span className="text-[11px] tnum font-semibold" style={{ color: today ? 'var(--accent)' : inMonth ? 'var(--text-dim)' : 'var(--text-faint)' }}>{date.getDate()}</span>{today && <span className="text-[9px] font-bold">HOY</span>}</div>
                      <div className="space-y-1.5">{dayTasks.map(task => (
                        <article key={task.id} className="portal-calendar-task cursor-pointer" title={`${task.title} · ${task.status}`} onClick={() => setOpenTask(task)}>
                          {task.deliverables?.find(item => item.kind === 'photos' && item.url) && <img src={task.deliverables.find(item => item.kind === 'photos' && item.url).url} alt="" className="portal-calendar-thumb" />}
                          <div className="text-[10px] font-semibold truncate">{task.title}</div>
                          <div className="flex items-center justify-between gap-1 mt-1"><span className="text-[9px] truncate" style={{ color: 'var(--text-muted)' }}>{task.status}</span><span className="flex items-center gap-1"><span className="text-[9px] tnum flex-shrink-0">{task.progress}%</span>{task.deliverables?.some(item => item.url) && <Icon name="link" size={9} />}</span></div>
                          <div className="h-0.5 rounded-full overflow-hidden mt-1.5" style={{ background: 'var(--surface-3)' }}><div className="h-full" style={{ width: `${task.progress}%`, background: task.progress >= 100 ? 'var(--resource-green)' : 'var(--accent)' }} /></div>
                          {task.deadline && <div className="text-[9px] tnum truncate mt-1.5" style={{ color: 'var(--text-faint)' }}>Entrega {fmtDate(task.deadline)}</div>}
                        </article>
                      ))}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {tasks.length === 0 && <div className="mt-4 surf p-8 text-center text-[13px]" style={{ color: 'var(--text-muted)' }}>El estudio todavía no publicó tareas en este seguimiento.</div>}
        </section>
      </main>
      {openTask && (
        <div className="fixed inset-0 z-50 backdrop flex items-center justify-center p-4" onClick={() => setOpenTask(null)}>
          <div className="surf-panel w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={event => event.stopPropagation()}>
            <div className="p-5 sm:p-7">
              <div className="flex items-start justify-between gap-4"><div><div className="text-[11px] mb-2" style={{ color: 'var(--text-muted)' }}>{openTask.type} · {openTask.status}</div><h2 className="font-display text-2xl font-bold pretty">{openTask.title}</h2></div><button onClick={() => setOpenTask(null)} className="p-2 rounded-md hover:bg-[var(--surface-3)]"><Icon name="x" size={15} /></button></div>
              <div className="grid grid-cols-2 gap-3 my-5"><div className="surf p-3"><div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Inicio</div><div className="font-semibold tnum">{fmtDate(openTask.startDate)}</div></div><div className="surf p-3"><div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Entrega</div><div className="font-semibold tnum">{fmtDate(openTask.deadline)}</div></div></div>
              {openTask.deliverables?.length > 0 && <section className="mb-6"><h3 className="text-[11px] uppercase tracking-[0.16em] mb-3" style={{ color: 'var(--text-muted)' }}>Recursos compartidos</h3><div className="grid grid-cols-2 sm:grid-cols-3 gap-2">{openTask.deliverables.map((item, index) => item.url ? <a key={index} href={item.url} target="_blank" rel="noopener noreferrer" className="surf overflow-hidden group">{item.kind === 'photos' ? <img src={item.url} alt={item.name} className="w-full h-24 object-cover transition-transform group-hover:scale-105" /> : <div className="h-20 flex items-center justify-center"><Icon name="external" size={18} /></div>}<div className="px-2.5 py-2 text-[10px] truncate">{item.name}</div></a> : <div key={index} className="surf px-3 py-3 text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>{item.name}</div>)}</div></section>}
              <SharedClientComments portalToken={token} projectId={openTask.id} authorType="client" authorName={portal.clientName} clientInitials={portal.clientInitials || ''} clientColor={portal.clientColor || ''} studioAvatar={portal.studioAvatar || ''} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

Object.assign(window, { ClientPortal, createClientPortalToken, clientPortalUrl, buildClientPortalDocument });
