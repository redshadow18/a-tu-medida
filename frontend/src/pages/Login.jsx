import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]   = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--gray-50)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem',
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 18 }}>
            <svg width="32" height="32" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="7" fill="#1D9E75"/>
              <path d="M14 5C14 5 9 10 9 15a5 5 0 0010 0c0-5-5-10-5-10z" fill="white"/>
              <circle cx="14" cy="15" r="2" fill="#1D9E75"/>
            </svg>
            A tu medida
          </Link>
          <p style={{ color: 'var(--gray-600)', marginTop: 8, fontSize: 14 }}>
            Inicia sesión para continuar tu plan
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Correo electrónico</label>
              <input
                className="form-input"
                type="email" required
                placeholder="usuario@email.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <input
                className="form-input"
                type="password" required
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              />
            </div>
            {error && (
              <p style={{ color: 'var(--red)', fontSize: 13, background: '#FEE2E2', padding: '8px 12px', borderRadius: 6 }}>
                {error}
              </p>
            )}
            <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', marginTop: 4, height: 42 }}>
              {loading ? 'Ingresando...' : 'Iniciar sesión'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: 14, color: 'var(--gray-600)' }}>
          ¿No tienes cuenta?{' '}
          <Link to="/register" style={{ color: '#1D9E75', fontWeight: 500 }}>Regístrate gratis</Link>
        </p>
      </div>
    </div>
  );
}
