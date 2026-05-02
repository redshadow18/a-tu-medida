import { useEffect, useState } from 'react';
import axios from 'axios';

const DAYS  = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
const TYPES = ['desayuno','almuerzo','cena','snack'];
const TYPE_LABEL = { desayuno:'Desayuno', almuerzo:'Almuerzo', cena:'Cena', snack:'Snack' };

export default function MealPlan() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [regen, setRegen]     = useState(false);
  const [selDay, setSelDay]   = useState(0);

  const load = () => {
    setLoading(true);
    axios.get('/api/meals/plan')
      .then(r => setData(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const generate = async () => {
    setRegen(true);
    await axios.post('/api/meals/generate');
    load();
    setRegen(false);
  };

  if (loading) return <div className="page" style={{ display:'flex',justifyContent:'center',paddingTop:'4rem' }}><div className="spinner"/></div>;

  const dayMeals = data?.meals?.filter(m => m.day_of_week === selDay + 1) || [];

  return (
    <div className="page">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:700 }}>Plan alimenticio</h1>
          <p style={{ color:'var(--gray-600)', fontSize:14 }}>
            Semana del {data?.plan?.week_start || '—'} · {data?.plan?.total_kcal?.toLocaleString('es-CO')} kcal/día
          </p>
        </div>
        <button className="btn btn-ghost" onClick={generate} disabled={regen}>
          {regen ? 'Generando...' : '↺ Regenerar plan'}
        </button>
      </div>

      {/* Day selector */}
      <div style={{ display:'flex', gap:6, marginBottom:'1.25rem', flexWrap:'wrap' }}>
        {DAYS.map((d, i) => (
          <button key={i} onClick={() => setSelDay(i)}
            style={{
              padding:'7px 14px', borderRadius:99, fontSize:13, cursor:'pointer',
              background: selDay === i ? '#1D9E75' : '#fff',
              color: selDay === i ? '#fff' : 'var(--gray-600)',
              border: `1px solid ${selDay === i ? '#1D9E75' : 'var(--gray-200)'}`,
              fontWeight: selDay === i ? 500 : 400,
            }}>
            {d}
          </button>
        ))}
      </div>

      {/* Meals of selected day */}
      {!data ? (
        <div className="card" style={{ textAlign:'center', padding:'3rem' }}>
          <p style={{ color:'var(--gray-400)', marginBottom:'1rem' }}>No tienes un plan generado aún.</p>
          <button className="btn btn-primary" onClick={generate}>Generar mi plan</button>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
          {TYPES.map(type => {
            const meal = dayMeals.find(m => m.meal_type === type);
            return (
              <div key={type} className="card" style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
                <div style={{
                  width:44, height:44, borderRadius:10, background:'#E1F5EE',
                  display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
                }}>
                  <span style={{ fontSize:20 }}>
                    {type==='desayuno'?'🌅':type==='almuerzo'?'☀️':type==='cena'?'🌙':'🍎'}
                  </span>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600, fontSize:14 }}>{TYPE_LABEL[type]}</div>
                  <div style={{ fontSize:13, color:'var(--gray-600)', marginTop:2 }}>
                    {meal ? `${meal.food_name} · ${meal.quantity_g}g` : 'Sin asignar'}
                  </div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontWeight:600, color:'#1D9E75' }}>
                    {meal ? `${Math.round(meal.kcal)} kcal` : '—'}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Day total */}
          <div style={{
            padding:'12px 16px', borderRadius:10,
            background:'#E1F5EE', display:'flex', justifyContent:'space-between', alignItems:'center',
          }}>
            <span style={{ fontWeight:500, color:'#0F6E56' }}>Total del día</span>
            <span style={{ fontWeight:700, fontSize:18, color:'#085041' }}>
              {dayMeals.reduce((s,m) => s + (+m.kcal||0), 0).toLocaleString('es-CO')} kcal
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
