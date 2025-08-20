"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import MotivationalQuote from "@/components/MotivationalQuote";
import StatsCards from "@/components/StatsCards";
import { getQuotaStats, QuotaStats } from "@/lib/quotaTracker";
import { getStreakData, StreakData } from "@/lib/streak";
import { Target, Users, Calendar, TrendingUp } from "lucide-react";
import StreakDisplay from "@/components/StreakDisplay";
import { APP_SLOGAN } from "@/lib/constants";
import Image from "next/image";

export default function Dashboard() {
  const [email, setEmail] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [stats, setStats] = useState<QuotaStats | null>(null);
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        location.href = "/login";
        return;
      }
      setEmail(data.user.email ?? null);
      setUserId(data.user.id);

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

      // Fetch stats and streak data
      const [quotaStats, streakStats] = await Promise.all([
        getQuotaStats(data.user.id),
        getStreakData(data.user.id),
      ]);
      setStats(quotaStats);
      setStreakData(streakStats);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
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
              Welcome{username ? `, ${username}` : ""}!
            </h1>
            <p className="text-red-400 font-medium">{APP_SLOGAN}</p>
          </div>
        </div>
        <p className="text-gray-400">Ready to dominate your habits today?</p>
      </div>

      {/* Motivational Quote */}
      <MotivationalQuote />

      {/* Stats Cards */}
      {stats && <StatsCards stats={stats} />}

      {/* Streak Display */}
      {streakData && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Your Streaks</h2>
          <StreakDisplay streakData={streakData} variant="dashboard" />
        </div>
      )}

      {/* App Description */}
      <Card className="p-6 bg-gradient-to-r from-gray-900/50 to-gray-800/50 border-gray-700/50">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-red-400" />
            <h2 className="text-xl font-semibold text-white">
              About Habit Battles
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-white">
                What is Habit Battles?
              </h3>
              <p className="text-gray-300 leading-relaxed">
                Habit Battles is your personal habit tracking companion designed
                to help you build consistent routines and compete with friends.
                Track your daily habits, set weekly targets, and see your
                progress in beautiful visualizations.
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Users className="h-4 w-4" />
                <span>Compete with friends in weekly battles</span>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-white">Key Features</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Target className="h-4 w-4 text-red-400" />
                  <span>Set custom weekly targets for each habit</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Calendar className="h-4 w-4 text-red-400" />
                  <span>Visual calendar tracking with heatmaps</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <TrendingUp className="h-4 w-4 text-red-400" />
                  <span>Track progress and celebrate wins</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/habits">
            <Card className="p-4 bg-gradient-to-br from-red-900/20 to-red-800/20 border-red-500/30 hover:from-red-900/30 hover:to-red-800/30 transition-all duration-300 cursor-pointer">
              <div className="flex items-center gap-3">
                <Target className="h-6 w-6 text-red-400" />
                <div>
                  <div className="font-medium text-white">Manage Habits</div>
                  <div className="text-xs text-gray-400">
                    Create & track habits
                  </div>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/calendar">
            <Card className="p-4 bg-gradient-to-br from-red-900/20 to-red-800/20 border-red-500/30 hover:from-red-900/30 hover:to-red-800/30 transition-all duration-300 cursor-pointer">
              <div className="flex items-center gap-3">
                <Calendar className="h-6 w-6 text-red-400" />
                <div>
                  <div className="font-medium text-white">View Calendar</div>
                  <div className="text-xs text-gray-400">See your progress</div>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/friends">
            <Card className="p-4 bg-gradient-to-br from-red-900/20 to-red-800/20 border-red-500/30 hover:from-red-900/30 hover:to-red-800/30 transition-all duration-300 cursor-pointer">
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-red-400" />
                <div>
                  <div className="font-medium text-white">Friends</div>
                  <div className="text-xs text-gray-400">Connect & compete</div>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/battles">
            <Card className="p-4 bg-gradient-to-br from-red-900/20 to-red-800/20 border-red-500/30 hover:from-red-900/30 hover:to-red-800/30 transition-all duration-300 cursor-pointer">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-6 w-6 text-red-400" />
                <div>
                  <div className="font-medium text-white">Battles</div>
                  <div className="text-xs text-gray-400">Join competitions</div>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
