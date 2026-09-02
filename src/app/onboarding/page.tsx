'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getBulletForIndex } from '@/lib/bullet-palette';
import { getBrowserTimezone } from '@/lib/date-utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Flame, Plus, Trash2, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function OnboardingPage() {
  const router = useRouter();
  const { profile, commitments: existingCommitments, updateProfile, refreshUserData } = useAuth();

  const [inputCommitment, setInputCommitment] = useState('');
  const [commitmentsList, setCommitmentsList] = useState<string[]>(() => {
    if (existingCommitments && existingCommitments.length > 0) {
      return existingCommitments.map((c) => c.text);
    }
    return [
      'Wake up at 05:00 AM daily without snoozing',
      'Zero processed sugar & maintain 200kcal surplus',
      'Complete minimum 4 hours deep focused study',
      '10,000 steps daily + strict workout session',
      'Phone screen time under 2 hours (no doomscrolling)',
    ];
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddCommitment = () => {
    const trimmed = inputCommitment.trim();
    if (!trimmed) return;
    if (commitmentsList.length >= 20) return;

    setCommitmentsList((prev) => [...prev, trimmed]);
    setInputCommitment('');
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
    if (commitmentsList.length < 5) return;
    setIsSubmitting(true);

    try {
      const timezone = getBrowserTimezone();
      const startedAt = profile?.challenge_started_at || new Date().toISOString();

      // Persist commitments to local storage and update profile
      const formattedCommitments = commitmentsList.map((text, idx) => ({
        id: `c-${idx + 1}`,
        user_id: profile?.id || 'demo-warrior-001',
        text,
        sort_order: idx + 1,
      }));

      localStorage.setItem('wa_commitments', JSON.stringify(formattedCommitments));
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
          colors: ['#4FD1FF', '#38BDF8', '#FFFFFF'],
        });
      } catch {}

      await refreshUserData();
      setTimeout(() => {
        router.push('/app/individual');
      }, 700);
    } catch (err) {
      console.error('Failed to submit commitments:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canEnter = commitmentsList.length >= 5;

  return (
    <div className="min-h-screen max-w-3xl mx-auto px-4 py-12 flex flex-col justify-center">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 mb-4 shadow-[0_0_15px_rgba(79,209,255,0.2)]">
          <Flame className="w-4 h-4 text-primary" />
          <span className="text-xs font-mono text-primary font-bold uppercase tracking-wider">
            Commitment Gatekeeper
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
          Pledge Your Winter Arc Rules
        </h1>
        <p className="text-sm text-gray-400 mt-2 max-w-lg mx-auto">
          Before stepping into the arena, commit to between 5 and 20 non-negotiable rules.
          These pledges will be public to all members for extreme accountability.
        </p>
      </div>

      <Card className="p-6 sm:p-8 bg-white/[0.03] border-white/[0.08] backdrop-blur-xl">
        {/* Input Bar */}
        <div className="flex gap-2 mb-6">
          <Input
            placeholder={
              commitmentsList.length >= 20
                ? 'Maximum 20 commitments reached'
                : 'Type a commitment (e.g. 100 pushups, 2L water, 2hr study)...'
            }
            value={inputCommitment}
            onChange={(e) => setInputCommitment(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={commitmentsList.length >= 20}
          />
          <Button
            variant="secondary"
            onClick={handleAddCommitment}
            disabled={!inputCommitment.trim() || commitmentsList.length >= 20}
            className="shrink-0"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Add</span>
          </Button>
        </div>

        {/* Counter Badge */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.08]">
          <span className="text-xs text-gray-400 font-medium">Your Pledged Commitments</span>
          <Badge variant={canEnter ? 'cyan' : 'warning'}>
            {commitmentsList.length} / 5 Minimum ({commitmentsList.length}/20 max)
          </Badge>
        </div>

        {/* Commitments List */}
        <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
          {commitmentsList.map((item, idx) => {
            const marker = getBulletForIndex(idx);
            return (
              <div
                key={idx}
                className="group flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-all"
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div
                    className={`w-7 h-7 rounded-lg border flex items-center justify-center font-bold text-xs shrink-0 ${marker.bg} ${marker.border} ${marker.text}`}
                  >
                    {marker.glyph}
                  </div>
                  <span className="text-sm text-gray-200 truncate">{item}</span>
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

        {/* Action Button */}
        <div className="mt-8 pt-4 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-gray-500 flex items-center gap-1.5">
            {canEnter ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Threshold reached. Ready to enter.
              </span>
            ) : (
              <span className="text-amber-400 flex items-center gap-1">
                <ShieldAlert className="w-4 h-4" /> Add {5 - commitmentsList.length} more commitment(s) to unlock challenge.
              </span>
            )}
          </div>

          <Button
            variant="primary"
            size="lg"
            disabled={!canEnter || isSubmitting}
            onClick={handleSubmit}
            isLoading={isSubmitting}
            className="w-full sm:w-auto min-w-[200px]"
          >
            <span>Enter The Winter Arc</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
