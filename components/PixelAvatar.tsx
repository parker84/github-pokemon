"use client";

import { useEffect, useRef } from "react";

interface Props {
  src: string;
  /** Rendered size in px (square). */
  size: number;
  /** Resolution of the pixel grid before upscaling. Lower = chunkier. */
  pixels?: number;
  /** Posterize color levels per channel. Lower = more retro. */
  levels?: number;
  className?: string;
}

/** Renders an avatar as a chunky, posterized 8-bit-style portrait. */
export function PixelAvatar({
  src,
  size,
  pixels = 32,
  levels = 6,
  className,
}: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const proxied = `/api/avatar?url=${encodeURIComponent(src)}`;
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      // Downscale into a tiny offscreen canvas...
      const tmp = document.createElement("canvas");
      tmp.width = pixels;
      tmp.height = pixels;
      const tctx = tmp.getContext("2d");
      if (!tctx) return;
      tctx.drawImage(img, 0, 0, pixels, pixels);

      // ...posterize the palette (best-effort; skipped if canvas is tainted).
      try {
        const data = tctx.getImageData(0, 0, pixels, pixels);
        const p = data.data;
        const step = 255 / (levels - 1);
        for (let i = 0; i < p.length; i += 4) {
          p[i] = Math.round(p[i] / step) * step;
          p[i + 1] = Math.round(p[i + 1] / step) * step;
          p[i + 2] = Math.round(p[i + 2] / step) * step;
        }
        tctx.putImageData(data, 0, 0);
      } catch {
        /* tainted canvas — keep the un-posterized pixel version */
      }

      // ...then upscale with nearest-neighbor for hard pixel edges.
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, size, size);
      ctx.drawImage(tmp, 0, 0, size, size);
    };

    img.src = proxied;
  }, [src, size, pixels, levels]);

  return (
    <canvas
      ref={ref}
      width={size}
      height={size}
      className={className}
      style={{ width: size, height: size, imageRendering: "pixelated" }}
    />
  );
}
