import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm]   = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/setup');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--gray-50)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem',
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 18 }}>
            <svg width="32" height="32" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="7" fill="#1D9E75"/>
              <path d="M14 5C14 5 9 10 9 15a5 5 0 0010 0c0-5-5-10-5-10z" fill="white"/>
              <circle cx="14" cy="15" r="2" fill="#1D9E75"/>
            </svg>
            A tu medida
          </Link>
          <h2 style={{ marginTop: 12, fontWeight: 700, fontSize: 22 }}>Crea tu cuenta</h2>
          <p style={{ color: 'var(--gray-600)', fontSize: 14, marginTop: 4 }}>
            Gratis · Sin tarjeta de crédito
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Nombre completo</label>
              <input className="form-input" type="text" required placeholder="Juan García"
                value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Correo electrónico</label>
              <input className="form-input" type="email" required placeholder="juan@email.com"
                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <input className="form-input" type="password" required minLength={6} placeholder="Mínimo 6 caracteres"
                value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
            </div>
            {error && (
              <p style={{ color: 'var(--red)', fontSize: 13, background: '#FEE2E2', padding: '8px 12px', borderRadius: 6 }}>
                {error}
              </p>
            )}
            <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', height: 42, marginTop: 4 }}>
              {loading ? 'Creando cuenta...' : 'Crear cuenta gratis →'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: 13, color: 'var(--gray-400)' }}>
          Al registrarte aceptas el tratamiento de tus datos personales conforme a la Ley 1581 de 2012.
        </p>
        <p style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: 14, color: 'var(--gray-600)' }}>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" style={{ color: '#1D9E75', fontWeight: 500 }}>Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}
