// ─────────────────────────────────────────────────────────────────
// RUTINA — Checklist diaria con racha y registro histórico
// ─────────────────────────────────────────────────────────────────

const RoutineSection = () => {
  const { useState, useEffect, useRef, useMemo } = React;

  const [tasks,      setTasks]      = useState([]);
  const [checks,     setChecks]     = useState({});
  const [history,    setHistory]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [editMode,   setEditMode]   = useState(false);
  const [newText,    setNewText]    = useState('');
  const [editingId,  setEditingId]  = useState(null);
  const [editingTxt, setEditingTxt] = useState('');

  const addInputRef = useRef(null);
  const todayISO    = localISO(new Date()); // localISO viene de views.jsx (global)

  // ── Firestore: escuchar y auto-resetear al cambiar de día ───────
  useEffect(() => {
    const ref = window.db.collection('frame_config').doc('daily_routine');

    const unsub = ref.onSnapshot((snap) => {
      if (!snap.exists) {
        ref.set({ tasks: [], today: { date: todayISO, checks: {} }, history: [] })
          .catch(err => console.error('[FRAME] Routine init:', err));
        setLoading(false);
        return;
      }

      const data          = snap.data();
      const storedTasks   = data.tasks   || [];
      const storedToday   = data.today   || { date: todayISO, checks: {} };
      const storedHistory = data.history || [];

      // Si el día cambió: archivar el anterior y resetear checks
      if (storedToday.date && storedToday.date !== todayISO) {
        const prevCompleted = storedTasks.filter(t => storedToday.checks?.[t.id]).length;
        const prevTotal     = storedTasks.length;
        const entry         = { date: storedToday.date, completed: prevCompleted, total: prevTotal };
        const updatedHist   = [entry, ...storedHistory].slice(0, 60);

        ref.update({ today: { date: todayISO, checks: {} }, history: updatedHist })
          .catch(err => console.error('[FRAME] Routine reset:', err));

        setChecks({});
        setHistory(updatedHist);
      } else {
        setChecks(storedToday.checks || {});
        setHistory(storedHistory);
      }

      setTasks(storedTasks);
      setLoading(false);
    }, (err) => {
      console.error('[FRAME] Routine load error:', err);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  // ── Togglear una tarea ──────────────────────────────────────────
  const toggleCheck = (taskId) => {
    const next = { ...checks, [taskId]: !checks[taskId] };
    setChecks(next);
    window.db.collection('frame_config').doc('daily_routine')
      .update({ 'today.checks': next })
      .catch(err => console.error('[FRAME] Routine toggle:', err));
  };

  // ── Agregar tarea ───────────────────────────────────────────────
  const addTask = () => {
    const text = newText.trim();
    if (!text) return;
    const id      = 't' + Date.now();
    const updated = [...tasks, { id, text }];
    setTasks(updated);
    setNewText('');
    window.db.collection('frame_config').doc('daily_routine')
      .update({ tasks: updated })
      .catch(err => console.error('[FRAME] Routine addTask:', err));
    setTimeout(() => addInputRef.current?.focus(), 50);
  };

  // ── Eliminar tarea ──────────────────────────────────────────────
  const deleteTask = (taskId) => {
    const updatedTasks  = tasks.filter(t => t.id !== taskId);
    const updatedChecks = Object.fromEntries(Object.entries(checks).filter(([k]) => k !== taskId));
    setTasks(updatedTasks);
    setChecks(updatedChecks);
    window.db.collection('frame_config').doc('daily_routine')
      .update({ tasks: updatedTasks, 'today.checks': updatedChecks })
      .catch(err => console.error('[FRAME] Routine deleteTask:', err));
  };

  // ── Renombrar tarea ─────────────────────────────────────────────
  const commitRename = () => {
    if (!editingId) return;
    const text = editingTxt.trim();
    if (!text) { setEditingId(null); return; }
    const updated = tasks.map(t => t.id === editingId ? { ...t, text } : t);
    setTasks(updated);
    setEditingId(null);
    window.db.collection('frame_config').doc('daily_routine')
      .update({ tasks: updated })
      .catch(err => console.error('[FRAME] Routine rename:', err));
  };

  // ── Computados ──────────────────────────────────────────────────
  const total     = tasks.length;
  const completed = tasks.filter(t => checks[t.id]).length;
  const allDone   = total > 0 && completed === total;
  const pct       = total === 0 ? 0 : Math.round((completed / total) * 100);

  // Racha: días consecutivos con 100% terminando hoy
  const streak = useMemo(() => {
    const perfect = new Set(
      history.filter(e => e.total > 0 && e.completed === e.total).map(e => e.date)
    );
    if (allDone && total > 0) perfect.add(todayISO);

    let count = 0;
    const now = new Date();
    for (let i = 0; i < 60; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      if (perfect.has(localISO(d))) count++;
      else break;
    }
    return count;
  }, [history, allDone, total, todayISO]);

  // Fecha legible del historial
  const fmtHist = (iso) => {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('es', { day: 'numeric', month: 'short' });
  };

  const todayLabel = new Date().toLocaleDateString('es', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  // ── Loading ─────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <span className="text-[13px] font-mono" style={{ color: 'var(--text-muted)' }}>Cargando rutina…</span>
    </div>
  );

  // ── UI ──────────────────────────────────────────────────────────
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-xl mx-auto px-8 py-8">

        {/* ─── Header ─── */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold select-none" style={{ letterSpacing: '-0.02em' }}>
              Rutina diaria
            </h1>
            <div className="text-[13px] mt-0.5 capitalize select-none" style={{ color: 'var(--text-muted)' }}>
              {todayLabel}
            </div>
          </div>

          <div className="flex items-center gap-2 mt-1">
            {/* Racha */}
            {streak > 0 && (
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full select-none"
                style={{ background: 'rgba(255,209,102,0.10)', border: '1px solid rgba(255,209,102,0.25)' }}
              >
                <span style={{ fontSize: 14 }}>🔥</span>
                <span className="text-[12px] font-bold" style={{ color: '#FFD166' }}>
                  {streak} {streak === 1 ? 'día' : 'días'}
                </span>
              </div>
            )}

            {/* Botón editar */}
            <button
              onClick={() => { setEditMode(v => !v); setNewText(''); setEditingId(null); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all"
              style={editMode
                ? { background: 'var(--accent)', color: '#0a0a0b' }
                : { background: 'var(--surface-2)', color: 'var(--text-dim)', border: '1px solid var(--border)' }
              }
            >
              <Icon name={editMode ? 'check' : 'edit'} size={12} />
              {editMode ? 'Listo' : 'Editar tareas'}
            </button>
          </div>
        </div>

        {/* ─── Score card ─── */}
        {total > 0 && (
          <div
            className="rounded-2xl border p-5 mb-5"
            style={{
              background:  allDone ? 'rgba(212,255,79,0.06)' : 'var(--surface)',
              borderColor: allDone ? 'rgba(212,255,79,0.30)' : 'var(--border)',
              transition:  'border-color 400ms, background 400ms',
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-[12.5px] select-none" style={{ color: 'var(--text-muted)' }}>
                  Progreso de hoy
                </span>
                {allDone && (
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full select-none"
                    style={{ background: 'var(--accent)', color: '#0a0a0b' }}
                  >
                    ✓ Completado
                  </span>
                )}
              </div>
              <span
                className="font-display font-black select-none"
                style={{ fontSize: 26, letterSpacing: '-0.04em', color: allDone ? 'var(--accent)' : 'var(--text)', lineHeight: 1 }}
              >
                {completed}
                <span style={{ color: 'var(--text-muted)', fontSize: 18, fontWeight: 700 }}>/{total}</span>
              </span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--surface-3)' }}>
              <div
                className="h-full rounded-full"
                style={{
                  width:      pct + '%',
                  background: allDone ? 'var(--accent)' : '#6CC4FF',
                  transition: 'width 450ms cubic-bezier(.2,.8,.2,1)',
                }}
              />
            </div>
          </div>
        )}

        {/* ─── Lista de tareas ─── */}
        <div
          className="rounded-2xl border overflow-hidden mb-6"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          {/* Estado vacío */}
          {tasks.length === 0 && (
            <div className="px-6 py-12 text-center">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border-2)' }}
              >
                <Icon name="list" size={20} style={{ color: 'var(--text-muted)' }} />
              </div>
              <div className="text-[13px] font-semibold mb-1 select-none" style={{ color: 'var(--text-dim)' }}>
                Sin tareas todavía
              </div>
              <div className="text-[11.5px] select-none" style={{ color: 'var(--text-muted)' }}>
                Tocá "Editar tareas" para armar tu rutina diaria
              </div>
            </div>
          )}

          {tasks.map((task, idx) => {
            const done    = !!checks[task.id];
            const editing = editingId === task.id;
            const isLast  = idx === tasks.length - 1;

            return (
              <div
                key={task.id}
                className="flex items-center gap-3 px-5 transition-colors"
                style={{
                  paddingTop: 14, paddingBottom: 14,
                  borderBottom: (isLast && !editMode) ? 'none' : '1px solid var(--border)',
                  background:  done && !editMode ? 'rgba(212,255,79,0.022)' : 'transparent',
                  cursor:      editMode ? 'default' : 'pointer',
                }}
                onClick={() => !editMode && !editing && toggleCheck(task.id)}
              >
                {/* Checkbox o handle */}
                {editMode ? (
                  <Icon name="drag" size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                ) : (
                  <div
                    className="flex-shrink-0"
                    style={{
                      width: 20, height: 20,
                      borderRadius: 6,
                      border:      done ? 'none' : '2px solid var(--border-2)',
                      background:  done ? 'var(--accent)' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'background 200ms, border-color 200ms',
                    }}
                  >
                    {done && <Icon name="check" size={11} strokeWidth={3} style={{ color: '#0a0a0b' }} />}
                  </div>
                )}

                {/* Texto / input renombrar */}
                {editing ? (
                  <input
                    autoFocus
                    value={editingTxt}
                    onChange={(e) => setEditingTxt(e.target.value)}
                    onBlur={commitRename}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter')  commitRename();
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    className="flex-1 text-[14px] px-2 py-0.5 rounded"
                    style={{
                      background: 'var(--surface-3)',
                      border:     '1px solid var(--accent)',
                      color:      'var(--text)',
                      outline:    'none',
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span
                    className="flex-1 text-[14px] select-none"
                    style={{
                      color:          done && !editMode ? 'var(--text-muted)' : 'var(--text)',
                      textDecoration: done && !editMode ? 'line-through' : 'none',
                      transition:     'color 200ms',
                    }}
                  >
                    {task.text}
                  </span>
                )}

                {/* Acciones en modo edición */}
                {editMode && !editing && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditingId(task.id); setEditingTxt(task.text); }}
                      className="p-1.5 rounded transition-colors text-[var(--text-muted)] hover:text-white hover:bg-[var(--surface-3)]"
                      title="Renombrar"
                    >
                      <Icon name="edit" size={13} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}
                      className="p-1.5 rounded transition-colors text-[var(--text-muted)] hover:text-[#FF6B6B] hover:bg-[#FF6B6B14]"
                      title="Eliminar tarea"
                    >
                      <Icon name="trash" size={13} />
                    </button>
                  </div>
                )}

                {/* Número en modo vista */}
                {!editMode && (
                  <span className="text-[11px] font-mono flex-shrink-0 select-none" style={{ color: 'var(--text-muted)' }}>
                    {idx + 1}
                  </span>
                )}
              </div>
            );
          })}

          {/* Fila agregar (modo edición) */}
          {editMode && (
            <div
              className="flex items-center gap-3 px-5 py-3"
              style={{
                borderTop:  tasks.length > 0 ? '1px solid var(--border)' : 'none',
                background: 'var(--surface-2)',
              }}
            >
              <Icon name="plus" size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
              <input
                ref={addInputRef}
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') addTask(); }}
                placeholder="Nueva tarea…"
                className="flex-1 text-[14px] py-0.5"
                style={{ background: 'transparent', color: 'var(--text)' }}
              />
              {newText.trim() && (
                <button
                  onClick={addTask}
                  className="px-3 py-1 rounded-md text-[12px] font-bold flex-shrink-0"
                  style={{ background: 'var(--accent)', color: '#0a0a0b' }}
                >
                  Agregar
                </button>
              )}
            </div>
          )}
        </div>

        {/* ─── Historial ─── */}
        {history.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Icon name="clock" size={13} style={{ color: 'var(--text-muted)' }} />
              <span
                className="text-[10px] tracking-[0.18em] uppercase font-semibold select-none"
                style={{ color: 'var(--text-muted)' }}
              >
                Historial
              </span>
            </div>

            <div
              className="rounded-2xl border overflow-hidden"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              {history.slice(0, 30).map((entry) => {
                const perfect   = entry.total > 0 && entry.completed === entry.total;
                const entryPct  = entry.total > 0 ? Math.round(entry.completed / entry.total * 100) : 0;
                return (
                  <div
                    key={entry.date}
                    className="flex items-center gap-3 px-5 py-3 border-b last:border-b-0"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    {/* Icono */}
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        background: perfect ? 'rgba(212,255,79,0.12)' : 'rgba(255,107,107,0.10)',
                        border:     `1px solid ${perfect ? 'rgba(212,255,79,0.30)' : 'rgba(255,107,107,0.30)'}`,
                      }}
                    >
                      <span
                        className="select-none"
                        style={{ fontSize: 10, fontWeight: 700, color: perfect ? 'var(--accent)' : '#FF6B6B' }}
                      >
                        {perfect ? '✓' : '✗'}
                      </span>
                    </div>

                    {/* Fecha */}
                    <span
                      className="text-[12px] font-mono capitalize select-none"
                      style={{ color: 'var(--text-dim)', minWidth: 72 }}
                    >
                      {fmtHist(entry.date)}
                    </span>

                    {/* Barra */}
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface-3)' }}>
                      <div
                        className="h-full rounded-full"
                        style={{ width: entryPct + '%', background: perfect ? 'var(--accent)' : '#FF6B6B' }}
                      />
                    </div>

                    {/* Score */}
                    <span
                      className="text-[12.5px] font-bold font-mono select-none"
                      style={{ color: perfect ? 'var(--accent)' : '#FF6B6B', minWidth: 36, textAlign: 'right' }}
                    >
                      {entry.completed}/{entry.total}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty total */}
        {history.length === 0 && total === 0 && !editMode && (
          <div className="text-center py-10">
            <div className="font-display text-[16px] font-bold mb-1.5 select-none" style={{ color: 'var(--text-dim)' }}>
              Tu racha empieza hoy
            </div>
            <div className="text-[12.5px] select-none" style={{ color: 'var(--text-muted)' }}>
              Agregá tus tareas y empezá a construir el hábito
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
