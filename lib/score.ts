import type { LanguageStat } from "./types";

interface ScoreInput {
  followers: number;
  totalStars: number;
  publicRepos: number;
  contributions: number | null;
}

const log = (n: number) => Math.log10(Math.max(0, n) + 1);

/**
 * Composite power score on a roughly 0..1000 scale.
 * Log-scaled so it isn't dominated by a handful of megastars.
 *
 * Weights are deliberately transparent — tune here, not in fake percentiles.
 */
export function computePower({
  followers,
  totalStars,
  publicRepos,
  contributions,
}: ScoreInput): number {
  const raw =
    140 * log(totalStars) + // reach of your work
    120 * log(followers) + // reach of you
    50 * log(publicRepos) + // breadth
    90 * log(contributions ?? 0); // recent grind (0 if unknown)

  return Math.round(raw);
}

/**
 * Map a power score to a "TOP X%" rarity label.
 * Not a real population percentile — a monotonic heuristic tuned so a typical
 * active dev lands mid-pack and notable accounts approach the top.
 */
export function computePercentile(power: number): number {
  // Logistic-ish curve over the expected power range (~0..900).
  const pct = 100 / (1 + Math.exp(-(power - 350) / 110));
  return Math.round(Math.min(99, Math.max(1, pct)));
}

export function computeLevel(power: number): number {
  return Math.max(1, Math.min(100, Math.round(power / 10)));
}

const TYPE_BY_LANGUAGE: Record<string, string> = {
  JavaScript: "ELECTRIC",
  TypeScript: "ELECTRIC",
  Python: "POISON",
  Rust: "STEEL",
  Go: "WATER",
  C: "ROCK",
  "C++": "ROCK",
  "C#": "GRASS",
  Java: "GROUND",
  Ruby: "FIRE",
  PHP: "NORMAL",
  Swift: "FLYING",
  Kotlin: "PSYCHIC",
  Shell: "DARK",
  HTML: "FAIRY",
  CSS: "FAIRY",
  Haskell: "GHOST",
  Solidity: "DRAGON",
};

export function deriveType(languages: LanguageStat[]): string {
  const top = languages[0]?.name;
  return (top && TYPE_BY_LANGUAGE[top]) || "NORMAL";
}

const TITLE_BY_RANK = [
  [90, "LEGEND"],
  [75, "ARCHMAGE"],
  [55, "WIZARD"],
  [35, "ARTISAN"],
  [15, "APPRENTICE"],
  [0, "HATCHLING"],
] as const;

export function deriveClassName(
  languages: LanguageStat[],
  percentile: number,
): string {
  const lang = languages[0]?.name?.toUpperCase() ?? "POLYGLOT";
  const title =
    TITLE_BY_RANK.find(([floor]) => percentile >= floor)?.[1] ?? "HATCHLING";
  return `${lang} ${title}`;
}
