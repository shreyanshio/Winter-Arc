'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Flame, ShieldAlert, Lock } from 'lucide-react';

export default function AuthenticatedAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, profile, isOnboarded, isLoading } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || isLoading) return;

    // 1. Unauthenticated users are strictly blocked and redirected to landing/login
    if (!user) {
      router.replace('/');
      return;
    }

    // 2. Authenticated users who haven't completed their 5 commitments are routed to /onboarding
    if (!isOnboarded && pathname !== '/onboarding') {
      router.replace('/onboarding');
      return;
    }
  }, [user, isOnboarded, isLoading, isMounted, router, pathname]);

  // Loading state (SSR or initial auth verification)
  if (!isMounted || isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#08090B] text-white">
        <div className="w-14 h-14 rounded-2xl bg-neon/10 border border-neon/30 flex items-center justify-center mb-4 animate-pulse shadow-[0_0_35px_rgba(204,255,0,0.25)]">
          <Flame className="w-7 h-7 text-neon animate-bounce" />
        </div>
        <span className="font-mono text-xs font-bold text-neon tracking-widest uppercase">
          VERIFYING CHALLENGER CREDENTIALS...
        </span>
        <span className="text-[11px] text-gray-500 font-mono mt-1">
          Winter Arc Protocol • Secure Authentication Gate
        </span>
      </div>
    );
  }

  // If unauthenticated: Hard security barrier (NEVER leaks member data to strangers)
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#08090B] px-4 py-12">
        <div className="max-w-md w-full p-8 rounded-2xl bg-[#0d110c]/95 border border-rose-500/30 text-center shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_35px_rgba(244,63,94,0.15)] backdrop-blur-2xl">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto mb-4 text-rose-400">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="font-display text-2xl sm:text-3xl text-white uppercase tracking-wide mb-2">
            RESTRICTED ARENA ACCESS
          </h2>
          <p className="text-xs text-gray-300 font-mono leading-relaxed mb-6">
            Challenger profiles, daily progress, and arena records are strictly private to verified challengers. Sign in with Google to enter.
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={() => router.replace('/')}
            className="w-full bg-neon text-black font-extrabold hover:bg-neon-hover border-neon shadow-[0_0_20px_rgba(204,255,0,0.3)] font-mono text-xs uppercase"
          >
            Go to Sign In Entrance
          </Button>
        </div>
      </div>
    );
  }

  // If authenticated but not onboarded: Onboarding redirect barrier
  if (!isOnboarded && pathname !== '/onboarding') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#08090B] px-4 py-12">
        <div className="max-w-md w-full p-8 rounded-2xl bg-[#0d110c]/95 border border-amber-500/30 text-center shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_35px_rgba(245,158,11,0.15)] backdrop-blur-2xl">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-4 text-amber-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="font-display text-2xl sm:text-3xl text-white uppercase tracking-wide mb-2">
            COMMITMENTS REQUIRED
          </h2>
          <p className="text-xs text-gray-300 font-mono leading-relaxed mb-6">
            You must pledge your 5 compulsory Winter Arc commitments before entering the cockpit.
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={() => router.replace('/onboarding')}
            className="w-full bg-neon text-black font-extrabold hover:bg-neon-hover border-neon shadow-[0_0_20px_rgba(204,255,0,0.3)] font-mono text-xs uppercase"
          >
            Pledge Your 5 Rules
          </Button>
        </div>
      </div>
    );
  }

  // Fully authenticated and onboarded: render internal app views safely
  return <>{children}</>;
}
