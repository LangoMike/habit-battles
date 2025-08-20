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

type HabitLite = { id: string; name: string; target_per_week: number };

export default function EditHabitDialog({
  habit,
  userId,
}: {
  habit: HabitLite;
  userId: string;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(habit.name ?? "");
  const [targetPerWeek, setTargetPerWeek] = useState<string>(
    String(habit.target_per_week ?? 3)
  );
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!name.trim()) return;
    const target = parseInt(targetPerWeek, 10);
    if (Number.isNaN(target)) {
      toast.error("Enter a number between 1 and 7");
      return;
    }
    if (target < 1 || target > 7) {
      toast.error("Target per week must be between 1 and 7");
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("habits")
      .update({ name: name.trim(), target_per_week: target })
      .eq("id", habit.id)
      .eq("user_id", userId);
    setSaving(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Habit updated");
      setOpen(false);
      // For MVP, refresh the list by reloading.
      window.location.reload();
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v) {
          setName(habit.name ?? "");
          setTargetPerWeek(String(habit.target_per_week ?? 3));
        }
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Habit</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <label className="grid gap-1 text-sm">
            <span className="font-medium">Name</span>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-medium">Target per week (1–7)</span>
            <Input
              type="number"
              min={1}
              max={7}
              inputMode="numeric"
              value={targetPerWeek}
              onChange={(e) => setTargetPerWeek(e.target.value)}
            />
          </label>
          <div className="flex gap-2">
            <Button onClick={save} disabled={!name.trim() || saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
