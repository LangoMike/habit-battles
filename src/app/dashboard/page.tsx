"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { PageLayout, PageHeader, Section } from "@/components/PageLayout";
import MotivationalQuote from "@/components/MotivationalQuote";
import StatsCards from "@/components/StatsCards";
import { getQuotaStats, QuotaStats } from "@/lib/quotaTracker";
import { getStreakData, StreakData } from "@/lib/streak";
import { Target, Users, Calendar, TrendingUp } from "lucide-react";
import StreakDisplay from "@/components/StreakDisplay";
import { APP_SLOGAN } from "@/lib/constants";
import Image from "next/image";

export default function Dashboard() {
  const [username, setUsername] = useState<string | null>(null);
  const [stats, setStats] = useState<QuotaStats | null>(null);
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        location.href = "/login";
        return;
      }

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

  return (
    <PageLayout>
      {/* Welcome Header */}
      <PageHeader
        title={username ? `Welcome, ${username}!` : "Welcome!"}
        subtitle={APP_SLOGAN}
        icon={
          <Image
            src="/habit-battles-logo.svg"
            alt="Habit Battles Logo"
            width={48}
            height={48}
            className="h-12 w-12"
          />
        }
      />

      {/* Loading State */}
      {loading ? (
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </div>
      ) : (
        <>
          {/* Motivational Quote */}
          <MotivationalQuote />

          {/* Stats Cards */}
          {stats ? (
            <StatsCards stats={stats} />
          ) : (
            <EmptyState
              icon={Target}
              title="No stats yet"
              description="Start tracking habits to see your progress here"
            />
          )}

          {/* Streak Display */}
          {streakData && (
            <Section
              title="Your Streaks"
              icon={<TrendingUp className="h-5 w-5" />}
            >
              <Card>
                <CardContent>
                  <StreakDisplay streakData={streakData} variant="dashboard" />
                </CardContent>
              </Card>
            </Section>
          )}

          {/* App Description */}
          <Section
            title="About Habit Battles"
            description="Your personal habit tracking companion"
            icon={<Target className="h-5 w-5" />}
          >
            <Card>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h3 className="font-display text-lg font-semibold text-foreground">
                      What is Habit Battles?
                    </h3>
                    <p className="font-ui text-sm text-muted-foreground leading-relaxed">
                      Habit Battles is your personal habit tracking companion
                      designed to help you build consistent routines and compete
                      with friends. Track your daily habits, set weekly targets,
                      and see your progress in beautiful visualizations.
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>Compete with friends in weekly battles</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-display text-lg font-semibold text-foreground">
                      Key Features
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Target className="h-4 w-4 text-primary" />
                        <span>Set custom weekly targets for each habit</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span>Visual calendar tracking with heatmaps</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        <span>Track progress and celebrate wins</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Section>

          {/* Quick Actions */}
          <Section title="Quick Actions">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/habits">
                <Card className="p-4 hover:shadow-md transition-all duration-200 cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                      <Target className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-display font-semibold text-foreground">
                        Manage Habits
                      </div>
                      <div className="font-ui text-xs text-muted-foreground">
                        Create & track habits
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>

              <Link href="/calendar">
                <Card className="p-4 hover:shadow-md transition-all duration-200 cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-display font-semibold text-foreground">
                        View Calendar
                      </div>
                      <div className="font-ui text-xs text-muted-foreground">
                        See your progress
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>

              <Link href="/friends">
                <Card className="p-4 hover:shadow-md transition-all duration-200 cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-display font-semibold text-foreground">
                        Friends
                      </div>
                      <div className="font-ui text-xs text-muted-foreground">
                        Connect & compete
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>

              <Link href="/battles">
                <Card className="p-4 hover:shadow-md transition-all duration-200 cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-display font-semibold text-foreground">
                        Battles
                      </div>
                      <div className="font-ui text-xs text-muted-foreground">
                        Join competitions
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            </div>
          </Section>
        </>
      )}
    </PageLayout>
  );
}
