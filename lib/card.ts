import { fetchContributions, fetchGitHubProfile } from "./github";
import { generateOracle } from "./oracle";
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
  const [{ user, totalStars, topRepos, languages }, contributions] =
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

  const oracle = await generateOracle({
    username: user.login,
    name: user.name ?? user.login,
    bio: user.bio,
    followers: user.followers,
    totalStars,
    languages,
    topRepos,
  });

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
    oracle,
    languages,
  };
}
