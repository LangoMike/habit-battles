'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

export default function NavBar() {
  const [email, setEmail] = useState<string | null>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);
  return (
    <nav className="w-full border-b bg-white/60 backdrop-blur sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex gap-4 items-center">
          <Link href="/dashboard" className="font-semibold">Habit Battles</Link>
          <Link href="/habits" className="text-sm opacity-80 hover:opacity-100">Habits</Link>
          <Link href="/battles" className="text-sm opacity-80 hover:opacity-100">Battles</Link>
        </div>
        <div className="flex items-center gap-3">
          {email ? (
            <>
              <span className="text-sm hidden sm:block">{email}</span>
              <Avatar className="h-8 w-8"><AvatarFallback>{email[0]?.toUpperCase() ?? 'U'}</AvatarFallback></Avatar>
              <Button size="sm" variant="secondary" onClick={() => supabase.auth.signOut().then(()=>location.href='/')}>Sign out</Button>
            </>
          ) : (
            <Button size="sm" asChild><Link href="/login">Login</Link></Button>
          )}
        </div>
      </div>
    </nav>
  );
}