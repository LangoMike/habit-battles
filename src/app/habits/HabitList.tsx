'use client';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';

export default function HabitList({ userId }: { userId: string }) {
  const [habits, setHabits] = useState<any[]>([]);
  const [today, setToday] = useState('');
  const tz = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, []);

  useEffect(() => {
    const t = new Date(new Date().toLocaleString('en-US', { timeZone: tz }));
    const iso = new Date(Date.UTC(t.getFullYear(), t.getMonth(), t.getDate())).toISOString().slice(0,10);
    setToday(iso);
    fetchData();
    const sub = supabase
      .channel('realtime:checkins')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'checkins' }, () => fetchData())
      .subscribe();
    return () => { supabase.removeChannel(sub); };
  }, []);

  const fetchData = async () => {
    const { data: habits } = await supabase.from('habits').select('*').eq('user_id', userId).order('created_at', { ascending: true });
    if (!habits) return;
    const ids = habits.map(h => h.id);
    const { data: checkins } = await supabase.from('checkins').select('*').in('habit_id', ids).eq('checkin_date', today);
    const doneSet = new Set((checkins ?? []).map(c => c.habit_id));
    setHabits(habits.map(h => ({ ...h, doneToday: doneSet.has(h.id) })));
  };

  const checkIn = async (habitId: string) => {
    const { error } = await supabase.from('checkins').insert({ habit_id: habitId, user_id: userId, checkin_date: today });
    if (error && !error.message.includes('duplicate key')) alert(error.message);
    await fetchData();
  };

  return (
    <div className="grid gap-3">
      {habits.map(h => (
        <div key={h.id} className="border rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="font-medium">{h.name}</div>
            <div className="text-xs opacity-60">{h.schedule === 'daily' ? 'Daily' : 'Custom'}</div>
          </div>
          {h.doneToday ? (
            <span className="text-sm">✅ Done today</span>
          ) : (
            <Button onClick={() => checkIn(h.id)}>Check in</Button>
          )}
        </div>
      ))}
      {habits.length === 0 && <p className="opacity-70">No habits yet... Start your jorney and create one!</p>}
    </div>
  );
}