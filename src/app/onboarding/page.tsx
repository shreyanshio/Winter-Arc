'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase/client';
import { getBulletForIndex } from '@/lib/bullet-palette';
import { getBrowserTimezone } from '@/lib/date-utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Flame, Plus, Trash2, ArrowRight, ShieldAlert, CheckCircle2, Sparkles, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

const POPULAR_SUGGESTIONS = [
  'Wake up at 05:00 AM daily without snoozing',
  'Zero processed sugar & zero alcohol',
  'Complete minimum 4 hours deep focused study/work',
  '10,000 steps daily + strict workout session',
  'Phone screen time strictly under 2 hours',
  'Drink 3.5 Liters of water daily',
  'Cold shower every morning',
  'Read 10 pages of a non-fiction book',
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, profile, commitments: existingCommitments, updateProfile, refreshUserData, isLoading: authLoading } = useAuth();
  const supabase = createClient();

  const [inputCommitment, setInputCommitment] = useState('');
  const [commitmentsList, setCommitmentsList] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Unauthenticated guard: Must be logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/');
    }
  }, [user, authLoading, router]);

  // Initialize with existing commitments if already saved
  useEffect(() => {
    if (existingCommitments && existingCommitments.length > 0) {
      setCommitmentsList(existingCommitments.map((c) => c.text));
    }
  }, [existingCommitments]);

  // If already onboarded with 5+ commitments, allow direct skip to cockpit
  const isAlreadyDone = existingCommitments && existingCommitments.length >= 5;

  const handleAddCommitment = (textToAdd?: string) => {
    const text = (textToAdd || inputCommitment).trim();
    if (!text) return;
    if (commitmentsList.includes(text)) return;
    if (commitmentsList.length >= 20) return;

    setCommitmentsList((prev) => [...prev, text]);
    if (!textToAdd) setInputCommitment('');
    setErrorMsg(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCommitment();
    }
  };

  const handleRemove = (index: number) => {
    setCommitmentsList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (commitmentsList.length < 5) {
      setErrorMsg(`You have pledged ${commitmentsList.length} rules. Minimum 5 commitments are compulsory!`);
      return;
    }
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const timezone = getBrowserTimezone();
      const startedAt = profile?.challenge_started_at || new Date().toISOString();
      const userId = profile?.id || user?.id;

      // 1. Persist directly to Supabase cloud database
      if (supabase && userId) {
        // Clear any previous commitments
        await supabase.from('commitments').delete().eq('user_id', userId);

        const records = commitmentsList.map((text, idx) => ({
          user_id: userId,
          text,
          sort_order: idx + 1,
        }));

        const { error: insertErr } = await supabase.from('commitments').insert(records);
        if (insertErr) {
          console.warn('Supabase commitments insert warning:', insertErr);
        }
      }

      // 2. Persist to localStorage for fast access
      const formattedCommitments = commitmentsList.map((text, idx) => ({
        id: `c-${idx + 1}`,
        user_id: userId || 'active',
        text,
        sort_order: idx + 1,
      }));

      if (userId) {
        localStorage.setItem(`wa_commitments_${userId}`, JSON.stringify(formattedCommitments));
      }
      localStorage.setItem('wa_commitments', JSON.stringify(formattedCommitments));

      // 3. Update profile start date & timezone
      await updateProfile({
        timezone,
        challenge_started_at: startedAt,
      });

      // Fire victory confetti
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#CCFF00', '#4FD1FF', '#FFFFFF'],
        });
      } catch {}

      await refreshUserData();

      setTimeout(() => {
        router.push('/app/individual');
      }, 600);
    } catch (err: any) {
      console.error('Failed to submit commitments:', err);
      setErrorMsg(err.message || 'Failed to save commitments. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canEnter = commitmentsList.length >= 5;

  return (
    <div className="min-h-screen max-w-3xl mx-auto px-4 py-12 flex flex-col justify-center">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neon/10 border border-neon/30 mb-4 shadow-[0_0_20px_rgba(204,255,0,0.2)]">
          <Flame className="w-4 h-4 text-neon" />
          <span className="text-xs font-mono text-neon font-bold uppercase tracking-wider">
            MANDATORY COMMITMENT GATEKEEPER
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white uppercase font-display">
          Pledge Your 5 Compulsory Rules
        </h1>
        <p className="text-sm text-gray-400 mt-2 max-w-lg mx-auto font-sans leading-relaxed">
          Before entering the Winter Arc cockpit, you must pledge between 5 and 20 non-negotiable rules.
          Every rule is stored in Supabase and audited by spectators.
        </p>
      </div>

      <Card className="p-6 sm:p-8 bg-[#0d110c]/95 border-neon/30 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(204,255,0,0.12)]">
        {errorMsg && (
          <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 font-mono">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Input Bar */}
        <div className="flex gap-2 mb-4">
          <Input
            placeholder={
              commitmentsList.length >= 20
                ? 'Maximum 20 commitments reached'
                : 'Type your rule (e.g. 100 pushups, 2L water, 4hr study)...'
            }
            value={inputCommitment}
            onChange={(e) => setInputCommitment(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={commitmentsList.length >= 20}
            className="h-11 text-xs"
          />
          <Button
            variant="primary"
            onClick={() => handleAddCommitment()}
            disabled={!inputCommitment.trim() || commitmentsList.length >= 20}
            className="shrink-0 bg-neon text-black font-extrabold hover:bg-neon-hover font-mono uppercase text-xs"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Add Rule</span>
          </Button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="mb-6">
          <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest block mb-2">
            Click quick suggestions to add:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {POPULAR_SUGGESTIONS.map((sugg, i) => {
              const isAdded = commitmentsList.includes(sugg);
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleAddCommitment(sugg)}
                  disabled={isAdded || commitmentsList.length >= 20}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border font-mono transition-all text-left ${
                    isAdded
                      ? 'bg-white/[0.02] border-white/[0.05] text-gray-600 cursor-not-allowed line-through'
                      : 'bg-white/[0.04] border-white/[0.1] text-gray-300 hover:text-white hover:border-neon/50 hover:bg-neon/5'
                  }`}
                >
                  + {sugg}
                </button>
              );
            })}
          </div>
        </div>

        {/* Counter Badge */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.08]">
          <span className="text-xs text-gray-300 font-mono uppercase tracking-wider font-semibold">
            Your Pledged Rules ({commitmentsList.length})
          </span>
          <Badge variant={canEnter ? 'cyan' : 'warning'} className={canEnter ? 'bg-neon/20 text-neon border-neon/40' : ''}>
            {commitmentsList.length} / 5 Minimum {commitmentsList.length < 5 ? `(${5 - commitmentsList.length} needed)` : '✓ Ready'}
          </Badge>
        </div>

        {/* Commitments List */}
        {commitmentsList.length === 0 ? (
          <div className="text-center py-8 rounded-xl bg-white/[0.02] border border-dashed border-white/10 text-gray-500 text-xs font-mono">
            No rules pledged yet. Type your rules above or click suggestions to add at least 5 rules.
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {commitmentsList.map((item, idx) => {
              const marker = getBulletForIndex(idx);
              return (
                <div
                  key={idx}
                  className="group flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.15] transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div
                      className={`w-7 h-7 rounded-lg border flex items-center justify-center font-bold text-xs shrink-0 ${marker.bg} ${marker.border} ${marker.text}`}
                    >
                      {idx + 1}
                    </div>
                    <span className="text-sm text-gray-200 truncate font-mono">{item}</span>
                  </div>
                  <button
                    onClick={() => handleRemove(idx)}
                    className="text-gray-500 hover:text-rose-400 p-1 rounded-md opacity-70 group-hover:opacity-100 transition-opacity"
                    title="Remove rule"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Action Button */}
        <div className="mt-8 pt-4 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-gray-400 flex items-center gap-1.5 font-mono">
            {canEnter ? (
              <span className="text-neon flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-neon" /> 5 rules pledged. Ready to enter.
              </span>
            ) : (
              <span className="text-amber-400 flex items-center gap-1">
                <ShieldAlert className="w-4 h-4" /> Add {5 - commitmentsList.length} more rule(s) to unlock cockpit.
              </span>
            )}
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            {isAlreadyDone && (
              <Button
                variant="secondary"
                size="lg"
                onClick={() => router.push('/app/individual')}
                className="w-full sm:w-auto font-mono text-xs"
              >
                Skip to Cockpit
              </Button>
            )}
            <Button
              variant="primary"
              size="lg"
              disabled={!canEnter || isSubmitting}
              onClick={handleSubmit}
              isLoading={isSubmitting}
              className="w-full sm:w-auto min-w-[220px] bg-neon text-black font-extrabold hover:bg-neon-hover border-neon shadow-[0_0_25px_rgba(204,255,0,0.3)] font-mono text-xs uppercase"
            >
              <span>LOCK RULES &amp; ENTER</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
