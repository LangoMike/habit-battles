"use client";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { PageLayout, PageHeader, Section } from "@/components/PageLayout";
import CreateHabitDialog from "./CreateHabitDialog";
import HabitList from "./HabitList";
import PerformanceTester from "@/components/PerformanceTester";
import { Target } from "lucide-react";

export default function HabitsPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const tz = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    []
  );

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) location.href = "/login";
      else {
        setUserId(data.user.id);
      }
    });
  }, []);

  if (!userId) return null;
  return (
    <PageLayout>
      <PageHeader
        title="Your Habits"
        icon={<Target className="h-8 w-8 text-primary" />}
        actions={<CreateHabitDialog userId={userId} tz={tz} />}
      />

      <Section>
        <HabitList userId={userId} />
      </Section>

      <Section>
        <div className="border-t border-border pt-8">
          <PerformanceTester />
        </div>
      </Section>
    </PageLayout>
  );
}
