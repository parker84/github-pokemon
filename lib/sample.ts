import type { CardData } from "./types";

/** Static example card shown on the landing so visitors see the output instantly. */
export const SAMPLE_CARD: CardData = {
  username: "torvalds",
  name: "Linus Torvalds",
  avatarUrl: "https://avatars.githubusercontent.com/u/1024025?v=4",
  profileUrl: "https://github.com/torvalds",
  className: "C LEGEND",
  type: "ROCK",
  level: 100,
  power: 1470,
  percentile: 99,
  stats: {
    followers: 240000,
    following: 0,
    publicRepos: 12,
    totalStars: 250000,
    contributions: null,
  },
  languages: [
    { name: "C", share: 0.82, color: "#555555" },
    { name: "Assembly", share: 0.07, color: "#6E4C13" },
    { name: "Shell", share: 0.05, color: "#89e051" },
    { name: "Makefile", share: 0.03, color: "#427819" },
    { name: "Python", share: 0.02, color: "#3572A5" },
    { name: "Perl", share: 0.01, color: "#0298c3" },
  ],
};
