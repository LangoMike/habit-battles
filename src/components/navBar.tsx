"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import Image from "next/image";

export default function NavBar() {
  const [username, setUsername] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        setIsAuthenticated(true);
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
      } else {
        setIsAuthenticated(false);
        setUsername(null);
      }
    });
  }, []);

  return (
    <nav className="w-full border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Image
            src="/habit-battles-logo.svg"
            alt="Habit Battles Logo"
            width={32}
            height={32}
            className="h-8 w-8"
          />
          <span className="font-display font-semibold text-foreground hidden sm:block">
            Habit Battles
          </span>
        </Link>

        {/* Mobile Center Title */}
        <div className="md:hidden">
          <h1 className="font-display font-semibold text-foreground text-lg">Habit Battles</h1>
        </div>

        {/* Desktop Navigation - Hide on login pages when not authenticated */}
        {isAuthenticated && !pathname?.includes('/login') && (
          <div className="hidden md:flex items-center gap-1">
          <Link
            href="/habits"
            className={`font-ui text-sm font-medium px-3 py-2 rounded-md transition-colors ${
              pathname === "/habits"
                ? "text-foreground bg-accent"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
            }`}
          >
            Habits
          </Link>
          <Link
            href="/calendar"
            className={`font-ui text-sm font-medium px-3 py-2 rounded-md transition-colors ${
              pathname === "/calendar"
                ? "text-foreground bg-accent"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
            }`}
          >
            Calendar
          </Link>
          <Link
            href="/battles"
            className={`font-ui text-sm font-medium px-3 py-2 rounded-md transition-colors ${
              pathname === "/battles"
                ? "text-foreground bg-accent"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
            }`}
          >
            Battles
          </Link>
          <Link
            href="/leaderboard"
            className={`font-ui text-sm font-medium px-3 py-2 rounded-md transition-colors ${
              pathname === "/leaderboard"
                ? "text-foreground bg-accent"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
            }`}
          >
            Leaderboard
          </Link>
          <Link
            href="/friends"
            className={`font-ui text-sm font-medium px-3 py-2 rounded-md transition-colors ${
              pathname === "/friends"
                ? "text-foreground bg-accent"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
            }`}
          >
            Friends
          </Link>
          <Link
            href="/profile"
            className={`font-ui text-sm font-medium px-3 py-2 rounded-md transition-colors ${
              pathname === "/profile"
                ? "text-foreground bg-accent"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
            }`}
          >
            Profile
          </Link>
          </div>
        )}

        {/* Right Side - User Info & Mobile Menu */}
        <div className="flex items-center gap-3">
          {/* Mobile Menu - Hide on login pages when not authenticated */}
          {isAuthenticated && !pathname?.includes('/login') && (
            <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="bg-background border-border"
              >
                <SheetHeader>
                  <SheetTitle>Navigation</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-2">
                  <Link
                    href="/habits"
                    className={`font-ui py-2 px-4 rounded-md transition-colors ${
                      pathname === "/habits"
                        ? "text-foreground bg-accent"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    }`}
                  >
                    Habits
                  </Link>
                  <Link
                    href="/calendar"
                    className={`font-ui py-2 px-4 rounded-md transition-colors ${
                      pathname === "/calendar"
                        ? "text-foreground bg-accent"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    }`}
                  >
                    Calendar
                  </Link>
                  <Link
                    href="/battles"
                    className={`font-ui py-2 px-4 rounded-md transition-colors ${
                      pathname === "/battles"
                        ? "text-foreground bg-accent"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    }`}
                  >
                    Battles
                  </Link>
                  <Link
                    href="/leaderboard"
                    className={`font-ui py-2 px-4 rounded-md transition-colors ${
                      pathname === "/leaderboard"
                        ? "text-foreground bg-accent"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    }`}
                  >
                    Leaderboard
                  </Link>
                  <Link
                    href="/friends"
                    className={`font-ui py-2 px-4 rounded-md transition-colors ${
                      pathname === "/friends"
                        ? "text-foreground bg-accent"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    }`}
                  >
                    Friends
                  </Link>
                  <Link
                    href="/profile"
                    className={`font-ui py-2 px-4 rounded-md transition-colors ${
                      pathname === "/profile"
                        ? "text-foreground bg-accent"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    }`}
                  >
                    Profile
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
            </div>
          )}

          {/* User Info */}
          {username ? (
            <>
              <span className="font-ui text-sm hidden lg:block text-muted-foreground">
                {username}
              </span>
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary font-display">
                  {username[0]?.toUpperCase() ?? "U"}
                </AvatarFallback>
              </Avatar>
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  supabase.auth.signOut().then(() => (location.href = "/"))
                }
                className="hidden sm:block"
              >
                Sign out
              </Button>
            </>
          ) : (
            <Button size="sm" asChild>
              <Link href="/loginOptions">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
