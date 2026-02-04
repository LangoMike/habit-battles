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
import BattleCard from "@/components/BattleCard";

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
export type BattleWithMembers = Battle & {
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
      // Get all battles where user is a member using database function (bypasses RLS)
      const { data: battlesData, error: battlesError } = await supabase.rpc("get_user_battles", {
        p_user_id: currentUserId,
      });

      console.log("Battles query:", { battlesData, battlesError, currentUserId });

      if (battlesError) {
        console.error("Error fetching battles:", battlesError);
        toast.error("Failed to load battles");
        setBattles([]);
        setLoading(false);
        return;
      }

      if (!battlesData || battlesData.length === 0) {
        console.log("No battles found");
        setBattles([]);
        setLoading(false);
        return;
      }

      // Transform the function result to match Battle type
      type BattleResult = {
        battle_id: string;
        battle_name: string;
        owner_id: string;
        start_date: string;
        end_date: string;
        created_at: string;
      };
      
      const battleIds = (battlesData as BattleResult[]).map((b) => b.battle_id);
      const transformedBattles: Battle[] = (battlesData as BattleResult[]).map((b) => ({
        id: b.battle_id,
        name: b.battle_name,
        owner_id: b.owner_id,
        start_date: b.start_date,
        end_date: b.end_date,
        created_at: b.created_at,
      }));

      // Get all members for these battles using database function (bypasses RLS)
      const { data: allMembersData, error: membersError } = await supabase.rpc("get_battle_members", {
        p_battle_ids: battleIds,
      });

      if (membersError) {
        console.error("Error fetching battle members:", membersError);
        toast.error("Failed to load battle members");
        setBattles([]);
        setLoading(false);
        return;
      }

      const allMembers: BattleMember[] = (allMembersData || []).map((m: any) => ({
        battle_id: m.battle_id,
        user_id: m.user_id,
        joined_at: m.joined_at,
      }));

      // Get all user IDs from members
      const userIds = new Set<string>();
      transformedBattles.forEach((b) => userIds.add(b.owner_id));
      allMembers.forEach((m) => userIds.add(m.user_id));

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
        transformedBattles.map(async (battle) => {
          const members = allMembers.filter((m) => m.battle_id === battle.id);
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

      console.log("Battles loaded:", battlesWithScores);
      setBattles(battlesWithScores);
    } catch (error) {
      console.error("Error loading battles:", error);
      toast.error("Failed to load battles");
    } finally {
      setLoading(false);
    }
  }, []);

  // Set up real-time subscription for battle updates
  useEffect(() => {
    if (!userId) return;

    const battlesChannel = supabase
      .channel("battles-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "battle_members",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          if (userId) loadBattles(userId);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "battles",
        },
        () => {
          if (userId) loadBattles(userId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(battlesChannel);
    };
  }, [userId, loadBattles]);

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
      // Wait a moment for database to sync, then reload
      setTimeout(async () => {
        await loadBattles(userId);
      }, 500);
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
    const isActive = battle.start_date <= today && battle.end_date >= today;
    console.log(`Battle ${battle.id} active check:`, {
      start_date: battle.start_date,
      end_date: battle.end_date,
      today,
      isActive
    });
    return isActive;
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

  // Debug logging
  console.log("Battles state:", { 
    totalBattles: battles.length, 
    activeBattles: activeBattles.length, 
    completedBattles: completedBattles.length,
    battles: battles.map(b => ({ id: b.id, name: b.name, start_date: b.start_date, end_date: b.end_date, members: b.members.length }))
  });

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeBattles.map((battle) => (
                <BattleCard key={battle.id} battle={battle} currentUserId={userId || ""} />
              ))}
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

