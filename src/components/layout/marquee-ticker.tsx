'use client';

import React from 'react';

export function MarqueeTicker() {
  const items = [
    'WINTER ARC PROTOCOL',
    '90 DAYS OF SUPREME DISCIPLINE',
    '12:00 AM LOCAL MIDNIGHT LOCK',
    'GEMINI FLASH NUTRITION AI',
    'SUB-3S REALTIME SYNC',
    'PUBLIC SPECTATOR ARENA',
    'BLE SMARTWATCH HEART-RATE',
    'ZERO COMPROMISE',
  ];

  return (
    <div className="w-full bg-[#0a0d0a] border-y border-white/[0.08] py-2 overflow-hidden select-none">
      <div className="animate-marquee whitespace-nowrap flex items-center gap-6">
        {items.concat(items).concat(items).map((text, idx) => (
          <div key={idx} className="flex items-center gap-6 text-xs font-mono tracking-widest uppercase">
            <span className="text-neon font-bold">✦</span>
            <span className="text-gray-300 font-semibold">{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
