import { supabase } from './supabaseClient';

export type StreakData = {
  dailyStreak: number;
  weeklyStreak: number;
  lastCheckinDate: string | null;
};

export async function getStreakData(userId: string): Promise<StreakData> {
  // Get all checkins for the user, ordered by date
  const { data: checkins, error } = await supabase
    .from('checkins')
    .select('checkin_date')
    .eq('user_id', userId)
    .order('checkin_date', { ascending: false });

  if (error || !checkins || checkins.length === 0) {
    return {
      dailyStreak: 0,
      weeklyStreak: 0,
      lastCheckinDate: null
    };
  }

  // Get unique dates (in case multiple habits checked in same day)
  const uniqueDates = [...new Set(checkins.map(c => c.checkin_date))].sort().reverse();
  
  if (uniqueDates.length === 0) {
    return {
      dailyStreak: 0,
      weeklyStreak: 0,
      lastCheckinDate: null
    };
  }

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // Calculate daily streak
  let dailyStreak = 0;
  let currentDate = today;
  
  // If last checkin was today or yesterday, start counting
  if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
    for (let i = 0; i < uniqueDates.length; i++) {
      const checkinDate = uniqueDates[i];
      
      // If this is the first iteration, check if we should start counting
      if (i === 0) {
        if (checkinDate === today) {
          currentDate = today;
          dailyStreak = 1;
        } else if (checkinDate === yesterday) {
          currentDate = yesterday;
          dailyStreak = 1;
        } else {
          break; // Gap too large, no streak
        }
      } else {
        // Check if this date is consecutive
        const expectedDate = new Date(currentDate);
        expectedDate.setDate(expectedDate.getDate() - 1);
        const expectedDateStr = expectedDate.toISOString().split('T')[0];
        
        if (checkinDate === expectedDateStr) {
          dailyStreak++;
          currentDate = checkinDate;
        } else {
          break; // Streak broken
        }
      }
    }
  }

  // Calculate weekly streak (weeks with at least one checkin)
  let weeklyStreak = 0;
  const weeksWithCheckins = new Set<string>();
  
  uniqueDates.forEach(date => {
    const weekStart = getWeekStart(date);
    weeksWithCheckins.add(weekStart);
  });

  const weekStarts = Array.from(weeksWithCheckins).sort().reverse();
  const currentWeekStart = getWeekStart(today);
  const lastWeekStart = getWeekStart(yesterday);

  // If current week or last week has checkins, start counting
  if (weekStarts[0] === currentWeekStart || weekStarts[0] === lastWeekStart) {
    for (let i = 0; i < weekStarts.length; i++) {
      const weekStart = weekStarts[i];
      
      if (i === 0) {
        if (weekStart === currentWeekStart || weekStart === lastWeekStart) {
          weeklyStreak = 1;
        } else {
          break;
        }
      } else {
        // Check if this week is consecutive
        const expectedWeekStart = new Date(weekStarts[i - 1]);
        expectedWeekStart.setDate(expectedWeekStart.getDate() - 7);
        const expectedWeekStartStr = expectedWeekStart.toISOString().split('T')[0];
        
        if (weekStart === expectedWeekStartStr) {
          weeklyStreak++;
        } else {
          break; // Streak broken
        }
      }
    }
  }

  return {
    dailyStreak,
    weeklyStreak,
    lastCheckinDate: uniqueDates[0]
  };
}

// Helper function to get the start of the week (Monday) for a given date
function getWeekStart(dateStr: string): string {
  const date = new Date(dateStr);
  const dayOfWeek = date.getDay();
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const monday = new Date(date);
  monday.setDate(date.getDate() - daysFromMonday);
  return monday.toISOString().split('T')[0];
}
