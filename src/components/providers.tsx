"use client";

import React from "react";
import { Toaster } from "sonner";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      {/* Sonner global toaster */}
      <Toaster
        position="top-right"
        richColors
        closeButton
        expand={false}
        visibleToasts={3}
      />
    </>
  );
}
