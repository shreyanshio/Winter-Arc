'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useUIStore } from '@/lib/store';
import { calculateChallengeDay } from '@/lib/date-utils';
import { Menu, LogOut, Flame, Shield, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AvatarBadge } from '@/components/ui/avatar-badge';

export function TopNav() {
  const pathname = usePathname();
  const { user, profile, logout } = useAuth();
  const { setDrawerOpen } = useUIStore();

  const currentDay = calculateChallengeDay(profile?.challenge_started_at, profile?.timezone);

  const tabs = [
    { name: 'Home', href: '/', match: '/' },
    { name: 'Cockpit', href: '/app/individual', match: '/app/individual' },
    { name: 'Members', href: '/app/members', match: '/app/members' },
    { name: 'Records', href: '/app/records', match: '/app/records' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#08090B]/90 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Left: Brand + Hamburger + Day Counter */}
        <div className="flex items-center gap-3">
          {user && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDrawerOpen(true)}
              className="text-gray-300 hover:text-white"
              title="Open Modules Drawer"
            >
              <Menu className="w-5 h-5" />
            </Button>
          )}

          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-neon/10 border border-neon/40 flex items-center justify-center text-neon group-hover:scale-105 transition-transform shadow-[0_0_15px_rgba(204,255,0,0.25)]">
              <Flame className="w-4 h-4 text-neon" />
            </div>
            <span className="font-display tracking-wide text-lg uppercase text-white hidden sm:inline">
              WINTER ARC
            </span>
          </Link>

          {/* Day N Badge (Only when authenticated) */}
          {user && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-neon/10 border border-neon/30 shadow-[0_0_15px_rgba(204,255,0,0.15)]">
              <span className="w-1.5 h-1.5 rounded-full bg-neon animate-pulse" />
              <span className="text-xs font-mono font-bold text-neon tracking-wider uppercase">
                DAY {currentDay}
              </span>
            </div>
          )}
        </div>

        {/* Center: Navigation Tabs (Only when authenticated) */}
        {user ? (
          <nav className="hidden md:flex items-center gap-1 p-1 rounded-full bg-white/[0.04] border border-white/[0.08]">
            {tabs.map((tab) => {
              const isActive = tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.match);
              return (
                <Link
                  key={tab.name}
                  href={tab.href}
                  className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all uppercase tracking-wider font-mono ${
                    isActive
                      ? 'bg-neon text-black shadow-[0_0_15px_rgba(204,255,0,0.25)]'
                      : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  {tab.name}
                </Link>
              );
            })}
          </nav>
        ) : (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08]">
            <span className="w-2 h-2 rounded-full bg-neon animate-ping" />
            <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider">
              OFFICIAL ARENA • GOOGLE SIGN-IN REQUIRED
            </span>
          </div>
        )}

        {/* Right: User Profile & Actions */}
        <div className="flex items-center gap-3">
          {profile ? (
            <>
              <div className="flex items-center gap-2">
                <AvatarBadge name={profile.display_name} avatarUrl={profile.avatar_url} size="sm" />
                <span className="text-xs font-semibold text-gray-200 hidden sm:inline max-w-[110px] truncate font-mono">
                  {profile.display_name}
                </span>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                className="text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 h-8 w-8"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button
                variant="primary"
                size="sm"
                className="bg-neon text-black font-extrabold hover:bg-neon-hover border-neon text-xs font-mono uppercase px-3.5 h-8 shadow-sm"
              >
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
