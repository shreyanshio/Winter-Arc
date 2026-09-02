'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Home,
  LayoutDashboard,
  Moon,
  Smartphone,
  Utensils,
  GraduationCap,
  Dumbbell,
  CheckSquare,
  Users,
  BarChart3,
  Flame,
} from 'lucide-react';

const DOCK_ITEMS = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Cockpit', href: '/app/individual', icon: LayoutDashboard },
  { name: 'Sleep', href: '/app/individual/sleep', icon: Moon },
  { name: 'Screen', href: '/app/individual/screen-time', icon: Smartphone },
  { name: 'Diet AI', href: '/app/individual/diet', icon: Utensils },
  { name: 'Study', href: '/app/individual/study', icon: GraduationCap },
  { name: 'Gym', href: '/app/individual/gym', icon: Dumbbell },
  { name: 'Tasks', href: '/app/individual/tasks', icon: CheckSquare },
  { name: 'Members', href: '/app/members', icon: Users },
  { name: 'Records', href: '/app/records', icon: BarChart3 },
];

export function SpatialDock() {
  const pathname = usePathname();

  // Hide only on login and onboarding
  if (pathname === '/login' || pathname === '/onboarding') return null;

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 max-w-[calc(100vw-1.5rem)]">
      <motion.nav
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-1 sm:gap-1.5 px-3 py-2 rounded-full bg-[#0e120d]/90 border border-white/15 backdrop-blur-2xl shadow-[0_10px_35px_rgba(0,0,0,0.8),0_0_20px_rgba(204,255,0,0.12)] overflow-x-auto no-scrollbar"
      >
        {/* Brand Dot */}
        <div className="w-7 h-7 rounded-full bg-neon/10 border border-neon/40 flex items-center justify-center shrink-0 mr-1 hidden sm:flex">
          <Flame className="w-3.5 h-3.5 text-neon animate-pulse" />
        </div>

        {DOCK_ITEMS.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : item.href === '/app/individual'
              ? pathname === '/app/individual'
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center px-2.5 sm:px-3 py-1.5 rounded-full transition-all group shrink-0 ${
                isActive
                  ? 'bg-neon text-black font-bold shadow-[0_0_15px_rgba(204,255,0,0.3)]'
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span
                className={`text-[10px] font-mono tracking-tight mt-0.5 ${
                  isActive ? 'text-black font-extrabold' : 'text-gray-400'
                }`}
              >
                {item.name}
              </span>

              {isActive && (
                <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-neon" />
              )}
            </Link>
          );
        })}
      </motion.nav>
    </div>
  );
}
