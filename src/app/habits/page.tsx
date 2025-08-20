"use client";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import CreateHabitDialog from "./CreateHabitDialog";
import HabitList from "./HabitList";
import { getStreakData, StreakData } from "@/lib/streak";
import StreakDisplay from "@/components/StreakDisplay";

export default function HabitsPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const tz = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    []
  );

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) location.href = "/login";
      else {
        setUserId(data.user.id);
        const streakStats = await getStreakData(data.user.id);
        setStreakData(streakStats);
      }
    });
  }, []);

  if (!userId) return null;
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Your Habits</h1>
        <CreateHabitDialog userId={userId} tz={tz} />
      </div>

      <HabitList userId={userId} />
    </div>
  );
}
