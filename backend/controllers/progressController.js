const db = require('../config/db');

// GET /api/progress  — últimos 30 días
exports.getProgress = async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT * FROM daily_logs
       WHERE user_id=$1 AND log_date >= NOW() - INTERVAL '30 days'
       ORDER BY log_date DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: 'Error del servidor' });
  }
};

// POST /api/progress  — registrar día
exports.logDay = async (req, res) => {
  const { weight_kg, kcal_consumed, kcal_burned, water_ml, notes } = req.body;
  const log_date = new Date().toISOString().split('T')[0];
  try {
    const { rows } = await db.query(
      `INSERT INTO daily_logs (user_id,log_date,weight_kg,kcal_consumed,kcal_burned,water_ml,notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT (user_id,log_date) DO UPDATE SET
         weight_kg=$3,kcal_consumed=$4,kcal_burned=$5,water_ml=$6,notes=$7
       RETURNING *`,
      [req.user.id, log_date, weight_kg, kcal_consumed, kcal_burned, water_ml, notes]
    );
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: 'Error del servidor' });
  }
};

// GET /api/progress/summary  — resumen semanal
exports.getWeeklySummary = async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT
         AVG(weight_kg)::numeric(5,2)    AS avg_weight,
         SUM(kcal_consumed)              AS total_kcal,
         AVG(kcal_consumed)::int         AS avg_kcal,
         SUM(water_ml)                   AS total_water,
         COUNT(*)                        AS days_logged
       FROM daily_logs
       WHERE user_id=$1 AND log_date >= NOW() - INTERVAL '7 days'`,
      [req.user.id]
    );
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: 'Error del servidor' });
  }
};
