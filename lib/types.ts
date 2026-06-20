export interface LanguageStat {
  name: string;
  /** Share of total analyzed bytes, 0..1 */
  share: number;
  /** Hex color (with leading #) from GitHub Linguist, or a fallback */
  color: string;
}

export interface CardData {
  /** GitHub login / handle (without @) */
  username: string;
  /** Display name, falls back to username */
  name: string;
  avatarUrl: string;
  profileUrl: string;

  /** Derived class line, e.g. "TYPESCRIPT WIZARD" */
  className: string;
  /** Pokemon-style elemental type derived from dominant language */
  type: string;
  level: number;

  /** Composite power score */
  power: number;
  /** 0..100 percentile-ish rank (higher = rarer) */
  percentile: number;

  /** Raw stats used for the score + flavor */
  stats: {
    followers: number;
    following: number;
    publicRepos: number;
    totalStars: number;
    contributions: number | null;
  };

  /** Flavor text block ("THE ORACLE SAYS ...") */
  oracle: string;

  /** Top languages, sorted desc by share, capped to ~10 */
  languages: LanguageStat[];
}

export interface RepoSummary {
  name: string;
  description: string | null;
  stars: number;
  language: string | null;
}
