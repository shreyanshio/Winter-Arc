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
import { connectHeartRateMonitor, isBluetoothSupported } from '@/lib/bluetooth';
import { SleepLog } from '@/lib/types';
import {
  Moon,
  Sun,
  Clock,
  Bluetooth,
  CheckCircle2,
  Edit3,
  Flame,
  Sparkles,
  Activity,
} from 'lucide-react';

export default function SleepTrackerPage() {
  const { profile } = useAuth();
  const { activeSleepStartedAt, setActiveSleep } = useUIStore();

  const [currentBpm, setCurrentBpm] = useState<number | null>(null);
  const [bleDevice, setBleDevice] = useState<string | null>(null);
  const [bleDisconnect, setBleDisconnect] = useState<(() => void) | null>(null);

  // Real user sleep logs (starts at 0)
  const [sleepLogs, setSleepLogs] = useState<SleepLog[]>([]);

  useEffect(() => {
    const storageKey = `wa_sleep_${profile?.id || 'active'}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setSleepLogs(JSON.parse(saved));
      } catch (e) {
        setSleepLogs([]);
      }
    } else {
      setSleepLogs([]);
    }
  }, [profile?.id]);

  // Adjust wake time dialog state
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [adjustedWakeTime, setAdjustedWakeTime] = useState<string>('');

  const isSleeping = activeSleepStartedAt !== null;

  // Real-time elapsed sleep timer
  const [elapsedSleepSeconds, setElapsedSleepSeconds] = useState(0);
  useEffect(() => {
    if (!activeSleepStartedAt) {
      setElapsedSleepSeconds(0);
      return;
    }
    const update = () => {
      const now = Date.now();
      setElapsedSleepSeconds(Math.max(0, Math.floor((now - activeSleepStartedAt) / 1000)));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [activeSleepStartedAt]);

  const handleStartSleep = () => {
    setActiveSleep(Date.now());
  };

  const handleWakeUp = () => {
    if (!activeSleepStartedAt) return;
    const now = Date.now();
    const durationMinutes = Math.max(1, Math.round((now - activeSleepStartedAt) / (60 * 1000)));
    const todayStr = getLocalTodayDateString(profile?.timezone);

    const newLog: SleepLog = {
      id: `sl-${Date.now()}`,
      user_id: profile?.id || 'demo-warrior-001',
      sleep_started_at: new Date(activeSleepStartedAt).toISOString(),
      wake_at: new Date(now).toISOString(),
      duration_minutes: durationMinutes,
      source: bleDevice ? 'bluetooth' : 'manual',
      edited: false,
      log_date: todayStr, // Attributed to calendar day of wake_at
    };

    setSleepLogs((prev) => {
      const updated = [newLog, ...prev];
      const storageKey = `wa_sleep_${profile?.id || 'active'}`;
      localStorage.setItem(storageKey, JSON.stringify(updated));
      return updated;
    });
    setActiveSleep(null);
  };

  const handleConnectBluetooth = async () => {
    try {
      const { disconnect, deviceName } = await connectHeartRateMonitor((bpm) => {
        setCurrentBpm(bpm);
      });
      setBleDevice(deviceName);
      setBleDisconnect(() => disconnect);
    } catch (err: any) {
      alert(`Bluetooth notice: ${err.message || 'Could not connect'}`);
    }
  };

  const handleAdjustWakeTime = (logId: string) => {
    const log = sleepLogs.find((l) => l.id === logId);
    if (!log || !adjustedWakeTime) return;

    // Parse adjusted time e.g. "06:15"
    const [hours, minutes] = adjustedWakeTime.split(':').map(Number);
    const wakeDate = new Date(log.wake_at || Date.now());
    wakeDate.setHours(hours, minutes, 0, 0);

    const sleepDate = new Date(log.sleep_started_at);
    const newDurationMinutes = Math.max(1, Math.round((wakeDate.getTime() - sleepDate.getTime()) / (60 * 1000)));

    setSleepLogs((prev) => {
      const updated = prev.map((l) =>
        l.id === logId
          ? {
              ...l,
              wake_at: wakeDate.toISOString(),
              duration_minutes: newDurationMinutes,
              edited: true,
            }
          : l
      );
      const storageKey = `wa_sleep_${profile?.id || 'active'}`;
      localStorage.setItem(storageKey, JSON.stringify(updated));
      return updated;
    });
    setEditingLogId(null);
    setAdjustedWakeTime('');
  };

  const formatElapsed = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s
      .toString()
      .padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="cyan">CIRCADIAN PROTOCOL</Badge>
              <span className="text-xs text-gray-400 font-mono">Attributed to Wake Calendar Day</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Sleep & Wake Tracking</h1>
          </div>

          {/* Web Bluetooth status */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleConnectBluetooth}
              className="text-xs gap-1.5"
            >
              <Bluetooth className="w-3.5 h-3.5 text-primary" />
              <span>{bleDevice ? `Synced: ${bleDevice}` : 'Pair Smartwatch'}</span>
            </Button>
            {currentBpm && (
              <Badge variant="cyan" className="gap-1 animate-pulse">
                <Activity className="w-3.5 h-3.5 text-rose-400" />
                <span>{currentBpm} BPM</span>
              </Badge>
            )}
          </div>
        </div>

        {/* Live Sleep Cockpit */}
        <Card className="p-8 mb-8 border-white/[0.1] text-center relative overflow-hidden">
          {isSleeping ? (
            <div className="space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 shadow-[0_0_40px_rgba(99,102,241,0.25)]">
                <Moon className="w-10 h-10 animate-pulse" />
              </div>

              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-indigo-300">
                  🌙 SLEEP SESSION ACTIVE
                </span>
                <h2 className="text-4xl sm:text-5xl font-mono font-bold text-white mt-2">
                  {formatElapsed(elapsedSleepSeconds)}
                </h2>
                <p className="text-sm text-gray-400 mt-2">
                  Rest deep. Your mind and muscle fibers are recovering for the Winter Arc.
                </p>
              </div>

              <div className="pt-4 flex justify-center">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleWakeUp}
                  className="bg-amber-400 text-black hover:bg-amber-300 border-amber-300 gap-2 min-w-[200px]"
                >
                  <Sun className="w-5 h-5 text-black" />
                  <span>Wake Up & Lock Session</span>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/[0.05] border border-white/[0.1] text-gray-300">
                <Moon className="w-8 h-8 text-primary" />
              </div>

              <div>
                <h2 className="text-xl font-bold text-white">Ready for sleep?</h2>
                <p className="text-sm text-gray-400 mt-1 max-w-md mx-auto">
                  Tap to begin your sleep session. When you wake up, your total duration will be
                  calculated and attributed to your morning day.
                </p>
              </div>

              <div className="pt-2 flex justify-center">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleStartSleep}
                  className="gap-2 min-w-[200px]"
                >
                  <Moon className="w-5 h-5" />
                  <span>Sleep (Start Timer)</span>
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Sleep History & Wake Adjustments */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider font-mono">
              Sleep History (Attributed to Wake Day)
            </h3>
            <span className="text-xs text-gray-500">Same-day wake adjustments permitted</span>
          </div>

          <div className="space-y-3">
            {sleepLogs.map((log) => {
              const hours = Math.floor(log.duration_minutes! / 60);
              const minutes = log.duration_minutes! % 60;
              const isEditing = editingLogId === log.id;

              return (
                <div
                  key={log.id}
                  className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white font-mono">
                          {hours}h {minutes}m
                        </span>
                        {log.edited && (
                          <Badge variant="outline" className="text-[10px]">
                            Adjusted
                          </Badge>
                        )}
                        <Badge variant="default" className="text-[10px]">
                          {log.source === 'bluetooth' ? 'BLE Sync' : 'Manual'}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        Day: <span className="text-gray-200 font-mono">{log.log_date}</span> • Slept:{' '}
                        {new Date(log.sleep_started_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        → Woke:{' '}
                        {log.wake_at
                          ? new Date(log.wake_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'In progress'}
                      </div>
                    </div>
                  </div>

                  {/* Wake adjustment controls */}
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={adjustedWakeTime}
                          onChange={(e) => setAdjustedWakeTime(e.target.value)}
                          className="h-8 w-28 text-xs py-1"
                        />
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleAdjustWakeTime(log.id)}
                          disabled={!adjustedWakeTime}
                          className="h-8 text-xs px-2.5"
                        >
                          Save
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingLogId(null)}
                          className="h-8 text-xs px-2"
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setEditingLogId(log.id);
                          setAdjustedWakeTime(
                            log.wake_at
                              ? new Date(log.wake_at).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  hour12: false,
                                })
                              : '06:00'
                          );
                        }}
                        className="text-xs h-8 gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Adjust Wake</span>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
