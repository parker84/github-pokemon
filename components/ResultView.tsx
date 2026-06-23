"use client";

import { useRef, useState } from "react";
import { toBlob, toPng } from "html-to-image";
import type { CardData } from "@/lib/types";
import { Card } from "./Card";

const RENDER_OPTS = {
  pixelRatio: 3,
  cacheBust: true,
  backgroundColor: "#0d1117",
} as const;

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

  // Safari (esp. iOS) drops the <canvas> avatar and webfonts on the first
  // rasterization, so wait for fonts and do throwaway warm-up passes before
  // the capture that actually counts.
  async function warmUp() {
    const node = cardRef.current;
    if (!node) return;
    if (document.fonts?.ready) {
      try {
        await document.fonts.ready;
      } catch {
        /* fonts API unavailable — proceed anyway */
      }
    }
    await toPng(node, RENDER_OPTS);
    await toPng(node, RENDER_OPTS);
  }

  async function renderPng(): Promise<string | null> {
    if (!cardRef.current) return null;
    await warmUp();
    return toPng(cardRef.current, RENDER_OPTS);
  }

  async function renderBlob(): Promise<Blob> {
    const node = cardRef.current;
    if (!node) throw new Error("card not mounted");
    await warmUp();
    const blob = await toBlob(node, RENDER_OPTS);
    if (!blob) throw new Error("render produced no image");
    return blob;
  }

  async function download() {
    const png = await renderPng();
    if (!png) return;
    const a = document.createElement("a");
    a.href = png;
    a.download = `${data.username}-card.png`;
    a.click();
  }

  async function copyImage() {
    // iOS Safari only honors clipboard.write inside the gesture window, so the
    // ClipboardItem must be built with the still-pending blob promise and
    // written synchronously — never `await` the render before writing.
    if (typeof ClipboardItem === "undefined" || !navigator.clipboard?.write) {
      await download();
      flash("SAVED IMAGE");
      return;
    }
    try {
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": renderBlob() }),
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
        <button className="btn" onClick={copyImage}>
          COPY IMAGE
        </button>
        <button className="btn" onClick={copyLink}>
          COPY LINK
        </button>
        <button className="btn" onClick={download}>
          DOWNLOAD
        </button>
      </div>

      <button className="btn ghost back" onClick={onReset}>
        ← NEW CARD
      </button>
      {copied && <div className="toast">{copied}</div>}
    </div>
  );
}
