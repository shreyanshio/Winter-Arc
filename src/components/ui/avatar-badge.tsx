import React from 'react';

interface AvatarBadgeProps {
  name: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const GRADIENTS = [
  'from-cyan-500 to-blue-600',
  'from-lime-400 to-emerald-600',
  'from-purple-500 to-indigo-600',
  'from-amber-400 to-rose-500',
  'from-fuchsia-500 to-pink-600',
  'from-teal-400 to-cyan-600',
];

export function AvatarBadge({ name, className = '', size = 'md' }: AvatarBadgeProps) {
  const initials = name
    .split(/[\s_]+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'W';

  const charCode = (name.charCodeAt(0) || 0) + (name.charCodeAt(1) || 0);
  const gradient = GRADIENTS[charCode % GRADIENTS.length];

  const sizeClasses = {
    sm: 'w-7 h-7 text-[10px]',
    md: 'w-10 h-10 text-xs',
    lg: 'w-14 h-14 text-base font-bold',
  };

  return (
    <div
      className={`rounded-full bg-gradient-to-tr ${gradient} flex items-center justify-center font-mono font-bold text-black border border-white/20 shadow-sm shrink-0 select-none ${sizeClasses[size]} ${className}`}
    >
      {initials}
    </div>
  );
}
