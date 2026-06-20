import { NextRequest, NextResponse } from "next/server";
import { buildCardData } from "@/lib/card";
import { GitHubError, parseUsername } from "@/lib/github";

export const runtime = "nodejs";
// Cache successful cards at the edge for 6h to spare GitHub + Claude.
export const revalidate = 21600;

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("u") ?? "";
  const username = parseUsername(raw);

  if (!username) {
    return NextResponse.json(
      { error: "Enter a valid GitHub username or profile URL." },
      { status: 400 },
    );
  }

  try {
    const card = await buildCardData(username);
    return NextResponse.json(card, {
      headers: {
        "Cache-Control":
          "public, s-maxage=21600, stale-while-revalidate=86400",
      },
    });
  } catch (err) {
    if (err instanceof GitHubError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("card build failed", err);
    return NextResponse.json(
      { error: "Failed to generate card." },
      { status: 500 },
    );
  }
}
