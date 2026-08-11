// ─────────────────────────────────────────────────────────────────
// VIEWS — Calendar, Kanban, Gallery, List
// ─────────────────────────────────────────────────────────────────

// ── Project mini card (used in calendar + kanban) ──────────────
// ── Contador de entrega ──────────────────────────────────────────
// El dato que más decide el día del estudio. Antes estaba enterrado abajo
// en gris junto a un icono de calendario; ahora es lo segundo que ve el ojo
// y es el único lugar de la tarjeta donde el color grita. Devuelve también
// el tono, así que urgencia y color salen siempre del mismo cálculo y no
// pueden desincronizarse (antes había badges URG/VENC con su propia lógica).
const deliveryCounter = (project) => {
  if (project.status === 'delivered' || project.status === 'archived') {
    return { value: '✓', label: 'Entregado', color: 'var(--text-muted)' };
  }
  const d = daysUntil(project.deadline);
  if (d < 0)  return { value: '+' + Math.abs(d), label: 'Vencido',    color: 'var(--danger)' };
  if (d === 0) return { value: 'Hoy',            label: 'Entrega',    color: 'var(--accent)' };
  if (d <= 3)  return { value: d + ' d',         label: 'Restantes',  color: 'var(--warn)' };
  return         { value: d + ' d',              label: 'Restantes',  color: 'var(--text-muted)' };
};

const ProjectCardMini = ({ project, onClick, draggable, onDragStart, onDragEnd, dragging, compact, onDelete, onDuplicate, onToggleFavorite, previewFields = {} }) => {
  const pf = previewFields;
  const t = getType(project.type);
  const progress = progressOf(project);
  const [confirmDel, setConfirmDel] = React.useState(false);
  const counter = deliveryCounter(project);

  const done  = (project.checklist || []).filter(c => c.done).length;
  const total = (project.checklist || []).length;

  const hasBudget = pf.presupuesto && project.budget > 0;
  const showCounter = pf.deadline !== false;
  const hasActions = onToggleFavorite || onDuplicate || onDelete;

  // Metadatos en una sola línea separada por puntos, en vez de cuatro
  // renglones apilados. Es lo que hace que la tarjeta se lea de un vistazo.
  const meta = [];
  if (pf.cliente !== false && project.client) meta.push(project.client);
  if (hasBudget) meta.push(`${project.currency || 'USD'} ${project.budget.toLocaleString()}`);

  return (
    <div
      onClick={onClick}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`group lift cursor-pointer relative select-none ${dragging ? 'dragging' : ''}`}
      style={{
        background: 'var(--surface-2)',
        borderRadius: 'var(--r-md)',
        padding: compact ? '10px 11px' : '12px 13px',
        // Filo superior iluminado: en tema oscuro la profundidad se hace con
        // luz, no con sombra. Es lo que hace que se sienta material.
        boxShadow: 'inset 0 .5px 0 rgba(255,255,255,.06)',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-3)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--surface-2)'; }}
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">

          {/* Tipo: un punto del color + la palabra. El color pasa a ser
              identificador, no decoración a todo el ancho. */}
          {pf.tipo !== false && (
            <div className="flex items-center gap-1.5 mb-1" style={{ color: 'var(--text-muted)' }}>
              <span className="rounded-full flex-shrink-0" style={{ width: 5, height: 5, background: t.color }} />
              <span className="text-[11px] font-medium truncate">{t.label}</span>
              {pf.estado !== false && (
                <>
                  <span className="text-[11px]" style={{ color: 'var(--text-faint)' }}>·</span>
                  <span className="text-[11px] truncate">{getStatus(project.status).label}</span>
                </>
              )}
              {project.favorite && (
                <Icon name="star" size={9} fill="currentColor" style={{ color: 'var(--warn)', flexShrink: 0 }} />
              )}
            </div>
          )}

          <div className="text-[13px] font-semibold leading-snug balance" style={{ letterSpacing: '-0.012em', color: 'var(--text)' }}>
            {project.title}
          </div>

          {(meta.length > 0 || pf.responsables !== false) && (
            <div className="flex items-center gap-1.5 mt-1 text-[12px] min-w-0" style={{ color: 'var(--text-muted)' }}>
              {meta.map((m, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <span style={{ color: 'var(--text-faint)' }}>·</span>}
                  <span className="truncate tnum">{m}</span>
                </React.Fragment>
              ))}
              {pf.responsables !== false && project.assignees?.length > 0 && (
                <>
                  {meta.length > 0 && <span style={{ color: 'var(--text-faint)' }}>·</span>}
                  <AvatarStack ids={project.assignees} size={16} max={3} />
                </>
              )}
            </div>
          )}
        </div>

        {/* Firma: el contador */}
        {showCounter && (
          <div className="text-right flex-shrink-0 tnum" style={{ lineHeight: 1 }}>
            <div className="text-[15px] font-semibold" style={{ color: counter.color, letterSpacing: '-0.02em' }}>
              {counter.value}
            </div>
            <div className="text-[10px] mt-1" style={{ color: 'var(--text-faint)' }}>{counter.label}</div>
          </div>
        )}
      </div>

      {/* Pie: progreso corto a la izquierda, acciones a la derecha en hover.
          A todo el ancho la barra se leía como un subrayado divisorio. */}
      {(pf.progreso !== false || hasActions) && (
        <div className="flex items-center gap-2 mt-2.5" style={{ minHeight: 18 }}>
          {pf.progreso !== false && total > 0 && (
            <>
              <div className="rounded-full overflow-hidden flex-shrink-0" style={{ width: 54, height: 3, background: 'rgba(255,255,255,.09)' }}>
                <div className="h-full rounded-full" style={{ width: progress + '%', background: progress >= 100 ? 'var(--accent)' : 'var(--text-faint)' }} />
              </div>
              <span className="text-[10px] tnum" style={{ color: 'var(--text-faint)' }}>{done}/{total}</span>
            </>
          )}

          {hasActions && (
            <div className="ml-auto flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
              {confirmDel ? (
                <>
                  <span className="text-[11px] font-medium mr-1" style={{ color: 'var(--danger)' }}>¿Eliminar?</span>
                  <button onClick={() => onDelete(project.id)}
                    className="text-[11px] font-semibold px-2 py-0.5 rounded"
                    style={{ background: 'var(--danger)', color: '#fff' }}>Sí</button>
                  <button onClick={() => setConfirmDel(false)}
                    className="text-[11px] px-2 py-0.5 rounded"
                    style={{ background: 'var(--surface-3)', color: 'var(--text-dim)' }}>No</button>
                </>
              ) : (
                <>
                  {onToggleFavorite && (
                    <button onClick={() => onToggleFavorite(project.id)}
                      className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: project.favorite ? 'var(--warn)' : 'var(--text-muted)' }}
                      title={project.favorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}>
                      <Icon name="star" size={12} fill={project.favorite ? 'currentColor' : 'none'} />
                    </button>
                  )}
                  {onDuplicate && (
                    <button onClick={() => onDuplicate(project.id)}
                      className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:text-[var(--accent)]"
                      style={{ color: 'var(--text-muted)' }} title="Duplicar">
                      <Icon name="copy" size={12} />
                    </button>
                  )}
                  {onDelete && (
                    <button onClick={() => setConfirmDel(true)}
                      className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:text-[var(--danger)]"
                      style={{ color: 'var(--text-muted)' }} title="Eliminar">
                      <Icon name="trash" size={12} />
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── Column color presets ─────────────────────────────────────────
const COL_COLORS = [
  '#9A9AA3','var(--warn)','#6CC4FF','#C089FF','#7DD3C0',
  '#FF7A59','#FB7185','#D4FF4F','var(--danger)','#34D399',
  '#F59E0B','#EC4899','#8B5CF6','#06B6D4','#38BDF8',
];

// ── Column settings menu (rendered via portal to escape overflow clipping) ──
const ColMenuBtn = ({ col, projectCount, onUpdate, onDelete }) => {
  const [open, setOpen]   = useState(false);
  const [pos, setPos]     = useState({ top: 0, right: 0 });
  const [label, setLabel] = useState(col.label);
  const btnRef  = useRef(null);
  const panelRef = useRef(null);

  // sync label when col changes (e.g. after save)
  useEffect(() => setLabel(col.label), [col.label]);

  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (!btnRef.current?.contains(e.target) && !panelRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const openMenu = () => {
    const r = btnRef.current?.getBoundingClientRect();
    if (r) setPos({ top: r.bottom + 6, right: window.innerWidth - r.right });
    setOpen(v => !v);
  };

  const commitLabel = () => {
    const t = label.trim();
    if (t && t !== col.label) onUpdate({ ...col, label: t });
  };

  const panel = open && ReactDOM.createPortal(
    <div
      ref={panelRef}
      className="anim-scale-in"
      style={{
        position: 'fixed', top: pos.top, right: pos.right,
        width: 240, zIndex: 9999,
        background: 'var(--surface-2)', borderRadius: 12,
        border: '1px solid var(--border-2)',
        boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
        padding: '12px',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Nombre */}
      <div className="mb-3">
        <div className="text-[10px] tracking-[0.18em] uppercase text-[var(--text-muted)] mb-1.5">Nombre</div>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={commitLabel}
          onKeyDown={(e) => { if (e.key === 'Enter') { commitLabel(); e.target.blur(); } }}
          className="w-full px-2.5 py-1.5 rounded-md text-[13px] border"
          style={{ background: 'var(--surface-3)', borderColor: 'var(--border)', color: 'var(--text)' }}
        />
      </div>

      {/* Color */}
      <div className="mb-3">
        <div className="text-[10px] tracking-[0.18em] uppercase text-[var(--text-muted)] mb-1.5">Color</div>
        <div className="grid grid-cols-5 gap-1.5">
          {COL_COLORS.map(c => (
            <button
              key={c}
              onClick={() => onUpdate({ ...col, color: c })}
              className="w-8 h-8 rounded-md transition-all hover:scale-110"
              style={{
                background: c,
                boxShadow: col.color === c ? `0 0 0 2px var(--surface-2), 0 0 0 3.5px ${c}` : 'none',
              }}
            />
          ))}
        </div>
      </div>

      {/* Eliminar */}
      <div className="border-t border-app pt-2">
        <button
          onClick={() => { if (projectCount === 0) { onDelete(col.id); setOpen(false); } }}
          disabled={projectCount > 0}
          title={projectCount > 0 ? `Mové los ${projectCount} proyectos antes de eliminar` : ''}
          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[12px] transition-colors disabled:opacity-35 hover:bg-[var(--danger-soft)]"
          style={{ color: 'var(--danger)' }}
        >
          <Icon name="trash" size={13} />
          {projectCount > 0
            ? `${projectCount} proyecto${projectCount > 1 ? 's' : ''} — no se puede eliminar`
            : 'Eliminar columna'}
        </button>
      </div>
    </div>,
    document.body
  );

  return (
    <>
      <button
        ref={btnRef}
        onClick={openMenu}
        className={`p-1 rounded transition-colors ${open ? 'bg-[var(--surface-3)] text-white' : 'text-[var(--text-muted)] hover:text-white hover:bg-[var(--surface-2)]'}`}
      >
        <Icon name="more" size={14} />
      </button>
      {panel}
    </>
  );
};

// ── Quick-add inline card ───────────────────────────────────────
// Botón "+" que se transforma en una tarjeta vacía con input de título.
// Hereda contexto (estado de columna / fecha del día) según dónde se monta.
// variant: 'full' = botón ancho con texto · 'mini' = solo ícono "+" (celdas chicas)
const QuickAddCard = ({ onCreate, context = {}, variant = 'full', label = 'Agregar tarjeta' }) => {
  const [active, setActive] = React.useState(false);
  const [title, setTitle]   = React.useState('');
  const inputRef = React.useRef(null);

  React.useEffect(() => { if (active) inputRef.current?.focus(); }, [active]);

  const submit = () => {
    const t = title.trim();
    if (!t) { setActive(false); setTitle(''); return; }
    onCreate && onCreate({ title: t, ...context });
    setTitle('');
    // Se mantiene abierto para carga rápida de varias tarjetas seguidas
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  // ── Estado activo: tarjeta con input (compartido por ambos variants) ──
  if (active) {
    return (
      <div className="rounded-lg border p-2 anim-scale-in select-none" style={{ background: 'var(--surface-2)', borderColor: 'var(--accent)' }}>
        <input
          ref={inputRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter')  { e.preventDefault(); submit(); }
            if (e.key === 'Escape') { setActive(false); setTitle(''); }
          }}
          onBlur={() => { if (!title.trim()) { setActive(false); setTitle(''); } }}
          placeholder="Título del proyecto…"
          className="w-full bg-transparent outline-none text-[13px]"
          style={{ color: 'var(--text)' }}
        />
        <div className="flex items-center gap-1.5 mt-2">
          <button onMouseDown={(e) => e.preventDefault()} onClick={submit} disabled={!title.trim()}
            className="px-2 py-1 rounded text-[11px] font-semibold disabled:opacity-40"
            style={{ background: 'var(--accent)', color: '#0a0a0b' }}>
            Crear
          </button>
          <button onMouseDown={(e) => e.preventDefault()} onClick={() => { setActive(false); setTitle(''); }}
            className="px-1.5 py-1 rounded text-[var(--text-muted)] hover:text-white" style={{ background: 'var(--surface-3)' }}>
            <Icon name="x" size={12} />
          </button>
          <span className="ml-auto text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>Enter ↵</span>
        </div>
      </div>
    );
  }

  // ── Variant mini: solo "+" discreto (aparece en hover) ──
  if (variant === 'mini') {
    return (
      <button onClick={() => setActive(true)}
        className="w-full flex items-center justify-center py-1 rounded text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)] transition-colors opacity-0 group-hover:opacity-100"
        title={label}>
        <Icon name="plus" size={13} />
      </button>
    );
  }

  // ── Variant full: botón ancho con borde punteado ──
  return (
    <button onClick={() => setActive(true)}
      className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-[12px] font-medium border border-dashed transition-colors text-[var(--text-muted)] hover:text-white hover:border-[var(--text-muted)]"
      style={{ borderColor: 'var(--border-2)' }}>
      <Icon name="plus" size={13} />
      {label}
    </button>
  );
};

// ── KANBAN VIEW ─────────────────────────────────────────────────
const CARD_LIMIT = 5; // tarjetas visibles por defecto en cada columna

const KanbanView = ({ projects, onOpenProject, onUpdateProject, onDeleteProject, onDuplicateProject, onToggleFavorite, onQuickCreate, columns, onUpdateColumn, onDeleteColumn, onAddColumn, onReorderColumns, previewFields = {} }) => {
  const [draggingId,    setDraggingId]    = useState(null);   // card drag
  const [draggingColId, setDraggingColId] = useState(null);   // column drag
  const [dragOverCol,   setDragOverCol]   = useState(null);
  const [addingCol,     setAddingCol]     = useState(false);
  const [newColLabel,   setNewColLabel]   = useState('');
  const [expandedCols,  setExpandedCols]  = useState({});     // colId → true cuando está expandida
  // Ref to throttle dragOver: only call setState when the hovered column actually changes
  const lastOverRef = useRef(null);

  const toggleExpand = (colId) =>
    setExpandedCols(prev => ({ ...prev, [colId]: !prev[colId] }));

  const baseCols = (columns && columns.length > 0)
    ? columns
    : STATUSES.filter(s => s.id !== 'archived');

  const reorder = (arr, fromId, toId) => {
    const a = [...arr];
    const fi = a.findIndex(c => c.id === fromId);
    const ti = a.findIndex(c => c.id === toId);
    if (fi < 0 || ti < 0) return a;
    a.splice(ti, 0, a.splice(fi, 1)[0]);
    return a;
  };

  // Throttled dragOver — only update state when entering a different column
  const handleDragOver = (e, colId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (lastOverRef.current !== colId) {
      lastOverRef.current = colId;
      setDragOverCol(colId);
    }
  };

  const resetDrag = () => {
    setDraggingId(null);
    setDraggingColId(null);
    setDragOverCol(null);
    lastOverRef.current = null;
  };

  // Card drop → change status
  const onCardDrop = (statusId) => (e) => {
    e.preventDefault();
    if (!draggingId) return;
    const p = projects.find(x => x.id === draggingId);
    if (p && p.status !== statusId) onUpdateProject({ ...p, status: statusId });
    resetDrag();
  };

  // Column drop → commit reorder
  const onColDrop = (e, targetId) => {
    e.preventDefault();
    if (draggingColId && draggingColId !== targetId && onReorderColumns) {
      onReorderColumns(reorder(baseCols, draggingColId, targetId));
    }
    resetDrag();
  };

  const submitNewCol = () => {
    const lbl = newColLabel.trim();
    if (!lbl) return;
    const id    = 'col_' + Date.now() + Math.random().toString(36).slice(2, 5);
    const color = COL_COLORS[baseCols.length % COL_COLORS.length];
    onAddColumn({ id, label: lbl, color });
    setNewColLabel('');
    setAddingCol(false);
  };

  return (
    <div className="h-full overflow-x-auto p-4" style={{ overflowY: 'visible' }}>
      <div className="flex gap-3 h-full" style={{ minWidth: 'fit-content' }}>

        {baseCols.map(s => {
          const items           = projects.filter(p => p.status === s.id);
          const isCardOver      = dragOverCol === s.id && !!draggingId && !draggingColId;
          const isColOver       = dragOverCol === s.id && !!draggingColId && draggingColId !== s.id;
          const isBeingDragged  = draggingColId === s.id;

          const isExpanded   = !!expandedCols[s.id];
          const visibleItems = isExpanded ? items : items.slice(0, CARD_LIMIT);
          const hiddenCount  = Math.max(0, items.length - CARD_LIMIT);

          return (
            <div
              key={s.id}
              className="flex flex-col w-[280px] flex-shrink-0 rounded-xl border transition-all"
              style={{
                background: 'var(--surface)',
                borderColor: isColOver ? 'var(--accent)' : isCardOver ? s.color + '88' : 'var(--border)',
                boxShadow: isColOver ? '0 0 0 2px var(--accent)' : 'none',
                opacity: isBeingDragged ? 0.4 : 1,
                height: '100%',
              }}
              onDragOver={(e) => handleDragOver(e, s.id)}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) {
                  if (lastOverRef.current === s.id) {
                    lastOverRef.current = null;
                    setDragOverCol(null);
                  }
                }
              }}
              onDrop={(e) => draggingColId ? onColDrop(e, s.id) : onCardDrop(s.id)(e)}
            >
              {/* Column header — draggable to reorder */}
              <div
                className="flex items-center justify-between px-3 py-3 border-b border-app flex-shrink-0 select-none"
                draggable={!!onReorderColumns}
                style={{ cursor: onReorderColumns ? 'grab' : 'default' }}
                onDragStart={(e) => {
                  e.stopPropagation();
                  setTimeout(() => setDraggingColId(s.id), 0);
                  setDraggingId(null);
                  e.dataTransfer.effectAllowed = 'move';
                  e.dataTransfer.setData('text/plain', s.id);
                }}
                onDragEnd={resetDrag}
              >
                <div className="flex items-center gap-2">
                  {onReorderColumns && (
                    <Icon name="drag" size={12} className="text-[var(--text-muted)] opacity-40 flex-shrink-0" />
                  )}
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }}></span>
                  <span className="text-[12px] font-semibold">{s.label}</span>
                  <span className="text-[11px] text-[var(--text-muted)] font-mono px-1.5 rounded" style={{ background: 'var(--surface-2)' }}>
                    {items.length}
                  </span>
                </div>
                {onUpdateColumn && (
                  <ColMenuBtn
                    col={s}
                    projectCount={items.length}
                    onUpdate={onUpdateColumn}
                    onDelete={onDeleteColumn}
                  />
                )}
              </div>

              {/* Cards */}
              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {visibleItems.map(p => (
                  <ProjectCardMini
                    key={p.id}
                    project={p}
                    onClick={() => onOpenProject(p.id)}
                    draggable
                    onDragStart={() => { setDraggingId(p.id); setDraggingColId(null); }}
                    onDragEnd={resetDrag}
                    dragging={draggingId === p.id}
                    onDelete={onDeleteProject}
                    onDuplicate={onDuplicateProject}
                    onToggleFavorite={onToggleFavorite}
                    previewFields={previewFields}
                  />
                ))}

                {items.length === 0 && (
                  <div className="text-center py-10 px-4 border border-dashed rounded-lg" style={{ borderColor: 'var(--border-2)' }}>
                    <div className="text-[var(--text-muted)] text-[11px]">Sin proyectos en {s.label.toLowerCase()}</div>
                    <div className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>Arrastrá una tarjeta acá</div>
                  </div>
                )}

                {/* Ver más / Ver menos */}
                {hiddenCount > 0 && !isExpanded && (
                  <button
                    onClick={() => toggleExpand(s.id)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-[12px] font-medium transition-colors hover:bg-[var(--surface-2)] hover:text-white"
                    style={{ color: 'var(--text-muted)', border: '1px dashed var(--border-2)' }}
                  >
                    <Icon name="chevronDown" size={12} />
                    Ver {hiddenCount} más
                  </button>
                )}
                {isExpanded && items.length > CARD_LIMIT && (
                  <button
                    onClick={() => toggleExpand(s.id)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-[12px] font-medium transition-colors hover:bg-[var(--surface-2)] hover:text-white"
                    style={{ color: 'var(--text-muted)', border: '1px dashed var(--border-2)' }}
                  >
                    <Icon name="chevronDown" size={12} style={{ transform: 'rotate(180deg)' }} />
                    Ver menos
                  </button>
                )}

                {/* Alta rápida: crea una tarjeta vacía en esta columna */}
                {onQuickCreate && (
                  <QuickAddCard
                    onCreate={onQuickCreate}
                    context={{ status: s.id }}
                    label="Agregar tarjeta"
                  />
                )}
              </div>
            </div>
          );
        })}

        {/* ── Agregar columna ── */}
        {onAddColumn && (
          <div className="flex-shrink-0 w-[220px] pt-0.5">
            {addingCol ? (
              <div className="rounded-xl border p-3 space-y-2" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                <input
                  autoFocus
                  value={newColLabel}
                  onChange={(e) => setNewColLabel(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') submitNewCol();
                    if (e.key === 'Escape') { setAddingCol(false); setNewColLabel(''); }
                  }}
                  placeholder="Nombre de la columna…"
                  className="w-full px-2.5 py-1.5 rounded-md text-[13px] border"
                  style={{ background: 'var(--surface-3)', borderColor: 'var(--border)', color: 'var(--text)' }}
                />
                <div className="flex gap-1.5">
                  <button
                    onClick={submitNewCol}
                    disabled={!newColLabel.trim()}
                    className="flex-1 py-1.5 rounded-md text-[12px] font-semibold disabled:opacity-40"
                    style={{ background: 'var(--accent)', color: '#0a0a0b' }}
                  >Crear</button>
                  <button
                    onClick={() => { setAddingCol(false); setNewColLabel(''); }}
                    className="px-2.5 py-1.5 rounded-md text-[var(--text-muted)] hover:text-white"
                    style={{ background: 'var(--surface-2)' }}
                  ><Icon name="x" size={13} /></button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setAddingCol(true)}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-[13px] border border-dashed text-[var(--text-dim)] hover:text-white hover:border-[var(--text-muted)] transition-colors"
                style={{ borderColor: 'var(--border-2)' }}
              >
                <Icon name="plus" size={14} />
                Agregar columna
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

// localISO vive en data.jsx, que carga antes que este archivo, para que
// esté disponible en toda la app y no solo en las vistas.

// ── CALENDAR VIEW ───────────────────────────────────────────────
const CalendarView = ({ projects, onOpenProject, onDeleteProject, onDuplicateProject, onUpdateProject, onToggleFavorite, onQuickCreate, previewFields = {} }) => {
  const [refDate, setRefDate] = useState(new Date(TODAY));
  const [mode, setMode] = useState('month'); // month | week | day
  const [dragging, setDragging]       = useState(null); // { id, kind }
  const [dragOverDate, setDragOverDate] = useState(null);
  const lastOverRef = useRef(null);

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

  const isSameDay = (a, b) => a.toDateString() === b.toDateString();
  const todayDt = new Date(TODAY);

  // Etiqueta del header según el modo
  const monthLabel = (() => {
    if (mode === 'month') {
      return refDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    }
    if (mode === 'week') {
      const weekStart = new Date(refDate);
      const dow = (refDate.getDay() + 6) % 7; // lunes = 0
      weekStart.setDate(refDate.getDate() - dow);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      const sameMonth = weekStart.getMonth() === weekEnd.getMonth();
      const sameYear  = weekStart.getFullYear() === weekEnd.getFullYear();
      const startStr  = weekStart.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
      const endStr    = weekEnd.toLocaleDateString('es-ES',
        sameYear ? { day: 'numeric', month: 'short' } : { day: 'numeric', month: 'short', year: 'numeric' }
      );
      return `${startStr} – ${endStr}${sameYear ? ', ' + weekStart.getFullYear() : ''}`;
    }
    // day
    return refDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  })();

  // Navegación consciente del modo
  const goPrev = () => {
    const d = new Date(refDate);
    if (mode === 'week')  d.setDate(d.getDate() - 7);
    else if (mode === 'day') d.setDate(d.getDate() - 1);
    else return setRefDate(new Date(year, month - 1, 1));
    setRefDate(d);
  };
  const goNext = () => {
    const d = new Date(refDate);
    if (mode === 'week')  d.setDate(d.getDate() + 7);
    else if (mode === 'day') d.setDate(d.getDate() + 1);
    else return setRefDate(new Date(year, month + 1, 1));
    setRefDate(d);
  };
  const goToday = () => setRefDate(new Date(TODAY));

  // ── Drag handlers ─────────────────────────────────────────────
  const handleDragStart = (e, p) => {
    setDragging({ id: p.id, kind: p._kind });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', p.id); // needed for Firefox
  };
  const handleDragEnd = () => { setDragging(null); setDragOverDate(null); lastOverRef.current = null; };
  const handleDragOver = (e, iso) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (lastOverRef.current !== iso) { lastOverRef.current = iso; setDragOverDate(iso); }
  };
  const handleDrop = (e, iso) => {
    e.preventDefault();
    if (!dragging) return;
    const project = projects.find(p => p.id === dragging.id);
    if (!project) return;
    const currentDate = dragging.kind === 'deadline' ? project.deadline : project.sessionDate;
    if (currentDate === iso) { setDragging(null); setDragOverDate(null); return; }
    // Mueve deadline Y sessionDate juntos para que el proyecto no aparezca en dos días
    onUpdateProject && onUpdateProject({ ...project, deadline: iso, sessionDate: iso });
    setDragging(null); setDragOverDate(null); lastOverRef.current = null;
  };

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
        <div className="flex-1 flex flex-col overflow-y-auto">
          <div className="sticky top-0 z-10 grid grid-cols-7 border-b border-app" style={{ background: 'var(--surface)' }}>
            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => (
              <div key={d} className="px-3 py-2 text-[10px] font-semibold tracking-[0.18em] uppercase text-[var(--text-muted)]">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {monthGrid.map((dt, i) => {
              const inMonth = dt.getMonth() === month;
              const iso = localISO(dt);
              const items = projectsByDate[iso] || [];
              const isToday = isSameDay(dt, todayDt);
              const isDragOver = dragOverDate === iso;
              return (
                <div
                  key={i}
                  className={`group relative border-r border-b p-1.5 min-h-[110px] transition-colors ${inMonth ? '' : 'opacity-40'}`}
                  style={{
                    background: isDragOver
                      ? 'rgba(212,255,79,0.08)'
                      : isToday ? 'var(--accent-soft)' : 'transparent',
                    borderColor: isDragOver ? 'rgba(212,255,79,0.4)' : 'var(--border)',
                  }}
                  onDragOver={(e) => handleDragOver(e, iso)}
                  onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) { setDragOverDate(null); lastOverRef.current = null; } }}
                  onDrop={(e) => handleDrop(e, iso)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[11px] font-mono ${isToday ? 'font-bold' : 'text-[var(--text-muted)]'}`} style={{ color: isToday ? 'var(--accent)' : undefined }}>
                      {dt.getDate()}
                    </span>
                    {isToday && <span className="text-[10px] font-bold tracking-wider" style={{ color: 'var(--accent)' }}>HOY</span>}
                    {isDragOver && <span className="text-[10px] font-bold tracking-wider" style={{ color: 'var(--accent)' }}>SOLTAR</span>}
                  </div>
                  <div className="space-y-1.5">
                    {items.map(p => (
                      <WeekCard
                        key={p.id + p._kind}
                        project={p}
                        onClick={() => !dragging && onOpenProject(p.id)}
                        draggable
                        onDragStart={(e) => handleDragStart(e, p)}
                        onDragEnd={handleDragEnd}
                        dragging={dragging?.id === p.id && dragging?.kind === p._kind}
                        onDelete={onDeleteProject}
                        onDuplicate={onDuplicateProject}
                        onToggleFavorite={onToggleFavorite}
                        previewFields={previewFields}
                      />
                    ))}
                    {/* Alta rápida en este día */}
                    {onQuickCreate && (
                      <QuickAddCard
                        onCreate={onQuickCreate}
                        context={{ sessionDate: iso, deadline: iso }}
                        variant="mini"
                        label="Agregar tarjeta este día"
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {mode === 'week' && (
        <WeekView refDate={refDate} projectsByDate={projectsByDate} onOpenProject={onOpenProject} onDeleteProject={onDeleteProject} onDuplicateProject={onDuplicateProject} onUpdateProject={onUpdateProject} onToggleFavorite={onToggleFavorite} onQuickCreate={onQuickCreate} previewFields={previewFields} />
      )}
      {mode === 'day' && (
        <DayView refDate={refDate} projectsByDate={projectsByDate} onOpenProject={onOpenProject} onDeleteProject={onDeleteProject} onDuplicateProject={onDuplicateProject} onToggleFavorite={onToggleFavorite} onQuickCreate={onQuickCreate} previewFields={previewFields} />
      )}
    </div>
  );
};

// ── Tarjeta vertical estilo Notion para vista semanal ────────────
// Cada property en su propia fila → el título puede wrappear libremente
// y la tarjeta se adapta a cualquier ancho de columna sin aplastar nada.
const WeekCard = ({ project, onClick, draggable, onDragStart, onDragEnd, dragging, onToggleFavorite, onDelete, onDuplicate, previewFields: pf = {} }) => {
  const [confirmDel, setConfirmDel] = React.useState(false);
  const t        = getType(project.type);
  const st       = getStatus(project.status);
  const days     = daysUntil(project.deadline);
  const urgent = isUrgent(project);
  const isOver   = days < 0  && project.status !== 'delivered' && project.status !== 'archived';
  const progress = progressOf(project);
  const hasTags  = pf.tags && project.tags?.length > 0;

  return (
    <div
      onClick={onClick}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`group cursor-pointer rounded-lg overflow-hidden select-none border lift ${dragging ? 'dragging' : ''}`}
      style={{ background: 'var(--surface-2)', borderColor: 'var(--border)', borderTop: `3px solid ${t.color}` }}
    >
      <div className="p-2.5 flex flex-col gap-1.5">

        {/* Fila tipo + urgencia + botones de acción */}
        <div className="flex items-start justify-between gap-1">
          <div className="flex items-center gap-1 flex-wrap">
            {pf.tipo !== false && <TypePill type={project.type} />}
            {pf.prioridad !== false && urgent && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'var(--danger)', color: '#0a0a0b' }}>URG</span>
            )}
            {pf.prioridad !== false && isOver && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'var(--danger-soft-2)', color: 'var(--danger)' }}>VENC</span>
            )}
          </div>

          {/* Botones — visibles en hover */}
          <div className="flex items-center gap-0.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            {!confirmDel ? (
              <>
                {onToggleFavorite && (
                  <button
                    onClick={() => onToggleFavorite(project.id)}
                    className={`p-1 rounded transition-all ${project.favorite ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                    style={{ color: project.favorite ? 'var(--warn)' : 'var(--text-muted)' }}
                    title={project.favorite ? 'Quitar favorito' : 'Favorito'}
                  >
                    <Icon name="star" size={11} fill={project.favorite ? 'currentColor' : 'none'} />
                  </button>
                )}
                {onDuplicate && (
                  <button
                    onClick={() => onDuplicate(project.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)] transition-all"
                    title="Duplicar"
                  >
                    <Icon name="copy" size={11} />
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => setConfirmDel(true)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger-soft)] transition-all"
                    title="Eliminar"
                  >
                    <Icon name="trash" size={11} />
                  </button>
                )}
              </>
            ) : (
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-semibold" style={{ color: 'var(--danger)' }}>¿Eliminar?</span>
                <button onClick={() => onDelete(project.id)} className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'var(--danger)', color: '#0a0a0b' }}>Sí</button>
                <button onClick={() => setConfirmDel(false)} className="text-[10px] font-medium px-1.5 py-0.5 rounded text-[var(--text-muted)] hover:text-white" style={{ background: 'var(--surface-3)' }}>No</button>
              </div>
            )}
          </div>
        </div>

        {/* Título — wrappea libremente */}
        <div className="font-display font-semibold text-[13px] leading-snug pretty" style={{ color: 'var(--text)' }}>
          {project.title}
        </div>

        {/* Cliente */}
        {pf.cliente !== false && project.client && (
          <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{project.client}</div>
        )}

        {/* Estado */}
        {pf.estado !== false && (
          <div><StatusPill status={project.status} size="sm" /></div>
        )}

        {/* Tags */}
        {hasTags && (
          <div className="flex flex-wrap gap-1">
            {project.tags.slice(0, 3).map(tag => (
              <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'var(--surface-3)', color: 'var(--text-muted)' }}>#{tag}</span>
            ))}
          </div>
        )}

        {/* Barra de progreso */}
        {pf.progreso !== false && (
          <div className="flex items-center gap-1.5">
            <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'var(--surface-3)' }}>
              <div className="h-full rounded-full" style={{ width: progress + '%', background: t.color, transition: 'width 400ms' }} />
            </div>
            <span className="text-[10px] font-mono flex-shrink-0" style={{ color: t.color }}>{progress}%</span>
          </div>
        )}

        {/* Responsables + deadline — fila final */}
        {(pf.responsables !== false || pf.deadline !== false) && (
          <div className="flex items-center justify-between gap-1 mt-0.5">
            {pf.responsables !== false ? <AvatarStack ids={project.assignees} size={16} max={3} /> : <span />}
            {pf.deadline !== false && project.deadline && (
              <div className="flex items-center gap-0.5 text-[10px] font-mono" style={{ color: isOver ? 'var(--danger)' : 'var(--text-muted)' }}>
                <Icon name="calendar" size={9} />
                {fmtDate(project.deadline)}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

const WeekView = ({ refDate, projectsByDate, onOpenProject, onDeleteProject, onDuplicateProject, onUpdateProject, onToggleFavorite, onQuickCreate, previewFields = {} }) => {
  const [dragging, setDragging]         = React.useState(null); // { id, kind }
  const [dragOverDate, setDragOverDate] = React.useState(null);
  const lastOverRef                     = React.useRef(null);

  const start = new Date(refDate);
  const day   = (start.getDay() + 6) % 7; // Monday-first offset
  start.setDate(start.getDate() - day);
  const days = Array.from({ length: 7 }, (_, i) => {
    const dt = new Date(start);
    dt.setDate(start.getDate() + i);
    return dt;
  });
  const todayDt = new Date(TODAY);

  // ── Drag handlers ───────────────────────────────────────────────
  const handleDragStart = (e, p) => {
    setDragging({ id: p.id, kind: p._kind });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', p.id);
  };
  const handleDragEnd = () => {
    setDragging(null); setDragOverDate(null); lastOverRef.current = null;
  };
  const handleDragOver = (e, iso) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (lastOverRef.current !== iso) { lastOverRef.current = iso; setDragOverDate(iso); }
  };
  const handleDrop = (e, iso) => {
    e.preventDefault();
    if (!dragging) return;
    // Find the project across all days (items have _kind injected)
    let found = null;
    Object.values(projectsByDate).forEach(items => {
      const match = items.find(p => p.id === dragging.id && p._kind === dragging.kind);
      if (match) found = match;
    });
    if (!found) return;
    const currentDate = dragging.kind === 'deadline' ? found.deadline : found.sessionDate;
    if (currentDate === iso) { setDragging(null); setDragOverDate(null); return; }
    // Strip _kind before saving, move both dates together
    const { _kind, ...cleanProject } = found;
    onUpdateProject && onUpdateProject({ ...cleanProject, deadline: iso, sessionDate: iso });
    setDragging(null); setDragOverDate(null); lastOverRef.current = null;
  };

  return (
    // overflow-x-auto: scroll horizontal cuando las 7 columnas no caben
    // Cada columna tiene min-width 190px para que las tarjetas no se aplasten
    <div className="flex-1 overflow-x-auto overflow-y-hidden">
      <div className="flex h-full" style={{ minWidth: 'calc(7 * 160px)' }}>
        {days.map((dt, i) => {
          const iso        = localISO(dt);
          const items      = projectsByDate[iso] || [];
          const isToday    = dt.toDateString() === todayDt.toDateString();
          const isDragOver = dragOverDate === iso;
          return (
            <div
              key={i}
              className="border-r border-app overflow-y-auto transition-colors flex-shrink-0"
              style={{
                width: 'calc(100% / 7)',
                minWidth: 160,
                background:   isDragOver ? 'rgba(212,255,79,0.08)' : isToday ? 'var(--accent-soft)' : 'transparent',
                borderColor:  isDragOver ? 'rgba(212,255,79,0.4)'  : 'var(--border)',
              }}
              onDragOver={(e)  => handleDragOver(e, iso)}
              onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) { setDragOverDate(null); lastOverRef.current = null; } }}
              onDrop={(e)      => handleDrop(e, iso)}
            >
              {/* Day header */}
              <div className="sticky top-0 px-3 py-2 border-b border-app flex items-baseline gap-2 select-none" style={{ background: 'var(--surface)' }}>
                <span className="text-[10px] tracking-[0.18em] uppercase text-[var(--text-muted)]">
                  {dt.toLocaleDateString('es-ES', { weekday: 'short' })}
                </span>
                <span className="text-lg font-display font-bold" style={{ color: isToday ? 'var(--accent)' : 'var(--text-dim)' }}>
                  {dt.getDate()}
                </span>
                {items.length > 0 && (
                  <span className="ml-auto text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>{items.length}</span>
                )}
                {isDragOver && (
                  <span className="ml-auto text-[10px] font-bold tracking-wider" style={{ color: 'var(--accent)' }}>SOLTAR</span>
                )}
              </div>

              {/* WeekCard: layout vertical estilo Notion */}
              <div className="group p-2 space-y-2">
                {items.length === 0 && (
                  <div className="text-[10px] text-center py-6" style={{ color: isDragOver ? 'var(--accent)' : 'var(--text-muted)' }}>
                    {isDragOver ? '↓' : '—'}
                  </div>
                )}
                {items.map(p => (
                  <WeekCard
                    key={p.id + p._kind}
                    project={p}
                    onClick={() => !dragging && onOpenProject(p.id)}
                    draggable
                    onDragStart={(e) => handleDragStart(e, p)}
                    onDragEnd={handleDragEnd}
                    dragging={dragging?.id === p.id && dragging?.kind === p._kind}
                    onToggleFavorite={onToggleFavorite}
                    onDelete={onDeleteProject}
                    onDuplicate={onDuplicateProject}
                    previewFields={previewFields}
                  />
                ))}
                {/* Alta rápida en este día */}
                {onQuickCreate && (
                  <QuickAddCard
                    onCreate={onQuickCreate}
                    context={{ sessionDate: iso, deadline: iso }}
                    variant="mini"
                    label="Agregar tarjeta este día"
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const DayView = ({ refDate, projectsByDate, onOpenProject, onDeleteProject, onDuplicateProject, onToggleFavorite, onQuickCreate, previewFields = {} }) => {
  const iso = localISO(refDate);
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
          <ProjectCardMini key={p.id + p._kind} project={p} onClick={() => onOpenProject(p.id)} onDelete={onDeleteProject} onDuplicate={onDuplicateProject} onToggleFavorite={onToggleFavorite} previewFields={previewFields} />
        ))}
        {/* Alta rápida en este día */}
        {onQuickCreate && (
          <QuickAddCard
            onCreate={onQuickCreate}
            context={{ sessionDate: iso, deadline: iso }}
            label="Agregar tarjeta este día"
          />
        )}
      </div>
    </div>
  );
};

// ── GALLERY VIEW ────────────────────────────────────────────────
const GalleryView = ({ projects, onOpenProject, onDeleteProject, onDuplicateProject, onToggleFavorite, onQuickCreate, previewFields = {} }) => {
  if (projects.length === 0 && !onQuickCreate) return <EmptyState />;
  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
        {projects.map(p => <GalleryCard key={p.id} project={p} onClick={() => onOpenProject(p.id)} onDelete={onDeleteProject} onDuplicate={onDuplicateProject} onToggleFavorite={onToggleFavorite} previewFields={previewFields} />)}
        {/* Alta rápida: tarjeta vacía al final de la grilla */}
        {onQuickCreate && (
          <GalleryAddCard onCreate={onQuickCreate} />
        )}
      </div>
    </div>
  );
};

// ── Tarjeta de alta rápida para la galería (mantiene el aspect-ratio del grid) ──
const GalleryAddCard = ({ onCreate }) => {
  const [active, setActive] = React.useState(false);
  const [title, setTitle]   = React.useState('');
  const inputRef = React.useRef(null);

  React.useEffect(() => { if (active) inputRef.current?.focus(); }, [active]);

  const submit = () => {
    const t = title.trim();
    if (!t) { setActive(false); setTitle(''); return; }
    onCreate({ title: t });
    setTitle('');
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  return (
    <div
      onClick={() => !active && setActive(true)}
      className="rounded-xl border border-dashed flex flex-col items-center justify-center aspect-[4/3] transition-colors select-none cursor-pointer hover:border-[var(--text-muted)]"
      style={{ borderColor: active ? 'var(--accent)' : 'var(--border-2)', background: 'var(--surface)' }}
    >
      {active ? (
        <div className="w-full px-4" onClick={(e) => e.stopPropagation()}>
          <input
            ref={inputRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter')  { e.preventDefault(); submit(); }
              if (e.key === 'Escape') { setActive(false); setTitle(''); }
            }}
            onBlur={() => { if (!title.trim()) { setActive(false); setTitle(''); } }}
            placeholder="Título del proyecto…"
            className="w-full bg-transparent outline-none text-center text-[15px] border-b pb-1.5"
            style={{ color: 'var(--text)', borderColor: 'var(--accent)' }}
          />
          <div className="flex items-center justify-center gap-1.5 mt-3">
            <button onMouseDown={(e) => e.preventDefault()} onClick={submit} disabled={!title.trim()}
              className="px-3 py-1 rounded text-[11px] font-semibold disabled:opacity-40"
              style={{ background: 'var(--accent)', color: '#0a0a0b' }}>
              Crear
            </button>
            <button onMouseDown={(e) => e.preventDefault()} onClick={() => { setActive(false); setTitle(''); }}
              className="px-2 py-1 rounded text-[var(--text-muted)] hover:text-white" style={{ background: 'var(--surface-3)' }}>
              <Icon name="x" size={12} />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 text-[var(--text-muted)]">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--surface-2)' }}>
            <Icon name="plus" size={18} />
          </div>
          <span className="text-[12px] font-medium">Agregar proyecto</span>
        </div>
      )}
    </div>
  );
};

const GalleryCard = ({ project, onClick, onDelete, onDuplicate, onToggleFavorite, previewFields = {} }) => {
  const pf = previewFields;
  const t = getType(project.type);
  const progress = progressOf(project);
  const days = daysUntil(project.deadline);
  const urgent = isUrgent(project);
  const [confirmDel, setConfirmDel] = React.useState(false);
  const hasTags = pf.tags && project.tags && project.tags.length > 0;

  return (
    <div
      onClick={onClick}
      className="group lift cursor-pointer rounded-xl overflow-hidden border surface-2 select-none"
      style={{ borderColor: 'var(--border)' }}
    >
      <div className="relative aspect-[4/3] overflow-hidden" style={{ background: project.cover.type === 'color' ? project.cover.value : 'var(--surface-3)' }}>
        {project.cover.type === 'image' && (
          <img src={project.cover.value} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent"></div>
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
          {pf.tipo !== false && <TypePill type={project.type} />}
          <div className="flex items-center gap-1.5 ml-auto">
            {pf.prioridad !== false && urgent && (
              <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded" style={{ background: 'var(--danger)', color: '#0a0a0b' }}>URGENTE</span>
            )}
            {onToggleFavorite && !confirmDel && (
              <button
                onClick={(e) => { e.stopPropagation(); onToggleFavorite(project.id); }}
                className={`p-1.5 rounded-md transition-all ${project.favorite ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                style={{ background: 'rgba(0,0,0,0.55)', color: project.favorite ? 'var(--warn)' : 'white', backdropFilter: 'blur(4px)' }}
                title={project.favorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
              >
                <Icon name="star" size={12} fill={project.favorite ? 'currentColor' : 'none'} />
              </button>
            )}
            {!confirmDel && onDuplicate && (
              <button onClick={(e) => { e.stopPropagation(); onDuplicate(project.id); }}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md transition-all"
                style={{ background: 'rgba(0,0,0,0.55)', color: 'white', backdropFilter: 'blur(4px)' }}
                title="Duplicar">
                <Icon name="copy" size={12} />
              </button>
            )}
            {onDelete && !confirmDel && (
              <button onClick={(e) => { e.stopPropagation(); setConfirmDel(true); }}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md transition-all"
                style={{ background: 'rgba(0,0,0,0.55)', color: 'white', backdropFilter: 'blur(4px)' }}
                title="Eliminar">
                <Icon name="trash" size={12} />
              </button>
            )}
            {onDelete && confirmDel && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }} onClick={(e) => e.stopPropagation()}>
                <span className="text-[10px] font-semibold text-white">¿Eliminar?</span>
                <button onClick={(e) => { e.stopPropagation(); onDelete(project.id); }} className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ background: 'var(--danger)', color: '#0a0a0b' }}>Sí</button>
                <button onClick={(e) => { e.stopPropagation(); setConfirmDel(false); }} className="text-[10px] text-white/60 hover:text-white px-1">No</button>
              </div>
            )}
          </div>
        </div>
        {pf.estado !== false && (
          <div className="absolute bottom-3 left-3 right-3">
            <StatusPill status={project.status} />
          </div>
        )}
      </div>
      <div className="p-3.5">
        {pf.cliente !== false && (
          <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider mb-1">{project.client}</div>
        )}
        <h3 className="font-display font-semibold text-[15px] leading-tight mb-2 balance" style={{ letterSpacing: '-0.01em' }}>
          {project.title}
        </h3>
        {pf.presupuesto && project.budget > 0 && (
          <div className="text-[11px] font-mono mb-2" style={{ color: 'var(--text-dim)' }}>
            {project.currency || 'USD'} {project.budget.toLocaleString()}
          </div>
        )}
        {hasTags && (
          <div className="flex flex-wrap gap-1 mb-2">
            {project.tags.slice(0, 3).map(tag => (
              <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'var(--surface-3)', color: 'var(--text-muted)' }}>#{tag}</span>
            ))}
          </div>
        )}
        {(pf.responsables !== false || pf.deadline !== false) && (
          <div className="flex items-center justify-between mb-2">
            {pf.responsables !== false ? <AvatarStack ids={project.assignees} size={20} /> : <span />}
            {pf.deadline !== false && (
              <div className="text-[10px] text-[var(--text-muted)] font-mono">
                <Icon name="calendar" size={10} className="inline mr-1" />{fmtDate(project.deadline)}
              </div>
            )}
          </div>
        )}
        {pf.progreso !== false && (
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'var(--surface-3)' }}>
              <div className="h-full transition-all duration-500" style={{ width: progress + '%', background: t.color }}></div>
            </div>
            <div className="text-[10px] font-mono" style={{ color: t.color }}>{progress}%</div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── LIST VIEW ───────────────────────────────────────────────────
const ListRow = ({ p, onOpenProject, onDeleteProject, onDuplicateProject, onToggleFavorite }) => {
  const t = getType(p.type);
  const days = daysUntil(p.deadline);
  const urgent = isUrgent(p);
  const overdue = isOverdue(p);
  const progress = progressOf(p);
  const [confirmDel, setConfirmDel] = React.useState(false);

  return (
    <tr
      key={p.id}
      onClick={() => onOpenProject(p.id)}
      className="group cursor-pointer border-b border-app hover:bg-[var(--surface-2)] transition-colors select-none"
    >
      <td className="px-5 py-3">
        <div className="flex items-center gap-2.5">
          <div className="w-1 h-8 rounded-full" style={{ background: t.color }}></div>
          <div className="min-w-0">
            <div className="font-medium truncate">{p.title}</div>
            <div className="text-[11px] text-[var(--text-muted)] font-mono">
              {p.tags.slice(0, 2).map(tag => '#' + tag).join(' ')}
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
          <span className={overdue ? 'text-[var(--danger)]' : 'text-[var(--text-dim)]'}>
            {fmtDate(p.deadline)}
          </span>
          {urgent && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'var(--danger)', color: '#0a0a0b' }}>URG</span>}
          {overdue && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'var(--danger-soft-2)', color: 'var(--danger)' }}>VENC</span>}
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
      {/* Acciones */}
      <td className="px-3 py-3 text-right" onClick={(e) => e.stopPropagation()}>
        {!confirmDel && (
          <div className="opacity-0 group-hover:opacity-100 flex items-center justify-end gap-1 transition-all">
            {onToggleFavorite && (
              <button
                onClick={() => onToggleFavorite(p.id)}
                className="p-1.5 rounded-md transition-colors"
                style={{ color: p.favorite ? 'var(--warn)' : 'var(--text-muted)' }}
                title={p.favorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
              >
                <Icon name="star" size={13} fill={p.favorite ? 'currentColor' : 'none'} />
              </button>
            )}
            {onDuplicateProject && (
              <button
                onClick={() => onDuplicateProject(p.id)}
                className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)] transition-colors"
                title="Duplicar"
              >
                <Icon name="copy" size={13} />
              </button>
            )}
            {onDeleteProject && (
              <button
                onClick={() => setConfirmDel(true)}
                className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger-soft)] transition-colors"
                title="Eliminar"
              >
                <Icon name="trash" size={13} />
              </button>
            )}
          </div>
        )}
        {onDeleteProject && confirmDel && (
          <div className="flex items-center justify-end gap-1.5">
            <span className="text-[10px] font-semibold" style={{ color: 'var(--danger)' }}>¿Eliminar?</span>
            <button
              onClick={() => onDeleteProject(p.id)}
              className="text-[10px] font-bold px-2 py-0.5 rounded"
              style={{ background: 'var(--danger)', color: '#0a0a0b' }}
            >Sí</button>
            <button
              onClick={() => setConfirmDel(false)}
              className="text-[10px] text-[var(--text-muted)] hover:text-white px-1.5 py-0.5 rounded"
              style={{ background: 'var(--surface-3)' }}
            >No</button>
          </div>
        )}
      </td>
    </tr>
  );
};

const ListView = ({ projects, onOpenProject, onDeleteProject, onDuplicateProject, onToggleFavorite }) => {
  if (projects.length === 0) return <EmptyState />;
  return (
    <div className="h-full overflow-auto">
      <table className="w-full text-[13px]">
        <thead className="sticky top-0 z-10 surface" style={{ background: 'var(--surface)' }}>
          <tr className="text-[10px] tracking-[0.18em] uppercase text-[var(--text-muted)]">
            <th className="text-left px-5 py-3 font-semibold border-b border-app w-[34%]">Proyecto</th>
            <th className="text-left px-3 py-3 font-semibold border-b border-app">Cliente</th>
            <th className="text-left px-3 py-3 font-semibold border-b border-app">Tipo</th>
            <th className="text-left px-3 py-3 font-semibold border-b border-app">Estado</th>
            <th className="text-left px-3 py-3 font-semibold border-b border-app">Equipo</th>
            <th className="text-left px-3 py-3 font-semibold border-b border-app">Deadline</th>
            <th className="text-left px-3 py-3 font-semibold border-b border-app">Prio</th>
            <th className="text-left px-3 py-3 font-semibold border-b border-app w-[110px]">Progreso</th>
            <th className="text-left px-3 py-3 font-semibold border-b border-app w-[80px]"></th>
          </tr>
        </thead>
        <tbody>
          {projects.map(p => (
            <ListRow key={p.id} p={p} onOpenProject={onOpenProject} onDeleteProject={onDeleteProject} onDuplicateProject={onDuplicateProject} onToggleFavorite={onToggleFavorite} />
          ))}
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

// ── TRASH SECTION ────────────────────────────────────────────────
const TrashSection = ({ trash, onRestore, onPermanentDelete }) => {
  const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000;
  const [confirmId, setConfirmId] = React.useState(null); // permanent-delete confirm

  const deletedAgo = (iso) => {
    const ms = Date.now() - new Date(iso).getTime();
    const d  = Math.floor(ms / 86400000);
    const h  = Math.floor((ms % 86400000) / 3600000);
    if (d > 0) return `hace ${d}d`;
    if (h > 0) return `hace ${h}h`;
    return 'hace un momento';
  };

  const daysLeft = (iso) => {
    const remaining = FIVE_DAYS_MS - (Date.now() - new Date(iso).getTime());
    return Math.max(0, Math.ceil(remaining / 86400000));
  };

  // sort: most recently deleted first
  const sorted = [...trash].sort((a, b) => new Date(b.deletedAt) - new Date(a.deletedAt));

  return (
    <main className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-app flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--surface-3)' }}>
          <Icon name="trash" size={15} className="text-[var(--text-muted)]" />
        </div>
        <div>
          <h2 className="font-display font-bold text-[17px]" style={{ letterSpacing: '-0.01em' }}>Papelera de reciclaje</h2>
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Los proyectos se eliminan permanentemente a los <strong className="text-[var(--text-dim)]">5 días</strong>
          </p>
        </div>
        {trash.length > 0 && (
          <span className="ml-auto text-[11px] font-mono px-2 py-0.5 rounded" style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}>
            {trash.length} {trash.length === 1 ? 'proyecto' : 'proyectos'}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 pb-20">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'var(--surface-2)' }}>
              <Icon name="trash" size={28} className="text-[var(--text-muted)]" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-[15px] mb-1">Papelera vacía</p>
              <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>Los proyectos eliminados aparecerán aquí</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2 max-w-2xl">
            {sorted.map(item => {
              const t   = getType(item.type);
              const dl  = daysLeft(item.deletedAt);
              const pct = progressOf(item);
              const purgeSoon = dl <= 1;
              const isConfirming = confirmId === item.id;

              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border transition-all"
                  style={{
                    background: 'var(--surface)',
                    borderColor: purgeSoon ? 'var(--danger-soft-2)' : 'var(--border)',
                  }}
                >
                  {/* Color strip */}
                  <div className="w-1 self-stretch rounded-full flex-shrink-0" style={{ background: t.color }}></div>

                  {/* Main info */}
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="font-semibold text-[13px] truncate">{item.title}</div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {item.client && (
                        <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{item.client}</span>
                      )}
                      <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>·</span>
                      <span className="text-[11px] flex items-center gap-1 font-medium" style={{ color: t.color }}>
                        <Icon name={t.icon} size={10} />{t.label}
                      </span>
                      {pct > 0 && (
                        <>
                          <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>·</span>
                          <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{pct}%</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Time indicator */}
                  <div className="flex-shrink-0 text-right mr-1 min-w-[80px]">
                    <div
                      className="text-[11px] font-semibold"
                      style={{ color: purgeSoon ? 'var(--danger)' : 'var(--text-dim)' }}
                    >
                      {dl === 0 ? 'Expira hoy' : `${dl}d restantes`}
                    </div>
                    <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {deletedAgo(item.deletedAt)}
                    </div>
                    {/* Progress bar for time remaining */}
                    <div className="mt-1 h-0.5 rounded-full overflow-hidden" style={{ background: 'var(--surface-3)', width: 64 }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${(dl / 5) * 100}%`,
                          background: purgeSoon ? 'var(--danger)' : 'var(--text-muted)',
                        }}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {isConfirming ? (
                      <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl" style={{ background: 'var(--danger-soft)', border: '1px solid var(--danger-soft-2)' }}>
                        <span className="text-[12px] font-semibold mr-1" style={{ color: 'var(--danger)' }}>¿Eliminar para siempre?</span>
                        <button
                          onClick={() => { onPermanentDelete(item.id); setConfirmId(null); }}
                          className="px-2.5 py-1 rounded-md text-[12px] font-bold transition-colors hover:brightness-110"
                          style={{ background: 'var(--danger)', color: '#0a0a0b' }}
                        >
                          Sí
                        </button>
                        <button
                          onClick={() => setConfirmId(null)}
                          className="px-2.5 py-1 rounded-md text-[12px] transition-colors hover:text-white"
                          style={{ background: 'var(--surface-3)', color: 'var(--text-muted)' }}
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => onRestore(item)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors hover:opacity-90"
                          style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
                          title="Restaurar proyecto"
                        >
                          <Icon name="arrowUpRight" size={12} />
                          Restaurar
                        </button>
                        <button
                          onClick={() => setConfirmId(item.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors hover:bg-[var(--danger-soft)] hover:text-[var(--danger)]"
                          style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}
                          title="Eliminar permanentemente"
                        >
                          <Icon name="trash" size={12} />
                          Eliminar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
};

Object.assign(window, {
  KanbanView, CalendarView, GalleryView, ListView, EmptyState, ProjectCardMini, GalleryCard, TrashSection,
});
