'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const sendMagic = async () => {
    setErr(null);
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${location.origin}/callback` } });
    if (error) setErr(error.message);
    else setSent(true);
  };

  return (
    <Card className="max-w-md mx-auto p-6">
      <h1 className="text-xl font-semibold mb-4">Sign in</h1>
      <div className="space-y-3">
        <Input placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} />
        <Button onClick={sendMagic} disabled={!email}>Send magic link</Button>
        {sent && <p className="text-sm">Check your email for a magic link.</p>}
        {err && <p className="text-sm text-red-600">{err}</p>}
      </div>
    </Card>
  );
}