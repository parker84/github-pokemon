"use client";

import { useCallback, useEffect, useState } from "react";
import { Leaderboard } from "@/components/Leaderboard";
import { LoadingSequence } from "@/components/LoadingSequence";
import { ResultView } from "@/components/ResultView";
import type { CardData } from "@/lib/types";

type Phase = "idle" | "loading" | "result";

const MIN_LOADING_MS = 1900; // let the terminal readout breathe

export default function Home() {
  const [input, setInput] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [query, setQuery] = useState("");
  const [data, setData] = useState<CardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (raw: string) => {
    const value = raw.trim();
    if (!value) return;
    setQuery(value);
    setPhase("loading");
    setError(null);

    const started = Date.now();
    try {
      const res = await fetch(`/api/card?u=${encodeURIComponent(value)}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Something went wrong.");

      const wait = Math.max(0, MIN_LOADING_MS - (Date.now() - started));
      setTimeout(() => {
        setData(json as CardData);
        setPhase("result");
      }, wait);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setPhase("idle");
    }
  }, []);

  // Deep link: /?u=torvalds auto-generates.
  useEffect(() => {
    const u = new URLSearchParams(window.location.search).get("u");
    if (u) {
      setInput(u);
      generate(u);
    }
  }, [generate]);

  function reset() {
    setData(null);
    setPhase("idle");
    setError(null);
    window.history.replaceState(null, "", "/");
  }

  if (phase === "loading") {
    return (
      <main className="page">
        <LoadingSequence query={query} />
      </main>
    );
  }

  if (phase === "result" && data) {
    return (
      <main className="page">
        <ResultView data={data} onReset={reset} />
      </main>
    );
  }

  return (
    <main className="page">
      <p className="kicker">GOTTA CATCH &apos;EM ALL</p>
      <h1 className="headline">
        GITHUB
        <br />
        POKéMON
      </h1>

      <form
        className="search"
        onSubmit={(e) => {
          e.preventDefault();
          generate(input);
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="GITHUB URL OR @USERNAME"
          spellCheck={false}
          autoCapitalize="off"
          autoFocus
        />
      </form>

      <p className="blurb">
        ENTER ANY GITHUB PROFILE TO MINT A RETRO TRADING CARD — POWER LEVEL,
        RANK, ELEMENTAL TYPE, AND YOUR TOP LANGUAGES, ALL PULLED LIVE.
      </p>

      {error && <div className="error">⚠ {error}</div>}

      <Leaderboard onPick={generate} />
    </main>
  );
}
