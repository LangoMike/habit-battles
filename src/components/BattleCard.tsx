"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { BattleWithMembers } from "@/app/battles/page";
import BattleDetailDialog from "./BattleDetailDialog";

type BattleCardProps = {
  battle: BattleWithMembers;
  currentUserId: string;
};

/**
 * Battle card component showing two users in a battle with their scores
 * Displays crossed swords, timer, and progress bar
 */
const BattleCard = ({ battle, currentUserId }: BattleCardProps) => {
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  // Get the two members (current user first, then opponent)
  const currentUserMember = battle.members.find((m) => m.user_id === currentUserId);
  const opponentMember = battle.members.find((m) => m.user_id !== currentUserId);

  if (!currentUserMember || !opponentMember) {
    return null; // Invalid battle (shouldn't happen)
  }

  const currentUserScore = battle.scores[currentUserId] || {
    score: 0,
    totalHabits: 0,
    habitProgress: [],
  };
  const opponentScore = battle.scores[opponentMember.user_id] || {
    score: 0,
    totalHabits: 0,
    habitProgress: [],
  };

  const currentUserProfile = battle.memberProfiles[currentUserId];
  const opponentProfile = battle.memberProfiles[opponentMember.user_id];

  // State for timer updates
  const [now, setNow] = useState(new Date());

  // Update timer every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Calculate time remaining
  const endDate = new Date(battle.end_date);
  endDate.setHours(23, 59, 59, 999); // End of day
  const timeRemaining = endDate.getTime() - now.getTime();

  // Calculate days and hours
  const daysRemaining = Math.max(0, Math.floor(timeRemaining / (1000 * 60 * 60 * 24)));
  const hoursRemaining = Math.max(0, Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));

  // Calculate progress percentage (0 to 1) - shows remaining time
  // Full bar = battle just started, empty bar = battle ended
  const battleDuration = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
  const progressPercentage = Math.max(0, Math.min(1, timeRemaining / battleDuration));

  // Determine battle status
  const currentScore = currentUserScore.score;
  const opponentScoreValue = opponentScore.score;
  let statusMessage = "";
  let statusColor = "";
  let scoreColor = "";
  let progressBarColor = "";

  if (currentScore > opponentScoreValue) {
    statusMessage = "You are currently winning! Keep it Up!";
    statusColor = "text-success";
    scoreColor = "text-success";
    progressBarColor = "bg-success";
  } else if (currentScore === opponentScoreValue) {
    statusMessage = "You are currently tied! Complete more goals to take the lead!";
    statusColor = "text-warning";
    scoreColor = "text-warning";
    progressBarColor = "bg-warning";
  } else {
    statusMessage = "You are currently losing! Complete more goals to catch up!";
    statusColor = "text-primary";
    scoreColor = "text-primary";
    progressBarColor = "bg-primary";
  }

  return (
    <>
      <Card
        className="p-4 cursor-pointer hover:shadow-md transition-all duration-200 active:scale-[0.98]"
        onClick={() => setDetailDialogOpen(true)}
      >
        {/* Battle name */}
        <div className="text-center mb-4">
          <h3 className="font-display text-lg font-semibold text-foreground">{battle.name}</h3>
          {/* Battle status message */}
          <p className={`font-ui text-sm font-medium mt-2 ${statusColor}`}>
            {statusMessage}
          </p>
        </div>

        {/* Two users side by side with crossed swords */}
        <div className="flex items-center justify-between mb-4">
          {/* Current User */}
          <div className="flex flex-col items-center flex-1">
            <Avatar className="h-16 w-16 mb-2 border-2 border-primary/50 group-hover:border-primary transition-colors">
              <AvatarImage src={currentUserProfile?.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-display">
                {currentUserProfile?.username?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="font-ui text-foreground font-medium text-sm text-center">
              {currentUserProfile?.username || "You"}
            </div>
            <div className={`${scoreColor} font-display font-bold text-lg mt-1`}>
              {currentUserScore.score}
            </div>
            <div className="font-ui text-xs text-muted-foreground mt-1">
              {currentUserScore.score} / {currentUserScore.totalHabits} goals
            </div>
          </div>

          {/* Crossed Swords */}
          <div className="flex items-center justify-center mx-4">
            <Image
              src="/Crossing swords.svg"
              alt="Crossed swords"
              width={96}
              height={64}
              className="h-16 w-24 object-contain"
            />
          </div>

          {/* Opponent */}
          <div className="flex flex-col items-center flex-1">
            <Avatar className="h-16 w-16 mb-2 border-2 border-border">
              <AvatarImage src={opponentProfile?.avatar_url || undefined} />
              <AvatarFallback className="bg-muted text-muted-foreground text-xl font-display">
                {opponentProfile?.username?.[0]?.toUpperCase() || "O"}
              </AvatarFallback>
            </Avatar>
            <div className="font-ui text-foreground font-medium text-sm text-center">
              {opponentProfile?.username || "Opponent"}
            </div>
            <div className="font-display font-bold text-lg mt-1 text-foreground">
              {opponentScore.score}
            </div>
            <div className="font-ui text-xs text-muted-foreground mt-1">
              {opponentScore.score} / {opponentScore.totalHabits} goals
            </div>
          </div>
        </div>

        {/* Timer */}
        <div className="text-center mb-2">
          <div className="font-ui text-sm text-muted-foreground">
            {daysRemaining} {daysRemaining === 1 ? "day" : "days"} {hoursRemaining} {hoursRemaining === 1 ? "hour" : "hours"} remaining
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <div
            className={`${progressBarColor} h-full transition-all duration-500 ease-out`}
            style={{ width: `${(1 - progressPercentage) * 100}%` }}
          />
        </div>
      </Card>

      {/* Detail Dialog */}
      <BattleDetailDialog
        battle={battle}
        currentUserId={currentUserId}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
      />
    </>
  );
};

export default BattleCard;
