"use client";

import { useEffect, Suspense, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

function CallbackContent() {
  const params = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "error" | "success">(
    "loading"
  );
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [retryCount, setRetryCount] = useState(0);

  const handleAuthSuccess = useCallback(() => {
    setStatus("success");
    // Use Next.js router instead of window.location for better mobile compatibility
    router.push("/dashboard");
  }, [router]);

  const handleAuthError = useCallback((error: Error | { message: string }) => {
    console.error("Authentication failed:", error);
    setStatus("error");
    setErrorMessage(
      error.message || "Authentication failed. Please try again."
    );
  }, []);

  const retryAuth = () => {
    setStatus("loading");
    setRetryCount((prev) => prev + 1);

    // Redirect back to login page for retry
    setTimeout(() => {
      router.push("/login");
    }, 1000);
  };

  useEffect(() => {
    const code = params.get("code");

    // Newer magic-link flow: /callback?code=...
    if (code) {
      supabase.auth
        .exchangeCodeForSession(code)
        .then(({ data, error }) => {
          if (error) {
            handleAuthError(error);
          } else if (data.session) {
            handleAuthSuccess();
          } else {
            handleAuthError(new Error("No session created"));
          }
        })
        .catch((err) => {
          handleAuthError(err);
        });
      return;
    }

    // Fallback for older hash-based links: /callback#access_token=...
    if (
      typeof window !== "undefined" &&
      window.location.hash.includes("access_token")
    ) {
      // Give Supabase a moment to process the hash
      setTimeout(() => {
        supabase.auth.getSession().then(({ data, error }) => {
          if (error) {
            handleAuthError(error);
          } else if (data.session) {
            handleAuthSuccess();
          } else {
            handleAuthError(
              new Error("No session found after hash processing")
            );
          }
        });
      }, 1000);
      return;
    }

    // No auth parameters found
    setTimeout(() => {
      router.push("/login");
    }, 2000);
  }, [params, router, retryCount, handleAuthSuccess, handleAuthError]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center rounded-xl">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="text-white text-lg">Signing you in...</p>
          <p className="text-gray-400 text-sm">
            Please wait while we verify your login
          </p>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center rounded-xl">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
            <span className="text-white text-2xl">✓</span>
          </div>
          <p className="text-white text-lg">Successfully signed in!</p>
          <p className="text-gray-400 text-sm">
            Redirecting to your dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center rounded-xl p-4">
        <div className="max-w-md w-full bg-gradient-to-r from-gray-900/50 to-gray-800/50 border border-gray-700/50 rounded-xl p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto">
            <span className="text-white text-2xl">!</span>
          </div>
          <div className="space-y-2">
            <h2 className="text-white text-xl font-semibold">
              Authentication Failed
            </h2>
            <p className="text-gray-400 text-sm">{errorMessage}</p>
          </div>
          <div className="space-y-3">
            <button
              onClick={retryAuth}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => router.push("/login")}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Back to Login
            </button>
          </div>
          {retryCount > 0 && (
            <p className="text-gray-500 text-xs">Retry attempt: {retryCount}</p>
          )}
        </div>
      </div>
    );
  }

  return null;
}

export default function CallbackPage() {
  return (
    <Suspense fallback={<p style={{ padding: 16 }}>Loading...</p>}>
      <CallbackContent />
    </Suspense>
  );
}
