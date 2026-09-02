'use client';

import React, { useState, useEffect } from 'react';
import { TopNav } from '@/components/layout/top-nav';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';
import { useUIStore } from '@/lib/store';
import { getLocalTodayDateString } from '@/lib/date-utils';
import { StudySubject, StudySession } from '@/lib/types';
import {
  GraduationCap,
  Play,
  Square,
  Plus,
  Archive,
  Clock,
  Flame,
  Sparkles,
  RotateCcw,
} from 'lucide-react';

const DEFAULT_STREAM_SUBJECTS: Record<string, string[]> = {
  science: ['Physics', 'Chemistry', 'Mathematics', 'Biology'],
  commerce: ['Accountancy', 'Economics', 'Business Studies', 'Applied Math'],
  arts: ['History', 'Political Science', 'Psychology', 'Sociology'],
  jee: ['JEE Physics', 'JEE Physical Chemistry', 'JEE Organic Chemistry', 'JEE Calculus'],
  neet: ['NEET Human Physiology', 'NEET Genetics', 'NEET Chemistry', 'NEET Physics'],
};

export default function StudyChamberPage() {
  const { profile } = useAuth();
  const todayStr = getLocalTodayDateString(profile?.timezone);

  const {
    activeStudySubjectId,
    studyStartedAt,
    setActiveStudy,
    isPomodoroActive,
    setPomodoroState,
  } = useUIStore();

  // Selected streams (multi-select as tags per Section 9.4)
  const [selectedStreams, setSelectedStreams] = useState<string[]>(['science', 'jee']);

  // Real user subjects and sessions (starts at 0)
  const [subjects, setSubjects] = useState<StudySubject[]>([]);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [currentTaskNote, setCurrentTaskNote] = useState('');
  const [sessions, setSessions] = useState<StudySession[]>([]);

  useEffect(() => {
    const userId = profile?.id || 'active';
    const savedSess = localStorage.getItem(`wa_study_${userId}`);
    if (savedSess) {
      try {
        setSessions(JSON.parse(savedSess));
      } catch (e) {
        setSessions([]);
      }
    } else {
      setSessions([]);
    }

    const savedSubs = localStorage.getItem(`wa_subjects_${userId}`);
    if (savedSubs) {
      try {
        setSubjects(JSON.parse(savedSubs));
      } catch (e) {
        setSubjects([]);
      }
    } else {
      setSubjects([]);
    }
  }, [profile?.id]);

  // Wall-clock active timer tracking
  const [elapsedActiveSeconds, setElapsedActiveSeconds] = useState(0);

  useEffect(() => {
    if (!studyStartedAt) {
      setElapsedActiveSeconds(0);
      return;
    }

    const interval = setInterval(() => {
      // Wall-clock calculation: Immune to browser background tab throttling
      const now = Date.now();
      setElapsedActiveSeconds(Math.max(0, Math.floor((now - studyStartedAt) / 1000)));
    }, 1000);

    return () => clearInterval(interval);
  }, [studyStartedAt]);

  // Cumulative study total for today across all subjects
  const completedSecondsToday = sessions.reduce((acc, s) => acc + (s.duration_seconds || 0), 0);
  const totalStudySecondsToday = completedSecondsToday + (activeStudySubjectId ? elapsedActiveSeconds : 0);

  const activeSubject = subjects.find((s) => s.id === activeStudySubjectId);

  const toggleStream = (streamId: string) => {
    setSelectedStreams((prev) =>
      prev.includes(streamId) ? prev.filter((s) => s !== streamId) : [...prev, streamId]
    );
  };

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;

    const newSub: StudySubject = {
      id: `sub-${Date.now()}`,
      user_id: profile?.id || 'demo-warrior-001',
      stream: selectedStreams[0] || 'custom',
      name: newSubjectName.trim(),
      is_custom: true,
      archived: false,
    };

    setSubjects((prev) => {
      const updated = [...prev, newSub];
      const storageKey = `wa_subjects_${profile?.id || 'active'}`;
      localStorage.setItem(storageKey, JSON.stringify(updated));
      return updated;
    });
    setNewSubjectName('');
  };

  const handleStartSession = (subjectId: string) => {
    if (activeStudySubjectId && studyStartedAt) {
      handleStopSession();
    }
    setActiveStudy(subjectId, Date.now());
  };

  const handleStopSession = () => {
    if (!activeStudySubjectId || !studyStartedAt) return;

    const now = Date.now();
    const durationSeconds = Math.max(1, Math.floor((now - studyStartedAt) / 1000));

    const newSession: StudySession = {
      id: `sess-${Date.now()}`,
      user_id: profile?.id || 'active',
      subject_id: activeStudySubjectId,
      task_note: currentTaskNote || null,
      started_at: new Date(studyStartedAt).toISOString(),
      ended_at: new Date(now).toISOString(),
      duration_seconds: durationSeconds,
      mode: isPomodoroActive ? 'pomodoro' : 'freeform',
    };

    setSessions((prev) => {
      const updated = [newSession, ...prev];
      const storageKey = `wa_study_${profile?.id || 'active'}`;
      localStorage.setItem(storageKey, JSON.stringify(updated));
      return updated;
    });
    setActiveStudy(null, null);
    setCurrentTaskNote('');
  };

  const handleArchiveSubject = (subjectId: string) => {
    setSubjects((prev) =>
      prev.map((s) => (s.id === subjectId ? { ...s, archived: true } : s))
    );
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s
      .toString()
      .padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8">
        {/* Top Cumulative Study Bar */}
        <div className="mb-6 p-5 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-glass flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-gray-400 uppercase font-mono tracking-wider">
                Total Focus Time Today ({todayStr})
              </span>
              <div className="text-3xl font-bold text-white font-mono tracking-tight">
                {formatTime(totalStudySecondsToday)}
              </div>
            </div>
          </div>

          {/* Pomodoro Mode Toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant={isPomodoroActive ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setPomodoroState(!isPomodoroActive, 25)}
              className="text-xs gap-1.5"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Pomodoro (25/5)</span>
            </Button>
          </div>
        </div>

        {/* Active Study Cockpit */}
        {activeSubject && (
          <Card className="p-6 mb-8 border-primary/30 bg-primary/5 relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                  <span className="text-xs font-mono font-bold text-primary uppercase">
                    ACTIVE SESSION • {activeSubject.stream.toUpperCase()}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">{activeSubject.name}</h2>
                <div className="mt-2">
                  <Input
                    placeholder="What specific topic/task are you solving? (e.g. 20 PYQ problems)"
                    value={currentTaskNote}
                    onChange={(e) => setCurrentTaskNote(e.target.value)}
                    className="max-w-md h-9 text-xs"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="text-4xl font-mono font-bold text-white">
                  {formatTime(elapsedActiveSeconds)}
                </div>
                <Button
                  variant="danger"
                  size="md"
                  onClick={handleStopSession}
                  className="gap-2 shrink-0"
                >
                  <Square className="w-4 h-4" />
                  <span>Stop & Save Session</span>
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Stream Selector Tags */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 font-mono">
            Academic Streams & Target Tracks
          </label>
          <div className="flex flex-wrap gap-2">
            {['science', 'commerce', 'arts', 'jee', 'neet'].map((s) => {
              const isSelected = selectedStreams.includes(s);
              return (
                <button
                  key={s}
                  onClick={() => toggleStream(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all uppercase font-mono ${
                    isSelected
                      ? 'bg-primary/20 border-primary text-white shadow-[0_0_12px_rgba(79,209,255,0.2)]'
                      : 'bg-white/[0.02] border-white/[0.08] text-gray-400 hover:text-white'
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        {/* Subjects Grid & Add Subject */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider font-mono">
              Course Subjects
            </h3>
            <span className="text-xs text-gray-500">Click a subject to begin focus timer</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            {subjects
              .filter((s) => !s.archived)
              .map((sub) => {
                const isRunning = activeStudySubjectId === sub.id;

                return (
                  <Card
                    key={sub.id}
                    hoverEffect={!isRunning}
                    className={`p-4 border-white/[0.08] transition-all flex flex-col justify-between ${
                      isRunning ? 'border-primary/50 bg-primary/10' : ''
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-[10px] uppercase font-mono">
                          {sub.stream}
                        </Badge>
                        <button
                          onClick={() => handleArchiveSubject(sub.id)}
                          className="text-gray-500 hover:text-gray-300 p-1"
                          title="Archive Subject"
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <h4 className="text-sm font-bold text-white">{sub.name}</h4>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                      {isRunning ? (
                        <span className="text-xs font-mono font-bold text-primary animate-pulse">
                          Running: {formatTime(elapsedActiveSeconds)}
                        </span>
                      ) : (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleStartSession(sub.id)}
                          className="w-full text-xs gap-1.5"
                        >
                          <Play className="w-3 h-3 text-primary" />
                          <span>Start Study Session</span>
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
          </div>

          {/* Add custom subject input */}
          <form onSubmit={handleAddSubject} className="flex gap-2 max-w-md">
            <Input
              placeholder="Add custom subject (e.g. Organic Chemistry)..."
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
              className="h-10 text-xs"
            />
            <Button type="submit" variant="secondary" size="md" disabled={!newSubjectName.trim()}>
              <Plus className="w-4 h-4 mr-1" />
              <span>Add</span>
            </Button>
          </form>
        </div>

        {/* Sessions History */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider font-mono">
            Recent Study Sessions
          </h3>

          <div className="space-y-3">
            {sessions.map((sess) => {
              const sub = subjects.find((s) => s.id === sess.subject_id);
              const durationMins = Math.round((sess.duration_seconds || 0) / 60);

              return (
                <div
                  key={sess.id}
                  className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{sub?.name || 'Subject'}</span>
                        <Badge variant="cyan" className="text-[10px] font-mono">
                          {durationMins} min
                        </Badge>
                      </div>
                      {sess.task_note && (
                        <p className="text-xs text-gray-400 mt-0.5">{sess.task_note}</p>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 font-mono">
                    {new Date(sess.started_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
