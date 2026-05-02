const db = require('../config/db');

const ROUTINES = {
  1: [
    { name: 'Sentadillas',       sets: 3, reps: 15, rest_s: 60 },
    { name: 'Flexiones',         sets: 3, reps: 10, rest_s: 60 },
    { name: 'Plancha',           sets: 3, duration_s: 30, rest_s: 45 },
    { name: 'Zancadas',          sets: 3, reps: 12, rest_s: 60 },
    { name: 'Abdominales',       sets: 3, reps: 15, rest_s: 45 },
  ],
  2: [
    { name: 'Sentadillas búlgaras', sets: 4, reps: 12, rest_s: 75 },
    { name: 'Flexiones diamante',   sets: 4, reps: 12, rest_s: 75 },
    { name: 'Plancha lateral',      sets: 3, duration_s: 40, rest_s: 45 },
    { name: 'Burpees',              sets: 3, reps: 10, rest_s: 90 },
    { name: 'Superman',             sets: 3, reps: 15, rest_s: 45 },
    { name: 'Mountain climbers',    sets: 3, duration_s: 30, rest_s: 60 },
  ],
  3: [
    { name: 'Pistol squat asistido', sets: 4, reps: 8,  rest_s: 90 },
    { name: 'Fondos en paralelas',   sets: 4, reps: 12, rest_s: 90 },
    { name: 'Pull-up negativo',      sets: 4, reps: 6,  rest_s: 90 },
    { name: 'Plancha con elevación', sets: 3, duration_s: 45, rest_s: 60 },
    { name: 'Saltos al cajón',       sets: 3, reps: 10, rest_s: 90 },
    { name: 'Dragon flag',           sets: 3, reps: 5,  rest_s: 90 },
  ],
};

// Días de entrenamiento: L M X J V (descanso S D)
const TRAINING_DAYS = [1, 2, 3, 4, 5];

// GET /api/routines/current
exports.getCurrentRoutine = async (req, res) => {
  try {
    const monday = getMondayOfWeek(new Date());
    const { rows: routines } = await db.query(
      'SELECT * FROM routines WHERE user_id=$1 AND week_start=$2',
      [req.user.id, monday]
    );
    if (!routines.length) return res.json(null);

    const { rows: exercises } = await db.query(
      'SELECT * FROM exercises WHERE routine_id=$1 ORDER BY day_of_week, name',
      [routines[0].id]
    );
    res.json({ routine: routines[0], exercises });
  } catch (e) {
    res.status(500).json({ error: 'Error del servidor' });
  }
};

// POST /api/routines/generate
exports.generateRoutine = async (req, res) => {
  try {
    const { level = 1 } = req.body;
    const monday = getMondayOfWeek(new Date());

    await db.query(
      'DELETE FROM routines WHERE user_id=$1 AND week_start=$2',
      [req.user.id, monday]
    );

    const { rows: [routine] } = await db.query(
      'INSERT INTO routines (user_id,level,week_start) VALUES ($1,$2,$3) RETURNING *',
      [req.user.id, level, monday]
    );

    const exList = ROUTINES[level] || ROUTINES[1];

    for (const day of TRAINING_DAYS) {
      for (const ex of exList) {
        await db.query(
          `INSERT INTO exercises (routine_id,day_of_week,name,sets,reps,duration_s,rest_s)
           VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [routine.id, day, ex.name, ex.sets, ex.reps || null, ex.duration_s || null, ex.rest_s]
        );
      }
    }

    res.json({ routine, message: 'Rutina generada exitosamente' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error generando la rutina' });
  }
};

// POST /api/routines/log
exports.logExercise = async (req, res) => {
  const { exercise_id, completed, sets_done, reps_done, notes } = req.body;
  const log_date = new Date().toISOString().split('T')[0];
  try {
    const { rows } = await db.query(
      `INSERT INTO exercise_logs (user_id,exercise_id,log_date,completed,sets_done,reps_done,notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT DO NOTHING RETURNING *`,
      [req.user.id, exercise_id, log_date, completed, sets_done, reps_done, notes]
    );
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: 'Error del servidor' });
  }
};

function getMondayOfWeek(d) {
  const day  = d.getDay() || 7;
  const diff = d.getDate() - day + 1;
  const mon  = new Date(d.setDate(diff));
  return mon.toISOString().split('T')[0];
}
