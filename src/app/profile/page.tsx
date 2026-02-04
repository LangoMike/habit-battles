"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { PageLayout, PageHeader, Section } from "@/components/PageLayout";
import { toast } from "sonner";
import {
  User,
  Mail,
  Image as ImageIcon,
  Info,
  ExternalLink,
  Palette,
} from "lucide-react";

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
    <PageLayout>
      <PageHeader
        title="Your Profile"
        subtitle="Customize your Habit Battles experience"
        icon={<User className="h-8 w-8 text-primary" />}
      />

      {/* Theme Settings */}
      <Section
        title="Appearance"
        description="Choose your preferred theme"
        icon={<Palette className="h-5 w-5" />}
      >
        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-ui font-medium text-foreground mb-1">
                  Theme
                </div>
                <div className="font-ui text-sm text-muted-foreground">
                  Switch between light and dark mode
                </div>
              </div>
              <ThemeToggle />
            </div>
          </CardContent>
        </Card>
      </Section>

      {/* Profile Settings */}
      <Section
        title="Profile Information"
        icon={<User className="h-5 w-5" />}
      >
        <Card>
          <CardContent>
            <div className="space-y-6">
              {/* Email Display */}
              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                <Mail className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <div className="font-ui text-sm text-muted-foreground">
                    Email Address
                  </div>
                  <div className="font-ui font-medium text-foreground">
                    {email}
                  </div>
                </div>
                <Badge variant="outline" className="ml-auto">
                  Read Only
                </Badge>
              </div>

              {/* Username */}
              <div className="space-y-3">
                <label className="grid gap-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    <span className="font-ui font-medium text-foreground">
                      Username
                    </span>
                  </div>
                  <Input
                    value={profile.username ?? ""}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, username: e.target.value }))
                    }
                    placeholder="Enter your username"
                  />
                </label>
              </div>

              {/* Avatar Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-primary" />
                  <span className="font-ui font-medium text-foreground">
                    Profile Avatar
                  </span>
                </div>

                {/* Avatar Preview */}
                <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={profile.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-lg font-display">
                      {profile.username?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-ui text-sm text-muted-foreground mb-1">
                      Preview
                    </div>
                    <div className="font-ui text-xs text-muted-foreground">
                      {profile.avatar_url
                        ? "Custom avatar loaded"
                        : "Using default avatar"}
                    </div>
                  </div>
                </div>

                {/* Avatar URL Input */}
                <label className="grid gap-2">
                  <span className="font-ui text-sm text-foreground">
                    Avatar URL
                  </span>
                  <Input
                    value={profile.avatar_url ?? ""}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, avatar_url: e.target.value }))
                    }
                    placeholder="https://example.com/avatar.jpg"
                  />
                </label>

                {/* Avatar Guide */}
                <Card className="p-4 bg-accent/50 border-border">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-ui font-medium text-foreground mb-2">
                          How to Add Your Avatar
                        </h4>
                        <p className="font-ui text-sm text-muted-foreground mb-3">
                          An avatar URL is a direct link to an image that will
                          be displayed as your profile picture.
                        </p>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                          <span className="font-ui text-primary font-medium">
                            1.
                          </span>
                          <span className="font-ui text-muted-foreground">
                            Upload an image to an image hosting service like:
                          </span>
                        </div>
                        <div className="ml-6 space-y-1">
                          <a
                            href="https://imgur.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Imgur
                          </a>
                          <a
                            href="https://postimages.org"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Postimages
                          </a>
                          <a
                            href="https://imgbb.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
                          >
                            <ExternalLink className="h-3 w-3" />
                            ImgBB
                          </a>
                        </div>

                        <div className="flex items-start gap-2">
                          <span className="font-ui text-primary font-medium">
                            2.
                          </span>
                          <span className="font-ui text-muted-foreground">
                            Copy the direct image URL (ends with .jpg, .png,
                            .gif, etc.)
                          </span>
                        </div>

                        <div className="flex items-start gap-2">
                          <span className="font-ui text-primary font-medium">
                            3.
                          </span>
                          <span className="font-ui text-muted-foreground">
                            Paste the URL in the field above
                          </span>
                        </div>

                        <div className="flex items-start gap-2">
                          <span className="font-ui text-primary font-medium">
                            4.
                          </span>
                          <span className="font-ui text-muted-foreground">
                            Click &quot;Save Profile&quot; to update your
                            avatar
                          </span>
                        </div>
                      </div>

                      <div className="font-ui text-xs text-muted-foreground mt-3 p-2 bg-muted rounded">
                        <strong>Tip:</strong> For best results, use square
                        images (1:1 ratio) that are at least 200x200 pixels.
                      </div>
                </div>
              </div>
            </Card>
          </div>

              {/* Save Button */}
              <Button
                onClick={save}
                disabled={saving}
                loading={saving}
                className="w-full"
              >
                Save Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      </Section>
    </PageLayout>
  );
}
