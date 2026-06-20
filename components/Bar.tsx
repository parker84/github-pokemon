export function Bar({
  name,
  share,
  color,
  valueLabel,
  title,
}: {
  name: string;
  share: number;
  color: string;
  valueLabel?: string;
  title?: string;
}) {
  return (
    <div className="bar-row" title={title}>
      <span className="lang">{name.toUpperCase()}</span>
      <span className="bar-track">
        <span
          className="bar-fill"
          style={{
            width: `${Math.max(4, Math.round(share * 100))}%`,
            background: color,
            boxShadow: `0 0 6px ${color}`,
          }}
        />
      </span>
      {valueLabel != null && <span className="bar-value">{valueLabel}</span>}
    </div>
  );
}
