import { createClient } from './supabase/client';
import { DailyTask, SleepLog, ScreenTimeLog, DietLog, StudySession } from './types';

const supabase = createClient();

/**
 * Sync daily task to Supabase
 */
export async function syncDailyTask(task: DailyTask, userId: string) {
  if (!supabase || !userId) return;
  try {
    await supabase.from('daily_tasks').upsert({
      id: task.id.startsWith('t-') || task.id.includes('-') && task.id.length < 32 ? undefined : task.id,
      user_id: userId,
      task_date: task.task_date,
      text: task.text,
      is_complete: task.is_complete,
      locked_at: task.locked_at || null,
    });
  } catch (e) {
    console.warn('Supabase task sync notice:', e);
  }
}

/**
 * Sync sleep log to Supabase
 */
export async function syncSleepLog(log: SleepLog, userId: string) {
  if (!supabase || !userId) return;
  try {
    await supabase.from('sleep_logs').upsert({
      user_id: userId,
      log_date: log.log_date,
      sleep_started_at: log.sleep_started_at,
      wake_at: log.wake_at,
      duration_minutes: log.duration_minutes,
      source: log.source,
      edited: log.edited,
    });
  } catch (e) {
    console.warn('Supabase sleep sync notice:', e);
  }
}

/**
 * Sync screen time log to Supabase
 */
export async function syncScreenTimeLog(log: ScreenTimeLog, userId: string) {
  if (!supabase || !userId) return;
  try {
    await supabase.from('screen_time_logs').upsert({
      user_id: userId,
      log_date: log.log_date,
      minutes: log.minutes,
      proof_image_path: log.proof_image_path || null,
      verified: log.verified,
      source: log.source,
    });
  } catch (e) {
    console.warn('Supabase screen time sync notice:', e);
  }
}

/**
 * Sync diet log to Supabase
 */
export async function syncDietLog(meal: DietLog, userId: string) {
  if (!supabase || !userId) return;
  try {
    await supabase.from('diet_logs').upsert({
      user_id: userId,
      log_date: meal.log_date,
      meal_type: meal.meal_type,
      items_text: meal.items_text,
      gemini_calories: meal.gemini_calories || null,
      gemini_protein_g: meal.gemini_protein_g || null,
      gemini_carbs_g: meal.gemini_carbs_g || null,
      gemini_fat_g: meal.gemini_fat_g || null,
      gemini_summary: meal.gemini_summary || null,
      user_override_calories: meal.user_override_calories || null,
    });
  } catch (e) {
    console.warn('Supabase diet sync notice:', e);
  }
}

/**
 * Sync study session to Supabase
 */
export async function syncStudySession(session: StudySession, userId: string) {
  if (!supabase || !userId) return;
  try {
    await supabase.from('study_sessions').upsert({
      user_id: userId,
      subject_id: session.subject_id && !session.subject_id.startsWith('sub-') ? session.subject_id : null,
      task_note: session.task_note || null,
      started_at: session.started_at,
      ended_at: session.ended_at,
      duration_seconds: session.duration_seconds,
      mode: session.mode,
    });
  } catch (e) {
    console.warn('Supabase study sync notice:', e);
  }
}

/**
 * Sync gym workout set to Supabase
 */
export async function syncWorkoutSet(set: any, userId: string) {
  if (!supabase || !userId) return;
  try {
    await supabase.from('workout_sets').upsert({
      user_id: userId,
      exercise_name: set.exerciseName,
      muscle_group: set.muscleGroup,
      sets: set.sets,
      reps: set.reps,
      weight_kg: set.weightKg || null,
      estimated_calories: set.estimatedCalories || null,
    });
  } catch (e) {
    console.warn('Supabase workout sync notice:', e);
  }
}
