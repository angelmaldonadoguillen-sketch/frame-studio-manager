// ─────────────────────────────────────────────────────────────────
// AUTH — pantalla de inicio de sesión · FRAME Studio Manager
// ─────────────────────────────────────────────────────────────────

// ── Mensajes de error en español ────────────────────────────────
const AUTH_ERRORS = {
  'auth/user-not-found':         'No existe una cuenta con ese email.',
  'auth/wrong-password':         'Contraseña incorrecta.',
  'auth/invalid-credential':     'Email o contraseña incorrectos.',
  'auth/invalid-email':          'El email no tiene un formato válido.',
  'auth/email-already-in-use':   'Ya existe una cuenta con ese email.',
  'auth/weak-password':          'La contraseña debe tener al menos 6 caracteres.',
  'auth/too-many-requests':      'Demasiados intentos. Esperá unos minutos.',
  'auth/network-request-failed': 'Sin conexión. Verificá tu internet.',
  'auth/popup-closed-by-user':   'Ventana cerrada antes de completar.',
};

// ── Guía de setup (cuando auth no está habilitado) ───────────────
const AuthSetupGuide = () => (
  <div
    className="p-4 rounded-xl border text-[12px] leading-relaxed space-y-1.5"
    style={{ background: '#FFD16614', borderColor: '#FFD16640', color: '#FFD166' }}
  >
    <div className="font-semibold flex items-center gap-2">
      <Icon name="alert" size={13} />
      Firebase Auth no está habilitado aún
    </div>
    <div className="text-[11px] opacity-80 leading-relaxed pl-5">
      1. Abrí <strong>console.firebase.google.com</strong><br />
      2. Proyecto <strong>tooned-os</strong> → Authentication<br />
      3. Sign-in method → <strong>Email/Password</strong> → Habilitar<br />
      4. Settings → Authorized domains → Agregar <strong>angelmaldonadoguillen-sketch.github.io</strong>
    </div>
  </div>
);

// ── Login screen ─────────────────────────────────────────────────
const LoginScreen = () => {
  const [mode, setMode]           = useState('login'); // 'login' | 'register'
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [name, setName]           = useState('');
  const [role, setRole]           = useState('');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [showSetup, setShowSetup] = useState(false);

  const getError  = (code) => AUTH_ERRORS[code] ?? `Error inesperado (${code})`;
  const resetForm = () => { setError(''); setShowSetup(false); };
  const switchMode = (m) => { setMode(m); resetForm(); };

  // ── Login ──
  const handleLogin = async () => {
    if (!email.trim() || !password) return;
    setLoading(true);
    resetForm();
    try {
      await firebase.auth().signInWithEmailAndPassword(email.trim(), password);
      // onAuthStateChanged en App maneja el resto
    } catch (err) {
      if (err.code === 'auth/operation-not-allowed') setShowSetup(true);
      else setError(getError(err.code));
    } finally {
      setLoading(false);
    }
  };

  // ── Registro ──
  const handleRegister = async () => {
    if (!email.trim() || !password || !name.trim()) return;
    if (password !== confirm) { setError('Las contraseñas no coinciden.'); return; }
    setLoading(true);
    resetForm();
    try {
      const cred = await firebase.auth().createUserWithEmailAndPassword(email.trim(), password);
      await cred.user.updateProfile({ displayName: name.trim() });

      // ¿Ya existe un perfil en frame_users con este email?
      const col       = window.db.collection('frame_users');
      const existing  = await col.where('email', '==', email.trim().toLowerCase()).get();

      if (existing.empty) {
        // Crear perfil nuevo
        const initials = name.trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2);
        const colors   = typeof TEAM_COLORS !== 'undefined'
          ? TEAM_COLORS
          : ['#D4FF4F','#FF7A59','#6CC4FF','#C089FF','#FFD166','#FB7185','#7DD3C0'];
        await col.doc(cred.user.uid).set({
          id:           cred.user.uid,
          name:         name.trim(),
          role:         role.trim() || 'Colaborador',
          initials,
          color:        colors[Math.floor(Math.random() * colors.length)],
          email:        email.trim().toLowerCase(),
          phone:        '—',
          skills:       [],
          bio:          '',
          availability: 'available',
          joinedAt:     new Date().toISOString().slice(0, 10),
        });
      } else {
        // Vincular perfil existente al uid de Firebase Auth
        const old = existing.docs[0];
        if (old.id !== cred.user.uid) {
          await col.doc(cred.user.uid).set({ ...old.data(), id: cred.user.uid });
          await col.doc(old.id).delete();
        }
      }
    } catch (err) {
      if (err.code === 'auth/operation-not-allowed') setShowSetup(true);
      else setError(getError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const submit     = mode === 'login' ? handleLogin : handleRegister;
  const canSubmit  = email.trim() && password &&
    (mode === 'login' || (name.trim() && confirm));

  return (
    <div
      className="h-screen flex items-center justify-center"
      style={{ background: 'var(--bg)', position: 'relative', zIndex: 1 }}
    >
      <div className="w-full max-w-[380px] px-5">

        {/* Logo + título */}
        <div className="text-center mb-8 anim-fade-in">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'var(--accent)', boxShadow: '0 0 40px rgba(212,255,79,0.25)' }}
          >
            <span
              className="font-display font-black text-[30px]"
              style={{ color: '#0a0a0b', letterSpacing: '-0.04em' }}
            >
              F
            </span>
          </div>
          <div
            className="font-display font-black text-[28px]"
            style={{ letterSpacing: '-0.04em' }}
          >
            FRAME
          </div>
          <div className="text-[10px] tracking-[0.3em] text-[var(--text-muted)] uppercase mt-1">
            Studio Manager
          </div>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl border overflow-hidden anim-scale-in"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          {/* Tabs modo */}
          <div className="flex p-1 gap-0.5" style={{ background: 'var(--surface-2)' }}>
            {[
              { id: 'login',    label: 'Ingresar'      },
              { id: 'register', label: 'Crear cuenta'  },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => switchMode(t.id)}
                className={`flex-1 py-1.5 rounded-md text-[13px] font-medium transition-all ${
                  mode === t.id
                    ? 'bg-[var(--surface)] text-white'
                    : 'text-[var(--text-dim)] hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="p-5 space-y-2.5">
            {/* Campos extra para registro */}
            {mode === 'register' && (
              <>
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nombre completo *"
                  className="w-full px-3 py-2.5 rounded-lg text-[13.5px] border border-app surface-2 focus:border-[var(--accent)]/60 transition-colors"
                />
                <input
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Rol (ej: Editor, Fotógrafo…)"
                  className="w-full px-3 py-2.5 rounded-lg text-[13.5px] border border-app surface-2"
                />
              </>
            )}

            <input
              autoFocus={mode === 'login'}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full px-3 py-2.5 rounded-lg text-[13.5px] border border-app surface-2 focus:border-[var(--accent)]/60 transition-colors"
            />

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && mode === 'login') submit(); }}
              placeholder="Contraseña"
              className="w-full px-3 py-2.5 rounded-lg text-[13.5px] border border-app surface-2"
            />

            {mode === 'register' && (
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
                placeholder="Confirmar contraseña *"
                className="w-full px-3 py-2.5 rounded-lg text-[13.5px] border border-app surface-2"
              />
            )}

            {/* Error inline */}
            {error && (
              <div
                className="px-3 py-2.5 rounded-lg text-[12px] flex items-start gap-2"
                style={{ background: '#FF6B6B14', color: '#FF6B6B' }}
              >
                <Icon name="alert" size={13} className="flex-shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            {/* Guía de setup */}
            {showSetup && <AuthSetupGuide />}

            {/* Botón principal */}
            <button
              onClick={submit}
              disabled={loading || !canSubmit}
              className="w-full py-2.5 rounded-lg text-[13.5px] font-bold disabled:opacity-40 transition-all hover:brightness-110 flex items-center justify-center gap-2 mt-1"
              style={{ background: 'var(--accent)', color: '#0a0a0b' }}
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-[#0a0a0b]/40 border-t-[#0a0a0b] animate-spin"></div>
                  Un momento…
                </>
              ) : mode === 'login' ? (
                <>Ingresar al estudio <Icon name="arrowUpRight" size={14} /></>
              ) : (
                'Crear cuenta'
              )}
            </button>
          </div>
        </div>

        <p className="text-center text-[10.5px] text-[var(--text-muted)] mt-5">
          FRAME Studio Manager · {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
};

Object.assign(window, { LoginScreen });
