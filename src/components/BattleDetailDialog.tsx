"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BattleWithMembers } from "@/app/battles/page";
import { Check, X } from "lucide-react";

type BattleDetailDialogProps = {
  battle: BattleWithMembers;
  currentUserId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/**
 * Dialog showing detailed battle information including all tasks/habits
 * Shows which tasks each user has completed and how many remain to meet their goal
 */
const BattleDetailDialog = ({
  battle,
  currentUserId,
  open,
  onOpenChange,
}: BattleDetailDialogProps) => {
  // Get the two members (current user first, then opponent)
  const currentUserMember = battle.members.find((m) => m.user_id === currentUserId);
  const opponentMember = battle.members.find((m) => m.user_id !== currentUserId);

  if (!currentUserMember || !opponentMember) {
    return null;
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

  // Determine battle status for dynamic coloring
  const currentScore = currentUserScore.score;
  const opponentScoreValue = opponentScore.score;
  
  let statusColors = {
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    avatarBorder: "border-red-500/50",
    avatarBg: "bg-red-500/20",
    avatarText: "text-red-400",
    scoreText: "text-red-400",
  };

  if (currentScore > opponentScoreValue) {
    // Winning - green
    statusColors = {
      bg: "bg-green-500/10",
      border: "border-green-500/30",
      avatarBorder: "border-green-500/50",
      avatarBg: "bg-green-500/20",
      avatarText: "text-green-400",
      scoreText: "text-green-400",
    };
  } else if (currentScore === opponentScoreValue) {
    // Tied - yellow
    statusColors = {
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/30",
      avatarBorder: "border-yellow-500/50",
      avatarBg: "bg-yellow-500/20",
      avatarText: "text-yellow-400",
      scoreText: "text-yellow-400",
    };
  }
  // else: losing - red (default)

  // Get all unique habits from both users
  const allHabitIds = new Set<string>();
  currentUserScore.habitProgress.forEach((h) => allHabitIds.add(h.habitId));
  opponentScore.habitProgress.forEach((h) => allHabitIds.add(h.habitId));

  // Create a map of habits for easy lookup
  const currentUserHabits = new Map(
    currentUserScore.habitProgress.map((h) => [h.habitId, h])
  );
  const opponentHabits = new Map(
    opponentScore.habitProgress.map((h) => [h.habitId, h])
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{battle.name}</DialogTitle>
          <DialogDescription>
            Detailed view of all tasks and progress for each participant
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Current User Section */}
          <div className={`p-4 ${statusColors.bg} border ${statusColors.border} rounded-lg`}>
            <div className="flex items-center gap-3 mb-4">
              <Avatar className={`h-12 w-12 border-2 ${statusColors.avatarBorder}`}>
                <AvatarImage src={currentUserProfile?.avatar_url || undefined} />
                <AvatarFallback className={`${statusColors.avatarBg} ${statusColors.avatarText}`}>
                  {currentUserProfile?.username?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="text-white font-semibold text-lg">
                  {currentUserProfile?.username || "You"}
                </div>
                <div className={`${statusColors.scoreText} font-bold`}>
                  Score: {currentUserScore.score} / {currentUserScore.totalHabits}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {currentUserScore.habitProgress.length === 0 ? (
                <div className="text-gray-400 text-sm">No habits tracked</div>
              ) : (
                currentUserScore.habitProgress.map((habit) => (
                  <div
                    key={habit.habitId}
                    className="flex items-center justify-between p-2 bg-gray-800/50 rounded"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      {habit.isMet ? (
                        <Check className="h-5 w-5 text-green-400" />
                      ) : (
                        <X className="h-5 w-5 text-gray-500" />
                      )}
                      <span className="text-white text-sm">{habit.habitName}</span>
                    </div>
                    <div className="text-gray-400 text-sm">
                      {habit.completed} / {habit.target}
                      {habit.isMet && (
                        <span className="ml-2 text-green-400">✓ Goal met!</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Opponent Section */}
          <div className="p-4 bg-gray-800/30 border border-gray-700/50 rounded-lg">
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="h-12 w-12 border-2 border-gray-600">
                <AvatarImage src={opponentProfile?.avatar_url || undefined} />
                <AvatarFallback className="bg-gray-600/20 text-gray-400">
                  {opponentProfile?.username?.[0]?.toUpperCase() || "O"}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="text-white font-semibold text-lg">
                  {opponentProfile?.username || "Opponent"}
                </div>
                <div className="text-white font-bold">
                  Score: {opponentScore.score} / {opponentScore.totalHabits}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {opponentScore.totalHabits === 0 ? (
                <div className="text-gray-400 text-sm">No habits tracked</div>
              ) : (
                <div className="text-gray-400 text-sm">
                  {opponentScore.score} of {opponentScore.totalHabits} goals completed
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BattleDetailDialog;
