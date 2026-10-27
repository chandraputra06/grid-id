"use client";
import { useMemo, useState } from "react";
import { CONNECTION, fmtDateTime, fmtRelative, metricMeta, qs, rangeFromPreset, useApi } from "@/lib/hardware";
import {
  AlertPriorityBadge, Card, Chips, ConnectionBadge, EmptyState, ErrorBox, IntegrationBanner, Loading, PageHeader, SimBadge, StatCard,
} from "@/components/hardware/ui";
import { SensorChart } from "@/components/hardware/sensor-chart";
import { InspectionsTable } from "@/components/hardware/inspections-table";
import { FrameModal } from "@/components/hardware/frame-modal";

const API = "/api/hardware";
const RANGES = [
  { key: "24h", label: "24 jam" },
  { key: "7d", label: "7 hari" },
  { key: "30d", label: "30 hari" },
];
const TRENDS = ["max_temp_c", "sound_level_db", "humidity_pct", "gas_raw"];

export default function HardwareOverview() {
  const [range, setRange] = useState("24h");
  const [frameId, setFrameId] = useState(null);
  const r = useMemo(() => rangeFromPreset(range), [range]);
  const ov = useApi(`${API}/overview${qs(r)}`, { intervalMs: 30000 });
  const st = useApi(`${API}/status`, { intervalMs: 60000 });
  const d = ov.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hardware Monitoring"
        subtitle="Pengawasan perangkat GRID·ID di gardu: telemetri sensor, snapshot RGB, citra thermal, dan hasil AI. Alur data: Perangkat → Firebase → Backend GRID·ID → Dashboard."
        badge={d && <SimBadge show={d.contains_simulated_data} />}
        actions={<Chips items={RANGES} value={range} onChange={setRange} />}
      />

      <IntegrationStatus status={st.data} overview={d} />

      <ErrorBox message={ov.error} onRetry={ov.reload} />
      {ov.loading && !d ? (
        <Loading text="Memuat ringkasan hardware…" />
      ) : d ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Perangkat terdaftar" value={d.devices_total} icon="memory" />
            <StatCard label="Perangkat online" value={d.connection.online} icon="wifi" tone="text-risk-aman bg-risk-aman/10" sub={d.connection.late ? `+${d.connection.late} telemetri terlambat` : undefined} />
            <StatCard label="Perangkat offline" value={d.connection.offline} icon="wifi_off" tone="text-risk-kritis bg-risk-kritis/10" sub={d.connection.never ? `${d.connection.never} belum pernah kirim data` : undefined} />
            <StatCard label="Perangkat dengan peringatan aktif" value={d.devices_with_alerts} icon="notifications_active" tone="text-risk-waspada bg-risk-waspada/10" sub={`${d.open_alerts} peringatan terbuka`} />
            <StatCard label="Total inspeksi AI (periode)" value={d.inspections} icon="fact_check" />
            <StatCard label="Gambar RGB diterima (periode)" value={d.rgb_frames} icon="photo_camera" />
            <StatCard label="Hasil deteksi AI (periode)" value={d.detections} icon="neurology" tone="text-risk-waspada bg-risk-waspada/10" />
            <StatCard label="Telemetri terakhir" value={d.last_telemetry_at ? fmtRelative(d.last_telemetry_at) : "—"} icon="sensors" sub={d.last_telemetry_at ? fmtDateTime(d.last_telemetry_at) : "Belum ada telemetri"} />
          </div>

          <Card title="Tren sensor (rata-rata seluruh perangkat)" icon="monitoring"
            right={<span className="font-label-sm text-label-sm text-on-surface-variant">{d.trend.samples} pembacaan valid{d.trend.truncated ? " (5000 terbaru)" : ""}</span>}>
            {d.trend.samples === 0 ? (
              <EmptyState compact icon="sensors_off" title="Belum ada data" text="Belum ada telemetri valid pada periode ini." />
            ) : (
              <div className="grid gap-5 md:grid-cols-2">
                {TRENDS.map((k) => {
                  const m = metricMeta(k);
                  return (
                    <div key={k}>
                      <p className="mb-1 font-heading text-sm font-bold text-on-surface">{m.label} <span className="font-body-md text-[11px] font-normal text-on-surface-variant">({m.unit})</span></p>
                      <SensorChart rows={d.trend[k]} metric="avg" timeKey="t" unit={m.unit} digits={m.digits} label={m.label} height={160} />
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card title="Ringkasan kondisi perangkat" icon="donut_small">
              <ul className="space-y-2">
                {Object.entries(CONNECTION).map(([k, m]) => (
                  <li key={k} className="flex items-center justify-between rounded-xl bg-surface-container-low px-3 py-2">
                    <ConnectionBadge state={k} />
                    <span className="font-heading text-lg font-extrabold">{d.connection[k]}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 mb-2 font-heading text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Peringatan terbuka per prioritas</p>
              <div className="flex gap-2">
                {["tinggi", "sedang", "rendah"].map((p) => (
                  <div key={p} className="flex flex-1 flex-col items-center gap-1 rounded-xl bg-surface-container-low p-2">
                    <AlertPriorityBadge p={p} />
                    <span className="font-heading text-lg font-extrabold">{d.alerts_by_priority[p] || 0}</span>
                  </div>
                ))}
              </div>
            </Card>
            <Card title="Perlu perhatian" icon="priority_high" className="lg:col-span-2"
              right={<a href="/dashboard/hardware/peringatan" className="font-heading text-sm font-bold text-brand hover:underline">Semua peringatan →</a>}>
              {d.attention.length === 0 ? (
                <p className="rounded-xl bg-risk-aman/10 px-4 py-3 font-body-md text-[13px] font-semibold text-risk-aman">Tidak ada perangkat offline atau dengan peringatan terbuka.</p>
              ) : (
                <ul className="space-y-2">
                  {d.attention.map((x) => (
                    <li key={x.id}>
                      <a href={`/dashboard/hardware/perangkat/detail?id=${x.id}`} className="flex flex-wrap items-center gap-3 rounded-xl bg-surface-container-low p-3 transition hover:bg-surface-container">
                        <span className="font-heading text-sm font-bold text-brand">{x.device_code}</span>
                        <span className="min-w-0 flex-1 truncate font-body-md text-[13px] text-on-surface">{x.asset ? `${x.asset.name}${x.asset.unit ? ` · ${x.asset.unit}` : ""}` : "Belum dikaitkan ke aset"}</span>
                        <ConnectionBadge state={x.connection} at={x.last_telemetry_at} />
                        {x.open_alerts > 0 && <span className="rounded-full bg-risk-kritis px-2 py-0.5 text-[10px] font-bold text-white">{x.open_alerts} peringatan</span>}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>

          <Card title="Inspeksi terbaru" icon="fact_check" right={<a href="/dashboard/hardware/inspeksi" className="font-heading text-sm font-bold text-brand hover:underline">Riwayat lengkap →</a>}>
            <InspectionsTable items={d.recent_inspections} onOpen={setFrameId} deviceHref={(id) => `/dashboard/hardware/perangkat/detail?id=${id}`} />
          </Card>
        </>
      ) : null}
      <FrameModal apiBase={API} frameId={frameId} onClose={() => setFrameId(null)} />
    </div>
  );
}

// Status integrasi mencerminkan DUA jalur: adapter REST (Sistem_IoT, dipakai alat saat ini)
// dan bridge firebase-admin lama. "Siap" dinilai dari sumber yang benar-benar aktif + telemetri mengalir.
function IntegrationStatus({ status, overview }) {
  if (!status) return null;
  const fb = status.firebase || {};
  const br = status.bridge || {};
  const ad = status.adapter || {};
  const c = ad.counters || {};

  const adapterActive = !!ad.enabled;
  const telemetryFlowing = (c.telemetry || 0) > 0 || !!br.rtdb_connected || !!(overview && overview.last_telemetry_at);
  // Data dianggap mengalir bila adapter aktif & ada telemetri, atau bridge lama terhubung.
  const receiving = (adapterActive && telemetryFlowing) || (!!br.enabled && !!br.rtdb_connected);

  const items = [
    {
      label: "Sumber data (Firebase RTDB)",
      ok: adapterActive || !!br.rtdb_connected,
      text: adapterActive ? "Adapter polling aktif" : br.rtdb_connected ? "Terhubung" : fb.status === "initialized" ? "Siap" : "Belum aktif",
    },
    {
      label: "Aliran telemetri",
      ok: telemetryFlowing,
      text: overview && overview.last_telemetry_at
        ? `Terakhir ${fmtRelative(overview.last_telemetry_at)}`
        : c.telemetry ? `${c.telemetry} pembacaan tersimpan` : "Belum ada data masuk",
    },
    {
      label: "Backend ingest",
      ok: adapterActive || !!br.enabled,
      text: adapterActive ? "Adapter aktif" : br.enabled ? `${br.devices_attached} perangkat (bridge)` : br.reason || ad.reason || "Tidak aktif",
    },
    {
      label: "Layanan AI (YOLO)",
      ok: !!(status.ai_service && status.ai_service.configured),
      text: status.ai_service && status.ai_service.configured ? "Terkonfigurasi" : "GRID_AI_URL belum diset",
    },
    {
      label: "Deteksi foto",
      ok: (c.frames || 0) > 0 || (c.detections || 0) > 0 || !!fb.storage,
      text: (c.frames || 0) > 0 ? `${c.frames} frame · ${c.detections || 0} deteksi` : "Menunggu foto insiden",
    },
  ];
  const lastError = ad.last_error || br.last_error;
  const lastEventAt = ad.last_poll_at || br.last_telemetry_event_at;

  return (
    <div className="space-y-3">
      {/* Banner peringatan hanya saat data benar-benar tidak masuk. */}
      {!receiving && overview && <IntegrationBanner firebase={overview.integration.firebase} storage={overview.integration.storage} lastTelemetryAt={overview.last_telemetry_at} />}
      <details className="rounded-2xl border border-outline-variant bg-card-surface p-4 shadow-sm">
        <summary className="flex cursor-pointer flex-wrap items-center gap-2 font-heading text-sm font-bold text-on-surface">
          <span className="material-symbols-outlined text-brand">hub</span> Status integrasi data
          <span className="font-body-md text-[12px] font-normal text-on-surface-variant">
            {items.filter((i) => i.ok).length}/{items.length} komponen siap
            {lastEventAt ? ` · aktivitas terakhir ${fmtRelative(lastEventAt)}` : ""}
          </span>
        </summary>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {items.map((i) => (
            <li key={i.label} className="rounded-xl bg-surface-container-low p-3">
              <p className="flex items-center gap-1 font-heading text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                <span className={`h-2 w-2 rounded-full ${i.ok ? "bg-risk-aman" : "bg-risk-waspada"}`} /> {i.label}
              </p>
              <p className="mt-1 font-body-md text-[12px] text-on-surface">{i.text}</p>
            </li>
          ))}
        </ul>
        {lastError && (
          <p className="mt-2 rounded-lg bg-risk-kritis/10 px-3 py-2 font-body-md text-[12px] text-risk-kritis">Error terakhir ({lastError.where}, {fmtRelative(lastError.at)}): {lastError.message}</p>
        )}
      </details>
    </div>
  );
}