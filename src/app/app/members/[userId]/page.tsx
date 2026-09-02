'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { TopNav } from '@/components/layout/top-nav';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getBulletForIndex } from '@/lib/bullet-palette';
import { AvatarBadge } from '@/components/ui/avatar-badge';
import { createClient } from '@/lib/supabase/client';
import { calculateChallengeDay } from '@/lib/date-utils';
import { useAuth } from '@/lib/auth-context';
import {
  Shield,
  Eye,
  ArrowLeft,
  Flame,
  CheckCircle2,
  Clock,
  Moon,
  Smartphone,
  Utensils,
  GraduationCap,
  Dumbbell,
  Lock,
} from 'lucide-react';

export default function MemberSpectatorPage() {
  const params = useParams();
  const userId = params?.userId as string;
  const { profile: myProfile } = useAuth();

  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    async function loadFriendProfile() {
      setLoading(true);

      if (!supabase) {
        const allUsersJson = localStorage.getItem('wa_registered_users');
        const allUsers = allUsersJson ? JSON.parse(allUsersJson) : [];
        let found = allUsers.find((u: any) => u.id === userId);

        if (!found && myProfile && myProfile.id === userId) {
          found = { id: myProfile.id, profile: myProfile };
        }

        if (found) {
          const prof = found.profile;
          const userCommitsJson = localStorage.getItem(`wa_commitments_${found.id}`);
          const userCommits = userCommitsJson ? JSON.parse(userCommitsJson) : [];
          const userTasksJson = localStorage.getItem(`wa_tasks_${found.id}`);
          const userTasks = userTasksJson ? JSON.parse(userTasksJson) : [];

          setMember({
            id: found.id,
            displayName: prof.display_name,
            timezone: prof.timezone,
            dayNumber: calculateChallengeDay(prof.challenge_started_at, prof.timezone),
            commitments: userCommits.map((c: any) => c.text),
            todayTasks: userTasks.map((t: any) => ({ text: t.title, completed: t.is_completed })),
          });
        }
        setLoading(false);
        return;
      }

      try {
        const { data: prof } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (prof) {
          const { data: commits } = await supabase
            .from('commitments')
            .select('text')
            .eq('user_id', prof.id);

          const { data: tasks } = await supabase
            .from('daily_tasks')
            .select('title, is_completed')
            .eq('user_id', prof.id);

          setMember({
            id: prof.id,
            displayName: prof.display_name,
            timezone: prof.timezone,
            dayNumber: calculateChallengeDay(prof.challenge_started_at, prof.timezone),
            commitments: commits?.map((c) => c.text) || [],
            todayTasks: tasks?.map((t) => ({ text: t.title, completed: t.is_completed })) || [],
          });
        }
      } catch (err) {
        console.error('Error fetching member profile:', err);
      } finally {
        setLoading(false);
      }
    }

    loadFriendProfile();
  }, [userId, myProfile]);

  return (
    <div className="min-h-screen flex flex-col bg-[#08090B]">
      <TopNav />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8">
        {/* Spectator Mode Banner */}
        <div className="mb-6 p-4 rounded-xl bg-neon/10 border border-neon/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-neon text-xs font-mono font-bold">
            <Eye className="w-4 h-4 text-neon animate-pulse" />
            <span>SPECTATOR MODE • AUDITING REAL CHALLENGER DATA</span>
          </div>

          <Link href="/app/members">
            <Button variant="ghost" size="sm" className="text-xs text-gray-300 gap-1.5 h-8 font-mono">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Directory</span>
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400 font-mono text-xs">
            Loading challenger data...
          </div>
        ) : !member ? (
          <Card className="p-10 text-center border-white/10">
            <h2 className="text-xl font-bold text-white mb-2 font-display uppercase">Challenger Not Found</h2>
            <p className="text-sm text-gray-400 mb-4 font-sans">
              This challenger has not registered or their profile is private.
            </p>
            <Link href="/app/members">
              <Button variant="primary" size="sm" className="bg-neon text-black font-mono">
                Return to Directory
              </Button>
            </Link>
          </Card>
        ) : (
          <>
            {/* Profile Card Header */}
            <Card className="p-6 mb-8 border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-[#0e120d]/90 backdrop-blur-xl">
              <div className="flex items-center gap-4">
                <AvatarBadge name={member.displayName} size="lg" />
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="font-display text-2xl sm:text-3xl text-white uppercase tracking-wide">
                      {member.displayName}
                    </h1>
                    <Badge variant="cyan" className="font-mono text-xs bg-neon/15 text-neon border-neon/40">
                      DAY {member.dayNumber}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-400 font-mono mt-1">
                    Timezone: {member.timezone} • Public Winter Arc Pledge
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-gray-300 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-neon" />
                  <span>{member.commitments.length} Strict Rules</span>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Rules / Commitments */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-display text-lg text-white uppercase tracking-wider flex items-center gap-2">
                    <Shield className="w-4 h-4 text-neon" />
                    <span>Non-Negotiable Commitments</span>
                  </h2>
                  <span className="text-xs font-mono text-gray-500">Read-Only</span>
                </div>

                <div className="space-y-3">
                  {member.commitments.length === 0 ? (
                    <p className="text-xs text-gray-500 italic">No rules logged yet.</p>
                  ) : (
                    member.commitments.map((text: string, idx: number) => {
                      const bullet = getBulletForIndex(idx);
                      return (
                        <div
                          key={idx}
                          className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center gap-3.5"
                        >
                          <span
                            className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 border ${bullet.bg} ${bullet.border} ${bullet.text}`}
                          >
                            {bullet.glyph}
                          </span>
                          <span className="text-xs text-gray-200 font-medium font-sans">{text}</span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Today's Tasks */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-display text-lg text-white uppercase tracking-wider flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-400" />
                    <span>Today's Task Execution</span>
                  </h2>
                  <span className="text-xs font-mono text-gray-500">Midnight Lock Enforced</span>
                </div>

                <div className="space-y-2.5">
                  {member.todayTasks.length === 0 ? (
                    <div className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center text-xs text-gray-500 font-mono">
                      No tasks scheduled for today.
                    </div>
                  ) : (
                    member.todayTasks.map((task: any, idx: number) => (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-xl border flex items-center justify-between ${
                          task.completed
                            ? 'bg-neon/5 border-neon/20 text-gray-200'
                            : 'bg-white/[0.02] border-white/[0.06] text-gray-400'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <CheckCircle2
                            className={`w-4 h-4 ${task.completed ? 'text-neon' : 'text-gray-600'}`}
                          />
                          <span className={`text-xs ${task.completed ? 'line-through text-gray-400' : 'text-gray-200'}`}>
                            {task.text}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono uppercase text-gray-500">
                          {task.completed ? 'Done' : 'Pending'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
