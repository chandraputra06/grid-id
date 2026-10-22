"use client";
// Batang vertikal satu seri (hitungan per hari). Ujung batang membulat, jarak 2px antar batang.
import { useEffect, useRef, useState } from "react";

export function DailyBars({ rows, valueKey, label, height = 160 }) {
  const wrap = useRef(null);
  const [w, setW] = useState(600);
  const [hover, setHover] = useState(null);
  useEffect(() => {
    if (!wrap.current) return undefined;
    const ro = new ResizeObserver(([e]) => setW(Math.max(260, Math.round(e.contentRect.width))));
    ro.observe(wrap.current);
    return () => ro.disconnect();
  }, []);
  const data = rows || [];
  const max = Math.max(1, ...data.map((r) => r[valueKey] || 0));
  const pad = { l: 28, r: 8, t: 10, b: 22 };
  const iw = w - pad.l - pad.r;
  const ih = height - pad.t - pad.b;
  const bw = data.length ? iw / data.length : iw;
  const every = Math.ceil(data.length / Math.max(1, Math.floor(iw / 56)));

  return (
    <div ref={wrap} className="relative">
      {!data.length ? (
        <div className="grid place-items-center rounded-xl bg-surface-container-low text-[13px] text-on-surface-variant" style={{ height }}>Belum ada data {label.toLowerCase()} pada periode ini.</div>
      ) : (
        <svg width="100%" height={height} viewBox={`0 0 ${w} ${height}`} role="img" aria-label={`Grafik ${label} per hari`} onMouseLeave={() => setHover(null)}>
          {[0, 0.5, 1].map((k) => (
            <g key={k}>
              <line x1={pad.l} x2={w - pad.r} y1={pad.t + ih * (1 - k)} y2={pad.t + ih * (1 - k)} stroke="var(--color-outline-variant)" strokeDasharray="2 4" />
              <text x={pad.l - 4} y={pad.t + ih * (1 - k) + 4} textAnchor="end" fontSize="10" fill="var(--color-on-surface-variant)">{Math.round(max * k)}</text>
            </g>
          ))}
          {data.map((r, i) => {
            const v = r[valueKey] || 0;
            const h = (v / max) * ih;
            const x = pad.l + i * bw + 1;
            const bwi = Math.max(2, bw - 2);
            return (
              <g key={r.date} onMouseEnter={() => setHover({ r, x: x + bwi / 2 })}>
                <rect x={pad.l + i * bw} y={pad.t} width={bw} height={ih} fill="transparent" />
                {v > 0 && <rect x={x} y={pad.t + ih - h} width={bwi} height={h} rx={Math.min(4, bwi / 2)} fill="var(--color-brand)" opacity={hover && hover.r.date !== r.date ? 0.55 : 1} />}
                {i % every === 0 && (
                  <text x={x + bwi / 2} y={height - 6} textAnchor="middle" fontSize="10" fill="var(--color-on-surface-variant)">
                    {new Date(`${r.date}T00:00:00`).toLocaleDateString("id-ID", { day: "2-digit", month: "short" })}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      )}
      {hover && (
        <div className="pointer-events-none absolute top-0 rounded-lg border border-outline-variant bg-card-surface px-2.5 py-1.5 shadow-md" style={{ left: `${Math.min(Math.max((hover.x / w) * 100, 6), 78)}%` }}>
          <p className="font-heading text-sm font-extrabold">{hover.r[valueKey] || 0} {label.toLowerCase()}</p>
          <p className="font-body-md text-[11px] text-on-surface-variant">{new Date(`${hover.r.date}T00:00:00`).toLocaleDateString("id-ID", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}</p>
        </div>
      )}
    </div>
  );
}
