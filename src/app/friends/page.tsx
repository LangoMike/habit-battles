"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageLayout, PageHeader, Section } from "@/components/PageLayout";
import { toast } from "sonner";
import { Search, UserPlus, Users, Check, X, Sword } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { createBattle } from "@/lib/battleUtils";

type FriendRow = {
  id: string;
  user_id: string;
  friend_id: string;
  status: "pending" | "accepted" | "blocked";
  created_at?: string;
};

type Profile = {
  id: string;
  username: string;
  avatar_url?: string | null;
};

export default function FriendsPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [usernameToInvite, setUsernameToInvite] = useState("");
  const [friends, setFriends] = useState<FriendRow[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [friendUsernames, setFriendUsernames] = useState<Record<string, string>>({});
  const [friendAvatars, setFriendAvatars] = useState<Record<string, string | null>>({});
  const [loading, setLoading] = useState(false);
  const [battleDialogOpen, setBattleDialogOpen] = useState(false);
  const [selectedFriendForBattle, setSelectedFriendForBattle] = useState<string>("");
  const [creatingBattle, setCreatingBattle] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return (location.href = "/login");
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

      await loadProfiles();
      // Load friendships and usernames after userId is set
      const { data: friendsData } = await supabase
        .from("friendships")
        .select("*")
        .order("created_at", { ascending: false });
      setFriends(friendsData ?? []);

      // Load usernames for all friends
      if (friendsData && friendsData.length > 0) {
        const usernameMap: Record<string, string> = {};
        const friendIds = new Set<string>();
        friendsData.forEach((f) => {
          if (f.user_id !== currentUserId) friendIds.add(f.user_id);
          if (f.friend_id !== currentUserId) friendIds.add(f.friend_id);
        });

        const avatarMap: Record<string, string | null> = {};

        const profilePromises = Array.from(friendIds).map(async (id) => {
          try {
            // Get username using database function (bypasses RLS)
            const { data: usernameData, error: usernameError } = await supabase
              .rpc("get_username_by_id", { user_id: id });
            
            if (!usernameError && usernameData && Array.isArray(usernameData) && usernameData.length > 0) {
              const username = usernameData[0]?.username;
              if (username && username.trim() !== '') {
                usernameMap[id] = username;
              }
            }

            // Try to get avatar_url directly (might be blocked by RLS, but worth trying)
            const { data: avatarData, error: avatarError } = await supabase
              .from("profiles")
              .select("avatar_url")
              .eq("id", id)
              .maybeSingle();
            
            if (!avatarError && avatarData) {
              avatarMap[id] = avatarData.avatar_url || null;
            }
          } catch (err) {
            console.error(`Exception fetching profile for ${id}:`, err);
          }
        });

        await Promise.all(profilePromises);
        setFriendUsernames(usernameMap);
        setFriendAvatars(avatarMap);
      }
    });
  }, []);

  const loadProfiles = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, username")
      .order("username", { ascending: true });

    if (error) {
      console.error("Error loading profiles:", error);
      toast.error("Failed to load user profiles. Please refresh the page.");
      return;
    }

    setProfiles(data || []);
  };

  const refresh = async () => {
    if (!userId) return;
    
    const { data } = await supabase
      .from("friendships")
      .select("*")
      .order("created_at", { ascending: false });
    setFriends(data ?? []);

    // Load usernames for all friends using database function
    if (data && data.length > 0) {
      const usernameMap: Record<string, string> = { ...friendUsernames };
      
      // Get all unique friend IDs (excluding current user)
      const friendIds = new Set<string>();
      data.forEach((f) => {
        if (f.user_id !== userId) friendIds.add(f.user_id);
        if (f.friend_id !== userId) friendIds.add(f.friend_id);
      });

      const avatarMap: Record<string, string | null> = { ...friendAvatars };

      // Fetch profiles (username + avatar) for each friend ID
      const profilePromises = Array.from(friendIds).map(async (id) => {
        // Skip if we already have this username and avatar
        if (usernameMap[id] && avatarMap[id] !== undefined) return;
        
        try {
          // Try to get username using database function (bypasses RLS)
          const { data: usernameData, error: usernameError } = await supabase
            .rpc("get_username_by_id", { user_id: id });
          
          if (!usernameError && usernameData && Array.isArray(usernameData) && usernameData.length > 0) {
            const username = usernameData[0]?.username;
            if (username && username.trim() !== '') {
              usernameMap[id] = username;
            }
          }

          // Try to get avatar_url directly (might be blocked by RLS, but worth trying)
          const { data: avatarData, error: avatarError } = await supabase
            .from("profiles")
            .select("avatar_url")
            .eq("id", id)
            .maybeSingle();
          
          if (!avatarError && avatarData) {
            avatarMap[id] = avatarData.avatar_url || null;
          }
        } catch (err) {
          console.error(`Exception fetching profile for ${id}:`, err);
        }
      });

      await Promise.all(profilePromises);
      setFriendUsernames(usernameMap);
      setFriendAvatars(avatarMap);
    }
  };

  const invite = async () => {
    if (!usernameToInvite.trim() || !userId) return;

    setLoading(true);

    const searchTerm = usernameToInvite.trim();

    // First try to find in already-loaded profiles (faster, case-insensitive)
    let targetProfile = profiles.find(
      (p) => p.username && p.username.toLowerCase() === searchTerm.toLowerCase()
    );

    // If not found in loaded profiles, use database function to search
    // This function bypasses RLS and allows searching for usernames
    if (!targetProfile) {
      const { data: searchResult, error: searchError } = await supabase
        .rpc("search_username", { search_term: searchTerm });

      if (searchError) {
        console.error("Error searching for user:", searchError);
        toast.error("Error searching for user. Please try again.");
        setLoading(false);
        return;
      }

      if (searchResult && searchResult.length > 0) {
        targetProfile = searchResult[0];
      }
    }

    if (!targetProfile) {
      toast.error(`User "${searchTerm}" not found.`);
      setLoading(false);
      return;
    }

    const friendId = targetProfile.id;
    if (friendId === userId) {
      toast.error("You cannot invite yourself");
      setLoading(false);
      return;
    }

    // Check if friendship already exists
    const { data: existingFriendship } = await supabase
      .from("friendships")
      .select("*")
      .or(
        `and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`
      )
      .maybeSingle();

    if (existingFriendship) {
      toast.error("Friendship already exists");
      setLoading(false);
      return;
    }

    const { error: insErr } = await supabase
      .from("friendships")
      .insert({ user_id: userId, friend_id: friendId, status: "pending" });

    if (insErr) {
      console.error("Error creating friendship:", insErr);
      toast.error(insErr.message);
    } else {
      // Cache the friend's username for immediate display
      if (targetProfile.username) {
        setFriendUsernames((prev) => ({
          ...prev,
          [friendId]: targetProfile.username,
        }));
      }
      toast.success(`Invitation sent to ${targetProfile.username}`);
      setUsernameToInvite("");
      refresh();
    }

    setLoading(false);
  };

  const getUsernameById = (id: string) => {
    // First check cached friend usernames
    if (friendUsernames[id]) {
      return friendUsernames[id];
    }
    // Fallback to profiles array
    const profile = profiles.find((p) => p.id === id);
    return profile?.username || id;
  };

  const getAvatarById = (id: string) => {
    // Check cached friend avatars
    if (friendAvatars[id] !== undefined) {
      return friendAvatars[id];
    }
    // Fallback to profiles array
    const profile = profiles.find((p) => p.id === id);
    return profile?.avatar_url || null;
  };

  // Handle challenge to battle - opens confirmation dialog
  const handleChallengeToBattle = (friendId: string) => {
    setSelectedFriendForBattle(friendId);
    setBattleDialogOpen(true);
  };

  // Create battle from dialog
  const handleCreateBattle = async () => {
    if (!userId || !selectedFriendForBattle) {
      toast.error("Please select a friend");
      return;
    }

    setCreatingBattle(true);
    const battleId = await createBattle(userId, selectedFriendForBattle);
    
    if (battleId) {
      setBattleDialogOpen(false);
      setSelectedFriendForBattle("");
      toast.success("Battle created! Check the battles page to see your progress.");
    }
    
    setCreatingBattle(false);
  };

  // Accept a friend invitation
  const acceptInvitation = async (friendship: FriendRow) => {
    if (!userId) return;

    // Verify that this is an incoming invitation (user is the friend_id)
    if (friendship.friend_id !== userId) {
      toast.error("You can only accept invitations sent to you.");
      return;
    }

    // Try using database function first (bypasses RLS)
    const { error: functionError } = await supabase
      .rpc("accept_friendship", {
        friendship_id: friendship.id,
        current_user_id: userId,
      });

    if (functionError) {
      // Fallback to direct update if function doesn't exist
      console.log("Function not available, trying direct update:", functionError);
      const { error: updateError } = await supabase
        .from("friendships")
        .update({ status: "accepted" })
        .eq("id", friendship.id)
        .eq("friend_id", userId); // Ensure user is the recipient

      if (updateError) {
        console.error("Error accepting invitation:", updateError);
        toast.error(`Failed to accept invitation: ${updateError.message || "Please try again."}`);
        return;
      }
    }

    toast.success("Friend invitation accepted!");
    refresh();
  };

  // Decline/Remove a friend invitation
  const declineInvitation = async (friendship: FriendRow) => {
    if (!userId) return;

    // Verify that this is an incoming invitation (user is the friend_id)
    if (friendship.friend_id !== userId) {
      toast.error("You can only decline invitations sent to you.");
      return;
    }

    // Try using database function first (bypasses RLS)
    const { error: functionError } = await supabase
      .rpc("decline_friendship", {
        friendship_id: friendship.id,
        current_user_id: userId,
      });

    if (functionError) {
      // Fallback to direct delete if function doesn't exist
      console.log("Function not available, trying direct delete:", functionError);
      const { error: deleteError } = await supabase
        .from("friendships")
        .delete()
        .eq("id", friendship.id)
        .eq("friend_id", userId); // Ensure user is the recipient

      if (deleteError) {
        console.error("Error declining invitation:", deleteError);
        toast.error(`Failed to decline invitation: ${deleteError.message || "Please try again."}`);
        return;
      }
    }

    toast.success("Invitation declined");
    refresh();
  };

  // Separate pending invitations from accepted friends
  const pendingInvitations = friends.filter((f) => f.status === "pending");
  const acceptedFriends = friends.filter((f) => f.status === "accepted");

  return (
    <PageLayout>
      <PageHeader
        title="Friends"
        subtitle="Connect with friends and compete in habit battles"
        icon={<Users className="h-8 w-8 text-primary" />}
      />

      <Section
        title="Add Friends"
        icon={<UserPlus className="h-5 w-5" />}
      >
        <Card>
          <CardContent>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Search by username..."
                  value={usernameToInvite}
                  onChange={(e) => setUsernameToInvite(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && usernameToInvite.trim() && !loading) {
                      invite();
                    }
                  }}
                  className="pl-10"
                />
              </div>
              <Button
                onClick={invite}
                disabled={!usernameToInvite.trim() || loading}
                loading={loading}
              >
                Invite
              </Button>
            </div>
          </CardContent>
        </Card>
      </Section>

      {/* Your Invitations Section */}
      <Section
        title="Your Invitations"
        icon={<Users className="h-5 w-5" />}
      >
        {pendingInvitations.length === 0 ? (
          <Card>
            <CardContent>
              <EmptyState
                icon={Users}
                title="No pending invitations"
                description="Invite friends or wait for incoming invitations"
              />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {pendingInvitations.map((f) => {
              const isIncoming = f.friend_id === userId;
              const isOutgoing = f.user_id === userId;

              return (
                <Card key={f.id} className="hover:shadow-md transition-shadow">
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          <Users className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-ui text-sm font-medium text-foreground">
                            {isOutgoing
                              ? `You → ${getUsernameById(f.friend_id)}`
                              : `${getUsernameById(f.user_id)} → You`}
                          </div>
                          <div className="font-ui text-xs text-muted-foreground">
                            {isOutgoing
                              ? "Pending invitation"
                              : "Incoming invitation"}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isIncoming ? (
                          <>
                            <Button
                              size="sm"
                              onClick={() => acceptInvitation(f)}
                              variant="default"
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => declineInvitation(f)}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Decline
                            </Button>
                          </>
                        ) : (
                          <div className="font-ui text-xs px-2 py-1 rounded bg-muted text-muted-foreground">
                            pending
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </Section>

      {/* Friends List Section */}
      <Section
        title="Friends List"
        icon={<Users className="h-5 w-5" />}
      >
        {acceptedFriends.length === 0 ? (
          <Card>
            <CardContent>
              <EmptyState
                icon={Users}
                title="No friends yet"
                description="Accept an invitation to get started"
              />
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {acceptedFriends.map((f) => {
              const friendId = f.user_id === userId ? f.friend_id : f.user_id;
              const friendUsername = getUsernameById(friendId);
              const friendAvatar = getAvatarById(friendId);

              return (
                <Card
                  key={f.id}
                  className="flex flex-col items-center p-4 hover:shadow-md transition-all duration-200 group"
                >
                  <Avatar className="h-16 w-16 mb-3 group-hover:scale-105 transition-transform">
                    <AvatarImage src={friendAvatar || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xl font-display">
                      {friendUsername?.[0]?.toUpperCase() || "F"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="font-ui text-sm font-medium text-foreground text-center mb-3 truncate w-full">
                    {friendUsername}
                  </div>

                  <Button
                    size="sm"
                    onClick={() => handleChallengeToBattle(friendId)}
                    className="w-full"
                  >
                    <Sword className="h-4 w-4 mr-1" />
                    Challenge
                  </Button>
                </Card>
              );
            })}
          </div>
        )}
      </Section>

      {/* Create Battle Dialog */}
      <Dialog open={battleDialogOpen} onOpenChange={setBattleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Challenge to Battle</DialogTitle>
            <DialogDescription>
              Create a week-long habit battle with {getUsernameById(selectedFriendForBattle)}. The
              person with the most completed habits wins! The battle will start immediately and last 7 days.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <p className="text-sm text-gray-400">
              Battle name will be auto-generated as "{username || "You"} vs {getUsernameById(selectedFriendForBattle)}"
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setBattleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateBattle} loading={creatingBattle}>
              Create Battle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
