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

// ── Cover editor ────────────────────────────────────────────────
const COVER_PRESETS = [
  '#0a0a0b', '#0f1923', '#1a0a2e', '#0a1628', '#1f0a14',
  '#1a1200', '#0a2010', '#2a1000', '#111827', '#1a1016',
];

const CoverEditor = ({ cover, onChange, projectId }) => {
  const [open, setOpen]           = useState(false);
  const [pos, setPos]             = useState({ top: 0, right: 0 });
  const [urlVal, setUrlVal]       = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress]   = useState(0);
  const btnRef   = useRef(null);
  const panelRef = useRef(null);
  const fileRef  = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (!btnRef.current?.contains(e.target) && !panelRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const openPanel = () => {
    const r = btnRef.current?.getBoundingClientRect();
    if (r) setPos({ top: r.bottom + 6, right: window.innerWidth - r.right });
    setOpen(v => !v);
  };

  const applyUrl = () => {
    if (!urlVal.trim()) return;
    onChange({ type: 'image', value: urlVal.trim() });
    setUrlVal('');
    setOpen(false);
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    setUploading(true);
    setProgress(0);
    const path  = `frame-covers/${projectId || 'general'}/${Date.now()}_${file.name}`;
    const stRef = window.storage.ref(path);
    const task  = stRef.put(file);
    task.on('state_changed',
      (snap) => setProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
      (err)  => { console.error('Storage upload error:', err); setUploading(false); },
      async () => {
        const url = await task.snapshot.ref.getDownloadURL();
        onChange({ type: 'image', value: url });
        setUploading(false);
        setProgress(0);
        setOpen(false);
      }
    );
    e.target.value = '';
  };

  // Panel rendered via portal → escapes overflow:hidden of the modal
  const panel = open && ReactDOM.createPortal(
    <div
      ref={panelRef}
      className="anim-scale-in"
      style={{
        position: 'fixed', top: pos.top, right: pos.right,
        width: 268, zIndex: 9999,
        background: 'var(--surface-2)',
        borderRadius: 14,
        border: '1px solid var(--border-2)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
        padding: '16px',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* ── Colores ── */}
      <div className="text-[10px] font-semibold tracking-[0.18em] text-[var(--text-muted)] uppercase mb-3">Color de fondo</div>
      <div className="grid grid-cols-5 gap-2 mb-4">
        {COVER_PRESETS.map(c => (
          <button
            key={c}
            onClick={() => { onChange({ type: 'color', value: c }); setOpen(false); }}
            className="aspect-square rounded-lg border-2 transition-all hover:scale-105"
            style={{
              background: c,
              borderColor: cover.type === 'color' && cover.value === c ? 'var(--accent)' : 'var(--border)',
              minHeight: 36,
            }}
          />
        ))}
      </div>

      {/* ── Subir archivo ── */}
      <div className="text-[10px] font-semibold tracking-[0.18em] text-[var(--text-muted)] uppercase mb-2">Subir imagen</div>
      {uploading ? (
        <div className="space-y-1.5 mb-3">
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface-3)' }}>
            <div className="h-full transition-all duration-200" style={{ width: `${progress}%`, background: 'var(--accent)' }}></div>
          </div>
          <div className="text-[11px] text-center font-mono" style={{ color: 'var(--accent)' }}>{progress}% — subiendo…</div>
        </div>
      ) : (
        <button
          onClick={() => fileRef.current?.click()}
          className="w-full mb-3 py-2 rounded-lg text-[12px] font-medium border border-dashed flex items-center justify-center gap-2 transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
          style={{ borderColor: 'var(--border-2)', color: 'var(--text-dim)' }}
        >
          <Icon name="upload" size={13} />
          Elegir archivo
        </button>
      )}
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

      {/* ── URL manual ── */}
      <div className="text-[10px] font-semibold tracking-[0.18em] text-[var(--text-muted)] uppercase mb-2">URL de imagen</div>
      <div className="flex gap-2">
        <input
          value={urlVal}
          onChange={(e) => setUrlVal(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') applyUrl(); }}
          placeholder="https://…"
          className="flex-1 px-2.5 py-1.5 rounded-md text-[12px] border"
          style={{ background: 'var(--surface-3)', borderColor: 'var(--border-2)', color: 'var(--text)' }}
        />
        <button
          onClick={applyUrl}
          disabled={!urlVal.trim()}
          className="px-3 py-1.5 rounded-md text-[12px] font-semibold disabled:opacity-40"
          style={{ background: 'var(--accent)', color: '#0a0a0b' }}
        >
          OK
        </button>
      </div>

      {cover.type === 'image' && (
        <button
          onClick={() => { onChange({ type: 'color', value: '#0a0a0b' }); setOpen(false); }}
          className="mt-3 w-full text-center text-[11px] text-[var(--text-muted)] hover:text-white border-t border-app pt-3"
        >
          Quitar imagen
        </button>
      )}
    </div>,
    document.body
  );

  return (
    <>
      <button
        ref={btnRef}
        onClick={openPanel}
        className="absolute top-3 right-3 z-10 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[12px] font-medium"
        style={{ background: 'rgba(0,0,0,0.55)', color: 'white', backdropFilter: 'blur(6px)' }}
      >
        <Icon name="image" size={12} /> Portada
      </button>
      {panel}
    </>
  );
};

// ── PROJECT MODAL ───────────────────────────────────────────────
const ProjectModal = ({ project, onClose, onUpdate, currentUserId, team = [], clients = [], onCreateClient }) => {
  // Lookup que prioriza el equipo real de Firestore sobre los datos seed
  const resolveUser = (id) => team.find(m => m.id === id) || getUser(id);
  const [tab, setTab]                         = useState('overview'); // overview | comments
  const [newComment, setNewComment]           = useState('');
  const [comments, setComments]               = useState(() => project?.comments || []);
  const [commentsLoading, setCommentsLoading] = useState(true);

  // ── Listener de comentarios en tiempo real ────────────────────
  useEffect(() => {
    if (!project?.id) return;
    const col = window.db
      .collection('frame_projects')
      .doc(project.id)
      .collection('comments');
    const unsub = col.orderBy('at', 'asc').onSnapshot(async (snap) => {
      if (snap.empty && (project.comments || []).length > 0) {
        // Primera vez: migrar array de comentarios a subcollection
        const batch = window.db.batch();
        (project.comments || []).forEach(c => batch.set(col.doc(c.id), c));
        await batch.commit();
        // El listener disparará de nuevo con los datos migrados
      } else {
        setComments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setCommentsLoading(false);
      }
    }, (err) => {
      console.error('Comments listener error:', err);
      setComments(project.comments || []);
      setCommentsLoading(false);
    });
    return () => unsub();
  }, [project?.id]);

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
    const comment = {
      id:     'cm' + Date.now(),
      userId: currentUserId,
      text:   newComment.trim(),
      at:     new Date().toISOString().slice(0, 16),
    };
    // ── Detectar @menciones y notificar ──────────────────────
    if (window.pushNotif) {
      const mentionRe = /@([A-Za-zÀ-ÿ]+(?:\s[A-Za-zÀ-ÿ]+)?)/g;
      // Combinar USERS seed + equipo real de Firestore (sin duplicados)
      const allMembers = [...USERS];
      team.forEach(m => { if (!allMembers.find(u => u.id === m.id)) allMembers.push(m); });
      const mentioned = new Set();
      let m;
      while ((m = mentionRe.exec(comment.text)) !== null) {
        const fragment = m[1].toLowerCase();
        const u = allMembers.find(u => u.name && u.name.toLowerCase().startsWith(fragment));
        if (u && u.id !== currentUserId) mentioned.add(u.id);
      }
      const sender = resolveUser(currentUserId);
      const preview = comment.text.length > 80 ? comment.text.slice(0, 80) + '…' : comment.text;
      mentioned.forEach(uid => window.pushNotif(uid, {
        type: 'mention',
        body: `${sender?.name || 'Alguien'} te mencionó: "${preview}"`,
        projectId: project.id,
        projectTitle: project.title,
      }));
    }
    setNewComment('');
    window.db.collection('frame_projects').doc(project.id)
      .collection('comments').doc(comment.id).set(comment)
      .catch(err => {
        console.error('Error al enviar comentario:', err);
        setComments(prev => [...prev, comment]); // fallback optimista
      });
  };

  const addTag = (text) => {
    if (!text.trim()) return;
    upd({ tags: [...new Set([...project.tags, text.trim()])] });
  };
  const removeTag = (t) => upd({ tags: project.tags.filter(x => x !== t) });

  const toggleDeliverable = (id) => {
    upd({ deliverables: project.deliverables.map(dv => dv.id === id ? { ...dv, status: dv.status === 'ready' ? 'pending' : 'ready' } : dv) });
  };
  const addDeliverable    = (dv)  => upd({ deliverables: [...project.deliverables, dv] });
  const removeDeliverable = (id)  => upd({ deliverables: project.deliverables.filter(dv => dv.id !== id) });

  const addTimelineItem = (item) => upd({ timeline: [...project.timeline, item] });
  const toggleTimeline  = (id)   => upd({ timeline: project.timeline.map(t => t.id === id ? { ...t, status: t.status === 'done' ? 'pending' : 'done' } : t) });
  const removeTimeline  = (id)   => upd({ timeline: project.timeline.filter(t => t.id !== id) });

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
          <CoverEditor cover={project.cover} onChange={(cover) => upd({ cover })} projectId={project.id} />
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
              <ClientAutocomplete
                value={project.client}
                onChange={updField('client')}
                clients={clients}
                onCreateClient={onCreateClient}
              />
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
                  <MenuItem key={s.id} onClick={() => {
                    if (s.id !== project.status && window.pushNotif) {
                      const changer = resolveUser(currentUserId);
                      const newSt   = getStatus(s.id);
                      project.assignees.forEach(uid => {
                        if (uid !== currentUserId) {
                          window.pushNotif(uid, {
                            type: 'status',
                            body: `${changer?.name || 'Alguien'} cambió "${project.title}" → ${newSt?.label || s.id}`,
                            projectId: project.id,
                            projectTitle: project.title,
                          });
                        }
                      });
                    }
                    upd({ status: s.id });
                    close();
                  }} active={project.status === s.id}>
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
                        {project.assignees.map(id => resolveUser(id)?.name.split(' ')[0]).join(', ')}
                      </span>
                    </div>
                  ) : <span className="text-[var(--text-muted)] text-sm">Sin asignar</span>}
                </button>
              } width={240}>
                {team.length === 0 ? (
                  <div className="px-3 py-4 text-center text-[12px] text-[var(--text-muted)]">
                    Sin integrantes registrados
                  </div>
                ) : team.map(u => (
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
              {[{id:'overview',label:'Visión general',icon:'list'}, {id:'comments',label:`Comentarios · ${comments.length}`,icon:'message'}].map(t => (
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
                  <DescriptionEditor blocks={project.description} onChange={updField('description')} />
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
                      <div key={dv.id} className="group flex items-center gap-3 py-2 px-3 rounded-md border border-app surface-2">
                        <Icon name={dv.kind === 'video' ? 'film' : dv.kind === 'photos' ? 'camera' : 'mic'} size={14} className="text-[var(--text-dim)]" />
                        <span className="flex-1 text-[13px]">{dv.name}</span>
                        <button
                          onClick={() => toggleDeliverable(dv.id)}
                          className="text-[11px] font-medium px-2 py-0.5 rounded-md transition-colors"
                          style={{
                            background: dv.status === 'ready' ? '#7DD3C022' : '#9A9AA322',
                            color: dv.status === 'ready' ? '#7DD3C0' : '#9A9AA3',
                          }}
                        >
                          {dv.status === 'ready' ? '✓ Listo' : 'Pendiente'}
                        </button>
                        <button onClick={() => removeDeliverable(dv.id)} className="opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-[#FF6B6B] transition-opacity">
                          <Icon name="trash" size={13} />
                        </button>
                      </div>
                    ))}
                    <DeliverableAdd onAdd={addDeliverable} />
                  </div>
                </section>

                {/* Timeline */}
                <section>
                  <SectionTitle icon="clock">Timeline interno</SectionTitle>
                  <div className="relative pl-4">
                    <div className="absolute left-[5px] top-1 bottom-1 w-px bg-[var(--border-2)]"></div>
                    {project.timeline.map((t, i) => (
                      <div key={t.id} className="group relative flex items-start gap-3 py-2">
                        <button
                          onClick={() => toggleTimeline(t.id)}
                          title={t.status === 'done' ? 'Marcar pendiente' : 'Marcar como hecho'}
                          className="absolute -left-[11px] top-3 w-2.5 h-2.5 rounded-full hover:scale-125 transition-transform"
                          style={{
                            background: t.status === 'done' ? 'var(--accent)' : 'var(--surface-3)',
                            boxShadow: '0 0 0 4px var(--surface)',
                          }}
                        ></button>
                        <div className="ml-3 flex-1 flex items-center justify-between">
                          <div>
                            <div className={`text-[13px] ${t.status === 'done' ? 'line-through text-[var(--text-dim)]' : ''}`}>{t.label}</div>
                            <div className="text-[11px] text-[var(--text-muted)] font-mono">{fmtDateLong(t.date)}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            {t.status === 'done' && <span className="text-[10px]" style={{ color: 'var(--accent)' }}>✓ HECHO</span>}
                            <button onClick={() => removeTimeline(t.id)} className="opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-[#FF6B6B] transition-opacity">
                              <Icon name="trash" size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    <TimelineAdd onAdd={addTimelineItem} />
                  </div>
                </section>
              </div>
            )}

            {tab === 'comments' && (
              <CommentsTab
                comments={comments}
                commentsLoading={commentsLoading}
                currentUserId={currentUserId}
                team={team}
                resolveUser={resolveUser}
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

// ── Deliverable add ─────────────────────────────────────────────
const DeliverableAdd = ({ onAdd }) => {
  const [name, setName] = useState('');
  const [kind, setKind] = useState('video');

  const submit = () => {
    if (!name.trim()) return;
    onAdd({ id: 'dv' + Date.now(), name: name.trim(), kind, status: 'pending' });
    setName('');
  };

  return (
    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-app">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
        placeholder="Nuevo entregable…"
        className="flex-1 px-2.5 py-1.5 rounded-md text-[12.5px] border"
        style={{ background: 'var(--surface-3)', borderColor: 'var(--border)', color: 'var(--text)' }}
      />
      <select
        value={kind}
        onChange={(e) => setKind(e.target.value)}
        className="px-2 py-1.5 rounded-md text-[12px] border cursor-pointer appearance-none"
        style={{ background: 'var(--surface-3)', borderColor: 'var(--border)', color: 'var(--text)', colorScheme: 'dark' }}
      >
        <option value="video">Video</option>
        <option value="photos">Foto</option>
        <option value="audio">Audio</option>
      </select>
      <button
        onClick={submit}
        disabled={!name.trim()}
        className="p-1.5 rounded-md disabled:opacity-40 transition-all"
        style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
      >
        <Icon name="plus" size={14} strokeWidth={2.5} />
      </button>
    </div>
  );
};

// ── Timeline add ────────────────────────────────────────────────
const TimelineAdd = ({ onAdd }) => {
  const [label, setLabel] = useState('');
  const [date, setDate] = useState(() => new Date(TODAY).toISOString().slice(0, 10));

  const submit = () => {
    if (!label.trim()) return;
    onAdd({ id: 'tl' + Date.now(), label: label.trim(), date, status: 'pending' });
    setLabel('');
  };

  return (
    <div className="relative flex items-center gap-2 py-2">
      <div
        className="absolute -left-[11px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-2 border-dashed flex-shrink-0"
        style={{ borderColor: 'var(--border-2)' }}
      ></div>
      <input
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
        placeholder="Nuevo hito…"
        className="flex-1 px-2.5 py-1.5 rounded-md text-[12.5px] border ml-3"
        style={{ background: 'var(--surface-3)', borderColor: 'var(--border)', color: 'var(--text)' }}
      />
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="px-2 py-1.5 rounded-md text-[12px] border cursor-pointer"
        style={{ background: 'var(--surface-3)', borderColor: 'var(--border)', color: 'var(--text)', colorScheme: 'dark' }}
      />
      <button
        onClick={submit}
        disabled={!label.trim()}
        className="p-1.5 rounded-md disabled:opacity-40 transition-all"
        style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
      >
        <Icon name="plus" size={14} strokeWidth={2.5} />
      </button>
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

// ── Description editor (click-to-edit) ─────────────────────────
const DescriptionEditor = ({ blocks, onChange }) => {
  const [editing, setEditing] = useState(false);

  const blockToText = (bs) => (bs || []).map(b =>
    b.type === 'ul' ? b.items.map(it => '• ' + it).join('\n') : (b.text || '')
  ).join('\n\n');

  const [draft, setDraft] = useState(() => blockToText(blocks));

  const commit = () => {
    setEditing(false);
    const trimmed = draft.trim();
    if (!trimmed) { onChange([]); return; }
    const paras = trimmed.split(/\n{2,}/);
    const newBlocks = paras.map(para => {
      const lines = para.split('\n');
      if (lines.length > 1 && lines.every(l => /^[•\-]\s/.test(l))) {
        return { type: 'ul', items: lines.map(l => l.replace(/^[•\-]\s+/, '')) };
      }
      return { type: 'p', text: para };
    });
    onChange(newBlocks);
  };

  if (editing) {
    return (
      <div>
        <textarea
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Escape') { setDraft(blockToText(blocks)); setEditing(false); } }}
          rows={7}
          className="w-full rounded-lg px-3 py-2.5 text-[14px] leading-relaxed resize-none border"
          style={{ background: 'var(--surface-2)', borderColor: 'var(--border-2)', color: 'var(--text)' }}
        />
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={commit}
            className="px-3 py-1 rounded-md text-[12px] font-semibold"
            style={{ background: 'var(--accent)', color: '#0a0a0b' }}
          >
            Guardar
          </button>
          <button
            onClick={() => { setDraft(blockToText(blocks)); setEditing(false); }}
            className="px-3 py-1 rounded-md text-[12px] text-[var(--text-muted)] hover:text-white"
          >
            Cancelar
          </button>
          <span className="text-[10px] text-[var(--text-muted)] ml-auto">Doble enter = párrafo · • o - = lista</span>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => { setDraft(blockToText(blocks)); setEditing(true); }}
      className="cursor-text group relative rounded-lg p-3 -mx-3 hover:bg-[var(--surface-2)] transition-colors"
    >
      <div className="prose prose-invert max-w-none text-[14px] leading-relaxed text-[var(--text-dim)] space-y-2 pretty">
        {(!blocks || blocks.length === 0) && (
          <p className="text-[var(--text-muted)] italic">Click para agregar una descripción…</p>
        )}
        {(blocks || []).map((b, i) => {
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
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="inline-flex items-center gap-1 text-[10px] text-[var(--text-muted)] rounded px-2 py-0.5" style={{ background: 'var(--surface-3)' }}>
          <Icon name="edit" size={10} /> Editar
        </span>
      </div>
    </div>
  );
};

const CommentsTab = ({ comments, commentsLoading, currentUserId, team = [], resolveUser, newComment, setNewComment, onSend }) => {
  const resolve = resolveUser || ((id) => team.find(m => m.id === id) || getUser(id));
  const me = resolve(currentUserId);
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
        {commentsLoading && (
          <div className="flex justify-center py-10">
            <div className="flex gap-1.5">
              {[0,1,2].map(i => (
                <div key={i} className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--accent)', animationDelay: `${i * 200}ms`, opacity: 0.6 }}></div>
              ))}
            </div>
          </div>
        )}
        {!commentsLoading && comments.length === 0 && (
          <div className="text-center py-12 text-[var(--text-muted)]">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full surface-2 mb-3">
              <Icon name="message" size={18} />
            </div>
            <div className="text-sm">Aún no hay comentarios</div>
            <div className="text-[12px] mt-1">Sé el primero en dejar un comentario en este proyecto</div>
          </div>
        )}
        {comments.map(c => {
          const u = resolve(c.userId);
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
  InlineEdit, TagAdd,
});
