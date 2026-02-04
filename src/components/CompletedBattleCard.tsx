"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { BattleWithMembers } from "@/app/battles/page";

type CompletedBattleCardProps = {
  battle: BattleWithMembers;
  currentUserId: string;
  winnerIds: string[] | null;
};

/**
 * Completed battle card component showing two users with winner/loser styling
 * Displays crossed swords, scores, and date range
 */
const CompletedBattleCard = ({ battle, currentUserId, winnerIds }: CompletedBattleCardProps) => {
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

  // Determine if users are winners (for ties, both are winners)
  const isCurrentUserWinner = winnerIds ? winnerIds.includes(currentUserId) : false;
  const isOpponentWinner = winnerIds ? winnerIds.includes(opponentMember.user_id) : false;

  // Format date as mm/dd/yyyy
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  return (
    <Card className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/50">
      {/* Battle name */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-white">{battle.name}</h3>
        <div className="text-sm text-gray-400 mt-1">
          {formatDate(battle.start_date)} - {formatDate(battle.end_date)}
        </div>
      </div>

      {/* Two users side by side with crossed swords */}
      <div className="flex items-center justify-between mb-4">
        {/* Current User */}
        <div className="flex flex-col items-center flex-1">
          <div className="relative">
            <Avatar
              className={`h-16 w-16 mb-2 border-2 ${
                isCurrentUserWinner
                  ? "border-green-500/50"
                  : "border-red-500/50"
              }`}
            >
              <AvatarImage src={currentUserProfile?.avatar_url || undefined} />
              <AvatarFallback
                className={`${
                  isCurrentUserWinner
                    ? "bg-green-500/20 text-green-400"
                    : "bg-red-500/20 text-red-400"
                } text-xl`}
              >
                {currentUserProfile?.username?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            {/* Green tint overlay for winner */}
            {isCurrentUserWinner && (
              <div className="absolute inset-0 rounded-full bg-green-500/20 pointer-events-none" style={{ borderRadius: '50%' }} />
            )}
          </div>
          <div
            className={`font-medium text-sm text-center ${
              isCurrentUserWinner ? "text-green-400" : "text-red-400"
            }`}
          >
            {currentUserProfile?.username || "You"}
          </div>
          <div className="text-white font-bold text-lg mt-1">
            {currentUserScore.score}
          </div>
          <div className="text-xs text-gray-400 mt-1">
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
          <div className="relative">
            <Avatar
              className={`h-16 w-16 mb-2 border-2 ${
                isOpponentWinner
                  ? "border-green-500/50"
                  : "border-red-500/50"
              }`}
            >
              <AvatarImage src={opponentProfile?.avatar_url || undefined} />
              <AvatarFallback
                className={`${
                  isOpponentWinner
                    ? "bg-green-500/20 text-green-400"
                    : "bg-red-500/20 text-red-400"
                } text-xl`}
              >
                {opponentProfile?.username?.[0]?.toUpperCase() || "O"}
              </AvatarFallback>
            </Avatar>
            {/* Green tint overlay for winner */}
            {isOpponentWinner && (
              <div className="absolute inset-0 rounded-full bg-green-500/20 pointer-events-none" style={{ borderRadius: '50%' }} />
            )}
          </div>
          <div
            className={`font-medium text-sm text-center ${
              isOpponentWinner ? "text-green-400" : "text-red-400"
            }`}
          >
            {opponentProfile?.username || "Opponent"}
          </div>
          <div className="text-white font-bold text-lg mt-1">
            {opponentScore.score}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {opponentScore.score} / {opponentScore.totalHabits} goals
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CompletedBattleCard;
