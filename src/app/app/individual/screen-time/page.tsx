'use client';

import React, { useState } from 'react';
import { TopNav } from '@/components/layout/top-nav';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';
import { getLocalTodayDateString } from '@/lib/date-utils';
import { ScreenTimeLog } from '@/lib/types';
import {
  Smartphone,
  UploadCloud,
  CheckCircle2,
  ShieldCheck,
  Clock,
  Eye,
  Info,
} from 'lucide-react';

export default function ScreenTimeTrackerPage() {
  const { profile } = useAuth();
  const todayStr = getLocalTodayDateString(profile?.timezone);

  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Real user logs (starts at 0)
  const [logs, setLogs] = useState<ScreenTimeLog[]>([]);

  React.useEffect(() => {
    const storageKey = `wa_screentime_${profile?.id || 'active'}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setLogs(JSON.parse(saved));
      } catch (e) {
        setLogs([]);
      }
    } else {
      setLogs([]);
    }
  }, [profile?.id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setProofPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const h = parseInt(hours, 10) || 0;
    const m = parseInt(minutes, 10) || 0;
    const totalMinutes = h * 60 + m;

    setIsSubmitting(true);
    setTimeout(() => {
      const newLog: ScreenTimeLog = {
        id: `st-${Date.now()}`,
        user_id: profile?.id || 'demo-warrior-001',
        log_date: todayStr,
        minutes: totalMinutes,
        proof_image_path: proofPreview,
        verified: !!proofPreview,
        source: 'manual',
      };

      setLogs((prev) => {
        const updated = [newLog, ...prev.filter((l) => l.log_date !== todayStr)];
        const storageKey = `wa_screentime_${profile?.id || 'active'}`;
        localStorage.setItem(storageKey, JSON.stringify(updated));
        return updated;
      });
      setIsSubmitting(false);
      alert('Screen time logged successfully!');
    }, 400);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="cyan">DIGITAL DISCIPLINE</Badge>
            <span className="text-xs text-gray-400 font-mono">Dopamine Fasting Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Daily Screen Time</h1>
          <p className="text-sm text-gray-400 mt-1">
            Keep phone usage under control. Upload daily proof screenshots for verified status.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Submission Form */}
          <Card className="md:col-span-2 p-6 border-white/[0.08]">
            <form onSubmit={handleSubmit} className="space-y-5">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-primary" />
                <span>Log Today's Screen Time ({todayStr})</span>
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">Hours</label>
                  <Input
                    type="number"
                    min="0"
                    max="24"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">Minutes</label>
                  <Input
                    type="number"
                    min="0"
                    max="59"
                    value={minutes}
                    onChange={(e) => setMinutes(e.target.value)}
                  />
                </div>
              </div>

              {/* Proof Screenshot Upload */}
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Attach Proof Screenshot (Digital Wellbeing / iOS Screen Time)
                </label>
                <div className="border-2 border-dashed border-white/[0.12] rounded-xl p-4 text-center hover:border-primary/50 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="proof-upload"
                  />
                  <label
                    htmlFor="proof-upload"
                    className="cursor-pointer flex flex-col items-center justify-center gap-2"
                  >
                    <UploadCloud className="w-8 h-8 text-gray-400" />
                    <span className="text-xs text-gray-300">
                      {proofPreview ? 'Proof screenshot attached (click to change)' : 'Click to upload proof screenshot'}
                    </span>
                    <span className="text-[11px] text-gray-500">
                      Enables the community verified shield badge
                    </span>
                  </label>
                </div>

                {proofPreview && (
                  <div className="mt-3 relative w-32 h-44 rounded-lg overflow-hidden border border-primary/40 shadow-md">
                    <img
                      src={proofPreview}
                      alt="Proof Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-[10px] text-primary font-mono">
                      Preview
                    </div>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full"
                isLoading={isSubmitting}
              >
                <span>Save Today's Screen Time</span>
              </Button>
            </form>
          </Card>

          {/* Platform Constraints Explanation Card */}
          <Card className="p-5 border-white/[0.08] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-frost-300 mb-3 uppercase tracking-wider">
                <Info className="w-4 h-4 text-primary" />
                <span>Verification Policy</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Modern mobile operating systems (iOS and Android) sandbox screen-time data inside
                native OS permissions and do not expose them to external web browsers.
              </p>
              <p className="text-xs text-gray-400 leading-relaxed mt-3">
                To guarantee transparency across the community, participants upload screenshots of
                their device's daily usage chart to receive the <strong className="text-white">Verified Shield</strong>.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-white/[0.08] text-center">
              <span className="text-[11px] font-mono text-gray-500">
                Recommended Goal: &lt; 2h 00m / day
              </span>
            </div>
          </Card>
        </div>

        {/* History List */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider font-mono">
            Screen Time History
          </h3>

          <div className="space-y-3">
            {logs.map((log) => {
              const h = Math.floor(log.minutes / 60);
              const m = log.minutes % 60;

              return (
                <div
                  key={log.id}
                  className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white font-mono">
                          {h}h {m}m
                        </span>
                        {log.verified ? (
                          <Badge variant="cyan" className="gap-1 text-[10px]">
                            <ShieldCheck className="w-3 h-3 text-primary" />
                            <span>Proof Verified</span>
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px]">
                            Self-Reported
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 font-mono">Date: {log.log_date}</span>
                    </div>
                  </div>

                  {log.proof_image_path && (
                    <a
                      href={log.proof_image_path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-primary transition-colors"
                      title="View Proof Screenshot"
                    >
                      <Eye className="w-4 h-4" />
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
