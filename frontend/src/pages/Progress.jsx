import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, Legend,
} from 'recharts';

export default function Progress() {
  const [logs, setLogs]       = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get('/api/progress'),
      axios.get('/api/profile'),
    ]).then(([logRes, profRes]) => {
      setLogs([...logRes.data].reverse());
      setProfile(profRes.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page" style={{ display:'flex',justifyContent:'center',paddingTop:'4rem' }}><div className="spinner"/></div>;

  const chartData = logs.map(l => ({
    fecha:    l.log_date?.slice(5),
    peso:     l.weight_kg ? +l.weight_kg : null,
    calorias: l.kcal_consumed || null,
    agua:     l.water_ml ? +(l.water_ml/1000).toFixed(1) : null,
  }));

  const last = logs[logs.length - 1];
  const first = logs[0];
  const diff = (last?.weight_kg && first?.weight_kg)
    ? (+last.weight_kg - +first.weight_kg).toFixed(1)
    : null;

  return (
    <div className="page">
      <div style={{ marginBottom:'1.5rem' }}>
        <h1 style={{ fontSize:24, fontWeight:700 }}>Mi progreso</h1>
        <p style={{ color:'var(--gray-600)', fontSize:14 }}>Últimos 30 días registrados</p>
      </div>

      {/* Summary stats */}
      <div className="page-grid cols-4" style={{ marginBottom:'1.25rem' }}>
        {[
          { label:'Días registrados', value: logs.length },
          { label:'Peso inicial',     value: first?.weight_kg ? `${first.weight_kg} kg` : '—' },
          { label:'Peso actual',      value: last?.weight_kg  ? `${last.weight_kg} kg`  : '—' },
          {
            label:'Variación total',
            value: diff ? `${diff > 0 ? '+' : ''}${diff} kg` : '—',
            color: diff < 0 ? '#1D9E75' : diff > 0 ? 'var(--amber)' : 'var(--gray-800)',
          },
        ].map((s, i) => (
          <div key={i} className="card stat-card">
            <div className="stat-card__label">{s.label}</div>
            <div className="stat-card__value" style={{ color: s.color || '#1D9E75', fontSize:22 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {logs.length === 0 ? (
        <div className="card" style={{ textAlign:'center', padding:'3rem', color:'var(--gray-400)' }}>
          <p>Aún no tienes registros. Ve al dashboard y registra tu primer día.</p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>

          {/* Weight chart */}
          <div className="card">
            <h3 style={{ fontWeight:600, marginBottom:'1rem' }}>Evolución del peso (kg)</h3>
            {profile?.target_kcal && (
              <p style={{ fontSize:13, color:'var(--gray-400)', marginBottom:'0.5rem' }}>
                Meta: llegar a un IMC saludable · Peso actual de referencia: {last?.weight_kg} kg
              </p>
            )}
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6"/>
                <XAxis dataKey="fecha" tick={{ fontSize:12 }} />
                <YAxis domain={['auto','auto']} tick={{ fontSize:12 }} />
                <Tooltip formatter={(v) => [`${v} kg`,'Peso']} />
                <Line type="monotone" dataKey="peso" stroke="#1D9E75" strokeWidth={2} dot={{ r:3 }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Calories chart */}
          <div className="card">
            <h3 style={{ fontWeight:600, marginBottom:'1rem' }}>Calorías consumidas (kcal)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6"/>
                <XAxis dataKey="fecha" tick={{ fontSize:12 }} />
                <YAxis tick={{ fontSize:12 }} />
                <Tooltip formatter={(v) => [`${v} kcal`,'Calorías']} />
                <Bar dataKey="calorias" fill="#5DCAA5" radius={[4,4,0,0]} name="Calorías" />
                {profile?.target_kcal && (
                  <Bar dataKey={() => profile.target_kcal} fill="transparent"
                    name={`Meta (${profile.target_kcal} kcal)`} strokeDasharray="5 5" />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Log history table */}
          <div className="card">
            <h3 style={{ fontWeight:600, marginBottom:'1rem' }}>Historial detallado</h3>
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:14 }}>
                <thead>
                  <tr style={{ borderBottom:'1px solid var(--gray-200)' }}>
                    {['Fecha','Peso','Calorías','Agua','Notas'].map(h => (
                      <th key={h} style={{ padding:'8px 12px', textAlign:'left', fontWeight:500, color:'var(--gray-400)', fontSize:13 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...logs].reverse().map(l => (
                    <tr key={l.id} style={{ borderBottom:'1px solid var(--gray-100)' }}>
                      <td style={{ padding:'10px 12px', color:'var(--gray-600)' }}>{l.log_date}</td>
                      <td style={{ padding:'10px 12px', fontWeight:500 }}>{l.weight_kg ? `${l.weight_kg} kg` : '—'}</td>
                      <td style={{ padding:'10px 12px' }}>{l.kcal_consumed ? `${l.kcal_consumed?.toLocaleString('es-CO')} kcal` : '—'}</td>
                      <td style={{ padding:'10px 12px' }}>{l.water_ml ? `${(l.water_ml/1000).toFixed(1)} L` : '—'}</td>
                      <td style={{ padding:'10px 12px', color:'var(--gray-400)', fontSize:13 }}>{l.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
