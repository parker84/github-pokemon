import type { StatBar } from "./types";

export interface StatInput {
  totalStars: number;
  followers: number;
  following: number;
  publicRepos: number;
  publicGists: number;
  contributions: number | null;
  totalForks: number;
  topRepoStars: number;
  languageCount: number;
  ownedCount: number;
  accountAgeYears: number;
}

/** Log-scale a value against a soft cap into a 0..1 bar fill. */
const logNorm = (value: number, cap: number): number => {
  if (value <= 0) return 0.02;
  return Math.min(1, Math.max(0.05, Math.log10(value + 1) / Math.log10(cap + 1)));
};

/**
 * Turn raw GitHub stats into a varied set of colored stat bars — the card's
 * centerpiece. Each dimension gets its own hue so the panel reads like a
 * trading-card stat block rather than a single language.
 */
export function buildStatBars(s: StatInput): StatBar[] {
  const avgStars = s.ownedCount > 0 ? s.totalStars / s.ownedCount : 0;
  return [
    { name: "STARS", value: s.totalStars, share: logNorm(s.totalStars, 50000), color: "#e3b341" },
    { name: "FOLLOWERS", value: s.followers, share: logNorm(s.followers, 50000), color: "#56d4dd" },
    { name: "COMMITS", value: s.contributions ?? 0, share: logNorm(s.contributions ?? 0, 5000), color: "#39d353" },
    { name: "REPOS", value: s.publicRepos, share: logNorm(s.publicRepos, 200), color: "#26a641" },
    { name: "FORKS", value: s.totalForks, share: logNorm(s.totalForks, 10000), color: "#db61a2" },
    { name: "TOP REPO", value: s.topRepoStars, share: logNorm(s.topRepoStars, 50000), color: "#f0883e" },
    { name: "FOLLOWING", value: s.following, share: logNorm(s.following, 2000), color: "#388bfd" },
    { name: "GISTS", value: s.publicGists, share: logNorm(s.publicGists, 200), color: "#a371f7" },
    { name: "LANGUAGES", value: s.languageCount, share: logNorm(s.languageCount, 20), color: "#3fb950" },
    { name: "AVG STARS", value: Math.round(avgStars), share: logNorm(avgStars, 2000), color: "#bf91f3" },
    {
      name: "VETERAN",
      value: Math.round(s.accountAgeYears),
      share: Math.min(1, Math.max(0.05, s.accountAgeYears / 18)),
      color: "#f85149",
    },
  ];
}
