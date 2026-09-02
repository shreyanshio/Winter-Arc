'use client';

import React, { useState, useEffect } from 'react';
import { TopNav } from '@/components/layout/top-nav';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';
import { getLocalTodayDateString, isTaskPastMidnight } from '@/lib/date-utils';
import { DailyTask } from '@/lib/types';
import { syncDailyTask } from '@/lib/supabase-sync';
import {
  CheckSquare,
  Square,
  Plus,
  Lock,
  Flame,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function DailyTasksPage() {
  const { profile } = useAuth();
  const todayStr = getLocalTodayDateString(profile?.timezone);

  const [newTaskText, setNewTaskText] = useState('');
  const [tasks, setTasks] = useState<DailyTask[]>([]);

  // Load real user tasks
  useEffect(() => {
    const storageKey = `wa_tasks_${profile?.id || 'active'}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setTasks(JSON.parse(saved));
      } catch (e) {
        setTasks([]);
      }
    } else {
      setTasks([]);
    }
  }, [profile?.id]);

  // Hours left until local midnight
  const [midnightCountdown, setMidnightCountdown] = useState('');

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diffMs = midnight.getTime() - now.getTime();
      const hours = Math.floor(diffMs / (3600 * 1000));
      const mins = Math.floor((diffMs % (3600 * 1000)) / (60 * 1000));
      const secs = Math.floor((diffMs % (60 * 1000)) / 1000);
      setMidnightCountdown(
        `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs
          .toString()
          .padStart(2, '0')}`
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const todayTasks = tasks.filter((t) => t.task_date === todayStr);
  const pastTasks = tasks.filter((t) => t.task_date !== todayStr);

  const completedTodayCount = todayTasks.filter((t) => t.is_complete).length;

  const handleToggleTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    // Check midnight lock
    const isLocked = task.locked_at || isTaskPastMidnight(task.task_date, profile?.timezone);
    if (isLocked) {
      alert('This task is permanently locked past midnight.');
      return;
    }

    const nextState = !task.is_complete;
    if (nextState) {
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#CCFF00', '#FFFFFF'],
        });
      } catch {}
    }

    setTasks((prev) => {
      const updated = prev.map((t) => (t.id === taskId ? { ...t, is_complete: nextState } : t));
      const storageKey = `wa_tasks_${profile?.id || 'active'}`;
      localStorage.setItem(storageKey, JSON.stringify(updated));
      return updated;
    });

    if (profile?.id) {
      syncDailyTask({ ...task, is_complete: nextState }, profile.id);
    }
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim() || todayTasks.length >= 20) return;

    const newTask: DailyTask = {
      id: `task-${Date.now()}`,
      user_id: profile?.id || 'active',
      task_date: todayStr,
      text: newTaskText.trim(),
      is_complete: false,
      locked_at: null,
    };

    setTasks((prev) => {
      const updated = [newTask, ...prev];
      const storageKey = `wa_tasks_${profile?.id || 'active'}`;
      localStorage.setItem(storageKey, JSON.stringify(updated));
      return updated;
    });

    if (profile?.id) {
      syncDailyTask(newTask, profile.id);
    }
    setNewTaskText('');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
        {/* Header with Midnight Lock Countdown */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="cyan">STRICT MIDNIGHT LOCK</Badge>
              <span className="text-xs text-gray-400 font-mono">Date: {todayStr}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Daily Discipline Tasks</h1>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300">
            <Clock className="w-5 h-5 animate-pulse" />
            <div>
              <span className="text-[10px] uppercase font-mono block tracking-wider">
                LOCKDOWN IN
              </span>
              <span className="text-lg font-mono font-bold">{midnightCountdown}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <Card className="p-5 mb-8 border-white/[0.08]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider font-mono">
              Today's Execution Rate
            </span>
            <span className="text-sm font-bold text-primary font-mono">
              {completedTodayCount} / {todayTasks.length} Completed
            </span>
          </div>

          <div className="w-full h-2.5 rounded-full bg-white/[0.08] overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(79,209,255,0.4)]"
              style={{
                width: `${todayTasks.length > 0 ? (completedTodayCount / todayTasks.length) * 100 : 0}%`,
              }}
            />
          </div>
        </Card>

        {/* Add Task Input */}
        <form onSubmit={handleAddTask} className="flex gap-2 mb-6">
          <Input
            placeholder={
              todayTasks.length >= 20
                ? 'Daily task cap of 20 reached'
                : 'Add a non-negotiable task for today...'
            }
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            disabled={todayTasks.length >= 20}
          />
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={!newTaskText.trim() || todayTasks.length >= 20}
            className="shrink-0"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Add Task</span>
          </Button>
        </form>

        {/* Today's Tasks */}
        <div className="space-y-3 mb-10">
          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider font-mono">
            Active Tasks for Today
          </h3>

          {todayTasks.length === 0 ? (
            <div className="p-8 text-center text-gray-500 border border-dashed border-white/[0.08] rounded-xl text-sm">
              No tasks added for today yet. Add your daily targets above.
            </div>
          ) : (
            todayTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => handleToggleTask(task.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  task.is_complete
                    ? 'bg-primary/[0.07] border-primary/30 text-white'
                    : 'bg-white/[0.03] border-white/[0.08] hover:border-white/20 text-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <button className="text-primary mt-0.5">
                    {task.is_complete ? (
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    ) : (
                      <Square className="w-5 h-5 text-gray-500" />
                    )}
                  </button>
                  <span
                    className={`text-sm ${
                      task.is_complete ? 'line-through text-gray-400' : 'text-gray-100 font-medium'
                    }`}
                  >
                    {task.text}
                  </span>
                </div>

                <Badge
                  variant={task.is_complete ? 'cyan' : 'outline'}
                  className="text-[10px] font-mono"
                >
                  {task.is_complete ? 'Completed' : 'Pending'}
                </Badge>
              </div>
            ))
          )}
        </div>

        {/* Locked Past Tasks */}
        {pastTasks.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider font-mono">
              <Lock className="w-3.5 h-3.5 text-gray-500" />
              <span>Past Days (Permanently Locked past Midnight)</span>
            </div>

            {pastTasks.map((task) => (
              <div
                key={task.id}
                className="p-3.5 rounded-xl bg-white/[0.01] border border-white/[0.05] flex items-center justify-between opacity-60"
              >
                <div className="flex items-center gap-3">
                  <Lock className="w-4 h-4 text-gray-500" />
                  <span
                    className={`text-xs ${
                      task.is_complete ? 'text-gray-300 line-through' : 'text-rose-400'
                    }`}
                  >
                    {task.text}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-gray-500">{task.task_date}</span>
                  <Badge variant={task.is_complete ? 'default' : 'outline'} className="text-[10px]">
                    {task.is_complete ? 'Executed' : 'Missed'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
