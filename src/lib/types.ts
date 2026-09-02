export interface Profile {
  id: string;
  display_name: string;
  avatar_url?: string | null;
  telegram_id?: number | null;
  timezone: string;
  challenge_started_at?: string | null;
  body_weight_kg?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface Commitment {
  id: string;
  user_id: string;
  text: string;
  sort_order: number;
  created_at?: string;
}

export interface DailyTask {
  id: string;
  user_id: string;
  task_date: string;
  text: string;
  is_complete: boolean;
  locked_at?: string | null;
  created_at?: string;
}

export interface SleepLog {
  id: string;
  user_id: string;
  sleep_started_at: string;
  wake_at?: string | null;
  duration_minutes?: number | null;
  source: 'manual' | 'bluetooth';
  edited: boolean;
  log_date: string;
  created_at?: string;
}

export interface ScreenTimeLog {
  id: string;
  user_id: string;
  log_date: string;
  minutes: number;
  proof_image_path?: string | null;
  verified: boolean;
  source: 'manual' | 'api';
  created_at?: string;
}

export interface DietLog {
  id: string;
  user_id: string;
  log_date: string;
  meal_type: 'breakfast' | 'lunch' | 'snacks' | 'dinner';
  items_text: string;
  gemini_calories?: number | null;
  gemini_protein_g?: number | null;
  gemini_carbs_g?: number | null;
  gemini_fat_g?: number | null;
  gemini_summary?: string | null;
  user_override_calories?: number | null;
  created_at?: string;
}

export interface StudySubject {
  id: string;
  user_id: string;
  stream: string;
  name: string;
  is_custom: boolean;
  archived: boolean;
  created_at?: string;
}

export interface StudySession {
  id: string;
  user_id: string;
  subject_id: string;
  task_note?: string | null;
  started_at: string;
  ended_at?: string | null;
  duration_seconds?: number | null;
  mode: 'freeform' | 'pomodoro';
  created_at?: string;
}

export interface Exercise {
  id: string;
  muscle_group: string;
  name: string;
  is_home_friendly: boolean;
}

export interface WorkoutSession {
  id: string;
  user_id: string;
  log_date: string;
  session_type: 'gym' | 'home';
  avg_heart_rate?: number | null;
  min_heart_rate?: number | null;
  max_heart_rate?: number | null;
  steps?: number | null;
  total_calories?: number | null;
  created_at?: string;
  sets?: WorkoutSet[];
}

export interface WorkoutSet {
  id: string;
  session_id: string;
  exercise_id: string;
  sets: number;
  reps: number;
  weight_kg?: number | null;
  estimated_calories?: number | null;
  created_at?: string;
  exercise?: Exercise;
}

export interface StepLog {
  id: string;
  user_id: string;
  log_date: string;
  step_count: number;
  source: 'manual' | 'google_health' | 'google_fit';
  created_at?: string;
}

export interface MemberSummary {
  profile: Profile;
  commitmentsCount: number;
  commitmentsSample: string[];
  currentDay: number;
  todayTasksCompleted: number;
  todayTasksTotal: number;
  studyMinutesToday: number;
  caloriesBurnedToday: number;
  sleepHoursToday: number;
}
