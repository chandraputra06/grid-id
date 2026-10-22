"use client";
import { useState } from "react";
import { fmtDateTime, fmtRelative, qs, useApi, useQueryParam } from "@/lib/hardware";
import { Card, ErrorBox, Loading, RiskBadge } from "@/components/hardware/ui";
import { MonitoringBadge } from "@/components/hardware/asset-status";
import { DevicesTable } from "@/components/hardware/devices-table";
import { InspectionsTable } from "@/components/hardware/inspections-table";
import { AlertsList } from "@/components/hardware/alerts-list";
import { SnapshotGallery } from "@/components/hardware/snapshot-gallery";
import { TelemetryGrid } from "@/components/hardware/telemetry-grid";
import { FrameModal } from "@/components/hardware/frame-modal";

const API = "/api/business";

export default function BusinessAssetDetail() {
  const id = useQueryParam("id");
  const [frameId, setFrameId] = useState(null);
  const a = useApi(id ? `${API}/assets/${id}` : null, { intervalMs: 30000 });
  const ins = useApi(id ? `${API}/inspections${qs({ asset_id: id, limit: 20, from: new Date(Date.now() - 30 * 864e5).toISOString() })}` : null);
  const al = useApi(id ? `${API}/alerts${qs({ asset_id: id, limit: 20 })}` : null, { intervalMs: 60000 });
  const firstDevice = a.data && a.data.devices[0];
  const dev = useApi(firstDevice ? `${API}/devices/${firstDevice.id}` : null, { intervalMs: 30000 });

  if (id === null) return <Loading />;
  if (!id) return <ErrorBox message="ID aset tidak ada di URL." />;
  if (a.loading && !a.data) return <Loading text="Memuat detail aset…" />;
  if (a.error && !a.data) return <ErrorBox message={a.error} onRetry={a.reload} />;
  const d = a.data;
  const asset = d.asset;

  return (
    <div className="space-y-6">
      <a href="/business/aset" className="inline-flex items-center gap-1 font-heading text-sm font-bold text-brand hover:underline">
        <span className="material-symbols-outlined text-[18px]">arrow_back</span> Monitoring Aset
      </a>
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-heading text-2xl font-extrabold text-on-surface">{asset.name}</h1>
          <MonitoringBadge s={d.monitoring_status} />
          <RiskBadge priority={d.priority} />
        </div>
        <p className="font-body-md text-body-md text-on-surface-variant">
          {asset.asset_code}{asset.asset_type ? ` · ${asset.asset_type}` : ""}{asset.unit ? ` · ${asset.unit}` : ""}
          {asset.lat != null ? ` · ${Number(asset.lat).toFixed(4)}, ${Number(asset.lng).toFixed(4)}` : ""}
          {" · "}telemetri terakhir {fmtRelative(d.last_telemetry_at)}
        </p>
      </div>

      <Card title={`Perangkat terkait (${d.devices.length})`} icon="memory">
        <DevicesTable devices={d.devices} detailHref={(x) => `/business/perangkat/detail?id=${x}`} />
      </Card>

      {firstDevice && (
        <Card title={`Data sensor terbaru · ${firstDevice.device_code}`} icon="sensors"
          right={<a href={`/business/perangkat/detail?id=${firstDevice.id}`} className="font-heading text-sm font-bold text-brand hover:underline">Live & grafik →</a>}>
          {dev.loading && !dev.data ? <Loading /> : dev.data ? <TelemetryGrid telemetry={dev.data.latest_telemetry} thresholds={dev.data.thresholds} /> : <ErrorBox message={dev.error} onRetry={dev.reload} />}
        </Card>
      )}

      <Card title="Gambar inspeksi aset" icon="photo_library">
        <SnapshotGallery apiBase={API} assetId={asset.id} onOpen={setFrameId} />
      </Card>

      <Card title="Hasil AI & riwayat inspeksi (30 hari)" icon="fact_check">
        <ErrorBox message={ins.error} onRetry={ins.reload} />
        {ins.loading && !ins.data ? <Loading /> : <InspectionsTable items={(ins.data && ins.data.inspections) || []} onOpen={setFrameId} deviceHref={(x) => `/business/perangkat/detail?id=${x}`} />}
      </Card>

      <Card title="Peringatan aset" icon="notifications">
        <ErrorBox message={al.error} onRetry={al.reload} />
        {al.loading && !al.data ? <Loading /> : <AlertsList alerts={(al.data && al.data.alerts) || []} canAct={false} onOpenFrame={setFrameId} />}
        <p className="mt-3 font-body-md text-[11px] text-on-surface-variant">Status tindak lanjut dikelola oleh tim operasional. Halaman ini hanya menampilkan informasi. Data diperbarui {a.updatedAt ? fmtDateTime(a.updatedAt) : "—"}.</p>
      </Card>
      <FrameModal apiBase={API} frameId={frameId} onClose={() => setFrameId(null)} />
    </div>
  );
}
