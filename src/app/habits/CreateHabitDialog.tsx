'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

export default function CreateHabitDialog({ userId, tz }: { userId: string; tz: string }) {
  const [name, setName] = useState('');
  const [open, setOpen] = useState(false);

  const createHabit = async () => {
    const { error } = await supabase.from('habits').insert({ user_id: userId, name, schedule: 'daily', timezone: tz });
    if (!error) { setOpen(false); setName(''); window.location.reload(); }
    else alert(error.message);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>New Habit</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Habit</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input placeholder="e.g., Code 30 minutes" value={name} onChange={e=>setName(e.target.value)} />
          <Button onClick={createHabit} disabled={!name}>Create</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}