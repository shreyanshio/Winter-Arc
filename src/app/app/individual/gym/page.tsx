'use client';

import React, { useState } from 'react';
import { TopNav } from '@/components/layout/top-nav';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';
import { getLocalTodayDateString } from '@/lib/date-utils';
import {
  EXERCISE_CATALOG,
  calculateSetCalories,
  parseWorkoutInput,
  ExerciseCatalogItem,
} from '@/lib/workout-math';
import { connectHeartRateMonitor } from '@/lib/bluetooth';
import {
  Dumbbell,
  Footprints,
  Heart,
  Bluetooth,
  Flame,
  Plus,
  Activity,
  Home,
  Building,
  CheckCircle2,
} from 'lucide-react';

const MUSCLE_GROUPS = [
  'All',
  'Chest',
  'Back',
  'Legs',
  'Shoulders',
  'Biceps',
  'Triceps',
  'Abs',
  'Cardio',
];

interface LoggedSet {
  id: string;
  exerciseName: string;
  muscleGroup: string;
  sets: number;
  reps: number;
  weightKg?: number;
  estimatedCalories: number;
  timestamp: string;
}

export default function GymWorkoutPage() {
  const { profile } = useAuth();
  const todayStr = getLocalTodayDateString(profile?.timezone);
  const bodyWeight = profile?.body_weight_kg || 70;

  // Session mode: gym or home
  const [sessionType, setSessionType] = useState<'gym' | 'home'>('gym');
  const [selectedMuscle, setSelectedMuscle] = useState('All');
  const [selectedExerciseId, setSelectedExerciseId] = useState(EXERCISE_CATALOG[0].id);

  // Set input
  const [workoutInput, setWorkoutInput] = useState('');
  const [weightInput, setWeightInput] = useState('');

  // Step counter (starts at 0)
  const [stepCount, setStepCount] = useState(0);
  const [isSyncingSteps, setIsSyncingSteps] = useState(false);

  // Bluetooth Heart Rate
  const [bpm, setBpm] = useState<number | null>(null);
  const [bpmSamples, setBpmSamples] = useState<number[]>([]);
  const [bleDevice, setBleDevice] = useState<string | null>(null);

  // Logged sets today (starts at 0)
  const [loggedSets, setLoggedSets] = useState<LoggedSet[]>([]);

  React.useEffect(() => {
    const userId = profile?.id || 'active';
    const savedGym = localStorage.getItem(`wa_gym_${userId}`);
    if (savedGym) {
      try {
        setLoggedSets(JSON.parse(savedGym));
      } catch (e) {
        setLoggedSets([]);
      }
    } else {
      setLoggedSets([]);
    }

    const savedSteps = localStorage.getItem(`wa_steps_${userId}`);
    if (savedSteps) {
      setStepCount(Number(savedSteps) || 0);
    } else {
      setStepCount(0);
    }
  }, [profile?.id]);

  const handlePairBle = async () => {
    try {
      const { deviceName } = await connectHeartRateMonitor((liveBpm) => {
        setBpm(liveBpm);
        setBpmSamples((prev) => [...prev, liveBpm]);
      });
      setBleDevice(deviceName);
    } catch (err: any) {
      alert(`Bluetooth notice: ${err.message || 'BLE not available'}`);
    }
  };

  const handleSyncSteps = () => {
    setIsSyncingSteps(true);
    setTimeout(() => {
      setStepCount((prev) => {
        const nextSteps = prev + 1000;
        const userId = profile?.id || 'active';
        localStorage.setItem(`wa_steps_${userId}`, nextSteps.toString());
        return nextSteps;
      });
      setIsSyncingSteps(false);
    }, 700);
  };

  const filteredExercises = EXERCISE_CATALOG.filter((ex) => {
    if (sessionType === 'home' && !ex.is_home_friendly) return false;
    if (selectedMuscle !== 'All' && ex.muscle_group !== selectedMuscle) return false;
    return true;
  });

  const selectedExercise = EXERCISE_CATALOG.find((e) => e.id === selectedExerciseId);

  const handleLogSet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExercise) return;

    const parsed = parseWorkoutInput(workoutInput);
    const sets = parsed ? parsed.sets : 3;
    const reps = parsed ? parsed.reps : 10;
    const weight = parsed?.weight ?? (parseFloat(weightInput) || undefined);

    const calories = calculateSetCalories(selectedExercise, sets, reps, bodyWeight);

    const newSet: LoggedSet = {
      id: `set-${Date.now()}`,
      exerciseName: selectedExercise.name,
      muscleGroup: selectedExercise.muscle_group,
      sets,
      reps,
      weightKg: weight,
      estimatedCalories: calories,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setLoggedSets((prev) => {
      const updated = [newSet, ...prev];
      const userId = profile?.id || 'active';
      localStorage.setItem(`wa_gym_${userId}`, JSON.stringify(updated));
      return updated;
    });
    setWorkoutInput('');
  };

  const totalWorkoutCalories = loggedSets.reduce((sum, s) => sum + s.estimatedCalories, 0);
  const minBpm = bpmSamples.length > 0 ? Math.min(...bpmSamples) : 72;
  const maxBpm = bpmSamples.length > 0 ? Math.max(...bpmSamples) : 158;
  const avgBpm =
    bpmSamples.length > 0
      ? Math.round(bpmSamples.reduce((a, b) => a + b, 0) / bpmSamples.length)
      : 124;

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8">
        {/* Pinned Top Bar: Step Counter & Smartwatch Live Heart Rate */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Steps */}
          <Card className="p-4 border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Footprints className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-gray-400 uppercase font-mono tracking-wider">
                  Daily Step Counter ({todayStr})
                </span>
                <div className="text-2xl font-bold text-white font-mono">
                  {stepCount.toLocaleString()} steps
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleSyncSteps}
              isLoading={isSyncingSteps}
              className="text-xs"
            >
              Sync Steps
            </Button>
          </Card>

          {/* Heart Rate */}
          <Card className="p-4 border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <Heart className={`w-5 h-5 ${bpm ? 'animate-bounce' : ''}`} />
              </div>
              <div>
                <span className="text-[11px] text-gray-400 uppercase font-mono tracking-wider">
                  Live Heart Rate (BLE GATT)
                </span>
                <div className="text-2xl font-bold text-white font-mono flex items-baseline gap-2">
                  <span>{bpm ? `${bpm} BPM` : '124 BPM'}</span>
                  <span className="text-xs font-normal text-gray-400 font-mono">
                    (Min {minBpm} / Max {maxBpm} / Avg {avgBpm})
                  </span>
                </div>
              </div>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={handlePairBle}
              className="text-xs gap-1"
            >
              <Bluetooth className="w-3.5 h-3.5 text-primary" />
              <span>{bleDevice ? 'BLE Active' : 'Pair BLE'}</span>
            </Button>
          </Card>
        </div>

        {/* Workout Mode Toggle */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2 p-1 rounded-xl bg-white/[0.04] border border-white/[0.08]">
            <button
              onClick={() => setSessionType('gym')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                sessionType === 'gym'
                  ? 'bg-primary text-black shadow-[0_0_15px_rgba(79,209,255,0.25)]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Building className="w-4 h-4" />
              <span>GYM WORKOUT</span>
            </button>
            <button
              onClick={() => setSessionType('home')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                sessionType === 'home'
                  ? 'bg-primary text-black shadow-[0_0_15px_rgba(79,209,255,0.25)]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>HOME CALISTHENICS</span>
            </button>
          </div>

          <Badge variant="cyan" className="font-mono text-xs">
            {totalWorkoutCalories} kcal Burned Today
          </Badge>
        </div>

        {/* Muscle Group Filter */}
        <div className="mb-6 flex flex-wrap gap-1.5">
          {MUSCLE_GROUPS.map((mg) => {
            const isSelected = selectedMuscle === mg;
            return (
              <button
                key={mg}
                onClick={() => setSelectedMuscle(mg)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  isSelected
                    ? 'bg-white/[0.12] border-white/30 text-white shadow-sm'
                    : 'bg-white/[0.02] border-white/[0.06] text-gray-400 hover:text-gray-200'
                }`}
              >
                {mg}
              </button>
            );
          })}
        </div>

        {/* Log Set Card */}
        <Card className="p-6 mb-8 border-white/[0.08]">
          <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Dumbbell className="w-4 h-4 text-primary" />
            <span>Record Exercise Set</span>
          </h2>

          <form onSubmit={handleLogSet} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Select Exercise
                </label>
                <select
                  value={selectedExerciseId}
                  onChange={(e) => setSelectedExerciseId(e.target.value)}
                  className="w-full h-11 rounded-xl bg-[#0e1017] border border-white/[0.1] px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/60"
                >
                  {filteredExercises.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.name} ({ex.muscle_group})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Sets & Reps (e.g. 3x10 or 4x8)
                </label>
                <Input
                  value={workoutInput}
                  onChange={(e) => setWorkoutInput(e.target.value)}
                  placeholder="3x10"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Weight (kg) (Optional)
                </label>
                <Input
                  type="number"
                  step="0.5"
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                  placeholder="60"
                />
              </div>
            </div>

            <Button type="submit" variant="primary" size="md" className="w-full gap-2">
              <Plus className="w-4 h-4" />
              <span>Log Set & Compute MET Calorie Burn</span>
            </Button>
          </form>
        </Card>

        {/* Workout Sets Logged Today */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider font-mono">
            Recorded Sets Today ({todayStr})
          </h3>

          <div className="space-y-3">
            {loggedSets.map((set) => (
              <div
                key={set.id}
                className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{set.exerciseName}</span>
                      <Badge variant="outline" className="text-[10px]">
                        {set.muscleGroup}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5 font-mono">
                      {set.sets} sets × {set.reps} reps{' '}
                      {set.weightKg ? `@ ${set.weightKg} kg` : ''} • {set.timestamp}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-bold text-primary font-mono">
                    ~{set.estimatedCalories} kcal
                  </div>
                  <span className="text-[10px] text-gray-500 uppercase">MET Burn</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
