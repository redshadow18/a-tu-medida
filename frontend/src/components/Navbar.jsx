import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LINKS = [
  { to: '/dashboard',    label: 'Inicio'       },
  { to: '/alimentacion', label: 'Alimentación' },
  { to: '/ejercicio',    label: 'Ejercicio'    },
  { to: '/progreso',     label: 'Progreso'     },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate  = useNavigate();
  const { pathname } = useLocation();

  const initials = user?.name?.split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase();

  return (
    <nav className="navbar">
      <div className="navbar__logo">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <rect width="28" height="28" rx="7" fill="#1D9E75"/>
          <path d="M14 5C14 5 9 10 9 15a5 5 0 0010 0c0-5-5-10-5-10z" fill="white"/>
          <circle cx="14" cy="15" r="2" fill="#1D9E75"/>
        </svg>
        A tu medida
      </div>

      <div className="navbar__links">
        {LINKS.map(l => (
          <button
            key={l.to}
            className={`nav-link${pathname === l.to ? ' active' : ''}`}
            onClick={() => navigate(l.to)}
          >
            {l.label}
          </button>
        ))}
      </div>

      <div className="navbar__user">
        <span style={{ fontSize: 14, color: 'var(--gray-600)' }}>{user?.name}</span>
        <div className="avatar">{initials}</div>
        <button className="btn btn-secondary" style={{ padding:'6px 12px', fontSize:13 }} onClick={logout}>
          Salir
        </button>
      </div>
    </nav>
  );
}
