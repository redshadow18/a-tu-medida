import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ACTIVITY = [
  { value: 1,     label: 'Sedentario',          desc: 'Poco o ningún ejercicio' },
  { value: 1.375, label: 'Ligero',               desc: '1-3 días por semana' },
  { value: 1.55,  label: 'Moderado',             desc: '3-5 días por semana' },
  { value: 1.725, label: 'Activo',               desc: '6-7 días por semana' },
];
const GOALS = [
  { value: 'perder',   label: 'Perder peso',    desc: 'Déficit de 500 kcal/día' },
  { value: 'mantener', label: 'Mantener peso',  desc: 'Balance calórico neutro' },
  { value: 'ganar',    label: 'Ganar músculo',  desc: 'Superávit de 300 kcal/día' },
];
const RESTRICTIONS = ['Vegetariano','Vegano','Sin gluten','Sin lactosa','Sin mariscos'];

const calcTMB = (w, h, a, s) =>
  s === 'M' ? 10*w + 6.25*h - 5*a + 5 : 10*w + 6.25*h - 5*a - 161;

export default function Setup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');
  const [form, setForm] = useState({
    age: '', sex: 'M', weight_kg: '', height_cm: '',
    activity_level: 1.375, goal: 'perder', restrictions: [],
  });

  const imc  = form.weight_kg && form.height_cm
    ? (form.weight_kg / ((form.height_cm / 100) ** 2)).toFixed(1)
    : null;
  const tmb  = imc ? Math.round(calcTMB(+form.weight_kg, +form.height_cm, +form.age, form.sex)) : null;
  const tdee = tmb ? Math.round(tmb * form.activity_level) : null;
  const meta = tdee
    ? form.goal === 'perder' ? tdee - 500
    : form.goal === 'ganar'  ? tdee + 300
    : tdee : null;

  const toggle = (r) => setForm(f => ({
    ...f,
    restrictions: f.restrictions.includes(r)
      ? f.restrictions.filter(x => x !== r)
      : [...f.restrictions, r],
  }));

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      await axios.post('/api/profile', {
        ...form,
        age: +form.age,
        weight_kg: +form.weight_kg,
        height_cm: +form.height_cm,
      });
      await axios.post('/api/meals/generate');
      await axios.post('/api/routines/generate', { level: 1 });
      navigate('/dashboard');
    } catch (e) {
      setError(e.response?.data?.error || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const Chip = ({ active, onClick, children }) => (
    <button
      type="button" onClick={onClick}
      style={{
        padding: '7px 14px', borderRadius: 99, fontSize: 13, cursor: 'pointer',
        background: active ? '#1D9E75' : '#fff', color: active ? '#fff' : 'var(--gray-600)',
        border: `1px solid ${active ? '#1D9E75' : 'var(--gray-200)'}`,
        fontWeight: active ? 500 : 400, transition: 'all .15s',
      }}
    >
      {children}
    </button>
  );

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--gray-50)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem',
    }}>
      <div style={{ width: '100%', maxWidth: 560 }}>

        {/* Steps indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: '2rem' }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600,
                background: s < step ? '#1D9E75' : s === step ? '#E1F5EE' : 'var(--gray-100)',
                color: s < step ? '#fff' : s === step ? '#0F6E56' : 'var(--gray-400)',
                border: s === step ? '2px solid #1D9E75' : '2px solid transparent',
              }}>
                {s < step ? '✓' : s}
              </div>
              {s < 3 && <div style={{ width: 32, height: 1, background: s < step ? '#1D9E75' : 'var(--gray-200)' }} />}
            </div>
          ))}
        </div>

        <div className="card">

          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <h2 style={{ fontWeight: 700, fontSize: 20 }}>Datos personales</h2>
                <p style={{ color: 'var(--gray-600)', fontSize: 14, marginTop: 4 }}>Usamos estos datos para calcular tu IMC y metabolismo basal.</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Edad</label>
                  <input className="form-input" type="number" min="18" max="70" placeholder="35"
                    value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Peso (kg)</label>
                  <input className="form-input" type="number" min="40" max="200" placeholder="75"
                    value={form.weight_kg} onChange={e => setForm(f => ({ ...f, weight_kg: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Estatura (cm)</label>
                  <input className="form-input" type="number" min="140" max="220" placeholder="170"
                    value={form.height_cm} onChange={e => setForm(f => ({ ...f, height_cm: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Sexo biológico</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  <Chip active={form.sex === 'M'} onClick={() => setForm(f => ({ ...f, sex: 'M' }))}>Masculino</Chip>
                  <Chip active={form.sex === 'F'} onClick={() => setForm(f => ({ ...f, sex: 'F' }))}>Femenino</Chip>
                </div>
              </div>
              {imc && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, background: '#E1F5EE', borderRadius: 10, padding: '1rem' }}>
                  {[['IMC', imc], ['TMB', tmb + ' kcal'], ['TDEE', tdee + ' kcal']].map(([l, v]) => (
                    <div key={l} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 11, color: '#0F6E56', marginBottom: 2 }}>{l}</div>
                      <div style={{ fontWeight: 700, fontSize: 18, color: '#085041' }}>{v}</div>
                    </div>
                  ))}
                </div>
              )}
              <button className="btn btn-primary" style={{ width: '100%', height: 42 }}
                disabled={!form.age || !form.weight_kg || !form.height_cm}
                onClick={() => setStep(2)}>
                Continuar →
              </button>
            </div>
          )}

          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <h2 style={{ fontWeight: 700, fontSize: 20 }}>Actividad y objetivo</h2>
                <p style={{ color: 'var(--gray-600)', fontSize: 14, marginTop: 4 }}>Esto define tus calorías objetivo diarias.</p>
              </div>
              <div className="form-group">
                <label className="form-label">Nivel de actividad física</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {ACTIVITY.map(a => (
                    <button key={a.value} type="button"
                      onClick={() => setForm(f => ({ ...f, activity_level: a.value }))}
                      style={{
                        padding: '10px 14px', borderRadius: 10, textAlign: 'left', cursor: 'pointer',
                        background: form.activity_level === a.value ? '#E1F5EE' : '#fff',
                        border: `1px solid ${form.activity_level === a.value ? '#1D9E75' : 'var(--gray-200)'}`,
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      }}>
                      <span style={{ fontWeight: 500, fontSize: 14 }}>{a.label}</span>
                      <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>{a.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Objetivo principal</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                  {GOALS.map(g => (
                    <button key={g.value} type="button"
                      onClick={() => setForm(f => ({ ...f, goal: g.value }))}
                      style={{
                        padding: '12px 10px', borderRadius: 10, cursor: 'pointer', textAlign: 'center',
                        background: form.goal === g.value ? '#1D9E75' : '#fff',
                        color: form.goal === g.value ? '#fff' : 'var(--gray-800)',
                        border: `1px solid ${form.goal === g.value ? '#1D9E75' : 'var(--gray-200)'}`,
                      }}>
                      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{g.label}</div>
                      <div style={{ fontSize: 11, opacity: form.goal === g.value ? .8 : .6 }}>{g.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
              {meta && (
                <div style={{ background: '#E1F5EE', borderRadius: 10, padding: '12px 16px', textAlign: 'center' }}>
                  <div style={{ fontSize: 12, color: '#0F6E56' }}>Tu meta calórica diaria</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#085041' }}>{meta.toLocaleString('es-CO')} kcal</div>
                </div>
              )}
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-secondary" style={{ flex: 1, height: 42 }} onClick={() => setStep(1)}>← Atrás</button>
                <button className="btn btn-primary" style={{ flex: 2, height: 42 }} onClick={() => setStep(3)}>Continuar →</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <h2 style={{ fontWeight: 700, fontSize: 20 }}>Restricciones alimentarias</h2>
                <p style={{ color: 'var(--gray-600)', fontSize: 14, marginTop: 4 }}>Selecciona las que apliquen. Puedes omitir este paso.</p>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {RESTRICTIONS.map(r => (
                  <Chip key={r} active={form.restrictions.includes(r)} onClick={() => toggle(r)}>{r}</Chip>
                ))}
              </div>
              {error && (
                <p style={{ color: 'var(--red)', fontSize: 13, background: '#FEE2E2', padding: '8px 12px', borderRadius: 6 }}>{error}</p>
              )}
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-secondary" style={{ flex: 1, height: 42 }} onClick={() => setStep(2)}>← Atrás</button>
                <button className="btn btn-primary" style={{ flex: 2, height: 42 }} disabled={saving} onClick={handleSave}>
                  {saving ? 'Generando tu plan...' : '¡Generar mi plan! →'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
