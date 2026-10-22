"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { PetaMap } from "@/components/peta-map";

const LEVEL = {
  kritis: { label: "KRITIS", tone: "bg-risk-kritis", text: "text-risk-kritis", box: "border-risk-kritis/30 bg-risk-kritis/5", icon: "warning" },
  waspada: { label: "WASPADA", tone: "bg-risk-waspada", text: "text-risk-waspada", box: "border-risk-waspada/30 bg-risk-waspada/5", icon: "trending_up" },
  aman: { label: "AMAN", tone: "bg-risk-aman", text: "text-risk-aman", box: "border-risk-aman/30 bg-risk-aman/5", icon: "check_circle" },
};

// Tingkat risiko cuaca dari faktor BMKG (angin & hujan).
function riskFromFactors(f) {
  const angin = f.angin_max_kmh || 0;
  if (angin >= 40 || (f.hujan && angin >= 25)) return { riskLabel: "Tinggi", riskTone: "text-risk-kritis" };
  if (f.hujan || angin >= 25) return { riskLabel: "Menengah", riskTone: "text-risk-waspada" };
  return { riskLabel: "Rendah", riskTone: "text-risk-aman" };
}

export default function AdminBeranda() {
  const [data, setData] = useState(null);
  const [points, setPoints] = useState([]);
  const [reportsGeo, setReportsGeo] = useState([]);
  const [weather, setWeather] = useState(null); // null = memuat
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  async function loadWeather(areas) {
    if (!areas.length) {
      setWeather([]);
      return;
    }
    const results = await Promise.all(
      areas.map(async (ar) => {
        try {
          const w = await api.get(`/api/cuaca?adm4=${encodeURIComponent(ar.adm4)}`);
          const f = w?.factors || {};
          const near = (w?.forecast || [])[0] || {};
          return {
            adm4: ar.adm4,
            label: ar.label,
            temp: f.suhu_avg != null ? Math.round(f.suhu_avg) : near.t ?? null,
            desc: near.weather_desc || (f.hujan ? "Hujan" : "—"),
            ...riskFromFactors(f),
          };
        } catch {
          return null;
        }
      })
    );
    setWeather(results.filter(Boolean));
  }

  async function load() {
    setLoading(true);
    setErr("");
    setWeather(null);
    try {
      const d = await api.get("/api/dashboard");
      setData(d);
    } catch (e) {
      setErr(e?.message || "Gagal memuat data dashboard.");
    } finally {
      setLoading(false);
    }
    // Peta + cuaca (opsional, tidak memblok dashboard bila gagal)
    api
      .get("/api/dashboard/geojson")
      .then((g) => {
        const feats = g?.features || [];
        const pts = feats
          .map((f) => {
            const p = f.properties || {};
            const [lng, lat] = f.geometry?.coordinates || [];
            return {
              id: p.id,
              nama: p.name || p.asset_code,
              level: p.level || "aman",
              skor: p.score != null ? Math.round(p.score) : null,
              ket: [p.unit, p.asset_type].filter(Boolean).join(" · "),
              lat,
              lng,
            };
          })
          .filter((z) => z.lat != null && z.lng != null);
        setPoints(pts);

        // adm4 unik (maks 3) untuk kartu cuaca
        const seen = new Set();
        const areas = [];
        for (const f of feats) {
          const p = f.properties || {};
          if (p.adm4 && !seen.has(p.adm4)) {
            seen.add(p.adm4);
            areas.push({ adm4: p.adm4, label: p.unit || p.name || p.adm4 });
            if (areas.length >= 3) break;
          }
        }
        loadWeather(areas);
      })
      .catch(() => {
        setWeather([]);
      });

    // Laporan ber-koordinat untuk overlay peta (opsional)
    api
      .get("/api/map/reports")
      .then((g) => {
        const feats = g?.features || [];
        setReportsGeo(
          feats
            .map((f) => {
              const p = f.properties || {};
              const [lng, lat] = f.geometry?.coordinates || [];
              return { id: p.id, status: p.status, source: p.source, description: p.description, photo_url: p.photo_url, created_at: p.created_at, lat, lng };
            })
            .filter((r) => r.lat != null && r.lng != null)
        );
      })
      .catch(() => {});
  }

  useEffect(() => {
    load();
  }, []);

  const total = data?.total_aset || 0;
  const lv = data?.by_level || { kritis: 0, waspada: 0, aman: 0 };
  const gridLevel = lv.kritis > 0 ? "kritis" : lv.waspada > 0 ? "waspada" : "aman";
  const health = total ? Math.round((lv.aman / total) * 100) : 0;
  const kritisList = data?.aset_terkritis || [];
  const updated = data?.generated_at ? new Date(data.generated_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : null;
  const isPetugas = data?.scope === "petugas";
  const scopeLabel = isPetugas ? "Wilayah Tugas" : "Ringkasan Nasional";

  const kpis = [
    { label: isPetugas ? "Aset Wilayah Tugas" : "Total Aset Dipantau", value: String(total), unit: "", icon: "hub", tone: "text-brand", sub: `${data?.deteksi_7hari || 0} deteksi 7 hari terakhir`, subTone: "text-on-surface-variant" },
    { label: "Status Grid", value: LEVEL[gridLevel].label, unit: "", icon: "verified_user", tone: LEVEL[gridLevel].text, sub: `${lv.aman}/${total} aset normal`, subTone: "text-on-surface-variant" },
    { label: "AI Health Score", value: String(health), unit: "/100", icon: "neurology", tone: "text-brand", sub: `${lv.kritis} kritis · ${lv.waspada} waspada`, subTone: "text-on-surface-variant" },
  ];

  if (loading) {
    return <p className="py-16 text-center font-body-md text-body-md text-on-surface-variant">Memuat data dashboard…</p>;
  }
  if (err) {
    return (
      <div className="mx-auto max-w-lg space-y-3 rounded-2xl border border-outline-variant bg-card-surface p-6 text-center shadow-sm">
        <p className="rounded-lg bg-risk-kritis/10 px-3 py-2 text-[13px] font-semibold text-risk-kritis">{err}</p>
        <button onClick={load} className="rounded-full bg-brand px-5 py-2 font-label-bold text-label-bold text-white hover:brightness-110">Coba lagi</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-extrabold text-on-surface">
          {isPetugas ? "Dashboard Wilayah Tugas" : "Dashboard Ringkasan Nasional"}
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          {isPetugas ? "Pantauan aset dan laporan pada wilayah tugas Anda." : "Pantauan kesehatan jaringan listrik nasional."}
          {updated ? ` Diperbarui pukul ${updated}.` : ""}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kpis.map((k) => (
          <div key={k.label} className="flex items-start gap-4 rounded-2xl border border-outline-variant bg-card-surface p-5 shadow-sm">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand/10">
              <span className={`material-symbols-outlined ${k.tone}`} style={{ fontVariationSettings: "'FILL' 1" }}>{k.icon}</span>
            </span>
            <div className="min-w-0">
              <span className="font-heading text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">{k.label}</span>
              <div className="mt-1 font-heading text-3xl font-extrabold text-on-surface">
                {k.value}<span className="ml-1 text-base font-bold text-on-surface-variant">{k.unit}</span>
              </div>
              <p className={`mt-0.5 font-body-md text-[13px] ${k.subTone}`}>{k.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-outline-variant bg-card-surface p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-bold">Peta Topologi Grid</h2>
            <span className="font-label-sm text-label-sm text-on-surface-variant">{scopeLabel}</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-4 border-b border-outline-variant pb-3 font-body-md text-[12px] text-on-surface-variant">
            <span>Total: <b className="text-on-surface">{total}</b></span>
            <span>Kritis: <b className="text-risk-kritis">{lv.kritis}</b></span>
            <span>Waspada: <b className="text-risk-waspada">{lv.waspada}</b></span>
            <span>Aman: <b className="text-risk-aman">{lv.aman}</b></span>
          </div>
          <div className="mt-3 h-[440px] overflow-hidden rounded-xl">
            {points.length > 0 || reportsGeo.length > 0 ? (
              <PetaMap zona={points} laporan={reportsGeo} />
            ) : (
              <div className="grid h-full place-items-center bg-gradient-to-br from-surface-container-low to-surface-container text-on-surface-variant">
                <div className="text-center">
                  <span className="material-symbols-outlined text-5xl text-brand">public</span>
                  <p className="mt-2 font-body-md text-[13px]">
                    {isPetugas ? "Belum ada aset/laporan berkoordinat pada wilayah tugas Anda." : "Belum ada aset dengan koordinat untuk dipetakan."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="rounded-2xl border border-outline-variant bg-card-surface p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-bold">Kondisi Cuaca</h2>
            <span className="rounded-full bg-surface-container-low px-2 py-0.5 font-label-sm text-label-sm text-on-surface-variant">Sumber: BMKG</span>
          </div>
          <ul className="mt-4 space-y-3">
            {weather === null ? (
              <li className="rounded-xl bg-surface-container-low p-3 text-center font-body-md text-[12px] text-on-surface-variant">Memuat cuaca…</li>
            ) : weather.length === 0 ? (
              <li className="rounded-xl bg-surface-container-low p-3 text-center font-body-md text-[12px] text-on-surface-variant">Data cuaca belum tersedia.</li>
            ) : (
              weather.map((w) => (
                <li key={w.adm4} className="flex items-center justify-between rounded-xl bg-surface-container-low p-3">
                  <div className="min-w-0">
                    <p className="truncate font-heading text-sm font-bold">{w.label}</p>
                    <p className="font-body-md text-[12px] text-on-surface-variant">{w.desc} · Risiko: <span className={w.riskTone}>{w.riskLabel}</span></p>
                  </div>
                  <span className="font-heading text-2xl font-extrabold text-brand">{w.temp != null ? `${w.temp}°` : "—"}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      <div className="rounded-2xl border border-outline-variant bg-card-surface p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-heading text-lg font-bold">
            <span className="material-symbols-outlined text-brand">neurology</span> Sistem Kesehatan Prediktif AI
          </h2>
          <a href="/dashboard/prioritas" className="font-heading text-sm font-bold text-brand hover:underline">Lihat Prioritas Lengkap →</a>
        </div>
        <div className="space-y-3">
          {kritisList.length === 0 ? (
            <p className="rounded-xl bg-risk-aman/10 px-4 py-3 font-body-md text-[13px] font-semibold text-risk-aman">
              Tidak ada aset berisiko tinggi saat ini. Semua aset dalam kondisi aman.
            </p>
          ) : (
            kritisList.map((a) => {
              const m = LEVEL[a.level] || LEVEL.aman;
              return (
                <div key={a.asset_id} className={`flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center ${m.box}`}>
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-white ${m.tone}`}>
                    <span className="material-symbols-outlined text-[20px]">{m.icon}</span>
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-heading text-sm font-bold">{a.name}</h3>
                      <span className="rounded-full bg-surface-container-low px-2 py-0.5 text-[10px] font-bold text-on-surface-variant">{a.asset_code}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold text-white ${m.tone}`}>{m.label}</span>
                    </div>
                    <p className="font-body-md text-[13px] text-on-surface-variant">Skor risiko {a.score} dari 100.</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end">
                    <a href={`/dashboard/prioritas`} className="font-heading text-sm font-bold text-brand hover:underline">Lihat Rekomendasi</a>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}