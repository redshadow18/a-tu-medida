const db = require('../config/db');

// Mifflin-St Jeor
const calcTMB = (weight, height, age, sex) =>
  sex === 'M'
    ? Math.round(10 * weight + 6.25 * height - 5 * age + 5)
    : Math.round(10 * weight + 6.25 * height - 5 * age - 161);

const calcIMC  = (weight, height) => +(weight / ((height / 100) ** 2)).toFixed(1);
const calcTDEE = (tmb, factor)    => Math.round(tmb * factor);
const calcMeta = (tdee, goal) => {
  if (goal === 'perder')   return tdee - 500;
  if (goal === 'ganar')    return tdee + 300;
  return tdee;
};

// GET /api/profile
exports.getProfile = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM profiles WHERE user_id=$1', [req.user.id]);
    if (!rows.length) return res.status(404).json({ error: 'Perfil no encontrado' });
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: 'Error del servidor' });
  }
};

// POST /api/profile
exports.createProfile = async (req, res) => {
  const { age, sex, weight_kg, height_cm, activity_level, goal, restrictions } = req.body;
  try {
    const imc         = calcIMC(weight_kg, height_cm);
    const tmb         = calcTMB(weight_kg, height_cm, age, sex);
    const tdee        = calcTDEE(tmb, activity_level);
    const target_kcal = calcMeta(tdee, goal);

    const { rows } = await db.query(
      `INSERT INTO profiles
        (user_id,age,sex,weight_kg,height_cm,activity_level,goal,restrictions,imc,tmb,tdee,target_kcal)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       ON CONFLICT (user_id) DO UPDATE SET
        age=$2,sex=$3,weight_kg=$4,height_cm=$5,activity_level=$6,
        goal=$7,restrictions=$8,imc=$9,tmb=$10,tdee=$11,target_kcal=$12,updated_at=NOW()
       RETURNING *`,
      [req.user.id, age, sex, weight_kg, height_cm, activity_level,
       goal, restrictions || [], imc, tmb, tdee, target_kcal]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

// GET /api/profile/metrics
exports.getMetrics = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT imc,tmb,tdee,target_kcal,goal FROM profiles WHERE user_id=$1', [req.user.id]);
    if (!rows.length) return res.status(404).json({ error: 'Perfil no encontrado' });
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: 'Error del servidor' });
  }
};
