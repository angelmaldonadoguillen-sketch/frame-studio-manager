// ─────────────────────────────────────────────────────────────────
// ANALYTICS — Dashboard de métricas del estudio
// ─────────────────────────────────────────────────────────────────

const AnalyticsSection = ({ projects, clients, team, currentUserId }) => {
  // ── Datos derivados ─────────────────────────────────────────
  const active    = projects.filter(p => p.status !== 'archived');
  const delivered = projects.filter(p => p.status === 'delivered');
  const urgent    = projects.filter(p => {
    const d = daysUntil(p.deadline);
    return d >= 0 && d < 3 && p.status !== 'delivered' && p.status !== 'archived';
  });
  const totalBudget = active.reduce((sum, p) => sum + (p.budget || 0), 0);

  const now = new Date(TODAY);
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const deliveredThisMonth = delivered.filter(p => (p.deadline || '').startsWith(monthKey)).length;

  // Status breakdown
  const statusCounts = STATUSES.filter(s => s.id !== 'archived').map(s => ({
    ...s,
    count: projects.filter(p => p.status === s.id).length,
  }));
  const totalStatus = statusCounts.reduce((sum, s) => sum + s.count, 0) || 1;

  // Type breakdown
  const typeCounts = PROJECT_TYPES.map(t => ({
    ...t,
    count: projects.filter(p => p.type === t.id).length,
  })).sort((a, b) => b.count - a.count);
  const maxType = Math.max(...typeCounts.map(t => t.count), 1);

  // Team workload
  const workload = team.map(m => ({
    ...m,
    count: active.filter(p => p.assignees.includes(m.id)).length,
  })).sort((a, b) => b.count - a.count).slice(0, 6);
  const maxWork = Math.max(...workload.map(w => w.count), 1);

  // Top clients
  const clientMap = {};
  projects.forEach(p => {
    if (!clientMap[p.client]) clientMap[p.client] = { name: p.client, count: 0, budget: 0 };
    clientMap[p.client].count++;
    clientMap[p.client].budget += (p.budget || 0);
  });
  const topClients = Object.values(clientMap).sort((a, b) => b.count - a.count).slice(0, 6);

  // Monthly revenue (last 6 months)
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(TODAY);
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    const key   = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleString('es', { month: 'short' });
    const sum   = projects
      .filter(p => (p.startDate || p.deadline || '').startsWith(key))
      .reduce((s, p) => s + (p.budget || 0), 0);
    months.push({ key, label, sum });
  }
  const maxMonthly = Math.max(...months.map(m => m.sum), 1);

  const fmtCurrency = (n) => {
    if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000)    return `$${(n / 1000).toFixed(0)}k`;
    return `$${n}`;
  };

  // Completion rate
  const completionRate = projects.length
    ? Math.round((delivered.length / projects.length) * 100)
    : 0;

  return (
    <main className="flex-1 flex flex-col overflow-hidden">
      {/* ── Page header ── */}
      <div className="border-b border-app px-6 py-4 flex items-center justify-between flex-shrink-0" style={{ background: 'var(--surface)' }}>
        <div>
          <div className="font-display font-bold text-xl" style={{ letterSpacing: '-0.02em' }}>Analytics</div>
          <div className="text-[12px] text-[var(--text-muted)] mt-0.5">
            {projects.length} proyectos · {team.length} integrantes · {clients.length} clientes
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px]"
            style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}
          >
            <Icon name="clock" size={13} />
            {fmtDateLong(TODAY)}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        {/* ── KPI cards ── */}
        <div className="grid grid-cols-4 gap-4">
          <KpiCard
            icon="layers"
            label="Proyectos activos"
            value={active.length}
            sub={`${projects.length} en total`}
            color="var(--accent)"
          />
          <KpiCard
            icon="zap"
            label="Presupuesto activo"
            value={fmtCurrency(totalBudget)}
            sub="proyectos en curso"
            color="#7DD3C0"
          />
          <KpiCard
            icon="check"
            label="Entregados este mes"
            value={deliveredThisMonth}
            sub={`${completionRate}% tasa de entrega`}
            color="#A78BFA"
          />
          <KpiCard
            icon="alert"
            label="Deadlines urgentes"
            value={urgent.length}
            sub="vencen en menos de 3 días"
            color="#FF6B6B"
          />
        </div>

        {/* ── Row 2: Estado + Tipo ── */}
        <div className="grid grid-cols-2 gap-4">

          {/* Status breakdown */}
          <div className="rounded-xl border border-app p-5" style={{ background: 'var(--surface)' }}>
            <div className="text-[11px] font-semibold tracking-[0.18em] text-[var(--text-muted)] uppercase mb-4">
              Estado de proyectos
            </div>
            <div className="space-y-3">
              {statusCounts.map(s => {
                const pct = Math.round((s.count / totalStatus) * 100);
                return (
                  <div key={s.id} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[12px]">
                        <span className="w-2 h-2 rounded-full" style={{ background: s.color }}></span>
                        <span className="text-[var(--text-dim)]">{s.label}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[12px]">
                        <span className="font-mono text-[var(--text-muted)]">{pct}%</span>
                        <span className="font-mono font-semibold w-5 text-right">{s.count}</span>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface-3)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: s.color }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Type breakdown */}
          <div className="rounded-xl border border-app p-5" style={{ background: 'var(--surface)' }}>
            <div className="text-[11px] font-semibold tracking-[0.18em] text-[var(--text-muted)] uppercase mb-4">
              Por tipo de producción
            </div>
            <div className="space-y-3">
              {typeCounts.map(t => {
                const pct = Math.round((t.count / maxType) * 100);
                return (
                  <div key={t.id} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[12px]">
                        <Icon name={t.icon} size={12} style={{ color: t.color }} />
                        <span className="text-[var(--text-dim)]">{t.label}</span>
                      </div>
                      <span className="font-mono font-semibold text-[12px]">{t.count}</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface-3)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: t.color }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Row 3: Ingresos mensuales + Carga del equipo ── */}
        <div className="grid grid-cols-[1fr_300px] gap-4">

          {/* Monthly revenue bar chart */}
          <div className="rounded-xl border border-app p-5" style={{ background: 'var(--surface)' }}>
            <div className="text-[11px] font-semibold tracking-[0.18em] text-[var(--text-muted)] uppercase mb-4">
              Presupuesto por mes — últimos 6 meses
            </div>
            <div className="flex items-end gap-3" style={{ height: 120 }}>
              {months.map(m => {
                const pct       = (m.sum / maxMonthly) * 100;
                const isCurrent = m.key === monthKey;
                return (
                  <div key={m.key} className="flex-1 flex flex-col items-center gap-1 group" style={{ height: '100%' }}>
                    {/* Amount tooltip on hover */}
                    <div className="flex-1 flex flex-col justify-end w-full">
                      <div
                        className="text-[9px] font-mono text-center mb-1 transition-opacity opacity-0 group-hover:opacity-100"
                        style={{ color: isCurrent ? 'var(--accent)' : 'var(--text-muted)' }}
                      >
                        {m.sum > 0 ? fmtCurrency(m.sum) : '–'}
                      </div>
                      <div
                        className="w-full rounded-t-md transition-all duration-700"
                        style={{
                          height:     `${Math.max(pct, 3)}%`,
                          minHeight:  4,
                          background: isCurrent ? 'var(--accent)' : 'var(--surface-3)',
                        }}
                      ></div>
                    </div>
                    <div
                      className="text-[10px] font-mono capitalize mt-1.5 flex-shrink-0"
                      style={{ color: isCurrent ? 'var(--accent)' : 'var(--text-muted)' }}
                    >
                      {m.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Team workload */}
          <div className="rounded-xl border border-app p-5" style={{ background: 'var(--surface)' }}>
            <div className="text-[11px] font-semibold tracking-[0.18em] text-[var(--text-muted)] uppercase mb-4">
              Carga del equipo
            </div>
            {workload.length === 0 ? (
              <div className="text-[12px] text-[var(--text-muted)] text-center py-6">
                Sin datos de equipo
              </div>
            ) : (
              <div className="space-y-3">
                {workload.map(m => {
                  const pct = Math.round((m.count / maxWork) * 100);
                  return (
                    <div key={m.id} className="flex items-center gap-3">
                      <Avatar user={m} size={28} />
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[12px] truncate">{(m.name || '').split(' ')[0]}</span>
                          <span className="text-[11px] font-mono text-[var(--text-muted)]">
                            {m.count} {m.count === 1 ? 'proyecto' : 'proyectos'}
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface-3)' }}>
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${pct}%`, background: m.color || 'var(--accent)' }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Row 4: Top clientes ── */}
        <div className="rounded-xl border border-app p-5" style={{ background: 'var(--surface)' }}>
          <div className="text-[11px] font-semibold tracking-[0.18em] text-[var(--text-muted)] uppercase mb-4">
            Top clientes por volumen
          </div>
          {topClients.length === 0 ? (
            <div className="text-[12px] text-[var(--text-muted)] py-6 text-center">Sin datos aún</div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {topClients.map((c, i) => {
                const hue = (i * 57 + 190) % 360;
                return (
                  <div key={c.name} className="flex items-center gap-4 py-3">
                    <span className="text-[11px] font-mono text-[var(--text-muted)] w-4 text-center">{i + 1}</span>
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[14px] flex-shrink-0"
                      style={{ background: `hsl(${hue}, 55%, 35%)`, color: `hsl(${hue}, 80%, 85%)` }}
                    >
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium truncate">{c.name}</div>
                      <div className="text-[11px] text-[var(--text-muted)]">
                        {c.count} proyecto{c.count !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[13px] font-mono font-semibold" style={{ color: 'var(--accent)' }}>
                        {fmtCurrency(c.budget)}
                      </div>
                      <div className="text-[10px] text-[var(--text-muted)]">presupuesto</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Row 5: Proyectos recientes por estado ── */}
        <div className="rounded-xl border border-app p-5" style={{ background: 'var(--surface)' }}>
          <div className="text-[11px] font-semibold tracking-[0.18em] text-[var(--text-muted)] uppercase mb-4">
            Próximos deadlines
          </div>
          <div className="space-y-2">
            {active
              .filter(p => p.deadline)
              .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
              .slice(0, 5)
              .map(p => {
                const d  = daysUntil(p.deadline);
                const st = getStatus(p.status);
                const isUrgent = d >= 0 && d < 3;
                return (
                  <div key={p.id} className="flex items-center gap-3 py-2">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: st.color }}
                    ></div>
                    <span className="flex-1 text-[13px] truncate">{p.title}</span>
                    <span className="text-[11px] text-[var(--text-muted)] truncate max-w-[120px]">{p.client}</span>
                    <AvatarStack ids={p.assignees} size={20} max={3} />
                    <div
                      className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md flex-shrink-0"
                      style={{
                        background: isUrgent ? '#FF6B6B22' : 'var(--surface-2)',
                        color:      isUrgent ? '#FF6B6B'   : 'var(--text-muted)',
                      }}
                    >
                      {d < 0 ? 'vencido' : d === 0 ? 'hoy' : `${d}d`}
                    </div>
                  </div>
                );
              })
            }
            {active.filter(p => p.deadline).length === 0 && (
              <div className="text-[12px] text-[var(--text-muted)] py-4 text-center">Sin proyectos activos con deadline</div>
            )}
          </div>
        </div>

      </div>
    </main>
  );
};

// ── KPI Card ─────────────────────────────────────────────────────
const KpiCard = ({ icon, label, value, sub, color }) => (
  <div className="rounded-xl border border-app p-4 flex flex-col gap-2" style={{ background: 'var(--surface)' }}>
    <div className="flex items-center justify-between">
      <div className="text-[10px] font-semibold tracking-[0.18em] text-[var(--text-muted)] uppercase">{label}</div>
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: color + '22', color }}
      >
        <Icon name={icon} size={14} />
      </div>
    </div>
    <div className="font-display text-3xl font-bold leading-none" style={{ color, letterSpacing: '-0.03em' }}>
      {value}
    </div>
    <div className="text-[11px] text-[var(--text-muted)]">{sub}</div>
  </div>
);

Object.assign(window, { AnalyticsSection, KpiCard });
