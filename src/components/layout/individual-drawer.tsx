'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/lib/store';
import {
  Moon,
  Smartphone,
  Utensils,
  GraduationCap,
  Dumbbell,
  CheckSquare,
  X,
  Flame,
  LayoutDashboard,
  ShieldCheck,
  Users,
  BarChart3,
} from 'lucide-react';

const MODULES = [
  {
    name: 'Home',
    href: '/',
    icon: Flame,
    desc: 'Public arena overview & protocol',
  },
  {
    name: 'Cockpit Overview',
    href: '/app/individual',
    icon: LayoutDashboard,
    desc: 'Daily status & metric overview',
  },
  {
    name: 'Members Directory',
    href: '/app/members',
    icon: Users,
    desc: 'Real friend & challenger community',
  },
  {
    name: 'Records Analytics',
    href: '/app/records',
    icon: BarChart3,
    desc: 'Performance charts & auditable ledger',
  },
  {
    name: 'Sleep & Circadian',
    href: '/app/individual/sleep',
    icon: Moon,
    desc: 'Live sleep timer & Bluetooth sync',
  },
  {
    name: 'Screen Time',
    href: '/app/individual/screen-time',
    icon: Smartphone,
    desc: 'Daily usage & proof verification',
  },
  {
    name: 'Health & Diet (AI)',
    href: '/app/individual/diet',
    icon: Utensils,
    desc: 'Gemini Flash meal calorie parse',
  },
  {
    name: 'Study Chamber',
    href: '/app/individual/study',
    icon: GraduationCap,
    desc: 'Dual timers, streams & Pomodoro',
  },
  {
    name: 'Gym & Workouts',
    href: '/app/individual/gym',
    icon: Dumbbell,
    desc: '8 muscle groups, METs & steps',
  },
  {
    name: 'Daily Tasks',
    href: '/app/individual/tasks',
    icon: CheckSquare,
    desc: 'Checklist with 12:00 AM lock',
  },
  {
    name: 'Sign In / Account',
    href: '/login',
    icon: ShieldCheck,
    desc: 'Manage challenger login & registration',
  },
];

import { useAuth } from '@/lib/auth-context';

export function IndividualDrawer() {
  const { isDrawerOpen, setDrawerOpen } = useUIStore();
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user) return null;

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDrawerOpen(false)}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          />

          {/* Slide-out drawer panel */}
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed inset-y-0 left-0 z-50 w-full max-w-xs sm:max-w-sm bg-[#0C0E14] border-r border-white/[0.08] shadow-2xl flex flex-col justify-between"
          >
            <div>
              {/* Header */}
              <div className="p-5 border-b border-white/[0.08] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
                    <Flame className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-mono text-xs font-bold text-gray-200 tracking-wider uppercase">
                    Individual Cockpit
                  </span>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modules list */}
              <div className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
                {MODULES.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setDrawerOpen(false)}
                      className={`flex items-start gap-3 p-3 rounded-xl transition-all ${
                        isActive
                          ? 'bg-primary/15 border border-primary/40 text-white shadow-[0_0_15px_rgba(79,209,255,0.15)]'
                          : 'text-gray-300 hover:bg-white/[0.04] border border-transparent'
                      }`}
                    >
                      <div
                        className={`p-2 rounded-lg mt-0.5 ${
                          isActive ? 'bg-primary text-black' : 'bg-white/[0.06] text-gray-300'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold truncate">{item.name}</div>
                        <div className="text-xs text-gray-400 truncate">{item.desc}</div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Footer Discipline Reminder */}
            <div className="p-4 border-t border-white/[0.08] bg-white/[0.02]">
              <div className="text-[11px] text-gray-400 font-mono text-center">
                ❄️ UNCOMPROMISING DISCIPLINE • MIDNIGHT LOCK
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
