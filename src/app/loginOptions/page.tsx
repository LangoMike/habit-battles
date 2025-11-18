"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { CheckCircle, Mail, Github } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";

export default function LoginOptionsPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const sendMagicLink = async () => {
    if (!email.trim()) return;
    setErr(null);
    setLoading(true);
    
    const redirectUrl = `${location.origin}/callback`;
    console.log("📧 Sending magic link:", {
      email,
      redirectUrl,
      userAgent: navigator.userAgent,
      isMobile: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    });
    
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectUrl,
        shouldCreateUser: true
      },
    });
    
    if (error) {
      console.error("❌ Magic link send failed:", error);
      setErr(error.message);
      toast.error(error.message);
    } else {
      console.log("✅ Magic link sent successfully");
      setSent(true);
      toast.success("Magic link sent! Check your email.");
    }
    setLoading(false);
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/callback`
      }
    });
    
    if (error) {
      console.error("❌ Google sign-in failed:", error);
      toast.error(error.message);
      setLoading(false);
    }
  };

  const signInWithGitHub = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${location.origin}/callback`
      }
    });
    
    if (error) {
      console.error("❌ GitHub sign-in failed:", error);
      toast.error(error.message);
      setLoading(false);
    }
  };

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
                <p className="text-red-400 text-sm">Transform your habits, compete with friends</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-white mb-4">
                  Ready to <span className="text-red-400">dominate</span> your habits?
                </h2>
                <p className="text-gray-300 text-lg">
                  Join thousands building better habits through friendly competition
                </p>
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

          {/* Right Column - Login Options */}
          <div className="space-y-6">
            <Card className="p-8 bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50">
              <div className="space-y-6">
                <div className="text-center">
                  <Image
                    src="/habit-battles-logo.svg"
                    alt="Habit Battles Logo"
                    width={64}
                    height={64}
                    className="h-16 w-16 mx-auto mb-4"
                  />
                  <h3 className="text-2xl font-bold text-white mb-2">Choose Your Sign-In Method</h3>
                  <p className="text-gray-400">Get started in seconds with your preferred option</p>
                </div>

                {/* OAuth Buttons */}
                <div className="space-y-3">
                  <Button
                    onClick={signInWithGoogle}
                    disabled={loading}
                    className="w-full bg-white hover:bg-gray-100 text-gray-900 font-medium py-3 h-auto"
                  >
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </Button>

                  <Button
                    onClick={signInWithGitHub}
                    disabled={loading}
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 h-auto border border-gray-700"
                  >
                    <Github className="w-5 h-5 mr-3" />
                    Continue with GitHub
                  </Button>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-600"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-gray-800 text-gray-400">or</span>
                  </div>
                </div>

                {/* Magic Link Section */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Email Address</label>
                    <Input
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400"
                      disabled={loading || sent}
                    />
                  </div>

                  {err && (
                    <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded p-3">
                      {err}
                    </div>
                  )}

                  {sent && (
                    <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <div>
                        <p className="text-green-400 font-medium">Check your email!</p>
                        <p className="text-green-300 text-sm">We&apos;ve sent you a magic link to sign in.</p>
                        <p className="text-green-300 text-xs mt-1">
                          📱 On mobile: Make sure to open the link in the same browser you&apos;re using now.
                        </p>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={sendMagicLink}
                    disabled={loading || !email.trim() || sent}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 h-auto"
                  >
                    <Mail className="w-5 h-5 mr-2" />
                    {loading ? "Sending..." : "Send Magic Link"}
                  </Button>
                </div>

                <div className="text-center">
                  <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">
                    ← Back to home
                  </Link>
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
            <h3 className="text-xl font-semibold text-white">About Habit Battles</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-white mb-3">What is Habit Battles?</h4>
              <p className="text-gray-300 text-sm leading-relaxed">
                Habit Battles is your personal habit tracking companion designed to help you build consistent 
                routines and compete with friends. Track your daily habits, set weekly targets, and see your 
                progress in beautiful visualizations.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-3">Key Features</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-gray-300">Set custom weekly targets for each habit</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-gray-300">Visual calendar tracking with heatmaps</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-gray-300">Track progress and celebrate wins</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-gray-300">Compete with friends in weekly battles</span>
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
              &quot;Habit Battles made building my morning routine fun. Competing with friends 
              kept me motivated!&quot;
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
              &quot;Finally, a habit tracker that doesn&apos;t feel like a chore. The 
              competitive aspect is genius!&quot;
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
