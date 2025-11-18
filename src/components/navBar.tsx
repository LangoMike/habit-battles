"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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
    <nav className="w-full border-b border-white/10 bg-gradient-to-r from-gray-900/90 via-red-900/20 to-gray-900/90 backdrop-blur sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image
            src="/habit-battles-logo.svg"
            alt="Habit Battles Logo"
            width={32}
            height={32}
            className="h-8 w-8"
          />
          <span className="font-semibold text-white hidden sm:block">
            Habit Battles
          </span>
        </Link>

        {/* Mobile Center Title */}
        <div className="md:hidden">
          <h1 className="font-semibold text-white text-lg">Habit Battles</h1>
        </div>

        {/* Desktop Navigation - Hide on login pages when not authenticated */}
        {isAuthenticated && !pathname?.includes('/login') && (
          <div className="hidden md:flex items-center">
          <Link
            href="/habits"
            className="text-base font-medium text-white opacity-80 hover:opacity-100 transition-opacity px-3 py-2 rounded hover:bg-white/5"
          >
            Habits
          </Link>
          <div className="text-gray-500 mx-1">|</div>
          <Link
            href="/calendar"
            className="text-base font-medium text-white opacity-80 hover:opacity-100 transition-opacity px-3 py-2 rounded hover:bg-white/5"
          >
            Calendar
          </Link>
          <div className="text-gray-500 mx-1">|</div>
          <Link
            href="/battles"
            className="text-base font-medium text-white opacity-80 hover:opacity-100 transition-opacity px-3 py-2 rounded hover:bg-white/5"
          >
            Battles
          </Link>
          <div className="text-gray-500 mx-1">|</div>
          <Link
            href="/friends"
            className="text-base font-medium text-white opacity-80 hover:opacity-100 transition-opacity px-3 py-2 rounded hover:bg-white/5"
          >
            Friends
          </Link>
          <div className="text-gray-500 mx-1">|</div>
          <Link
            href="/profile"
            className="text-base font-medium text-white opacity-80 hover:opacity-100 transition-opacity px-3 py-2 rounded hover:bg-white/5"
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
                  <Menu className="h-5 w-5 text-white" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="bg-gray-900 border-gray-700"
              >
                <div className="flex flex-col gap-4 mt-8">
                  <Link
                    href="/habits"
                    className="text-white py-2 px-4 rounded hover:bg-gray-800 transition-colors"
                  >
                    Habits
                  </Link>
                  <Link
                    href="/calendar"
                    className="text-white py-2 px-4 rounded hover:bg-gray-800 transition-colors"
                  >
                    Calendar
                  </Link>
                  <Link
                    href="/battles"
                    className="text-white py-2 px-4 rounded hover:bg-gray-800 transition-colors"
                  >
                    Battles
                  </Link>
                  <Link
                    href="/friends"
                    className="text-white py-2 px-4 rounded hover:bg-gray-800 transition-colors"
                  >
                    Friends
                  </Link>
                  <Link
                    href="/profile"
                    className="text-white py-2 px-4 rounded hover:bg-gray-800 transition-colors"
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
              <span className="text-sm hidden lg:block text-white/80">
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
