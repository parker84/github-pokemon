"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import type { CardData } from "@/lib/types";
import { Card } from "./Card";

export function ResultView({
  data,
  onReset,
}: {
  data: CardData;
  onReset: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState<string | null>(null);

  function flash(msg: string) {
    setCopied(msg);
    setTimeout(() => setCopied(null), 1600);
  }

  async function render(): Promise<string | null> {
    if (!cardRef.current) return null;
    return toPng(cardRef.current, {
      pixelRatio: 3,
      cacheBust: true,
      backgroundColor: "#0d1117",
    });
  }

  async function download() {
    const png = await render();
    if (!png) return;
    const a = document.createElement("a");
    a.href = png;
    a.download = `${data.username}-card.png`;
    a.click();
  }

  async function copyImage() {
    try {
      const png = await render();
      if (!png) return;
      const blob = await (await fetch(png)).blob();
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      flash("IMAGE COPIED");
    } catch {
      flash("COPY FAILED");
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      flash("LINK COPIED");
    } catch {
      flash("COPY FAILED");
    }
  }

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/?u=${data.username}`
      : "";
  const shareText = `I'm a ${data.type}-type ${data.className} on GitHub — ${data.power} PWR, top ${100 - data.percentile}%. What's your GitHub Pokémon?`;

  function shareX() {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      shareText,
    )}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function shareLinkedIn() {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      shareUrl,
    )}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="result">
      <div className="nameplate">
        <span className="nameplate-text">{data.name.toUpperCase()}</span>
      </div>

      <Card data={data} ref={cardRef} />

      <p className="rank-line">
        YOU OUTRANK {data.percentile}% OF GITHUB TRAINERS
      </p>

      <div className="result-actions">
        <button className="btn share-x" onClick={shareX}>
          SHARE ON X
        </button>
        <button className="btn" onClick={shareLinkedIn}>
          LINKEDIN
        </button>
        <button className="btn" onClick={download}>
          DOWNLOAD
        </button>
      </div>
      <div className="result-actions secondary">
        <button className="btn ghost" onClick={copyImage}>
          COPY IMAGE
        </button>
        <button className="btn ghost" onClick={copyLink}>
          COPY LINK
        </button>
      </div>
      <button className="btn ghost back" onClick={onReset}>
        ← NEW CARD
      </button>
      {copied && <div className="toast">{copied}</div>}
    </div>
  );
}
