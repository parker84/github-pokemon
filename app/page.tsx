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

  const generate = useCallback(
    async (raw: string, opts: { push?: boolean } = {}) => {
      const value = raw.trim();
      if (!value) return;

      // Push a history entry so the browser back button returns to the landing.
      if (opts.push !== false) {
        window.history.pushState(
          { u: value },
          "",
          `/?u=${encodeURIComponent(value)}`,
        );
      }

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
    },
    [],
  );

  // Sync state to the URL on first load and on back/forward navigation.
  useEffect(() => {
    function sync() {
      const u = new URLSearchParams(window.location.search).get("u");
      if (u) {
        setInput(u);
        generate(u, { push: false });
      } else {
        setData(null);
        setQuery("");
        setPhase("idle");
        setError(null);
      }
    }
    sync();
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, [generate]);

  function reset() {
    window.history.pushState({}, "", "/");
    setData(null);
    setQuery("");
    setInput("");
    setPhase("idle");
    setError(null);
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
      <a
        className="credit"
        href="https://x.com/parker_brydon"
        target="_blank"
        rel="noopener noreferrer"
      >
        BRYDON PARKER PRESENTS
      </a>
      <h1 className="headline">
        GITHUB
        <br />
        POKéMON
      </h1>

      <p className="blurb">GET YOUR GITHUB POKéMON CARD</p>

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
        <button className="btn generate" type="submit">
          GENERATE MY CARD
        </button>
      </form>

      <a
        className="learn-more"
        href="https://github.com/parker84/github-pokemon"
        target="_blank"
        rel="noopener noreferrer"
      >
        LEARN MORE
      </a>

      {error && <div className="error">⚠ {error}</div>}

      <Leaderboard onPick={generate} />
    </main>
  );
}
