// ─────────────────────────────────────────────────────────────────
// VIEWS — Calendar, Kanban, Gallery, List
// ─────────────────────────────────────────────────────────────────

// ── Project mini card (used in calendar + kanban) ──────────────
const ProjectCardMini = ({ project, onClick, draggable, onDragStart, onDragEnd, dragging, compact }) => {
  const t = getType(project.type);
  const days = daysUntil(project.deadline);
  const isUrgent = days >= 0 && days < 3 && project.status !== 'delivered' && project.status !== 'archived';
  const isOverdue = days < 0 && project.status !== 'delivered' && project.status !== 'archived';
  const progress = progressOf(project);

  return (
    <div
      onClick={onClick}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`group lift cursor-pointer rounded-lg border surface-2 overflow-hidden ${dragging ? 'dragging' : ''}`}
      style={{ borderColor: 'var(--border)' }}
    >
      <div className="h-1" style={{ background: t.color }}></div>
      <div className={compact ? 'p-2.5' : 'p-3'}>
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <TypePill type={project.type} />
          {isUrgent && (
            <span className="text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded" style={{ background: '#FF6B6B', color: '#0a0a0b' }}>URG</span>
          )}
          {isOverdue && (
            <span className="text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded" style={{ background: '#FF6B6B22', color: '#FF6B6B' }}>VENC</span>
          )}
        </div>
        <div className={`font-display font-semibold balance leading-tight mb-1 ${compact ? 'text-[12.5px]' : 'text-[13.5px]'}`}>
          {project.title}
        </div>
        <div className="text-[11px] text-[var(--text-muted)] mb-2.5">{project.client}</div>

        {/* progress */}
        <div className="h-1 rounded-full overflow-hidden mb-2.5" style={{ background: 'var(--surface-3)' }}>
          <div className="h-full" style={{ width: progress + '%', background: t.color }}></div>
        </div>

        <div className="flex items-center justify-between">
          <AvatarStack ids={project.assignees} size={18} max={3} />
          <div className="flex items-center gap-1 text-[10.5px] text-[var(--text-muted)] font-mono">
            <Icon name="calendar" size={10} />
            {fmtDate(project.deadline)}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── KANBAN VIEW ─────────────────────────────────────────────────
const KanbanView = ({ projects, onOpenProject, onUpdateProject }) => {
  const [draggingId, setDraggingId] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);
  const visibleStatuses = STATUSES.filter(s => s.id !== 'archived');

  const onDrop = (statusId) => (e) => {
    e.preventDefault();
    if (!draggingId) return;
    const p = projects.find(x => x.id === draggingId);
    if (p && p.status !== statusId) {
      onUpdateProject({ ...p, status: statusId });
    }
    setDraggingId(null);
    setDragOverCol(null);
  };

  return (
    <div className="h-full overflow-x-auto overflow-y-hidden p-4">
      <div className="flex gap-3 h-full" style={{ minWidth: 'fit-content' }}>
        {visibleStatuses.map(s => {
          const items = projects.filter(p => p.status === s.id);
          const isOver = dragOverCol === s.id;
          return (
            <div
              key={s.id}
              className={`flex flex-col w-[280px] flex-shrink-0 rounded-xl border ${isOver ? 'drag-over' : ''}`}
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
              onDragOver={(e) => { e.preventDefault(); setDragOverCol(s.id); }}
              onDragLeave={() => setDragOverCol(c => c === s.id ? null : c)}
              onDrop={onDrop(s.id)}
            >
              <div className="flex items-center justify-between px-3 py-3 border-b border-app">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: s.color }}></span>
                  <span className="text-[12px] font-semibold">{s.label}</span>
                  <span className="text-[11px] text-[var(--text-muted)] font-mono px-1.5 rounded" style={{ background: 'var(--surface-2)' }}>
                    {items.length}
                  </span>
                </div>
                <button className="text-[var(--text-muted)] hover:text-white p-1 rounded hover:bg-[var(--surface-2)]">
                  <Icon name="more" size={14} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {items.map(p => (
                  <ProjectCardMini
                    key={p.id}
                    project={p}
                    onClick={() => onOpenProject(p.id)}
                    draggable
                    onDragStart={() => setDraggingId(p.id)}
                    onDragEnd={() => { setDraggingId(null); setDragOverCol(null); }}
                    dragging={draggingId === p.id}
                  />
                ))}
                {items.length === 0 && (
                  <div className="text-center py-10 px-4 border border-dashed rounded-lg" style={{ borderColor: 'var(--border-2)' }}>
                    <div className="text-[var(--text-muted)] text-[11px]">Sin proyectos en {s.label.toLowerCase()}</div>
                    <div className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>Arrastrá una tarjeta acá</div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── CALENDAR VIEW ───────────────────────────────────────────────
const CalendarView = ({ projects, onOpenProject }) => {
  const [refDate, setRefDate] = useState(new Date(TODAY));
  const [mode, setMode] = useState('month'); // month | week | day

  const year = refDate.getFullYear();
  const month = refDate.getMonth();

  // Build month grid
  const monthGrid = useMemo(() => {
    const first = new Date(year, month, 1);
    const startDay = (first.getDay() + 6) % 7; // Mon-first
    const startDate = new Date(year, month, 1 - startDay);
    const cells = [];
    for (let i = 0; i < 42; i++) {
      const dt = new Date(startDate);
      dt.setDate(startDate.getDate() + i);
      cells.push(dt);
    }
    return cells;
  }, [year, month]);

  const projectsByDate = useMemo(() => {
    const map = {};
    projects.forEach(p => {
      [p.deadline, p.sessionDate].filter(Boolean).forEach(date => {
        if (!map[date]) map[date] = [];
        if (!map[date].some(x => x.id === p.id)) {
          map[date].push({ ...p, _kind: date === p.deadline ? 'deadline' : 'session' });
        }
      });
    });
    return map;
  }, [projects]);

  const monthLabel = refDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  const isSameDay = (a, b) => a.toDateString() === b.toDateString();
  const todayDt = new Date(TODAY);

  const goPrev = () => setRefDate(new Date(year, month - 1, 1));
  const goNext = () => setRefDate(new Date(year, month + 1, 1));
  const goToday = () => setRefDate(new Date(TODAY));

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-5 py-3 border-b border-app">
        <div className="flex items-center gap-3">
          <h2 className="font-display text-xl font-semibold capitalize" style={{ letterSpacing: '-0.01em' }}>
            {monthLabel}
          </h2>
          <div className="flex items-center gap-0.5 ml-2">
            <button onClick={goPrev} className="p-1.5 rounded hover:bg-[var(--surface-2)] text-[var(--text-dim)]">
              <Icon name="chevronLeft" size={14} />
            </button>
            <button onClick={goToday} className="px-2.5 py-1 rounded text-[11px] font-medium hover:bg-[var(--surface-2)] text-[var(--text-dim)]">
              Hoy
            </button>
            <button onClick={goNext} className="p-1.5 rounded hover:bg-[var(--surface-2)] text-[var(--text-dim)]">
              <Icon name="chevronRight" size={14} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1 p-0.5 rounded-md surface-2">
          {['month', 'week', 'day'].map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-2.5 py-1 rounded text-[11px] font-medium capitalize transition-colors ${mode === m ? 'bg-[var(--surface-3)] text-white' : 'text-[var(--text-dim)] hover:text-white'}`}
            >
              {m === 'month' ? 'Mes' : m === 'week' ? 'Semana' : 'Día'}
            </button>
          ))}
        </div>
      </div>

      {mode === 'month' && (
        <div className="flex-1 grid grid-rows-[auto_1fr] overflow-hidden">
          <div className="grid grid-cols-7 border-b border-app">
            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => (
              <div key={d} className="px-3 py-2 text-[10px] font-semibold tracking-[0.18em] uppercase text-[var(--text-muted)]">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 grid-rows-6 overflow-y-auto">
            {monthGrid.map((dt, i) => {
              const inMonth = dt.getMonth() === month;
              const iso = dt.toISOString().slice(0, 10);
              const items = projectsByDate[iso] || [];
              const isToday = isSameDay(dt, todayDt);
              return (
                <div
                  key={i}
                  className={`relative border-r border-b border-app p-1.5 min-h-[110px] ${inMonth ? '' : 'opacity-40'}`}
                  style={{ background: isToday ? 'var(--accent-soft)' : 'transparent' }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[11px] font-mono ${isToday ? 'font-bold' : 'text-[var(--text-muted)]'}`} style={{ color: isToday ? 'var(--accent)' : undefined }}>
                      {dt.getDate()}
                    </span>
                    {isToday && <span className="text-[8px] font-bold tracking-wider" style={{ color: 'var(--accent)' }}>HOY</span>}
                  </div>
                  <div className="space-y-1">
                    {items.slice(0, 3).map(p => {
                      const t = getType(p.type);
                      return (
                        <div
                          key={p.id + p._kind}
                          onClick={() => onOpenProject(p.id)}
                          className="cursor-pointer text-[10.5px] px-1.5 py-1 rounded truncate flex items-center gap-1 hover:brightness-125"
                          style={{ background: t.color + '22', color: t.color, borderLeft: `2px solid ${t.color}` }}
                          title={`${p.title} — ${p._kind === 'deadline' ? 'Deadline' : 'Sesión'}`}
                        >
                          <span className="truncate">{p._kind === 'session' ? '📷 ' : ''}{p.title}</span>
                        </div>
                      );
                    })}
                    {items.length > 3 && (
                      <div className="text-[10px] text-[var(--text-muted)] px-1.5">+{items.length - 3} más</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {mode === 'week' && (
        <WeekView refDate={refDate} projectsByDate={projectsByDate} onOpenProject={onOpenProject} />
      )}
      {mode === 'day' && (
        <DayView refDate={refDate} projectsByDate={projectsByDate} onOpenProject={onOpenProject} />
      )}
    </div>
  );
};

const WeekView = ({ refDate, projectsByDate, onOpenProject }) => {
  const start = new Date(refDate);
  const day = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - day);
  const days = Array.from({ length: 7 }, (_, i) => {
    const dt = new Date(start);
    dt.setDate(start.getDate() + i);
    return dt;
  });
  const todayDt = new Date(TODAY);
  return (
    <div className="flex-1 grid grid-cols-7 overflow-hidden">
      {days.map((dt, i) => {
        const iso = dt.toISOString().slice(0, 10);
        const items = projectsByDate[iso] || [];
        const isToday = dt.toDateString() === todayDt.toDateString();
        return (
          <div key={i} className="border-r border-app overflow-y-auto" style={{ background: isToday ? 'var(--accent-soft)' : 'transparent' }}>
            <div className="sticky top-0 px-3 py-2 border-b border-app surface flex items-baseline gap-2" style={{ background: 'var(--surface)' }}>
              <span className="text-[10px] tracking-[0.18em] uppercase text-[var(--text-muted)]">
                {dt.toLocaleDateString('es-ES', { weekday: 'short' })}
              </span>
              <span className={`text-lg font-display font-bold ${isToday ? '' : 'text-[var(--text-dim)]'}`} style={{ color: isToday ? 'var(--accent)' : undefined }}>
                {dt.getDate()}
              </span>
            </div>
            <div className="p-2 space-y-2">
              {items.length === 0 && <div className="text-[10px] text-[var(--text-muted)] text-center py-6">—</div>}
              {items.map(p => (
                <ProjectCardMini key={p.id + p._kind} project={p} onClick={() => onOpenProject(p.id)} compact />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const DayView = ({ refDate, projectsByDate, onOpenProject }) => {
  const iso = refDate.toISOString().slice(0, 10);
  const items = projectsByDate[iso] || [];
  return (
    <div className="flex-1 overflow-y-auto p-8 max-w-3xl mx-auto w-full">
      <div className="text-[11px] tracking-[0.18em] uppercase text-[var(--text-muted)] mb-2">
        {refDate.toLocaleDateString('es-ES', { weekday: 'long' })}
      </div>
      <h2 className="font-display text-5xl font-bold mb-8" style={{ letterSpacing: '-0.03em' }}>
        {refDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
      </h2>
      <div className="space-y-3">
        {items.length === 0 && (
          <div className="text-center py-20 border border-dashed rounded-xl" style={{ borderColor: 'var(--border-2)' }}>
            <div className="text-[var(--text-muted)] text-sm">Día libre — no hay proyectos programados</div>
          </div>
        )}
        {items.map(p => (
          <ProjectCardMini key={p.id + p._kind} project={p} onClick={() => onOpenProject(p.id)} />
        ))}
      </div>
    </div>
  );
};

// ── GALLERY VIEW ────────────────────────────────────────────────
const GalleryView = ({ projects, onOpenProject }) => {
  if (projects.length === 0) return <EmptyState />;
  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
        {projects.map(p => <GalleryCard key={p.id} project={p} onClick={() => onOpenProject(p.id)} />)}
      </div>
    </div>
  );
};

const GalleryCard = ({ project, onClick }) => {
  const t = getType(project.type);
  const progress = progressOf(project);
  const days = daysUntil(project.deadline);
  const isUrgent = days >= 0 && days < 3 && project.status !== 'delivered' && project.status !== 'archived';

  return (
    <div
      onClick={onClick}
      className="group lift cursor-pointer rounded-xl overflow-hidden border surface-2"
      style={{ borderColor: 'var(--border)' }}
    >
      <div className="relative aspect-[4/3] overflow-hidden" style={{ background: project.cover.type === 'color' ? project.cover.value : 'var(--surface-3)' }}>
        {project.cover.type === 'image' && (
          <img src={project.cover.value} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent"></div>
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
          <TypePill type={project.type} />
          {isUrgent && (
            <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded" style={{ background: '#FF6B6B', color: '#0a0a0b' }}>
              URGENTE
            </span>
          )}
        </div>
        <div className="absolute bottom-3 left-3 right-3">
          <StatusPill status={project.status} />
        </div>
      </div>
      <div className="p-3.5">
        <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider mb-1">{project.client}</div>
        <h3 className="font-display font-semibold text-[15px] leading-tight mb-3 balance" style={{ letterSpacing: '-0.01em' }}>
          {project.title}
        </h3>
        <div className="flex items-center justify-between mb-2.5">
          <AvatarStack ids={project.assignees} size={20} />
          <div className="text-[10px] text-[var(--text-muted)] font-mono">
            <Icon name="calendar" size={10} className="inline mr-1" />
            {fmtDate(project.deadline)}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'var(--surface-3)' }}>
            <div className="h-full transition-all duration-500" style={{ width: progress + '%', background: t.color }}></div>
          </div>
          <div className="text-[10px] font-mono" style={{ color: t.color }}>{progress}%</div>
        </div>
      </div>
    </div>
  );
};

// ── LIST VIEW ───────────────────────────────────────────────────
const ListView = ({ projects, onOpenProject }) => {
  if (projects.length === 0) return <EmptyState />;
  return (
    <div className="h-full overflow-auto">
      <table className="w-full text-[13px]">
        <thead className="sticky top-0 z-10 surface" style={{ background: 'var(--surface)' }}>
          <tr className="text-[10px] tracking-[0.18em] uppercase text-[var(--text-muted)]">
            <th className="text-left px-5 py-3 font-semibold border-b border-app w-[36%]">Proyecto</th>
            <th className="text-left px-3 py-3 font-semibold border-b border-app">Cliente</th>
            <th className="text-left px-3 py-3 font-semibold border-b border-app">Tipo</th>
            <th className="text-left px-3 py-3 font-semibold border-b border-app">Estado</th>
            <th className="text-left px-3 py-3 font-semibold border-b border-app">Equipo</th>
            <th className="text-left px-3 py-3 font-semibold border-b border-app">Deadline</th>
            <th className="text-left px-3 py-3 font-semibold border-b border-app">Prio</th>
            <th className="text-left px-3 py-3 font-semibold border-b border-app w-[120px]">Progreso</th>
          </tr>
        </thead>
        <tbody>
          {projects.map(p => {
            const t = getType(p.type);
            const days = daysUntil(p.deadline);
            const isUrgent = days >= 0 && days < 3 && p.status !== 'delivered' && p.status !== 'archived';
            const isOverdue = days < 0 && p.status !== 'delivered' && p.status !== 'archived';
            const progress = progressOf(p);
            return (
              <tr
                key={p.id}
                onClick={() => onOpenProject(p.id)}
                className="cursor-pointer border-b border-app hover:bg-[var(--surface-2)] transition-colors"
              >
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-1 h-8 rounded-full" style={{ background: t.color }}></div>
                    <div className="min-w-0">
                      <div className="font-medium truncate">{p.title}</div>
                      <div className="text-[11px] text-[var(--text-muted)] font-mono">
                        {p.tags.slice(0, 2).map(t => '#' + t).join(' ')}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3 text-[var(--text-dim)]">{p.client}</td>
                <td className="px-3 py-3"><TypePill type={p.type} /></td>
                <td className="px-3 py-3"><StatusPill status={p.status} /></td>
                <td className="px-3 py-3"><AvatarStack ids={p.assignees} size={20} max={3} /></td>
                <td className="px-3 py-3 font-mono text-[12px]">
                  <div className="flex items-center gap-2">
                    <span className={isOverdue ? 'text-[#FF6B6B]' : 'text-[var(--text-dim)]'}>
                      {fmtDate(p.deadline)}
                    </span>
                    {isUrgent && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: '#FF6B6B', color: '#0a0a0b' }}>URG</span>}
                    {isOverdue && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: '#FF6B6B22', color: '#FF6B6B' }}>VENC</span>}
                  </div>
                </td>
                <td className="px-3 py-3"><PriorityBadge priority={p.priority} /></td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'var(--surface-3)' }}>
                      <div className="h-full" style={{ width: progress + '%', background: t.color }}></div>
                    </div>
                    <span className="text-[10px] font-mono w-7 text-right" style={{ color: 'var(--text-muted)' }}>{progress}%</span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// ── EMPTY STATE ─────────────────────────────────────────────────
const EmptyState = ({ message = 'No hay proyectos que coincidan con tus filtros' }) => (
  <div className="h-full flex items-center justify-center p-10">
    <div className="text-center max-w-sm">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ background: 'var(--surface-2)' }}>
        <Icon name="inbox" size={26} className="text-[var(--text-muted)]" />
      </div>
      <div className="font-display text-lg font-semibold mb-1">Sin resultados</div>
      <div className="text-[13px] text-[var(--text-muted)] pretty">{message}</div>
    </div>
  </div>
);

Object.assign(window, {
  KanbanView, CalendarView, GalleryView, ListView, EmptyState, ProjectCardMini, GalleryCard,
});
