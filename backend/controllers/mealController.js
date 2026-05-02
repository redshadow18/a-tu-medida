const db = require('../config/db');

// GET /api/meals/plan  — plan de la semana actual
exports.getCurrentPlan = async (req, res) => {
  try {
    const monday = getMondayOfWeek(new Date());
    const { rows: plans } = await db.query(
      'SELECT * FROM meal_plans WHERE user_id=$1 AND week_start=$2',
      [req.user.id, monday]
    );
    if (!plans.length) return res.json(null);

    const { rows: meals } = await db.query(
      'SELECT * FROM meals WHERE plan_id=$1 ORDER BY day_of_week, meal_type',
      [plans[0].id]
    );
    res.json({ plan: plans[0], meals });
  } catch (e) {
    res.status(500).json({ error: 'Error del servidor' });
  }
};

// POST /api/meals/generate  — genera plan automático
exports.generatePlan = async (req, res) => {
  try {
    const { rows: profiles } = await db.query(
      'SELECT * FROM profiles WHERE user_id=$1', [req.user.id]
    );
    if (!profiles.length) return res.status(400).json({ error: 'Completa tu perfil primero' });

    const profile = profiles[0];
    const target  = profile.target_kcal;
    const monday  = getMondayOfWeek(new Date());

    // Eliminar plan existente
    await db.query(
      'DELETE FROM meal_plans WHERE user_id=$1 AND week_start=$2',
      [req.user.id, monday]
    );

    const { rows: [plan] } = await db.query(
      'INSERT INTO meal_plans (user_id,week_start,total_kcal) VALUES ($1,$2,$3) RETURNING *',
      [req.user.id, monday, target]
    );

    const { rows: foods } = await db.query('SELECT * FROM foods');
    const meals = buildWeeklyMeals(plan.id, foods, target, profile.restrictions || []);

    for (const m of meals) {
      await db.query(
        `INSERT INTO meals (plan_id,day_of_week,meal_type,food_id,food_name,quantity_g,kcal)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [m.plan_id, m.day, m.type, m.food_id, m.food_name, m.qty, m.kcal]
      );
    }

    res.json({ plan, message: 'Plan generado exitosamente' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error generando el plan' });
  }
};

// GET /api/meals/foods — listado de alimentos
exports.getFoods = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM foods ORDER BY category, name');
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: 'Error del servidor' });
  }
};

// ── Helpers ────────────────────────────────────────────────
function getMondayOfWeek(d) {
  const day  = d.getDay() || 7;
  const diff = d.getDate() - day + 1;
  const mon  = new Date(d.setDate(diff));
  return mon.toISOString().split('T')[0];
}

function buildWeeklyMeals(planId, foods, targetKcal, restrictions) {
  const byCategory = (cat) => foods.filter(f => f.category === cat);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const meals = [];

  // Distribución calórica: 25% desayuno, 40% almuerzo, 30% cena, 5% snack
  const dist = { desayuno: 0.25, almuerzo: 0.40, cena: 0.30, snack: 0.05 };

  for (let day = 1; day <= 7; day++) {
    for (const [type, pct] of Object.entries(dist)) {
      const kcalTarget = targetKcal * pct;
      let food, qty, kcal;

      if (type === 'desayuno') {
        food = pick([...byCategory('Cereal'), ...byCategory('Lácteo')]);
      } else if (type === 'almuerzo') {
        food = pick([...byCategory('Proteína'), ...byCategory('Leguminosa')]);
      } else if (type === 'cena') {
        food = pick([...byCategory('Verdura'), ...byCategory('Proteína')]);
      } else {
        food = pick([...byCategory('Fruta')]);
      }

      if (!food) continue;
      qty  = Math.round((kcalTarget / food.kcal_per_100g) * 100);
      kcal = Math.round(kcalTarget);

      meals.push({
        plan_id: planId, day, type,
        food_id: food.id, food_name: food.name, qty, kcal
      });
    }
  }
  return meals;
}
