import { useNavigate } from 'react-router-dom';

const FEATURES = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="1.8" strokeLinecap="round">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
        <rect x="9" y="3" width="6" height="4" rx="1"/>
        <path d="M9 12h6M9 16h4"/>
      </svg>
    ),
    title: 'Plan alimenticio personalizado',
    desc:  'Dietas adaptadas a la canasta bogotana, calculadas según tu IMC, TMB y objetivo específico.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="1.8" strokeLinecap="round">
        <path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3"/>
      </svg>
    ),
    title: 'Rutinas de calistenia progresiva',
    desc:  'Ejercicios sin equipamiento, clasificados por nivel, adaptados para adultos de 30 a 50 años.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="1.8" strokeLinecap="round">
        <path d="M18 20V10M12 20V4M6 20v-6"/>
      </svg>
    ),
    title: 'Seguimiento de progreso',
    desc:  'Registra tu peso, calorías y actividad diaria. Visualiza tu evolución semana a semana.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="1.8" strokeLinecap="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 8v4l3 3"/>
      </svg>
    ),
    title: 'Cálculos en tiempo real',
    desc:  'IMC, TMB y TDEE calculados automáticamente con las fórmulas clínicas más precisas.',
  },
];

const STATS = [
  { value: '56%',   label: 'adultos colombianos con exceso de peso (ENSIN 2015)' },
  { value: '80%+',  label: 'hogares bogotanos con acceso a internet' },
  { value: '3 módulos', label: 'integrados: dieta, ejercicio y seguimiento' },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'var(--font)' }}>

      {/* ── Navbar landing ─────────────────────────────── */}
      <header style={{
        background: '#fff', borderBottom: '1px solid var(--gray-200)',
        padding: '0 2rem', height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 17 }}>
          <svg width="30" height="30" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="7" fill="#1D9E75"/>
            <path d="M14 5C14 5 9 10 9 15a5 5 0 0010 0c0-5-5-10-5-10z" fill="white"/>
            <circle cx="14" cy="15" r="2" fill="#1D9E75"/>
          </svg>
          A tu medida
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={() => navigate('/login')}>Iniciar sesión</button>
          <button className="btn btn-primary"   onClick={() => navigate('/register')}>Comenzar gratis</button>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────── */}
      <section style={{
        background: '#fff',
        padding: '5rem 2rem 4rem',
        textAlign: 'center',
        borderBottom: '1px solid var(--gray-200)',
      }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <span style={{
            display: 'inline-block', background: '#E1F5EE', color: '#0F6E56',
            padding: '5px 16px', borderRadius: 99, fontSize: 13, fontWeight: 500,
            marginBottom: '1.5rem',
          }}>
            Para adultos de 30 a 50 años en Bogotá
          </span>

          <h1 style={{ fontSize: 46, fontWeight: 700, lineHeight: 1.15, color: 'var(--gray-800)', marginBottom: '1.25rem' }}>
            Tu salud,{' '}
            <span style={{ color: '#1D9E75' }}>a tu medida</span>
          </h1>

          <p style={{ fontSize: 18, color: 'var(--gray-600)', lineHeight: 1.7, marginBottom: '2.5rem' }}>
            Plataforma web que analiza tus factores de sobrepeso y genera un plan alimenticio
            con productos de la canasta bogotana y rutinas de calistenia adaptadas a tu nivel.
            Sin suscripción, sin equipo, sin excusas.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary"
              style={{ fontSize: 16, padding: '12px 32px' }}
              onClick={() => navigate('/register')}
            >
              Empezar mi plan gratuito →
            </button>
            <button
              className="btn btn-ghost"
              style={{ fontSize: 16, padding: '12px 32px' }}
              onClick={() => navigate('/login')}
            >
              Ya tengo cuenta
            </button>
          </div>
        </div>
      </section>

      {/* ── Stats ──────────────────────────────────────── */}
      <section style={{
        background: '#1D9E75', padding: '2.5rem 2rem',
        display: 'flex', justifyContent: 'center', gap: '4rem', flexWrap: 'wrap',
      }}>
        {STATS.map((s, i) => (
          <div key={i} style={{ textAlign: 'center', color: '#fff', maxWidth: 220 }}>
            <div style={{ fontSize: 36, fontWeight: 700, marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: 13, opacity: .85, lineHeight: 1.5 }}>{s.label}</div>
          </div>
        ))}
      </section>

      {/* ── Features ───────────────────────────────────── */}
      <section style={{ padding: '4rem 2rem', maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{ fontSize: 30, fontWeight: 700, textAlign: 'center', marginBottom: '.75rem' }}>
          Todo lo que necesitas en un solo lugar
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--gray-600)', marginBottom: '3rem', fontSize: 16 }}>
          Diseñado especialmente para el contexto colombiano, sin cuentas premium ni barreras de acceso.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '1.5rem' }}>
          {FEATURES.map((f, i) => (
            <div key={i} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: '#E1F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--gray-800)' }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: 'var(--gray-600)', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ───────────────────────────────── */}
      <section style={{ background: 'var(--gray-50)', padding: '4rem 2rem', borderTop: '1px solid var(--gray-200)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, textAlign: 'center', marginBottom: '3rem' }}>
            ¿Cómo funciona?
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {[
              ['1', 'Crea tu cuenta', 'Regístrate en menos de un minuto, sin tarjeta de crédito.'],
              ['2', 'Ingresa tus datos', 'Edad, peso, estatura, nivel de actividad y objetivo de salud.'],
              ['3', 'Recibe tu plan', 'La app calcula tu IMC, TMB y TDEE y genera tu plan personalizado.'],
              ['4', 'Sigue tu progreso', 'Registra tu día a día y observa cómo avanzas semana a semana.'],
            ].map(([num, title, desc]) => (
              <div key={num} style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: '#1D9E75', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 16, flexShrink: 0,
                }}>
                  {num}
                </div>
                <div>
                  <h3 style={{ fontWeight: 600, marginBottom: 4 }}>{title}</h3>
                  <p style={{ color: 'var(--gray-600)', fontSize: 14 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final ──────────────────────────────────── */}
      <section style={{
        background: '#0F6E56', color: '#fff',
        padding: '4rem 2rem', textAlign: 'center',
      }}>
        <h2 style={{ fontSize: 30, fontWeight: 700, marginBottom: '1rem' }}>
          Empieza hoy, es completamente gratis
        </h2>
        <p style={{ fontSize: 16, opacity: .85, marginBottom: '2rem' }}>
          Sin instalación, sin suscripción. Solo tu navegador y las ganas de cuidarte.
        </p>
        <button
          className="btn"
          style={{ background: '#fff', color: '#0F6E56', fontSize: 16, padding: '12px 36px', fontWeight: 600 }}
          onClick={() => navigate('/register')}
        >
          Crear mi cuenta gratis →
        </button>
      </section>

      {/* ── Footer ─────────────────────────────────────── */}
      <footer style={{
        background: '#fff', borderTop: '1px solid var(--gray-200)',
        padding: '1.5rem 2rem', textAlign: 'center',
        color: 'var(--gray-400)', fontSize: 13,
      }}>
        © 2026 A tu medida · TEINCO · Semillero SIIANTEC · Bogotá, Colombia
      </footer>
    </div>
  );
}
