"use client";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { PetaMap } from "@/components/peta-map";

const meta = {
  kritis: { label: "Kritis", dot: "bg-risk-kritis", text: "text-risk-kritis", edge: "border-l-risk-kritis" },
  waspada: { label: "Waspada", dot: "bg-risk-waspada", text: "text-risk-waspada", edge: "border-l-risk-waspada" },
  aman: { label: "Aman", dot: "bg-risk-aman", text: "text-risk-aman", edge: "border-l-risk-aman" },
};
const rank = { kritis: 0, waspada: 1, aman: 2 };

function ketText(it) {
  const parts = [];
  if (it.severity_component) parts.push("kerusakan");
  if (it.weather_component) parts.push("cuaca");
  if (it.density_component) parts.push("kepadatan");
  return parts.length ? `Faktor: ${parts.join(" + ")}` : "Kondisi normal";
}

export default function MonitoringPeta() {
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [filter, setFilter] = useState("semua"); // semua | kritis | waspada | aman

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const d = await api.get("/api/prioritas");
      const mapped = (Array.isArray(d) ? d : []).map((it) => {
        const a = it.asset || {};
        return {
          id: it.asset_id || a.id,
          nama: a.unit ? `${a.name || a.asset_code} · ${a.unit}` : a.name || a.asset_code,
          level: it.level || "aman",
          skor: Math.round(it.score || 0),
          ket: ketText(it),
          lat: a.lat,
          lng: a.lng,
        };
      });
      setAll(mapped);
    } catch (e) {
      setErr(e?.message || "Gagal memuat data monitoring.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const zona = useMemo(() => {
    const data = filter === "semua" ? all : all.filter((z) => z.level === filter);
    return [...data].sort((a, b) => rank[a.level] - rank[b.level] || b.skor - a.skor);
  }, [filter, all]);

  const chips = [
    { key: "semua", label: "Semua", n: all.length },
    { key: "kritis", label: "Kritis", n: all.filter((z) => z.level === "kritis").length },
    { key: "waspada", label: "Waspada", n: all.filter((z) => z.level === "waspada").length },
    { key: "aman", label: "Aman", n: all.filter((z) => z.level === "aman").length },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-heading text-2xl font-extrabold text-on-surface">Monitoring — Peta Risiko Aset</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">Filter &amp; urutkan aset berdasarkan tingkat risiko.</p>
      </div>

      {err && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-outline-variant bg-risk-kritis/5 p-4">
          <p className="text-[13px] font-semibold text-risk-kritis">{err}</p>
          <button onClick={load} className="rounded-full bg-brand px-4 py-1.5 text-[13px] font-bold text-white hover:brightness-110">Coba lagi</button>
        </div>
      )}

      {/* FILTER CHIPS */}
      <div className="flex flex-wrap gap-2">
        {chips.map((c) => {
          const active = filter === c.key;
          const col = c.key === "semua" ? "" : meta[c.key]?.dot;
          return (
            <button
              key={c.key}
              onClick={() => setFilter(c.key)}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 font-heading text-sm font-bold transition-colors ${
                active ? "border-brand bg-brand text-white" : "border-outline-variant bg-card-surface text-on-surface-variant hover:bg-surface-container-low"
              }`}
            >
              {c.key !== "semua" && <span className={`h-2.5 w-2.5 rounded-full ${col} ${active ? "ring-2 ring-white/40" : ""}`} />}
              {c.label}
              <span className={`rounded-full px-1.5 text-[11px] ${active ? "bg-white/20" : "bg-surface-container-low"}`}>{c.n}</span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* PETA */}
        <div className="relative h-[460px] overflow-hidden rounded-2xl border border-outline-variant lg:col-span-2">
          {loading ? (
            <div className="grid h-full place-items-center font-body-md text-body-md text-on-surface-variant">Memuat peta…</div>
          ) : (
            <PetaMap zona={zona} />
          )}
        </div>

        {/* DAFTAR TERURUT */}
        <div className="rounded-2xl border border-outline-variant bg-card-surface p-4 shadow-sm">
          <h2 className="mb-3 font-heading font-bold">Daftar Aset ({zona.length})</h2>
          <div className="max-h-[420px] space-y-2 overflow-y-auto">
            {loading ? (
              <p className="py-6 text-center text-sm text-on-surface-variant">Memuat…</p>
            ) : (
              zona.map((z) => (
                <a
                  key={z.id}
                  href={`/dashboard/gardu?id=${z.id || ""}`}
                  className={`block rounded-xl border-l-4 bg-surface-container-low p-3 transition hover:bg-surface-container ${meta[z.level].edge}`}
                >
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <h3 className="font-heading text-sm font-bold">{z.nama}</h3>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold text-white ${meta[z.level].dot}`}>{meta[z.level].label}</span>
                  </div>
                  <p className="font-body-md text-[12px] text-on-surface-variant">{z.ket}</p>
                  <p className={`mt-1 font-heading text-xs font-bold ${meta[z.level].text}`}>Skor {z.skor}%</p>
                </a>
              ))
            )}
            {!loading && zona.length === 0 && <p className="py-6 text-center text-sm text-on-surface-variant">Tidak ada aset pada level ini.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}