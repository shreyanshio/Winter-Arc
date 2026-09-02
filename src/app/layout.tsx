import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { AmbientGlow } from '@/components/ambient-glow';
import { IndividualDrawer } from '@/components/layout/individual-drawer';
import { SpatialDock } from '@/components/layout/spatial-dock';

export const metadata: Metadata = {
  title: 'Winter Arc Challenge — Engineered for Supreme Discipline',
  description:
    'An uncompromising social accountability platform for your Winter Arc. Track sleep, screen time, diet with Gemini AI, studies, workouts, and daily discipline in real-time.',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#08090B',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#08090B] text-foreground min-h-screen antialiased selection:bg-neon selection:text-black pb-24">
        <AuthProvider>
          <AmbientGlow />
          <div className="relative z-10 flex min-h-screen flex-col">
            {children}
          </div>
          <IndividualDrawer />
          <SpatialDock />
        </AuthProvider>
      </body>
    </html>
  );
}
