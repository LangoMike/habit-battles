"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { APP_SLOGAN } from "@/lib/constants";
import Image from "next/image";

export default function NavBar() {
  const [username, setUsername] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        setEmail(data.user.email ?? null);
        // Fetch username from profiles table
        const { data: profile } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", data.user.id)
          .single();

        if (profile?.username) {
          setUsername(profile.username);
        } else {
          // Generate default username if none exists
          const defaultUsername = `User${
            Math.floor(Math.random() * 90000) + 10000
          }`;
          setUsername(defaultUsername);

          // Create profile with default username
          await supabase.from("profiles").upsert({
            id: data.user.id,
            username: defaultUsername,
            avatar_url: null,
          });
        }
      }
    });
  }, []);

  return (
    <nav className="w-full border-b border-white/10 bg-black/30 backdrop-blur sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex gap-4 items-center">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image
              src="/habit-battles-logo.svg"
              alt="Habit Battles Logo"
              width={32}
              height={32}
              className="h-8 w-8"
            />
            <span className="font-semibold text-white">Habit Battles</span>
          </Link>
          <Link href="/habits" className="text-sm opacity-80 hover:opacity-100">
            Habits
          </Link>
          <Link
            href="/calendar"
            className="text-sm opacity-80 hover:opacity-100"
          >
            Calendar
          </Link>
          <Link
            href="/battles"
            className="text-sm opacity-80 hover:opacity-100"
          >
            Battles
          </Link>
          <Link
            href="/friends"
            className="text-sm opacity-80 hover:opacity-100"
          >
            Friends
          </Link>
          <Link
            href="/profile"
            className="text-sm opacity-80 hover:opacity-100"
          >
            Profile
          </Link>
        </div>
        <div className="flex items-center gap-3">
          {username ? (
            <>
              <span className="text-sm hidden sm:block text-white/80">
                {username}
              </span>
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-red-500/20 text-red-400">
                  {username[0]?.toUpperCase() ?? "U"}
                </AvatarFallback>
              </Avatar>
              <Button
                size="sm"
                variant="secondary"
                onClick={() =>
                  supabase.auth.signOut().then(() => (location.href = "/"))
                }
              >
                Sign out
              </Button>
            </>
          ) : (
            <Button size="sm" asChild>
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
