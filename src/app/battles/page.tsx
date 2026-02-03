"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Sword, Trophy, Calendar, Users, Plus, Crown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { calculateBattleScore, BattleScore } from "@/lib/battleScore";
import { createBattle as createBattleUtil } from "@/lib/battleUtils";

// Battle data types
type Battle = {
  id: string;
  name: string;
  owner_id: string;
  start_date: string;
  end_date: string;
  created_at: string;
};

type BattleMember = {
  battle_id: string;
  user_id: string;
  joined_at: string;
};

// Battle with members data - battles are 1v1, so members array contains exactly 2 users (current user + friend)
type BattleWithMembers = Battle & {
  members: BattleMember[]; // Always exactly 2 members for 1v1 battles
  scores: Record<string, BattleScore>;
  memberProfiles: Record<string, { username: string; avatar_url: string | null }>;
};

type Friend = {
  id: string;
  user_id: string;
  friend_id: string;
  status: "accepted";
};

export default function BattlesPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [battles, setBattles] = useState<BattleWithMembers[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendProfiles, setFriendProfiles] = useState<Record<string, { username: string; avatar_url: string | null }>>({});
  const [loading, setLoading] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedFriendId, setSelectedFriendId] = useState<string>("");

  // Load user data and battles
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        location.href = "/login";
        return;
      }

      const currentUserId = data.user.id;
      setUserId(currentUserId);

      // Fetch username
      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", currentUserId)
        .single();

      if (profile?.username) {
        setUsername(profile.username);
      }

      // Load friends and battles
      await Promise.all([loadFriends(currentUserId), loadBattles(currentUserId)]);
    });
  }, []);

  // Load accepted friends with profiles
  const loadFriends = async (currentUserId: string) => {
    const { data: friendsData } = await supabase
      .from("friendships")
      .select("*")
      .or(`user_id.eq.${currentUserId},friend_id.eq.${currentUserId}`)
      .eq("status", "accepted");

    if (friendsData) {
      // Filter to get only the friend IDs (not the current user)
      const friendList = friendsData
        .map((f) => ({
          id: f.id,
          user_id: f.user_id,
          friend_id: f.friend_id,
          status: f.status as "accepted",
        }))
        .filter((f) => f.user_id === currentUserId || f.friend_id === currentUserId);
      setFriends(friendList);

      // Load profiles for all friends
      const friendIds = friendList.map((f) =>
        f.user_id === currentUserId ? f.friend_id : f.user_id
      );
      const profiles: Record<string, { username: string; avatar_url: string | null }> = {};

      const profilePromises = friendIds.map(async (id) => {
        const { data: usernameData } = await supabase.rpc("get_username_by_id", {
          user_id: id,
        });
        const { data: avatarData } = await supabase
          .from("profiles")
          .select("avatar_url")
          .eq("id", id)
          .maybeSingle();

        if (usernameData && Array.isArray(usernameData) && usernameData.length > 0) {
          profiles[id] = {
            username: usernameData[0]?.username || id,
            avatar_url: avatarData?.avatar_url || null,
          };
        } else {
          profiles[id] = { username: id, avatar_url: null };
        }
      });

      await Promise.all(profilePromises);
      setFriendProfiles(profiles);
    }
  };

  // Load battles with members and scores
  const loadBattles = useCallback(async (currentUserId: string) => {
    setLoading(true);
    try {
      // Get all battles where user is a member
      const { data: memberBattles } = await supabase
        .from("battle_members")
        .select("battle_id")
        .eq("user_id", currentUserId);

      if (!memberBattles || memberBattles.length === 0) {
        setBattles([]);
        setLoading(false);
        return;
      }

      const battleIds = memberBattles.map((m) => m.battle_id);

      // Get battle details
      const { data: battlesData } = await supabase
        .from("battles")
        .select("*")
        .in("id", battleIds)
        .order("created_at", { ascending: false });

      if (!battlesData) {
        setBattles([]);
        setLoading(false);
        return;
      }

      // Get all members for these battles
      const { data: allMembers } = await supabase
        .from("battle_members")
        .select("*")
        .in("battle_id", battleIds);

      // Get all user IDs from members
      const userIds = new Set<string>();
      battlesData.forEach((b) => userIds.add(b.owner_id));
      allMembers?.forEach((m) => userIds.add(m.user_id));

      // Get profiles for all users
      const profileMap: Record<string, { username: string; avatar_url: string | null }> = {};
      const profilePromises = Array.from(userIds).map(async (id) => {
        const { data: usernameData } = await supabase.rpc("get_username_by_id", {
          user_id: id,
        });
        const { data: avatarData } = await supabase
          .from("profiles")
          .select("avatar_url")
          .eq("id", id)
          .maybeSingle();

        if (usernameData && Array.isArray(usernameData) && usernameData.length > 0) {
          profileMap[id] = {
            username: usernameData[0]?.username || id,
            avatar_url: avatarData?.avatar_url || null,
          };
        } else {
          profileMap[id] = { username: id, avatar_url: null };
        }
      });

      await Promise.all(profilePromises);

      // Calculate scores for each battle
      const battlesWithScores = await Promise.all(
        battlesData.map(async (battle) => {
          const members = allMembers?.filter((m) => m.battle_id === battle.id) || [];
          const scores: Record<string, BattleScore> = {};

          // Calculate score for each member
          for (const member of members) {
            const score = await calculateBattleScore(
              member.user_id,
              battle.start_date,
              battle.end_date
            );
            scores[member.user_id] = score;
          }

          return {
            ...battle,
            members,
            scores,
            memberProfiles: profileMap,
          };
        })
      );

      setBattles(battlesWithScores);
    } catch (error) {
      console.error("Error loading battles:", error);
      toast.error("Failed to load battles");
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new battle
  const createBattle = async () => {
    if (!userId || !selectedFriendId) {
      toast.error("Please select a friend to battle");
      return;
    }

    setLoading(true);
    const battleId = await createBattleUtil(userId, selectedFriendId);
    
    if (battleId) {
      setCreateDialogOpen(false);
      setSelectedFriendId("");
      await loadBattles(userId);
    }
    
    setLoading(false);
  };

  // Get friend username
  const getFriendUsername = (friendId: string) => {
    return friendProfiles[friendId]?.username || friendId;
  };

  // Check if battle is active
  const isBattleActive = (battle: Battle) => {
    const today = new Date().toISOString().split("T")[0];
    return battle.start_date <= today && battle.end_date >= today;
  };

  // Check if battle is completed
  const isBattleCompleted = (battle: Battle) => {
    const today = new Date().toISOString().split("T")[0];
    return battle.end_date < today;
  };

  // Get winner of completed battle
  const getWinner = (battle: BattleWithMembers) => {
    if (!isBattleCompleted(battle)) return null;

    let maxScore = -1;
    let winnerId: string | null = null;

    battle.members.forEach((member) => {
      const score = battle.scores[member.user_id]?.score || 0;
      if (score > maxScore) {
        maxScore = score;
        winnerId = member.user_id;
      }
    });

    return winnerId;
  };

  // Format date for display
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Get days remaining
  const getDaysRemaining = (endDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);
    const diff = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const activeBattles = battles.filter((b) => isBattleActive(b));
  const completedBattles = battles.filter((b) => isBattleCompleted(b));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-8 space-y-8">
      {/* Welcome Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-4">
          <Image
            src="/habit-battles-logo.svg"
            alt="Habit Battles Logo"
            width={64}
            height={64}
            className="h-16 w-16"
          />
          <div className="text-left">
            <h1 className="text-3xl font-bold text-white">
              {username ? `${username}, ` : ""}Ready to battle?!
            </h1>
          </div>
        </div>
        <p className="text-gray-400">Create battles and fight to the top of the leaderboards.</p>
      </div>

      {/* Create Battle Button */}
      <div className="flex justify-center">
        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="bg-red-600 hover:bg-red-700 text-white"
          size="lg"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Battle
        </Button>
      </div>

      {/* Active Battles */}
      <Card className="p-6 bg-gradient-to-r from-gray-900/50 to-gray-800/50 border-gray-700/50">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Sword className="h-5 w-5 text-red-400" />
            <h2 className="text-xl font-semibold text-white">Active Battles</h2>
          </div>

          {loading && activeBattles.length === 0 ? (
            <div className="text-center py-8 text-gray-400">Loading battles...</div>
          ) : activeBattles.length === 0 ? (
            <div className="text-center py-8">
              <Sword className="h-12 w-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No active battles. Create one to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeBattles.map((battle) => {
                const daysRemaining = getDaysRemaining(battle.end_date);
                const sortedMembers = [...battle.members].sort((a, b) => {
                  const scoreA = battle.scores[a.user_id]?.score || 0;
                  const scoreB = battle.scores[b.user_id]?.score || 0;
                  return scoreB - scoreA;
                });

                return (
                  <div
                    key={battle.id}
                    className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/50"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{battle.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(battle.start_date)} - {formatDate(battle.end_date)}
                          </div>
                          <div className="text-red-400 font-medium">
                            {daysRemaining} {daysRemaining === 1 ? "day" : "days"} remaining
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Leaderboard */}
                    <div className="space-y-2">
                      {sortedMembers.map((member, index) => {
                        const score = battle.scores[member.user_id] || {
                          score: 0,
                          totalHabits: 0,
                          habitProgress: [],
                        };
                        const profile = battle.memberProfiles[member.user_id];
                        const isCurrentUser = member.user_id === userId;

                        return (
                          <div
                            key={member.user_id}
                            className={`flex items-center justify-between p-3 rounded-lg ${
                              isCurrentUser
                                ? "bg-red-500/20 border border-red-500/50"
                                : "bg-gray-700/30"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-600 text-white font-bold">
                                {index === 0 ? (
                                  <Crown className="h-5 w-5 text-yellow-400" />
                                ) : (
                                  index + 1
                                )}
                              </div>
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={profile?.avatar_url || undefined} />
                                <AvatarFallback className="bg-red-500/20 text-red-400 text-sm">
                                  {profile?.username?.[0]?.toUpperCase() || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="text-white font-medium">
                                  {profile?.username || member.user_id}
                                  {isCurrentUser && (
                                    <span className="ml-2 text-xs text-red-400">(You)</span>
                                  )}
                                </div>
                                <div className="text-xs text-gray-400">
                                  {score.habitProgress.filter((h) => h.isMet).length} /{" "}
                                  {score.totalHabits} habits completed
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-bold text-white">{score.score}</div>
                              <div className="text-xs text-gray-400">points</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>

      {/* Completed Battles */}
      {completedBattles.length > 0 && (
        <Card className="p-6 bg-gradient-to-r from-gray-900/50 to-gray-800/50 border-gray-700/50">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="h-5 w-5 text-yellow-400" />
              <h2 className="text-xl font-semibold text-white">Completed Battles</h2>
            </div>

            <div className="space-y-4">
              {completedBattles.map((battle) => {
                const winnerId = getWinner(battle);
                const sortedMembers = [...battle.members].sort((a, b) => {
                  const scoreA = battle.scores[a.user_id]?.score || 0;
                  const scoreB = battle.scores[b.user_id]?.score || 0;
                  return scoreB - scoreA;
                });

                return (
                  <div
                    key={battle.id}
                    className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/50"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{battle.name}</h3>
                        <div className="text-sm text-gray-400 mt-1">
                          {formatDate(battle.start_date)} - {formatDate(battle.end_date)}
                        </div>
                      </div>
                      {winnerId && (
                        <div className="flex items-center gap-2 text-yellow-400">
                          <Crown className="h-5 w-5" />
                          <span className="font-semibold">
                            {battle.memberProfiles[winnerId]?.username || "Winner"}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Final Leaderboard */}
                    <div className="space-y-2">
                      {sortedMembers.map((member, index) => {
                        const score = battle.scores[member.user_id] || {
                          score: 0,
                          totalHabits: 0,
                          habitProgress: [],
                        };
                        const profile = battle.memberProfiles[member.user_id];
                        const isWinner = member.user_id === winnerId;
                        const isCurrentUser = member.user_id === userId;

                        return (
                          <div
                            key={member.user_id}
                            className={`flex items-center justify-between p-3 rounded-lg ${
                              isWinner
                                ? "bg-yellow-500/20 border border-yellow-500/50"
                                : isCurrentUser
                                  ? "bg-gray-700/30"
                                  : "bg-gray-700/20"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-600 text-white font-bold">
                                {index === 0 ? (
                                  <Crown className="h-5 w-5 text-yellow-400" />
                                ) : (
                                  index + 1
                                )}
                              </div>
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={profile?.avatar_url || undefined} />
                                <AvatarFallback className="bg-yellow-500/20 text-yellow-400 text-sm">
                                  {profile?.username?.[0]?.toUpperCase() || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="text-white font-medium">
                                  {profile?.username || member.user_id}
                                  {isCurrentUser && (
                                    <span className="ml-2 text-xs text-gray-400">(You)</span>
                                  )}
                                  {isWinner && (
                                    <span className="ml-2 text-xs text-yellow-400">(Winner)</span>
                                  )}
                                </div>
                                <div className="text-xs text-gray-400">
                                  {score.habitProgress.filter((h) => h.isMet).length} /{" "}
                                  {score.totalHabits} habits completed
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-bold text-white">{score.score}</div>
                              <div className="text-xs text-gray-400">points</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      {/* Create Battle Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Battle</DialogTitle>
            <DialogDescription>
              Challenge a friend to a week-long habit battle. The person with the most completed
              habits wins!
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-white mb-2 block">Opponent</label>
              {friends.length === 0 ? (
                <div className="text-sm text-gray-400 py-2">
                  No friends available. Add friends first to create a battle.
                </div>
              ) : (
                <select
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm text-white"
                  value={selectedFriendId}
                  onChange={(e) => setSelectedFriendId(e.target.value)}
                >
                  <option value="" className="bg-gray-800 text-gray-400">
                    Select a friend...
                  </option>
                  {friends.map((friend) => {
                    const friendId =
                      friend.user_id === userId ? friend.friend_id : friend.user_id;
                    const friendUsername = friendProfiles[friendId]?.username || friendId;
                    // Only show option if we have a username (not just UUID)
                    if (friendUsername === friendId && !friendProfiles[friendId]) {
                      return null; // Skip if profile not loaded yet
                    }
                    return (
                      <option key={friend.id} value={friendId} className="bg-gray-800 text-white">
                        {friendUsername}
                      </option>
                    );
                  })}
                </select>
              )}
              <p className="text-xs text-gray-400 mt-1">
                Battle will start immediately and last 7 days. Battle name will be auto-generated.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createBattle} disabled={loading}>
              {loading ? "Creating..." : "Create Battle"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

