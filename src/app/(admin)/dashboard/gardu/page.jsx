"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

const WARNA = { kritis: "#E5484D", waspada: "#F4B740", aman: "#21A366" };
const LVL = { kritis: "Kritis", waspada: "Waspada", aman: "Aman" };
const TOL = {
  kritis: { text: "Toleransi: Tangani < 24 jam", tone: "bg-risk-kritis/10 text-risk-kritis", icon: "warning" },
  waspada: { text: "Toleransi: Jadwalkan pemeliharaan", tone: "bg-risk-waspada/10 text-risk-waspada", icon: "schedule" },
  aman: { text: "Kondisi normal", tone: "bg-risk-aman/10 text-risk-aman", icon: "check_circle" },
};
const DEFECT = { isolator_pecah: "Isolator pecah", korosi: "Korosi", kabel_bermasalah: "Kabel bermasalah", komponen_hilang: "Komponen hilang" };

function prioMeta(p) {
  if (p >= 3) return { label: "Mendesak", tone: "bg-risk-kritis" };
  if (p === 2) return { label: "Tinggi", tone: "bg-risk-waspada" };
  return { label: "Normal", tone: "bg-risk-aman" };
}

function coords(a) {
  if (!a || a.lat == null || a.lng == null) return "Belum diatur";
  return `${Number(a.lat).toFixed(4)}, ${Number(a.lng).toFixed(4)}`;
}

function scanBody(rek) {
  if (!rek) return "Memuat deteksi…";
  if (!rek.recommendations?.length) {
    return `Belum ada kerusakan terdeteksi dalam ${rek.window_days ?? 7} hari terakhir (${rek.detections_total ?? 0} deteksi).`;
  }
  const top = rek.recommendations
    .slice(0, 2)
    .map((r) => `${DEFECT[r.defect] || r.defect}${r.confidence != null ? ` (conf ${Number(r.confidence).toFixed(2)})` : ""}`)
    .join(", ");
  return `YOLO: ${top}. Total ${rek.detections_total} deteksi, ${rek.defects_found} jenis.`;
}

function cuacaBody(c) {
  if (c === undefined) return "Memuat prakiraan…";
  if (!c) return "Prakiraan cuaca tidak tersedia.";
  const f = c.factors || {};
  const near = (c.forecast || [])[0] || {};
  return `${near.weather_desc || (f.hujan ? "Hujan" : "Cerah")} · angin ${f.angin_max_kmh ?? "–"} km/j · suhu ${f.suhu_avg != null ? Math.round(f.suhu_avg) : "–"}°.`;
}

function maximoBody(m) {
  if (!m) return "Data MAXIMO belum tersedia untuk aset ini.";
  return `Grade: ${(m.condition_grade || "").toUpperCase()} · skor ${m.condition_score ?? "–"} · pemeliharaan berikutnya ${m.next_maintenance_date || "–"} (tanpa persen).`;
}

export default function DetailAset() {
  const [assetId, setAssetId] = useState(null);
  const [detail, setDetail] = useState(null); // { asset, maximo, risk_score }
  const [rek, setRek] = useState(null);
  const [cuaca, setCuaca] = useState(undefined); // undefined=memuat, null=gagal
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("id");
    setAssetId(id);
    if (!id) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const d = await api.get(`/api/assets/${id}`);
        setDetail(d);
        if (d?.asset?.adm4) {
          api.get(`/api/cuaca?adm4=${encodeURIComponent(d.asset.adm4)}`).then(setCuaca).catch(() => setCuaca(null));
        } else {
          setCuaca(null);
        }
      } catch (e) {
        setErr(e?.message || "Gagal memuat detail aset.");
      } finally {
        setLoading(false);
      }
      api.get(`/api/rekomendasi/${id}`).then(setRek).catch(() => setRek({ recommendations: [] }));
    })();
  }, []);

  if (!assetId) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-outline-variant bg-card-surface p-8 text-center shadow-sm">
        <span className="material-symbols-outlined text-5xl text-on-surface-variant">inventory_2</span>
        <p className="mt-2 font-body-md text-body-md text-on-surface-variant">Pilih aset dari halaman Prioritas untuk melihat detailnya.</p>
        <a href="/dashboard/prioritas" className="mt-4 inline-block rounded-full bg-brand px-5 py-2 font-label-bold text-label-bold text-white hover:brightness-110">Ke Prioritas Aset</a>
      </div>
    );
  }

  if (loading) return <p className="py-16 text-center font-body-md text-body-md text-on-surface-variant">Memuat detail aset…</p>;
  if (err) {
    return <p className="mx-auto max-w-lg rounded-lg bg-risk-kritis/10 px-3 py-2 text-center text-[13px] font-semibold text-risk-kritis">{err}</p>;
  }

  const asset = detail?.asset || {};
  const maximo = detail?.maximo || null;
  const rs = detail?.risk_score || null;
  const level = rs?.level || "aman";
  const score = rs?.score != null ? Math.round(rs.score) : null;
  const warna = WARNA[level];
  const tol = TOL[level];

  const drivers = rek?.recommendations?.length
    ? rek.recommendations.slice(0, 3).map((r) => DEFECT[r.defect] || r.defect).join(" + ")
    : "kondisi gabungan sensor & cuaca";

  const sumber = [
    { icon: "photo_camera", tone: "text-brand", title: "Scan Visual (RGB)", body: scanBody(rek), roadmap: false, box: "border-outline-variant" },
    { icon: "device_thermostat", tone: "text-risk-kritis", title: "Thermal (titik panas)", body: "Sensor termal IoT — roadmap integrasi.", roadmap: true, box: "border-outline-variant" },
    { icon: "rainy", tone: "text-risk-waspada", title: "Cuaca BMKG", body: cuacaBody(cuaca), roadmap: false, box: "border-outline-variant" },
    { icon: "database", tone: "text-accent", title: "Output MAXIMO", body: maximoBody(maximo), roadmap: false, box: "border-accent/40 bg-accent/5" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="flex items-center gap-1 font-body-md text-[13px] text-on-surface-variant">
          <a href="/dashboard/prioritas" className="hover:text-brand">Prioritas Aset</a>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span> {asset.name || asset.asset_code}
        </p>
        <h1 className="mt-1 font-heading text-2xl font-extrabold text-on-surface">Detail Aset — {asset.name || asset.asset_code}{asset.unit ? ` (${asset.unit})` : ""}</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">Fusion scan + BMKG + thermal + MAXIMO per identitas aset — decision-support untuk PLN.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border-2 border-brand bg-card-surface shadow-sm">
        <div className="flex items-center justify-between bg-brand px-5 py-3 text-white">
          <h2 className="flex items-center gap-2 font-heading font-extrabold"><span className="material-symbols-outlined">inventory_2</span>Ringkasan Kondisi</h2>
          <span className="rounded-full bg-white/20 px-3 py-1 text-xs">{score != null ? `${score}% · ${LVL[level]}` : "Belum diskor"}</span>
        </div>
        <div className="grid gap-5 p-5 lg:grid-cols-3">
          <div className="space-y-4">
            <div className="rounded-xl bg-surface-container-low p-4">
              <p className="mb-2 font-heading text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Identitas Aset</p>
              <div className="space-y-1 text-sm">
                {[["Nama", asset.name || "–"], ["Kode", asset.asset_code || "–"], ["Tipe", asset.asset_type || "–"], ["Unit", asset.unit || "–"], ["Koordinat", coords(asset)], ["Kritikalitas", asset.criticality || "–"]].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3"><span className="text-on-surface-variant">{k}</span><b className="text-right">{v}</b></div>
                ))}
              </div>
            </div>
            <div className="rounded-xl bg-surface-container-low p-4 text-center">
              <p className="mb-2 font-heading text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Kondisi GRID·ID</p>
              <div className="relative mx-auto grid h-36 w-36 place-items-center rounded-full" style={{ background: `conic-gradient(${warna} 0% ${score ?? 0}%, #e0e2e7 ${score ?? 0}% 100%)` }}>
                <div className="grid h-28 w-28 place-items-center rounded-full bg-card-surface">
                  <div>
                    <div className="font-heading text-4xl font-extrabold">{score ?? "–"}<span className="text-lg">%</span></div>
                    <div className="text-[11px] text-on-surface-variant">kondisi {LVL[level].toLowerCase()}</div>
                  </div>
                </div>
              </div>
              <div className={`mt-3 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${tol.tone}`}>
                <span className="material-symbols-outlined text-[16px]">{tol.icon}</span>{tol.text}
              </div>
            </div>
          </div>

          <div className="space-y-4 lg:col-span-2">
            <p className="font-heading text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Sumber Data yang Digabung (per identitas aset)</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {sumber.map((s) => (
                <div key={s.title} className={`relative rounded-xl border p-4 ${s.box}`}>
                  {s.roadmap && <span className="absolute right-3 top-3 rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold text-accent">ROADMAP</span>}
                  <div className="mb-1 flex items-center gap-2">
                    <span className={`material-symbols-outlined text-[20px] ${s.tone}`}>{s.icon}</span>
                    <b className="font-heading text-sm">{s.title}</b>
                  </div>
                  <p className="font-body-md text-[13px] text-on-surface-variant">{s.body}</p>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-accent/40 bg-accent/5 p-4">
              <p className="mb-2 flex items-center gap-1 font-heading text-sm font-bold text-accent">
                <span className="material-symbols-outlined text-[18px]">difference</span>Yang GRID·ID tambahkan (gap MAXIMO)
              </p>
              <div className="grid gap-3 text-[13px] sm:grid-cols-2">
                <div className="rounded-lg bg-card-surface p-3">
                  <p className="mb-1 text-on-surface-variant">MAXIMO</p>
                  <p>{maximo ? <><b>"{(maximo.condition_grade || "").toUpperCase()}"</b> — tanpa persen, tanpa toleransi, tidak bisa mengurutkan prioritas antar-aset.</> : "Belum ada data MAXIMO untuk aset ini."}</p>
                </div>
                <div className="rounded-lg bg-card-surface p-3">
                  <p className="mb-1 text-on-surface-variant">GRID·ID</p>
                  <p>{score != null ? <><b>{score}% — {LVL[level]}</b>, {tol.text.replace("Toleransi: ", "").toLowerCase()} karena <b>{drivers}</b> bertumpuk.</> : "Aset belum memiliki skor (belum ada deteksi/laporan)."}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button className="flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 font-heading text-sm font-bold text-white">
                <span className="material-symbols-outlined text-[18px]">assignment</span>Terbitkan Work Order
              </button>
              <button className="flex items-center gap-2 rounded-full border border-outline-variant px-5 py-2.5 font-heading text-sm font-bold">
                <span className="material-symbols-outlined text-[18px]">ios_share</span>Ekspor ke MAXIMO
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Rekomendasi Tindakan (SPK) */}
      <div className="rounded-2xl border border-outline-variant bg-card-surface p-5 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 font-heading text-lg font-bold">
          <span className="material-symbols-outlined text-brand">checklist</span> Rekomendasi Tindakan (SPK)
        </h2>
        {!rek ? (
          <p className="font-body-md text-[13px] text-on-surface-variant">Memuat rekomendasi…</p>
        ) : !rek.recommendations?.length ? (
          <p className="rounded-xl bg-risk-aman/10 px-4 py-3 font-body-md text-[13px] font-semibold text-risk-aman">Tidak ada tindakan yang diperlukan — belum ada kerusakan terdeteksi.</p>
        ) : (
          <div className="space-y-3">
            {rek.recommendations.map((r, i) => {
              const pm = prioMeta(r.priority);
              return (
                <div key={r.rule_id || i} className="flex flex-col gap-2 rounded-xl border border-outline-variant p-4 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <b className="font-heading text-sm">{DEFECT[r.defect] || r.defect}</b>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold text-white ${pm.tone}`}>{pm.label}</span>
                      {r.count ? <span className="rounded-full bg-surface-container-low px-2 py-0.5 text-[10px] font-bold text-on-surface-variant">×{r.count}</span> : null}
                    </div>
                    <p className="mt-1 font-body-md text-[13px] text-on-surface-variant">{r.action_text}</p>
                  </div>
                  <div className="shrink-0 text-right font-body-md text-[12px] text-on-surface-variant">
                    {r.severity != null ? <>severity {Math.round(r.severity)}<br /></> : null}
                    {r.confidence != null ? `conf ${Number(r.confidence).toFixed(2)}` : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}