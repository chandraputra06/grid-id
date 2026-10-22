"use client";
// Detail perangkat + Live Monitoring. Dipakai Supervisor (apiBase=/api/hardware, mode=staff)
// dan Business Portal (apiBase=/api/business, mode=b2b — hanya baca).
//
// Tiga sumber data dengan waktu pembaruan berbeda ditampilkan terpisah:
//   1. Live stream RGB  (langsung dari server streaming perangkat)
//   2. Snapshot RGB     (gambar berkala via Firebase Storage)
//   3. Telemetri sensor (paket berkala via Firebase RTDB)
import { useMemo, useState } from "react";
import { api } from "@/lib/api";
import { CHART_METRICS, RANGE_PRESETS, fmtDateTime, fmtRelative, metricMeta, qs, rangeFromPreset, useApi } from "@/lib/hardware";
import {
  Badge, Card, Chips, ConnectionBadge, ErrorBox, Freshness, GhostButton, IntegrationBanner, Loading, Modal, RiskBadge, SimBadge, TextInput, Select,
} from "./ui";
import { LiveStreamPanel } from "./live-stream";
import { LatestSnapshot, SnapshotGallery, SnapshotIntervalControl } from "./snapshot-gallery";
import { ThermalPanel } from "./thermal-panel";
import { TelemetryGrid } from "./telemetry-grid";
import { SensorChart } from "./sensor-chart";
import { DetectionList, FrameImage } from "./frame-image";
import { InspectionsTable } from "./inspections-table";
import { AlertsList } from "./alerts-list";
import { FrameModal } from "./frame-modal";

const TYPE_LABEL = { camera: "Kamera", thermal: "Thermal", sensor: "Sensor", multisensor: "Multisensor" };

export function DeviceDetail({ deviceId, apiBase, mode = "staff", role, backHref, inspectionsHref, alertsHref }) {
  const staff = mode === "staff";
  const { data, error, loading, reload, updatedAt } = useApi(deviceId ? `${apiBase}/devices/${deviceId}` : null, { intervalMs: 10000 });
  const [frameId, setFrameId] = useState(null);
  const [editOpen, setEditOpen] = useState(false);

  if (!deviceId) return <ErrorBox message="ID perangkat tidak ada di URL." />;
  if (loading && !data) return <Loading text="Memuat detail perangkat…" />;
  if (error && !data) return <ErrorBox message={error} onRetry={reload} />;
  if (!data) return null;

  const dev = data.device;
  const asset = data.asset;
  const t = data.latest_telemetry;
  const canAct = staff && (role === "admin" || role === "supervisor");
  const canConfig = staff && (role === "admin" || role === "hardware");
  const canInterval = staff && ["admin", "supervisor", "hardware"].includes(role);

  return (
    <div className="space-y-6">
      {backHref && (
        <a href={backHref} className="inline-flex items-center gap-1 font-heading text-sm font-bold text-brand hover:underline">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span> Kembali ke daftar perangkat
        </a>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-heading text-2xl font-extrabold text-on-surface">{dev.name || dev.device_code}</h1>
            <ConnectionBadge state={dev.connection} at={dev.last_telemetry_at} />
            <RiskBadge priority={data.priority} />
            <SimBadge show={t && t.source === "simulasi"} />
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant">
            {dev.device_code} · {TYPE_LABEL[dev.type] || dev.type || "Tipe belum diatur"}
            {asset ? ` · ${asset.name} (${asset.asset_code})${asset.unit ? ` · ${asset.unit}` : ""}` : " · belum dikaitkan ke aset"}
          </p>
        </div>
        <div className="flex gap-2">
          {canConfig && <GhostButton icon="settings" onClick={() => setEditOpen(true)}>Konfigurasi</GhostButton>}
          <GhostButton icon="refresh" onClick={reload}>Muat ulang</GhostButton>
        </div>
      </div>

      {error && <ErrorBox message={`Pembaruan otomatis gagal: ${error}`} onRetry={reload} />}
      <IntegrationBanner firebase={data.integration.firebase} storage={data.integration.storage} lastTelemetryAt={dev.last_telemetry_at} />

      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        <Freshness icon="videocam" label="Live stream" note={dev.stream_configured ? (dev.stream ? "Terkonfigurasi — lihat panel" : "Tidak diizinkan untuk akun ini") : "Belum dikonfigurasi"} />
        <Freshness icon="photo_camera" label="Snapshot terakhir" at={data.latest_rgb && data.latest_rgb.captured_at} />
        <Freshness icon="sensors" label="Telemetri terakhir" at={dev.last_telemetry_at} />
        <Freshness icon="sync" label="Halaman diperbarui" note={updatedAt ? `${fmtRelative(updatedAt)} · otomatis tiap 10 dtk` : "—"} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Live RGB" icon="videocam">
          <LiveStreamPanel device={dev} />
        </Card>
        <Card title="Snapshot RGB terbaru" icon="photo_camera">
          <LatestSnapshot frame={data.latest_rgb} onOpen={setFrameId} />
          <div className="mt-4 border-t border-outline-variant pt-3">
            <SnapshotIntervalControl device={dev} canControl={canInterval} onSaved={reload} />
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Telemetri sensor terbaru" icon="sensors" className="lg:col-span-2">
          <TelemetryGrid telemetry={t} thresholds={data.thresholds} />
        </Card>
        <Card title="Citra thermal" icon="thermostat">
          <ThermalPanel apiBase={apiBase} frame={data.latest_thermal} telemetry={t} />
        </Card>
      </div>

      <HistoryCharts apiBase={apiBase} deviceId={dev.id} thresholds={data.thresholds} />

      <LatestAi apiBase={apiBase} deviceId={dev.id} onOpen={setFrameId} />

      <Card title="Galeri riwayat gambar" icon="photo_library">
        <SnapshotGallery apiBase={apiBase} deviceId={dev.id} onOpen={setFrameId} />
      </Card>

      <DeviceInspections apiBase={apiBase} deviceId={dev.id} onOpen={setFrameId} moreHref={inspectionsHref} />

      <DeviceAlerts apiBase={apiBase} deviceId={dev.id} canAct={canAct} onOpenFrame={setFrameId} moreHref={alertsHref} />

      <Card title="Informasi perangkat, gardu & konektivitas" icon="info">
        <dl className="grid gap-x-6 gap-y-2 font-body-md text-[13px] sm:grid-cols-2 lg:grid-cols-3">
          <Info k="ID perangkat (Firebase)" v={dev.device_code} />
          <Info k="Nama" v={dev.name} />
          <Info k="Tipe" v={TYPE_LABEL[dev.type] || dev.type} />
          <Info k="Terdaftar" v={fmtDateTime(dev.created_at, true)} />
          <Info k="Status koneksi" v={<ConnectionBadge state={dev.connection} at={dev.last_telemetry_at} />} />
          <Info k="Telemetri terakhir" v={dev.last_telemetry_at ? `${fmtDateTime(dev.last_telemetry_at, true)} (${fmtRelative(dev.last_telemetry_at)})` : "Belum pernah"} />
          <Info k="Kekuatan sinyal terakhir" v={t && t.rssi_dbm != null ? `${t.rssi_dbm} dBm` : "—"} />
          <Info k="Dianggap terlambat / offline" v={`> ${data.thresholds.telemetry_late_after_s} dtk / > ${Math.round(data.thresholds.offline_after_s / 60)} mnt tanpa telemetri`} />
          <Info k="Ambang suhu peringatan" v={data.thresholds.temp_max_c != null ? `${data.thresholds.temp_max_c} °C` : "Belum dikonfigurasi"} />
          <Info k="Gardu / aset" v={asset ? `${asset.name} (${asset.asset_code})` : "Belum dikaitkan"} />
          <Info k="Jenis aset" v={asset && asset.asset_type} />
          <Info k="Lokasi / unit" v={asset && asset.unit} />
          <Info k="Koordinat aset" v={asset && asset.lat != null ? `${Number(asset.lat).toFixed(5)}, ${Number(asset.lng).toFixed(5)}` : null} />
          <Info k="Koordinat GPS perangkat" v={t && t.gps_lat != null ? `${Number(t.gps_lat).toFixed(5)}, ${Number(t.gps_lng).toFixed(5)}` : "Tidak dikirim / tidak valid"} />
          <Info k="Kritikalitas aset" v={asset && asset.criticality} />
        </dl>
      </Card>

      <FrameModal apiBase={apiBase} frameId={frameId} onClose={() => setFrameId(null)} />
      {canConfig && <ConfigModal key={editOpen ? "open" : "closed"} open={editOpen} onClose={() => setEditOpen(false)} device={dev} onSaved={reload} />}
    </div>
  );
}

function Info({ k, v }) {
  return (
    <div className="flex flex-col border-b border-outline-variant/50 py-1.5">
      <dt className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">{k}</dt>
      <dd className="text-on-surface">{v === null || v === undefined || v === "" ? "—" : v}</dd>
    </div>
  );
}

function HistoryCharts({ apiBase, deviceId, thresholds }) {
  const [range, setRange] = useState("24h");
  const [metric, setMetric] = useState("max_temp_c");
  const r = useMemo(() => rangeFromPreset(range), [range]);
  const { data, error, loading, reload } = useApi(`${apiBase}/devices/${deviceId}/telemetry${qs({ from: r.from, to: r.to, limit: 3000 })}`, { intervalMs: range === "1h" ? 15000 : 60000 });
  const rows = (data && data.rows) || [];
  const available = CHART_METRICS.filter((k) => rows.some((x) => x[k] !== null && x[k] !== undefined));
  const active = available.includes(metric) ? metric : available[0] || metric;
  const m = metricMeta(active);
  const threshold = active === "max_temp_c" ? thresholds.temp_max_c : active === "gas_raw" ? thresholds.gas_raw_max : null;

  return (
    <Card title="Grafik historis sensor" icon="monitoring"
      right={<Chips items={RANGE_PRESETS.filter((p) => p.key !== "30d").map((p) => ({ key: p.key, label: p.label }))} value={range} onChange={setRange} />}>
      <ErrorBox message={error} onRetry={reload} />
      {loading && !data ? (
        <Loading text="Memuat riwayat telemetri…" />
      ) : (
        <div className="space-y-3">
          {available.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {available.map((k) => (
                <button key={k} onClick={() => setMetric(k)}
                  className={`rounded-full px-3 py-1 font-heading text-[11px] font-bold ${k === active ? "bg-brand text-white" : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"}`}>
                  {metricMeta(k).label}
                </button>
              ))}
            </div>
          )}
          <SensorChart rows={rows} metric={active} unit={m ? m.unit : ""} digits={m ? m.digits : 1} label={m ? m.label : active} threshold={threshold} height={220} />
          <p className="font-body-md text-[11px] text-on-surface-variant">
            {rows.length} pembacaan · {fmtDateTime(r.from)} – {fmtDateTime(r.to)}{data && data.truncated ? " · dibatasi 3000 titik terbaru" : ""}. Garis terputus = tidak ada data (perangkat offline).
          </p>
        </div>
      )}
    </Card>
  );
}

function LatestAi({ apiBase, deviceId, onOpen }) {
  const { data, loading } = useApi(`${apiBase}/inspections${qs({ device_id: deviceId, limit: 1, inference_status: "done", from: new Date(Date.now() - 90 * 864e5).toISOString() })}`, { intervalMs: 30000 });
  const it = data && data.inspections && data.inspections[0];
  return (
    <Card title="Hasil deteksi YOLO terbaru" icon="neurology">
      {loading && !data ? (
        <Loading />
      ) : !it ? (
        <p className="font-body-md text-[13px] text-on-surface-variant">Menunggu pemrosesan AI — belum ada snapshot yang selesai dianalisis model.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <FrameImage frame={it} onClick={() => onOpen(it.frame_id)} className="aspect-[4/3]" />
          <div className="space-y-3">
            <div className="flex flex-wrap gap-1.5">
              <Badge icon="schedule">Gambar {fmtDateTime(it.captured_at)}</Badge>
              <Badge icon="neurology">Inferensi {fmtDateTime(it.inference_at)}</Badge>
              {it.model_version && <Badge>Model {it.model_version}</Badge>}
            </div>
            <DetectionList detections={it.detections} />
            <p className="font-body-md text-[11px] text-on-surface-variant">Hasil model adalah indikasi awal dan perlu verifikasi lapangan sebelum dinyatakan sebagai kerusakan.</p>
          </div>
        </div>
      )}
    </Card>
  );
}

function DeviceInspections({ apiBase, deviceId, onOpen, moreHref }) {
  const { data, error, loading, reload } = useApi(`${apiBase}/inspections${qs({ device_id: deviceId, limit: 10, from: new Date(Date.now() - 30 * 864e5).toISOString() })}`);
  return (
    <Card title="Riwayat inspeksi" icon="fact_check" right={moreHref && <a href={moreHref} className="font-heading text-sm font-bold text-brand hover:underline">Lihat semua →</a>}>
      <ErrorBox message={error} onRetry={reload} />
      {loading && !data ? <Loading /> : <InspectionsTable items={(data && data.inspections) || []} onOpen={onOpen} />}
    </Card>
  );
}

function DeviceAlerts({ apiBase, deviceId, canAct, onOpenFrame, moreHref }) {
  const { data, error, loading, reload } = useApi(`${apiBase}/alerts${qs({ device_id: deviceId, limit: 20 })}`, { intervalMs: 30000 });
  return (
    <Card title="Riwayat peringatan (30 hari)" icon="notifications" right={moreHref && <a href={moreHref} className="font-heading text-sm font-bold text-brand hover:underline">Semua peringatan →</a>}>
      <ErrorBox message={error} onRetry={reload} />
      {loading && !data ? <Loading /> : <AlertsList alerts={(data && data.alerts) || []} canAct={canAct} onChanged={reload} onOpenFrame={onOpenFrame} />}
    </Card>
  );
}

function ConfigModal({ open, onClose, device, onSaved }) {
  const [f, setF] = useState({
    name: device.name || "",
    stream_url: (device.stream && device.stream.url) || "",
    stream_type: (device.stream && device.stream.type) || "mjpeg",
    snapshot_interval_control: !!(device.capabilities && device.capabilities.snapshot_interval_control),
    thermal_image: !!(device.capabilities && device.capabilities.thermal_image),
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  async function save() {
    setBusy(true);
    setErr("");
    try {
      await api.patch(`/api/hardware/devices/${device.id}/config`, {
        name: f.name,
        stream_url: f.stream_url || null,
        stream_type: f.stream_url ? f.stream_type : null,
        capabilities: { snapshot_interval_control: f.snapshot_interval_control, thermal_image: f.thermal_image },
      });
      onSaved();
      onClose();
    } catch (e) {
      setErr(e?.message || "Gagal menyimpan konfigurasi.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal open={open} onClose={onClose} title={`Konfigurasi ${device.device_code}`}>
      <div className="space-y-3">
        <TextInput label="Nama perangkat" value={f.name} onChange={(v) => setF({ ...f, name: v })} placeholder="Unit Thermal Gardu Sanur" />
        <TextInput label="URL live stream (opsional)" value={f.stream_url} onChange={(v) => setF({ ...f, stream_url: v })} placeholder="https://stream.contoh.id/gardu-001/index.m3u8" />
        <Select label="Jenis stream" value={f.stream_type} onChange={(v) => setF({ ...f, stream_type: v })}>
          <option value="mjpeg">MJPEG (mis. ESP32-CAM /stream)</option>
          <option value="hls">HLS (.m3u8)</option>
          <option value="iframe">Pemutar web (WebRTC/go2rtc/MediaMTX)</option>
        </Select>
        <label className="flex items-start gap-2 font-body-md text-[13px]">
          <input type="checkbox" checked={f.snapshot_interval_control} onChange={(e) => setF({ ...f, snapshot_interval_control: e.target.checked })} className="mt-1" />
          <span>Firmware membaca <code>/device_config/{device.device_code}/snapshot_interval_s</code> (aktifkan kontrol interval snapshot)</span>
        </label>
        <label className="flex items-start gap-2 font-body-md text-[13px]">
          <input type="checkbox" checked={f.thermal_image} onChange={(e) => setF({ ...f, thermal_image: e.target.checked })} className="mt-1" />
          <span>Perangkat mengunggah matriks thermal (frame_type: thermal)</span>
        </label>
        {err && <p className="rounded-lg bg-risk-kritis/10 px-3 py-2 text-[13px] font-semibold text-risk-kritis">{err}</p>}
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="rounded-full border border-outline-variant px-4 py-2 font-label-bold text-label-bold text-on-surface-variant hover:bg-surface-container">Batal</button>
          <button onClick={save} disabled={busy} className="rounded-full bg-brand px-4 py-2 font-label-bold text-label-bold text-white hover:brightness-110 disabled:opacity-60">{busy ? "Menyimpan…" : "Simpan"}</button>
        </div>
      </div>
    </Modal>
  );
}
