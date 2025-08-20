import { supabase } from './supabaseClient';

export type QuotaStats = {
  weeklyQuotasMet: number;
  totalCheckins: number;
  totalHabits: number;
  currentWeekProgress: Array<{
    habitId: string;
    habitName: string;
    target: number;
    completed: number;
    isMet: boolean;
  }>;
};

export async function getQuotaStats(userId: string): Promise<QuotaStats> {
  // Get current week dates (Monday to Sunday)
  const now = new Date();
  const dayOfWeek = now.getDay();
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - daysFromMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  
  const weekStart = monday.toISOString().split('T')[0];
  const weekEnd = sunday.toISOString().split('T')[0];

  // Get all user's habits
  const { data: habits, error: habitsError } = await supabase
    .from('habits')
    .select('id, name, target_per_week')
    .eq('user_id', userId);

  if (habitsError) {
    console.error('Error fetching habits:', habitsError);
    return {
      weeklyQuotasMet: 0,
      totalCheckins: 0,
      totalHabits: habits?.length || 0,
      currentWeekProgress: []
    };
  }

  // Get checkins for this week
  const { data: weekCheckins, error: checkinsError } = await supabase
    .from('checkins')
    .select('habit_id, checkin_date')
    .eq('user_id', userId)
    .gte('checkin_date', weekStart)
    .lte('checkin_date', weekEnd);

  if (checkinsError) {
    console.error('Error fetching checkins:', checkinsError);
    return {
      weeklyQuotasMet: 0,
      totalCheckins: 0,
      totalHabits: habits?.length || 0,
      currentWeekProgress: []
    };
  }

  // Get total checkins (all time)
  const { data: totalCheckins, error: totalError } = await supabase
    .from('checkins')
    .select('id', { count: 'exact' })
    .eq('user_id', userId);

  if (totalError) {
    console.error('Error fetching total checkins:', totalError);
  }

  // Calculate weekly progress for each habit
  const habitProgress = new Map<string, number>();
  weekCheckins?.forEach(checkin => {
    const count = habitProgress.get(checkin.habit_id) || 0;
    habitProgress.set(checkin.habit_id, count + 1);
  });

  let weeklyQuotasMet = 0;
  const currentWeekProgress = habits?.map(habit => {
    const completed = habitProgress.get(habit.id) || 0;
    const isMet = completed >= habit.target_per_week;
    if (isMet) weeklyQuotasMet++;
    
    return {
      habitId: habit.id,
      habitName: habit.name,
      target: habit.target_per_week,
      completed,
      isMet
    };
  }) || [];

  return {
    weeklyQuotasMet,
    totalCheckins: totalCheckins?.length || 0,
    totalHabits: habits?.length || 0,
    currentWeekProgress
  };
}
