import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/components/providers';
import NavBar from '@/components/navBar';

export const metadata: Metadata = {
  title: 'Habit Battles',
  description: 'Track habits and battle friends with streaks.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900">
        <NavBar />
        <main className="max-w-5xl mx-auto px-4 py-6">
          <Providers>{children}</Providers>
        </main>
      </body>
    </html>
  );
}