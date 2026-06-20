"use client";

import { useEffect, useState } from "react";

const STEPS = [
  "FETCHING PROFILE",
  "SCANNING REPOS",
  "AGGREGATING LANGUAGES",
  "COMPUTING POWER LEVEL",
  "CONSULTING THE ORACLE",
];

/** Cosmetic terminal readout shown while the card is being built. */
export function LoadingSequence({ query }: { query: string }) {
  const [done, setDone] = useState(0);

  useEffect(() => {
    setDone(0);
    const timers = STEPS.map((_, i) =>
      setTimeout(() => setDone((d) => Math.max(d, i + 1)), 350 * (i + 1)),
    );
    return () => timers.forEach(clearTimeout);
  }, [query]);

  return (
    <div className="loading">
      <div className="nameplate">
        <span className="nameplate-text">{query.toUpperCase()}</span>
      </div>
      <div className="loading-log">
        {STEPS.map((step, i) => (
          <div key={step} className="log-row">
            <span className="log-label">
              <span className="log-caret">&gt;</span> {step}
            </span>
            <span className="log-dots" />
            <span className="log-status">
              {i < done ? "OK" : i === done ? "···" : ""}
            </span>
          </div>
        ))}
        <div className="log-cursor">▋</div>
      </div>
    </div>
  );
}
