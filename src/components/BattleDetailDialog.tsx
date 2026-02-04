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
    bg: "bg-primary/10",
    border: "border-primary/30",
    avatarBorder: "border-primary/50",
    avatarBg: "bg-primary/10",
    avatarText: "text-primary",
    scoreText: "text-primary",
  };

  if (currentScore > opponentScoreValue) {
    // Winning - green
    statusColors = {
      bg: "bg-success/10",
      border: "border-success/30",
      avatarBorder: "border-success/50",
      avatarBg: "bg-success/10",
      avatarText: "text-success",
      scoreText: "text-success",
    };
  } else if (currentScore === opponentScoreValue) {
    // Tied - yellow
    statusColors = {
      bg: "bg-warning/10",
      border: "border-warning/30",
      avatarBorder: "border-warning/50",
      avatarBg: "bg-warning/10",
      avatarText: "text-warning",
      scoreText: "text-warning",
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
                <div className="font-ui font-semibold text-lg text-foreground">
                  {currentUserProfile?.username || "You"}
                </div>
                <div className={`font-display ${statusColors.scoreText} font-bold`}>
                  Score: {currentUserScore.score} / {currentUserScore.totalHabits}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {currentUserScore.habitProgress.length === 0 ? (
                <div className="font-ui text-sm text-muted-foreground">
                  No habits tracked
                </div>
              ) : (
                currentUserScore.habitProgress.map((habit) => (
                  <div
                    key={habit.habitId}
                    className="flex items-center justify-between p-2 bg-muted rounded"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      {habit.isMet ? (
                        <Check className="h-5 w-5 text-success" />
                      ) : (
                        <X className="h-5 w-5 text-muted-foreground" />
                      )}
                      <span className="font-ui text-sm text-foreground">
                        {habit.habitName}
                      </span>
                    </div>
                    <div className="font-ui text-sm text-muted-foreground">
                      {habit.completed} / {habit.target}
                      {habit.isMet && (
                        <span className="ml-2 text-success">✓ Goal met!</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Opponent Section */}
          <div className="p-4 bg-muted/50 border border-border rounded-lg">
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="h-12 w-12 border-2 border-border">
                <AvatarImage src={opponentProfile?.avatar_url || undefined} />
                <AvatarFallback className="bg-muted text-muted-foreground font-display">
                  {opponentProfile?.username?.[0]?.toUpperCase() || "O"}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-ui font-semibold text-lg text-foreground">
                  {opponentProfile?.username || "Opponent"}
                </div>
                <div className="font-display font-bold text-foreground">
                  Score: {opponentScore.score} / {opponentScore.totalHabits}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {opponentScore.totalHabits === 0 ? (
                <div className="font-ui text-sm text-muted-foreground">
                  No habits tracked
                </div>
              ) : (
                <div className="font-ui text-sm text-muted-foreground">
                  {opponentScore.score} of {opponentScore.totalHabits} goals
                  completed
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
