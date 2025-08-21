"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type FriendRow = {
  user_id: string;
  friend_id: string;
  status: "pending" | "accepted" | "blocked";
};

export default function FriendsPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [usernameToInvite, setUsernameToInvite] = useState("");
  const [friends, setFriends] = useState<FriendRow[]>([]);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return (location.href = "/login");
      setUserId(data.user.id);
      await refresh();
    });
  }, []);

  const refresh = async () => {
    const { data } = await supabase
      .from("friendships")
      .select("*")
      .order("created_at", { ascending: false });
    setFriends(data ?? []);
  };

  const invite = async () => {
    if (!usernameToInvite.trim() || !userId) return;
    const { data: target, error } = await supabase
      .from("profiles")
      .select("id, username")
      .ilike("username", usernameToInvite.trim())
      .maybeSingle();
    if (error || !target) {
      toast.error("User not found");
      return;
    }
    const friendId = target.id as string;
    if (friendId === userId) {
      toast.error("You cannot invite yourself");
      return;
    }
    const { error: insErr } = await supabase
      .from("friendships")
      .upsert({ user_id: userId, friend_id: friendId, status: "pending" });
    if (insErr) toast.error(insErr.message);
    else {
      toast.success("Invitation sent");
      setUsernameToInvite("");
      refresh();
    }
  };

  return (
    <div className="grid gap-6">
      <Card className="p-4 space-y-3">
        <h1 className="text-xl font-semibold">Friends</h1>
        <div className="flex gap-2">
          <Input
            placeholder="Friend username"
            value={usernameToInvite}
            onChange={(e) => setUsernameToInvite(e.target.value)}
          />
          <Button onClick={invite}>Invite</Button>
        </div>
      </Card>
      <Card className="p-4 space-y-3">
        <h2 className="font-medium">Your connections</h2>
        <div className="grid gap-2">
          {friends.map((f, i) => (
            <div
              key={i}
              className="flex items-center justify-between border rounded-md p-2"
            >
              <div className="text-sm opacity-80">
                {f.user_id === userId ? "You ➜" : ""} {f.user_id} →{" "}
                {f.friend_id}
              </div>
              <div className="text-xs">{f.status}</div>
            </div>
          ))}
          {friends.length === 0 && (
            <p className="text-sm opacity-70">No friends yet.</p>
          )}
        </div>
      </Card>
    </div>
  );
}
