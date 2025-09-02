"use client";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import CreateHabitDialog from "./CreateHabitDialog";
import HabitList from "./HabitList";
import PerformanceTester from "@/components/PerformanceTester";

export default function HabitsPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const tz = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    []
  );

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) location.href = "/login";
      else {
        setUserId(data.user.id);
      }
    });
  }, []);

  if (!userId) return null;
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-white">Your Habits</h1>
          <CreateHabitDialog userId={userId} tz={tz} />
        </div>

        <HabitList userId={userId} />

        <div className="border-t pt-8">
          <PerformanceTester />
        </div>
      </div>
    </div>
  );
}
