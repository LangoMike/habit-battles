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
   * Fetches a motivational quote from the API or falls back to local quotes
   * Handles network errors, timeouts, and API failures gracefully
   */
  const fetchQuote = async () => {
    try {
      setLoading(true);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(
        "https://api.quotable.io/quotes/random?tags=motivation|success|inspiration&maxLength=150",
        { 
          signal: controller.signal,
          // Add headers to help with CORS if needed
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        setQuote(data[0]);
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      // Handle different types of errors silently - fallback quotes will be used
      if (error instanceof Error) {
        // Only log unexpected errors, not network failures or aborts
        if (error.name !== 'AbortError' && !error.message.includes('fetch')) {
          console.warn("Quote API unavailable, using fallback:", error.message);
        }
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
