"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { PetaMap } from "@/components/peta-map";

// data zona: sekarang bawa id, koordinat (lat/lng), dan level huruf-kecil
const zones = [
  { id: 1, name: "Denpasar Selatan", level: "kritis", skor: 78, icon: "warning", note: "Beban puncak + Cuaca Ekstrem", lat: -8.72, lng: 115.235 },
  { id: 2, name: "Denpasar Barat", level: "waspada", skor: 55, icon: "rainy", note: "Hujan lebat diprediksi", lat: -8.66, lng: 115.19 },
  { id: 3, name: "Denpasar Timur", level: "waspada", skor: 50, icon: "forest", note: "Vegetasi dekat kabel", lat: -8.645, lng: 115.25 },
  { id: 4, name: "Denpasar Utara", level: "aman", skor: 20, icon: "check_circle", note: "Kondisi normal", lat: -8.6, lng: 115.215 },
];

const meta = {
  kritis: { label: "KRITIS", tone: "bg-risk-kritis", edge: "border-l-risk-kritis" },
  waspada: { label: "WASPADA", tone: "bg-risk-waspada", edge: "border-l-risk-waspada" },
  aman: { label: "AMAN", tone: "bg-risk-aman", edge: "border-l-risk-aman" },
};
const rank = { kritis: 0, waspada: 1, aman: 2 };

export default function PetaPublik() {
  const [open, setOpen] = useState(true);
  const [filter, setFilter] = useState("semua"); // semua | kritis | waspada | aman

  const zona = useMemo(() => {
    const data = filter === "semua" ? zones : zones.filter((z) => z.level === filter);
    return [...data].sort((a, b) => rank[a.level] - rank[b.level] || b.skor - a.skor);
  }, [filter]);

  const chips = [
    { key: "semua", label: "Semua" },
    { key: "kritis", label: "Kritis" },
    { key: "waspada", label: "Waspada" },
    { key: "aman", label: "Aman" },
  ];

  return (
    <section className="relative h-[calc(100vh-80px)] overflow-hidden">
      <div className="absolute inset-0 z-0">
        <PetaMap zona={zona} />
      </div>

      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="absolute left-3 top-3 z-[500] flex items-center gap-2 rounded-full bg-brand px-4 py-2.5 font-heading text-sm font-bold text-white shadow-lg md:left-6 md:top-6"
        >
          <span className="material-symbols-outlined text-[20px]">list</span> Daftar Zona
        </button>
      )}

      {open && (
        <div className="absolute inset-x-3 bottom-3 z-[500] flex max-h-[58vh] flex-col overflow-hidden rounded-2xl border border-outline-variant bg-card-surface/97 shadow-2xl backdrop-blur md:inset-x-auto md:left-6 md:top-6 md:bottom-auto md:max-h-[calc(100%-3rem)] md:w-[380px]">
          <div className="flex items-start justify-between border-b border-outline-variant bg-surface-container-lowest p-4">
            <div>
              <h2 className="font-heading text-lg font-bold text-on-surface">Zona Risiko Denpasar</h2>
              <p className="mt-1 font-body-md text-[13px] text-on-surface-variant">Klik zona di peta untuk detail · BMKG</p>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Tutup panel" className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-on-surface-variant hover:bg-surface-container-low">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* FILTER berdasarkan level */}
          <div className="border-b border-outline-variant p-3">
            <div className="flex rounded-full bg-surface-container-low p-1">
              {chips.map((c) => (
                <button
                  key={c.key}
                  onClick={() => setFilter(c.key)}
                  className={`flex-1 rounded-full py-1.5 font-heading text-xs font-bold transition-colors ${
                    filter === c.key ? "bg-brand text-white" : "text-on-surface-variant"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {zona.map((z) => (
              <div key={z.id} className={`mb-2 cursor-pointer rounded-lg border-l-4 p-3 transition-colors hover:bg-surface-container-low ${meta[z.level].edge}`}>
                <div className="mb-1 flex items-center justify-between">
                  <h3 className="font-heading text-sm font-bold">{z.name}</h3>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold text-white ${meta[z.level].tone}`}>{meta[z.level].label}</span>
                </div>
                <div className="flex items-center font-body-md text-[13px] text-on-surface-variant">
                  <span className="material-symbols-outlined mr-1 text-[16px]">{z.icon}</span>{z.note}
                </div>
              </div>
            ))}
            {zona.length === 0 && <p className="py-6 text-center text-sm text-on-surface-variant">Tidak ada zona pada level ini.</p>}
          </div>

          <div className="flex items-center justify-between border-t border-outline-variant bg-surface-container-lowest p-3 text-xs">
            {[["bg-risk-aman", "Aman"], ["bg-risk-waspada", "Waspada"], ["bg-risk-kritis", "Kritis"]].map(([c, l]) => (
              <div key={l} className="flex items-center"><span className={`mr-2 h-3 w-3 rounded-full ${c}`} />{l}</div>
            ))}
          </div>
        </div>
      )}

      <div className="absolute bottom-6 left-1/2 z-[400] hidden -translate-x-1/2 md:block">
        <div className="flex items-center gap-4 rounded-full border border-outline-variant bg-card-surface px-6 py-3 shadow-xl">
          <span className="font-body-md text-body-md">Lihat skor lengkap lokasimu</span>
          <Link href="/beranda" className="rounded-full bg-accent px-4 py-1.5 font-heading text-sm font-bold text-white transition-transform hover:-translate-y-0.5">Cek Sekarang</Link>
        </div>
      </div>
    </section>
  );
}