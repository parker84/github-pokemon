import { NextResponse } from "next/server";
import { GitHubError } from "@/lib/github";
import { fetchLeaderboard } from "@/lib/leaderboard";

export const runtime = "nodejs";
// Refresh the leaderboard at most once an hour.
export const revalidate = 3600;

export async function GET() {
  try {
    const entries = await fetchLeaderboard();
    return NextResponse.json(
      { entries },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      },
    );
  } catch (err) {
    if (err instanceof GitHubError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("leaderboard failed", err);
    return NextResponse.json(
      { error: "Failed to load leaderboard." },
      { status: 500 },
    );
  }
}
