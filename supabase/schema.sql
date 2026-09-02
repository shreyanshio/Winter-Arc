-- ==============================================================================
-- WINTER ARC CHALLENGE — PRODUCTION SUPABASE SCHEMA & RLS
-- ==============================================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. PROFILES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  telegram_id BIGINT UNIQUE,
  timezone TEXT DEFAULT 'UTC',
  challenge_started_at TIMESTAMPTZ,
  body_weight_kg NUMERIC(5,2) DEFAULT 70.0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 2. COMMITMENTS (Onboarding Gate: 5 to 20 commitments)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.commitments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. DAILY TASKS (Strict Midnight Lock)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.daily_tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  task_date DATE NOT NULL,
  text TEXT NOT NULL,
  is_complete BOOLEAN DEFAULT FALSE,
  locked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Midnight task lock trigger: Prevents updating is_complete once locked or past local date
CREATE OR REPLACE FUNCTION public.check_task_lock()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.locked_at IS NOT NULL THEN
    RAISE EXCEPTION 'This task is locked past midnight and cannot be edited.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_check_task_lock ON public.daily_tasks;
CREATE TRIGGER tr_check_task_lock
  BEFORE UPDATE ON public.daily_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.check_task_lock();

-- ------------------------------------------------------------------------------
-- 4. SLEEP LOGS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sleep_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  sleep_started_at TIMESTAMPTZ NOT NULL,
  wake_at TIMESTAMPTZ,
  source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'bluetooth')),
  edited BOOLEAN DEFAULT FALSE,
  log_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 5. SCREEN TIME LOGS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.screen_time_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  log_date DATE NOT NULL,
  minutes INT NOT NULL CHECK (minutes >= 0),
  proof_image_path TEXT,
  verified BOOLEAN DEFAULT FALSE,
  source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'api')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, log_date)
);

-- ------------------------------------------------------------------------------
-- 6. DIET LOGS (Gemini AI Powered)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.diet_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  log_date DATE NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'snacks', 'dinner')),
  items_text TEXT NOT NULL,
  gemini_calories INT,
  gemini_protein_g NUMERIC(5,1),
  gemini_carbs_g NUMERIC(5,1),
  gemini_fat_g NUMERIC(5,1),
  gemini_summary TEXT,
  user_override_calories INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 7. STUDY STREAMS & SUBJECTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.study_streams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL
);

INSERT INTO public.study_streams (id, name) VALUES
  ('science', 'Science'),
  ('commerce', 'Commerce'),
  ('arts', 'Arts'),
  ('jee', 'JEE (Engineering)'),
  ('neet', 'NEET (Medical)')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.study_subjects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  stream TEXT NOT NULL,
  name TEXT NOT NULL,
  is_custom BOOLEAN DEFAULT FALSE,
  archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.study_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES public.study_subjects(id) ON DELETE CASCADE NOT NULL,
  task_note TEXT,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  duration_seconds INT,
  mode TEXT DEFAULT 'freeform' CHECK (mode IN ('freeform', 'pomodoro')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 8. EXERCISE CATALOG & WORKOUTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.exercise_catalog (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  muscle_group TEXT NOT NULL,
  name TEXT NOT NULL UNIQUE,
  is_home_friendly BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS public.workout_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  log_date DATE NOT NULL,
  session_type TEXT DEFAULT 'gym' CHECK (session_type IN ('gym', 'home')),
  avg_heart_rate INT,
  min_heart_rate INT,
  max_heart_rate INT,
  steps INT DEFAULT 0,
  total_calories INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.workout_sets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES public.workout_sessions(id) ON DELETE CASCADE NOT NULL,
  exercise_id UUID REFERENCES public.exercise_catalog(id) ON DELETE CASCADE NOT NULL,
  sets INT NOT NULL CHECK (sets > 0),
  reps INT NOT NULL CHECK (reps > 0),
  weight_kg NUMERIC(5,2),
  estimated_calories NUMERIC(6,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.step_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  log_date DATE NOT NULL,
  step_count INT NOT NULL CHECK (step_count >= 0),
  source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'google_health', 'google_fit')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, log_date)
);

-- ------------------------------------------------------------------------------
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- Social Architecture: SELECT open to all authenticated users, INSERT/UPDATE/DELETE strictly owner
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commitments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sleep_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.screen_time_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diet_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.step_logs ENABLE ROW LEVEL SECURITY;

-- Read policies (All authenticated users can spectate)
CREATE POLICY "Public authenticated can read profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public authenticated can read commitments" ON public.commitments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public authenticated can read tasks" ON public.daily_tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public authenticated can read sleep" ON public.sleep_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public authenticated can read screen time" ON public.screen_time_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public authenticated can read diet" ON public.diet_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public authenticated can read study streams" ON public.study_streams FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public authenticated can read study subjects" ON public.study_subjects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public authenticated can read study sessions" ON public.study_sessions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public authenticated can read exercise catalog" ON public.exercise_catalog FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public authenticated can read workout sessions" ON public.workout_sessions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public authenticated can read workout sets" ON public.workout_sets FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public authenticated can read step logs" ON public.step_logs FOR SELECT TO authenticated USING (true);

-- Write policies (Owner only)
CREATE POLICY "Owner can manage profiles" ON public.profiles FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Owner can manage commitments" ON public.commitments FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owner can manage tasks" ON public.daily_tasks FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owner can manage sleep" ON public.sleep_logs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owner can manage screen time" ON public.screen_time_logs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owner can manage diet" ON public.diet_logs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owner can manage study subjects" ON public.study_subjects FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owner can manage study sessions" ON public.study_sessions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owner can manage workout sessions" ON public.workout_sessions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owner can manage workout sets" ON public.workout_sets FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.workout_sessions s WHERE s.id = session_id AND s.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.workout_sessions s WHERE s.id = session_id AND s.user_id = auth.uid()));
CREATE POLICY "Owner can manage step logs" ON public.step_logs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 10. REALTIME REPLICATION SETUP (<3s cross-user sync)
-- ------------------------------------------------------------------------------
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.commitments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.daily_tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sleep_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.screen_time_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.diet_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.study_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.workout_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.step_logs;

-- ------------------------------------------------------------------------------
-- 11. SEED DATA: DEDUPLICATED EXERCISE CATALOG (Section 12 of Spec)
-- ------------------------------------------------------------------------------
INSERT INTO public.exercise_catalog (muscle_group, name, is_home_friendly) VALUES
  -- Abs
  ('Abs', 'Ab-Wheel Rollout', false),
  ('Abs', 'Cable Crunch', false),
  ('Abs', 'Crunch', true),
  ('Abs', 'Crunch Machine', false),
  ('Abs', 'Decline Crunch', false),
  ('Abs', 'Dragon Flag', true),
  ('Abs', 'Hanging Knee Raise', false),
  ('Abs', 'Hanging Leg Raise', false),
  ('Abs', 'Plank', true),
  ('Abs', 'Side Plank', true),
  ('Abs', 'Bicycle Crunch', true),
  ('Abs', 'Russian Twist', true),

  -- Back
  ('Back', 'Barbell Row', false),
  ('Back', 'Barbell Shrug', false),
  ('Back', 'Chin Up', true),
  ('Back', 'Deadlift', false),
  ('Back', 'Dumbbell Row', false),
  ('Back', 'Good Morning', false),
  ('Back', 'Hammer Strength Row', false),
  ('Back', 'Lat Pulldown', false),
  ('Back', 'Machine Shrug', false),
  ('Back', 'Neutral Chin Up', true),
  ('Back', 'Pendlay Row', false),
  ('Back', 'Pull Up', true),
  ('Back', 'Rack Pull', false),
  ('Back', 'Seated Cable Row', false),
  ('Back', 'Straight-Arm Cable Pushdown', false),
  ('Back', 'T-Bar Row', false),
  ('Back', 'Doorway Row', true),
  ('Back', 'Superman', true),

  -- Biceps
  ('Biceps', 'Barbell Curl', false),
  ('Biceps', 'Cable Curl', false),
  ('Biceps', 'Dumbbell Concentration Curl', false),
  ('Biceps', 'Dumbbell Curl', false),
  ('Biceps', 'Dumbbell Hammer Curl', false),
  ('Biceps', 'Dumbbell Preacher Curl', false),
  ('Biceps', 'EZ-Bar Curl', false),
  ('Biceps', 'EZ-Bar Preacher Curl', false),
  ('Biceps', 'Seated Incline Dumbbell Curl', false),
  ('Biceps', 'Seated Machine Curl', false),

  -- Cardio
  ('Cardio', 'Cycling', false),
  ('Cardio', 'Elliptical Trainer', false),
  ('Cardio', 'Rowing Machine', false),
  ('Cardio', 'Running (Outdoor)', true),
  ('Cardio', 'Running (Treadmill)', false),
  ('Cardio', 'Stationary Bike', false),
  ('Cardio', 'Swimming', false),
  ('Cardio', 'Walking', true),
  ('Cardio', 'Jumping Jack', true),
  ('Cardio', 'Burpee', true),
  ('Cardio', 'High Knees', true),
  ('Cardio', 'Mountain Climber', true),
  ('Cardio', 'Skater Jump', true),

  -- Chest
  ('Chest', 'Cable Crossover', false),
  ('Chest', 'Decline Barbell Bench Press', false),
  ('Chest', 'Decline Hammer Strength Chest Press', false),
  ('Chest', 'Flat Barbell Bench Press', false),
  ('Chest', 'Flat Dumbbell Bench Press', false),
  ('Chest', 'Flat Dumbbell Fly', false),
  ('Chest', 'Incline Barbell Bench Press', false),
  ('Chest', 'Incline Dumbbell Bench Press', false),
  ('Chest', 'Incline Dumbbell Fly', false),
  ('Chest', 'Incline Hammer Strength Chest Press', false),
  ('Chest', 'Seated Machine Fly', false),
  ('Chest', 'Push Up', true),
  ('Chest', 'Diamond Push Up', true),

  -- Legs
  ('Legs', 'Barbell Calf Raise', false),
  ('Legs', 'Barbell Front Squat', false),
  ('Legs', 'Barbell Glute Bridge', false),
  ('Legs', 'Barbell Squat', false),
  ('Legs', 'Donkey Calf Raise', true),
  ('Legs', 'Glute-Ham Raise', false),
  ('Legs', 'Leg Extension Machine', false),
  ('Legs', 'Leg Press', false),
  ('Legs', 'Lying Leg Curl Machine', false),
  ('Legs', 'Romanian Deadlift', false),
  ('Legs', 'Seated Calf Raise Machine', false),
  ('Legs', 'Seated Leg Curl Machine', false),
  ('Legs', 'Standing Calf Raise Machine', false),
  ('Legs', 'Stiff-Legged Deadlift', false),
  ('Legs', 'Sumo Deadlift', false),
  ('Legs', 'Bodyweight Squat', true),
  ('Legs', 'Jump Squat', true),
  ('Legs', 'Lunge', true),
  ('Legs', 'Bulgarian Split Squat', true),
  ('Legs', 'Glute Bridge', true),
  ('Legs', 'Wall Sit', true),
  ('Legs', 'Bodyweight Calf Raise', true),

  -- Shoulders
  ('Shoulders', 'Arnold Dumbbell Press', false),
  ('Shoulders', 'Behind The Neck Barbell Press', false),
  ('Shoulders', 'Cable Face Pull', false),
  ('Shoulders', 'Front Dumbbell Raise', false),
  ('Shoulders', 'Hammer Strength Shoulder Press', false),
  ('Shoulders', 'Lateral Dumbbell Raise', false),
  ('Shoulders', 'Lateral Machine Raise', false),
  ('Shoulders', 'Log Press', false),
  ('Shoulders', 'One-Arm Standing Dumbbell Press', false),
  ('Shoulders', 'Overhead Press', false),
  ('Shoulders', 'Push Press', false),
  ('Shoulders', 'Rear Delt Dumbbell Raise', false),
  ('Shoulders', 'Rear Delt Machine Fly', false),
  ('Shoulders', 'Seated Dumbbell Lateral Raise', false),
  ('Shoulders', 'Seated Dumbbell Press', false),
  ('Shoulders', 'Smith Machine Overhead Press', false),
  ('Shoulders', 'Pike Push Up', true),
  ('Shoulders', 'Bear Crawl', true),

  -- Triceps
  ('Triceps', 'Cable Overhead Triceps Extension', false),
  ('Triceps', 'Close Grip Barbell Bench Press', false),
  ('Triceps', 'Dumbbell Overhead Triceps Extension', false),
  ('Triceps', 'EZ-Bar Skullcrusher', false),
  ('Triceps', 'Lying Triceps Extension', false),
  ('Triceps', 'Parallel Bar Triceps Dip', true),
  ('Triceps', 'Ring Dip', true),
  ('Triceps', 'Rope Push Down', false),
  ('Triceps', 'Smith Machine Close Grip Bench Press', false),
  ('Triceps', 'V-Bar Push Down', false),
  ('Triceps', 'Chair Tricep Dip', true)
ON CONFLICT (name) DO NOTHING;
