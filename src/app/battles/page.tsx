"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getQuotaStats, QuotaStats } from "@/lib/quotaTracker";
import { getStreakData, StreakData } from "@/lib/streak";
import StreakDisplay from "@/components/StreakDisplay";

type viewMode = "week" | "month" | "year";

export default function BattlesPage() {
  return (
    <div className="space-y-2">
      <h1 className="text-xl font-semibold">Battles</h1>
      <p>
        Coming soon: create battles and fight to the top of the leaderboards.
      </p>
    </div>
  );
}
