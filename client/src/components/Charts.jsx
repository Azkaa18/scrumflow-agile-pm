/** Dependency-free SVG charts that inherit colours from CSS variables. */

export function BarChart({ data, height = 220, format = (v) => v, color = 'var(--primary)' }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const w = 100 / Math.max(1, data.length);
  return (
    <div className="chart">
      <svg viewBox={`0 0 100 ${height / 3}`} preserveAspectRatio="none" style={{ width: '100%', height }}>
        {[0.25, 0.5, 0.75].map((t) => (
          <line key={t} x1="0" x2="100" y1={(height / 3) * t} y2={(height / 3) * t} className="grid-line" />
        ))}
        {data.map((d, i) => {
          const h = ((height / 3 - 4) * d.value) / max;
          return (
            <rect key={d.label} x={i * w + w * 0.18} width={w * 0.64} y={height / 3 - h} height={h} rx="0.8" fill={color}>
              <title>{`${d.label}: ${format(d.value)}`}</title>
            </rect>
          );
        })}
      </svg>
      <div className="chart-labels">
        {data.map((d) => (
          <span key={d.label}>{d.label}</span>
        ))}
      </div>
    </div>
  );
}

export function LineChart({ series, labels, height = 220 }) {
  const all = series.flatMap((s) => s.values);
  const max = Math.max(1, ...all);
  const H = 60;
  const pt = (v, i, n) => `${(i / Math.max(1, n - 1)) * 100},${H - (v / max) * (H - 4)}`;
  return (
    <div className="chart">
      <svg viewBox={`0 0 100 ${H}`} preserveAspectRatio="none" style={{ width: '100%', height }}>
        {[0.25, 0.5, 0.75].map((t) => (
          <line key={t} x1="0" x2="100" y1={H * t} y2={H * t} className="grid-line" />
        ))}
        {series.map((s) => (
          <polyline
            key={s.name}
            fill="none"
            stroke={s.color}
            strokeWidth="0.8"
            strokeDasharray={s.dashed ? '2 1.5' : undefined}
            vectorEffect="non-scaling-stroke"
            style={{ strokeWidth: 2.5 }}
            points={s.values.map((v, i) => pt(v, i, labels.length || s.values.length)).join(' ')}
          />
        ))}
      </svg>
      <div className="chart-labels">
        {labels.map((l) => (
          <span key={l}>{l}</span>
        ))}
      </div>
      <div className="legend">
        {series.map((s) => (
          <span key={s.name}>
            <i style={{ background: s.color }} /> {s.name}
          </span>
        ))}
      </div>
    </div>
  );
}

export function Donut({ data, size = 160 }) {
  const total = data.reduce((a, d) => a + d.value, 0) || 1;
  const r = 15.915;
  let offset = 25;
  return (
    <div className="donut-wrap">
      <svg viewBox="0 0 42 42" width={size} height={size}>
        <circle cx="21" cy="21" r={r} fill="none" className="donut-track" strokeWidth="5" />
        {data.map((d) => {
          const pct = (d.value / total) * 100;
          const el = (
            <circle
              key={d.label}
              cx="21"
              cy="21"
              r={r}
              fill="none"
              stroke={d.color}
              strokeWidth="5"
              strokeDasharray={`${pct} ${100 - pct}`}
              strokeDashoffset={offset}
            >
              <title>{`${d.label}: ${Math.round(pct)}%`}</title>
            </circle>
          );
          offset -= pct;
          return el;
        })}
      </svg>
      <ul className="legend vertical">
        {data.map((d) => (
          <li key={d.label}>
            <i style={{ background: d.color }} /> {d.label} <b>{Math.round((d.value / total) * 100)}%</b>
          </li>
        ))}
      </ul>
    </div>
  );
}
