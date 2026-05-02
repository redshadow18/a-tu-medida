-- ============================================================
-- A TU MEDIDA — Schema de Base de Datos  PostgreSQL 15+
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Usuarios
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          VARCHAR(120) NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Perfiles biométricos
CREATE TABLE profiles (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID REFERENCES users(id) ON DELETE CASCADE,
  age            INT NOT NULL,
  sex            CHAR(1) CHECK (sex IN ('M','F')),
  weight_kg      NUMERIC(5,2) NOT NULL,
  height_cm      NUMERIC(5,2) NOT NULL,
  activity_level NUMERIC(4,3) NOT NULL DEFAULT 1.375,
  goal           VARCHAR(20) CHECK (goal IN ('perder','mantener','ganar')),
  restrictions   TEXT[] DEFAULT '{}',
  imc            NUMERIC(5,2),
  tmb            INT,
  tdee           INT,
  target_kcal    INT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Alimentos canasta bogotana
CREATE TABLE foods (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(150) NOT NULL,
  category      VARCHAR(60),
  kcal_per_100g NUMERIC(6,2) NOT NULL,
  protein_g     NUMERIC(5,2) DEFAULT 0,
  carbs_g       NUMERIC(5,2) DEFAULT 0,
  fat_g         NUMERIC(5,2) DEFAULT 0,
  is_local      BOOLEAN DEFAULT TRUE
);

-- Planes alimenticios semanales
CREATE TABLE meal_plans (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  week_start  DATE NOT NULL,
  total_kcal  INT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Comidas individuales del plan
CREATE TABLE meals (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id      UUID REFERENCES meal_plans(id) ON DELETE CASCADE,
  day_of_week  INT CHECK (day_of_week BETWEEN 1 AND 7),
  meal_type    VARCHAR(20) CHECK (meal_type IN ('desayuno','almuerzo','cena','snack')),
  food_id      INT REFERENCES foods(id),
  food_name    VARCHAR(150),
  quantity_g   NUMERIC(6,2),
  kcal         NUMERIC(7,2),
  notes        TEXT
);

-- Rutinas de calistenia
CREATE TABLE routines (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  level       INT CHECK (level BETWEEN 1 AND 3) DEFAULT 1,
  week_start  DATE NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Ejercicios de la rutina
CREATE TABLE exercises (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  routine_id  UUID REFERENCES routines(id) ON DELETE CASCADE,
  day_of_week INT CHECK (day_of_week BETWEEN 1 AND 7),
  name        VARCHAR(120) NOT NULL,
  sets        INT,
  reps        INT,
  duration_s  INT,
  rest_s      INT DEFAULT 60,
  notes       TEXT
);

-- Seguimiento diario
CREATE TABLE daily_logs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID REFERENCES users(id) ON DELETE CASCADE,
  log_date      DATE NOT NULL,
  weight_kg     NUMERIC(5,2),
  kcal_consumed INT,
  kcal_burned   INT,
  water_ml      INT,
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, log_date)
);

-- Registro de ejercicios completados
CREATE TABLE exercise_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES exercises(id),
  log_date    DATE NOT NULL,
  completed   BOOLEAN DEFAULT FALSE,
  sets_done   INT,
  reps_done   INT,
  notes       TEXT
);

-- Índices de rendimiento
CREATE INDEX idx_daily_logs_user_date   ON daily_logs(user_id, log_date DESC);
CREATE INDEX idx_meal_plans_user        ON meal_plans(user_id);
CREATE INDEX idx_routines_user          ON routines(user_id);
CREATE INDEX idx_exercise_logs_user_date ON exercise_logs(user_id, log_date DESC);

-- ============================================================
-- Datos semilla: Alimentos canasta bogotana
-- ============================================================
INSERT INTO foods (name, category, kcal_per_100g, protein_g, carbs_g, fat_g) VALUES
('Arroz blanco cocido',      'Cereal',      130,  2.7, 28.2,  0.3),
('Papa criolla cocida',      'Tubérculo',    77,  2.0, 17.5,  0.1),
('Plátano maduro',           'Fruta',        89,  1.1, 23.0,  0.3),
('Pechuga de pollo',         'Proteína',    165, 31.0,  0.0,  3.6),
('Huevo entero',             'Proteína',    155, 13.0,  1.1, 11.0),
('Fríjol cocido',            'Leguminosa',  127,  8.7, 22.8,  0.5),
('Avena en hojuelas',        'Cereal',      389, 17.0, 66.0,  7.0),
('Banano',                   'Fruta',        89,  1.1, 23.0,  0.3),
('Leche entera',             'Lácteo',       61,  3.2,  4.8,  3.3),
('Queso campesino',          'Lácteo',      300, 20.0,  2.0, 23.0),
('Lenteja cocida',           'Leguminosa',  116,  9.0, 20.0,  0.4),
('Zanahoria',                'Verdura',      41,  0.9,  9.6,  0.2),
('Tomate',                   'Verdura',      18,  0.9,  3.9,  0.2),
('Cebolla cabezona',         'Verdura',      40,  1.1,  9.3,  0.1),
('Espinaca',                 'Verdura',      23,  2.9,  3.6,  0.4),
('Aguacate',                 'Fruta',       160,  2.0,  9.0, 15.0),
('Atún en agua',             'Proteína',    116, 25.5,  0.0,  1.0),
('Carne de res magra',       'Proteína',    143, 26.0,  0.0,  3.5),
('Mazorca cocida',           'Cereal',       96,  3.4, 21.0,  1.5),
('Yuca cocida',              'Tubérculo',   160,  1.4, 38.1,  0.3),
('Naranja',                  'Fruta',        47,  0.9, 11.8,  0.1),
('Manzana',                  'Fruta',        52,  0.3, 13.8,  0.2),
('Pan integral',             'Cereal',      247,  8.5, 41.0,  4.2),
('Yogur natural bajo grasa', 'Lácteo',       59,  3.5,  7.0,  1.5),
('Aceite de girasol',        'Grasa',       884,  0.0,  0.0,100.0);
