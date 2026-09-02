'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { TopNav } from '@/components/layout/top-nav';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  ArrowLeft,
  Calendar,
  Activity,
  PlusCircle,
} from 'lucide-react';

const ACTIVITY_METADATA: Record<string, { title: string; unit: string; metricKey: string; color: string; route: string }> = {
  sleep: {
    title: 'Sleep & Circadian Duration',
    unit: 'Hours',
    metricKey: 'hours',
    color: '#818CF8',
    route: '/app/individual/sleep',
  },
  'screen-time': {
    title: 'Screen Time Discipline',
    unit: 'Minutes',
    metricKey: 'minutes',
    color: '#FB7185',
    route: '/app/individual/screen-time',
  },
  diet: {
    title: 'Caloric Balance vs Target',
    unit: 'kcal',
    metricKey: 'calories',
    color: '#CCFF00',
    route: '/app/individual/diet',
  },
  study: {
    title: 'Academic Focus Hours',
    unit: 'Hours',
    metricKey: 'hours',
    color: '#38BDF8',
    route: '/app/individual/study',
  },
  gym: {
    title: 'Workout Calories & Volume',
    unit: 'kcal',
    metricKey: 'calories',
    color: '#F59E0B',
    route: '/app/individual/gym',
  },
  tasks: {
    title: 'Daily Task Completion Rate',
    unit: '%',
    metricKey: 'rate',
    color: '#4FD1FF',
    route: '/app/individual/tasks',
  },
};

export default function ActivityDetailPage() {
  const params = useParams();
  const activityKey = (params?.activity as string) || 'sleep';
  const meta = ACTIVITY_METADATA[activityKey] || ACTIVITY_METADATA.sleep;

  const { profile } = useAuth();
  const [chartData, setChartData] = useState<any[]>([]);
  const [ledger, setLedger] = useState<any[]>([]);

  useEffect(() => {
    const userId = profile?.id || 'active';

    if (activityKey === 'sleep') {
      const logs = JSON.parse(localStorage.getItem(`wa_sleep_${userId}`) || '[]');
      const formatted = logs.map((l: any) => ({
        date: l.log_date || 'Today',
        hours: Math.round((l.duration_minutes / 60) * 10) / 10,
      }));
      setChartData(formatted);
      setLedger(logs.map((l: any) => ({
        date: l.log_date || 'Today',
        detail: `${l.source === 'bluetooth' ? 'Bluetooth synced' : 'Manual entry'} • ${l.duration_minutes} min`,
        value: `${Math.round((l.duration_minutes / 60) * 10) / 10} hrs`,
      })));
    } else if (activityKey === 'screen-time') {
      const logs = JSON.parse(localStorage.getItem(`wa_screentime_${userId}`) || '[]');
      const formatted = logs.map((l: any) => ({
        date: l.log_date || 'Today',
        minutes: l.minutes,
      }));
      setChartData(formatted);
      setLedger(logs.map((l: any) => ({
        date: l.log_date || 'Today',
        detail: l.verified ? 'Proof screenshot verified' : 'Manual unverified log',
        value: `${Math.floor(l.minutes / 60)}h ${l.minutes % 60}m`,
      })));
    } else if (activityKey === 'diet') {
      const meals = JSON.parse(localStorage.getItem(`wa_diet_${userId}`) || '[]');
      const formatted = meals.map((m: any) => ({
        date: m.log_date || 'Today',
        calories: m.user_override_calories ?? m.gemini_calories ?? 0,
      }));
      setChartData(formatted);
      setLedger(meals.map((m: any) => ({
        date: m.log_date || 'Today',
        detail: `${m.meal_type.toUpperCase()}: ${m.items_text}`,
        value: `${m.user_override_calories ?? m.gemini_calories ?? 0} kcal`,
      })));
    } else if (activityKey === 'study') {
      const sess = JSON.parse(localStorage.getItem(`wa_study_${userId}`) || '[]');
      const formatted = sess.map((s: any) => ({
        date: s.started_at?.split('T')[0] || 'Today',
        hours: Math.round((s.duration_seconds / 3600) * 10) / 10,
      }));
      setChartData(formatted);
      setLedger(sess.map((s: any) => ({
        date: s.started_at?.split('T')[0] || 'Today',
        detail: s.task_note || 'Focused study block',
        value: `${Math.round(s.duration_seconds / 60)} mins`,
      })));
    } else if (activityKey === 'gym') {
      const sets = JSON.parse(localStorage.getItem(`wa_gym_${userId}`) || '[]');
      const formatted = sets.map((s: any) => ({
        date: s.timestamp || 'Today',
        calories: s.estimatedCalories,
      }));
      setChartData(formatted);
      setLedger(sets.map((s: any) => ({
        date: s.timestamp || 'Today',
        detail: `${s.exerciseName} (${s.sets}x${s.reps} @ ${s.weightKg || 'BW'}kg)`,
        value: `${s.estimatedCalories} kcal`,
      })));
    } else if (activityKey === 'tasks') {
      const tasks = JSON.parse(localStorage.getItem(`wa_tasks_${userId}`) || '[]');
      const todayCount = tasks.filter((t: any) => t.is_complete).length;
      const rate = tasks.length > 0 ? Math.round((todayCount / tasks.length) * 100) : 0;
      setChartData([{ date: 'Today', rate }]);
      setLedger(tasks.map((t: any) => ({
        date: t.task_date || 'Today',
        detail: t.text,
        value: t.is_complete ? 'Completed' : 'Pending',
      })));
    }
  }, [activityKey, profile?.id]);

  return (
    <div className="min-h-screen flex flex-col bg-[#08090B]">
      <TopNav />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8">
        {/* Back Link */}
        <div className="mb-4">
          <Link href="/app/records">
            <Button variant="ghost" size="sm" className="text-xs text-gray-400 gap-1.5 h-8 font-mono">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Records</span>
            </Button>
          </Link>
        </div>

        {/* Title Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Badge variant="cyan" className="mb-1 font-mono uppercase bg-neon/10 text-neon border-neon/30">
              {activityKey} AUDIT
            </Badge>
            <h1 className="font-display text-3xl sm:text-4xl text-white tracking-wide uppercase">
              {meta.title}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Link href={meta.route}>
              <Button variant="primary" size="sm" className="bg-neon text-black font-extrabold hover:bg-neon-hover border-neon shadow-sm gap-1.5 text-xs font-mono uppercase">
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Log New Data</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Chart Card */}
        <Card className="p-6 mb-8 border-white/[0.08] bg-[#0e120d]/90 backdrop-blur-xl">
          <h2 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-neon" />
            <span>Real Performance Metric Trend ({meta.unit})</span>
          </h2>

          {chartData.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-white/10 rounded-xl">
              <span className="text-xs font-mono text-gray-400 mb-2">0 logs recorded yet for this category</span>
              <p className="text-xs text-gray-500 max-w-sm mb-4 font-sans">
                Real users will enter their daily numbers in the Cockpit. Once recorded, your real discipline graph will plot here automatically.
              </p>
              <Link href={meta.route}>
                <Button variant="secondary" size="sm" className="text-xs font-mono">
                  Go to {meta.title.split(' ')[0]} Tracker
                </Button>
              </Link>
            </div>
          ) : (
            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id={`grad-${activityKey}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={meta.color} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={meta.color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" stroke="#6B7280" fontSize={11} tickLine={false} />
                  <YAxis stroke="#6B7280" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F1117',
                      borderColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey={meta.metricKey}
                    stroke={meta.color}
                    strokeWidth={2}
                    fillOpacity={1}
                    fill={`url(#grad-${activityKey})`}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* Ledger Table */}
        <Card className="p-6 border-white/[0.08] bg-[#0e120d]/90 backdrop-blur-xl">
          <h2 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider mb-4">
            Auditable Entry Ledger
          </h2>

          {ledger.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-500 font-mono border border-dashed border-white/10 rounded-xl">
              No real logs registered in the ledger yet.
            </div>
          ) : (
            <div className="divide-y divide-white/[0.06]">
              {ledger.map((item, idx) => (
                <div key={idx} className="py-3.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono text-gray-400 block text-[11px]">{item.date}</span>
                    <span className="text-gray-200 font-medium">{item.detail}</span>
                  </div>
                  <Badge variant="cyan" className="font-mono bg-neon/10 text-neon border-neon/30">
                    {item.value}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
