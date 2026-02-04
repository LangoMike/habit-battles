"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Sword } from "lucide-react";
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

  return (
    <>
      <Card
        className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/50 cursor-pointer hover:border-red-500/50 transition-colors"
        onClick={() => setDetailDialogOpen(true)}
      >
        {/* Battle name */}
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-white">{battle.name}</h3>
        </div>

        {/* Two users side by side with crossed swords */}
        <div className="flex items-center justify-between mb-4">
          {/* Current User */}
          <div className="flex flex-col items-center flex-1">
            <Avatar className="h-16 w-16 mb-2 border-2 border-red-500/50">
              <AvatarImage src={currentUserProfile?.avatar_url || undefined} />
              <AvatarFallback className="bg-red-500/20 text-red-400 text-xl">
                {currentUserProfile?.username?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="text-white font-medium text-sm text-center">
              {currentUserProfile?.username || "You"}
            </div>
            <div className="text-red-400 font-bold text-lg mt-1">
              {currentUserScore.score}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {currentUserScore.habitProgress.filter((h) => h.isMet).length} / {currentUserScore.totalHabits} goals
            </div>
          </div>

           {/* Crossed Swords */}
           <div className="flex items-center justify-center mx-4">
             <div className="relative w-12 h-12 flex items-center justify-center">
               <Sword className="h-12 w-12 text-red-400" />
               <Sword className="h-12 w-12 text-red-400 rotate-90 absolute top-0 left-0" />
             </div>
           </div>

          {/* Opponent */}
          <div className="flex flex-col items-center flex-1">
            <Avatar className="h-16 w-16 mb-2 border-2 border-gray-600">
              <AvatarImage src={opponentProfile?.avatar_url || undefined} />
              <AvatarFallback className="bg-gray-600/20 text-gray-400 text-xl">
                {opponentProfile?.username?.[0]?.toUpperCase() || "O"}
              </AvatarFallback>
            </Avatar>
            <div className="text-white font-medium text-sm text-center">
              {opponentProfile?.username || "Opponent"}
            </div>
            <div className="text-white font-bold text-lg mt-1">
              {opponentScore.score}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {opponentScore.habitProgress.filter((h) => h.isMet).length} / {opponentScore.totalHabits} goals
            </div>
          </div>
        </div>

        {/* Timer */}
        <div className="text-center mb-2">
          <div className="text-sm text-gray-400">
            {daysRemaining} {daysRemaining === 1 ? "day" : "days"} {hoursRemaining} {hoursRemaining === 1 ? "hour" : "hours"} remaining
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
          <div
            className="bg-red-500 h-full transition-all duration-300"
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
