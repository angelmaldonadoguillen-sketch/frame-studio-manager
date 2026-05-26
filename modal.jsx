// ─────────────────────────────────────────────────────────────────
// PROJECT MODAL — Notion-style two-column panel
// ─────────────────────────────────────────────────────────────────

const { useState, useRef, useEffect, useMemo } = React;

// ── Avatar ──────────────────────────────────────────────────────
const Avatar = ({ user, size = 24, ring = false }) => {
  if (!user) return null;
  return (
    <div
      className={`rounded-full flex items-center justify-center font-semibold ${ring ? 'ring-2 ring-[#0a0a0b]' : ''}`}
      style={{
        width: size, height: size,
        background: user.color,
        color: '#0a0a0b',
        fontSize: Math.max(9, size * 0.4),
        letterSpacing: '0.02em',
      }}
      title={`${user.name} · ${user.role}`}
    >
      {user.initials}
    </div>
  );
};

const AvatarStack = ({ ids, size = 22, max = 4 }) => {
  const users = ids.map(getUser).filter(Boolean);
  const shown = users.slice(0, max);
  const extra = users.length - shown.length;
  return (
    <div className="flex items-center">
      {shown.map((u, i) => (
        <div key={u.id} style={{ marginLeft: i === 0 ? 0 : -6 }}>
          <Avatar user={u} size={size} ring />
        </div>
      ))}
      {extra > 0 && (
        <div
          className="rounded-full flex items-center justify-center text-[10px] font-semibold ring-2 ring-[#0a0a0b]"
          style={{ width: size, height: size, marginLeft: -6, background: '#26262d', color: '#9a9aa3' }}
        >
          +{extra}
        </div>
      )}
    </div>
  );
};

// ── Pills ───────────────────────────────────────────────────────
const StatusPill = ({ status, size = 'sm' }) => {
  const s = getStatus(status);
  if (!s) return null;
  const px = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md ${px} font-medium`}
      style={{ background: s.color + '22', color: s.color }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }}></span>
      {s.label}
    </span>
  );
};

const TypePill = ({ type, size = 'sm' }) => {
  const t = getType(type);
  if (!t) return null;
  const px = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md ${px} font-medium border`}
      style={{ borderColor: t.color + '44', color: t.color, background: t.color + '11' }}>
      <Icon name={t.icon} size={11} />
      {t.label}
    </span>
  );
};

const PriorityBadge = ({ priority }) => {
  const p = getPrio(priority);
  if (!p) return null;
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium" style={{ color: p.color }}>
      <Icon name="flag" size={11} />
      {p.label}
    </span>
  );
};

// ── Property row (Notion-style) ─────────────────────────────────
const PropRow = ({ icon, label, children }) => (
  <div className="grid grid-cols-[140px_1fr] gap-3 items-start py-1.5">
    <div className="flex items-center gap-2 text-[12px] text-[var(--text-muted)] pt-1">
      <Icon name={icon} size={13} />
      <span>{label}</span>
    </div>
    <div className="min-w-0">{children}</div>
  </div>
);

// ── Editable text ───────────────────────────────────────────────
const InlineEdit = ({ value, onChange, placeholder, className = '', multiline = false }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);

  const commit = () => {
    setEditing(false);
    if (draft !== value) onChange(draft);
  };

  if (editing) {
    return multiline ? (
      <textarea
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        rows={3}
        className={`${className} w-full bg-[var(--surface-2)] rounded px-2 py-1.5 resize-none`}
      />
    ) : (
      <input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setDraft(value); setEditing(false); } }}
        className={`${className} w-full bg-[var(--surface-2)] rounded px-2 py-1`}
      />
    );
  }
  return (
    <div
      onClick={() => setEditing(true)}
      className={`${className} cursor-text rounded px-2 py-1 -mx-2 hover:bg-[var(--surface-2)] transition-colors`}
    >
      {value || <span className="text-[var(--text-muted)]">{placeholder}</span>}
    </div>
  );
};

// ── Select dropdowns ────────────────────────────────────────────
const Dropdown = ({ trigger, children, align = 'left', width = 220 }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    if (open) document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);
  return (
    <div className="relative" ref={ref}>
      <div onClick={() => setOpen(o => !o)}>{trigger}</div>
      {open && (
        <div
          className={`absolute z-50 mt-1 rounded-lg border anim-scale-in shadow-2xl ${align === 'right' ? 'right-0' : 'left-0'}`}
          style={{ width, background: 'var(--surface-2)', borderColor: 'var(--border-2)' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-1">{typeof children === 'function' ? children(() => setOpen(false)) : children}</div>
        </div>
      )}
    </div>
  );
};

const MenuItem = ({ children, onClick, active }) => (
  <button
    onClick={onClick}
    className={`w-full text-left px-2.5 py-1.5 rounded-md text-[13px] flex items-center gap-2 transition-colors ${active ? 'bg-[var(--surface-3)]' : 'hover:bg-[var(--surface-3)]'}`}
  >
    {children}
  </button>
);

// ── Mention rendering ───────────────────────────────────────────
const renderWithMentions = (text) => {
  const parts = text.split(/(@[A-Za-zÀ-ÿ]+(?:\s[A-Za-zÀ-ÿ]+)?)/g);
  return parts.map((p, i) => {
    if (p.startsWith('@')) {
      return (
        <span key={i} className="rounded px-1 font-medium" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
          {p}
        </span>
      );
    }
    return <span key={i}>{p}</span>;
  });
};

// ── Cover ───────────────────────────────────────────────────────
const Cover = ({ cover, height = 180, className = '' }) => {
  if (cover.type === 'image') {
    return (
      <div className={`relative overflow-hidden ${className}`} style={{ height }}>
        <img src={cover.value} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface)] to-transparent opacity-60"></div>
      </div>
    );
  }
  return <div className={className} style={{ height, background: cover.value }}></div>;
};

// ── PROJECT MODAL ───────────────────────────────────────────────
const ProjectModal = ({ project, onClose, onUpdate, currentUserId }) => {
  const [tab, setTab] = useState('overview'); // overview | comments
  const [newComment, setNewComment] = useState('');

  if (!project) return null;

  const upd = (patch) => onUpdate({ ...project, ...patch });
  const updField = (key) => (val) => upd({ [key]: val });

  const toggleAssignee = (uid) => {
    const has = project.assignees.includes(uid);
    upd({ assignees: has ? project.assignees.filter(x => x !== uid) : [...project.assignees, uid] });
  };

  const toggleCheck = (id) => {
    upd({ checklist: project.checklist.map(c => c.id === id ? { ...c, done: !c.done } : c) });
  };
  const addCheck = (text) => {
    if (!text.trim()) return;
    upd({ checklist: [...project.checklist, { id: 'c' + Date.now(), text: text.trim(), done: false }] });
  };
  const removeCheck = (id) => upd({ checklist: project.checklist.filter(c => c.id !== id) });

  const addComment = () => {
    if (!newComment.trim()) return;
    const dt = new Date(TODAY);
    dt.setHours(14, 0, 0, 0);
    upd({
      comments: [
        ...project.comments,
        { id: 'cm' + Date.now(), userId: currentUserId, text: newComment.trim(), at: dt.toISOString().slice(0, 16) },
      ],
    });
    setNewComment('');
  };

  const addTag = (text) => {
    if (!text.trim()) return;
    upd({ tags: [...new Set([...project.tags, text.trim()])] });
  };
  const removeTag = (t) => upd({ tags: project.tags.filter(x => x !== t) });

  const toggleDeliverable = (id) => {
    upd({ deliverables: project.deliverables.map(dv => dv.id === id ? { ...dv, status: dv.status === 'ready' ? 'pending' : 'ready' } : dv) });
  };

  const progress = progressOf(project);
  const days = daysUntil(project.deadline);
  const isUrgent = days >= 0 && days < 3 && project.status !== 'delivered' && project.status !== 'archived';

  return (
    <div className="fixed inset-0 z-50 backdrop flex items-stretch justify-end anim-fade-in" onClick={onClose}>
      <div
        className="w-full max-w-[1200px] h-full surface border-l border-app overflow-hidden flex flex-col anim-slide-right"
        onClick={(e) => e.stopPropagation()}
        style={{ background: 'var(--surface)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-app">
          <div className="flex items-center gap-2 text-[12px] text-[var(--text-muted)]">
            <Icon name="folder" size={13} />
            <span>{project.client}</span>
            <span>›</span>
            <span className="text-[var(--text-dim)]">Proyecto</span>
          </div>
          <div className="flex items-center gap-1">
            {isUrgent && (
              <span className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-md mr-2"
                style={{ background: '#FF6B6B22', color: '#FF6B6B' }}>
                <Icon name="alert" size={11} /> URGENTE
              </span>
            )}
            <button className="p-2 rounded-md hover:bg-[var(--surface-2)] text-[var(--text-dim)]" onClick={onClose}>
              <Icon name="x" size={16} />
            </button>
          </div>
        </div>

        {/* Cover */}
        <div className="relative">
          <Cover cover={project.cover} height={180} />
          <div className="absolute bottom-4 left-6 right-6">
            <div className="flex items-center gap-2 mb-2">
              <TypePill type={project.type} size="md" />
              <StatusPill status={project.status} size="md" />
              <PriorityBadge priority={project.priority} />
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold balance" style={{ letterSpacing: '-0.02em' }}>
              <InlineEdit value={project.title} onChange={updField('title')} className="!px-0 !py-0 hover:!bg-transparent" />
            </h1>
          </div>
        </div>

        {/* Body — two column */}
        <div className="flex-1 grid grid-cols-[420px_1fr] overflow-hidden">
          {/* Left: properties */}
          <div className="border-r border-app overflow-y-auto p-5 space-y-1">
            <div className="text-[10px] font-semibold tracking-[0.18em] text-[var(--text-muted)] uppercase mb-3">Propiedades</div>

            <PropRow icon="briefcase" label="Cliente">
              <InlineEdit value={project.client} onChange={updField('client')} className="text-sm" />
            </PropRow>

            <PropRow icon="film" label="Tipo">
              <Dropdown trigger={<button className="text-left -mx-2 px-2 py-1 rounded hover:bg-[var(--surface-2)] w-full"><TypePill type={project.type} /></button>}>
                {(close) => PROJECT_TYPES.map(t => (
                  <MenuItem key={t.id} onClick={() => { upd({ type: t.id }); close(); }} active={project.type === t.id}>
                    <Icon name={t.icon} size={13} style={{ color: t.color }} />
                    <span>{t.label}</span>
                  </MenuItem>
                ))}
              </Dropdown>
            </PropRow>

            <PropRow icon="dot" label="Estado">
              <Dropdown trigger={<button className="text-left -mx-2 px-2 py-1 rounded hover:bg-[var(--surface-2)] w-full"><StatusPill status={project.status} /></button>}>
                {(close) => STATUSES.map(s => (
                  <MenuItem key={s.id} onClick={() => { upd({ status: s.id }); close(); }} active={project.status === s.id}>
                    <span className="w-2 h-2 rounded-full" style={{ background: s.color }}></span>
                    <span>{s.label}</span>
                  </MenuItem>
                ))}
              </Dropdown>
            </PropRow>

            <PropRow icon="flag" label="Prioridad">
              <Dropdown trigger={<button className="text-left -mx-2 px-2 py-1 rounded hover:bg-[var(--surface-2)] w-full"><PriorityBadge priority={project.priority} /></button>}>
                {(close) => PRIORITIES.map(p => (
                  <MenuItem key={p.id} onClick={() => { upd({ priority: p.id }); close(); }} active={project.priority === p.id}>
                    <Icon name="flag" size={11} style={{ color: p.color }} />
                    <span>{p.label}</span>
                  </MenuItem>
                ))}
              </Dropdown>
            </PropRow>

            <PropRow icon="users" label="Responsables">
              <Dropdown trigger={
                <button className="-mx-2 px-2 py-1 rounded hover:bg-[var(--surface-2)] w-full text-left">
                  {project.assignees.length > 0 ? (
                    <div className="flex items-center gap-2">
                      <AvatarStack ids={project.assignees} size={22} />
                      <span className="text-[12px] text-[var(--text-dim)]">
                        {project.assignees.map(id => getUser(id)?.name.split(' ')[0]).join(', ')}
                      </span>
                    </div>
                  ) : <span className="text-[var(--text-muted)] text-sm">Sin asignar</span>}
                </button>
              } width={240}>
                {USERS.map(u => (
                  <MenuItem key={u.id} onClick={() => toggleAssignee(u.id)} active={project.assignees.includes(u.id)}>
                    <Avatar user={u} size={20} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] truncate">{u.name}</div>
                      <div className="text-[10px] text-[var(--text-muted)]">{u.role}</div>
                    </div>
                    {project.assignees.includes(u.id) && <Icon name="check" size={13} style={{ color: 'var(--accent)' }} />}
                  </MenuItem>
                ))}
              </Dropdown>
            </PropRow>

            <PropRow icon="calendar" label="Inicio">
              <input
                type="date"
                value={project.startDate}
                onChange={(e) => updField('startDate')(e.target.value)}
                className="text-sm hover:bg-[var(--surface-2)] rounded px-2 py-1 -mx-2 cursor-pointer"
                style={{ colorScheme: 'dark' }}
              />
            </PropRow>

            <PropRow icon="calendar" label="Deadline">
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={project.deadline}
                  onChange={(e) => updField('deadline')(e.target.value)}
                  className="text-sm hover:bg-[var(--surface-2)] rounded px-2 py-1 -mx-2 cursor-pointer"
                  style={{ colorScheme: 'dark' }}
                />
                {isUrgent && <span className="text-[10px] font-semibold" style={{ color: '#FF6B6B' }}>en {days}d</span>}
              </div>
            </PropRow>

            <PropRow icon="zap" label="Presupuesto">
              <div className="flex items-center gap-1 text-sm">
                <span className="text-[var(--text-muted)]">{project.currency}</span>
                <InlineEdit
                  value={String(project.budget)}
                  onChange={(v) => updField('budget')(parseInt(v) || 0)}
                  className="font-mono"
                />
              </div>
            </PropRow>

            <PropRow icon="hash" label="Tags">
              <div className="flex flex-wrap gap-1.5 -mx-1">
                {project.tags.map(t => (
                  <span key={t} className="group flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] bg-[var(--surface-2)] text-[var(--text-dim)]">
                    #{t}
                    <button className="opacity-0 group-hover:opacity-100" onClick={() => removeTag(t)}>
                      <Icon name="x" size={10} />
                    </button>
                  </span>
                ))}
                <TagAdd onAdd={addTag} />
              </div>
            </PropRow>

            {/* Progress mini */}
            <div className="mt-6 pt-4 border-t border-app">
              <div className="flex items-center justify-between mb-2">
                <div className="text-[10px] font-semibold tracking-[0.18em] text-[var(--text-muted)] uppercase">Progreso</div>
                <div className="text-xs font-mono" style={{ color: 'var(--accent)' }}>{progress}%</div>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface-3)' }}>
                <div className="h-full transition-all duration-500" style={{ width: progress + '%', background: 'var(--accent)' }}></div>
              </div>
              <div className="text-[11px] text-[var(--text-muted)] mt-2">
                {project.checklist.filter(c => c.done).length} de {project.checklist.length} tareas completadas
              </div>
            </div>
          </div>

          {/* Right: content */}
          <div className="overflow-y-auto">
            {/* Tabs */}
            <div className="sticky top-0 z-10 surface border-b border-app px-6 flex items-center gap-1" style={{ background: 'var(--surface)' }}>
              {[{id:'overview',label:'Visión general',icon:'list'}, {id:'comments',label:`Comentarios · ${project.comments.length}`,icon:'message'}].map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`px-3 py-3 text-[13px] flex items-center gap-2 border-b-2 -mb-px transition-colors ${tab === t.id ? 'border-[var(--accent)] text-white' : 'border-transparent text-[var(--text-dim)] hover:text-white'}`}
                >
                  <Icon name={t.icon} size={13} />
                  {t.label}
                </button>
              ))}
            </div>

            {tab === 'overview' && (
              <div className="p-6 space-y-8">
                {/* Brief */}
                <section>
                  <SectionTitle icon="edit">Brief / Descripción</SectionTitle>
                  <DescriptionBlock blocks={project.description} onChange={updField('description')} />
                </section>

                {/* Checklist */}
                <section>
                  <SectionTitle icon="check" right={`${project.checklist.filter(c => c.done).length}/${project.checklist.length}`}>
                    Checklist de producción
                  </SectionTitle>
                  <div className="space-y-1">
                    {project.checklist.map(c => (
                      <div key={c.id} className="group flex items-center gap-2.5 py-1 px-2 -mx-2 rounded hover:bg-[var(--surface-2)]">
                        <span className={`check ${c.done ? 'on' : ''}`} onClick={() => toggleCheck(c.id)}>
                          {c.done && <Icon name="check" size={11} strokeWidth={3} />}
                        </span>
                        <span className={`flex-1 text-[13.5px] ${c.done ? 'line-through text-[var(--text-muted)]' : ''}`}>
                          {c.text}
                        </span>
                        <button onClick={() => removeCheck(c.id)} className="opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-[#FF6B6B]">
                          <Icon name="trash" size={13} />
                        </button>
                      </div>
                    ))}
                    <ChecklistAdd onAdd={addCheck} />
                  </div>
                </section>

                {/* Deliverables */}
                <section>
                  <SectionTitle icon="upload">Entregables</SectionTitle>
                  <div className="space-y-1">
                    {project.deliverables.map(dv => (
                      <div key={dv.id} className="flex items-center gap-3 py-2 px-3 rounded-md border border-app surface-2">
                        <Icon name={dv.kind === 'video' ? 'film' : dv.kind === 'photos' ? 'camera' : 'mic'} size={14} className="text-[var(--text-dim)]" />
                        <span className="flex-1 text-[13px]">{dv.name}</span>
                        <button
                          onClick={() => toggleDeliverable(dv.id)}
                          className="text-[11px] font-medium px-2 py-0.5 rounded-md"
                          style={{
                            background: dv.status === 'ready' ? '#7DD3C022' : '#9A9AA322',
                            color: dv.status === 'ready' ? '#7DD3C0' : '#9A9AA3',
                          }}
                        >
                          {dv.status === 'ready' ? '✓ Listo' : 'Pendiente'}
                        </button>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Timeline */}
                <section>
                  <SectionTitle icon="clock">Timeline interno</SectionTitle>
                  <div className="relative pl-4">
                    <div className="absolute left-[5px] top-1 bottom-1 w-px bg-[var(--border-2)]"></div>
                    {project.timeline.map((t, i) => (
                      <div key={t.id} className="relative flex items-start gap-3 py-2">
                        <div
                          className="absolute -left-[11px] top-3 w-2.5 h-2.5 rounded-full ring-4"
                          style={{
                            background: t.status === 'done' ? 'var(--accent)' : 'var(--surface-3)',
                            ringColor: 'var(--surface)',
                            boxShadow: '0 0 0 4px var(--surface)',
                          }}
                        ></div>
                        <div className="ml-3 flex-1 flex items-center justify-between">
                          <div>
                            <div className={`text-[13px] ${t.status === 'done' ? 'text-[var(--text-dim)]' : ''}`}>{t.label}</div>
                            <div className="text-[11px] text-[var(--text-muted)] font-mono">{fmtDateLong(t.date)}</div>
                          </div>
                          {t.status === 'done' && <span className="text-[10px]" style={{ color: 'var(--accent)' }}>✓ HECHO</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {tab === 'comments' && (
              <CommentsTab
                project={project}
                currentUserId={currentUserId}
                newComment={newComment}
                setNewComment={setNewComment}
                onSend={addComment}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const SectionTitle = ({ icon, right, children }) => (
  <div className="flex items-center justify-between mb-3">
    <div className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] text-[var(--text-muted)] uppercase">
      <Icon name={icon} size={12} />
      {children}
    </div>
    {right && <span className="text-[11px] text-[var(--text-muted)] font-mono">{right}</span>}
  </div>
);

const TagAdd = ({ onAdd }) => {
  const [v, setV] = useState('');
  return (
    <input
      value={v}
      onChange={(e) => setV(e.target.value)}
      onKeyDown={(e) => { if (e.key === 'Enter') { onAdd(v); setV(''); } }}
      placeholder="+ tag"
      className="px-2 py-0.5 rounded-md text-[11px] bg-transparent border border-dashed border-[var(--border-2)] focus:border-[var(--accent)] hover:border-[var(--text-muted)]"
      style={{ width: 70 }}
    />
  );
};

const ChecklistAdd = ({ onAdd }) => {
  const [v, setV] = useState('');
  return (
    <div className="flex items-center gap-2.5 py-1 px-2 -mx-2">
      <span className="check"></span>
      <input
        value={v}
        onChange={(e) => setV(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && v.trim()) { onAdd(v); setV(''); } }}
        placeholder="Agregar tarea…"
        className="flex-1 text-[13.5px]"
      />
    </div>
  );
};

const DescriptionBlock = ({ blocks, onChange }) => {
  return (
    <div className="prose prose-invert max-w-none text-[14px] leading-relaxed text-[var(--text-dim)] space-y-2 pretty">
      {blocks.map((b, i) => {
        if (b.type === 'p') return <p key={i}>{b.text}</p>;
        if (b.type === 'b') return <p key={i} className="text-white font-semibold">{b.text}</p>;
        if (b.type === 'ul') return (
          <ul key={i} className="list-disc pl-5 space-y-1">
            {b.items.map((it, j) => <li key={j}>{it}</li>)}
          </ul>
        );
        return null;
      })}
    </div>
  );
};

const CommentsTab = ({ project, currentUserId, newComment, setNewComment, onSend }) => {
  const me = getUser(currentUserId);
  const [showMentions, setShowMentions] = useState(false);
  const inputRef = useRef(null);

  const insertMention = (user) => {
    setNewComment(c => c + (c.endsWith('@') ? user.name + ' ' : '@' + user.name + ' '));
    setShowMentions(false);
    inputRef.current?.focus();
  };

  return (
    <div className="p-6 flex flex-col h-full" style={{ minHeight: 'calc(100% - 0px)' }}>
      <div className="flex-1 space-y-5">
        {project.comments.length === 0 && (
          <div className="text-center py-12 text-[var(--text-muted)]">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full surface-2 mb-3">
              <Icon name="message" size={18} />
            </div>
            <div className="text-sm">Aún no hay comentarios</div>
            <div className="text-[12px] mt-1">Sé el primero en dejar un comentario en este proyecto</div>
          </div>
        )}
        {project.comments.map(c => {
          const u = getUser(c.userId);
          return (
            <div key={c.id} className="flex gap-3">
              <Avatar user={u} size={32} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[13px] font-semibold">{u?.name}</span>
                  <span className="text-[11px] text-[var(--text-muted)]">{u?.role}</span>
                  <span className="text-[11px] text-[var(--text-muted)]">·</span>
                  <span className="text-[11px] text-[var(--text-muted)]">{relativeTime(c.at)}</span>
                </div>
                <div className="text-[14px] leading-relaxed pretty">{renderWithMentions(c.text)}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Composer */}
      <div className="sticky bottom-0 mt-6 pt-4 border-t border-app" style={{ background: 'var(--surface)' }}>
        <div className="flex gap-3">
          <Avatar user={me} size={32} />
          <div className="flex-1 surface-2 rounded-lg border border-app focus-within:border-[var(--border-2)]">
            <div className="relative">
              <textarea
                ref={inputRef}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === '@') setShowMentions(true);
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); onSend(); }
                }}
                placeholder="Escribí un comentario… usa @ para mencionar"
                rows={2}
                className="w-full px-3 py-2.5 text-[13.5px] resize-none"
              />
              {showMentions && (
                <div className="absolute bottom-full mb-2 left-0 surface-2 border border-app rounded-lg shadow-2xl p-1 z-10" style={{ minWidth: 200 }}>
                  <div className="text-[10px] font-semibold tracking-wider text-[var(--text-muted)] px-2 py-1">EQUIPO</div>
                  {USERS.map(u => (
                    <MenuItem key={u.id} onClick={() => insertMention(u)}>
                      <Avatar user={u} size={20} />
                      <span className="text-[12px]">{u.name}</span>
                    </MenuItem>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center justify-between px-2 py-1.5 border-t border-app">
              <div className="flex gap-0.5">
                <FormatBtn icon="bold" />
                <FormatBtn icon="italic" />
                <FormatBtn icon="listBullets" />
                <FormatBtn icon="at" onClick={() => setShowMentions(s => !s)} />
                <FormatBtn icon="paperclip" />
              </div>
              <button
                onClick={onSend}
                disabled={!newComment.trim()}
                className="flex items-center gap-1.5 px-3 py-1 rounded-md text-[12px] font-semibold transition-all disabled:opacity-40"
                style={{ background: 'var(--accent)', color: '#0a0a0b' }}
              >
                Enviar
                <Icon name="send" size={11} />
              </button>
            </div>
          </div>
        </div>
        <div className="text-[10px] text-[var(--text-muted)] mt-2 ml-11">⌘ + Enter para enviar</div>
      </div>
    </div>
  );
};

const FormatBtn = ({ icon, onClick }) => (
  <button onClick={onClick} className="p-1.5 rounded text-[var(--text-muted)] hover:text-white hover:bg-[var(--surface-3)]">
    <Icon name={icon} size={13} />
  </button>
);

Object.assign(window, {
  Avatar, AvatarStack, StatusPill, TypePill, PriorityBadge, Cover,
  ProjectModal, Dropdown, MenuItem, renderWithMentions,
});
