import { fetchContributions, fetchGitHubProfile } from "./github";
import {
  computeLevel,
  computePercentile,
  computePower,
  deriveClassName,
  deriveType,
} from "./score";
import { buildStatBars } from "./stats";
import type { CardData } from "./types";

const YEAR_MS = 1000 * 60 * 60 * 24 * 365.25;

/** Build the full card payload for a username. Framework-agnostic. */
export async function buildCardData(username: string): Promise<CardData> {
  const [
    {
      user,
      totalStars,
      totalForks,
      topRepoStars,
      languageCount,
      ownedCount,
      languages,
    },
    contributions,
  ] = await Promise.all([
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

  const statBars = buildStatBars({
    totalStars,
    followers: user.followers,
    following: user.following,
    publicRepos: user.public_repos,
    publicGists: user.public_gists,
    contributions,
    totalForks,
    topRepoStars,
    languageCount,
    ownedCount,
    accountAgeYears: (Date.now() - new Date(user.created_at).getTime()) / YEAR_MS,
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
    languages,
    statBars,
  };
}
