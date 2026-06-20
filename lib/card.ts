import { fetchContributions, fetchGitHubProfile } from "./github";
import {
  computeLevel,
  computePercentile,
  computePower,
  deriveClassName,
  deriveType,
} from "./score";
import type { CardData } from "./types";

/** Build the full card payload for a username. Framework-agnostic. */
export async function buildCardData(username: string): Promise<CardData> {
  const [{ user, totalStars, languages }, contributions] =
    await Promise.all([
      fetchGitHubProfile(username),
      fetchContributions(username),
    ]);

  const power = computePower({
    followers: user.followers,
    totalStars,
    publicRepos: user.public_repos,
    contributions,
  });
  const percentile = computePercentile(power);

  return {
    username: user.login,
    name: user.name ?? user.login,
    avatarUrl: user.avatar_url,
    profileUrl: user.html_url,
    className: deriveClassName(languages, percentile),
    type: deriveType(languages),
    level: computeLevel(power),
    power,
    percentile,
    stats: {
      followers: user.followers,
      following: user.following,
      publicRepos: user.public_repos,
      totalStars,
      contributions,
    },
    languages,
  };
}
