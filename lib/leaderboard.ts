import { colorForLanguage, FALLBACK_COLOR } from "./colors";
import { fetchUserLite } from "./github";
import { computeLevel, computePower } from "./score";

/**
 * The "TODAY'S LEGENDARIES" roster. Edit this list to change the leaderboard.
 * Ranked by computed power at request time.
 */
export const ROSTER = [
  "karpathy", // Andrej Karpathy
  "jayair", // Jay — opencode / SST
  "steipete", // Peter Steinberger — OpenClaw
  "torvalds", // Linus Torvalds
  "gvanrossum", // Guido van Rossum
  "antirez", // Salvatore Sanfilippo — Redis
  "sindresorhus", // Sindre Sorhus
  "gaearon", // Dan Abramov
  "yyx990803", // Evan You — Vue
  "simonw", // Simon Willison
];

export interface LeaderboardEntry {
  rank: number;
  username: string;
  name: string;
  avatarUrl: string;
  profileUrl: string;
  power: number;
  level: number;
  topLanguage: string | null;
  topLanguageColor: string;
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const settled = await Promise.allSettled(
    ROSTER.map(async (login) => {
      const { user, totalStars, topLanguage } = await fetchUserLite(login);
      const power = computePower({
        followers: user.followers,
        totalStars,
        publicRepos: user.public_repos,
        contributions: null,
      });
      return {
        username: user.login,
        name: user.name ?? user.login,
        avatarUrl: user.avatar_url,
        profileUrl: user.html_url,
        power,
        level: computeLevel(power),
        topLanguage,
        topLanguageColor: topLanguage
          ? colorForLanguage(topLanguage)
          : FALLBACK_COLOR,
      };
    }),
  );

  return settled
    .flatMap((r) => (r.status === "fulfilled" ? [r.value] : []))
    .sort((a, b) => b.power - a.power)
    .map((entry, i) => ({ ...entry, rank: i + 1 }));
}
