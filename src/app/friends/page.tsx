"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Search, UserPlus, Users } from "lucide-react";

type FriendRow = {
  user_id: string;
  friend_id: string;
  status: "pending" | "accepted" | "blocked";
};

type Profile = {
  id: string;
  username: string;
};

export default function FriendsPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [usernameToInvite, setUsernameToInvite] = useState("");
  const [friends, setFriends] = useState<FriendRow[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return (location.href = "/login");
      setUserId(data.user.id);
      await refresh();
      await loadProfiles();
    });
  }, []);

  const loadProfiles = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, username")
      .order("username", { ascending: true });

    if (error) {
      console.error("Error loading profiles:", error);
      return;
    }

    setProfiles(data || []);
  };

  const refresh = async () => {
    const { data } = await supabase
      .from("friendships")
      .select("*")
      .order("created_at", { ascending: false });
    setFriends(data ?? []);
  };

  const invite = async () => {
    if (!usernameToInvite.trim() || !userId) return;

    setLoading(true);

    // First, try exact match
    let target = profiles.find(
      (p) => p.username.toLowerCase() === usernameToInvite.trim().toLowerCase()
    );

    // If no exact match, try partial match
    if (!target) {
      target = profiles.find((p) =>
        p.username.toLowerCase().includes(usernameToInvite.trim().toLowerCase())
      );
    }

    if (!target) {
      const availableUsers = profiles
        .filter((p) => p.id !== userId) // Only show other users, not yourself
        .map((p) => p.username)
        .join(", ");

      toast.error(
        `User "${usernameToInvite.trim()}" not found. Available users: ${availableUsers}`
      );
      setLoading(false);
      return;
    }

    const friendId = target.id;
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
      toast.success(`Invitation sent to ${target.username}`);
      setUsernameToInvite("");
      refresh();
    }

    setLoading(false);
  };

  const getUsernameById = (id: string) => {
    const profile = profiles.find((p) => p.id === id);
    return profile?.username || id;
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-white">Friends</h1>
        <p className="text-gray-400">
          Connect with friends and compete in habit battles
        </p>
      </div>

      <Card className="p-6 bg-gradient-to-r from-gray-900/50 to-gray-800/50 border-gray-700/50">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <UserPlus className="h-5 w-5 text-red-400" />
            <h2 className="text-xl font-semibold text-white">Add Friends</h2>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by username..."
                value={usernameToInvite}
                onChange={(e) => setUsernameToInvite(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              onClick={invite}
              disabled={!usernameToInvite.trim() || loading}
            >
              {loading ? "Sending..." : "Invite"}
            </Button>
          </div>

          {profiles.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-400 mb-2">Available users:</p>
              <div className="flex flex-wrap gap-2">
                {profiles
                  .filter((p) => p.id !== userId)
                  .slice(0, 10)
                  .map((profile) => (
                    <span
                      key={profile.id}
                      className="text-xs bg-gray-800/50 px-2 py-1 rounded text-gray-300"
                    >
                      {profile.username}
                    </span>
                  ))}
                {profiles.length > 10 && (
                  <span className="text-xs text-gray-500">
                    +{profiles.length - 10} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6 bg-gradient-to-r from-gray-900/50 to-gray-800/50 border-gray-700/50">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-red-400" />
            <h2 className="text-xl font-semibold text-white">
              Your Connections
            </h2>
          </div>

          <div className="space-y-3">
            {friends.map((f, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg border border-gray-700/50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
                    <Users className="h-4 w-4 text-red-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">
                      {f.user_id === userId
                        ? `You → ${getUsernameById(f.friend_id)}`
                        : `${getUsernameById(f.user_id)} → You`}
                    </div>
                    <div className="text-xs text-gray-400">
                      {f.status === "pending" && "Pending invitation"}
                      {f.status === "accepted" && "Friends"}
                      {f.status === "blocked" && "Blocked"}
                    </div>
                  </div>
                </div>
                <div
                  className={`text-xs px-2 py-1 rounded ${
                    f.status === "accepted"
                      ? "bg-green-500/20 text-green-400"
                      : f.status === "pending"
                      ? "bg-yellow-500/20 text-yellow-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {f.status}
                </div>
              </div>
            ))}
            {friends.length === 0 && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">
                  No friends yet. Start by inviting someone!
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
