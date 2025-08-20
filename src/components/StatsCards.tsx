"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, CheckCircle } from "lucide-react";
import { QuotaStats } from "@/lib/quotaTracker";

interface StatsCardsProps {
  stats: QuotaStats;
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const quotaPercentage =
    stats.totalHabits > 0
      ? Math.round((stats.weeklyQuotasMet / stats.totalHabits) * 100)
      : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Weekly Quotas Met */}
      <Card className="p-6 bg-gradient-to-br from-red-900/20 to-red-800/20 border-red-500/30">
        <div className="flex items-center justify-between mb-2">
          <Trophy className="h-5 w-5 text-red-400" />
          <Badge
            variant="outline"
            className="border-red-500/50 text-red-400 text-xs"
          >
            This Week
          </Badge>
        </div>
        <div className="space-y-1">
          <div className="text-2xl font-bold text-white">
            {stats.weeklyQuotasMet}/{stats.totalHabits}
          </div>
          <div className="text-sm text-gray-400">Weekly Quotas Met</div>
          <div className="text-xs text-red-400">
            {quotaPercentage}% Success Rate
          </div>
        </div>
      </Card>

      {/* Total Check-ins */}
      <Card className="p-6 bg-gradient-to-br from-red-900/20 to-red-800/20 border-red-500/30">
        <div className="flex items-center justify-between mb-2">
          <CheckCircle className="h-5 w-5 text-red-400" />
          <Badge
            variant="outline"
            className="border-red-500/50 text-red-400 text-xs"
          >
            All Time
          </Badge>
        </div>
        <div className="space-y-1">
          <div className="text-2xl font-bold text-white">
            {stats.totalCheckins}
          </div>
          <div className="text-sm text-gray-400">Total Check-ins</div>
          <div className="text-xs text-red-400">
            {stats.totalHabits} Active Habits
          </div>
        </div>
      </Card>

      {/* Weekly Progress */}
      <Card className="p-6 bg-gradient-to-br from-red-900/20 to-red-800/20 border-red-500/30">
        <div className="flex items-center justify-between mb-2">
          <Target className="h-5 w-5 text-red-400" />
          <Badge
            variant="outline"
            className="border-red-500/50 text-red-400 text-xs"
          >
            Progress
          </Badge>
        </div>
        <div className="space-y-2">
          <div className="text-sm text-gray-400">Weekly Progress</div>
          {stats.currentWeekProgress.length > 0 ? (
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {stats.currentWeekProgress.map((habit) => (
                <div
                  key={habit.habitId}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="text-white/80 flex-1 min-w-0 mr-2">
                    {habit.habitName}
                  </span>
                  <span
                    className={`${
                      habit.isMet ? "text-green-400" : "text-red-400"
                    } flex-shrink-0`}
                  >
                    {habit.completed}/{habit.target}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-gray-500">No habits yet</div>
          )}
        </div>
      </Card>
    </div>
  );
}
