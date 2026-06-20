import { colorForLanguage } from "@/lib/colors";
import type { CardData } from "@/lib/types";
import { Bar } from "./Bar";

export function ProfileSections({ data }: { data: CardData }) {
  return (
    <div className="sections">
      {data.bio && (
        <section className="panel">
          <h3 className="panel-title">BIO</h3>
          <p className="bio-text">{data.bio}</p>
        </section>
      )}

      {data.languages.length > 0 && (
        <section className="panel">
          <h3 className="panel-title">TOP LANGUAGES</h3>
          <div className="bars">
            {data.languages.map((lang) => (
              <Bar
                key={lang.name}
                name={lang.name}
                share={lang.share}
                color={lang.color}
                title={`${Math.round(lang.share * 100)}%`}
              />
            ))}
          </div>
        </section>
      )}

      {data.topRepos.length > 0 && (
        <section className="panel">
          <h3 className="panel-title">TOP REPOS</h3>
          <ul className="repo-list">
            {data.topRepos.map((repo) => (
              <li key={repo.name} className="repo">
                <a
                  className="repo-name"
                  href={`https://github.com/${data.username}/${repo.name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {repo.language && (
                    <span
                      className="repo-dot"
                      style={{ background: colorForLanguage(repo.language) }}
                    />
                  )}
                  {repo.name}
                  <span className="repo-stars">★ {repo.stars}</span>
                </a>
                {repo.description && (
                  <p className="repo-desc">{repo.description}</p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {data.achievements.length > 0 && (
        <section className="panel">
          <h3 className="panel-title">ACHIEVEMENTS</h3>
          <div className="badges">
            {data.achievements.map((a) => (
              <div
                key={a.name}
                className="badge"
                title={a.desc}
                style={{ borderColor: a.color }}
              >
                <span className="badge-icon">{a.icon}</span>
                <span className="badge-name" style={{ color: a.color }}>
                  {a.name}
                </span>
                <span className="badge-desc">{a.desc}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="panel">
        <h3 className="panel-title">STAT DETAILS</h3>
        <ul className="stat-details">
          {data.statBars.map((s) => (
            <li key={s.name}>
              <span className="stat-name" style={{ color: s.color }}>
                {s.name}
              </span>
              <span className="stat-dots" />
              <span className="stat-value">{s.value.toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
