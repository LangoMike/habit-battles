'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

export default function Dashboard() {
  const [email, setEmail] = useState<string | null>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) location.href = '/login';
      else setEmail(data.user.email ?? null);
    });
  }, []);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Welcome{email ? `, ${email}` : ''}</h1>
      <div className="space-x-3">
        <Link className="underline" href="/habits">Go to Habits</Link>
        <Link className="underline" href="/battles">Go to Battles</Link>
      </div>
    </div>
  );
}