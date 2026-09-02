import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, icon, type = 'text', ...props }, ref) => {
    return (
      <div className="w-full relative">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          type={type}
          ref={ref}
          className={twMerge(
            clsx(
              'flex h-11 w-full rounded-xl bg-white/[0.05] border border-white/[0.1] px-3.5 py-2 text-sm text-foreground placeholder:text-gray-500 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-50 transition-all',
              icon && 'pl-10',
              error && 'border-rose-500/60 focus:border-rose-500 focus:ring-rose-500/40',
              className
            )
          )}
          {...props}
        />
        {error && <p className="text-xs text-rose-400 mt-1 pl-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
