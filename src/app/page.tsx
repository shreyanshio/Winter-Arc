'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MarqueeTicker } from '@/components/layout/marquee-ticker';
import {
  Flame,
  Shield,
  Eye,
  ArrowRight,
  Zap,
  Lock,
  User,
  Mail,
  CheckCircle2,
  AlertCircle,
  Send,
  LayoutDashboard,
  Users,
  BarChart3,
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const { user, loginWithGoogle, loginWithTelegramPayload, signInWithEmail, signUpWithEmail } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [telegramUsername, setTelegramUsername] = useState('');
  const [showTelegramInput, setShowTelegramInput] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // If user is already logged in, redirect directly to Cockpit
  React.useEffect(() => {
    if (user) {
      router.push('/app/individual');
    }
  }, [user, router]);

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setIsLoading(true);
    try {
      await loginWithGoogle();
      router.push('/app/individual');
    } catch (err: any) {
      setErrorMsg(err.message || 'Google authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setErrorMsg('Please provide both email and password.');
      return;
    }

    setIsLoading(true);

    if (mode === 'signup') {
      if (!displayName.trim()) {
        setErrorMsg('Please enter your Warrior Display Name.');
        setIsLoading(false);
        return;
      }
      const res = await signUpWithEmail(email, password, displayName);
      if (res.success) {
        setSuccessMsg('Profile created! Entering the Winter Arc arena...');
        setTimeout(() => router.push('/app/individual'), 600);
      } else {
        setErrorMsg(res.error || 'Failed to create profile.');
      }
    } else {
      const res = await signInWithEmail(email, password);
      if (res.success) {
        setSuccessMsg('Authenticated! Welcome back, warrior.');
        setTimeout(() => router.push('/app/individual'), 600);
      } else {
        setErrorMsg(res.error || 'Invalid credentials.');
      }
    }

    setIsLoading(false);
  };

  const handleTelegramAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!telegramUsername.trim()) return;
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const ok = await loginWithTelegramPayload({
        id: Math.floor(Math.random() * 899999999 + 100000000),
        first_name: telegramUsername.trim(),
        username: telegramUsername.trim().toLowerCase().replace(/\s+/g, '_'),
        auth_date: Math.floor(Date.now() / 1000),
      });

      if (ok) {
        router.push('/app/individual');
      } else {
        setErrorMsg('Telegram login could not be verified.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Telegram auth error');
    } finally {
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
              className="px-3 py-1.5 text-xs font-mono font-bold uppercase rounded-full bg-neon text-black"
            >
              Home / Login
            </Link>
            <Link
              href="/app/individual"
              className="px-3 py-1.5 text-xs font-mono font-bold uppercase rounded-full text-gray-300 hover:text-white hover:bg-white/[0.06] transition-all"
            >
              Cockpit
            </Link>
            <Link
              href="/app/members"
              className="px-3 py-1.5 text-xs font-mono font-bold uppercase rounded-full text-gray-300 hover:text-white hover:bg-white/[0.06] transition-all"
            >
              Members
            </Link>
            <Link
              href="/app/records"
              className="px-3 py-1.5 text-xs font-mono font-bold uppercase rounded-full text-gray-300 hover:text-white hover:bg-white/[0.06] transition-all"
            >
              Records
            </Link>
          </nav>
        </div>
      </header>

      {/* Marquee Banner */}
      <MarqueeTicker />

      {/* Hero & Embedded Login Section */}
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
              THE 90-DAY ARENA IS LIVE
            </span>
          </motion.div>

          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl tracking-tight text-white uppercase leading-[0.95] mb-4">
            SUPREME DISCIPLINE. <br />
            <span className="text-neon drop-shadow-[0_0_35px_rgba(204,255,0,0.35)]">
              REAL CHALLENGERS.
            </span>
          </h1>

          <p className="text-sm text-gray-300 font-sans leading-relaxed mb-6 max-w-lg mx-auto lg:mx-0">
            Sign in or create your profile below. All data is entered live by real users — no AI fake entries, zero mock tasks.
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

        {/* Right Side: DIRECT EMBEDDED LOGIN FORM ON LOCALHOST:3000 */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto">
          <Card className="p-7 border-white/[0.12] bg-[#0d110c]/95 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(204,255,0,0.12)]">
            <div className="text-center mb-6">
              <h2 className="font-display text-3xl text-white uppercase tracking-wide">
                {mode === 'signin' ? 'SIGN IN TO ARENA' : 'CREATE REAL PROFILE'}
              </h2>
              <p className="text-xs text-gray-400 font-mono mt-1">
                {mode === 'signin'
                  ? 'Enter your credentials to access your cockpit'
                  : 'Register a real profile for you or your friends'}
              </p>
            </div>

            {/* Switcher Tabs */}
            <div className="grid grid-cols-2 p-1 rounded-xl bg-white/[0.04] border border-white/[0.08] mb-5">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`py-2 text-xs font-bold font-mono uppercase tracking-wider rounded-lg transition-all ${
                  mode === 'signin'
                    ? 'bg-neon text-black shadow-[0_0_15px_rgba(204,255,0,0.25)]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`py-2 text-xs font-bold font-mono uppercase tracking-wider rounded-lg transition-all ${
                  mode === 'signup'
                    ? 'bg-neon text-black shadow-[0_0_15px_rgba(204,255,0,0.25)]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Feedback messages */}
            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 font-mono">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 font-mono">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Google OAuth Button */}
            <Button
              type="button"
              variant="secondary"
              size="lg"
              className="w-full font-bold text-xs uppercase font-mono tracking-wider flex items-center justify-center gap-3 border-white/15 hover:border-neon hover:text-white mb-4 h-11 shadow-sm"
              onClick={handleGoogleLogin}
              isLoading={isLoading}
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z" />
                <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 14.5s.7 4.8 1.9 7.2l3.7-2.9z" />
                <path fill="#34A853" d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2-6.4-4.8L1.9 16.9C3.7 20.6 7.5 23.5 12 23.5z" />
              </svg>
              <span>Continue with Google</span>
            </Button>

            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-white/[0.08] w-full" />
              <span className="bg-[#0d110c] px-3 text-[10px] text-gray-500 uppercase tracking-widest font-mono">
                or email & password
              </span>
            </div>

            {/* Email & Password Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {mode === 'signup' && (
                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 uppercase font-mono tracking-wider mb-1">
                    Display Name / Handle
                  </label>
                  <Input
                    placeholder="e.g. Marcus_Vanguard"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    icon={<User className="w-4 h-4 text-gray-400" />}
                    className="h-10 text-xs"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-gray-300 uppercase font-mono tracking-wider mb-1">
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="warrior@winterarc.io"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={<Mail className="w-4 h-4 text-gray-400" />}
                  className="h-10 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-300 uppercase font-mono tracking-wider mb-1">
                  Password
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={<Lock className="w-4 h-4 text-gray-400" />}
                  className="h-10 text-xs"
                  required
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full bg-neon text-black font-extrabold hover:bg-neon-hover border-neon shadow-[0_0_20px_rgba(204,255,0,0.3)] uppercase font-mono tracking-wider h-11 gap-2 mt-2 text-xs"
                isLoading={isLoading}
              >
                <span>{mode === 'signin' ? 'Sign In Now' : 'Create Profile'}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>

            {/* Telegram Toggle Section */}
            <div className="mt-4 pt-3 border-t border-white/[0.08]">
              {!showTelegramInput ? (
                <button
                  type="button"
                  onClick={() => setShowTelegramInput(true)}
                  className="w-full text-center text-xs text-gray-400 hover:text-neon transition-colors font-mono flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5 text-primary" />
                  <span>Telegram Login</span>
                </button>
              ) : (
                <form onSubmit={handleTelegramAuth} className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="@telegram_username"
                      value={telegramUsername}
                      onChange={(e) => setTelegramUsername(e.target.value)}
                      icon={<Send className="w-4 h-4 text-primary" />}
                      className="h-9 text-xs"
                    />
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      className="bg-neon text-black font-bold h-9 px-3 text-xs font-mono"
                      disabled={!telegramUsername.trim() || isLoading}
                    >
                      Verify
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-6 border-t border-white/[0.08] text-center text-xs text-gray-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-display tracking-wider text-sm text-gray-300">WINTER ARC CHALLENGE</span>
          <span>DISCIPLINE OVER MOTIVATION • BUILT FOR REAL WARRIORS</span>
        </div>
      </footer>
    </div>
  );
}
