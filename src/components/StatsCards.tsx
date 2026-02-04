"use client";

import { Card, CardContent } from "@/components/ui/card";
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
      {/* Weekly Quotas Met */}
      <Card>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Trophy className="h-5 w-5" />
            </div>
            <Badge variant="outline" className="text-xs">
              This Week
            </Badge>
          </div>
          <div className="space-y-2">
            <div className="font-display text-3xl font-bold text-foreground">
              {stats.weeklyQuotasMet}/{stats.totalHabits}
            </div>
            <div className="font-ui text-sm text-muted-foreground">
              Weekly Quotas Met
            </div>
            <div className="font-ui text-xs text-primary">
              {quotaPercentage}% Success Rate
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Check-ins */}
      <Card>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <CheckCircle className="h-5 w-5" />
            </div>
            <Badge variant="outline" className="text-xs">
              All Time
            </Badge>
          </div>
          <div className="space-y-2">
            <div className="font-display text-3xl font-bold text-foreground">
              {stats.totalCheckins}
            </div>
            <div className="font-ui text-sm text-muted-foreground">
              Total Check-ins
            </div>
            <div className="font-ui text-xs text-primary">
              {stats.totalHabits} Active Habits
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Progress */}
      <Card>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Target className="h-5 w-5" />
            </div>
            <Badge variant="outline" className="text-xs">
              Progress
            </Badge>
          </div>
          <div className="space-y-3">
            <div className="font-ui text-sm text-muted-foreground">
              Weekly Progress
            </div>
            {stats.currentWeekProgress.length > 0 ? (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {stats.currentWeekProgress.map((habit) => (
                  <div
                    key={habit.habitId}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="font-ui text-foreground/80 flex-1 min-w-0 mr-2 truncate">
                      {habit.habitName}
                    </span>
                    <span
                      className={`font-display font-semibold flex-shrink-0 ${
                        habit.isMet ? "text-success" : "text-muted-foreground"
                      }`}
                    >
                      {habit.completed}/{habit.target}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="font-ui text-xs text-muted-foreground">
                No habits yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
