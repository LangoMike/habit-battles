"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

  const fetchQuote = async () => {
    try {
      setLoading(true);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(
        "https://api.quotable.io/quotes/random?tags=motivation|success|inspiration&maxLength=150",
        { signal: controller.signal }
      );

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        setQuote(data[0]);
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error fetching quote:", error);
      // Use a random fallback quote
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

  if (loading) {
    return (
      <Card className="p-6 bg-gradient-to-r from-red-900/20 to-red-800/20 border-red-500/30">
        <div className="flex items-center gap-3 mb-3">
          <Sparkles className="h-5 w-5 text-red-400" />
          <Badge variant="outline" className="border-red-500/50 text-red-400">
            Daily Motivation
          </Badge>
        </div>
        <div className="animate-pulse">
          <div className="h-4 bg-red-500/20 rounded mb-2"></div>
          <div className="h-4 bg-red-500/20 rounded w-3/4"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-to-r from-red-900/20 to-red-800/20 border-red-500/30 hover:from-red-900/30 hover:to-red-800/30 transition-all duration-300">
      <div className="flex items-center gap-3 mb-4">
        <Sparkles className="h-5 w-5 text-red-400" />
        <Badge variant="outline" className="border-red-500/50 text-red-400">
          Daily Motivation
        </Badge>
      </div>

      {quote && (
        <div className="space-y-3">
          <blockquote className="text-lg font-medium text-white/90 leading-relaxed">
            &quot;{quote.content}&quot;
          </blockquote>
          <div className="flex items-center justify-between">
            <cite className="text-sm text-red-300 not-italic">
              — {quote.author}
            </cite>
            <button
              onClick={
                quote._id.startsWith("fallback")
                  ? getRandomFallbackQuote
                  : fetchQuote
              }
              className="text-xs text-red-400 hover:text-red-300 transition-colors"
            >
              New Quote
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}
