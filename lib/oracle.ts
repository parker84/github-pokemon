import Anthropic from "@anthropic-ai/sdk";
import type { LanguageStat, RepoSummary } from "./types";

interface OracleInput {
  username: string;
  name: string;
  bio: string | null;
  followers: number;
  totalStars: number;
  languages: LanguageStat[];
  topRepos: RepoSummary[];
}

const MODEL = "claude-haiku-4-5";

/**
 * Generate a short, punchy "THE ORACLE SAYS" blurb.
 * Falls back to the GitHub bio (or a generic line) if the API key is missing
 * or the call fails — the card must always render.
 */
export async function generateOracle(input: OracleInput): Promise<string> {
  const fallback =
    input.bio?.trim() ||
    `BUILDS THINGS ON GITHUB. ${input.languages[0]?.name?.toUpperCase() ?? "CODE"} ENJOYER.`;

  if (!process.env.ANTHROPIC_API_KEY) return clean(fallback);

  const langs = input.languages
    .slice(0, 5)
    .map((l) => l.name)
    .join(", ");
  const repos = input.topRepos
    .slice(0, 4)
    .map((r) => `${r.name} (${r.stars}★)${r.description ? `: ${r.description}` : ""}`)
    .join("\n");

  const prompt = `You write trading-card flavor text for developers based on their GitHub.
Write a 2-3 line description (max ~22 words total) that is witty, a little roasty, but affectionate.
Output ONLY the description text. No quotes, no preamble, no emoji.

Developer: ${input.name} (@${input.username})
GitHub bio: ${input.bio ?? "(none)"}
Followers: ${input.followers} · Total stars: ${input.totalStars}
Top languages: ${langs || "unknown"}
Top repos:
${repos || "(none notable)"}`;

  try {
    const client = new Anthropic();
    const msg = await client.messages.create({
      model: MODEL,
      max_tokens: 120,
      messages: [{ role: "user", content: prompt }],
    });
    const text = msg.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join(" ")
      .trim();
    return clean(text || fallback);
  } catch {
    return clean(fallback);
  }
}

function clean(s: string): string {
  return s.replace(/^["']|["']$/g, "").trim().toUpperCase();
}
