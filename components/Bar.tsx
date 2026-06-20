import type { LanguageStat } from "@/lib/types";

export function Bar({ lang }: { lang: LanguageStat }) {
  return (
    <div className="bar-row">
      <span className="lang">{lang.name.toUpperCase()}</span>
      <span className="bar-track">
        <span
          className="bar-fill"
          style={{
            width: `${Math.max(4, Math.round(lang.share * 100))}%`,
            background: lang.color,
            boxShadow: `0 0 6px ${lang.color}`,
          }}
        />
      </span>
    </div>
  );
}
