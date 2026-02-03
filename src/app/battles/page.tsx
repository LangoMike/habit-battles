"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Search, UserPlus, Users, Check, X, Sword } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";

type Battle = {
  id: string;
  user_id: string;
  friend_id: string;
  status: "pending" | "accepted" | "completed" | "cancelled";
  created_at: string;
  updated_at: string;
};

type Profile = {
  id: string;
  username: string;
  avatar_url?: string | null;
};

export default function BattlesPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [usernameToInvite, setUsernameToInvite] = useState("");
  const [battles, setBattles] = useState<Battle[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [friendUsernames, setFriendUsernames] = useState<Record<string, string>>({});
  const [friendAvatars, setFriendAvatars] = useState<Record<string, string | null>>({});
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-8 bg-gradient-to-r from-gray-900/50 to-gray-800/50 border border-gray-700/50 rounded-xl space-y-8 min-h-[calc(100vh-4rem)]">
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
              Welcome{username ? `, ${username}` : ""}, Ready to battle?!
            </h1>
          </div>
        </div>
        <p className="text-gray-400">Create battles and fight to the top of the leaderboards.</p>
      </div>
    </div>
  );

}

