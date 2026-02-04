"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { PageLayout, PageHeader } from "@/components/PageLayout";
import { Trophy } from "lucide-react";
import { toast } from "sonner";

type LeaderboardEntry = {
  userId: string;
  username: string;
  avatarUrl: string | null;
  battlesParticipated: number;
  battlesWon: number;
  totalGoalsCompleted: number;
};

export default function LeaderboardPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        location.href = "/login";
        return;
      }

      const currentUserId = data.user.id;
      setUserId(currentUserId);
      await loadLeaderboard(currentUserId);
    });
  }, []);

  const loadLeaderboard = async (currentUserId: string) => {
    setLoading(true);
    try {
      // Get all accepted friends
      const { data: friendsData } = await supabase
        .from("friendships")
        .select("*")
        .or(`user_id.eq.${currentUserId},friend_id.eq.${currentUserId}`)
        .eq("status", "accepted");

      if (!friendsData) {
        setLeaderboard([]);
        setLoading(false);
        return;
      }

      // Get friend IDs (excluding current user)
      const friendIds = new Set<string>();
      friendsData.forEach((f) => {
        if (f.user_id === currentUserId) {
          friendIds.add(f.friend_id);
        } else {
          friendIds.add(f.user_id);
        }
      });

      // Include current user in leaderboard
      friendIds.add(currentUserId);

      // Get all completed battles that any friend participated in
      // We need to get battles for all friends, not just current user
      const allBattleIds = new Set<string>();
      const allBattleData: any[] = [];

      // Get battles for each friend (including current user)
      for (const friendId of friendIds) {
        const { data: battlesData } = await supabase.rpc("get_user_battles", {
          p_user_id: friendId,
        });

        if (battlesData) {
          battlesData.forEach((battle: any) => {
            if (!allBattleIds.has(battle.id)) {
              allBattleIds.add(battle.id);
              allBattleData.push(battle);
            }
          });
        }
      }

      // Separate completed and active battles
      const today = new Date().toISOString().split("T")[0];
      const completedBattles = allBattleData.filter(
        (b: any) => b.end_date < today
      );
      const activeBattles = allBattleData.filter(
        (b: any) => b.start_date <= today && b.end_date >= today
      );

      const battleIds = Array.from(allBattleIds);
      let allMembers: any[] = [];

      if (battleIds.length > 0) {
        const { data: membersData } = await supabase.rpc("get_battle_members", {
          p_battle_ids: battleIds,
        });
        allMembers = membersData || [];
      }

      // Calculate stats for each user
      const leaderboardEntries: LeaderboardEntry[] = [];

      for (const friendId of friendIds) {
        // Get profile
        const { data: usernameData } = await supabase.rpc("get_username_by_id", {
          user_id: friendId,
        });
        const { data: avatarData } = await supabase
          .from("profiles")
          .select("avatar_url")
          .eq("id", friendId)
          .maybeSingle();

        const username =
          usernameData && Array.isArray(usernameData) && usernameData.length > 0
            ? usernameData[0]?.username || friendId
            : friendId;
        const avatarUrl = avatarData?.avatar_url || null;

        // Get all battles this user participated in (both completed and active)
        const userCompletedBattles = completedBattles.filter((b: any) =>
          allMembers.some(
            (m: any) => m.battle_id === b.id && m.user_id === friendId
          )
        );
        const userActiveBattles = activeBattles.filter((b: any) =>
          allMembers.some(
            (m: any) => m.battle_id === b.id && m.user_id === friendId
          )
        );

        // Calculate battles won (only from completed battles)
        let battlesWon = 0;

        // Process completed battles to determine wins
        for (const battle of userCompletedBattles) {
          // Get all members of this battle
          const battleMembers = allMembers.filter(
            (m: any) => m.battle_id === battle.id
          );

          // Calculate scores for all members to determine winner
          const memberScores: Record<string, number> = {};

          for (const member of battleMembers) {
            // Use the RPC function to get battle score summary
            const { data: scoreData, error: scoreError } = await supabase.rpc(
              "get_battle_score_summary",
              {
                p_user_id: member.user_id,
                p_start_date: battle.start_date,
                p_end_date: battle.end_date,
              }
            );

            if (scoreError) {
              console.error(
                `Error getting score for user ${member.user_id} in battle ${battle.id}:`,
                scoreError
              );
              memberScores[member.user_id] = 0;
            } else if (scoreData && Array.isArray(scoreData) && scoreData.length > 0) {
              memberScores[member.user_id] = scoreData[0].completed_goals || 0;
            } else {
              memberScores[member.user_id] = 0;
            }
          }

          // Find max score
          const maxScore = Math.max(...Object.values(memberScores));

          // Check if user won (has max score) - only for completed battles
          if (memberScores[friendId] === maxScore && maxScore >= 0) {
            battlesWon++;
          }
        }

        // Get total goals completed across ALL battles (both active and completed)
        // This new function calculates goals directly from checkins + habits
        const { data: totalGoalsData, error: goalsError } = await supabase.rpc(
          "get_total_goals_completed",
          {
            p_user_id: friendId,
          }
        );

        const totalGoalsCompleted = goalsError ? 0 : (totalGoalsData || 0);

        leaderboardEntries.push({
          userId: friendId,
          username,
          avatarUrl,
          battlesParticipated: userCompletedBattles.length + userActiveBattles.length,
          battlesWon,
          totalGoalsCompleted,
        });
      }

      // Sort: battles won (desc), then total goals completed (desc)
      leaderboardEntries.sort((a, b) => {
        if (b.battlesWon !== a.battlesWon) {
          return b.battlesWon - a.battlesWon;
        }
        return b.totalGoalsCompleted - a.totalGoalsCompleted;
      });

      setLeaderboard(leaderboardEntries);
    } catch (error) {
      console.error("Error loading leaderboard:", error);
      toast.error("Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout>
      <PageHeader
        title="Leaderboard"
        subtitle="Ranked by battles won. Ties broken by total goals completed."
        icon={<Trophy className="h-8 w-8 text-primary" />}
      />

      <Card>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : leaderboard.length === 0 ? (
            <EmptyState
              icon={Trophy}
              title="No leaderboard data"
              description="Add friends and complete battles to see the leaderboard"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-display text-sm font-semibold text-muted-foreground">
                      Rank
                    </th>
                    <th className="text-left py-3 px-4 font-display text-sm font-semibold text-muted-foreground">
                      User
                    </th>
                    <th className="text-right py-3 px-4 font-display text-sm font-semibold text-muted-foreground">
                      Battles Participated
                    </th>
                    <th className="text-right py-3 px-4 font-display text-sm font-semibold text-muted-foreground">
                      Battles Won
                    </th>
                    <th className="text-right py-3 px-4 font-display text-sm font-semibold text-muted-foreground">
                      Goals Completed
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry, index) => {
                    const isCurrentUser = entry.userId === userId;
                    return (
                      <tr
                        key={entry.userId}
                        className={`border-b border-border/50 hover:bg-muted/50 transition-colors ${
                          isCurrentUser ? "bg-primary/5" : ""
                        }`}
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            {index === 0 && (
                              <Trophy className="h-5 w-5 text-primary" />
                            )}
                            <span className="font-display font-bold text-foreground">
                              {index + 1}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={entry.avatarUrl || undefined} />
                              <AvatarFallback className="bg-muted text-muted-foreground">
                                {entry.username[0]?.toUpperCase() || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-ui font-semibold text-foreground">
                              {entry.username}
                              {isCurrentUser && (
                                <span className="ml-2 font-ui text-xs text-primary">
                                  (You)
                                </span>
                              )}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right font-ui text-foreground">
                          {entry.battlesParticipated}
                        </td>
                        <td className="py-4 px-4 text-right font-display font-semibold text-foreground">
                          {entry.battlesWon}
                        </td>
                        <td className="py-4 px-4 text-right font-ui text-foreground">
                          {entry.totalGoalsCompleted}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </PageLayout>
  );
}
