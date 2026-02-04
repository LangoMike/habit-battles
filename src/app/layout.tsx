import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/providers";
import NavBar from "@/components/navBar";
import { Rajdhani, Inter } from "next/font/google";

// Display font for headings, numbers, gamey UI
const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-display",
});

// UI font for body text, buttons, forms
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-ui",
});

export const metadata: Metadata = {
  title: "Habit Battles",
  description: "Track habits and battle friends with streaks.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${rajdhani.variable} font-ui min-h-screen text-foreground bg-background [background-image:radial-gradient(1200px_500px_at_50%_-10%,rgba(185,28,28,0.12),transparent),radial-gradient(1000px_400px_at_50%_120%,rgba(220,38,38,0.08),transparent)] dark:[background-image:radial-gradient(1200px_500px_at_50%_-10%,rgba(239,68,68,0.15),transparent),radial-gradient(1000px_400px_at_50%_120%,rgba(255,255,255,0.06),transparent)]`}
      >
        <Providers>
          <NavBar />
          <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
