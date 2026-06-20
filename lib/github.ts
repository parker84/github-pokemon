import { colorForLanguage } from "./colors";
import type { LanguageStat, RepoSummary } from "./types";

const API = "https://api.github.com";

export class GitHubError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "GitHubError";
  }
}

function headers(): HeadersInit {
  const h: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "github-pokemon",
  };
  if (process.env.GITHUB_TOKEN) {
    h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return h;
}

/** Accepts a full URL, @handle, or bare username and returns the login. */
export function parseUsername(input: string): string | null {
  const trimmed = input.trim().replace(/^@/, "");
  if (!trimmed) return null;

  // Try to pull a login out of a github.com URL.
  const urlMatch = trimmed.match(
    /(?:https?:\/\/)?(?:www\.)?github\.com\/([A-Za-z0-9-]+)/i,
  );
  const login = urlMatch ? urlMatch[1] : trimmed;

  // GitHub usernames: 1-39 chars, alphanumeric or single hyphens.
  if (!/^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38}$/.test(login)) {
    return null;
  }
  return login;
}

interface GitHubUser {
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
  bio: string | null;
  followers: number;
  following: number;
  public_repos: number;
}

interface GitHubRepo {
  name: string;
  description: string | null;
  fork: boolean;
  stargazers_count: number;
  language: string | null;
  languages_url: string;
}

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: headers(), next: { revalidate: 0 } });
  if (res.status === 404) throw new GitHubError("User not found", 404);
  if (res.status === 403 || res.status === 429) {
    throw new GitHubError("GitHub rate limit hit — try again later", 429);
  }
  if (!res.ok) {
    throw new GitHubError(`GitHub request failed (${res.status})`, res.status);
  }
  return res.json() as Promise<T>;
}

/** Fetch the user, their (non-fork) repos, aggregated languages and stars. */
export async function fetchGitHubProfile(username: string) {
  const user = await getJson<GitHubUser>(`${API}/users/${username}`);

  const repos = await getJson<GitHubRepo[]>(
    `${API}/users/${username}/repos?per_page=100&sort=pushed&type=owner`,
  );
  const owned = repos.filter((r) => !r.fork);

  const totalStars = owned.reduce((sum, r) => sum + r.stargazers_count, 0);

  const topRepos: RepoSummary[] = [...owned]
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 5)
    .map((r) => ({
      name: r.name,
      description: r.description,
      stars: r.stargazers_count,
      language: r.language,
    }));

  const languages = await aggregateLanguages(owned);

  return { user, totalStars, topRepos, languages };
}

/**
 * Sum byte counts across repos to build a weighted language breakdown.
 * Caps the number of repos we hit to keep within rate limits.
 */
async function aggregateLanguages(
  repos: GitHubRepo[],
  maxRepos = 30,
): Promise<LanguageStat[]> {
  const sample = [...repos]
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, maxRepos);

  const byteTotals = new Map<string, number>();

  const results = await Promise.allSettled(
    sample.map((r) =>
      getJson<Record<string, number>>(r.languages_url).catch(() => ({})),
    ),
  );

  for (const result of results) {
    if (result.status !== "fulfilled") continue;
    for (const [lang, bytes] of Object.entries(result.value)) {
      byteTotals.set(lang, (byteTotals.get(lang) ?? 0) + bytes);
    }
  }

  const total = [...byteTotals.values()].reduce((a, b) => a + b, 0);
  if (total === 0) return [];

  return [...byteTotals.entries()]
    .map(([name, bytes]) => ({
      name,
      share: bytes / total,
      color: colorForLanguage(name),
    }))
    .sort((a, b) => b.share - a.share)
    .slice(0, 10);
}

/**
 * Lightweight profile fetch for the leaderboard: user + stars + dominant
 * language by repo count. Skips the expensive per-repo languages_url calls.
 */
export async function fetchUserLite(username: string) {
  const user = await getJson<GitHubUser>(`${API}/users/${username}`);
  const repos = await getJson<GitHubRepo[]>(
    `${API}/users/${username}/repos?per_page=100&sort=pushed&type=owner`,
  );
  const owned = repos.filter((r) => !r.fork);
  const totalStars = owned.reduce((sum, r) => sum + r.stargazers_count, 0);

  const counts = new Map<string, number>();
  for (const r of owned) {
    if (r.language) counts.set(r.language, (counts.get(r.language) ?? 0) + 1);
  }
  const topLanguage =
    [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  return { user, totalStars, topLanguage };
}

/**
 * Contribution count over the last year via the GraphQL API.
 * Requires a token; returns null if unavailable.
 */
export async function fetchContributions(
  username: string,
): Promise<number | null> {
  if (!process.env.GITHUB_TOKEN) return null;

  const query = `
    query($login: String!) {
      user(login: $login) {
        contributionsCollection {
          contributionCalendar { totalContributions }
        }
      }
    }`;

  try {
    const res = await fetch(`${API}/graphql`, {
      method: "POST",
      headers: { ...headers(), "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables: { login: username } }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return (
      json?.data?.user?.contributionsCollection?.contributionCalendar
        ?.totalContributions ?? null
    );
  } catch {
    return null;
  }
}
