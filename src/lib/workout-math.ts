export interface ExerciseCatalogItem {
  id: string;
  muscle_group: string;
  name: string;
  is_home_friendly: boolean;
  default_met: number;
}

export const EXERCISE_CATALOG: ExerciseCatalogItem[] = [
  // Abs
  { id: 'abs-1', muscle_group: 'Abs', name: 'Ab-Wheel Rollout', is_home_friendly: false, default_met: 5.5 },
  { id: 'abs-2', muscle_group: 'Abs', name: 'Cable Crunch', is_home_friendly: false, default_met: 5.0 },
  { id: 'abs-3', muscle_group: 'Abs', name: 'Crunch', is_home_friendly: true, default_met: 4.5 },
  { id: 'abs-4', muscle_group: 'Abs', name: 'Crunch Machine', is_home_friendly: false, default_met: 4.5 },
  { id: 'abs-5', muscle_group: 'Abs', name: 'Decline Crunch', is_home_friendly: false, default_met: 5.0 },
  { id: 'abs-6', muscle_group: 'Abs', name: 'Dragon Flag', is_home_friendly: true, default_met: 7.0 },
  { id: 'abs-7', muscle_group: 'Abs', name: 'Hanging Knee Raise', is_home_friendly: false, default_met: 5.5 },
  { id: 'abs-8', muscle_group: 'Abs', name: 'Hanging Leg Raise', is_home_friendly: false, default_met: 6.0 },
  { id: 'abs-9', muscle_group: 'Abs', name: 'Plank', is_home_friendly: true, default_met: 4.0 },
  { id: 'abs-10', muscle_group: 'Abs', name: 'Side Plank', is_home_friendly: true, default_met: 4.0 },
  { id: 'abs-11', muscle_group: 'Abs', name: 'Bicycle Crunch', is_home_friendly: true, default_met: 5.0 },
  { id: 'abs-12', muscle_group: 'Abs', name: 'Russian Twist', is_home_friendly: true, default_met: 4.8 },

  // Back
  { id: 'back-1', muscle_group: 'Back', name: 'Barbell Row', is_home_friendly: false, default_met: 6.5 },
  { id: 'back-2', muscle_group: 'Back', name: 'Barbell Shrug', is_home_friendly: false, default_met: 5.0 },
  { id: 'back-3', muscle_group: 'Back', name: 'Chin Up', is_home_friendly: true, default_met: 7.0 },
  { id: 'back-4', muscle_group: 'Back', name: 'Deadlift', is_home_friendly: false, default_met: 8.0 },
  { id: 'back-5', muscle_group: 'Back', name: 'Dumbbell Row', is_home_friendly: false, default_met: 6.0 },
  { id: 'back-6', muscle_group: 'Back', name: 'Good Morning', is_home_friendly: false, default_met: 5.5 },
  { id: 'back-7', muscle_group: 'Back', name: 'Hammer Strength Row', is_home_friendly: false, default_met: 5.5 },
  { id: 'back-8', muscle_group: 'Back', name: 'Lat Pulldown', is_home_friendly: false, default_met: 5.5 },
  { id: 'back-9', muscle_group: 'Back', name: 'Machine Shrug', is_home_friendly: false, default_met: 4.5 },
  { id: 'back-10', muscle_group: 'Back', name: 'Neutral Chin Up', is_home_friendly: true, default_met: 6.8 },
  { id: 'back-11', muscle_group: 'Back', name: 'Pendlay Row', is_home_friendly: false, default_met: 6.5 },
  { id: 'back-12', muscle_group: 'Back', name: 'Pull Up', is_home_friendly: true, default_met: 7.2 },
  { id: 'back-13', muscle_group: 'Back', name: 'Rack Pull', is_home_friendly: false, default_met: 7.0 },
  { id: 'back-14', muscle_group: 'Back', name: 'Seated Cable Row', is_home_friendly: false, default_met: 5.5 },
  { id: 'back-15', muscle_group: 'Back', name: 'Straight-Arm Cable Pushdown', is_home_friendly: false, default_met: 4.8 },
  { id: 'back-16', muscle_group: 'Back', name: 'T-Bar Row', is_home_friendly: false, default_met: 6.5 },
  { id: 'back-17', muscle_group: 'Back', name: 'Doorway Row', is_home_friendly: true, default_met: 5.0 },
  { id: 'back-18', muscle_group: 'Back', name: 'Superman', is_home_friendly: true, default_met: 4.0 },

  // Biceps
  { id: 'bic-1', muscle_group: 'Biceps', name: 'Barbell Curl', is_home_friendly: false, default_met: 5.0 },
  { id: 'bic-2', muscle_group: 'Biceps', name: 'Cable Curl', is_home_friendly: false, default_met: 4.8 },
  { id: 'bic-3', muscle_group: 'Biceps', name: 'Dumbbell Concentration Curl', is_home_friendly: false, default_met: 4.5 },
  { id: 'bic-4', muscle_group: 'Biceps', name: 'Dumbbell Curl', is_home_friendly: false, default_met: 4.8 },
  { id: 'bic-5', muscle_group: 'Biceps', name: 'Dumbbell Hammer Curl', is_home_friendly: false, default_met: 4.8 },
  { id: 'bic-6', muscle_group: 'Biceps', name: 'Dumbbell Preacher Curl', is_home_friendly: false, default_met: 4.5 },
  { id: 'bic-7', muscle_group: 'Biceps', name: 'EZ-Bar Curl', is_home_friendly: false, default_met: 5.0 },
  { id: 'bic-8', muscle_group: 'Biceps', name: 'EZ-Bar Preacher Curl', is_home_friendly: false, default_met: 4.8 },
  { id: 'bic-9', muscle_group: 'Biceps', name: 'Seated Incline Dumbbell Curl', is_home_friendly: false, default_met: 4.8 },
  { id: 'bic-10', muscle_group: 'Biceps', name: 'Seated Machine Curl', is_home_friendly: false, default_met: 4.5 },

  // Cardio
  { id: 'car-1', muscle_group: 'Cardio', name: 'Cycling', is_home_friendly: false, default_met: 8.0 },
  { id: 'car-2', muscle_group: 'Cardio', name: 'Elliptical Trainer', is_home_friendly: false, default_met: 7.5 },
  { id: 'car-3', muscle_group: 'Cardio', name: 'Rowing Machine', is_home_friendly: false, default_met: 8.5 },
  { id: 'car-4', muscle_group: 'Cardio', name: 'Running (Outdoor)', is_home_friendly: true, default_met: 9.8 },
  { id: 'car-5', muscle_group: 'Cardio', name: 'Running (Treadmill)', is_home_friendly: false, default_met: 9.0 },
  { id: 'car-6', muscle_group: 'Cardio', name: 'Stationary Bike', is_home_friendly: false, default_met: 7.5 },
  { id: 'car-7', muscle_group: 'Cardio', name: 'Swimming', is_home_friendly: false, default_met: 8.0 },
  { id: 'car-8', muscle_group: 'Cardio', name: 'Walking', is_home_friendly: true, default_met: 3.8 },
  { id: 'car-9', muscle_group: 'Cardio', name: 'Burpee', is_home_friendly: true, default_met: 9.5 },
  { id: 'car-10', muscle_group: 'Cardio', name: 'Jumping Jack', is_home_friendly: true, default_met: 7.0 },
  { id: 'car-11', muscle_group: 'Cardio', name: 'High Knees', is_home_friendly: true, default_met: 8.5 },
  { id: 'car-12', muscle_group: 'Cardio', name: 'Mountain Climber', is_home_friendly: true, default_met: 8.0 },
  { id: 'car-13', muscle_group: 'Cardio', name: 'Skater Jump', is_home_friendly: true, default_met: 7.5 },

  // Chest
  { id: 'ch-1', muscle_group: 'Chest', name: 'Cable Crossover', is_home_friendly: false, default_met: 5.0 },
  { id: 'ch-2', muscle_group: 'Chest', name: 'Decline Barbell Bench Press', is_home_friendly: false, default_met: 6.5 },
  { id: 'ch-3', muscle_group: 'Chest', name: 'Decline Hammer Strength Chest Press', is_home_friendly: false, default_met: 5.5 },
  { id: 'ch-4', muscle_group: 'Chest', name: 'Flat Barbell Bench Press', is_home_friendly: false, default_met: 6.8 },
  { id: 'ch-5', muscle_group: 'Chest', name: 'Flat Dumbbell Bench Press', is_home_friendly: false, default_met: 6.5 },
  { id: 'ch-6', muscle_group: 'Chest', name: 'Flat Dumbbell Fly', is_home_friendly: false, default_met: 5.0 },
  { id: 'ch-7', muscle_group: 'Chest', name: 'Incline Barbell Bench Press', is_home_friendly: false, default_met: 6.8 },
  { id: 'ch-8', muscle_group: 'Chest', name: 'Incline Dumbbell Bench Press', is_home_friendly: false, default_met: 6.5 },
  { id: 'ch-9', muscle_group: 'Chest', name: 'Incline Dumbbell Fly', is_home_friendly: false, default_met: 5.0 },
  { id: 'ch-10', muscle_group: 'Chest', name: 'Incline Hammer Strength Chest Press', is_home_friendly: false, default_met: 5.5 },
  { id: 'ch-11', muscle_group: 'Chest', name: 'Seated Machine Fly', is_home_friendly: false, default_met: 4.8 },
  { id: 'ch-12', muscle_group: 'Chest', name: 'Push Up', is_home_friendly: true, default_met: 6.0 },
  { id: 'ch-13', muscle_group: 'Chest', name: 'Diamond Push Up', is_home_friendly: true, default_met: 6.5 },

  // Legs
  { id: 'leg-1', muscle_group: 'Legs', name: 'Barbell Calf Raise', is_home_friendly: false, default_met: 4.5 },
  { id: 'leg-2', muscle_group: 'Legs', name: 'Barbell Front Squat', is_home_friendly: false, default_met: 7.5 },
  { id: 'leg-3', muscle_group: 'Legs', name: 'Barbell Glute Bridge', is_home_friendly: false, default_met: 6.0 },
  { id: 'leg-4', muscle_group: 'Legs', name: 'Barbell Squat', is_home_friendly: false, default_met: 7.8 },
  { id: 'leg-5', muscle_group: 'Legs', name: 'Donkey Calf Raise', is_home_friendly: true, default_met: 4.5 },
  { id: 'leg-6', muscle_group: 'Legs', name: 'Glute-Ham Raise', is_home_friendly: false, default_met: 6.0 },
  { id: 'leg-7', muscle_group: 'Legs', name: 'Leg Extension Machine', is_home_friendly: false, default_met: 5.0 },
  { id: 'leg-8', muscle_group: 'Legs', name: 'Leg Press', is_home_friendly: false, default_met: 6.5 },
  { id: 'leg-9', muscle_group: 'Legs', name: 'Lying Leg Curl Machine', is_home_friendly: false, default_met: 5.0 },
  { id: 'leg-10', muscle_group: 'Legs', name: 'Romanian Deadlift', is_home_friendly: false, default_met: 7.0 },
  { id: 'leg-11', muscle_group: 'Legs', name: 'Seated Calf Raise Machine', is_home_friendly: false, default_met: 4.5 },
  { id: 'leg-12', muscle_group: 'Legs', name: 'Seated Leg Curl Machine', is_home_friendly: false, default_met: 5.0 },
  { id: 'leg-13', muscle_group: 'Legs', name: 'Standing Calf Raise Machine', is_home_friendly: false, default_met: 4.8 },
  { id: 'leg-14', muscle_group: 'Legs', name: 'Stiff-Legged Deadlift', is_home_friendly: false, default_met: 7.0 },
  { id: 'leg-15', muscle_group: 'Legs', name: 'Sumo Deadlift', is_home_friendly: false, default_met: 7.8 },
  { id: 'leg-16', muscle_group: 'Legs', name: 'Bodyweight Squat', is_home_friendly: true, default_met: 5.5 },
  { id: 'leg-17', muscle_group: 'Legs', name: 'Jump Squat', is_home_friendly: true, default_met: 8.0 },
  { id: 'leg-18', muscle_group: 'Legs', name: 'Lunge', is_home_friendly: true, default_met: 6.0 },
  { id: 'leg-19', muscle_group: 'Legs', name: 'Bulgarian Split Squat', is_home_friendly: true, default_met: 6.8 },
  { id: 'leg-20', muscle_group: 'Legs', name: 'Wall Sit', is_home_friendly: true, default_met: 4.2 },
  { id: 'leg-21', muscle_group: 'Legs', name: 'Bodyweight Calf Raise', is_home_friendly: true, default_met: 4.0 },

  // Shoulders
  { id: 'sh-1', muscle_group: 'Shoulders', name: 'Arnold Dumbbell Press', is_home_friendly: false, default_met: 6.0 },
  { id: 'sh-2', muscle_group: 'Shoulders', name: 'Behind The Neck Barbell Press', is_home_friendly: false, default_met: 6.0 },
  { id: 'sh-3', muscle_group: 'Shoulders', name: 'Cable Face Pull', is_home_friendly: false, default_met: 4.8 },
  { id: 'sh-4', muscle_group: 'Shoulders', name: 'Front Dumbbell Raise', is_home_friendly: false, default_met: 4.8 },
  { id: 'sh-5', muscle_group: 'Shoulders', name: 'Hammer Strength Shoulder Press', is_home_friendly: false, default_met: 5.5 },
  { id: 'sh-6', muscle_group: 'Shoulders', name: 'Lateral Dumbbell Raise', is_home_friendly: false, default_met: 4.8 },
  { id: 'sh-7', muscle_group: 'Shoulders', name: 'Lateral Machine Raise', is_home_friendly: false, default_met: 4.5 },
  { id: 'sh-8', muscle_group: 'Shoulders', name: 'Log Press', is_home_friendly: false, default_met: 7.0 },
  { id: 'sh-9', muscle_group: 'Shoulders', name: 'One-Arm Standing Dumbbell Press', is_home_friendly: false, default_met: 6.0 },
  { id: 'sh-10', muscle_group: 'Shoulders', name: 'Overhead Press', is_home_friendly: false, default_met: 6.8 },
  { id: 'sh-11', muscle_group: 'Shoulders', name: 'Push Press', is_home_friendly: false, default_met: 7.2 },
  { id: 'sh-12', muscle_group: 'Shoulders', name: 'Rear Delt Dumbbell Raise', is_home_friendly: false, default_met: 4.8 },
  { id: 'sh-13', muscle_group: 'Shoulders', name: 'Rear Delt Machine Fly', is_home_friendly: false, default_met: 4.8 },
  { id: 'sh-14', muscle_group: 'Shoulders', name: 'Seated Dumbbell Lateral Raise', is_home_friendly: false, default_met: 4.8 },
  { id: 'sh-15', muscle_group: 'Shoulders', name: 'Seated Dumbbell Press', is_home_friendly: false, default_met: 6.0 },
  { id: 'sh-16', muscle_group: 'Shoulders', name: 'Smith Machine Overhead Press', is_home_friendly: false, default_met: 5.8 },
  { id: 'sh-17', muscle_group: 'Shoulders', name: 'Pike Push Up', is_home_friendly: true, default_met: 6.5 },
  { id: 'sh-18', muscle_group: 'Shoulders', name: 'Bear Crawl', is_home_friendly: true, default_met: 7.0 },

  // Triceps
  { id: 'tri-1', muscle_group: 'Triceps', name: 'Cable Overhead Triceps Extension', is_home_friendly: false, default_met: 5.0 },
  { id: 'tri-2', muscle_group: 'Triceps', name: 'Close Grip Barbell Bench Press', is_home_friendly: false, default_met: 6.5 },
  { id: 'tri-3', muscle_group: 'Triceps', name: 'Dumbbell Overhead Triceps Extension', is_home_friendly: false, default_met: 4.8 },
  { id: 'tri-4', muscle_group: 'Triceps', name: 'EZ-Bar Skullcrusher', is_home_friendly: false, default_met: 5.0 },
  { id: 'tri-5', muscle_group: 'Triceps', name: 'Lying Triceps Extension', is_home_friendly: false, default_met: 5.0 },
  { id: 'tri-6', muscle_group: 'Triceps', name: 'Parallel Bar Triceps Dip', is_home_friendly: true, default_met: 6.8 },
  { id: 'tri-7', muscle_group: 'Triceps', name: 'Ring Dip', is_home_friendly: true, default_met: 7.2 },
  { id: 'tri-8', muscle_group: 'Triceps', name: 'Rope Push Down', is_home_friendly: false, default_met: 4.8 },
  { id: 'tri-9', muscle_group: 'Triceps', name: 'Smith Machine Close Grip Bench Press', is_home_friendly: false, default_met: 5.8 },
  { id: 'tri-10', muscle_group: 'Triceps', name: 'V-Bar Push Down', is_home_friendly: false, default_met: 4.8 },
  { id: 'tri-11', muscle_group: 'Triceps', name: 'Chair Tricep Dip', is_home_friendly: true, default_met: 5.5 },
];

/**
 * Calculates estimated calories burned using standard MET formula:
 * calories = MET * weight_kg * (seconds / 3600)
 * Assuming an average set takes ~3.5 seconds per repetition + 45s rest recovery impact.
 */
export function calculateSetCalories(
  exercise: ExerciseCatalogItem | undefined,
  sets: number,
  reps: number,
  weightKg: number = 70
): number {
  const met = exercise?.default_met || 5.0;
  // Estimate time: ~3.5 seconds under active tension per rep + proportional active set work
  const estimatedSeconds = sets * (reps * 3.5 + 20);
  const hours = estimatedSeconds / 3600;
  const calories = met * weightKg * hours;
  return Math.max(1, Math.round(calories));
}

/**
 * Parses a workout set format like "2x8", "4 x 12", "3x10@60kg"
 */
export function parseWorkoutInput(input: string): { sets: number; reps: number; weight?: number } | null {
  const clean = input.trim().toLowerCase();
  const match = clean.match(/^(\d+)\s*(?:x|\*)\s*(\d+)(?:\s*(?:@|at)\s*(\d+(?:\.\d+)?))?/);
  if (!match) return null;

  return {
    sets: parseInt(match[1], 10),
    reps: parseInt(match[2], 10),
    weight: match[3] ? parseFloat(match[3]) : undefined,
  };
}
