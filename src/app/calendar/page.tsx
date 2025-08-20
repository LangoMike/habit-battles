"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { getQuotaStats, QuotaStats } from "@/lib/quotaTracker";
import { getStreakData, StreakData } from "@/lib/streak";
import StreakDisplay from "@/components/StreakDisplay";

type ViewMode = "week" | "month" | "year";
type Checkin = { habit_name: string; checkin_date: string; created_at: string };

export default function CalendarPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedCheckins, setSelectedCheckins] = useState<Checkin[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<QuotaStats | null>(null);
  const [streakData, setStreakData] = useState<StreakData | null>(null);

  // Calculate date ranges for different views
  const { startDate, endDate, days } = useMemo(() => {
    const start = new Date(currentDate);
    const end = new Date(currentDate);
    let days: Date[] = [];

    switch (viewMode) {
      case "week":
        // Monday to Sunday
        const dayOfWeek = start.getDay();
        const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        start.setDate(start.getDate() - daysFromMonday);
        end.setDate(start.getDate() + 6);
        for (let i = 0; i < 7; i++) {
          days.push(new Date(start.getTime() + i * 24 * 60 * 60 * 1000));
        }
        break;
      case "month":
        start.setDate(1);
        end.setMonth(end.getMonth() + 1, 0);
        const firstDayOfWeek = start.getDay();
        const daysFromPrevMonth = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
        start.setDate(start.getDate() - daysFromPrevMonth);
        const totalDays = 42; // 6 weeks * 7 days
        for (let i = 0; i < totalDays; i++) {
          days.push(new Date(start.getTime() + i * 24 * 60 * 60 * 1000));
        }
        break;
      case "year":
        start.setMonth(0, 1);
        end.setMonth(11, 31);
        for (let i = 0; i < 365; i++) {
          days.push(new Date(start.getTime() + i * 24 * 60 * 60 * 1000));
        }
        break;
    }

    return { startDate: start, endDate: end, days };
  }, [currentDate, viewMode]);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return (location.href = "/login");
      setUserId(data.user.id);
      await fetchCheckins();
      // Fetch stats and streak data
      const [quotaStats, streakStats] = await Promise.all([
        getQuotaStats(data.user.id),
        getStreakData(data.user.id),
      ]);
      setStats(quotaStats);
      setStreakData(streakStats);
    });
  }, []);

  useEffect(() => {
    if (userId) fetchCheckins();
  }, [userId, startDate, endDate]);

  const fetchCheckins = async () => {
    if (!userId) return;
    setLoading(true);
    const startISO = startDate.toISOString().split("T")[0];
    const endISO = endDate.toISOString().split("T")[0];

    // First, get all checkins for the date range
    const { data: checkinData, error: checkinError } = await supabase
      .from("checkins")
      .select("habit_id, checkin_date, created_at")
      .eq("user_id", userId)
      .gte("checkin_date", startISO)
      .lte("checkin_date", endISO)
      .order("checkin_date", { ascending: false });

    if (checkinError) {
      console.error("Error fetching checkins:", checkinError);
      setLoading(false);
      return;
    }

    if (!checkinData || checkinData.length === 0) {
      setCheckins([]);
      setLoading(false);
      return;
    }

    // Get habit names for the checkins
    const habitIds = [...new Set(checkinData.map((c) => c.habit_id))];
    const { data: habitData, error: habitError } = await supabase
      .from("habits")
      .select("id, name")
      .in("id", habitIds);

    if (habitError) {
      console.error("Error fetching habits:", habitError);
      setLoading(false);
      return;
    }

    // Create a map of habit_id to habit_name
    const habitMap = new Map(habitData?.map((h) => [h.id, h.name]) || []);

    // Combine the data
    setCheckins(
      checkinData.map((c) => ({
        habit_name: habitMap.get(c.habit_id) || "Unknown Habit",
        checkin_date: c.checkin_date,
        created_at: c.created_at,
      }))
    );
    setLoading(false);
  };

  const getCompletionCount = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return checkins.filter((c) => c.checkin_date === dateStr).length;
  };

  const getSquareColor = (count: number) => {
    if (count === 0) return "bg-gray-800/30 border border-gray-700/50";
    if (count === 1) return "bg-lime-400/70 border border-lime-500";
    if (count <= 3) return "bg-green-500/80 border border-green-600";
    if (count <= 5) return "bg-emerald-600 border border-emerald-700";
    return "bg-teal-800 border border-teal-900";
  };

  const handleDateClick = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    const dayCheckins = checkins.filter((c) => c.checkin_date === dateStr);
    setSelectedDate(dateStr);
    setSelectedCheckins(dayCheckins);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: viewMode === "year" ? "numeric" : undefined,
    });
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    switch (viewMode) {
      case "week":
        newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
        break;
      case "month":
        newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1));
        break;
      case "year":
        newDate.setFullYear(
          newDate.getFullYear() + (direction === "next" ? 1 : -1)
        );
        break;
    }
    setCurrentDate(newDate);
  };

  const getViewTitle = () => {
    switch (viewMode) {
      case "week":
        return `${formatDate(startDate)} - ${formatDate(endDate)}`;
      case "month":
        return currentDate.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        });
      case "year":
        return currentDate.getFullYear().toString();
    }
  };

  if (!userId) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Activity Calendar</h1>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "week" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("week")}
          >
            Week
          </Button>
          <Button
            variant={viewMode === "month" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("month")}
          >
            Month
          </Button>
          <Button
            variant={viewMode === "year" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("year")}
          >
            Year
          </Button>
        </div>
      </div>

      {/* Stats and Streak Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Stats Cards */}
        {stats && (
          <>
            <Card className="p-2 bg-gradient-to-br from-red-900/20 to-red-800/20 border-red-500/30 h-40 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {stats.weeklyQuotasMet}/{stats.totalHabits}
                </div>
                <div className="text-sm text-gray-400">Weekly Quotas Met</div>
              </div>
            </Card>
            <Card className="p-2 bg-gradient-to-br from-red-900/20 to-red-800/20 border-red-500/30 h-40 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {stats.totalCheckins}
                </div>
                <div className="text-sm text-gray-400">Total Check-ins</div>
              </div>
            </Card>
            <Card className="p-2 bg-gradient-to-br from-red-900/20 to-red-800/20 border-red-500/30 h-40 flex items-center justify-center">
              <div className="text-center">
                <div className="text-xl font-bold text-white">
                  {stats.totalHabits}
                </div>
                <div className="text-sm text-gray-400">Active Habits</div>
              </div>
            </Card>
          </>
        )}

        {/* Streak Display */}
        {streakData && (
          <Card className="p-4 bg-gradient-to-br from-red-900/20 to-red-800/20 border-red-500/30">
            <div className="text-center mb-2">
              <div className="text-sm text-gray-400">Your Streaks</div>
            </div>
            <StreakDisplay
              streakData={streakData}
              variant="calendar"
              showWeekly={false}
            />
          </Card>
        )}
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateDate("prev")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-medium">{getViewTitle()}</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateDate("next")}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
          </div>
        ) : (
          <div
            className={`grid gap-1 ${
              viewMode === "week"
                ? "grid-cols-7"
                : viewMode === "month"
                ? "grid-cols-7"
                : "grid-cols-53" // 53 weeks in a year
            }`}
          >
            {viewMode === "month" && (
              <>
                <div className="text-xs text-gray-400 text-center py-2">
                  Mon
                </div>
                <div className="text-xs text-gray-400 text-center py-2">
                  Tue
                </div>
                <div className="text-xs text-gray-400 text-center py-2">
                  Wed
                </div>
                <div className="text-xs text-gray-400 text-center py-2">
                  Thu
                </div>
                <div className="text-xs text-gray-400 text-center py-2">
                  Fri
                </div>
                <div className="text-xs text-gray-400 text-center py-2">
                  Sat
                </div>
                <div className="text-xs text-gray-400 text-center py-2">
                  Sun
                </div>
              </>
            )}

            {days.map((date, index) => {
              const count = getCompletionCount(date);
              const isCurrentMonth =
                viewMode === "month"
                  ? date.getMonth() === currentDate.getMonth()
                  : true;
              const isToday = date.toDateString() === new Date().toDateString();

              return (
                <div
                  key={index}
                  className={`
                    relative group cursor-pointer transition-all duration-200
                    ${viewMode === "year" ? "w-3 h-3" : "aspect-square"}
                    ${getSquareColor(count)}
                    ${!isCurrentMonth ? "opacity-30" : ""}
                    ${
                      isToday
                        ? "ring-2 ring-red-400 ring-offset-2 ring-offset-background"
                        : ""
                    }
                    hover:scale-110 hover:z-10
                  `}
                  onClick={() => handleDateClick(date)}
                  title={`${formatDate(date)}: ${count} habit${
                    count !== 1 ? "s" : ""
                  } completed`}
                >
                  {count > 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-medium text-white drop-shadow-sm">
                        {count}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Dialog open={!!selectedDate} onOpenChange={() => setSelectedDate(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedDate && formatDate(new Date(selectedDate))}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {selectedCheckins.length === 0 ? (
              <p className="text-sm text-gray-500">
                No habits completed on this day.
              </p>
            ) : (
              selectedCheckins.map((checkin, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg"
                >
                  <div>
                    <div className="font-medium">{checkin.habit_name}</div>
                    <div className="text-xs text-gray-400">
                      Checked in at {formatTime(checkin.created_at)}
                    </div>
                  </div>
                  <Badge variant="secondary">Completed</Badge>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
