import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'cyan' | 'frost' | 'outline' | 'success' | 'warning';
}

export function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  const variants = {
    default: 'bg-white/[0.08] text-gray-200 border-white/10',
    cyan: 'bg-primary/15 text-primary border-primary/30 shadow-[0_0_12px_rgba(79,209,255,0.2)] font-mono',
    frost: 'bg-frost-500/20 text-frost-300 border-frost-400/30',
    outline: 'bg-transparent text-gray-400 border-white/15',
    success: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    warning: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide transition-colors select-none',
          variants[variant],
          className
        )
      )}
      {...props}
    >
      {children}
    </span>
  );
}
