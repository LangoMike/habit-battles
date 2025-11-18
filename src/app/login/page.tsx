"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ArrowRight,
  Target,
  Users,
  Calendar,
  TrendingUp,
  Sparkles,
  CheckCircle,
} from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4">
      <div className="p-8 bg-gradient-to-r from-gray-900/50 to-gray-800/50 border border-gray-700/50 rounded-xl space-y-8 min-h-[calc(100vh-4rem)]">
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Left Column - Branding */}
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <Image
                src="/habit-battles-logo.svg"
                alt="Habit Battles Logo"
                width={48}
                height={48}
                className="h-12 w-12"
              />
              <div>
                <h1 className="text-2xl font-bold text-white">Habit Battles</h1>
                <p className="text-red-400 text-sm">
                  Transform your habits, compete with friends
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-white mb-4">
                  Ready to <span className="text-red-400">dominate</span> your
                  habits?
                </h2>
                <p className="text-gray-300 text-lg">
                  Join thousands building better habits through friendly
                  competition
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-gray-800/30 rounded-lg border border-gray-700/30">
                  <Target className="h-8 w-8 text-red-400" />
                  <div>
                    <div className="font-semibold text-white text-sm">
                      Set Goals
                    </div>
                    <div className="text-gray-400 text-xs">Weekly targets</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-800/30 rounded-lg border border-gray-700/30">
                  <Calendar className="h-8 w-8 text-blue-400" />
                  <div>
                    <div className="font-semibold text-white text-sm">
                      Track Daily
                    </div>
                    <div className="text-gray-400 text-xs">Visual progress</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-800/30 rounded-lg border border-gray-700/30">
                  <Users className="h-8 w-8 text-green-400" />
                  <div>
                    <div className="font-semibold text-white text-sm">
                      Compete
                    </div>
                    <div className="text-gray-400 text-xs">With friends</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-800/30 rounded-lg border border-gray-700/30">
                  <TrendingUp className="h-8 w-8 text-purple-400" />
                  <div>
                    <div className="font-semibold text-white text-sm">
                      Improve
                    </div>
                    <div className="text-gray-400 text-xs">Build streaks</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-green-400">
                  <CheckCircle className="h-5 w-5" />
                  <span>Trusted by 10,000+ users</span>
                </div>
                <div className="flex items-center gap-3 text-green-400">
                  <CheckCircle className="h-5 w-5" />
                  <span>100% free forever</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Sign Up/Login */}
          <div className="space-y-6">
            <Card className="p-8 bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50">
              <div className="space-y-6 text-center">
                <div>
                  <Image
                    src="/habit-battles-logo.svg"
                    alt="Habit Battles Logo"
                    width={64}
                    height={64}
                    className="h-16 w-16 mx-auto mb-4"
                  />
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Your Habit Journey Starts Here
                  </h3>
                  <p className="text-gray-400">
                    Join the battle for better habits. Track, compete, and
                    transform your life.
                  </p>
                </div>

                <div className="space-y-4">
                  <Button
                    asChild
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 h-auto"
                  >
                    <Link
                      href="/loginOptions"
                      className="flex items-center justify-center gap-2"
                    >
                      <span>Get Started - Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>

                  <p className="text-gray-500 text-sm">
                    Choose from multiple sign-in options including Google,
                    GitHub, or magic link
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* About Section */}
        <Card className="p-8 bg-gradient-to-br from-gray-800/30 to-gray-900/30 border-gray-700/30">
          <div className="flex items-center gap-3 mb-6">
            <Image
              src="/habit-battles-logo.svg"
              alt="Habit Battles Logo"
              width={32}
              height={32}
              className="h-8 w-8"
            />
            <h3 className="text-xl font-semibold text-white">
              About Habit Battles
            </h3>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-white mb-3">
                What is Habit Battles?
              </h4>
              <p className="text-gray-300 text-sm leading-relaxed">
                Habit Battles is your personal habit tracking companion designed
                to help you build consistent routines and compete with friends.
                Track your daily habits, set weekly targets, and see your
                progress in beautiful visualizations.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-3">Key Features</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-gray-300">
                    Set custom weekly targets for each habit
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-gray-300">
                    Visual calendar tracking with heatmaps
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-gray-300">
                    Track progress and celebrate wins
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-gray-300">
                    Compete with friends in weekly battles
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Testimonials */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 bg-gradient-to-br from-red-900/20 to-gray-900/50 border-red-500/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold">
                S
              </div>
              <div>
                <div className="font-semibold text-white">Sarah M.</div>
                <div className="text-red-400 text-sm">Product Manager</div>
              </div>
            </div>
            <p className="text-gray-300 text-sm">
              &quot;Habit Battles made building my morning routine fun.
              Competing with friends kept me motivated!&quot;
            </p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-red-900/20 to-gray-900/50 border-red-500/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold">
                M
              </div>
              <div>
                <div className="font-semibold text-white">Mike R.</div>
                <div className="text-red-400 text-sm">Software Engineer</div>
              </div>
            </div>
            <p className="text-gray-300 text-sm">
              &quot;Finally, a habit tracker that doesn&apos;t feel like a
              chore. The competitive aspect is genius!&quot;
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
