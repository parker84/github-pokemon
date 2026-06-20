"use client";

import { useEffect, useState } from "react";
import type { LeaderboardEntry } from "@/lib/leaderboard";
import { PixelAvatar } from "./PixelAvatar";

export function Leaderboard({
  onPick,
}: {
  onPick: (username: string) => void;
}) {
  const [entries, setEntries] = useState<LeaderboardEntry[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        if (Array.isArray(d.entries) && d.entries.length > 0)
          setEntries(d.entries);
        else setError(true);
      })
      .catch(() => alive && setError(true));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <section className="leaderboard">
      <h2 className="leaderboard-title">TOP TRAINERS</h2>
      {error && (
        <p className="leaderboard-note">
          COULDN&apos;T LOAD — GITHUB RATE LIMIT. ADD A GITHUB_TOKEN.
        </p>
      )}
      {!error && (
      <div className="leaderboard-grid">
        {(entries ?? Array.from({ length: 10 }, () => null)).map((e, i) => (
          <button
            key={e?.username ?? i}
            className="lb-card"
            disabled={!e}
            onClick={() => e && onPick(e.username)}
            title={e ? `@${e.username}` : undefined}
          >
            <span className="lb-rank">{i + 1}</span>
            <span
              className="lb-frame"
              style={
                e ? { boxShadow: `0 0 12px ${e.topLanguageColor}55` } : undefined
              }
            >
              {e ? (
                <PixelAvatar src={e.avatarUrl} size={96} pixels={52} levels={12} />
              ) : (
                <span className="lb-skeleton" />
              )}
            </span>
            <span className="lb-name">{e ? e.name.toUpperCase() : "····"}</span>
            <span className="lb-power">
              {e ? `${e.power} PWR` : ""}
            </span>
          </button>
        ))}
      </div>
      )}
    </section>
  );
}
