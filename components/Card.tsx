import { forwardRef } from "react";
import type { CardData } from "@/lib/types";
import { Bar } from "./Bar";
import { PixelAvatar } from "./PixelAvatar";

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "GITHUB-POKEMON";

export const Card = forwardRef<HTMLDivElement, { data: CardData }>(
  function Card({ data }, ref) {
    return (
      <div className="card" ref={ref}>
        <div className="card-head">
          <PixelAvatar
            src={data.avatarUrl}
            size={92}
            pixels={40}
            className="avatar"
          />
          <div className="name">{data.name.toUpperCase()}</div>
          <div className="class">
            {data.className} · {data.type} · LV{data.level}
          </div>
          <div className="hero-line">
            <span className="bracket">&gt;</span> {data.power} PWR · TOP{" "}
            {100 - data.percentile}% <span className="bracket">&lt;</span>
          </div>
        </div>

        <div className="oracle">
          <span className="label">THE ORACLE SAYS</span>
          <span className="body">{data.oracle}</span>
        </div>

        <div className="bars">
          {data.languages.map((lang) => (
            <Bar key={lang.name} lang={lang} />
          ))}
        </div>

        <div className="card-foot">{SITE_NAME}</div>
      </div>
    );
  },
);
