'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { TopNav } from '@/components/layout/top-nav';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';
import {
  BarChart3,
  Moon,
  Smartphone,
  Utensils,
  GraduationCap,
  Dumbbell,
  CheckSquare,
  ArrowRight,
  Activity,
} from 'lucide-react';

export default function RecordsHubPage() {
  const { profile } = useAuth();
  const [counts, setCounts] = useState({
    sleep: 0,
    screentime: 0,
    diet: 0,
    study: 0,
    gym: 0,
    tasks: 0,
  });

  useEffect(() => {
    const userId = profile?.id || 'active';
    const sleep = JSON.parse(localStorage.getItem(`wa_sleep_${userId}`) || '[]');
    const screen = JSON.parse(localStorage.getItem(`wa_screentime_${userId}`) || '[]');
    const diet = JSON.parse(localStorage.getItem(`wa_diet_${userId}`) || '[]');
    const study = JSON.parse(localStorage.getItem(`wa_study_${userId}`) || '[]');
    const gym = JSON.parse(localStorage.getItem(`wa_gym_${userId}`) || '[]');
    const tasks = JSON.parse(localStorage.getItem(`wa_tasks_${userId}`) || '[]');

    setCounts({
      sleep: sleep.length,
      screentime: screen.length,
      diet: diet.length,
      study: study.length,
      gym: gym.length,
      tasks: tasks.length,
    });
  }, [profile?.id]);

  const activities = [
    {
      id: 'sleep',
      title: 'Sleep & Circadian Duration',
      desc: 'Historical sleep length, bedtimes, and wake efficiency trends',
      icon: Moon,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/20',
      stat: `${counts.sleep} logged`,
      trend: counts.sleep > 0 ? 'Active logs' : '0 logs recorded',
    },
    {
      id: 'screen-time',
      title: 'Screen Time Discipline',
      desc: 'Daily device usage, verification proofs, and dopamine control',
      icon: Smartphone,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20',
      stat: `${counts.screentime} logged`,
      trend: counts.screentime > 0 ? 'Verified proofs' : '0 logs recorded',
    },
    {
      id: 'diet',
      title: 'Caloric Intake & Macros',
      desc: 'Energy surplus/deficit trends and macronutrient composition',
      icon: Utensils,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      stat: `${counts.diet} meals`,
      trend: counts.diet > 0 ? 'Nutrition tracked' : '0 meals recorded',
    },
    {
      id: 'study',
      title: 'Academic & Focus Hours',
      desc: 'Deep work duration broken down across streams and subjects',
      icon: GraduationCap,
      color: 'text-sky-400',
      bg: 'bg-sky-500/10',
      border: 'border-sky-500/20',
      stat: `${counts.study} sessions`,
      trend: counts.study > 0 ? 'Focus tracked' : '0 sessions recorded',
    },
    {
      id: 'gym',
      title: 'Workout Volume & Calorie Burn',
      desc: 'Muscle group distribution, sets, reps, and MET expenditure',
      icon: Dumbbell,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      stat: `${counts.gym} sets`,
      trend: counts.gym > 0 ? 'Volume logged' : '0 sets recorded',
    },
    {
      id: 'tasks',
      title: 'Daily Task Execution Rate',
      desc: 'Adherence history and locked midnight completion streaks',
      icon: CheckSquare,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/20',
      stat: `${counts.tasks} tasks`,
      trend: counts.tasks > 0 ? 'Midnight tracked' : '0 tasks scheduled',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#08090B]">
      <TopNav />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="cyan" className="bg-neon/10 text-neon border-neon/30 font-mono">
              ANALYTICS & AUDIT
            </Badge>
            <span className="text-xs text-gray-400 font-mono">Real Historical Records</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl text-white tracking-wide uppercase">
            Records & Performance
          </h1>
          <p className="text-sm text-gray-400 mt-1 font-sans">
            Select an activity category to inspect interactive charts and real data ledgers.
          </p>
        </div>

        {/* Activity Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {activities.map((act) => {
            const Icon = act.icon;
            return (
              <Link key={act.id} href={`/app/records/${act.id}`} className="group">
                <Card
                  hoverEffect
                  className="p-6 border-white/[0.08] h-full flex flex-col justify-between group-hover:border-neon/40 transition-all bg-[#0e120d]/80 backdrop-blur-xl"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-xl ${act.bg} ${act.color} border ${act.border}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <Badge variant="outline" className="text-[10px] font-mono border-white/15">
                        {act.stat}
                      </Badge>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-neon transition-colors font-mono">
                      {act.title}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1.5 leading-relaxed font-sans">
                      {act.desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs text-gray-400 font-mono">
                    <span>{act.trend}</span>
                    <span className="flex items-center text-neon font-bold group-hover:translate-x-1 transition-transform">
                      <span>View Charts</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </span>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
