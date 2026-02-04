"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Zap, FlameKindling } from "lucide-react";
import { StreakData } from "@/lib/streak";

interface StreakDisplayProps {
  streakData: StreakData;
  variant?: "dashboard" | "habits" | "calendar";
  showWeekly?: boolean;
}

export default function StreakDisplay({
  streakData,
  variant = "dashboard",
  showWeekly = true,
}: StreakDisplayProps) {
  const { dailyStreak, weeklyStreak } = streakData;

  // Get appropriate fire icon based on streak length
  const getFireIcon = (streak: number) => {
    if (streak < 3) {
      return <Zap className="h-5 w-5 text-warning" />;
    } else if (streak < 10) {
      return <Flame className="h-5 w-5 text-primary" />;
    } else {
      return <FlameKindling className="h-5 w-5 text-primary" />;
    }
  };

  // Get streak message based on variant and streak length
  const getStreakMessage = (streak: number, type: "daily" | "weekly") => {
    const messages = {
      dashboard: {
        daily: [
          "You're on a roll!",
          "Keep the momentum going!",
          "You're unstoppable!",
          "Incredible consistency!",
          "You're a habit warrior!",
        ],
        weekly: [
          "Week after week!",
          "Consistent weekly progress!",
          "Weekly warrior!",
          "Building lasting habits!",
          "Week champion!",
        ],
      },
      habits: {
        daily: [
          "Daily habit master!",
          "Consistency is key!",
          "Building daily routines!",
          "Habit formation expert!",
          "Daily discipline!",
        ],
        weekly: [
          "Weekly habit champion!",
          "Weekly routine builder!",
          "Weekly consistency!",
          "Weekly habit master!",
          "Weekly discipline!",
        ],
      },
      calendar: {
        daily: [
          "Calendar warrior!",
          "Filling up that calendar!",
          "Daily tracking master!",
          "Calendar consistency!",
          "Daily progress!",
        ],
        weekly: [
          "Weekly calendar champion!",
          "Weekly tracking expert!",
          "Weekly calendar master!",
          "Weekly progress!",
          "Weekly tracking!",
        ],
      },
    };

    const variantMessages = messages[variant];
    const typeMessages = variantMessages[type];
    const messageIndex = Math.min(
      Math.floor(streak / 3),
      typeMessages.length - 1
    );

    return typeMessages[messageIndex];
  };

  if (dailyStreak === 0 && weeklyStreak === 0) {
    return (
      <Card className="p-3 bg-muted/50">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-muted-foreground" />
          <div className="font-ui text-sm text-muted-foreground">
            Start your streak today!
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {/* Daily Streak */}
      <Card className="p-4 bg-gradient-to-r from-red-600/15 to-red-700/15 dark:from-red-900/20 dark:to-red-800/20 border-primary/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getFireIcon(dailyStreak)}
            <div>
              <div className="font-ui text-sm font-medium text-foreground">
                {dailyStreak} day{dailyStreak !== 1 ? "s" : ""} in a row
              </div>
              <div className="font-ui text-xs text-primary">
                {getStreakMessage(dailyStreak, "daily")}
              </div>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            Daily
          </Badge>
        </div>
      </Card>

      {/* Weekly Streak */}
      {showWeekly && weeklyStreak > 0 && (
        <Card className="p-4 bg-gradient-to-r from-orange-600/15 to-orange-700/15 dark:from-orange-900/20 dark:to-orange-800/20 border-warning/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getFireIcon(weeklyStreak)}
              <div>
                <div className="font-ui text-sm font-medium text-foreground">
                  {weeklyStreak} week{weeklyStreak !== 1 ? "s" : ""} in a row
                </div>
                <div className="font-ui text-xs text-warning">
                  {getStreakMessage(weeklyStreak, "weekly")}
                </div>
              </div>
            </div>
            <Badge variant="outline" className="text-xs">
              Weekly
            </Badge>
          </div>
        </Card>
      )}
    </div>
  );
}
