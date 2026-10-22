"use client";
import { useMemo, useState } from "react";
import { defectLabel, fmtDateTime, fmtRelative, pct, qs, rangeFromPreset, useApi } from "@/lib/hardware";
import { Card, Chips, EmptyState, ErrorBox, Loading, PageHeader, RiskBadge, SimBadge, StatCard } from "@/components/hardware/ui";
import { DailyBars } from "@/components/hardware/bar-chart";
import { InspectionsTable } from "@/components/hardware/inspections-table";
import { FrameModal } from "@/components/hardware/frame-modal";
import { MONITORING_STATUS, MonitoringBadge } from "@/components/hardware/asset-status";
import { useBusinessOrg } from "@/components/business-shell";

const API = "/api/business";
const RANGES = [{ key: "7d", label: "7 hari" }, { key: "30d", label: "30 hari" }];

export default function BusinessOverview() {
  const { org } = useBusinessOrg();
  const [range, setRange] = useState("7d");
  const [frameId, setFrameId] = useState(null);
  const r = useMemo(() => rangeFromPreset(range), [range]);
  const ov = useApi(`${API}/overview${qs(r)}`, { intervalMs: 60000 });
  const rep = useApi(`${API}/report${qs(r)}`);
  const d = ov.data;

  return (
    <div className="space-y-6">
      <PageHeader title="Overview" subtitle={`Ringkasan kondisi aset ${org ? org.name : ""} yang dipantau perangkat GRID·ID.`}
        badge={d && <SimBadge show={d.contains_simulated_data} />} actions={<Chips items={RANGES} value={range} onChange={setRange} />} />
      <ErrorBox message={ov.error} onRetry={ov.reload} />
      {ov.loading && !d ? <Loading /> : d ? (
        <>
          {d.assets_total === 0 && (
            <EmptyState icon="inventory_2" title="Belum ada aset yang dapat diakses" text="Admin GRID·ID belum memberikan akses aset ke organisasi Anda. Hubungi tim GRID·ID." />
          )}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Aset yang dapat diakses" value={d.assets_total} icon="location_city" />
            <StatCard label="Total perangkat" value={d.devices_total} icon="memory" sub={`${d.connection.online} online · ${d.connection.offline} offline${d.connection.never ? ` · ${d.connection.never} belum ada data` : ""}`} />
            <StatCard label={`Inspeksi AI (${range === "7d" ? "7" : "30"} hari)`} value={d.inspections} icon="fact_check" sub={`${d.rgb_frames} gambar RGB diterima`} />
            <StatCard label="Peringatan aktif" value={d.open_alerts} icon="notifications_active" tone="text-risk-kritis bg-risk-kritis/10" sub={`${d.detections} hasil deteksi AI pada periode`} />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card title="Tren inspeksi" icon="bar_chart" className="lg:col-span-2">
              {rep.loading && !rep.data ? <Loading /> : <DailyBars rows={(rep.data && rep.data.daily) || []} valueKey="inspections" label="Inspeksi" />}
            </Card>
            <Card title="Ringkasan kondisi aset" icon="donut_small">
              <ul className="space-y-2">
                {Object.keys(MONITORING_STATUS).map((k) => (
                  <li key={k} className="flex items-center justify-between rounded-xl bg-surface-container-low px-3 py-2">
                    <MonitoringBadge s={k} />
                    <span className="font-heading text-lg font-extrabold">{d.assets_by_status[k] || 0}</span>
                  </li>
                ))}
              </ul>
              {rep.data && rep.data.detections_by_class.length > 0 && (
                <>
                  <p className="mt-4 mb-2 font-heading text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Temuan AI pada periode</p>
                  <ul className="space-y-1">
                    {rep.data.detections_by_class.map((c) => (
                      <li key={c.defect} className="flex justify-between font-body-md text-[13px]"><span>{defectLabel(c.defect)}</span><b>{c.count}</b></li>
                    ))}
                  </ul>
                </>
              )}
            </Card>
          </div>

          <Card title="Aset yang membutuhkan tindak lanjut" icon="priority_high" right={<a href="/business/aset" className="font-heading text-sm font-bold text-brand hover:underline">Semua aset →</a>}>
            {d.assets_attention.length === 0 ? (
              <p className="rounded-xl bg-risk-aman/10 px-4 py-3 font-body-md text-[13px] font-semibold text-risk-aman">Tidak ada aset dengan peringatan terbuka atau perangkat offline.</p>
            ) : (
              <ul className="space-y-2">
                {d.assets_attention.map((a) => (
                  <li key={a.asset.id}>
                    <a href={`/business/aset/detail?id=${a.asset.id}`} className="flex flex-wrap items-center gap-3 rounded-xl bg-surface-container-low p-3 transition hover:bg-surface-container">
                      <div className="min-w-0 flex-1">
                        <p className="font-heading text-sm font-bold text-on-surface">{a.asset.name} <span className="font-normal text-on-surface-variant">· {a.asset.asset_code}</span></p>
                        <p className="font-body-md text-[12px] text-on-surface-variant">{a.asset.unit || "—"} · telemetri {fmtRelative(a.last_telemetry_at)}</p>
                      </div>
                      <MonitoringBadge s={a.monitoring_status} />
                      <RiskBadge priority={a.priority} />
                      {a.open_alerts > 0 && <span className="rounded-full bg-risk-kritis px-2 py-0.5 text-[10px] font-bold text-white">{a.open_alerts} peringatan</span>}
                      {a.last_inspection && a.last_inspection.top && (
                        <span className="font-body-md text-[12px] text-on-surface-variant">AI: {defectLabel(a.last_inspection.top.defect)} {pct(a.last_inspection.top.confidence)} · {fmtDateTime(a.last_inspection.captured_at)}</span>
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Inspeksi terbaru" icon="fact_check" right={<a href="/business/riwayat" className="font-heading text-sm font-bold text-brand hover:underline">Riwayat →</a>}>
            <InspectionsTable items={d.recent_inspections} onOpen={setFrameId} deviceHref={(id) => `/business/perangkat/detail?id=${id}`} />
          </Card>
        </>
      ) : null}
      <FrameModal apiBase={API} frameId={frameId} onClose={() => setFrameId(null)} />
    </div>
  );
}
