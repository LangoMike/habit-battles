'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type Profile = { username: string | null; avatar_url: string | null };

export default function ProfilePage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile>({ username: '', avatar_url: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return (location.href = '/login');
      setUserId(data.user.id);
      const { data: row } = await supabase.from('profiles').select('username, avatar_url').eq('id', data.user.id).single();
      if (row) setProfile({ username: row.username, avatar_url: row.avatar_url });
    });
  }, []);

  const save = async () => {
    if (!userId) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').upsert({ id: userId, username: profile.username, avatar_url: profile.avatar_url });
    setSaving(false);
    if (error) toast.error(error.message); else toast.success('Profile saved');
  };

  return (
    <Card className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Your Profile</h1>
      <label className="grid gap-1 text-sm">
        <span className="font-medium">Username</span>
        <Input value={profile.username ?? ''} onChange={(e)=>setProfile(p=>({ ...p, username: e.target.value }))} />
      </label>
      <label className="grid gap-1 text-sm">
        <span className="font-medium">Avatar URL</span>
        <Input value={profile.avatar_url ?? ''} onChange={(e)=>setProfile(p=>({ ...p, avatar_url: e.target.value }))} />
      </label>
      <Button onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
    </Card>
  );
}


