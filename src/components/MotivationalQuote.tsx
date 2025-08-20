"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Quote, Sparkles } from "lucide-react";

type QuoteData = {
  _id: string;
  content: string;
  author: string;
  tags: string[];
};

export default function MotivationalQuote() {
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuote();
  }, []);

  const fetchQuote = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "https://api.quotable.io/quotes/random?tags=motivation|success|inspiration&maxLength=150"
      );
      if (response.ok) {
        const data = await response.json();
        setQuote(data[0]);
      }
    } catch (error) {
      console.error("Error fetching quote:", error);
      // Fallback quote
      setQuote({
        _id: "fallback",
        content: "The only way to do great work is to love what you do.",
        author: "Steve Jobs",
        tags: ["motivation"],
      });
    } finally {
      setLoading(false);
    }
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
            "{quote.content}"
          </blockquote>
          <div className="flex items-center justify-between">
            <cite className="text-sm text-red-300 not-italic">
              — {quote.author}
            </cite>
            <button
              onClick={fetchQuote}
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
