import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/components/providers';
import NavBar from '@/components/navBar';
import { Rajdhani } from 'next/font/google';

const rajdhani = Rajdhani({ subsets: ['latin'], weight: ['400','500','600','700'], display: 'swap' });

export const metadata: Metadata = {
  title: 'Habit Battles',
  description: 'Track habits and battle friends with streaks.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${rajdhani.className} min-h-screen text-foreground bg-background [background-image:radial-gradient(1200px_500px_at_50%_-10%,rgba(239,68,68,0.15),transparent),radial-gradient(1000px_400px_at_50%_120%,rgba(255,255,255,0.06),transparent)]`}>
        <NavBar />
        <main className="max-w-5xl mx-auto px-4 py-6">
          <Providers>{children}</Providers>
        </main>
      </body>
    </html>
  );
}