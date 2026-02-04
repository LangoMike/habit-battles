"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { PageLayout, PageHeader, Section } from "@/components/PageLayout";
import { toast } from "sonner";
import { Sword, Trophy, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
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
import CompletedBattleCard from "@/components/CompletedBattleCard";

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
  const router = useRouter();
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

      if (battlesError) {
        console.error("Error fetching battles:", battlesError);
        toast.error("Failed to load battles");
        setBattles([]);
        setLoading(false);
        return;
      }

      if (!battlesData || battlesData.length === 0) {
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
            const isCurrentUser = member.user_id === currentUserId;
            const score = await calculateBattleScore(
              member.user_id,
              battle.start_date,
              battle.end_date,
              isCurrentUser
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
    return battle.start_date <= today && battle.end_date >= today;
  };

  // Check if battle is completed
  const isBattleCompleted = (battle: Battle) => {
    const today = new Date().toISOString().split("T")[0];
    return battle.end_date < today;
  };

  // Get winners of completed battle (returns array to handle ties)
  const getWinner = (battle: BattleWithMembers): string[] | null => {
    if (!isBattleCompleted(battle)) return null;

    let maxScore = -1;
    const winnerIds: string[] = [];

    battle.members.forEach((member) => {
      const score = battle.scores[member.user_id]?.score || 0;
      if (score > maxScore) {
        maxScore = score;
        winnerIds.length = 0; // Clear previous winners
        winnerIds.push(member.user_id);
      } else if (score === maxScore && maxScore >= 0) {
        // Tie: add to winners array
        winnerIds.push(member.user_id);
      }
    });

    return winnerIds.length > 0 ? winnerIds : null;
  };

  const activeBattles = battles.filter((b) => isBattleActive(b));
  const completedBattles = battles.filter((b) => isBattleCompleted(b));

  return (
    <PageLayout>
      {/* Welcome Header */}
      <PageHeader
        title={username ? `${username}, Ready to battle?!` : "Ready to battle?!"}
        subtitle="Create battles and fight to the top of the leaderboards"
        icon={
          <Image
            src="/habit-battles-logo.svg"
            alt="Habit Battles Logo"
            width={48}
            height={48}
            className="h-12 w-12"
          />
        }
        actions={
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={() => router.push("/leaderboard")}
              variant="outline"
              size="sm"
            >
              <Trophy className="h-4 w-4" />
              Leaderboard
            </Button>
            <Button
              onClick={() => setCreateDialogOpen(true)}
              size="sm"
            >
              <Plus className="h-4 w-4" />
              Create Battle
            </Button>
          </div>
        }
      />

      {/* Active Battles */}
      <Section
        title="Active Battles"
        icon={<Sword className="h-5 w-5" />}
      >
        {loading && activeBattles.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        ) : activeBattles.length === 0 ? (
          <Card>
            <CardContent>
              <EmptyState
                icon={Sword}
                title="No active battles"
                description="Create a battle to compete with friends and track your progress"
                action={
                  <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Battle
                  </Button>
                }
              />
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeBattles.map((battle) => (
              <BattleCard key={battle.id} battle={battle} currentUserId={userId || ""} />
            ))}
          </div>
        )}
      </Section>

      {/* Completed Battles */}
      <Section
        title="Completed Battles"
        icon={<Trophy className="h-5 w-5" />}
      >
        {loading && completedBattles.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        ) : completedBattles.length === 0 ? (
          <Card>
            <CardContent>
              <EmptyState
                icon={Trophy}
                title="No completed battles"
                description="Complete an active battle to see your results here. Finish a battle to view the winner and final scores."
              />
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedBattles.map((battle) => {
              const winnerIds = getWinner(battle);
              return (
                <CompletedBattleCard
                  key={battle.id}
                  battle={battle}
                  currentUserId={userId || ""}
                  winnerIds={winnerIds}
                />
              );
            })}
          </div>
        )}
      </Section>

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
              <label className="font-ui text-sm font-medium text-foreground mb-2 block">
                Opponent
              </label>
              {friends.length === 0 ? (
                <div className="font-ui text-sm text-muted-foreground py-2">
                  No friends available. Add friends first to create a battle.
                </div>
              ) : (
                <select
                  className="w-full h-9 rounded-md border border-input bg-background text-foreground px-3 py-1 text-sm"
                  value={selectedFriendId}
                  onChange={(e) => setSelectedFriendId(e.target.value)}
                >
                  <option value="">Select a friend...</option>
                  {friends.map((friend) => {
                    const friendId =
                      friend.user_id === userId ? friend.friend_id : friend.user_id;
                    const friendUsername = friendProfiles[friendId]?.username || friendId;
                    // Only show option if we have a username (not just UUID)
                    if (friendUsername === friendId && !friendProfiles[friendId]) {
                      return null; // Skip if profile not loaded yet
                    }
                    return (
                      <option key={friend.id} value={friendId}>
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
            <Button onClick={createBattle} loading={loading}>
              Create Battle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}

