import type { Achievement } from "./types";

export interface AchievementInput {
  totalStars: number;
  followers: number;
  publicRepos: number;
  contributions: number | null;
  totalForks: number;
  topRepoStars: number;
  languageCount: number;
  accountAgeYears: number;
}

interface Rule extends Achievement {
  earned: (s: AchievementInput) => boolean;
}

const RULES: Rule[] = [
  { name: "SUPERNOVA", icon: "🌟", color: "#e3b341", desc: "10K+ total stars", earned: (s) => s.totalStars >= 10000 },
  { name: "STARGAZER", icon: "⭐", color: "#e3b341", desc: "1K+ total stars", earned: (s) => s.totalStars >= 1000 },
  { name: "OSS HERO", icon: "🏆", color: "#f0883e", desc: "A repo with 5K+ stars", earned: (s) => s.topRepoStars >= 5000 },
  { name: "INFLUENCER", icon: "👥", color: "#56d4dd", desc: "1K+ followers", earned: (s) => s.followers >= 1000 },
  { name: "GRINDER", icon: "🔥", color: "#39d353", desc: "1K+ contributions this year", earned: (s) => (s.contributions ?? 0) >= 1000 },
  { name: "POLYGLOT", icon: "🧬", color: "#3fb950", desc: "5+ languages shipped", earned: (s) => s.languageCount >= 5 },
  { name: "PROLIFIC", icon: "📦", color: "#26a641", desc: "50+ public repos", earned: (s) => s.publicRepos >= 50 },
  { name: "FORK LORD", icon: "🍴", color: "#db61a2", desc: "500+ forks of your work", earned: (s) => s.totalForks >= 500 },
  { name: "VETERAN", icon: "🛡️", color: "#f85149", desc: "10+ years on GitHub", earned: (s) => s.accountAgeYears >= 10 },
  { name: "ROOKIE", icon: "🌱", color: "#a371f7", desc: "Joined in the last 2 years", earned: (s) => s.accountAgeYears < 2 },
];

/** Returns earned badges; always at least one (HATCHLING fallback). */
export function deriveAchievements(s: AchievementInput): Achievement[] {
  const earned = RULES.filter((r) => r.earned(s)).map(
    ({ earned: _earned, ...badge }) => badge,
  );
  if (earned.length === 0) {
    return [
      { name: "HATCHLING", icon: "🥚", color: "#7d8590", desc: "The journey begins" },
    ];
  }
  return earned;
}
