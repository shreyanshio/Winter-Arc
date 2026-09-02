'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends HTMLMotionProps<'div'> {
  hoverEffect?: boolean;
  glow?: 'cyan' | 'none';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, hoverEffect = false, glow = 'none', children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        whileHover={hoverEffect ? { y: -3, boxShadow: '0 12px 32px -8px rgba(0, 0, 0, 0.6), 0 0 20px -2px rgba(79, 209, 255, 0.15)' } : undefined}
        transition={{ duration: 0.2 }}
        className={twMerge(
          clsx(
            'relative rounded-2xl bg-white/[0.04] backdrop-blur-glass border border-white/[0.08] p-6 text-foreground overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.4)]',
            glow === 'cyan' && 'border-primary/30 shadow-[0_0_24px_rgba(79,209,255,0.12)]',
            className
          )
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';
