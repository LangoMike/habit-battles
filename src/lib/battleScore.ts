import { supabase } from './supabaseClient';

/**
 * Calculates battle score for a user during a specific date range
 * Score = number of habits that met their weekly quota during the battle period
 * @param userId - The user's ID
 * @param startDate - Battle start date (ISO string)
 * @param endDate - Battle end date (ISO string)
 * @returns Battle score and detailed progress
 */
export type BattleScore = {
  score: number;
  totalHabits: number;
  habitProgress: Array<{
    habitId: string;
    habitName: string;
    target: number;
    completed: number;
    isMet: boolean;
  }>;
};

export async function calculateBattleScore(
  userId: string,
  startDate: string,
  endDate: string
): Promise<BattleScore> {
  // Get all user's habits
  const { data: habits, error: habitsError } = await supabase
    .from('habits')
    .select('id, name, target_per_week')
    .eq('user_id', userId);

  if (habitsError) {
    console.error('Error fetching habits:', habitsError);
    return {
      score: 0,
      totalHabits: 0,
      habitProgress: []
    };
  }

  const habitsArray = habits || [];
  if (habitsArray.length === 0) {
    return {
      score: 0,
      totalHabits: 0,
      habitProgress: []
    };
  }

  // Get checkins during the battle period
  const { data: battleCheckins, error: checkinsError } = await supabase
    .from('checkins')
    .select('habit_id, checkin_date')
    .eq('user_id', userId)
    .gte('checkin_date', startDate)
    .lte('checkin_date', endDate);

  if (checkinsError) {
    console.error('Error fetching checkins:', checkinsError);
    return {
      score: 0,
      totalHabits: habitsArray.length,
      habitProgress: habitsArray.map(habit => ({
        habitId: habit.id,
        habitName: habit.name,
        target: habit.target_per_week,
        completed: 0,
        isMet: false
      }))
    };
  }

  // Count checkins per habit during battle period
  const habitProgress = new Map<string, number>();
  (battleCheckins || []).forEach(checkin => {
    const count = habitProgress.get(checkin.habit_id) || 0;
    habitProgress.set(checkin.habit_id, count + 1);
  });

  // Calculate score: each habit that meets its quota = 1 point
  let score = 0;
  const progress = habitsArray.map(habit => {
    const completed = habitProgress.get(habit.id) || 0;
    const isMet = completed >= habit.target_per_week;
    if (isMet) score++;
    
    return {
      habitId: habit.id,
      habitName: habit.name,
      target: habit.target_per_week,
      completed,
      isMet
    };
  });

  return {
    score,
    totalHabits: habitsArray.length,
    habitProgress: progress
  };
}
