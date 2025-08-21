"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

function CallbackContent() {
  const params = useSearchParams();

  useEffect(() => {
    const code = params.get("code");

    // Newer magic-link flow: /callback?code=...
    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) {
          console.error(error);
          alert(error.message);
        } else {
          window.location.replace("/dashboard");
        }
      });
      return;
    }

    // Fallback for older hash-based links: /callback#access_token=...
    if (
      typeof window !== "undefined" &&
      window.location.hash.includes("access_token")
    ) {
      window.location.replace("/dashboard");
    }
  }, [params]);

  return <p style={{ padding: 16 }}>Signing you in…</p>;
}

export default function CallbackPage() {
  return (
    <Suspense fallback={<p style={{ padding: 16 }}>Loading...</p>}>
      <CallbackContent />
    </Suspense>
  );
}
