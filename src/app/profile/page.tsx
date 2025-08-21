"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { User, Mail, Image, Info, ExternalLink } from "lucide-react";

type Profile = { username: string | null; avatar_url: string | null };

export default function ProfilePage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile>({
    username: "",
    avatar_url: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return (location.href = "/login");
      setUserId(data.user.id);
      setEmail(data.user.email ?? null);

      const { data: row } = await supabase
        .from("profiles")
        .select("username, avatar_url")
        .eq("id", data.user.id)
        .single();
      if (row)
        setProfile({ username: row.username, avatar_url: row.avatar_url });
    });
  }, []);

  const save = async () => {
    if (!userId) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").upsert({
      id: userId,
      username: profile.username,
      avatar_url: profile.avatar_url,
    });
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Profile saved");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-white">Your Profile</h1>
        <p className="text-gray-400">Customize your Habit Battles experience</p>
      </div>

      <Card className="p-6 bg-gradient-to-r from-gray-900/50 to-gray-800/50 border-gray-700/50">
        <div className="space-y-6">
          {/* Email Display */}
          <div className="flex items-center gap-3 p-4 bg-gray-800/30 rounded-lg">
            <Mail className="h-5 w-5 text-red-400" />
            <div>
              <div className="text-sm text-gray-400">Email Address</div>
              <div className="font-medium text-white">{email}</div>
            </div>
            <Badge
              variant="outline"
              className="ml-auto border-gray-600 text-gray-300"
            >
              Read Only
            </Badge>
          </div>

          {/* Username */}
          <div className="space-y-3">
            <label className="grid gap-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-red-400" />
                <span className="font-medium text-white">Username</span>
              </div>
              <Input
                value={profile.username ?? ""}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, username: e.target.value }))
                }
                placeholder="Enter your username"
                className="bg-gray-800/50 border-gray-600 text-white"
              />
            </label>
          </div>

          {/* Avatar Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Image className="h-4 w-4 text-red-400" />
              <span className="font-medium text-white">Profile Avatar</span>
            </div>

            {/* Avatar Preview */}
            <div className="flex items-center gap-4 p-4 bg-gray-800/30 rounded-lg">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="bg-red-500/20 text-red-400 text-lg">
                  {profile.username?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="text-sm text-gray-400 mb-1">Preview</div>
                <div className="text-xs text-gray-500">
                  {profile.avatar_url
                    ? "Custom avatar loaded"
                    : "Using default avatar"}
                </div>
              </div>
            </div>

            {/* Avatar URL Input */}
            <label className="grid gap-2">
              <span className="text-sm text-gray-300">Avatar URL</span>
              <Input
                value={profile.avatar_url ?? ""}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, avatar_url: e.target.value }))
                }
                placeholder="https://example.com/avatar.jpg"
                className="bg-gray-800/50 border-gray-600 text-white"
              />
            </label>

            {/* Avatar Guide */}
            <Card className="p-4 bg-blue-900/20 border-blue-500/30">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-blue-300 mb-2">
                      How to Add Your Avatar
                    </h4>
                    <p className="text-sm text-gray-300 mb-3">
                      An avatar URL is a direct link to an image that will be
                      displayed as your profile picture.
                    </p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="text-blue-400 font-medium">1.</span>
                      <span className="text-gray-300">
                        Upload an image to an image hosting service like:
                      </span>
                    </div>
                    <div className="ml-6 space-y-1">
                      <a
                        href="https://imgur.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Imgur
                      </a>
                      <a
                        href="https://postimages.org"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Postimages
                      </a>
                      <a
                        href="https://imgbb.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <ExternalLink className="h-3 w-3" />
                        ImgBB
                      </a>
                    </div>

                    <div className="flex items-start gap-2">
                      <span className="text-blue-400 font-medium">2.</span>
                      <span className="text-gray-300">
                        Copy the direct image URL (ends with .jpg, .png, .gif,
                        etc.)
                      </span>
                    </div>

                    <div className="flex items-start gap-2">
                      <span className="text-blue-400 font-medium">3.</span>
                      <span className="text-gray-300">
                        Paste the URL in the field above
                      </span>
                    </div>

                    <div className="flex items-start gap-2">
                      <span className="text-blue-400 font-medium">4.</span>
                      <span className="text-gray-300">
                        Click &quot;Save Profile&quot; to update your avatar
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-gray-400 mt-3 p-2 bg-gray-800/50 rounded">
                    <strong>Tip:</strong> For best results, use square images
                    (1:1 ratio) that are at least 200x200 pixels.
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Save Button */}
          <Button
            onClick={save}
            disabled={saving}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
          >
            {saving ? "Saving…" : "Save Profile"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
