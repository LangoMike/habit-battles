"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import EditHabitDialog from "./EditHabitDialog";
import { globalPerformanceTracker } from "@/lib/performanceMetrics";

type Habit = {
  id: string;
  name: string;
  target_per_week: number;
  schedule: "daily" | "weekly" | "custom";
  created_at: string;
};

type HabitWithProgress = Habit & {
  doneToday: boolean;
  doneThisWeek: number;
};

export default function HabitList({ userId }: { userId: string }) {
  const [habits, setHabits] = useState<HabitWithProgress[]>([]);
  const [today, setToday] = useState("");
  const [weekStart, setWeekStart] = useState("");
  const [weekEnd, setWeekEnd] = useState("");
  const [loading, setLoading] = useState(true);
  const tz = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    []
  );

  const fetchData = useCallback(
    async (
      isoStart: string = weekStart,
      isoEnd: string = weekEnd,
      isoToday: string = today
    ) => {
      setLoading(true);
      const { data: habitsRows, error: habitsError } = await supabase
        .from("habits")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });
      if (habitsError) {
        toast.error(habitsError.message);
        setLoading(false);
        return;
      }
      const ids = (habitsRows ?? []).map((h) => h.id);
      if (ids.length === 0) {
        setHabits([]);
        setLoading(false);
        return;
      }
      const { data: checkinsWeek, error: weekErr } = await supabase
        .from("checkins")
        .select("habit_id, checkin_date")
        .eq("user_id", userId)
        .in("habit_id", ids)
        .gte("checkin_date", isoStart)
        .lte("checkin_date", isoEnd);
      if (weekErr) {
        toast.error(weekErr.message);
        setLoading(false);
        return;
      }
      const { data: checkinsToday } = await supabase
        .from("checkins")
        .select("habit_id")
        .eq("user_id", userId)
        .in("habit_id", ids)
        .eq("checkin_date", isoToday);

      const doneTodaySet = new Set(
        (checkinsToday ?? []).map((c) => c.habit_id as string)
      );
      const counts = new Map<string, number>();
      (checkinsWeek ?? []).forEach((c) => {
        const key = c.habit_id as string;
        counts.set(key, (counts.get(key) ?? 0) + 1);
      });
      const withProgress: HabitWithProgress[] = (habitsRows ?? []).map((h) => ({
        ...(h as Habit),
        doneToday: doneTodaySet.has(h.id),
        doneThisWeek: counts.get(h.id) ?? 0,
      }));
      setHabits(withProgress);
      setLoading(false);
    },
    [userId, weekStart, weekEnd, today]
  );

  useEffect(() => {
    const t = new Date(new Date().toLocaleString("en-US", { timeZone: tz }));
    const isoToday = new Date(
      Date.UTC(t.getFullYear(), t.getMonth(), t.getDate())
    )
      .toISOString()
      .slice(0, 10);
    setToday(isoToday);

    // Monday-start week
    const jsDow = t.getDay(); // 0=Sun..6=Sat
    const daysSinceMonday = (jsDow + 6) % 7; // Sun->6, Mon->0
    const start = new Date(t);
    start.setDate(t.getDate() - daysSinceMonday);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const isoStart = new Date(
      Date.UTC(start.getFullYear(), start.getMonth(), start.getDate())
    )
      .toISOString()
      .slice(0, 10);
    const isoEnd = new Date(
      Date.UTC(end.getFullYear(), end.getMonth(), end.getDate())
    )
      .toISOString()
      .slice(0, 10);
    setWeekStart(isoStart);
    setWeekEnd(isoEnd);

    fetchData(isoStart, isoEnd, isoToday);

    const ch = supabase
      .channel("realtime:habits-checkins")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "habits" },
        () => fetchData(isoStart, isoEnd, isoToday)
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "checkins" },
        () => fetchData(isoStart, isoEnd, isoToday)
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [tz, fetchData]);

  const checkIn = async (habitId: string) => {
    // Start performance measurement
    globalPerformanceTracker.startMeasurement();

    const { error } = await supabase
      .from("checkins")
      .insert({ habit_id: habitId, user_id: userId, checkin_date: today });
    if (error) {
      if (
        error.code === "23505" ||
        (error.message ?? "").toLowerCase().includes("duplicate")
      ) {
        toast.info("Already checked in for today");
      } else {
        toast.error(error.message);
      }
      // End measurement even on error
      globalPerformanceTracker.endMeasurement();
    } else {
      toast.success("Checked in");
      // End measurement after successful check-in
      // The real-time subscription will trigger fetchData and update UI
      // We'll end measurement when the UI actually updates
      setTimeout(() => {
        globalPerformanceTracker.endMeasurement();
      }, 0);
    }
    await fetchData();
  };

  const deleteHabit = async (habitId: string) => {
    const ok = confirm(
      "Delete this habit? This will remove its check-ins as well as remove it from the habit list."
    );
    if (!ok) return;
    const { error } = await supabase.from("habits").delete().eq("id", habitId);
    if (error) toast.error(error.message);
    else toast.success("Habit deleted");
    await fetchData();
  };

  return (
    <div className="grid gap-3">
      {loading && <p className="text-sm opacity-70">Loading…</p>}
      {habits.map((h) => (
        <div
          key={h.id}
          className="border rounded-xl p-4 flex items-center justify-between gap-4"
        >
          <div className="min-w-0">
            <div className="font-medium truncate">{h.name}</div>
            <div className="text-xs opacity-70">
              {h.doneThisWeek} / {h.target_per_week} this week
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {h.doneToday ? (
              <span className="text-sm"> Today</span>
            ) : (
              <Button size="sm" onClick={() => checkIn(h.id)}>
                Check in
              </Button>
            )}
            <EditHabitDialog
              userId={userId}
              habit={{
                id: h.id,
                name: h.name,
                target_per_week: h.target_per_week,
              }}
            />
            <Button
              size="sm"
              variant="destructive"
              onClick={() => deleteHabit(h.id)}
            >
              Delete
            </Button>
          </div>
        </div>
      ))}
      {!loading && habits.length === 0 && (
        <p className="opacity-70">
          No habits yet… Create your first habit to start tracking!
        </p>
      )}
    </div>
  );
}
