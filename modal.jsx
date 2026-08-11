// ─────────────────────────────────────────────────────────────────
// PROJECT MODAL — Notion-style two-column panel
// ─────────────────────────────────────────────────────────────────

const { useState, useRef, useEffect, useMemo } = React;

// ── Avatar ──────────────────────────────────────────────────────
const Avatar = ({ user, size = 24, ring = false }) => {
  if (!user) return null;
  const ringClass = ring ? 'ring-2 ring-[#0a0a0b]' : '';
  if (user.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user.initials}
        className={`rounded-full object-cover flex-shrink-0 ${ringClass}`}
        style={{ width: size, height: size }}
        title={`${user.name} · ${user.role}`}
      />
    );
  }
  return (
    <div
      className={`rounded-full flex items-center justify-center font-semibold flex-shrink-0 ${ringClass}`}
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

// ── Type dropdown content (selector + creator) ─────────────────
const TYPE_PICKER_ICONS  = ['film','camera','mic','video','music','play','image','monitor','smartphone','briefcase','zap','megaphone','star','layers','globe','folder','archive','clock'];
const TYPE_PICKER_COLORS = ['#C089FF','#6CC4FF','#7DD3C0','#FF7A59','var(--warn)','#FB7185','#D4FF4F','var(--danger)','#4ADE80','#F97316','#38BDF8','#9A9AA3'];

// ── TypeForm — formulario reutilizable para crear/editar tipos ──
const TypeForm = ({ initial = {}, onSubmit, onCancel, submitLabel = 'Crear' }) => {
  const [label, setLabel] = useState(initial.label || '');
  const [icon,  setIcon]  = useState(initial.icon  || 'film');
  const [color, setColor] = useState(initial.color || '#C089FF');
  const labelRef = useRef(null);

  useEffect(() => { setTimeout(() => labelRef.current?.focus(), 0); }, []);

  const submit = () => {
    if (!label.trim()) return;
    onSubmit({ label: label.trim(), icon, color });
  };

  return (
    <div className="p-2 space-y-2.5" onClick={(e) => e.stopPropagation()}>
      <input
        ref={labelRef}
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') onCancel(); }}
        placeholder="Nombre del tipo…"
        className="w-full px-2.5 py-1.5 rounded-md text-[13px] border outline-none"
        style={{ background: 'var(--surface-3)', borderColor: 'var(--border)', color: 'var(--text)' }}
      />
      <div>
        <div className="text-[10px] font-semibold tracking-[0.15em] uppercase mb-1.5" style={{ color: 'var(--text-muted)' }}>Ícono</div>
        <div className="grid grid-cols-6 gap-1">
          {TYPE_PICKER_ICONS.map(ic => (
            <button key={ic} onClick={() => setIcon(ic)}
              className="flex items-center justify-center rounded-md transition"
              style={{ width: 32, height: 32, background: icon === ic ? 'var(--accent-soft)' : 'var(--surface-3)', color: icon === ic ? 'var(--accent)' : 'var(--text-dim)', outline: icon === ic ? '1.5px solid var(--accent)' : 'none' }}
            >
              <Icon name={ic} size={14} />
            </button>
          ))}
        </div>
      </div>
      <div>
        <div className="text-[10px] font-semibold tracking-[0.15em] uppercase mb-1.5" style={{ color: 'var(--text-muted)' }}>Color</div>
        <div className="flex flex-wrap gap-1.5">
          {TYPE_PICKER_COLORS.map(c => (
            <button key={c} onClick={() => setColor(c)} className="rounded-full transition"
              style={{ width: 20, height: 20, background: c, outline: color === c ? `2px solid ${c}` : 'none', outlineOffset: 2 }}
            />
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between pt-0.5">
        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md" style={{ background: color + '22' }}>
          <Icon name={icon} size={12} style={{ color }} />
          <span className="text-[12px] font-medium" style={{ color }}>{label || 'Vista previa'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={onCancel} className="text-[11px] px-2 py-1 rounded hover:bg-[var(--surface-3)]" style={{ color: 'var(--text-muted)' }}>Cancelar</button>
          <button onClick={submit} disabled={!label.trim()} className="text-[11px] font-semibold px-2.5 py-1 rounded disabled:opacity-40" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

const TypeDropdownContent = ({ allTypes, currentType, onSelect, onCreateCustomType, onUpdateCustomType, onDeleteCustomType }) => {
  // mode: null | 'create' | { edit: typeId }
  const [mode, setMode] = useState(null);
  const editing = mode && mode.edit ? allTypes.find(t => t.id === mode.edit) : null;

  if (mode === 'create') {
    return (
      <>
        <div className="px-2.5 py-1.5 text-[11px] font-semibold tracking-wider uppercase flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
          <Icon name="plus" size={11} /> Nuevo tipo
        </div>
        <TypeForm
          onSubmit={(data) => { onCreateCustomType({ id: 'ct_' + Date.now() + Math.random().toString(36).slice(2, 5), ...data }); setMode(null); }}
          onCancel={() => setMode(null)}
          submitLabel="Crear"
        />
      </>
    );
  }

  if (editing) {
    return (
      <>
        <div className="px-2.5 py-1.5 text-[11px] font-semibold tracking-wider uppercase flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
          <Icon name="edit" size={11} /> Editar tipo
        </div>
        <TypeForm
          initial={editing}
          onSubmit={(data) => { onUpdateCustomType(editing.id, data); setMode(null); }}
          onCancel={() => setMode(null)}
          submitLabel="Guardar"
        />
      </>
    );
  }

  return (
    <>
      {allTypes.map(t => (
        <div key={t.id} className="group flex items-center gap-0.5">
          <button
            onClick={() => onSelect(t.id)}
            className={`flex-1 text-left px-2.5 py-1.5 rounded-md text-[13px] flex items-center gap-2 transition-colors ${currentType === t.id ? 'bg-[var(--surface-3)]' : 'hover:bg-[var(--surface-3)]'}`}
          >
            <Icon name={t.icon} size={13} style={{ color: t.color }} />
            <span className="flex-1">{t.label}</span>
            {currentType === t.id && <Icon name="check" size={12} style={{ color: 'var(--accent)' }} />}
          </button>
          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 mr-0.5 transition-opacity">
            <button
              onClick={() => setMode({ edit: t.id })}
              className="p-1 rounded hover:bg-[var(--surface-3)] text-[var(--text-muted)] hover:text-white"
              title="Editar"
            >
              <Icon name="edit" size={11} />
            </button>
            <button
              onClick={() => onDeleteCustomType(t.id)}
              className="p-1 rounded hover:bg-[var(--surface-3)] text-[var(--text-muted)] hover:text-[var(--danger)]"
              title="Eliminar"
            >
              <Icon name="trash" size={11} />
            </button>
          </div>
        </div>
      ))}

      <div className="my-1 mx-1 border-t" style={{ borderColor: 'var(--border)' }} />

      <button
        onClick={() => setMode('create')}
        className="w-full text-left px-2.5 py-1.5 rounded-md text-[12px] flex items-center gap-2 transition-colors hover:bg-[var(--surface-3)]"
        style={{ color: 'var(--text-muted)' }}
      >
        <Icon name="plus" size={12} /> Agregar tipo
      </button>
    </>
  );
};

const TypePill = ({ type, size = 'sm' }) => {
  const t = getType(type);
  if (!t) return null;
  const px = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md ${px} font-medium border max-w-full overflow-hidden`}
      style={{ borderColor: t.color + '44', color: t.color, background: t.color + '11' }}>
      <Icon name={t.icon} size={11} style={{ flexShrink: 0 }} />
      <span className="truncate">{t.label}</span>
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
    if (!FrameAttachments.validateImageUrl(urlVal)) {
      window.frameToast?.('Ingresá una URL http o https válida.');
      return;
    }
    onChange({ type: 'image', value: urlVal.trim() });
    setUrlVal('');
    setOpen(false);
  };

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = '';
    const validation = FrameAttachments.validateImageFile(file);
    if (!validation.ok) { window.frameToast?.(validation.message); return; }
    if (!window.storage) { window.frameToast?.('Storage todavía no está disponible.'); return; }
    setUploading(true);
    setProgress(0);
    try {
      const name = FrameAttachments.safeFileName(file.name);
      const path = `frame-covers/${projectId || 'general'}/${Date.now()}_${name}`;
      const task = window.storage.ref(path).put(file, { contentType: file.type });
      const snapshot = await FrameAttachments.waitForUpload(task, { onProgress: setProgress });
      const url = await snapshot.ref.getDownloadURL();
      onChange({ type: 'image', value: url });
      setOpen(false);
    } catch (err) {
      console.error('[FRAME] Subir portada:', err);
      window.frameToast?.(FrameAttachments.storageErrorMessage(err));
    } finally {
      setUploading(false);
      setProgress(0);
    }
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
            className="aspect-square rounded-lg border-2 transition hover:scale-105"
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
            <div className="h-full transition duration-200" style={{ width: `${progress}%`, background: 'var(--accent)' }}></div>
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
const ProjectModal = ({ project, onClose, onUpdate, onDelete, onNavigate, projects = [], currentUserId, team = [], clients = [], onCreateClient, customTypes = [], onCreateCustomType, onUpdateCustomType, onDeleteCustomType, workspaceKind = 'personal' }) => {
  const collaborationEnabled = workspaceKind === 'team';
  // Lookup que prioriza el equipo real de Firestore sobre los datos seed
  const resolveUser = (id) => team.find(m => m.id === id) || getUser(id);
  // Cuando Firestore ya cargó los tipos (customTypes.length > 0) los usa directamente;
  // si aún está cargando, muestra los predefinidos como fallback
  const allTypes = customTypes.length > 0 ? customTypes : PROJECT_TYPES;
  const [tab, setTab]                         = useState('overview'); // overview | comments
  const [newComment, setNewComment]           = useState('');
  const [comments, setComments]               = useState(() => project?.comments || []);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [activity, setActivity]               = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [editingCheckId, setEditingCheckId]   = useState(null);
  const [editingCheckText, setEditingCheckText] = useState('');
  const editCheckRef = useRef(null);
  const [dragCheckId, setDragCheckId]     = useState(null); // ítem que se está arrastrando
  const [dragOverCheckId, setDragOverCheckId] = useState(null); // ítem sobre el que se suelta
  const [editingDvId, setEditingDvId]     = useState(null);
  const [editingDvData, setEditingDvData] = useState({});
  const editDvNameRef = useRef(null);
  const [confirmDel, setConfirmDel]       = useState(false);

  // ── Listener de comentarios en tiempo real ────────────────────
  useEffect(() => {
    if (!collaborationEnabled) {
      setComments(project?.comments || []);
      setCommentsLoading(false);
      return;
    }
    if (!project?.id) return;
    const col = window.db
      .collection('frame_projects')
      .doc(project.id)
      .collection('comments');
    const unsub = col.orderBy('at', 'asc').onSnapshot((snap) => {
      // Compatibilidad no destructiva: los comentarios antiguos permanecen
      // en el array del documento y se combinan en memoria. No se copian a la
      // subcolección porque el cliente no puede acreditar la autoría ajena.
      const legacy = (project.comments || []).map(c => ({ ...c, _legacy: true }));
      const remote = snap.docs.map(d => ({ id: d.id, ...d.data(), _legacy: false }));
      const byId = new Map(legacy.map(c => [c.id, c]));
      remote.forEach(c => byId.set(c.id, c));
      setComments([...byId.values()].sort((a, b) => String(a.at || '').localeCompare(String(b.at || ''))));
      setCommentsLoading(false);
    }, (err) => {
      console.error('Comments listener error:', err);
      setComments(project.comments || []);
      setCommentsLoading(false);
    });
    return () => unsub();
  }, [project?.id, collaborationEnabled, project?.comments]);

  useEffect(() => {
    if (!project?.id) return;
    const col = window.db.collection('frame_projects').doc(project.id).collection('activity');
    const unsub = col.orderBy('at', 'desc').limit(30).onSnapshot((snap) => {
      setActivity(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setActivityLoading(false);
    }, (err) => {
      console.error('Activity listener error:', err);
      setActivity([]);
      setActivityLoading(false);
    });
    return () => unsub();
  }, [project?.id]);

  if (!project) return null;

  // ── Navegación entre proyectos ────────────────────────────────
  const navList   = projects.length > 0 ? projects : [];
  const navIdx    = navList.findIndex(p => p.id === project.id);
  const prevId    = navIdx > 0 ? navList[navIdx - 1].id : null;
  const nextId    = navIdx >= 0 && navIdx < navList.length - 1 ? navList[navIdx + 1].id : null;
  const navLabel  = navList.length > 0 ? `${navIdx + 1} / ${navList.length}` : null;

  // ── Teclado: Esc cierra, ← → navega ──────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') { onClose(); return; }
      const tag = document.activeElement?.tagName;
      const typing = tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement?.isContentEditable;
      if (typing) return;
      if (e.key === 'ArrowLeft'  && prevId && onNavigate) onNavigate(prevId);
      if (e.key === 'ArrowRight' && nextId && onNavigate) onNavigate(nextId);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose, onNavigate, prevId, nextId]);

  // El debounce y el guardado por campos viven en handleUpdateProject
  // (app.jsx): ahí se sabe cuál era el estado anterior para calcular qué
  // cambió, y sirve para todas las vistas, no sólo para este modal.
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
    upd({ checklist: [...project.checklist, { id: 'c' + Date.now() + Math.random().toString(36).slice(2, 5), text: text.trim(), done: false }] });
  };
  const removeCheck = (id) => upd({ checklist: project.checklist.filter(c => c.id !== id) });

  // ── Reordenar checklist (drag & drop) ─────────────────────────
  const reorderCheck = (fromId, toId) => {
    if (!fromId || !toId || fromId === toId) return;
    const list = [...project.checklist];
    const fromIdx = list.findIndex(c => c.id === fromId);
    const toIdx   = list.findIndex(c => c.id === toId);
    if (fromIdx === -1 || toIdx === -1) return;
    const [moved] = list.splice(fromIdx, 1); // saca el ítem arrastrado
    list.splice(toIdx, 0, moved);            // lo inserta en la posición destino
    upd({ checklist: list });
  };

  const startEditCheck = (c) => {
    setEditingCheckId(c.id);
    setEditingCheckText(c.text);
    setTimeout(() => { editCheckRef.current?.focus(); editCheckRef.current?.select(); }, 0);
  };
  const saveEditCheck = () => {
    if (!editingCheckId) return;
    const text = editingCheckText.trim();
    if (text) {
      upd({ checklist: project.checklist.map(c => c.id === editingCheckId ? { ...c, text } : c) });
    }
    setEditingCheckId(null);
    setEditingCheckText('');
  };
  const cancelEditCheck = () => { setEditingCheckId(null); setEditingCheckText(''); };

  const addComment = () => {
    if (!newComment.trim()) return;
    const comment = {
      id:     'cm' + Date.now() + Math.random().toString(36).slice(2, 5),
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
        workspaceId: project.workspaceId,
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

  const deleteComment = (commentId) => {
    const comment = comments.find(c => c.id === commentId);
    setComments(prev => prev.filter(c => c.id !== commentId));
    if (comment?._legacy) {
      if (comment.userId === currentUserId) {
        upd({ comments: (project.comments || []).filter(c => c.id !== commentId) });
      }
      return;
    }
    window.db.collection('frame_projects').doc(project.id)
      .collection('comments').doc(commentId).delete()
      .catch(err => console.error('Error al eliminar comentario:', err));
  };

  const addTag = (text) => {
    if (!text.trim()) return;
    upd({ tags: [...new Set([...project.tags, text.trim()])] });
  };
  const removeTag = (t) => upd({ tags: project.tags.filter(x => x !== t) });

  const updateDeliverable = (id, patch) => upd({ deliverables: project.deliverables.map(dv => dv.id === id ? { ...dv, ...patch } : dv) });

  const startEditDv = (dv) => {
    setEditingDvId(dv.id);
    setEditingDvData({ name: dv.name, kind: dv.kind, url: dv.url || '' });
    setTimeout(() => { editDvNameRef.current?.focus(); editDvNameRef.current?.select(); }, 0);
  };
  const saveEditDv = () => {
    if (!editingDvId) return;
    const name = editingDvData.name?.trim();
    if (name) updateDeliverable(editingDvId, { name, kind: editingDvData.kind, url: editingDvData.url?.trim() || '' });
    setEditingDvId(null);
    setEditingDvData({});
  };
  const cancelEditDv = () => { setEditingDvId(null); setEditingDvData({}); };

  const toggleDeliverable = (id) => {
    upd({ deliverables: project.deliverables.map(dv => dv.id === id ? { ...dv, status: dv.status === 'ready' ? 'pending' : 'ready' } : dv) });
  };
  const addDeliverable    = (dv)  => upd({ deliverables: [...project.deliverables, dv] });
  const removeDeliverable = (id)  => {
    const item = project.deliverables.find(dv => dv.id === id);
    if (item?.storagePath && window.storage) {
      window.storage.ref(item.storagePath).delete()
        .catch(() => window.frameToast?.('Se eliminó el entregable de la tarea, pero no se pudo borrar su archivo.'));
    }
    upd({ deliverables: project.deliverables.filter(dv => dv.id !== id) });
  };

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
            <span className="text-[var(--text-dim)]">Tarea</span>
            {/* Navegación posicional */}
            {navLabel && onNavigate && (
              <div className="flex items-center gap-0.5 ml-2">
                <button
                  onClick={() => prevId && onNavigate(prevId)}
                  disabled={!prevId}
                  className="p-1 rounded hover:bg-[var(--surface-2)] disabled:opacity-25 transition-colors"
                  title="Tarea anterior (←)"
                >
                  <Icon name="chevronLeft" size={13} />
                </button>
                <span className="text-[11px] font-mono px-1 select-none">{navLabel}</span>
                <button
                  onClick={() => nextId && onNavigate(nextId)}
                  disabled={!nextId}
                  className="p-1 rounded hover:bg-[var(--surface-2)] disabled:opacity-25 transition-colors"
                  title="Tarea siguiente (→)"
                >
                  <Icon name="chevronRight" size={13} />
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1">
            {isUrgent && (
              <span className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-md mr-2"
                style={{ background: 'var(--danger-soft-2)', color: 'var(--danger)' }}>
                <Icon name="alert" size={11} /> URGENTE
              </span>
            )}
            {/* Delete button — two-step confirm */}
            {onDelete && (
              confirmDel ? (
                <div className="flex items-center gap-1 mr-1">
                  <span className="text-[12px] font-medium" style={{ color: 'var(--danger)' }}>¿Eliminar?</span>
                  <button
                    onClick={() => { onDelete(project.id); onClose(); }}
                    className="px-2.5 py-1 rounded-md text-[12px] font-semibold"
                    style={{ background: 'var(--danger-soft-2)', color: 'var(--danger)' }}
                  >
                    Sí
                  </button>
                  <button
                    onClick={() => setConfirmDel(false)}
                    className="px-2.5 py-1 rounded-md text-[12px]"
                    style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  className="p-2 rounded-md hover:bg-[var(--danger-soft)] text-[var(--text-dim)] hover:text-[var(--danger)] transition-colors"
                  title="Eliminar tarea"
                  onClick={() => setConfirmDel(true)}
                >
                  <Icon name="trash" size={15} />
                </button>
              )
            )}
            <button aria-label="Cerrar" className="p-2 rounded-md hover:bg-[var(--surface-2)] text-[var(--text-dim)]" onClick={onClose}>
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
              <Dropdown
                trigger={<button className="text-left -mx-2 px-2 py-1 rounded hover:bg-[var(--surface-2)] w-full"><TypePill type={project.type} /></button>}
                width={260}
              >
                {(close) => (
                  <TypeDropdownContent
                    allTypes={allTypes}
                    currentType={project.type}
                    onSelect={(id) => { upd({ type: id }); close(); }}
                    onCreateCustomType={onCreateCustomType}
                    onUpdateCustomType={onUpdateCustomType}
                    onDeleteCustomType={onDeleteCustomType}
                  />
                )}
              </Dropdown>
            </PropRow>

            <PropRow icon="dot" label="Estado">
              <Dropdown trigger={<button className="text-left -mx-2 px-2 py-1 rounded hover:bg-[var(--surface-2)] w-full"><StatusPill status={project.status} /></button>}>
                {(close) => STATUSES.map(s => (
                  <MenuItem key={s.id} onClick={() => {
                    if (collaborationEnabled && s.id !== project.status && window.pushNotif) {
                      const changer = resolveUser(currentUserId);
                      const newSt   = getStatus(s.id);
                      project.assignees.forEach(uid => {
                        if (uid !== currentUserId) {
                          window.pushNotif(uid, {
                            type: 'status',
                            body: `${changer?.name || 'Alguien'} cambió "${project.title}" → ${newSt?.label || s.id}`,
                            projectId: project.id,
                            projectTitle: project.title,
                            workspaceId: project.workspaceId,
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

            {collaborationEnabled && <PropRow icon="users" label="Responsables">
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
            </PropRow>}

            <PropRow icon="calendar" label="Inicio">
              <input
                type="date"
                value={project.startDate}
                onChange={(e) => updField('startDate')(e.target.value)}
                className="text-sm hover:bg-[var(--surface-2)] rounded px-2 py-1 -mx-2 cursor-pointer"
                style={{ colorScheme: 'dark' }}
              />
            </PropRow>

            <PropRow icon="calendar" label="Fecha límite">
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={project.deadline}
                  // El navegador impide elegir una fecha anterior al inicio.
                  // Antes se podía dejar el deadline antes del comienzo, y el
                  // contador de días mostraba un proyecto ya vencido el mismo
                  // día que arrancaba.
                  min={project.startDate || undefined}
                  onChange={(e) => updField('deadline')(e.target.value)}
                  className="text-sm hover:bg-[var(--surface-2)] rounded px-2 py-1 -mx-2 cursor-pointer"
                  style={{ colorScheme: 'dark' }}
                />
                {isUrgent && <span className="text-[10px] font-semibold" style={{ color: 'var(--danger)' }}>en {days}d</span>}
              </div>
            </PropRow>

            {collaborationEnabled && <PropRow icon="camera" label="Próxima fecha de trabajo">
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={project.sessionDate || ''}
                  min={project.startDate || undefined}
                  onChange={(e) => updField('sessionDate')(e.target.value)}
                  className="text-sm hover:bg-[var(--surface-2)] rounded px-2 py-1 -mx-2 cursor-pointer"
                  style={{ colorScheme: 'dark' }}
                />
                {/* Cuando las fechas difieren, el proyecto ocupa dos días en
                    el calendario. Conviene decirlo acá, que es donde se toma
                    la decisión, y no dejar que se descubra viendo la tarjeta
                    repetida. */}
                {project.sessionDate && project.deadline && project.sessionDate !== project.deadline && (
                  <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    aparece en 2 días del calendario
                  </span>
                )}
              </div>
            </PropRow>}

            {collaborationEnabled && <PropRow icon="zap" label="Presupuesto">
              <div className="flex items-center gap-1 text-sm">
                <span className="text-[var(--text-muted)]">{project.currency}</span>
                <InlineEdit
                  value={String(project.budget)}
                  // Math.max(0, …) porque un presupuesto negativo no significa
                  // nada y además ensuciaba los totales de Analytics.
                  onChange={(v) => updField('budget')(Math.max(0, parseInt(v, 10) || 0))}
                  className="font-mono tnum"
                />
              </div>
            </PropRow>}

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
                <div className="h-full transition duration-500" style={{ width: progress + '%', background: 'var(--accent)' }}></div>
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
              {[
                {id:'overview',label:'Visión general',icon:'list'},
                ...(collaborationEnabled ? [{id:'comments',label:`Comentarios · ${comments.length}`,icon:'message'}] : []),
              ].map(t => (
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
                  <DescriptionEditor blocks={project.description} onChange={updField('description')} projectId={project.id} />
                </section>

                {/* Checklist */}
                <section>
                  <SectionTitle icon="check" right={`${project.checklist.filter(c => c.done).length}/${project.checklist.length}`}>
                    Checklist de producción
                  </SectionTitle>
                  <div className="space-y-1">
                    {project.checklist.map(c => {
                      const isDragging = dragCheckId === c.id;
                      const isDragOver = dragOverCheckId === c.id && dragCheckId && dragCheckId !== c.id;
                      return (
                      <div
                        key={c.id}
                        onDragOver={(e) => { if (dragCheckId) { e.preventDefault(); setDragOverCheckId(c.id); } }}
                        onDrop={(e) => { e.preventDefault(); reorderCheck(dragCheckId, c.id); setDragCheckId(null); setDragOverCheckId(null); }}
                        className={`group flex items-center gap-1.5 py-1 px-2 -mx-2 rounded hover:bg-[var(--surface-2)] transition ${isDragging ? 'opacity-40' : ''}`}
                        style={isDragOver ? { boxShadow: 'inset 0 2px 0 var(--accent)' } : undefined}
                      >
                        {/* Handle de arrastre */}
                        <span
                          draggable
                          onDragStart={(e) => { setDragCheckId(c.id); e.dataTransfer.effectAllowed = 'move'; }}
                          onDragEnd={() => { setDragCheckId(null); setDragOverCheckId(null); }}
                          className="flex-shrink-0 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-[var(--text-dim)] transition-opacity -ml-1"
                          title="Arrastrar para reordenar"
                        >
                          <Icon name="drag" size={13} />
                        </span>
                        <span className={`check flex-shrink-0 ${c.done ? 'on' : ''}`} onClick={() => toggleCheck(c.id)}>
                          {c.done && <Icon name="check" size={11} strokeWidth={3} />}
                        </span>
                        {editingCheckId === c.id ? (
                          <input
                            ref={editCheckRef}
                            value={editingCheckText}
                            onChange={(e) => setEditingCheckText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') { e.preventDefault(); saveEditCheck(); }
                              if (e.key === 'Escape') cancelEditCheck();
                            }}
                            onBlur={saveEditCheck}
                            className="flex-1 text-[13px] bg-transparent outline-none border-b"
                            style={{ borderColor: 'var(--accent)', color: 'var(--text)' }}
                          />
                        ) : (
                          <span
                            onClick={() => startEditCheck(c)}
                            className={`flex-1 text-[13px] cursor-text ${c.done ? 'line-through text-[var(--text-muted)]' : ''}`}
                            title="Clic para editar"
                          >
                            {c.text}
                          </span>
                        )}
                        <button onClick={() => removeCheck(c.id)} className="opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-[var(--danger)] flex-shrink-0">
                          <Icon name="trash" size={13} />
                        </button>
                      </div>
                      );
                    })}
                    <ChecklistAdd onAdd={addCheck} />
                  </div>
                </section>

                {/* Deliverables */}
                <section>
                  <SectionTitle icon="upload">Entregables</SectionTitle>
                  <div className="space-y-1.5">
                    {project.deliverables.map(dv => (
                      <div key={dv.id} className="group rounded-md border border-app surface-2 overflow-hidden">
                        {editingDvId === dv.id ? (
                          /* ── Modo edición ── */
                          <div className="p-2.5 space-y-2">
                            {/* Fila 1: nombre + tipo */}
                            <div className="flex items-center gap-2">
                              <Icon name={editingDvData.kind === 'video' ? 'film' : editingDvData.kind === 'photos' ? 'camera' : editingDvData.kind === 'file' ? 'paperclip' : 'mic'} size={13} style={{ color: 'var(--text-dim)', flexShrink: 0 }} />
                              <input
                                ref={editDvNameRef}
                                value={editingDvData.name}
                                onChange={(e) => setEditingDvData(d => ({ ...d, name: e.target.value }))}
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); saveEditDv(); } if (e.key === 'Escape') cancelEditDv(); }}
                                className="flex-1 text-[13px] bg-transparent outline-none border-b"
                                style={{ borderColor: 'var(--accent)', color: 'var(--text)' }}
                                placeholder="Nombre del entregable"
                              />
                              <select
                                value={editingDvData.kind}
                                onChange={(e) => setEditingDvData(d => ({ ...d, kind: e.target.value }))}
                                className="text-[11px] px-1.5 py-0.5 rounded border cursor-pointer"
                                style={{ background: 'var(--surface-3)', borderColor: 'var(--border)', color: 'var(--text-dim)', colorScheme: 'dark' }}
                              >
                                <option value="video">Video</option>
                                <option value="photos">Foto</option>
                                <option value="audio">Audio</option>
                              </select>
                            </div>
                            {/* Fila 2: URL */}
                            <div className="flex items-center gap-2">
                              <Icon name="link" size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                              <input
                                value={editingDvData.url}
                                onChange={(e) => setEditingDvData(d => ({ ...d, url: e.target.value }))}
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); saveEditDv(); } if (e.key === 'Escape') cancelEditDv(); }}
                                className="flex-1 text-[12px] bg-transparent outline-none border-b font-mono"
                                style={{ borderColor: 'var(--border-2)', color: 'var(--text-dim)' }}
                                placeholder="https://drive.google.com/…"
                              />
                            </div>
                            {/* Acciones */}
                            <div className="flex items-center justify-end gap-2 pt-0.5">
                              <button onClick={cancelEditDv} className="text-[11px] px-2 py-0.5 rounded" style={{ color: 'var(--text-muted)' }}>Cancelar</button>
                              <button onClick={saveEditDv} className="text-[11px] font-semibold px-2.5 py-0.5 rounded" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>Guardar</button>
                            </div>
                          </div>
                        ) : (
                          /* ── Modo normal ── */
                          <div className="flex items-center gap-3 py-2 px-3">
                            <Icon name={dv.kind === 'video' ? 'film' : dv.kind === 'photos' ? 'camera' : dv.kind === 'file' ? 'paperclip' : 'mic'} size={14} style={{ color: 'var(--text-dim)', flexShrink: 0 }} />
                            <div className="flex-1 min-w-0">
                              <div
                                onClick={() => startEditDv(dv)}
                                className="text-[13px] cursor-text truncate hover:text-white transition-colors"
                                title="Clic para editar"
                              >{dv.name}</div>
                              {dv.url && (
                                <a
                                  href={dv.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="inline-flex items-center gap-1 text-[11px] font-mono truncate max-w-full hover:underline"
                                  style={{ color: 'var(--accent)' }}
                                >
                                  <Icon name="link" size={10} />
                                  {dv.url.replace(/^https?:\/\//, '').slice(0, 40)}{dv.url.replace(/^https?:\/\//, '').length > 40 ? '…' : ''}
                                </a>
                              )}
                            </div>
                            <button
                              onClick={() => toggleDeliverable(dv.id)}
                              className="flex-shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-md transition-colors"
                              style={{
                                background: dv.status === 'ready' ? '#7DD3C022' : '#9A9AA322',
                                color: dv.status === 'ready' ? '#7DD3C0' : '#9A9AA3',
                              }}
                            >
                              {dv.status === 'ready' ? '✓ Listo' : 'Pendiente'}
                            </button>
                            <button onClick={() => removeDeliverable(dv.id)} className="opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-[var(--danger)] transition-opacity flex-shrink-0">
                              <Icon name="trash" size={13} />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                    <DeliverableAdd onAdd={addDeliverable} projectId={project.id} />
                  </div>
                </section>

                {/* Timeline */}
                <section>
                  <SectionTitle icon="clock">Timeline interno</SectionTitle>
                  <div className="relative pl-4">
                    {/* La línea va en x=10 porque los puntos, con -left-[11px]
                        dentro del pl-4, quedan centrados ahí. Estaba en x=5 y
                        los puntos se veían montados sobre ella en vez de
                        ensartados. */}
                    <div className="absolute left-[10px] top-1 bottom-1 w-px bg-[var(--border-2)]"></div>
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
                            <button onClick={() => removeTimeline(t.id)} className="opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-[var(--danger)] transition-opacity">
                              <Icon name="trash" size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    <TimelineAdd onAdd={addTimelineItem} />
                  </div>
                </section>

                <section>
                  <SectionTitle icon="clock" right={activity.length ? `${activity.length} eventos` : ''}>Actividad</SectionTitle>
                  {activityLoading ? (
                    <div className="text-[12px]" style={{ color: 'var(--text-muted)' }}>Cargando actividad…</div>
                  ) : activity.length === 0 ? (
                    <div className="text-[12px]" style={{ color: 'var(--text-muted)' }}>Los cambios importantes aparecerán aquí.</div>
                  ) : (
                    <div className="space-y-2">
                      {activity.map(item => (
                        <div key={item.id} className="flex gap-2 text-[12px]">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--accent)' }} />
                          <div>
                            <span className="font-medium">{item.actorName || 'Alguien'}</span>{' '}
                            <span style={{ color: 'var(--text-dim)' }}>{item.summary}</span>
                            <span className="ml-1.5 text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>{item.at ? new Date(item.at).toLocaleString('es-HN', { dateStyle: 'short', timeStyle: 'short' }) : ''}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            )}

            {collaborationEnabled && tab === 'comments' && (
              <CommentsTab
                comments={comments}
                commentsLoading={commentsLoading}
                currentUserId={currentUserId}
                team={team}
                resolveUser={resolveUser}
                newComment={newComment}
                setNewComment={setNewComment}
                onSend={addComment}
                onDeleteComment={deleteComment}
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

  const flush = (raw) => {
    raw.split(/[,;\n]+/).map(t => t.trim()).filter(Boolean).forEach(t => onAdd(t));
  };

  return (
    <input
      value={v}
      onChange={(e) => {
        // Si el usuario escribió una coma, agregar el tag inmediatamente
        if (e.target.value.includes(',')) {
          flush(e.target.value);
          setV('');
        } else {
          setV(e.target.value);
        }
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') { flush(v); setV(''); }
      }}
      onPaste={(e) => {
        e.preventDefault();
        flush(e.clipboardData.getData('text'));
        setV('');
      }}
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
        className="flex-1 text-[13px]"
      />
    </div>
  );
};

// ── Deliverable add ─────────────────────────────────────────────
const DeliverableAdd = ({ onAdd, projectId }) => {
  const [name, setName] = useState('');
  const [kind, setKind] = useState('video');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const submit = () => {
    if (!name.trim()) return;
    onAdd({ id: 'dv' + Date.now() + Math.random().toString(36).slice(2, 5), name: name.trim(), kind, status: 'pending' });
    setName('');
  };

  const uploadFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !projectId) return;
    const valid = FrameAttachments.validateDeliverableFile(file);
    if (!valid.ok) { window.frameToast?.(valid.message); return; }
    if (!window.storage) { window.frameToast?.('Storage todavía no está disponible.'); return; }
    setUploading(true);
    try {
      const storagePath = `frame-deliverables/${projectId}/${Date.now()}_${FrameAttachments.safeFileName(file.name)}`;
      const task = window.storage.ref(storagePath).put(file, { contentType: file.type });
      const snapshot = await FrameAttachments.waitForUpload(task, { timeoutMs: 60000 });
      const url = await snapshot.ref.getDownloadURL();
      const nextKind = file.type.startsWith('image/') ? 'photos' : file.type.startsWith('audio/') ? 'audio' : file.type.startsWith('video/') ? 'video' : 'file';
      onAdd({ id: 'dv' + Date.now() + Math.random().toString(36).slice(2, 5), name: file.name, kind: nextKind, status: 'pending', url, storagePath, contentType: file.type, size: file.size });
      window.frameToast?.('Archivo adjuntado al entregable.');
    } catch (err) {
      console.error('Deliverable upload:', err);
      window.frameToast?.(FrameAttachments.storageErrorMessage(err));
    } finally { setUploading(false); }
  };

  return (
    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-app">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
        placeholder="Nuevo entregable…"
        className="flex-1 px-2.5 py-1.5 rounded-md text-[13px] border"
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
        <option value="file">Archivo</option>
      </select>
      <label
        title="Adjuntar archivo: imagen, video, audio o PDF"
        className={`p-1.5 rounded-md cursor-pointer transition ${uploading ? 'opacity-40 pointer-events-none' : ''}`}
        style={{ background: 'var(--surface-3)', color: 'var(--accent)' }}
      >
        <Icon name="paperclip" size={14} />
        <input ref={fileRef} type="file" accept="image/*,video/*,audio/*,application/pdf" className="hidden" onChange={uploadFile} disabled={uploading} />
      </label>
      <button aria-label="Agregar entregable"
        onClick={submit}
        disabled={!name.trim()}
        className="p-1.5 rounded-md disabled:opacity-40 transition"
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
  const [date, setDate] = useState(() => localISO(new Date(TODAY)));

  const submit = () => {
    if (!label.trim()) return;
    onAdd({ id: 'tl' + Date.now() + Math.random().toString(36).slice(2, 5), label: label.trim(), date, status: 'pending' });
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
        className="flex-1 px-2.5 py-1.5 rounded-md text-[13px] border ml-3"
        style={{ background: 'var(--surface-3)', borderColor: 'var(--border)', color: 'var(--text)' }}
      />
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="px-2 py-1.5 rounded-md text-[12px] border cursor-pointer"
        style={{ background: 'var(--surface-3)', borderColor: 'var(--border)', color: 'var(--text)', colorScheme: 'dark' }}
      />
      <button aria-label="Agregar hito"
        onClick={submit}
        disabled={!label.trim()}
        className="p-1.5 rounded-md disabled:opacity-40 transition"
        style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
      >
        <Icon name="plus" size={14} strokeWidth={2.5} />
      </button>
    </div>
  );
};

const DescriptionBlock = ({ blocks, onChange }) => {
  return (
    <div className="prose prose-invert max-w-none text-[15px] leading-relaxed text-[var(--text-dim)] space-y-2 pretty">
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
// ── Convierte el formato de bloques antiguo → HTML ───────────────
const blocksToHTML = (blocks) => {
  if (!blocks || blocks.length === 0) return '';
  if (blocks[0]?.type === 'html') return blocks[0].content || '';
  return (blocks || []).map(b => {
    if (b.type === 'p') return `<p>${b.text || ''}</p>`;
    if (b.type === 'b') return `<p><strong>${b.text || ''}</strong></p>`;
    if (b.type === 'ul') return `<ul>${(b.items||[]).map(i=>`<li>${i}</li>`).join('')}</ul>`;
    if (b.type === 'ol') return `<ol>${(b.items||[]).map(i=>`<li>${i}</li>`).join('')}</ol>`;
    return '';
  }).join('');
};

// ── Comprime una imagen usando canvas → devuelve un Blob ─────────
const compressImg = (file, maxW = 1200, quality = 0.80) => new Promise(res => {
  const img = new Image();
  const url = URL.createObjectURL(file);
  img.onload = () => {
    const scale = Math.min(1, maxW / img.width);
    const c = document.createElement('canvas');
    c.width = Math.round(img.width * scale);
    c.height = Math.round(img.height * scale);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    URL.revokeObjectURL(url);
    c.toBlob((blob) => res(blob), 'image/jpeg', quality);
  };
  img.onerror = () => { URL.revokeObjectURL(url); res(null); };
  img.src = url;
});

const DescriptionEditor = ({ blocks, onChange, projectId }) => {
  const editorRef   = useRef(null);
  const fileRef     = useRef(null);
  const imageMenuRef = useRef(null);
  const uploadingRef = useRef(false); // evita guardar mientras sube imagen
  const [focused,   setFocused]   = useState(false);
  const [lightbox,  setLightbox]  = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageMenuPosition, setImageMenuPosition] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress,   setProgress]   = useState(0);

  // Inicializa HTML solo al montar (no en cada re-render para no romper el cursor)
  useEffect(() => {
    if (editorRef.current) editorRef.current.innerHTML = sanitizeDescHTML(blocksToHTML(blocks));
  }, []);

  // Guarda al perder foco (solo si no está subiendo imagen)
  const save = () => {
    if (uploadingRef.current) return;
    // Se limpia también al guardar, no sólo al pintar: pegar desde otra web
    // trae el HTML de origen entero, con scripts y manejadores incluidos.
    const html = sanitizeDescHTML(editorRef.current?.innerHTML || '').trim();
    const empty = html === '' || html === '<br>' || html === '<div><br></div>';
    onChange(empty ? [] : [{ type: 'html', content: html }]);
  };

  // Botones de toolbar: preventDefault para no perder foco del editor
  const exec = (cmd, val) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val ?? null);
  };

  const captureEditorRange = () => {
    const selection = window.getSelection();
    if (!selection?.rangeCount) return null;
    const range = selection.getRangeAt(0);
    return editorRef.current?.contains(range.commonAncestorContainer) ? range.cloneRange() : null;
  };

  const restoreEditorRange = (range) => {
    editorRef.current?.focus();
    if (!range) return;
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  };

  const insertRemoteImages = (urls, savedRange) => {
    const safeUrls = (urls || []).map(FrameAttachments.normalizeRemoteImageUrl).filter(Boolean);
    if (safeUrls.length === 0) return;
    restoreEditorRange(savedRange);
    const selection = window.getSelection();
    const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
    if (!range || !editorRef.current?.contains(range.commonAncestorContainer)) return;

    range.deleteContents();
    const fragment = document.createDocumentFragment();
    let lastNode = null;
    safeUrls.forEach(src => {
      const img = document.createElement('img');
      img.src = src;
      img.alt = 'Imagen de referencia';
      img.referrerPolicy = 'no-referrer';
      img.loading = 'lazy';
      img.dataset.frameSize = 'lg';
      img.dataset.frameAlign = 'left';
      const br = document.createElement('br');
      fragment.append(img, br);
      lastNode = br;
    });
    range.insertNode(fragment);
    if (lastNode) {
      range.setStartAfter(lastNode);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  };

  // Sube imagen a Firebase Storage (igual que cover) y la inserta en el cursor
  const uploadAndInsert = async (blob, savedRange = null) => {
    if (!blob) return;
    if (!window.storage) {
      window.frameToast?.('Las imágenes necesitan Storage habilitado en Firebase.');
      return;
    }
    uploadingRef.current = true;
    setUploading(true);
    setProgress(0);
    try {
      const path  = `frame-descriptions/${projectId || 'general'}/${Date.now()}.jpg`;
      const stRef = window.storage.ref(path);
      const task  = stRef.put(blob, { contentType: 'image/jpeg' });

      // Timeout obligatorio: si el bucket de Storage no está creado, la tarea
      // no falla — se queda esperando. Sin esto el editor mostraba "subiendo…"
      // para siempre y no había forma de saber que pasaba.
      const snapshot = await FrameAttachments.waitForUpload(task, { onProgress: setProgress });
      const src = await snapshot.ref.getDownloadURL();
      insertRemoteImages([src], savedRange);
    } catch (err) {
      console.error('[FRAME] Subir imagen:', err);
      window.frameToast?.(FrameAttachments.storageErrorMessage(err));
    } finally {
      uploadingRef.current = false;
      setUploading(false);
      setProgress(0);
    }
  };

  // Intercepta imágenes pegadas desde el portapapeles
  const handlePaste = async (e) => {
    const items = [...(e.clipboardData?.items || [])];
    const html = e.clipboardData?.getData('text/html') || '';
    const text = e.clipboardData?.getData('text/plain') || '';
    const source = FrameAttachments.classifyPasteSource({ items, html, text });
    const savedRange = captureEditorRange();

    if (source.kind === 'file') {
      e.preventDefault();
      const file = source.item.getAsFile();
      const validation = FrameAttachments.validateImageFile(file);
      if (!validation.ok) { window.frameToast?.(validation.message); return; }
      const compressed = await compressImg(file);
      if (!compressed) { window.frameToast?.('No se pudo procesar la imagen.'); return; }
      await uploadAndInsert(compressed, savedRange);
      return;
    }

    if (source.kind === 'html-images' || source.kind === 'text-image-url') {
      e.preventDefault();
      insertRemoteImages(source.urls, savedRange);
      window.frameToast?.('Imagen externa insertada. Seguirá disponible mientras el sitio de origen la mantenga pública.');
      return;
    }

    if (source.kind === 'html') {
      // Nunca se deja que HTML externo entre directo al contentEditable.
      e.preventDefault();
      restoreEditorRange(savedRange);
      document.execCommand('insertHTML', false, sanitizeDescHTML(source.html));
    }
    // Texto ordinario conserva el comportamiento nativo del navegador.
  };

  // Sube desde selector de archivo
  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = '';
    const validation = FrameAttachments.validateImageFile(file);
    if (!validation.ok) { window.frameToast?.(validation.message); return; }
    const compressed = await compressImg(file);
    if (!compressed) { window.frameToast?.('No se pudo procesar la imagen.'); return; }
    await uploadAndInsert(compressed);
  };

  // Click en imagen → lightbox
  const clearImageSelection = () => {
    editorRef.current?.querySelectorAll('img.frame-image-selected').forEach(img => img.classList.remove('frame-image-selected'));
  };

  const positionImageMenu = (img) => {
    if (!img?.isConnected) return;
    const rect = img.getBoundingClientRect();
    const viewportPadding = 12;
    const menuWidth = Math.min(520, window.innerWidth - viewportPadding * 2);
    const menuHeight = imageMenuRef.current?.offsetHeight || 108;
    const left = Math.max(viewportPadding, Math.min(rect.left, window.innerWidth - menuWidth - viewportPadding));
    const belowTop = rect.bottom + 8;
    const aboveTop = rect.top - menuHeight - 8;
    const showBelow = belowTop + menuHeight <= window.innerHeight - viewportPadding;
    setImageMenuPosition({
      left,
      top: Math.max(viewportPadding, Math.min(showBelow ? belowTop : aboveTop, window.innerHeight - menuHeight - viewportPadding)),
      width: menuWidth,
    });
  };

  useEffect(() => {
    if (!selectedImage) return undefined;
    const reposition = () => positionImageMenu(selectedImage);
    reposition();
    window.addEventListener('resize', reposition);
    window.addEventListener('scroll', reposition, true);
    return () => {
      window.removeEventListener('resize', reposition);
      window.removeEventListener('scroll', reposition, true);
    };
  }, [selectedImage]);

  // La primera posiciÃ³n usa una estimaciÃ³n. Cuando la barra ya se renderizÃ³,
  // se recoloca con su altura real para no salirse en pantallas pequeÃ±as.
  useEffect(() => {
    if (!selectedImage || !imageMenuPosition) return undefined;
    const frame = window.requestAnimationFrame(() => positionImageMenu(selectedImage));
    return () => window.cancelAnimationFrame(frame);
  }, [selectedImage, imageMenuPosition?.width]);

  const updateSelectedImage = (attribute, value) => {
    if (!selectedImage || !editorRef.current?.contains(selectedImage)) return;
    selectedImage.setAttribute(attribute, value);
    save();
  };

  const handleClick = (e) => {
    if (e.target.tagName === 'IMG') {
      e.preventDefault();
      clearImageSelection();
      e.target.classList.add('frame-image-selected');
      setSelectedImage(e.target);
      positionImageMenu(e.target);
      return;
    }
    clearImageSelection();
    setSelectedImage(null);
    setImageMenuPosition(null);
  };

  // Botón de toolbar reutilizable
  const TB = ({ onMouseDown, title, children }) => (
    <button
      onMouseDown={(e) => { e.preventDefault(); onMouseDown(); }}
      title={title}
      className="px-2 py-1 rounded text-[12px] font-medium select-none text-[var(--text-muted)] hover:text-white hover:bg-[var(--surface-3)] transition-colors"
    >
      {children}
    </button>
  );

  return (
    <>
      <div
        className="rounded-lg border overflow-hidden transition"
        style={{ borderColor: focused ? 'rgba(212,255,79,0.4)' : 'var(--border-2)' }}
      >
        {/* ── Toolbar ── */}
        <div className="flex items-center gap-0.5 px-2 py-1 border-b" style={{ background: 'var(--surface-3)', borderColor: 'var(--border)' }}>
          <TB onMouseDown={() => exec('bold')}   title="Negrita (Ctrl+B)"><strong>B</strong></TB>
          <TB onMouseDown={() => exec('italic')} title="Cursiva (Ctrl+I)"><em style={{ fontStyle:'italic' }}>I</em></TB>
          <div className="w-px h-3.5 mx-1 flex-shrink-0" style={{ background: 'var(--border-2)' }} />
          <TB onMouseDown={() => exec('insertUnorderedList')} title="Lista de viñetas">
            <Icon name="list" size={12} />
          </TB>
          <TB onMouseDown={() => exec('insertOrderedList')} title="Lista numerada">
            <span className="font-mono text-[11px]">1.</span>
          </TB>
          <div className="w-px h-3.5 mx-1 flex-shrink-0" style={{ background: 'var(--border-2)' }} />
          {/* Upload imagen */}
          <label
            title="Insertar imagen o pegar un archivo, imagen web o URL con Ctrl+V"
            className={`px-2 py-1 rounded text-[12px] select-none cursor-pointer flex items-center gap-1 transition-colors ${uploading ? 'opacity-50 pointer-events-none' : 'text-[var(--text-muted)] hover:text-white hover:bg-[var(--surface-3)]'}`}
          >
            <Icon name="camera" size={12} />
            {uploading && <span className="text-[10px] font-mono animate-pulse">{progress}%</span>}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploading} />
          </label>
          <span className="ml-auto text-[10px] hidden sm:block" style={{ color: 'var(--text-muted)' }}>Seleccioná una imagen para editarla</span>
        </div>

        {selectedImage && imageMenuPosition && (
          <div
            ref={imageMenuRef}
            className="fixed z-[10000] flex flex-wrap items-center gap-1.5 rounded-lg border px-3 py-2 shadow-xl anim-fade-in"
            style={{
              left: imageMenuPosition.left,
              top: imageMenuPosition.top,
              width: imageMenuPosition.width,
              maxWidth: 'calc(100vw - 24px)',
              boxSizing: 'border-box',
              background: 'var(--surface-2)',
              borderColor: 'var(--border-2)',
              boxShadow: '0 12px 32px rgba(0,0,0,0.28)',
            }}
          >
            <span className="mr-1 text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Imagen seleccionada</span>
            <div className="inline-flex items-center rounded-md border p-0.5" style={{ borderColor: 'var(--border-2)', background: 'var(--surface-3)' }}>
              <TB onMouseDown={() => updateSelectedImage('data-frame-size', 'sm')} title="Ancho pequeño">Pequeña</TB>
              <TB onMouseDown={() => updateSelectedImage('data-frame-size', 'md')} title="Ancho mediano">Mediana</TB>
              <TB onMouseDown={() => updateSelectedImage('data-frame-size', 'lg')} title="Ancho completo">Completa</TB>
            </div>
            <div className="w-px h-3.5 mx-1" style={{ background: 'var(--border-2)' }} />
            <TB onMouseDown={() => updateSelectedImage('data-frame-align', 'left')} title="Alinear a la izquierda">Izquierda</TB>
            <TB onMouseDown={() => updateSelectedImage('data-frame-align', 'center')} title="Centrar">Centrar</TB>
            <TB onMouseDown={() => updateSelectedImage('data-frame-align', 'right')} title="Alinear a la derecha">Derecha</TB>
            <div className="w-px h-3.5 mx-1" style={{ background: 'var(--border-2)' }} />
            <TB onMouseDown={() => setLightbox(selectedImage.src)} title="Abrir imagen a tamaño completo">Abrir</TB>
            <TB onMouseDown={() => { clearImageSelection(); setSelectedImage(null); setImageMenuPosition(null); }} title="Cerrar opciones"><Icon name="x" size={12} /></TB>
          </div>
        )}

        {/* ── Área editable ── */}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onFocus={() => setFocused(true)}
          onBlur={() => { setFocused(false); save(); }}
          onPaste={handlePaste}
          onClick={handleClick}
          data-placeholder="Describí la tarea, el brief y las referencias…"
          className="desc-editor p-3 text-[15px] leading-relaxed"
          style={{ minHeight: 100, background: 'var(--surface-2)', color: 'var(--text)' }}
        />
      </div>

      {/* ── Lightbox ── */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center anim-fade-in"
          style={{ background: 'rgba(0,0,0,0.92)' }}
          onClick={() => setLightbox(null)}
        >
          <img
            src={lightbox}
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 10, boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }}
          />
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-5 right-5 p-2 rounded-full"
            style={{ background: 'rgba(255,255,255,0.12)', color: 'white' }}
          >
            <Icon name="x" size={18} />
          </button>
        </div>
      )}
    </>
  );
};

const CommentsTab = ({ comments, commentsLoading, currentUserId, team = [], resolveUser, newComment, setNewComment, onSend, onDeleteComment }) => {
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
            <div className="text-[12px] mt-1">Sé el primero en comentar esta tarea</div>
          </div>
        )}
        {comments.map(c => {
          const u = resolve(c.userId);
          const isOwn = c.userId === currentUserId;
          return (
            <div key={c.id} className="group flex gap-3">
              <Avatar user={u} size={32} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[13px] font-semibold">{u?.name}</span>
                  <span className="text-[11px] text-[var(--text-muted)]">{u?.role}</span>
                  <span className="text-[11px] text-[var(--text-muted)]">·</span>
                  <span className="text-[11px] text-[var(--text-muted)]">{relativeTime(c.at)}</span>
                  {isOwn && onDeleteComment && (
                    <button
                      onClick={() => onDeleteComment(c.id)}
                      className="ml-auto opacity-0 group-hover:opacity-100 p-1 rounded text-[var(--text-muted)] hover:text-[var(--danger)] transition"
                      title="Eliminar comentario"
                    >
                      <Icon name="trash" size={11} />
                    </button>
                  )}
                </div>
                <div className="text-[15px] leading-relaxed pretty">{renderWithMentions(c.text)}</div>
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
                className="w-full px-3 py-2.5 text-[13px] resize-none"
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
                className="flex items-center gap-1.5 px-3 py-1 rounded-md text-[12px] font-semibold transition disabled:opacity-40"
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

// Sin uso: el editor de descripción trae su propia barra de formato (TB).
// Se deja porque el nombre accesible tiene que venir de quien lo usa — un
// icono dinámico no puede describirse a sí mismo.
const FormatBtn = ({ icon, onClick, label }) => (
  <button onClick={onClick} aria-label={label}
          className="p-1.5 rounded text-[var(--text-muted)] hover:text-white hover:bg-[var(--surface-3)]">
    <Icon name={icon} size={13} aria-hidden="true" />
  </button>
);

Object.assign(window, {
  Avatar, AvatarStack, StatusPill, TypePill, PriorityBadge, Cover,
  ProjectModal, Dropdown, MenuItem, renderWithMentions,
  InlineEdit, TagAdd,
});
