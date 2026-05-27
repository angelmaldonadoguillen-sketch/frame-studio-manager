// ─────────────────────────────────────────────────────────────────
// TEAM — directorio del equipo del estudio
// ─────────────────────────────────────────────────────────────────

// ── Seed data ───────────────────────────────────────────────────
const SEED_TEAM = [
  {
    id: 'u1',
    name: 'Lucía Mendoza',
    role: 'Directora creativa',
    initials: 'LM',
    color: '#D4FF4F',
    email: 'lucia@frame.studio',
    phone: '+54 11 5555-0001',
    skills: ['Dirección', 'Fotografía', 'Color grading', 'Gestión de proyectos'],
    bio: 'Directora con 8 años en producción audiovisual. Especialista en campañas de marca y documentales.',
    availability: 'available',
    joinedAt: d(-730),
  },
  {
    id: 'u2',
    name: 'Mateo Vargas',
    role: 'Editor',
    initials: 'MV',
    color: '#FF7A59',
    email: 'mateo@frame.studio',
    phone: '+54 11 5555-0002',
    skills: ['Premiere Pro', 'After Effects', 'DaVinci Resolve', 'Motion graphics'],
    bio: 'Editor especializado en reels y contenido para redes. Domina el ritmo narrativo y la musicalización.',
    availability: 'busy',
    joinedAt: d(-540),
  },
  {
    id: 'u3',
    name: 'Sofía Reyes',
    role: 'Fotógrafa',
    initials: 'SR',
    color: '#6CC4FF',
    email: 'sofia@frame.studio',
    phone: '+54 11 5555-0003',
    skills: ['Fotografía de producto', 'Retrato', 'Lightroom', 'Estudio y locación'],
    bio: 'Fotógrafa con ojo editorial. Especialista en moda, producto y lifestyle.',
    availability: 'available',
    joinedAt: d(-400),
  },
  {
    id: 'u4',
    name: 'Diego Cruz',
    role: 'Productor',
    initials: 'DC',
    color: '#C089FF',
    email: 'diego@frame.studio',
    phone: '+54 11 5555-0004',
    skills: ['Gestión de producción', 'Presupuestos', 'Casting', 'Logística'],
    bio: 'Productor de campo y estudio. Coordina equipos, locaciones y recursos para cada rodaje.',
    availability: 'available',
    joinedAt: d(-600),
  },
  {
    id: 'u5',
    name: 'Ana Torres',
    role: 'Asistente de producción',
    initials: 'AT',
    color: '#FFD166',
    email: 'ana@frame.studio',
    phone: '+54 11 5555-0005',
    skills: ['Asistencia en set', 'Organización', 'Redes sociales', 'Atención al cliente'],
    bio: 'Asistente de producción. Apoya en set, coordina entregas y gestiona la comunicación con clientes.',
    availability: 'busy',
    joinedAt: d(-180),
  },
];

const TEAM_COLORS = [
  '#D4FF4F', '#FF7A59', '#6CC4FF', '#C089FF',
  '#FFD166', '#FB7185', '#7DD3C0', '#FF6B6B',
];

const AVAILABILITY = [
  { id: 'available', label: 'Disponible', color: '#7DD3C0' },
  { id: 'busy',      label: 'Ocupado/a',  color: '#FFD166' },
  { id: 'vacation',  label: 'Vacaciones', color: '#9A9AA3' },
];

const getAvail = (id) => AVAILABILITY.find(a => a.id === id) || AVAILABILITY[0];

// ── Workload bar ────────────────────────────────────────────────
const WorkloadBar = ({ count, max = 6, color }) => {
  const pct = Math.min(100, Math.round((count / max) * 100));
  const barColor = count >= max ? '#FF6B6B' : count >= max * 0.7 ? '#FFD166' : color;
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-[0.12em]">Carga</span>
        <span className="text-[10px] font-mono" style={{ color: barColor }}>
          {count} activo{count !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--surface-3)' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: pct + '%', background: barColor }}
        ></div>
      </div>
    </div>
  );
};

// ── Skill add ───────────────────────────────────────────────────
const SkillAdd = ({ onAdd }) => {
  const [v, setV] = useState('');
  return (
    <input
      value={v}
      onChange={(e) => setV(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && v.trim()) { onAdd(v.trim()); setV(''); }
      }}
      placeholder="+ skill"
      className="px-2 py-0.5 rounded-md text-[11px] bg-transparent border border-dashed border-[var(--border-2)] focus:border-[var(--accent)] hover:border-[var(--text-muted)] transition-colors"
      style={{ width: 84 }}
    />
  );
};

// ── Member card ──────────────────────────────────────────────────
const MemberCard = ({ member, projects, onClick }) => {
  const avail = getAvail(member.availability);
  const active = projects.filter(p =>
    (p.assignees || []).includes(member.id) &&
    p.status !== 'delivered' && p.status !== 'archived'
  );
  const visible = (member.skills || []).slice(0, 3);
  const extra   = (member.skills || []).length - visible.length;

  return (
    <div
      onClick={onClick}
      className="group lift cursor-pointer rounded-xl border overflow-hidden"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <div className="h-1" style={{ background: member.color }}></div>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          {member.avatar ? (
            <img
              src={member.avatar}
              alt={member.initials}
              className="rounded-xl object-cover flex-shrink-0"
              style={{ width: 46, height: 46, border: `1.5px solid ${member.color}44` }}
            />
          ) : (
            <div
              className="rounded-xl flex items-center justify-center font-display font-bold flex-shrink-0"
              style={{
                width: 46, height: 46,
                background: member.color + '1a',
                color: member.color,
                fontSize: 14,
                letterSpacing: '-0.02em',
                border: `1.5px solid ${member.color}44`,
              }}
            >
              {member.initials}
            </div>
          )}
          <div className="flex-1 min-w-0 pt-0.5">
            <div className="font-semibold text-[13.5px] truncate" style={{ letterSpacing: '-0.01em' }}>
              {member.name}
            </div>
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium mt-1"
              style={{ background: member.color + '18', color: member.color }}
            >
              {member.role}
            </span>
          </div>
          <Icon
            name="arrowUpRight"
            size={13}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--text-muted)] mt-0.5"
          />
        </div>

        {/* Availability dot */}
        <div className="flex items-center gap-1.5 mb-3">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: avail.color }}></span>
          <span className="text-[11px]" style={{ color: avail.color }}>{avail.label}</span>
        </div>

        {/* Skills */}
        {visible.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {visible.map(s => (
              <span key={s} className="px-1.5 py-0.5 rounded text-[10px] bg-[var(--surface-2)] text-[var(--text-muted)]">
                {s}
              </span>
            ))}
            {extra > 0 && (
              <span className="px-1.5 py-0.5 rounded text-[10px] text-[var(--text-muted)]">+{extra}</span>
            )}
          </div>
        )}

        {/* Workload bar */}
        <WorkloadBar count={active.length} color={member.color} />
      </div>
    </div>
  );
};

// ── Member detail panel ──────────────────────────────────────────
const MemberDetail = ({ member, projects, onClose, onUpdate, onDelete, currentUserId }) => {
  const [confirmDel, setConfirmDel] = useState(false);
  const [uploading,  setUploading]  = useState(false);
  const fileRef = useRef(null);
  if (!member) return null;

  const isOwnProfile = member.id === currentUserId;

  const all    = projects.filter(p => (p.assignees || []).includes(member.id));
  const active = all.filter(p => p.status !== 'delivered' && p.status !== 'archived');
  const done   = all.filter(p => p.status === 'delivered');
  const avail  = getAvail(member.availability);

  const upd         = (patch) => onUpdate({ ...member, ...patch });
  const addSkill    = (s) => { if (!s.trim()) return; upd({ skills: [...new Set([...(member.skills || []), s.trim()])] }); };
  const removeSkill = (s) => upd({ skills: (member.skills || []).filter(x => x !== s) });

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const path = `frame-avatars/${member.id}/${Date.now()}_${file.name}`;
      const ref  = window.storage.ref(path);
      await ref.put(file);
      const url  = await ref.getDownloadURL();
      upd({ avatar: url });
    } catch (err) {
      console.error('[FRAME] Error al subir foto de perfil:', err);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 backdrop flex items-stretch justify-end anim-fade-in" onClick={onClose}>
      <div
        className="w-full max-w-[600px] h-full flex flex-col anim-slide-right border-l border-app overflow-hidden"
        style={{ background: 'var(--surface)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Panel header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-app flex-shrink-0">
          <div className="flex items-center gap-2 text-[12px] text-[var(--text-muted)]">
            <Icon name="users" size={13} />
            <span>Equipo</span>
            <span>›</span>
            <span className="text-[var(--text-dim)]">{member.name}</span>
          </div>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-[var(--surface-2)] text-[var(--text-dim)]">
            <Icon name="x" size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="h-1" style={{ background: member.color }}></div>

          {/* Hero */}
          <div className="p-6 border-b border-app">
            <div className="flex items-start gap-4 mb-5">
              {/* Avatar — upload overlay shown only for own profile */}
              <div className="relative flex-shrink-0 group/av">
                {member.avatar ? (
                  <img
                    src={member.avatar}
                    alt={member.initials}
                    className="rounded-2xl object-cover"
                    style={{ width: 64, height: 64, border: `2px solid ${member.color}44` }}
                  />
                ) : (
                  <div
                    className="rounded-2xl flex items-center justify-center font-display font-bold"
                    style={{
                      width: 64, height: 64,
                      background: member.color + '1a',
                      color: member.color,
                      fontSize: 22,
                      letterSpacing: '-0.03em',
                      border: `2px solid ${member.color}44`,
                    }}
                  >
                    {member.initials}
                  </div>
                )}
                {isOwnProfile && (
                  <>
                    <button
                      onClick={() => fileRef.current?.click()}
                      disabled={uploading}
                      className="absolute inset-0 rounded-2xl flex items-center justify-center opacity-0 group-hover/av:opacity-100 transition-opacity cursor-pointer"
                      style={{ background: 'rgba(0,0,0,0.55)' }}
                      title="Cambiar foto de perfil"
                    >
                      {uploading ? (
                        <div
                          className="rounded-full border-2 animate-spin"
                          style={{ width: 18, height: 18, borderColor: 'rgba(255,255,255,0.25)', borderTopColor: '#fff' }}
                        />
                      ) : (
                        <Icon name="camera" size={18} className="text-white" />
                      )}
                    </button>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                    />
                  </>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <InlineEdit
                  value={member.name}
                  onChange={(v) => upd({ name: v })}
                  className="font-display font-bold text-[22px] leading-tight"
                />
                <div className="mt-1">
                  <InlineEdit
                    value={member.role}
                    onChange={(v) => upd({ role: v })}
                    placeholder="Rol en el equipo…"
                    className="text-[13px] text-[var(--text-dim)]"
                  />
                </div>
              </div>
            </div>

            {/* Availability dropdown */}
            <div className="flex items-center gap-3 mb-5">
              <span className="text-[10px] font-semibold tracking-[0.18em] text-[var(--text-muted)] uppercase">Estado</span>
              <Dropdown
                trigger={
                  <button
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-medium border"
                    style={{
                      background: avail.color + '18',
                      borderColor: avail.color + '44',
                      color: avail.color,
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: avail.color }}></span>
                    {avail.label}
                    <Icon name="chevronDown" size={11} />
                  </button>
                }
                width={180}
              >
                {(close) => AVAILABILITY.map(a => (
                  <MenuItem
                    key={a.id}
                    active={member.availability === a.id}
                    onClick={() => { upd({ availability: a.id }); close(); }}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ background: a.color }}></span>
                    <span className="text-[12px]">{a.label}</span>
                    {member.availability === a.id && <Icon name="check" size={12} style={{ color: 'var(--accent)', marginLeft: 'auto' }} />}
                  </MenuItem>
                ))}
              </Dropdown>
            </div>

            {/* Stats strip */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: active.length, label: 'En curso',    color: member.color, big: true },
                { value: done.length,   label: 'Completados', color: '#ededef',    big: true },
                { value: member.joinedAt ? fmtDate(member.joinedAt) : '—', label: 'Desde', color: '#9a9aa3', big: false },
              ].map(s => (
                <div key={s.label} className="rounded-lg p-3 text-center" style={{ background: 'var(--surface-2)' }}>
                  <div
                    className={`font-display font-bold leading-none mb-1 ${s.big ? 'text-[26px]' : 'text-[15px] font-mono'}`}
                    style={{ color: s.color, letterSpacing: '-0.03em' }}
                  >
                    {s.value}
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-[0.12em]">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Contact */}
            <section>
              <div className="text-[10px] font-semibold tracking-[0.18em] text-[var(--text-muted)] uppercase mb-3">Contacto</div>
              <div className="rounded-lg overflow-hidden border border-app divide-y divide-[var(--border)]">
                {[
                  { icon: 'at',  label: 'Email',    key: 'email', mono: true },
                  { icon: 'mic', label: 'Teléfono', key: 'phone', mono: true },
                ].map(row => (
                  <div key={row.key} className="grid grid-cols-[110px_1fr] items-center" style={{ background: 'var(--surface-2)' }}>
                    <div className="flex items-center gap-2 px-3 py-2.5 text-[11px] text-[var(--text-muted)]">
                      <Icon name={row.icon} size={12} />
                      {row.label}
                    </div>
                    <div className="px-3 py-1">
                      <InlineEdit
                        value={member[row.key] || '—'}
                        onChange={(v) => upd({ [row.key]: v })}
                        className={`text-[13px] ${row.mono ? 'font-mono' : ''}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Skills */}
            <section>
              <div className="text-[10px] font-semibold tracking-[0.18em] text-[var(--text-muted)] uppercase mb-2">Skills</div>
              <div className="flex flex-wrap gap-1.5">
                {(member.skills || []).map(s => (
                  <span key={s} className="group flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] bg-[var(--surface-2)] text-[var(--text-dim)]">
                    {s}
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeSkill(s)}>
                      <Icon name="x" size={10} />
                    </button>
                  </span>
                ))}
                <SkillAdd onAdd={addSkill} />
              </div>
            </section>

            {/* Bio */}
            <section>
              <div className="text-[10px] font-semibold tracking-[0.18em] text-[var(--text-muted)] uppercase mb-2">Bio</div>
              <InlineEdit
                value={member.bio || ''}
                onChange={(v) => upd({ bio: v })}
                placeholder="Breve descripción del rol y experiencia…"
                multiline
                className="text-[13px] text-[var(--text-dim)] leading-relaxed"
              />
            </section>

            {/* Projects */}
            <section>
              <div className="text-[10px] font-semibold tracking-[0.18em] text-[var(--text-muted)] uppercase mb-3">
                Proyectos asignados ({all.length})
              </div>
              {all.length === 0 ? (
                <div
                  className="text-center py-8 rounded-lg text-[12px] text-[var(--text-muted)]"
                  style={{ background: 'var(--surface-2)' }}
                >
                  Sin proyectos asignados
                </div>
              ) : (
                <div className="space-y-2">
                  {all.map(p => {
                    const st = getStatus(p.status);
                    return (
                      <div
                        key={p.id}
                        className="flex items-center gap-3 p-3 rounded-lg border border-app"
                        style={{ background: 'var(--surface-2)' }}
                      >
                        <div className="w-1 h-9 rounded-full flex-shrink-0" style={{ background: st?.color || '#666' }}></div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-medium truncate">{p.title}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] text-[var(--text-muted)] truncate">{p.client}</span>
                            <span className="text-[10px] text-[var(--text-muted)] font-mono flex-shrink-0">
                              · {fmtDate(p.deadline)}
                            </span>
                          </div>
                        </div>
                        <StatusPill status={p.status} />
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* ── Danger zone: eliminar integrante ── */}
            {onDelete && (
              <section className="pt-2">
                {!confirmDel ? (
                  <button
                    onClick={() => setConfirmDel(true)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-[12.5px] transition-colors"
                    style={{ color: '#FF6B6B', border: '1px dashed #FF6B6B44' }}
                  >
                    <Icon name="trash" size={13} />
                    Eliminar integrante
                  </button>
                ) : (
                  <div className="rounded-lg p-4 border" style={{ background: '#FF6B6B08', borderColor: '#FF6B6B33' }}>
                    <div className="text-[13px] font-semibold mb-1" style={{ color: '#FF6B6B' }}>
                      ¿Eliminar a "{member.name}"?
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)] mb-3">
                      {active.length > 0
                        ? `Tiene ${active.length} proyecto${active.length > 1 ? 's' : ''} activo${active.length > 1 ? 's' : ''}. Se eliminará el perfil pero los proyectos conservarán su asignación.`
                        : 'Se eliminará el perfil del directorio.'}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { onDelete(member.id); onClose(); }}
                        className="flex-1 py-1.5 rounded-md text-[12.5px] font-semibold"
                        style={{ background: '#FF6B6B', color: '#0a0a0b' }}
                      >
                        Sí, eliminar
                      </button>
                      <button
                        onClick={() => setConfirmDel(false)}
                        className="flex-1 py-1.5 rounded-md text-[12.5px] text-[var(--text-muted)] hover:text-white transition-colors"
                        style={{ background: 'var(--surface-3)' }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── New member modal ─────────────────────────────────────────────
const NewMemberModal = ({ onCreate, onClose }) => {
  const [name, setName]   = useState('');
  const [role, setRole]   = useState('');
  const [email, setEmail] = useState('');
  const [color, setColor] = useState(TEAM_COLORS[0]);

  const initials = name.trim()
    .split(/\s+/)
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';

  const submit = () => {
    if (!name.trim()) return;
    onCreate({
      id: 'u' + Date.now(),
      name: name.trim(),
      role: role.trim() || 'Colaborador',
      initials,
      color,
      email: email.trim() || '—',
      phone: '—',
      skills: [],
      bio: '',
      availability: 'available',
      joinedAt: new Date().toISOString().slice(0, 10),
    });
  };

  return (
    <div className="fixed inset-0 z-50 backdrop flex items-center justify-center p-6 anim-fade-in" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl border anim-scale-in overflow-hidden"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-app">
          <div>
            <div className="font-display text-lg font-semibold" style={{ letterSpacing: '-0.01em' }}>Nuevo integrante</div>
            <div className="text-[11px] text-[var(--text-muted)]">Sumá a alguien al equipo del estudio</div>
          </div>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-[var(--surface-2)] text-[var(--text-dim)]">
            <Icon name="x" size={15} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Avatar preview + color */}
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center font-display font-bold text-lg flex-shrink-0 transition-all"
              style={{ background: color + '1a', color, border: `2px solid ${color}55`, letterSpacing: '-0.02em' }}
            >
              {initials}
            </div>
            <div className="flex gap-2 flex-wrap">
              {TEAM_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className="w-5 h-5 rounded-full border-2 transition-all hover:scale-110"
                  style={{ background: c, borderColor: color === c ? 'white' : 'transparent' }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] tracking-[0.18em] uppercase text-[var(--text-muted)] mb-1.5">Nombre completo *</label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
              placeholder="Ej: Valentina Ortiz"
              className="w-full px-3 py-2.5 rounded-md text-[14px] surface-2 border border-app focus:border-[var(--accent)]/60"
            />
          </div>

          <div>
            <label className="block text-[10px] tracking-[0.18em] uppercase text-[var(--text-muted)] mb-1.5">Rol</label>
            <input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Ej: Colorista, Director de arte…"
              className="w-full px-3 py-2.5 rounded-md text-[13.5px] surface-2 border border-app"
            />
          </div>

          <div>
            <label className="block text-[10px] tracking-[0.18em] uppercase text-[var(--text-muted)] mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nombre@frame.studio"
              className="w-full px-3 py-2.5 rounded-md text-[13px] surface-2 border border-app"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-app">
          <button onClick={onClose} className="px-3 py-1.5 rounded-md text-[12.5px] hover:bg-[var(--surface-2)] text-[var(--text-dim)]">
            Cancelar
          </button>
          <button
            onClick={submit}
            disabled={!name.trim()}
            className="px-3 py-1.5 rounded-md text-[12.5px] font-semibold disabled:opacity-40 transition-all hover:brightness-110"
            style={{ background: 'var(--accent)', color: '#0a0a0b' }}
          >
            Agregar al equipo
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Team section (main) ──────────────────────────────────────────
const TeamSection = ({ team, projects, onCreateMember, onUpdateMember, onDeleteMember, openMemberId, onOpenMember, onCloseMember, currentUserId }) => {
  const [search, setSearch]         = useState('');
  const [filterAvail, setFilterAvail] = useState('all');
  const [showNew, setShowNew]       = useState(false);

  const openMember = openMemberId ? team.find(m => m.id === openMemberId) : null;

  const filtered = team.filter(m => {
    if (filterAvail !== 'all' && m.availability !== filterAvail) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return m.name.toLowerCase().includes(q) ||
           m.role.toLowerCase().includes(q) ||
           (m.skills || []).some(s => s.toLowerCase().includes(q));
  });

  const handleCreate = async (member) => {
    await onCreateMember(member);
    setShowNew(false);
  };

  const totalActive = team.reduce((sum, m) =>
    sum + projects.filter(p =>
      (p.assignees || []).includes(m.id) && p.status !== 'delivered' && p.status !== 'archived'
    ).length
  , 0);

  return (
    <>
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b border-app px-5 py-3 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Icon name="users" size={15} className="text-[var(--text-muted)]" />
            <span className="font-display font-bold text-[15px]" style={{ letterSpacing: '-0.02em' }}>Equipo</span>
            <span
              className="text-[10px] font-mono px-1.5 py-0.5 rounded"
              style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}
            >
              {team.length}
            </span>
          </div>

          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md surface-2 flex-1 max-w-xs">
            <Icon name="search" size={13} className="text-[var(--text-muted)]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nombre, rol o skill…"
              className="flex-1 text-[12.5px]"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-[var(--text-muted)] hover:text-white">
                <Icon name="x" size={12} />
              </button>
            )}
          </div>

          {/* Availability filter tabs */}
          <div className="flex items-center gap-0.5 p-0.5 rounded-md surface-2">
            {[{ id: 'all', label: 'Todos', color: null }, ...AVAILABILITY].map(a => (
              <button
                key={a.id}
                onClick={() => setFilterAvail(a.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[11.5px] font-medium transition-all ${filterAvail === a.id ? 'bg-[var(--surface-3)] text-white' : 'text-[var(--text-dim)] hover:text-white'}`}
              >
                {a.color && <span className="w-1.5 h-1.5 rounded-full" style={{ background: a.color }}></span>}
                {a.label}
              </button>
            ))}
          </div>

          <div className="flex-1" />

          <button
            onClick={() => setShowNew(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12.5px] font-semibold hover:brightness-110 transition-all"
            style={{ background: 'var(--accent)', color: '#0a0a0b' }}
          >
            <Icon name="plus" size={13} strokeWidth={2.4} />
            Nuevo integrante
          </button>
        </header>

        {/* Summary bar */}
        <div className="flex items-center gap-5 px-5 py-2 border-b border-app text-[11.5px]" style={{ background: 'var(--surface)' }}>
          {AVAILABILITY.map(a => {
            const n = team.filter(m => m.availability === a.id).length;
            return (
              <div key={a.id} className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: a.color }}></span>
                <span style={{ color: a.color }}>{a.label}</span>
                <span className="font-mono text-[10px]" style={{ color: a.color }}>{n}</span>
              </div>
            );
          })}
          <div className="ml-auto flex items-center gap-1.5 text-[var(--text-muted)]">
            <Icon name="zap" size={11} />
            <span>{totalActive} proyecto{totalActive !== 1 ? 's' : ''} activo{totalActive !== 1 ? 's' : ''} en total</span>
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-5">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'var(--surface-2)' }}>
                <Icon name="users" size={22} className="text-[var(--text-muted)]" />
              </div>
              <div>
                <div className="text-[14px] font-medium mb-1">
                  {search ? `Sin resultados para "${search}"` : 'Sin integrantes en este estado'}
                </div>
                <div className="text-[12px] text-[var(--text-muted)]">
                  {search ? 'Probá con nombre, rol o skill' : 'Cambiá el filtro de disponibilidad'}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
              {filtered.map(m => (
                <MemberCard
                  key={m.id}
                  member={m}
                  projects={projects}
                  onClick={() => onOpenMember(m.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {openMember && (
        <MemberDetail
          member={openMember}
          projects={projects}
          onClose={onCloseMember}
          onUpdate={onUpdateMember}
          onDelete={onDeleteMember}
          currentUserId={currentUserId}
        />
      )}

      {showNew && (
        <NewMemberModal
          onCreate={handleCreate}
          onClose={() => setShowNew(false)}
        />
      )}
    </>
  );
};

Object.assign(window, { TeamSection, SEED_TEAM, TEAM_COLORS });
