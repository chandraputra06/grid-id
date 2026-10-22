"use client";
// Grafik garis satu seri (satu metrik per grafik — tidak ada dual-axis).
// SVG murni tanpa dependensi baru. Garis putus bila ada jeda data panjang
// (perangkat offline) sehingga tidak terlihat seolah-olah ada data.
import { useEffect, useMemo, useRef, useState } from "react";
import { fmtDateTime, fmtNum } from "@/lib/hardware";

const PAD = { l: 44, r: 12, t: 12, b: 26 };

function niceTicks(min, max, count = 4) {
  if (min === max) {
    min -= 1;
    max += 1;
  }
  const span = max - min;
  const step0 = span / count;
  const mag = 10 ** Math.floor(Math.log10(step0));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= step0) || step0;
  const lo = Math.floor(min / step) * step;
  const hi = Math.ceil(max / step) * step;
  const out = [];
  for (let v = lo; v <= hi + step / 2; v += step) out.push(Math.round(v * 1000) / 1000);
  return out;
}

export function SensorChart({ rows, metric, unit = "", digits = 1, height = 190, threshold = null, label, timeKey = "captured_at" }) {
  const wrap = useRef(null);
  const [w, setW] = useState(600);
  const [hover, setHover] = useState(null);

  useEffect(() => {
    if (!wrap.current) return undefined;
    const ro = new ResizeObserver(([e]) => setW(Math.max(260, Math.round(e.contentRect.width))));
    ro.observe(wrap.current);
    return () => ro.disconnect();
  }, []);

  const pts = useMemo(
    () =>
      (rows || [])
        .filter((r) => r[metric] !== null && r[metric] !== undefined && Number.isFinite(Number(r[metric])))
        .map((r) => ({ t: Date.parse(r[timeKey]), v: Number(r[metric]), row: r }))
        .filter((p) => Number.isFinite(p.t))
        .sort((a, b) => a.t - b.t),
    [rows, metric, timeKey]
  );

  return (
    <div ref={wrap} className="relative">
      {pts.length ? (
        <ChartBody pts={pts} w={w} height={height} threshold={threshold} digits={digits} unit={unit} label={label || metric} hover={hover} setHover={setHover} />
      ) : (
        <div className="grid place-items-center rounded-xl bg-surface-container-low text-center" style={{ height }}>
          <p className="px-4 font-body-md text-[13px] text-on-surface-variant">Belum ada data {label ? label.toLowerCase() : "untuk metrik ini"} pada rentang waktu ini.</p>
        </div>
      )}
    </div>
  );
}

function ChartBody({ pts, w, height, threshold, digits, unit, label, hover, setHover }) {
  const tMin = pts[0].t;
  const tMax = pts[pts.length - 1].t === tMin ? tMin + 60000 : pts[pts.length - 1].t;
  const vals = pts.map((p) => p.v);
  if (threshold !== null && threshold !== undefined) vals.push(Number(threshold));
  const ticks = niceTicks(Math.min(...vals), Math.max(...vals));
  const yMin = ticks[0];
  const yMax = ticks[ticks.length - 1];
  const iw = w - PAD.l - PAD.r;
  const ih = height - PAD.t - PAD.b;
  const x = (t) => PAD.l + ((t - tMin) / (tMax - tMin)) * iw;
  const y = (v) => PAD.t + ih - ((v - yMin) / (yMax - yMin || 1)) * ih;

  // Jeda > 5x median interval => putus garis
  const gaps = pts.slice(1).map((p, i) => p.t - pts[i].t).sort((a, b) => a - b);
  const median = gaps.length ? gaps[Math.floor(gaps.length / 2)] : 0;
  const breakMs = Math.max(median * 5, 5 * 60000);
  let d = "";
  pts.forEach((p, i) => {
    const cmd = i === 0 || p.t - pts[i - 1].t > breakMs ? "M" : "L";
    d += `${cmd}${x(p.t).toFixed(1)},${y(p.v).toFixed(1)}`;
  });

  const xTickCount = Math.max(2, Math.min(5, Math.floor(iw / 120)));
  const xTicks = Array.from({ length: xTickCount }, (_, i) => tMin + ((tMax - tMin) * i) / (xTickCount - 1));
  const spanMs = tMax - tMin;
  const xFmt = (t) =>
    new Date(t).toLocaleString("id-ID", spanMs > 2 * 864e5 ? { day: "2-digit", month: "short" } : { hour: "2-digit", minute: "2-digit" });

  function onMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * w;
    const t = tMin + ((px - PAD.l) / iw) * (tMax - tMin);
    let best = pts[0];
    for (const p of pts) if (Math.abs(p.t - t) < Math.abs(best.t - t)) best = p;
    setHover(best);
  }

  const single = pts.length === 1;

  return (
    <>
      <svg width="100%" height={height} viewBox={`0 0 ${w} ${height}`} role="img" aria-label={`Grafik ${label}`}
        onMouseMove={onMove} onMouseLeave={() => setHover(null)} className="touch-none select-none">
        {ticks.map((tv) => (
          <g key={tv}>
            <line x1={PAD.l} x2={w - PAD.r} y1={y(tv)} y2={y(tv)} stroke="var(--color-outline-variant)" strokeWidth="1" strokeDasharray="2 4" />
            <text x={PAD.l - 6} y={y(tv) + 4} textAnchor="end" fontSize="10" fill="var(--color-on-surface-variant)">{fmtNum(tv, Math.abs(yMax - yMin) < 5 ? 1 : 0)}</text>
          </g>
        ))}
        {xTicks.map((t) => (
          <text key={t} x={x(t)} y={height - 8} textAnchor="middle" fontSize="10" fill="var(--color-on-surface-variant)">{xFmt(t)}</text>
        ))}
        {threshold !== null && threshold !== undefined && (
          <g>
            <line x1={PAD.l} x2={w - PAD.r} y1={y(threshold)} y2={y(threshold)} stroke="var(--color-risk-kritis)" strokeWidth="1.5" strokeDasharray="6 4" />
            <text x={w - PAD.r} y={y(threshold) - 4} textAnchor="end" fontSize="10" fontWeight="700" fill="var(--color-risk-kritis)">Ambang {fmtNum(threshold, digits, unit)}</text>
          </g>
        )}
        {single ? (
          <circle cx={x(pts[0].t)} cy={y(pts[0].v)} r="4" fill="var(--color-brand)" />
        ) : (
          <path d={d} fill="none" stroke="var(--color-brand)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        )}
        {hover && (
          <g>
            <line x1={x(hover.t)} x2={x(hover.t)} y1={PAD.t} y2={PAD.t + ih} stroke="var(--color-outline)" strokeWidth="1" />
            <circle cx={x(hover.t)} cy={y(hover.v)} r="5" fill="var(--color-brand)" stroke="var(--color-card-surface)" strokeWidth="2" />
          </g>
        )}
        <rect x={PAD.l} y={PAD.t} width={iw} height={ih} fill="transparent" />
      </svg>
      {hover && (
        <div className="pointer-events-none absolute top-1 rounded-lg border border-outline-variant bg-card-surface px-2.5 py-1.5 shadow-md"
          style={{ left: Math.min(Math.max(x(hover.t) / w * 100, 8), 72) + "%" }}>
          <p className="font-heading text-sm font-extrabold text-on-surface">{fmtNum(hover.v, digits, unit)}</p>
          <p className="font-body-md text-[11px] text-on-surface-variant">{fmtDateTime(new Date(hover.t).toISOString())}</p>
          {hover.row && hover.row.n !== undefined && <p className="font-body-md text-[11px] text-on-surface-variant">rata-rata dari {hover.row.n} data</p>}
        </div>
      )}
    </>
  );
}
