"use client";
import { useEffect, useState } from "react";
import { fmtDateTime, fmtNum, useApi } from "@/lib/hardware";
import { Card, ConnectionBadge, EmptyState, ErrorBox, Freshness, Loading, PageHeader, SimBadge } from "@/components/hardware/ui";
import { LiveStreamPanel } from "@/components/hardware/live-stream";
import { LatestSnapshot, SnapshotGallery } from "@/components/hardware/snapshot-gallery";
import { ThermalPanel } from "@/components/hardware/thermal-panel";
import { FrameModal } from "@/components/hardware/frame-modal";

const API = "/api/business";

export default function BusinessLive() {
  const list = useApi(`${API}/devices`, { intervalMs: 30000 });
  const devices = (list.data && list.data.devices) || [];
  const [sel, setSel] = useState(null);
  const [frameId, setFrameId] = useState(null);
  useEffect(() => {
    if (!sel && devices.length) setSel(devices[0].id);
  }, [devices, sel]);

  return (
    <div className="space-y-5">
      <PageHeader title="Live Monitoring"
        subtitle="Live RGB (bila tersedia) dan snapshot berkala dari perangkat. Akses Anda bersifat lihat-saja; perangkat tidak dapat dikontrol dari portal ini." />
      <ErrorBox message={list.error} onRetry={list.reload} />
      {list.loading && !list.data ? <Loading /> : devices.length === 0 ? (
        <EmptyState icon="videocam_off" title="Belum ada perangkat" text="Belum ada perangkat pada aset organisasi Anda." />
      ) : (
        <>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {devices.map((d) => (
              <button key={d.id} onClick={() => setSel(d.id)}
                className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 font-heading text-sm font-bold transition-colors ${
                  sel === d.id ? "border-brand bg-brand text-white" : "border-outline-variant bg-card-surface text-on-surface-variant hover:bg-surface-container-low"
                }`}>
                {d.device_code}
                <span className={`h-2 w-2 rounded-full ${d.connection === "online" ? "bg-risk-aman" : d.connection === "late" ? "bg-risk-waspada" : "bg-outline"}`} />
              </button>
            ))}
          </div>
          {sel && <LiveDevice key={sel} id={sel} onOpen={setFrameId} />}
        </>
      )}
      <FrameModal apiBase={API} frameId={frameId} onClose={() => setFrameId(null)} />
    </div>
  );
}

function LiveDevice({ id, onOpen }) {
  const { data, error, loading, reload } = useApi(`${API}/devices/${id}`, { intervalMs: 10000 });
  if (loading && !data) return <Loading />;
  if (error && !data) return <ErrorBox message={error} onRetry={reload} />;
  const dev = data.device;
  const t = data.latest_telemetry;
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="font-heading text-lg font-bold text-on-surface">{dev.name || dev.device_code}</h2>
        <ConnectionBadge state={dev.connection} at={dev.last_telemetry_at} />
        <span className="font-body-md text-[13px] text-on-surface-variant">{data.asset ? `${data.asset.name}${data.asset.unit ? ` · ${data.asset.unit}` : ""}` : ""}</span>
        <a href={`/business/perangkat/detail?id=${dev.id}`} className="ml-auto font-heading text-sm font-bold text-brand hover:underline">Detail perangkat →</a>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <Freshness icon="videocam" label="Live stream" note={dev.stream ? "Terkonfigurasi" : dev.stream_configured ? "Tidak diizinkan" : "Belum dikonfigurasi"} />
        <Freshness icon="photo_camera" label="Snapshot terakhir" at={data.latest_rgb && data.latest_rgb.captured_at} />
        <Freshness icon="sensors" label="Telemetri terakhir" at={dev.last_telemetry_at} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Live RGB" icon="videocam"><LiveStreamPanel device={dev} /></Card>
        <Card title="Snapshot berkala terbaru" icon="photo_camera">
          <LatestSnapshot frame={data.latest_rgb} onOpen={onOpen} />
          {t && (
            <p className="mt-3 rounded-lg bg-surface-container-low px-3 py-2 font-body-md text-[12px] text-on-surface">
              Sensor terbaru ({fmtDateTime(t.captured_at)}): suhu maks. {fmtNum(t.max_temp_c, 1, "°C")} · lingkungan {fmtNum(t.ambient_temp_c, 1, "°C")} · kelembapan {fmtNum(t.humidity_pct, 0, "%")} · suara {fmtNum(t.sound_level_db, 1, "dB")}
              <SimBadge show={t.source === "simulasi"} />
            </p>
          )}
        </Card>
      </div>
      <Card title="Citra thermal" icon="thermostat"><div className="max-w-xl"><ThermalPanel apiBase={API} frame={data.latest_thermal} telemetry={t} /></div></Card>
      <Card title="Galeri gambar" icon="photo_library"><SnapshotGallery apiBase={API} deviceId={dev.id} onOpen={onOpen} /></Card>
    </div>
  );
}
