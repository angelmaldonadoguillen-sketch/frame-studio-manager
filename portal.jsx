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
    .filter(project => String(project.client || '').trim().toLowerCase() === name && project.clientVisible === true)
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
        checklist: checklist.map(item => ({ text: String(item.text || ''), done: item.done === true })).slice(0, 50),
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
    studioName: String(workspace?.name || 'FRAME Studio'),
    published: published === true,
    updatedAt: new Date().toISOString(),
    tasks: published ? visible.slice(0, 100) : [],
  };
};

const ClientPortal = ({ token }) => {
  const [portal, setPortal] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [unavailable, setUnavailable] = React.useState(false);

  React.useEffect(() => {
    if (!/^[a-f0-9]{48}$/.test(token || '')) { setUnavailable(true); setLoading(false); return; }
    const unsub = window.db.collection('frame_client_portals').doc(token).onSnapshot(doc => {
      if (!doc.exists || doc.data()?.published !== true) setUnavailable(true);
      else { setPortal(doc.data()); setUnavailable(false); }
      setLoading(false);
    }, () => { setUnavailable(true); setLoading(false); });
    return () => unsub();
  }, [token]);

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

  return (
    <div className="min-h-screen overflow-y-auto" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <header className="px-5 sm:px-8 py-5 border-b border-app" style={{ background: 'var(--surface)' }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center font-display font-bold" style={{ background: 'var(--accent)', color: 'var(--accent-on)' }}>F</div>
            <div className="min-w-0"><div className="font-semibold truncate">{portal.studioName}</div><div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Seguimiento compartido</div></div>
          </div>
          <div className="text-[11px] tnum" style={{ color: 'var(--text-muted)' }}>Actualizado {relativeTime(portal.updatedAt)}</div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-5 sm:px-8 py-8 sm:py-12">
        <div className="mb-10">
          <div className="text-[11px] uppercase tracking-[0.18em] mb-2" style={{ color: 'var(--text-muted)' }}>Progreso para</div>
          <h1 className="font-display text-3xl sm:text-5xl font-bold balance mb-6">{portal.clientName}</h1>
          <div className="surf-panel p-5 sm:p-6">
            <div className="flex items-end justify-between gap-4 mb-4"><div><div className="text-[12px]" style={{ color: 'var(--text-muted)' }}>Avance general</div><div className="font-display text-4xl font-bold tnum">{overall}%</div></div><div className="text-right text-[12px]" style={{ color: 'var(--text-muted)' }}>{completed} de {tasks.length} tareas completadas</div></div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--surface-3)' }}><div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${overall}%`, background: 'var(--accent)' }} /></div>
          </div>
        </div>

        <section>
          <div className="flex items-center justify-between mb-4"><h2 className="font-display text-lg font-bold">Calendario de trabajo</h2><span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{tasks.length} visibles</span></div>
          {tasks.length === 0 ? <div className="surf p-8 text-center text-[13px]" style={{ color: 'var(--text-muted)' }}>El estudio todavía no publicó tareas en este seguimiento.</div> : (
            <div className="space-y-3">{tasks.map(task => (
              <article key={task.id} className="surf p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="flex-1 min-w-0"><div className="flex flex-wrap items-center gap-2 mb-2"><span className="text-[10px] font-semibold px-2 py-1 rounded" style={{ background: 'var(--surface-3)', color: 'var(--text-dim)' }}>{task.type}</span><span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{task.status}</span></div><h3 className="font-display text-[17px] font-semibold pretty">{task.title}</h3></div>
                  <div className="sm:text-right flex-shrink-0"><div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Entrega prevista</div><div className="font-semibold tnum">{task.deadline ? fmtDate(task.deadline) : 'Por definir'}</div></div>
                </div>
                <div className="flex items-center gap-3 mt-4"><div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface-3)' }}><div className="h-full rounded-full" style={{ width: `${task.progress}%`, background: task.progress >= 100 ? 'var(--resource-green)' : 'var(--accent)' }} /></div><span className="text-[11px] font-semibold tnum">{task.progress}%</span></div>
                {task.deliverables?.length > 0 && <div className="flex flex-wrap gap-2 mt-4">{task.deliverables.map((item, index) => item.url ? <a key={index} href={item.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-md" style={{ background: 'var(--surface-3)', color: 'var(--text-dim)' }}><Icon name="download" size={11} />{item.name}</a> : <span key={index} className="text-[11px] px-2.5 py-1.5 rounded-md" style={{ background: 'var(--surface-3)', color: 'var(--text-muted)' }}>{item.name}</span>)}</div>}
              </article>
            ))}</div>
          )}
        </section>
      </main>
    </div>
  );
};

Object.assign(window, { ClientPortal, createClientPortalToken, clientPortalUrl, buildClientPortalDocument });
