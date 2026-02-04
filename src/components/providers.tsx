"use client";

import React from "react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";

/**
 * Root providers component
 * Wraps app with ThemeProvider for light/dark mode support
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange={false}
    >
      {children}
      {/* Sonner global toaster */}
      <Toaster
        position="top-right"
        richColors
        closeButton
        expand={false}
        visibleToasts={3}
      />
    </ThemeProvider>
  );
}
