import { NextResponse } from "next/server";

/**
 * API route to fetch a random quote from zenquotes.io
 * Server-side fetch bypasses CORS restrictions
 * Returns quote and author in a simple format
 */
export async function GET() {
  try {
    // Fetch random quote from zenquotes.io (server-side, no CORS issues, persisted in cache for 1 hour)
    const response = await fetch("https://zenquotes.io/api/random", {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Parse response - zenquotes.io returns an array with one quote object
    const data = await response.json();

    // Extract quote and author from response
    if (data && Array.isArray(data) && data.length > 0) {
      const quote = data[0];
      if (quote.q && quote.a) {
        return NextResponse.json({
          quote: quote.q,
          author: quote.a,
        });
      }
    }

    throw new Error("Invalid response format from API");
  } catch (error) {
    console.error("Error fetching quote from zenquotes.io:", error);
    return NextResponse.json(
      { error: "Failed to fetch quote" },
      { status: 500 }
    );
  }
}
