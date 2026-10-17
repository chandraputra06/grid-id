"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

// Panel "Data Pendukung Analisis AI" untuk layar Verifikasi supervisor.
// Pakai: <AnalysisDossier reportId={r.id} />
const LEVEL_CLS = {
  tinggi: "bg-risk-kritis/10 text-risk-kritis",
  sedang: "bg-risk-waspada/10 text-risk-waspada",
  rendah: "bg-risk-aman/10 text-risk-aman",
};

export default function AnalysisDossier({ reportId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!reportId) return;
    let alive = true;
    setLoading(true);
    setErr("");
    api
      .get(`/api/analysis/report/${reportId}`)
      .then((d) => alive && setData(d))
      .catch((e) => alive && setErr(e?.message || "Gagal memuat analisis."))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [reportId]);

  if (loading) return <p className="py-4 text-center font-body-md text-[13px] text-on-surface-variant">Memuat analisis…</p>;
  if (err) return <p className="rounded-lg bg-risk-kritis/10 px-3 py-2 text-[13px] font-semibold text-risk-kritis">{err}</p>;
  if (!data) return null;

  const { ai, asset, prior_reports = [], inspections = [], maximo, narrative, risk_factors = [], recommendations = [] } = data;

  return (
    <div className="space-y-4 rounded-2xl border border-outline-variant bg-surface-container-low p-4">
      <h3 className="flex items-center gap-2 font-heading text-sm font-bold text-on-surface">
        <span className="material-symbols-outlined text-[18px] text-brand">neurology</span> Data Pendukung Analisis AI
      </h3>

      {/* Klasifikasi AI + faktor risiko */}
      <div className="rounded-xl bg-card-surface p-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-[12px] font-bold text-brand">
            {ai?.label || "Belum terklasifikasi"}
          </span>
          {ai?.model_version && <span className="text-[11px] text-on-surface-variant">model {ai.model_version}</span>}
        </div>
        {risk_factors.length > 0 && (
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {risk_factors.map((f) => (
              <div key={f.label} className="rounded-lg border border-outline-variant/60 p-2">
                <p className="text-[10px] uppercase tracking-wide text-on-surface-variant">{f.label}</p>
                <div className="mt-0.5 flex items-center justify-between gap-1">
                  <span className="font-heading text-[14px] font-bold text-on-surface">{f.value}</span>
                  <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase ${LEVEL_CLS[f.level] || ""}`}>{f.level}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Narasi */}
      {narrative && (
        <div className="rounded-xl bg-card-surface p-3">
          <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">Ringkasan Analisis</p>
          <p className="font-body-md text-[13px] leading-relaxed text-on-surface">{narrative}</p>
        </div>
      )}

      <div className="grid gap-3 lg:grid-cols-2">
        {/* Aset + riwayat laporan */}
        <div className="rounded-xl bg-card-surface p-3">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">Aset & Riwayat Laporan</p>
          {asset ? (
            <p className="mb-2 font-body-md text-[12px] text-on-surface">
              {asset.name || asset.type || "—"} · SN {asset.serial_number || "—"}
              {asset.unit ? ` · ${asset.unit}` : ""}
            </p>
          ) : (
            <p className="mb-2 font-body-md text-[12px] text-on-surface-variant">Aset belum terhubung.</p>
          )}
          {prior_reports.length === 0 ? (
            <p className="font-body-md text-[12px] text-on-surface-variant">Tidak ada laporan sebelumnya.</p>
          ) : (
            <ul className="space-y-1">
              {prior_reports.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-2 text-[12px]">
                  <span className="truncate text-on-surface">{r.note || "(tanpa catatan)"}</span>
                  <span className="shrink-0 text-on-surface-variant">{fmt(r.created_at)}</span>
                </li>
              ))}
            </ul>
          )}
          {inspections.length > 0 && (
            <div className="mt-2 border-t border-outline-variant/60 pt-2">
              <p className="mb-1 text-[10px] uppercase tracking-wide text-on-surface-variant">Inspeksi lapangan</p>
              <ul className="space-y-1">
                {inspections.map((i) => (
                  <li key={i.id} className="flex items-center justify-between gap-2 text-[12px]">
                    <span className="truncate text-on-surface">{i.device_type || "—"}{i.score != null ? ` · skor ${i.score}` : ""}</span>
                    <span className="shrink-0 text-on-surface-variant">{fmt(i.created_at)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* MAXIMO */}
        <div className="rounded-xl bg-card-surface p-3">
          <p className="mb-2 flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">
            Riwayat MAXIMO
            <span className="rounded bg-outline-variant/40 px-1 py-0.5 text-[8px] font-bold text-on-surface-variant">DUMMY</span>
          </p>
          <p className="mb-2 font-body-md text-[12px] text-on-surface">
            PM terakhir {maximo?.last_pm || "—"} · {maximo?.failures_12m ?? 0} kegagalan/12 bln
          </p>
          {maximo?.wo?.length ? (
            <ul className="space-y-1">
              {maximo.wo.map((w) => (
                <li key={w.wo_id} className="flex items-center justify-between gap-2 text-[12px]">
                  <span className="truncate text-on-surface">{w.wo_id} · {w.type}</span>
                  <span className="shrink-0 text-on-surface-variant">{w.date}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="font-body-md text-[12px] text-on-surface-variant">Belum ada work order.</p>
          )}
        </div>
      </div>

      {/* Rekomendasi */}
      {recommendations.length > 0 && (
        <div className="rounded-xl border border-brand/20 bg-brand/5 p-3">
          <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-brand">Rekomendasi Tindakan</p>
          <ul className="list-disc space-y-1 pl-5">
            {recommendations.map((r, idx) => (
              <li key={idx} className="font-body-md text-[13px] text-on-surface">{r}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function fmt(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "2-digit" });
  } catch {
    return "—";
  }
}