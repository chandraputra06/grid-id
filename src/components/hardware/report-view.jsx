"use client";
// Laporan hardware (Supervisor & Business Portal). Ekspor CSV di sisi klien + Cetak/PDF via dialog cetak browser.
import { useMemo, useState } from "react";
import { ALERT_CATEGORY, dayEndIso, dayStartIso, defectLabel, downloadCSV, fmtDateTime, isoToDateInput, qs, toCSV, useApi } from "@/lib/hardware";
import { Card, ErrorBox, GhostButton, Loading, PrimaryButton, Select, SimBadge, StatCard, Table, Td, TextInput } from "./ui";
import { DailyBars } from "./bar-chart";

export function ReportView({ apiBase, unitOptions = [], audience = "supervisor", orgName }) {
  const [from, setFrom] = useState(isoToDateInput(new Date(Date.now() - 29 * 864e5).toISOString()));
  const [to, setTo] = useState(isoToDateInput(new Date().toISOString()));
  const [unit, setUnit] = useState("");
  const path = `${apiBase}/report${qs({ from: dayStartIso(from), to: dayEndIso(to), unit })}`;
  const { data, error, loading, reload } = useApi(path);

  const periodLabel = useMemo(() => (data ? `${fmtDateTime(data.from, true)} – ${fmtDateTime(data.to, true)}` : ""), [data]);
  const s = data && data.summary;

  function exportAssets() {
    const csv = toCSV(data.assets, [
      { label: "Kode aset", value: (r) => (r.asset ? r.asset.asset_code : "") },
      { label: "Nama aset", value: (r) => (r.asset ? r.asset.name : "Tanpa aset") },
      { label: "Lokasi", value: (r) => (r.asset ? r.asset.unit : "") },
      { label: "Perangkat", value: "devices" },
      { label: "Inspeksi AI", value: "inspections" },
      { label: "Deteksi AI", value: "detections" },
      { label: "Kelas terdeteksi", value: (r) => Object.entries(r.defects).map(([k, v]) => `${defectLabel(k)}:${v}`).join("; ") },
      { label: "Peringatan", value: "alerts" },
      { label: "Peringatan terbuka", value: "open_alerts" },
      { label: "Inspeksi terakhir", value: "last_inspection_at" },
    ]);
    downloadCSV(`laporan-hardware-aset_${from}_${to}.csv`, csv);
  }
  function exportDaily() {
    const csv = toCSV(data.daily, [
      { label: "Tanggal", value: "date" }, { label: "Inspeksi AI", value: "inspections" }, { label: "Deteksi AI", value: "detections" }, { label: "Peringatan baru", value: "alerts" },
    ]);
    downloadCSV(`laporan-hardware-harian_${from}_${to}.csv`, csv);
  }

  return (
    <div className="space-y-6 hw-report">
      <style>{`@media print { aside, nav, header, [data-print-hide] { display: none !important; } .hw-report { padding: 0 !important; } body { background: #fff; } }`}</style>
      <div className="grid grid-cols-1 gap-3 rounded-2xl border border-outline-variant bg-card-surface p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-5" data-print-hide>
        <TextInput label="Dari tanggal" type="date" value={from} onChange={setFrom} />
        <TextInput label="Sampai tanggal" type="date" value={to} onChange={setTo} />
        <Select label="Lokasi / unit" value={unit} onChange={setUnit}>
          <option value="">Semua lokasi</option>
          {unitOptions.map((u) => <option key={u} value={u}>{u}</option>)}
        </Select>
        <div className="flex items-end gap-2 lg:col-span-2">
          <PrimaryButton icon="download" onClick={exportAssets} disabled={!data}>CSV per aset</PrimaryButton>
          <GhostButton icon="download" onClick={exportDaily} disabled={!data}>CSV harian</GhostButton>
          <GhostButton icon="print" onClick={() => window.print()} disabled={!data}>Cetak / PDF</GhostButton>
        </div>
      </div>

      <ErrorBox message={error} onRetry={reload} />
      {loading && !data ? (
        <Loading text="Menyusun laporan…" />
      ) : data ? (
        <>
          <div className="rounded-2xl border border-outline-variant bg-card-surface p-5 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-heading text-lg font-bold text-on-surface">Ringkasan {audience === "b2b" ? "layanan" : "operasional"} hardware</h2>
              <SimBadge show={data.contains_simulated_data} />
            </div>
            <p className="font-body-md text-[13px] text-on-surface-variant">
              {orgName ? `${orgName} · ` : ""}Periode {periodLabel}{data.unit ? ` · ${data.unit}` : ""} · dibuat {fmtDateTime(data.generated_at)}
            </p>
            <p className="mt-2 rounded-lg bg-surface-container-low px-3 py-2 font-body-md text-[12px] text-on-surface-variant">
              Angka berasal langsung dari data perangkat & hasil model AI. {s.detections_verified} dari {s.detections} deteksi telah diverifikasi manusia; sisanya adalah indikasi model yang belum diverifikasi.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Inspeksi AI selesai" value={s.inspections} icon="fact_check" />
            <StatCard label="Gambar RGB diterima" value={s.rgb_frames} icon="photo_camera" sub={s.upload_failed ? `${s.upload_failed} upload gagal` : undefined} />
            <StatCard label="Hasil deteksi AI" value={s.detections} icon="neurology" tone="text-risk-waspada bg-risk-waspada/10" />
            <StatCard label="Peringatan" value={s.alerts} icon="notifications_active" tone="text-risk-kritis bg-risk-kritis/10" sub={`${s.alerts_by_status.selesai} selesai · ${s.alerts_by_status.baru + s.alerts_by_status.ditinjau} terbuka`} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card title="Inspeksi AI per hari" icon="bar_chart"><DailyBars rows={data.daily} valueKey="inspections" label="Inspeksi" /></Card>
            <Card title="Peringatan baru per hari" icon="bar_chart"><DailyBars rows={data.daily} valueKey="alerts" label="Peringatan" /></Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card title="Temuan AI per kelas" icon="category">
              {data.detections_by_class.length === 0 ? (
                <p className="font-body-md text-[13px] text-on-surface-variant">Tidak ada deteksi pada periode ini.</p>
              ) : (
                <Table head={["Kelas", "Jumlah", "Rata-rata confidence", "Terverifikasi"]} minWidth={420}>
                  {data.detections_by_class.map((c) => (
                    <tr key={c.defect} className="border-b border-outline-variant/60">
                      <Td className="font-semibold">{defectLabel(c.defect)}</Td><Td>{c.count}</Td>
                      <Td>{c.avg_confidence != null ? `${Math.round(c.avg_confidence * 100)}%` : "—"}</Td><Td>{c.verified}</Td>
                    </tr>
                  ))}
                </Table>
              )}
            </Card>
            <Card title="Peringatan per kategori & status perangkat" icon="notifications">
              <ul className="space-y-1.5">
                {Object.entries(s.alerts_by_category).length === 0 && <li className="font-body-md text-[13px] text-on-surface-variant">Tidak ada peringatan pada periode ini.</li>}
                {Object.entries(s.alerts_by_category).map(([k, v]) => (
                  <li key={k} className="flex items-center justify-between rounded-lg bg-surface-container-low px-3 py-1.5 font-body-md text-[13px]">
                    <span>{(ALERT_CATEGORY[k] || { label: k }).label}</span><b>{v}</b>
                  </li>
                ))}
              </ul>
              <p className="mt-3 font-body-md text-[12px] text-on-surface-variant">
                Status perangkat saat ini: {s.connection.online} online · {s.connection.late} terlambat · {s.connection.offline} offline · {s.connection.never} belum ada data (total {s.devices}).
              </p>
            </Card>
          </div>

          <Card title="Rincian per aset" icon="inventory_2">
            <Table head={["Aset", "Lokasi", "Perangkat", "Inspeksi", "Deteksi", "Kelas terdeteksi", "Peringatan (terbuka)", "Inspeksi terakhir"]} minWidth={900}>
              {data.assets.map((r) => (
                <tr key={r.asset ? r.asset.id : "none"} className="border-b border-outline-variant/60">
                  <Td className="font-semibold">{r.asset ? `${r.asset.name} (${r.asset.asset_code})` : "Perangkat tanpa aset"}</Td>
                  <Td>{(r.asset && r.asset.unit) || "—"}</Td><Td>{r.devices}</Td><Td>{r.inspections}</Td><Td>{r.detections}</Td>
                  <Td>{Object.keys(r.defects).length ? Object.entries(r.defects).map(([k, v]) => `${defectLabel(k)} (${v})`).join(", ") : "—"}</Td>
                  <Td>{r.alerts} ({r.open_alerts})</Td>
                  <Td>{fmtDateTime(r.last_inspection_at)}</Td>
                </tr>
              ))}
            </Table>
          </Card>
        </>
      ) : null}
    </div>
  );
}
