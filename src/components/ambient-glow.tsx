import React from 'react';

export function AmbientGlow() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Primary icy cyan ambient blob */}
      <div className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-gradient-to-b from-cyan-500/15 via-sky-600/10 to-transparent blur-[140px] opacity-70" />
      {/* Subtle deep violet atmospheric glow */}
      <div className="absolute top-[40%] -right-[15%] w-[600px] h-[600px] rounded-full bg-violet-600/10 blur-[160px] opacity-50" />
      {/* Subtle cold blue baseline glow */}
      <div className="absolute -bottom-[20%] -left-[10%] w-[550px] h-[550px] rounded-full bg-cyan-700/10 blur-[150px] opacity-40" />
    </div>
  );
}
