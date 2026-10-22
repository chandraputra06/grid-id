"use client";
// Citra thermal MLX90640 (32x24). Hanya dirender dari matriks suhu asli yang dikirim perangkat.
// Jika perangkat hanya mengirim angka suhu, panel menampilkan angka saja — tidak membuat citra palsu.
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { fmtDateTime, fmtNum } from "@/lib/hardware";
import { EmptyState } from "./ui";

// Ramp sekuensial perseptual (gaya "inferno"): gelap -> terang = dingin -> panas.
const STOPS = [
  [0, [0, 0, 4]], [0.25, [87, 16, 110]], [0.5, [188, 55, 84]], [0.75, [249, 142, 9]], [1, [252, 255, 164]],
];
function color(t) {
  const x = Math.min(1, Math.max(0, t));
  for (let i = 1; i < STOPS.length; i++) {
    if (x <= STOPS[i][0]) {
      const [a, ca] = STOPS[i - 1];
      const [b, cb] = STOPS[i];
      const k = (x - a) / (b - a);
      return ca.map((c, j) => Math.round(c + (cb[j] - c) * k));
    }
  }
  return STOPS[STOPS.length - 1][1];
}
const GRADIENT = `linear-gradient(90deg, ${STOPS.map(([p, c]) => `rgb(${c.join(",")}) ${p * 100}%`).join(", ")})`;

function Heatmap({ m }) {
  const ref = useRef(null);
  const [hover, setHover] = useState(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    const img = ctx.createImageData(m.width, m.height);
    const span = m.max - m.min || 1;
    m.data.forEach((v, i) => {
      const [r, g, b] = color((v - m.min) / span);
      img.data.set([r, g, b, 255], i * 4);
    });
    ctx.putImageData(img, 0, 0);
  }, [m]);

  function onMove(e) {
    const r = e.currentTarget.getBoundingClientRect();
    const x = Math.floor(((e.clientX - r.left) / r.width) * m.width);
    const y = Math.floor(((e.clientY - r.top) / r.height) * m.height);
    if (x >= 0 && y >= 0 && x < m.width && y < m.height) setHover({ x, y, v: m.data[y * m.width + x] });
  }

  return (
    <div>
      <div className="relative overflow-hidden rounded-xl" style={{ aspectRatio: `${m.width} / ${m.height}` }}>
        <canvas ref={ref} width={m.width} height={m.height} onMouseMove={onMove} onMouseLeave={() => setHover(null)}
          className="h-full w-full" style={{ imageRendering: "pixelated" }} aria-label="Citra thermal" />
        <span className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow"
          style={{ left: `${((m.hotspot.x + 0.5) / m.width) * 100}%`, top: `${((m.hotspot.y + 0.5) / m.height) * 100}%` }} title="Hotspot" />
        {hover && (
          <span className="pointer-events-none absolute left-2 top-2 rounded bg-white/90 px-2 py-0.5 text-[11px] font-bold text-on-surface">
            ({hover.x},{hover.y}) {fmtNum(hover.v, 1, "°C")}
          </span>
        )}
      </div>
      <div className="mt-2 flex items-center gap-2 font-body-md text-[11px] text-on-surface-variant">
        <span>{fmtNum(m.min, 1, "°C")}</span>
        <span className="h-2 flex-1 rounded-full" style={{ background: GRADIENT }} />
        <span>{fmtNum(m.max, 1, "°C")}</span>
      </div>
    </div>
  );
}

export function ThermalPanel({ apiBase, frame, telemetry }) {
  const [m, setM] = useState(null);
  const [err, setErr] = useState("");
  const ready = frame && frame.upload_status === "uploaded";

  useEffect(() => {
    setM(null);
    setErr("");
    if (!ready) return;
    api.get(`${apiBase}/frames/${encodeURIComponent(frame.frame_id)}/thermal`).then(setM).catch((e) => setErr(e?.message || "Gagal memuat citra thermal"));
  }, [apiBase, ready, frame && frame.frame_id]); // eslint-disable-line react-hooks/exhaustive-deps

  const t = telemetry || {};
  const numbers = [
    ["Suhu maks.", t.max_temp_c], ["Rata-rata", t.avg_temp_c], ["Selisih", t.delta_temp_c],
  ];
  const hotspot = t.hotspot_x != null && t.hotspot_y != null ? `(${t.hotspot_x}, ${t.hotspot_y})` : "—";

  return (
    <div className="space-y-3">
      {!frame ? (
        <EmptyState compact icon="thermostat" title="Citra thermal belum dikirim perangkat"
          text="Hanya angka suhu dari telemetri yang tersedia. Citra tampil setelah perangkat mengunggah matriks MLX90640 (frame_type: thermal)." />
      ) : !ready ? (
        <EmptyState compact icon={frame.upload_status === "failed" ? "cloud_off" : "hourglass_top"}
          title={frame.upload_status === "failed" ? "Upload citra thermal gagal" : "Menunggu citra thermal"} />
      ) : err ? (
        <EmptyState compact icon="error" title="Citra thermal tidak dapat ditampilkan" text={err} />
      ) : !m ? (
        <div className="grid aspect-[4/3] place-items-center rounded-xl bg-surface-container-low text-[13px] text-on-surface-variant">Memuat citra thermal…</div>
      ) : (
        <>
          <Heatmap m={m} />
          <p className="font-body-md text-[11px] text-on-surface-variant">
            Diambil {fmtDateTime(m.captured_at)} · {m.width}×{m.height} px · hotspot ({m.hotspot.x}, {m.hotspot.y})
          </p>
        </>
      )}
      <div className="grid grid-cols-4 gap-2">
        {numbers.map(([l, v]) => (
          <div key={l} className="rounded-xl bg-surface-container-low p-2 text-center">
            <p className="font-heading text-base font-extrabold text-on-surface">{fmtNum(v, 1)}</p>
            <p className="font-body-md text-[10px] text-on-surface-variant">{l} °C</p>
          </div>
        ))}
        <div className="rounded-xl bg-surface-container-low p-2 text-center">
          <p className="font-heading text-base font-extrabold text-on-surface">{hotspot}</p>
          <p className="font-body-md text-[10px] text-on-surface-variant">Hotspot (x,y)</p>
        </div>
      </div>
      {telemetry && <p className="font-body-md text-[11px] text-on-surface-variant">Angka dari telemetri {fmtDateTime(telemetry.captured_at)}.</p>}
    </div>
  );
}
