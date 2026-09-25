"use client";
import { useState, useMemo } from "react";
import { PetaMap } from "@/components/peta-map";

const semuaZona = [
  {
    id: 1,
    nama: "Trafo TR-104 · Cawang",
    level: "kritis",
    skor: 78,
    ket: "Kabel kendur + hotspot + hujan lebat",
  },
  {
    id: 2,
    nama: "Gardu GD-212 · Sesetan",
    level: "waspada",
    skor: 61,
    ket: "Korosi sedang + angin kencang",
  },
  {
    id: 3,
    nama: "Tiang TG-556 · Pedungan",
    level: "waspada",
    skor: 44,
    ket: "Vegetasi dekat kabel",
  },
  {
    id: 4,
    nama: "Trafo TR-088 · Renon",
    level: "aman",
    skor: 22,
    ket: "Kondisi normal",
  },
];
const meta = {
  kritis: {
    label: "Kritis",
    dot: "bg-risk-kritis",
    text: "text-risk-kritis",
    edge: "border-l-risk-kritis",
  },
  waspada: {
    label: "Waspada",
    dot: "bg-risk-waspada",
    text: "text-risk-waspada",
    edge: "border-l-risk-waspada",
  },
  aman: {
    label: "Aman",
    dot: "bg-risk-aman",
    text: "text-risk-aman",
    edge: "border-l-risk-aman",
  },
};
const rank = { kritis: 0, waspada: 1, aman: 2 };

export default function MonitoringPeta() {
  const [filter, setFilter] = useState("semua"); // semua | kritis | waspada | aman

  const zona = useMemo(() => {
    const data =
      filter === "semua"
        ? semuaZona
        : semuaZona.filter((z) => z.level === filter);
    return [...data].sort(
      (a, b) => rank[a.level] - rank[b.level] || b.skor - a.skor,
    ); // urut kritis→aman, lalu skor tertinggi
  }, [filter]);

  const chips = [
    { key: "semua", label: "Semua", n: semuaZona.length },
    {
      key: "kritis",
      label: "Kritis",
      n: semuaZona.filter((z) => z.level === "kritis").length,
    },
    {
      key: "waspada",
      label: "Waspada",
      n: semuaZona.filter((z) => z.level === "waspada").length,
    },
    {
      key: "aman",
      label: "Aman",
      n: semuaZona.filter((z) => z.level === "aman").length,
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-heading text-2xl font-extrabold text-on-surface">
          Monitoring — Peta Risiko Aset
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Filter & urutkan aset berdasarkan tingkat risiko.
        </p>
      </div>

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
                active
                  ? "border-brand bg-brand text-white"
                  : "border-outline-variant bg-card-surface text-on-surface-variant hover:bg-surface-container-low"
              }`}
            >
              {c.key !== "semua" && (
                <span
                  className={`h-2.5 w-2.5 rounded-full ${col} ${active ? "ring-2 ring-white/40" : ""}`}
                />
              )}
              {c.label}
              <span
                className={`rounded-full px-1.5 text-[11px] ${active ? "bg-white/20" : "bg-surface-container-low"}`}
              >
                {c.n}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* PETA (marker berwarna sesuai filter) */}
        <div className="relative h-[460px] overflow-hidden rounded-2xl border border-outline-variant lg:col-span-2">
          {/* TODO: taruh <PetaMap zona={zona} /> di sini — kirim data terfilter sebagai props */}
          <div className="relative h-[460px] overflow-hidden rounded-2xl border border-outline-variant lg:col-span-2">
            <PetaMap zona={zona} />
          </div>
        </div>

        {/* DAFTAR TERURUT */}
        <div className="rounded-2xl border border-outline-variant bg-card-surface p-4 shadow-sm">
          <h2 className="mb-3 font-heading font-bold">
            Daftar Aset ({zona.length})
          </h2>
          <div className="space-y-2">
            {zona.map((z) => (
              <div
                key={z.id}
                className={`rounded-xl border-l-4 bg-surface-container-low p-3 ${meta[z.level].edge}`}
              >
                <div className="mb-1 flex items-center justify-between">
                  <h3 className="font-heading text-sm font-bold">{z.nama}</h3>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold text-white ${meta[z.level].dot}`}
                  >
                    {meta[z.level].label}
                  </span>
                </div>
                <p className="font-body-md text-[12px] text-on-surface-variant">
                  {z.ket}
                </p>
                <p
                  className={`mt-1 font-heading text-xs font-bold ${meta[z.level].text}`}
                >
                  Skor {z.skor}%
                </p>
              </div>
            ))}
            {zona.length === 0 && (
              <p className="py-6 text-center text-sm text-on-surface-variant">
                Tidak ada aset pada level ini.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
