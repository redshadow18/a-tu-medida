import { useEffect, useState } from 'react';
import axios from 'axios';

const DAYS = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
const REST_DAYS = [5, 6]; // Sáb, Dom (índice 0)

export default function Routine() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [regen, setRegen]   = useState(false);
  const [selDay, setSelDay] = useState(() => {
    const d = new Date().getDay();
    return d === 0 ? 6 : d - 1;
  });
  const [level, setLevel] = useState(1);
  const [done, setDone]   = useState({});

  const load = () => {
    setLoading(true);
    axios.get('/api/routines/current')
      .then(r => { setData(r.data); if (r.data) setLevel(r.data.routine.level); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const generate = async () => {
    setRegen(true);
    await axios.post('/api/routines/generate', { level });
    load();
    setRegen(false);
  };

  const toggleDone = (id) => setDone(d => ({ ...d, [id]: !d[id] }));

  if (loading) return <div className="page" style={{ display:'flex',justifyContent:'center',paddingTop:'4rem' }}><div className="spinner"/></div>;

  const dayExercises = data?.exercises?.filter(e => e.day_of_week === selDay + 1) || [];
  const isRest = REST_DAYS.includes(selDay);

  return (
    <div className="page">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:700 }}>Rutina de calistenia</h1>
          <p style={{ color:'var(--gray-600)', fontSize:14 }}>Nivel {data?.routine?.level || level} · 5 días de entrenamiento</p>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <select className="form-input" style={{ width:'auto', height:38 }}
            value={level} onChange={e => setLevel(+e.target.value)}>
            <option value={1}>Nivel 1 · Principiante</option>
            <option value={2}>Nivel 2 · Intermedio</option>
            <option value={3}>Nivel 3 · Avanzado</option>
          </select>
          <button className="btn btn-ghost" onClick={generate} disabled={regen}>
            {regen ? 'Generando...' : '↺ Regenerar'}
          </button>
        </div>
      </div>

      {/* Day selector */}
      <div style={{ display:'flex', gap:6, marginBottom:'1.25rem', flexWrap:'wrap' }}>
        {DAYS.map((d, i) => (
          <button key={i} onClick={() => setSelDay(i)}
            style={{
              padding:'7px 14px', borderRadius:99, fontSize:13, cursor:'pointer',
              background: selDay === i ? '#1D9E75' : REST_DAYS.includes(i) ? 'var(--gray-100)' : '#fff',
              color: selDay === i ? '#fff' : REST_DAYS.includes(i) ? 'var(--gray-400)' : 'var(--gray-600)',
              border: `1px solid ${selDay === i ? '#1D9E75' : 'var(--gray-200)'}`,
            }}>
            {d} {REST_DAYS.includes(i) ? '· descanso' : ''}
          </button>
        ))}
      </div>

      {isRest ? (
        <div className="card" style={{ textAlign:'center', padding:'3rem' }}>
          <div style={{ fontSize:48, marginBottom:'1rem' }}>😴</div>
          <h3 style={{ fontWeight:600, marginBottom:8 }}>Día de descanso</h3>
          <p style={{ color:'var(--gray-400)', fontSize:14 }}>
            El descanso es parte del entrenamiento. Hidratación y recuperación activa.
          </p>
        </div>
      ) : !data ? (
        <div className="card" style={{ textAlign:'center', padding:'3rem' }}>
          <p style={{ color:'var(--gray-400)', marginBottom:'1rem' }}>No tienes una rutina generada.</p>
          <button className="btn btn-primary" onClick={generate}>Generar mi rutina</button>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
          {dayExercises.map((ex, i) => (
            <div key={ex.id} className="card"
              style={{
                display:'flex', alignItems:'center', gap:'1rem',
                opacity: done[ex.id] ? .6 : 1,
                borderColor: done[ex.id] ? '#1D9E75' : 'var(--gray-200)',
              }}>
              <button onClick={() => toggleDone(ex.id)}
                style={{
                  width:28, height:28, borderRadius:'50%', flexShrink:0, cursor:'pointer',
                  background: done[ex.id] ? '#1D9E75' : '#fff',
                  border: `2px solid ${done[ex.id] ? '#1D9E75' : 'var(--gray-200)'}`,
                  color: '#fff', fontSize:14, display:'flex', alignItems:'center', justifyContent:'center',
                }}>
                {done[ex.id] && '✓'}
              </button>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:600, fontSize:15, textDecoration: done[ex.id] ? 'line-through' : 'none' }}>
                  {i + 1}. {ex.name}
                </div>
                <div style={{ fontSize:13, color:'var(--gray-400)', marginTop:2 }}>
                  {ex.sets} series ·{' '}
                  {ex.reps ? `${ex.reps} reps` : `${ex.duration_s} seg`} ·{' '}
                  {ex.rest_s}s descanso
                </div>
              </div>
            </div>
          ))}

          {/* Progress */}
          <div style={{ background:'#E1F5EE', borderRadius:10, padding:'12px 16px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
              <span style={{ color:'#0F6E56', fontWeight:500, fontSize:14 }}>Progreso del día</span>
              <span style={{ color:'#0F6E56', fontSize:14 }}>
                {Object.values(done).filter(Boolean).length} / {dayExercises.length}
              </span>
            </div>
            <div className="progress-bar">
              <div className="progress-bar__fill" style={{
                width: dayExercises.length
                  ? `${(Object.values(done).filter(Boolean).length / dayExercises.length) * 100}%`
                  : '0%'
              }}/>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
