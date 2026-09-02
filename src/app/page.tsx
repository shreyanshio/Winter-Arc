'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { MarqueeTicker } from '@/components/layout/marquee-ticker';
import {
  Flame,
  Shield,
  ArrowRight,
  Zap,
  Lock,
  CheckCircle2,
  AlertCircle,
  LayoutDashboard,
  Users,
  BarChart3,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const { user, loginWithGoogle, isOnboarded, isLoading: authLoading } = useAuth();

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // If user is already logged in, enforce onboarding check
  React.useEffect(() => {
    if (user && !authLoading) {
      if (!isOnboarded) {
        router.push('/onboarding');
      } else {
        router.push('/app/individual');
      }
    }
  }, [user, isOnboarded, authLoading, router]);

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setIsLoading(true);
    try {
      await loginWithGoogle();
      // On browser, signInWithOAuth will redirect to Google's consent screen
    } catch (err: any) {
      setErrorMsg(err.message || 'Google authentication failed');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-[#08090B]">
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#08090B]/90 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-neon/10 border border-neon/40 flex items-center justify-center text-neon shadow-[0_0_15px_rgba(204,255,0,0.25)] group-hover:scale-105 transition-transform">
              <Flame className="w-4 h-4 text-neon" />
            </div>
            <span className="font-display text-xl tracking-wider uppercase text-white">
              WINTER ARC
            </span>
          </Link>

          {/* Quick Page Links */}
          <nav className="flex items-center gap-1.5 p-1 rounded-full bg-white/[0.04] border border-white/[0.08]">
            <Link
              href="/"
              className="px-3.5 py-1.5 text-xs font-mono font-bold uppercase rounded-full bg-neon text-black"
            >
              Home
            </Link>
            <Link
              href="/app/individual"
              className="px-3.5 py-1.5 text-xs font-mono font-bold uppercase rounded-full text-gray-300 hover:text-white hover:bg-white/[0.06] transition-all"
            >
              Cockpit
            </Link>
            <Link
              href="/app/members"
              className="px-3.5 py-1.5 text-xs font-mono font-bold uppercase rounded-full text-gray-300 hover:text-white hover:bg-white/[0.06] transition-all"
            >
              Members
            </Link>
            <Link
              href="/app/records"
              className="px-3.5 py-1.5 text-xs font-mono font-bold uppercase rounded-full text-gray-300 hover:text-white hover:bg-white/[0.06] transition-all"
            >
              Records
            </Link>
          </nav>
        </div>
      </header>

      {/* Marquee Banner */}
      <MarqueeTicker />

      {/* Hero & Embedded Mandatory Google Login Section */}
      <section className="relative pt-10 pb-16 px-4 max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Left Side: Hero Info */}
        <div className="lg:col-span-6 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neon/10 border border-neon/30 shadow-[0_0_20px_rgba(204,255,0,0.2)] mb-4"
          >
            <span className="w-2 h-2 rounded-full bg-neon animate-ping" />
            <span className="text-xs font-mono font-bold text-neon tracking-widest uppercase">
              THE 90-DAY ARENA IS LIVE • REAL USERS ONLY
            </span>
          </motion.div>

          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl tracking-tight text-white uppercase leading-[0.95] mb-4">
            SUPREME DISCIPLINE. <br />
            <span className="text-neon drop-shadow-[0_0_35px_rgba(204,255,0,0.35)]">
              VERIFIED CHALLENGERS.
            </span>
          </h1>

          <p className="text-sm text-gray-300 font-sans leading-relaxed mb-6 max-w-lg mx-auto lg:mx-0">
            Sign in with your Google account. Your official name and Google profile picture (PFP) are automatically synced to Supabase database. Zero fake AI entries, zero mock tasks.
          </p>

          {/* Quick Page Jump Chips */}
          <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
            <Link href="/app/individual">
              <Button variant="secondary" size="sm" className="text-xs font-mono gap-1.5 border-white/20 hover:border-neon hover:text-neon">
                <LayoutDashboard className="w-3.5 h-3.5 text-neon" />
                <span>Go to Cockpit</span>
              </Button>
            </Link>
            <Link href="/app/members">
              <Button variant="secondary" size="sm" className="text-xs font-mono gap-1.5 border-white/20 hover:border-neon hover:text-neon">
                <Users className="w-3.5 h-3.5 text-primary" />
                <span>Members Arena</span>
              </Button>
            </Link>
            <Link href="/app/records">
              <Button variant="secondary" size="sm" className="text-xs font-mono gap-1.5 border-white/20 hover:border-neon hover:text-neon">
                <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
                <span>Records Ledger</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Right Side: MANDATORY GOOGLE AUTHENTICATION CARD */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto">
          <Card className="p-8 border-neon/30 bg-[#0d110c]/95 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_35px_rgba(204,255,0,0.15)] relative overflow-hidden">
            {/* Top Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-neon to-transparent" />

            <div className="text-center mb-6">
              <Badge variant="cyan" className="mb-2 bg-neon/10 text-neon border-neon/30 font-mono text-[10px] tracking-widest uppercase">
                COMPULSORY AUTHENTICATION
              </Badge>
              <h2 className="font-display text-3xl sm:text-4xl text-white uppercase tracking-wide">
                ENTER THE ARENA
              </h2>
              <p className="text-xs text-gray-400 font-mono mt-1.5 leading-relaxed">
                Sign in with your Google account to auto-sync your real name, official PFP, and record every metric into Supabase.
              </p>
            </div>

            {/* Verification Features List */}
            <div className="space-y-3 mb-7 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs font-mono text-gray-300">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-neon shrink-0" />
                <span>Auto-loads your Google Name &amp; Profile Picture</span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                <span>100% Data saved into Supabase Cloud Database</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Zero AI fake metrics • Real friends audit</span>
              </div>
            </div>

            {/* Error message */}
            {errorMsg && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 font-mono">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* MANDATORY GOOGLE OAUTH BUTTON */}
            <Button
              type="button"
              variant="primary"
              size="lg"
              className="w-full bg-neon text-black font-extrabold hover:bg-neon-hover border-neon shadow-[0_0_30px_rgba(204,255,0,0.35)] uppercase font-mono tracking-wider h-14 flex items-center justify-center gap-3.5 text-sm"
              onClick={handleGoogleLogin}
              isLoading={isLoading}
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path fill="#000000" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z" />
                <path fill="#000000" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                <path fill="#000000" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 14.5s.7 4.8 1.9 7.2l3.7-2.9z" />
                <path fill="#000000" d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2-6.4-4.8L1.9 16.9C3.7 20.6 7.5 23.5 12 23.5z" />
              </svg>
              <span>SIGN IN WITH GOOGLE</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>

            <p className="text-center text-[10px] text-gray-500 font-mono uppercase tracking-widest mt-4">
              Single-Click Direct Access • No Password Needed
            </p>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-6 border-t border-white/[0.08] text-center text-xs text-gray-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-display tracking-wider text-sm text-gray-300">WINTER ARC CHALLENGE</span>
          <span>DISCIPLINE OVER MOTIVATION • POWERED BY SUPABASE &amp; GOOGLE AUTH</span>
        </div>
      </footer>
    </div>
  );
}
