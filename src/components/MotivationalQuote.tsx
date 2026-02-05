"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles } from "lucide-react";

type QuoteData = {
  _id: string;
  content: string;
  author: string;
  tags: string[];
};

// ZenQuotes API response format - simple structure with just quote and author
type ZenQuoteResponse = {
  q: string; // quote text
  a: string; // author name
};

// Local fallback quotes in case the API is unavailable
const fallbackQuotes: QuoteData[] = [
  {
    _id: "fallback1",
    content: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
    tags: ["motivation"],
  },
  {
    _id: "fallback2",
    content:
      "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill",
    tags: ["motivation"],
  },
  {
    _id: "fallback3",
    content:
      "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt",
    tags: ["motivation"],
  },
  {
    _id: "fallback4",
    content: "Don't watch the clock; do what it does. Keep going.",
    author: "Sam Levenson",
    tags: ["motivation"],
  },
  {
    _id: "fallback5",
    content:
      "The only limit to our realization of tomorrow is our doubts of today.",
    author: "Franklin D. Roosevelt",
    tags: ["motivation"],
  },
];

export default function MotivationalQuote() {
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuote();
  }, []);

  /**
   * Fetches a motivational quote from zenquotes.io via Next.js API route
   * Uses server-side fetch to bypass CORS restrictions
   * Handles network errors, timeouts, and API failures gracefully
   */
  const fetchQuote = async () => {
    try {
      setLoading(true);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

      // Fetch quote via Next.js API route (server-side, no CORS issues)
      const response = await fetch("/api/quote", {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Parse response from our API route
      const data = await response.json();

      // Extract quote and author from response
      if (data && data.quote && data.author) {
        setQuote({
          _id: `zenquote-${Date.now()}`,
          content: data.quote,
          author: data.author,
          tags: ["motivation"],
        });
        return; // Success - exit early
      }

      // If we get here, response format was unexpected
      throw new Error("Invalid response format from API");
    } catch (error) {
      // Don't log AbortError (timeout) as it's expected behavior
      if (error instanceof Error && error.name === "AbortError") {
        // Timeout occurred - silently fall back to local quotes
      } else if (error instanceof Error) {
        // Log other errors for debugging
        console.warn("Error fetching quote:", error.message);
      }
      // Use a random fallback quote when API fails
      const randomIndex = Math.floor(Math.random() * fallbackQuotes.length);
      setQuote(fallbackQuotes[randomIndex]);
    } finally {
      setLoading(false);
    }
  };

  const getRandomFallbackQuote = () => {
    const randomIndex = Math.floor(Math.random() * fallbackQuotes.length);
    setQuote(fallbackQuotes[randomIndex]);
  };

  return (
    <Card>
      <CardContent>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Sparkles className="h-5 w-5" />
          </div>
          <Badge variant="outline">Daily Motivation</Badge>
        </div>

        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-3/4" />
            <div className="flex items-center justify-between mt-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        ) : quote ? (
          <div className="space-y-4">
            <blockquote className="font-ui text-base sm:text-lg font-medium text-foreground leading-relaxed">
              &quot;{quote.content}&quot;
            </blockquote>
            <div className="flex items-center justify-between">
              <cite className="font-ui text-sm text-muted-foreground not-italic">
                — {quote.author}
              </cite>
              <Button
                variant="ghost"
                size="sm"
                onClick={
                  quote._id.startsWith("fallback")
                    ? getRandomFallbackQuote
                    : fetchQuote
                }
                className="text-xs"
              >
                New Quote
              </Button>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
