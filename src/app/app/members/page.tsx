'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { TopNav } from '@/components/layout/top-nav';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MemberSummary, Profile } from '@/lib/types';
import { AvatarBadge } from '@/components/ui/avatar-badge';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase/client';
import { calculateChallengeDay } from '@/lib/date-utils';
import {
  Users,
  Search,
  Eye,
  Flame,
  Shield,
  Activity,
  CheckCircle2,
  Clock,
  Dumbbell,
  Share2,
  Copy,
  Check,
  UserPlus,
} from 'lucide-react';

export default function MembersDirectoryPage() {
  const { profile: currentProfile } = useAuth();
  const [members, setMembers] = useState<MemberSummary[]>([]);
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    async function loadRealMembers() {
      if (!currentProfile) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);

      if (!supabase) {
        // Load real registered friend profiles from local store
        const allUsersJson = localStorage.getItem('wa_registered_users');
        const allUsers = allUsersJson ? JSON.parse(allUsersJson) : [];

        const summaries: MemberSummary[] = allUsers.map((u: any, idx: number) => {
          const prof: Profile = u.profile;
          const userCommitsJson = localStorage.getItem(`wa_commitments_${u.id}`);
          const userCommits = userCommitsJson ? JSON.parse(userCommitsJson) : [];
          const userTasksJson = localStorage.getItem(`wa_tasks_${u.id}`);
          const userTasks = userTasksJson ? JSON.parse(userTasksJson) : [];

          return {
            profile: prof,
            currentDay: calculateChallengeDay(prof.challenge_started_at, prof.timezone),
            commitmentsCount: userCommits.length,
            commitmentsSample: userCommits.slice(0, 3).map((c: any) => c.text),
            todayTasksCompleted: userTasks.filter((t: any) => t.is_completed).length,
            todayTasksTotal: userTasks.length || 0,
            studyMinutesToday: 0,
            caloriesBurnedToday: 0,
            sleepHoursToday: 0,
          };
        });

        // Ensure current logged in user is included if not in array
        if (currentProfile && !summaries.find((s) => s.profile.id === currentProfile.id)) {
          summaries.unshift({
            profile: currentProfile,
            currentDay: calculateChallengeDay(currentProfile.challenge_started_at, currentProfile.timezone),
            commitmentsCount: 0,
            commitmentsSample: [],
            todayTasksCompleted: 0,
            todayTasksTotal: 0,
            studyMinutesToday: 0,
            caloriesBurnedToday: 0,
            sleepHoursToday: 0,
          });
        }

        setMembers(summaries);
        setIsLoading(false);
        return;
      }

      try {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (profilesData && profilesData.length > 0) {
          const summaries: MemberSummary[] = await Promise.all(
            profilesData.map(async (prof: Profile) => {
              const { data: commits } = await supabase
                .from('commitments')
                .select('text')
                .eq('user_id', prof.id)
                .limit(3);

              return {
                profile: prof,
                currentDay: calculateChallengeDay(prof.challenge_started_at, prof.timezone),
                commitmentsCount: commits?.length || 0,
                commitmentsSample: commits?.map((c) => c.text) || [],
                todayTasksCompleted: 0,
                todayTasksTotal: 0,
                studyMinutesToday: 0,
                caloriesBurnedToday: 0,
                sleepHoursToday: 0,
              };
            })
          );
          setMembers(summaries);
        } else if (currentProfile) {
          setMembers([
            {
              profile: currentProfile,
              currentDay: calculateChallengeDay(currentProfile.challenge_started_at, currentProfile.timezone),
              commitmentsCount: 0,
              commitmentsSample: [],
              todayTasksCompleted: 0,
              todayTasksTotal: 0,
              studyMinutesToday: 0,
              caloriesBurnedToday: 0,
              sleepHoursToday: 0,
            },
          ]);
        }
      } catch (err) {
        console.error('Failed to load real members:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadRealMembers();
  }, [currentProfile]);

  const handleCopyInvite = () => {
    if (typeof window !== 'undefined') {
      const inviteUrl = `${window.location.origin}/login`;
      navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const filteredMembers = members.filter((m) =>
    m.profile.display_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#08090B]">
      <TopNav />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="cyan" className="bg-neon/10 text-neon border-neon/30 font-mono">
                COMMUNITY ARENA
              </Badge>
              <span className="text-xs text-gray-400 font-mono">Real Challengers Only</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl text-white tracking-wide uppercase">
              Challengers Directory
            </h1>
            <p className="text-sm text-gray-400 mt-1 font-sans">
              Real friends and competitors in the Winter Arc. Inspect commitments and audit daily discipline.
            </p>
          </div>

          {/* Invite Friend Button */}
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCopyInvite}
              className="gap-2 font-mono text-xs border-white/20 hover:border-neon hover:text-neon"
            >
              {copied ? <Check className="w-4 h-4 text-neon" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Link Copied!' : 'Copy Invite Link'}</span>
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <Input
            placeholder="Search friend by name or handle..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4 text-gray-400" />}
            className="h-11 text-xs max-w-md"
          />
        </div>

        {/* Member Cards Grid */}
        {isLoading ? (
          <div className="text-center py-20 text-gray-500 font-mono text-xs">
            Loading real challengers from arena...
          </div>
        ) : filteredMembers.length === 0 ? (
          <Card className="p-12 text-center border-dashed border-white/15 bg-white/[0.02]">
            <div className="w-14 h-14 rounded-2xl bg-neon/10 border border-neon/30 flex items-center justify-center mx-auto text-neon mb-4">
              <UserPlus className="w-7 h-7" />
            </div>
            <h3 className="font-display text-2xl text-white uppercase tracking-wide mb-2">
              No Friends Registered Yet
            </h3>
            <p className="text-sm text-gray-400 max-w-md mx-auto mb-6">
              Give your site link to your friends! Once they create their profile on the login page,
              their live progress, streak, and commitments will appear right here.
            </p>
            <Button
              variant="primary"
              size="md"
              onClick={handleCopyInvite}
              className="bg-neon text-black font-extrabold hover:bg-neon-hover border-neon shadow-[0_0_20px_rgba(204,255,0,0.3)] font-mono text-xs uppercase"
            >
              <Share2 className="w-4 h-4 mr-2" />
              <span>Copy Arena Link to Share</span>
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredMembers.map((member) => (
              <Card
                key={member.profile.id}
                hoverEffect
                className="p-5 border-white/[0.08] flex flex-col justify-between bg-[#0e120d]/80 backdrop-blur-xl"
              >
                <div>
                  {/* User Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <AvatarBadge name={member.profile.display_name} avatarUrl={member.profile.avatar_url} size="md" />
                      <div>
                        <h3 className="text-sm font-bold text-white font-mono flex items-center gap-1.5">
                          <span>{member.profile.display_name}</span>
                          {currentProfile?.id === member.profile.id && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-neon/20 text-neon font-mono">
                              YOU
                            </span>
                          )}
                        </h3>
                        <span className="text-xs text-gray-500 font-mono">
                          {member.profile.timezone}
                        </span>
                      </div>
                    </div>

                    <Badge variant="cyan" className="font-mono text-xs bg-neon/15 text-neon border-neon/40">
                      DAY {member.currentDay}
                    </Badge>
                  </div>

                  {/* Commitments Sample */}
                  <div className="mb-4 space-y-1.5">
                    <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">
                      Core Commitments ({member.commitmentsCount}):
                    </span>
                    {member.commitmentsSample && member.commitmentsSample.length > 0 ? (
                      member.commitmentsSample.map((text, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 text-xs text-gray-300 truncate"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-neon shrink-0" />
                          <span className="truncate">{text}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-500 italic">Pledging commitments...</p>
                    )}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
                  <span className="text-xs text-gray-400 font-mono flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-neon" />
                    <span>Real Profile</span>
                  </span>

                  <Link href={`/app/members/${member.profile.id}`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-neon hover:text-white hover:bg-neon/10 gap-1.5 h-8 font-mono"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Spectate</span>
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
