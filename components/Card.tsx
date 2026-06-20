import { forwardRef } from "react";
import { colorForLanguage } from "@/lib/colors";
import type { CardData } from "@/lib/types";
import { Bar } from "./Bar";
import { PixelAvatar } from "./PixelAvatar";

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "GITHUB-POKEMON";

export const Card = forwardRef<HTMLDivElement, { data: CardData }>(
  function Card({ data }, ref) {
    // Defensive defaults so a stale/partial payload can never crash render.
    const statBars = data.statBars ?? [];
    const languages = (data.languages ?? []).slice(0, 1);
    const repos = (data.topRepos ?? []).slice(0, 3);
    const achievements = (data.achievements ?? []).slice(0, 3);

    return (
      <div className="card" ref={ref}>
        <div className="card-head">
          <PixelAvatar
            src={data.avatarUrl}
            size={72}
            pixels={56}
            levels={12}
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

        {data.bio && <p className="card-bio">{data.bio}</p>}

        <div className="bars">
          {statBars.map((stat) => (
            <Bar
              key={stat.name}
              name={stat.name}
              share={stat.share}
              color={stat.color}
              valueLabel={stat.value.toLocaleString()}
            />
          ))}
        </div>

        {languages.length > 0 && (
          <div className="card-section">
            <h3 className="card-section-title">TOP LANGUAGE</h3>
            <div className="bars">
              {languages.map((lang) => (
                <Bar
                  key={lang.name}
                  name={lang.name}
                  share={lang.share}
                  color={lang.color}
                  valueLabel={`${Math.round(lang.share * 100)}%`}
                />
              ))}
            </div>
          </div>
        )}

        {repos.length > 0 && (
          <div className="card-section">
            <h3 className="card-section-title">TOP REPOS</h3>
            <ul className="repo-list">
              {repos.map((repo) => (
                <li key={repo.name} className="repo">
                  <span className="repo-name">
                    {repo.language && (
                      <span
                        className="repo-dot"
                        style={{ background: colorForLanguage(repo.language) }}
                      />
                    )}
                    <span className="repo-label">{repo.name}</span>
                    <span className="repo-stars">★ {repo.stars}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {achievements.length > 0 && (
          <div className="card-section">
            <h3 className="card-section-title">ACHIEVEMENTS</h3>
            <div className="badges">
              {achievements.map((a) => (
                <div
                  className="badge"
                  key={a.name}
                  style={{ borderColor: a.color }}
                  title={a.desc}
                >
                  <span className="badge-icon">{a.icon}</span>
                  <span className="badge-name" style={{ color: a.color }}>
                    {a.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="card-foot">{SITE_NAME}</div>
      </div>
    );
  },
);
