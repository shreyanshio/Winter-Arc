export interface BulletMarker {
  glyph: string;
  bg: string;
  border: string;
  text: string;
}

export const BULLET_PALETTE: BulletMarker[] = [
  { glyph: '✦', bg: 'bg-cyan-500/15', border: 'border-cyan-400/40', text: 'text-cyan-300' },
  { glyph: '▲', bg: 'bg-blue-500/15', border: 'border-blue-400/40', text: 'text-blue-300' },
  { glyph: '◈', bg: 'bg-indigo-500/15', border: 'border-indigo-400/40', text: 'text-indigo-300' },
  { glyph: '❖', bg: 'bg-violet-500/15', border: 'border-violet-400/40', text: 'text-violet-300' },
  { glyph: '⚡', bg: 'bg-amber-500/15', border: 'border-amber-400/40', text: 'text-amber-300' },
  { glyph: '❄', bg: 'bg-sky-500/15', border: 'border-sky-300/40', text: 'text-sky-200' },
  { glyph: '◆', bg: 'bg-emerald-500/15', border: 'border-emerald-400/40', text: 'text-emerald-300' },
  { glyph: '●', bg: 'bg-teal-500/15', border: 'border-teal-400/40', text: 'text-teal-300' },
  { glyph: '✶', bg: 'bg-fuchsia-500/15', border: 'border-fuchsia-400/40', text: 'text-fuchsia-300' },
  { glyph: '■', bg: 'bg-rose-500/15', border: 'border-rose-400/40', text: 'text-rose-300' },
  { glyph: '★', bg: 'bg-yellow-500/15', border: 'border-yellow-400/40', text: 'text-yellow-300' },
  { glyph: '⬡', bg: 'bg-cyan-400/20', border: 'border-cyan-300/50', text: 'text-cyan-200' },
];

export function getBulletForIndex(index: number): BulletMarker {
  return BULLET_PALETTE[index % BULLET_PALETTE.length];
}
