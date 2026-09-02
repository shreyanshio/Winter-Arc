'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { calculateChallengeDay, getLocalTodayDateString } from '@/lib/date-utils';
import { getBulletForIndex } from '@/lib/bullet-palette';
import { TopNav } from '@/components/layout/top-nav';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Moon,
  Smartphone,
  Utensils,
  GraduationCap,
  Dumbbell,
  CheckSquare,
  ArrowRight,
  Flame,
  Shield,
  Clock,
  Sparkles,
  Zap,
} from 'lucide-react';

export default function IndividualCockpitPage() {
  const router = useRouter();
  const { profile, commitments, isOnboarded, isLoading } = useAuth();

  const currentDay = calculateChallengeDay(profile?.challenge_started_at, profile?.timezone);
  const todayStr = getLocalTodayDateString(profile?.timezone);

  // Real summary stats for today (all zero by default)
  const [stats, setStats] = useState({
    sleepHours: 0,
    screenTimeMinutes: 0,
    caloriesLogged: 0,
    calorieTarget: Math.round((profile?.body_weight_kg || 70) * 33),
    studyMinutes: 0,
    workoutCalories: 0,
    stepsCount: 0,
    tasksCompleted: 0,
    tasksTotal: 0,
  });

  useEffect(() => {
    const userId = profile?.id || 'active';

    // 1. Tasks
    const savedTasks = localStorage.getItem(`wa_tasks_${userId}`);
    const tasks = savedTasks ? JSON.parse(savedTasks) : [];
    const todayTasks = tasks.filter((t: any) => t.task_date === todayStr);

    // 2. Sleep
    const savedSleep = localStorage.getItem(`wa_sleep_${userId}`);
    const sleepLogs = savedSleep ? JSON.parse(savedSleep) : [];
    const todaySleep = sleepLogs.find((s: any) => s.log_date === todayStr);

    // 3. Screen time
    const savedScreen = localStorage.getItem(`wa_screentime_${userId}`);
    const screenLogs = savedScreen ? JSON.parse(savedScreen) : [];
    const todayScreen = screenLogs.find((s: any) => s.log_date === todayStr);

    // 4. Diet
    const savedDiet = localStorage.getItem(`wa_diet_${userId}`);
    const meals = savedDiet ? JSON.parse(savedDiet) : [];
    const todayMeals = meals.filter((m: any) => m.log_date === todayStr);
    const totalCalories = todayMeals.reduce((acc: number, m: any) => acc + (m.user_override_calories ?? m.gemini_calories ?? 0), 0);

    // 5. Study
    const savedStudy = localStorage.getItem(`wa_study_${userId}`);
    const studySessions = savedStudy ? JSON.parse(savedStudy) : [];
    const totalStudyMins = studySessions.reduce((acc: number, s: any) => acc + (s.duration_minutes || 0), 0);

    // 6. Gym & Steps
    const savedGym = localStorage.getItem(`wa_gym_${userId}`);
    const gymSets = savedGym ? JSON.parse(savedGym) : [];
    const workoutCal = gymSets.reduce((acc: number, s: any) => acc + (s.estimatedCalories || 0), 0);
    const savedSteps = Number(localStorage.getItem(`wa_steps_${userId}`) || 0);

    setStats({
      sleepHours: todaySleep ? Math.round((todaySleep.duration_minutes / 60) * 10) / 10 : 0,
      screenTimeMinutes: todayScreen?.minutes || 0,
      caloriesLogged: totalCalories,
      calorieTarget: Math.round((profile?.body_weight_kg || 70) * 33),
      studyMinutes: totalStudyMins,
      workoutCalories: workoutCal,
      stepsCount: savedSteps,
      tasksCompleted: todayTasks.filter((t: any) => t.is_complete).length,
      tasksTotal: todayTasks.length,
    });
  }, [profile?.id, todayStr, profile?.body_weight_kg]);

  const cards = [
    {
      title: 'Sleep & Rest',
      value: `${stats.sleepHours} hrs`,
      sub: 'Optimal circadian recovery',
      href: '/app/individual/sleep',
      icon: Moon,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/20',
      badge: 'Attributed to Wake',
    },
    {
      title: 'Daily Screen Time',
      value: `${Math.floor(stats.screenTimeMinutes / 60)}h ${stats.screenTimeMinutes % 60}m`,
      sub: 'Proof screenshot attached',
      href: '/app/individual/screen-time',
      icon: Smartphone,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20',
      badge: 'Verified',
    },
    {
      title: 'Health & Diet (AI)',
      value: `${stats.caloriesLogged} kcal`,
      sub: `${stats.caloriesLogged - stats.calorieTarget > 0 ? '+' : ''}${
        stats.caloriesLogged - stats.calorieTarget
      } kcal vs TDEE`,
      href: '/app/individual/diet',
      icon: Utensils,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      badge: 'Gemini Flash',
    },
    {
      title: 'Study Chamber',
      value: `${Math.floor(stats.studyMinutes / 60)}h ${stats.studyMinutes % 60}m`,
      sub: 'Wall-clock tracked',
      href: '/app/individual/study',
      icon: GraduationCap,
      color: 'text-sky-400',
      bg: 'bg-sky-500/10',
      border: 'border-sky-500/20',
      badge: 'JEE / Science',
    },
    {
      title: 'Gym & Workouts',
      value: `${stats.workoutCalories} kcal`,
      sub: `${stats.stepsCount.toLocaleString()} steps logged`,
      href: '/app/individual/gym',
      icon: Dumbbell,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      badge: 'MET Estimated',
    },
    {
      title: 'Daily Tasks',
      value: `${stats.tasksCompleted}/${stats.tasksTotal}`,
      sub: 'Locks at 12:00 AM local',
      href: '/app/individual/tasks',
      icon: CheckSquare,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/20',
      badge: 'Midnight Lock',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Hero Banner */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-glass">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="cyan">WINTER ARC DAY {currentDay}</Badge>
              <span className="text-xs text-gray-400 font-mono">
                {profile?.timezone} • {todayStr}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Welcome to the Arena, {profile?.display_name || 'Warrior'}
            </h1>
            <p className="text-sm text-gray-400 mt-1 max-w-2xl">
              All metrics logged here sync in real-time (&lt;3s) to the community.
              Complete your daily tasks before the 12:00 AM midnight lock.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link href="/app/individual/tasks">
              <Button variant="primary" size="md" className="gap-2">
                <CheckSquare className="w-4 h-4" />
                <span>Today's Tasks</span>
              </Button>
            </Link>
            <Link href="/app/individual/gym">
              <Button variant="secondary" size="md" className="gap-2">
                <Dumbbell className="w-4 h-4" />
                <span>Log Workout</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.title} href={card.href} className="group">
                <Card
                  hoverEffect
                  className="h-full border-white/[0.08] group-hover:border-primary/40 transition-all p-5"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-2.5 rounded-xl ${card.bg} ${card.color} border ${card.border}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      {card.badge}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      {card.title}
                    </h3>
                    <div className="text-2xl font-bold text-white font-mono mt-1">
                      {card.value}
                    </div>
                    <div className="text-xs text-gray-400 mt-1 flex items-center justify-between">
                      <span>{card.sub}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Pledged Commitments Showcase */}
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold text-white">Your Public Commitments</h2>
            </div>
            <Link href="/onboarding">
              <Button variant="ghost" size="sm" className="text-xs text-primary hover:text-primary">
                Edit Pledges
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {commitments.map((comm, idx) => {
              const marker = getBulletForIndex(idx);
              return (
                <div
                  key={comm.id || idx}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]"
                >
                  <div
                    className={`w-6 h-6 rounded-md border flex items-center justify-center font-bold text-xs shrink-0 ${marker.bg} ${marker.border} ${marker.text}`}
                  >
                    {marker.glyph}
                  </div>
                  <span className="text-xs text-gray-200 truncate">{comm.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
