"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Mail,
  Target,
  Users,
  Calendar,
  TrendingUp,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Zap,
} from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const sendMagic = async () => {
    if (!email.trim()) return;

    setErr(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/callback` },
    });

    if (error) {
      setErr(error.message);
      toast.error(error.message);
    } else {
      setSent(true);
      toast.success("Magic link sent! Check your email.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="w-full px-4 py-8">
        <div className="w-full grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-4rem)]">
          {/* Left Side - Login Form */}
          <div className="space-y-8">
            {/* Header */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Image
                  src="/habit-battles-logo.svg"
                  alt="Habit Battles Logo"
                  width={48}
                  height={48}
                  className="h-12 w-12"
                />
                <div>
                  <h1 className="text-3xl font-bold text-white">
                    Habit Battles
                  </h1>
                  <p className="text-red-400 font-medium">
                    Transform your habits, compete with friends
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-4xl font-bold text-white leading-tight">
                  Ready to{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600">
                    dominate
                  </span>{" "}
                  your habits?
                </h2>
                <p className="text-xl text-gray-300">
                  Join thousands building better habits through friendly
                  competition
                </p>
              </div>
            </div>

            {/* Login Form */}
            <Card className="p-8 bg-gradient-to-r from-gray-900/50 to-gray-800/50 border-gray-700/50 backdrop-blur-sm">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-white">
                    Get started in seconds
                  </h3>
                  <p className="text-gray-400">
                    No passwords, no hassle. Just magic.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-12 text-lg bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400"
                      onKeyPress={(e) => e.key === "Enter" && sendMagic()}
                    />
                  </div>

                  <Button
                    onClick={sendMagic}
                    disabled={!email.trim() || loading}
                    className="w-full h-12 text-lg bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 transition-all duration-300"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Sending login link...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Zap className="h-5 w-5" />
                        Send Login Link
                        <ArrowRight className="h-5 w-5" />
                      </div>
                    )}
                  </Button>
                </div>

                {sent && (
                  <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <div>
                      <p className="text-green-400 font-medium">
                        Check your email!
                      </p>
                      <p className="text-green-300 text-sm">
                        We've sent you a magic link to sign in.
                      </p>
                    </div>
                  </div>
                )}

                {err && (
                  <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <div className="h-5 w-5 rounded-full bg-red-500 flex items-center justify-center">
                      <span className="text-white text-xs">!</span>
                    </div>
                    <p className="text-red-400">{err}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Social Proof */}
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-6 text-gray-400">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-red-400" />
                  <span className="text-sm">Trusted by 10,000+ users</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span className="text-sm">100% free forever</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Features & About */}
          <div className="space-y-8">
            {/* Hero Animation Placeholder */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-purple-500/20 rounded-2xl blur-3xl"></div>
              <div className="relative bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-gray-700/50 rounded-2xl p-8 backdrop-blur-sm">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <Target className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    Your Habit Journey Starts Here
                  </h3>
                  <p className="text-gray-300">
                    Join the battle for better habits. Track, compete, and
                    transform your life.
                  </p>
                </div>
              </div>
            </div>

            {/* About Habit Battles */}
            <Card className="p-8 bg-gradient-to-r from-gray-900/50 to-gray-800/50 border-gray-700/50 backdrop-blur-sm">
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-6">
                  <Target className="h-6 w-6 text-red-400" />
                  <h2 className="text-2xl font-bold text-white">
                    About Habit Battles
                  </h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">
                      What is Habit Battles?
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      Habit Battles is your personal habit tracking companion
                      designed to help you build consistent routines and compete
                      with friends. Track your daily habits, set weekly targets,
                      and see your progress in beautiful visualizations.
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Users className="h-4 w-4" />
                      <span>Compete with friends in weekly battles</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">
                      Key Features
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm text-gray-300">
                        <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center">
                          <Target className="h-3 w-3 text-red-400" />
                        </div>
                        <span>Set custom weekly targets for each habit</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-300">
                        <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center">
                          <Calendar className="h-3 w-3 text-red-400" />
                        </div>
                        <span>Visual calendar tracking with heatmaps</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-300">
                        <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center">
                          <TrendingUp className="h-3 w-3 text-red-400" />
                        </div>
                        <span>Track progress and celebrate wins</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Testimonials */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-6 bg-gradient-to-br from-red-900/20 to-red-800/20 border-red-500/30">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
                      <span className="text-red-400 font-semibold">S</span>
                    </div>
                    <div>
                      <p className="text-white font-medium">Sarah M.</p>
                      <p className="text-xs text-gray-400">Product Manager</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-300">
                    &quot;Habit Battles made building my morning routine fun.
                    Competing with friends kept me motivated!&quot;
                  </p>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-red-900/20 to-red-800/20 border-red-500/30">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
                      <span className="text-red-400 font-semibold">M</span>
                    </div>
                    <div>
                      <p className="text-white font-medium">Mike R.</p>
                      <p className="text-xs text-gray-400">Software Engineer</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-300">
                    &quot;Finally, a habit tracker that doesn&apos;t feel like a
                    chore. The competitive aspect is genius!&quot;
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
