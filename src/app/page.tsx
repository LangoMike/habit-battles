"use client";
import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Home() {
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) location.href = "/dashboard";
      else location.href = "/login";
    });
  }, []);
  return null;
}
