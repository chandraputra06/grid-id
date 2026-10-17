"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

const LVL = {
  kritis: { label: "Kritis", tone: "text-risk-kritis bg-risk-kritis/10" },
  waspada: { label: "Waspada", tone: "text-risk-waspada bg-risk-waspada/10" },
  aman: { label: "Aman", tone: "text-risk-aman bg-risk-aman/10" },
};

const GRADE = {
  buruk: { label: "BURUK", tone: "text-risk-kritis bg-risk-kritis/10" },
  sedang: { label: "SEDANG", tone: "text-risk-waspada bg-risk-waspada/10" },
  baik: { label: "BAIK", tone: "text-risk-aman bg-risk-aman/10" },
};

const SEV_LVL = { aman: 0, waspada: 1, kritis: 2 };
const SEV_GRADE = { baik: 0, sedang: 1, buruk: 2 };

function coords(a) {
  if (a?.lat == null || a?.lng == null) return "Koordinat belum diatur";
  return `${Number(a.lat).toFixed(4)}, ${Number(a.lng).toFixed(4)}`;
}

function factors(item) {
  const f = [];
  if (item.severity_component) f.push(`Kerusakan ${Math.round(item.severity_component)}`);
  if (item.weather_component) f.push(`Cuaca BMKG ${Math.round(item.weather_component)}`);
  if (item.density_component) f.push(`Kepadatan ${Math.round(item.density_component)}`);
  if (f.length === 0) f.push("Kondisi normal");
  return f;
}

export default function PrioritasAset() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const d = await api.get("/api/prioritas");
      setList(Array.isArray(d) ? d : []);
    } catch (e) {
      setErr(e?.message || "Gagal memuat data prioritas.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const kritis = list.filter((x) => x.level === "kritis").length;
  const waspada = list.filter((x) => x.level === "waspada").length;
  let naik = 0;
  for (const it of list) {
    if (it.maximo && (SEV_LVL[it.level] ?? 0) > (SEV_GRADE[it.maximo.condition_grade] ?? 0)) naik += 1;
  }

  const kpis = [
    { icon: "warning", tone: "text-risk-kritis bg-risk-kritis/10", label: "Aset Kritis", value: String(kritis), sub: "Tangani < 24 jam" },
    { icon: "schedule", tone: "text-risk-waspada bg-risk-waspada/10", label: "Perlu Dijadwalkan", value: String(waspada), sub: "Waspada" },
    { icon: "difference", tone: "text-brand bg-brand/10", label: "Selisih vs MAXIMO", value: String(naik), sub: "aset naik prioritas" },
    { icon: "inventory_2", tone: "text-risk-aman bg-risk-aman/10", label: "Aset Terpantau", value: String(list.length), sub: "Total aset" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-extrabold text-on-surface">Prioritas Antar-Aset</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          GRID·ID menggabungkan scan visual, cuaca BMKG, thermal, dan output MAXIMO per identitas aset — menghasilkan skor detail (%) dan urutan prioritas yang tidak dimiliki MAXIMO.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="flex items-start gap-3 rounded-2xl border border-outline-variant bg-card-surface p-5 shadow-sm">
            <span className={`grid h-11 w-11 place-items-center rounded-xl ${k.tone}`}>
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{k.icon}</span>
            </span>
            <div>
              <p className="font-heading text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">{k.label}</p>
              <p className="font-heading text-3xl font-extrabold text-on-surface">{loading ? "…" : k.value}</p>
              <p className="font-body-md text-[12px] text-on-surface-variant">{k.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-outline-variant bg-card-surface shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant p-4">
          <h2 className="font-heading font-bold">Daftar Prioritas — GRID·ID vs MAXIMO</h2>
          <span className="flex items-center gap-1 font-body-md text-[12px] text-on-surface-variant">
            <span className="material-symbols-outlined text-[16px] text-accent">info</span>
            MAXIMO hanya beri "baik/buruk"; GRID·ID beri % + urutan.
          </span>
        </div>

        {err && (
          <div className="flex items-center justify-between gap-3 border-b border-outline-variant bg-risk-kritis/5 p-4">
            <p className="text-[13px] font-semibold text-risk-kritis">{err}</p>
            <button onClick={load} className="rounded-full bg-brand px-4 py-1.5 text-[13px] font-bold text-white hover:brightness-110">Coba lagi</button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead>
              <tr className="border-b border-outline-variant font-heading text-[11px] uppercase tracking-wider text-on-surface-variant">
                <th className="p-4">#</th>
                <th className="p-4">Aset (Nama · Koordinat)</th>
                <th className="p-4">Skor MAXIMO</th>
                <th className="p-4">Skor GRID·ID</th>
                <th className="p-4">Faktor Pendorong</th>
                <th className="p-4">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="p-8 text-center font-body-md text-on-surface-variant">Memuat data prioritas…</td></tr>
              ) : list.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center font-body-md text-on-surface-variant">Belum ada aset untuk diprioritaskan.</td></tr>
              ) : (
                list.map((item, i) => {
                  const a = item.asset || {};
                  const assetId = item.asset_id || a.id || "";
                  const lv = LVL[item.level] || LVL.aman;
                  const grade = item.maximo ? GRADE[item.maximo.condition_grade] : null;
                  const rank = i + 1;
                  return (
                    <tr key={assetId || i} className={`border-b border-outline-variant/60 hover:bg-surface-container-low ${rank === 1 ? "bg-brand/5" : ""}`}>
                      <td className="p-4">
                        <span className={`grid h-7 w-7 place-items-center rounded-full font-heading font-bold ${lv.tone}`}>{rank}</span>
                      </td>
                      <td className="p-4">
                        <p className="font-heading font-bold">{a.name || a.asset_code || "Aset"}</p>
                        <p className="font-body-md text-[12px] text-on-surface-variant">{[a.unit, coords(a)].filter(Boolean).join(" · ")}</p>
                      </td>
                      <td className="p-4">
                        {grade ? (
                          <>
                            <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${grade.tone}`}>{grade.label}</span>
                            <p className="mt-1 font-body-md text-[11px] text-on-surface-variant">baik/buruk saja</p>
                          </>
                        ) : (
                          <span className="font-body-md text-[12px] text-on-surface-variant">—</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <b className="font-heading text-lg">{Math.round(item.score)}%</b>
                          <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${lv.tone}`}>{lv.label}</span>
                        </div>
                      </td>
                      <td className="p-4 font-body-md text-[12px] text-on-surface-variant">
                        {factors(item).map((x) => (
                          <span key={x} className="mb-1 mr-1 inline-block rounded bg-surface-container-low px-2 py-0.5">{x}</span>
                        ))}
                      </td>
                      <td className="p-4">
                        {assetId ? (
                          <a href={`/dashboard/gardu?id=${encodeURIComponent(assetId)}`} className="font-heading text-sm font-bold text-brand hover:underline">Detail →</a>
                        ) : (
                          <span className="font-body-md text-[12px] text-on-surface-variant">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}