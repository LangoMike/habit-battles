export function currentStreak(checkinsISO: string[], schedule: 'daily' | number[], tz: string) {
  const set = new Set(checkinsISO);
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: tz }));
  let d = now;
  let streak = 0;
  const isRequiredDay = (date: Date) => {
    if (schedule === 'daily') return true;
    const dow = date.getDay();
    return (schedule as number[]).includes(dow);
  };
  while (true) {
    const iso = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())).toISOString().slice(0,10);
    if (isRequiredDay(d)) {
      if (!set.has(iso)) break;
      streak++;
    }
    d = new Date(d);
    d.setDate(d.getDate() - 1);
  }
  return streak;
}