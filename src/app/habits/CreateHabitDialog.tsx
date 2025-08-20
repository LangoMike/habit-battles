"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function CreateHabitDialog({
  userId,
  tz,
}: {
  userId: string;
  tz: string;
}) {
  const [name, setName] = useState("");
  const [targetPerWeek, setTargetPerWeek] = useState<number>(3);
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false);

  const createHabit = async () => {
    if (!name.trim()) return;
    if (targetPerWeek < 1 || targetPerWeek > 7) {
      toast.error("Target per week must be between 1 and 7");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase
      .from("habits")
      .insert({
        user_id: userId,
        name: name.trim(),
        target_per_week: targetPerWeek,
        schedule: "daily",
        timezone: tz,
      });
    setSubmitting(false);
    if (!error) {
      toast.success("Habit created");
      setOpen(false);
      setName("");
      setTargetPerWeek(3);
      window.location.reload();
    } else {
      toast.error(error.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>New Habit</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Habit</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <label className="grid gap-1 text-sm">
            <span className="font-medium">Name</span>
            <Input
              placeholder="e.g., Code 30 minutes"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-medium">Target per week (1–7)</span>
            <Input
              type="number"
              min={1}
              max={7}
              inputMode="numeric"
              value={targetPerWeek}
              onChange={(e) => setTargetPerWeek(Number(e.target.value))}
            />
          </label>
          <Button onClick={createHabit} disabled={!name.trim() || submitting}>
            {submitting ? "Creating…" : "Create"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
