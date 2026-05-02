import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const IMC_LABEL = (v) => {
  if (v < 18.5) return ['Bajo peso',  'badge-amber'];
  if (v < 25)   return ['Normal',     'badge-green'];
  if (v < 30)   return ['Sobrepeso',  'badge-amber'];
  return               ['Obesidad',   'badge-red'];
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [profile, setProfile]   = useState(null);
  const [summary, setSummary]   = useState(null);
  const [todayLog, setTodayLog] = useState({ kcal_consumed: '', water_ml: '', weight_kg: '' });
  const [saving, setSaving]     = useState(false);
  const [logs, setLogs]         = useState([]);

  useEffect(() => {
    axios.get('/api/profile').then(r => setProfile(r.data)).catch(() => navigate('/setup'));
    axios.get('/api/progress/summary').then(r => setSummary(r.data)).catch(() => {});
    axios.get('/api/progress').then(r => setLogs(r.data.slice(0, 7))).catch(() => {});
  }, []);

  const saveLog = async () => {
    setSaving(true);
    try {
      await axios.post('/api/progress', {
        kcal_consumed: +todayLog.kcal_consumed || null,
        water_ml:      +todayLog.water_ml || null,
        weight_kg:     +todayLog.weight_kg || null,
      });
      const r = await axios.get('/api/progress/summary');
      setSummary(r.data);
    } finally { setSaving(false); }
  };

  if (!profile) return <div className="page" style={{ display:'flex', justifyContent:'center', paddingTop:'4rem' }}><div className="spinner"/></div>;

  const [imcLabel, imcBadge] = IMC_LABEL(profile.imc);

  return (
    <div className="page">
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Hola, {user?.name?.split(' ')[0]} 👋</h1>
        <p style={{ color: 'var(--gray-600)', fontSize: 14 }}>
          {new Date().toLocaleDateString('es-CO', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
        </p>
      </div>

      {/* Metrics */}
      <div className="page-grid cols-4" style={{ marginBottom: '1rem' }}>
        {[
          { label: 'IMC', value: profile.imc, sub: <span className={`badge ${imcBadge}`}>{imcLabel}</span> },
          { label: 'Peso actual', value: `${profile.weight_kg} kg`, sub: 'registrado en perfil' },
          { label: 'Meta calórica', value: `${profile.target_kcal?.toLocaleString('es-CO')}`, sub: 'kcal / día' },
          { label: 'TDEE', value: profile.tdee?.toLocaleString('es-CO'), sub: 'kcal gasto total' },
        ].map((m, i) => (
          <div key={i} className="card stat-card">
            <div className="stat-card__label">{m.label}</div>
            <div className="stat-card__value" style={{ color: '#1D9E75' }}>{m.value}</div>
            <div className="stat-card__sub" style={{ color: 'var(--gray-400)' }}>{m.sub}</div>
          </div>
        ))}
      </div>

      <div className="page-grid cols-2" style={{ marginBottom: '1rem' }}>
        {/* Log diario */}
        <div className="card">
          <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>Registrar mi día de hoy</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Calorías consumidas', key: 'kcal_consumed', placeholder: 'ej. 1600', type: 'number' },
              { label: 'Agua tomada (ml)',     key: 'water_ml',      placeholder: 'ej. 2000', type: 'number' },
              { label: 'Peso hoy (kg)',        key: 'weight_kg',     placeholder: 'ej. 81.5', type: 'number' },
            ].map(f => (
              <div key={f.key} className="form-group">
                <label className="form-label">{f.label}</label>
                <input className="form-input" type={f.type} placeholder={f.placeholder}
                  value={todayLog[f.key]}
                  onChange={e => setTodayLog(l => ({ ...l, [f.key]: e.target.value }))} />
              </div>
            ))}
            <button className="btn btn-primary" style={{ width: '100%', height: 40, marginTop: 4 }}
              disabled={saving} onClick={saveLog}>
              {saving ? 'Guardando...' : 'Guardar registro'}
            </button>
          </div>
        </div>

        {/* Resumen semanal */}
        <div className="card">
          <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>Resumen de los últimos 7 días</h3>
          {summary ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                ['Días registrados', summary.days_logged],
                ['Promedio de peso', summary.avg_weight ? `${summary.avg_weight} kg` : '—'],
                ['Promedio calórico', summary.avg_kcal ? `${summary.avg_kcal?.toLocaleString('es-CO')} kcal` : '—'],
                ['Agua total',       summary.total_water ? `${(summary.total_water/1000).toFixed(1)} L` : '—'],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '8px 0', borderBottom: '1px solid var(--gray-100)' }}>
                  <span style={{ fontSize: 14, color: 'var(--gray-600)' }}>{label}</span>
                  <span style={{ fontWeight: 600, fontSize: 15 }}>{value}</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--gray-400)', fontSize: 14 }}>Aún no hay registros esta semana.</p>
          )}
        </div>
      </div>

      {/* Quick access */}
      <div className="page-grid cols-3">
        {[
          { label: 'Ver plan alimenticio', sub: 'Tu menú semanal personalizado', to: '/alimentacion' },
          { label: 'Rutina de ejercicios', sub: 'Calistenia progresiva de esta semana', to: '/ejercicio' },
          { label: 'Mi progreso',          sub: 'Historial de peso y calorías', to: '/progreso' },
        ].map(c => (
          <button key={c.to} className="card" onClick={() => navigate(c.to)}
            style={{ textAlign: 'left', cursor: 'pointer', border: '1px solid var(--gray-200)', background: '#fff',
              transition: 'border-color .15s' }}
            onMouseOver={e => e.currentTarget.style.borderColor = '#1D9E75'}
            onMouseOut={e => e.currentTarget.style.borderColor = 'var(--gray-200)'}
          >
            <div style={{ fontWeight: 600, marginBottom: 4 }}>{c.label} →</div>
            <div style={{ fontSize: 13, color: 'var(--gray-400)' }}>{c.sub}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
