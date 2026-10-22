"use client";
// Detail satu frame: gambar sumber + bbox, hasil YOLO, telemetri saat gambar diambil, citra thermal terkait.
import { INFERENCE_STATUS, UPLOAD_STATUS, fmtDateTime, fmtNum, useApi } from "@/lib/hardware";
import { AlertPriorityBadge, AlertStatusBadge, Badge, ErrorBox, Loading, Modal, RiskBadge, SimBadge } from "./ui";
import { DetectionList, FrameImage } from "./frame-image";
import { ThermalPanel } from "./thermal-panel";

export function FrameModal({ apiBase, frameId, onClose }) {
  const { data, error, loading, reload } = useApi(frameId ? `${apiBase}/frames/${encodeURIComponent(frameId)}` : null);
  return (
    <Modal open={!!frameId} onClose={onClose} title={`Detail inspeksi · ${frameId || ""}`} wide>
      {loading && !data ? <Loading /> : error ? <ErrorBox message={error} onRetry={reload} /> : data ? <Body d={data} apiBase={apiBase} /> : null}
    </Modal>
  );
}

function Body({ d, apiBase }) {
  const f = d.frame;
  const up = UPLOAD_STATUS[f.upload_status] || UPLOAD_STATUS.pending;
  const inf = INFERENCE_STATUS[f.inference_status] || INFERENCE_STATUS.pending;
  const t = d.telemetry;
  return (
    <div className="grid gap-5 lg:grid-cols-5">
      <div className="space-y-3 lg:col-span-3">
        <FrameImage frame={f} className="aspect-[4/3]" />
        <div className="flex flex-wrap gap-2">
          <Badge cls={up.cls} icon={up.icon}>{up.label}</Badge>
          {f.frame_type === "rgb" && <Badge cls={inf.cls} icon={inf.icon}>{inf.label}</Badge>}
          <Badge icon="photo_camera">{f.capture_mode === "periodic" ? "Snapshot berkala" : f.capture_mode === "manual" ? "Pengambilan manual" : f.capture_mode === "event" ? "Dipicu kejadian" : "Mode tidak dilaporkan"}</Badge>
          <SimBadge show={f.source === "simulasi"} />
        </div>
        {f.inference_error && <p className="font-body-md text-[12px] text-on-surface-variant">Catatan AI: {f.inference_error}</p>}
      </div>
      <div className="space-y-4 lg:col-span-2">
        <dl className="grid grid-cols-2 gap-x-3 gap-y-2 font-body-md text-[13px]">
          <dt className="text-on-surface-variant">Perangkat</dt><dd className="font-semibold">{d.device.name || d.device.device_code}</dd>
          <dt className="text-on-surface-variant">Aset / gardu</dt><dd className="font-semibold">{d.asset ? `${d.asset.name} (${d.asset.asset_code})` : "Belum dikaitkan"}</dd>
          <dt className="text-on-surface-variant">Lokasi</dt><dd>{(d.asset && d.asset.unit) || "—"}</dd>
          <dt className="text-on-surface-variant">Diambil</dt><dd>{fmtDateTime(f.captured_at, true)}</dd>
          <dt className="text-on-surface-variant">Inferensi</dt><dd>{f.inference_at ? fmtDateTime(f.inference_at) : "—"}</dd>
          <dt className="text-on-surface-variant">Versi model</dt><dd>{f.model_version || "—"}</dd>
          <dt className="text-on-surface-variant">Prioritas aset</dt><dd><RiskBadge priority={d.priority} /></dd>
          {d.alert && (<><dt className="text-on-surface-variant">Tindak lanjut</dt><dd className="flex flex-wrap gap-1"><AlertPriorityBadge p={d.alert.priority} /><AlertStatusBadge s={d.alert.status} /></dd></>)}
        </dl>
        <div>
          <h4 className="mb-2 font-heading text-sm font-bold">Hasil deteksi YOLO</h4>
          {f.inference_status === "done" ? <DetectionList detections={f.detections} /> : <p className="font-body-md text-[13px] text-on-surface-variant">{inf.label}.</p>}
        </div>
        <div>
          <h4 className="mb-2 font-heading text-sm font-bold">Telemetri saat gambar diambil</h4>
          {t ? (
            <p className="font-body-md text-[13px] text-on-surface">
              Suhu maks. {fmtNum(t.max_temp_c, 1, "°C")} · lingkungan {fmtNum(t.ambient_temp_c, 1, "°C")} · suara {fmtNum(t.sound_level_db, 1, "dB")}
              <span className="block text-[11px] text-on-surface-variant">Selisih waktu {t.offset_s > 0 ? "+" : ""}{t.offset_s} dtk dari gambar.</span>
            </p>
          ) : (
            <p className="font-body-md text-[13px] text-on-surface-variant">Tidak ada telemetri dalam ±2 menit dari waktu gambar.</p>
          )}
        </div>
        {d.thermal_frame && (
          <div>
            <h4 className="mb-2 font-heading text-sm font-bold">Citra thermal terkait</h4>
            <ThermalPanel apiBase={apiBase} frame={d.thermal_frame} telemetry={t} />
          </div>
        )}
      </div>
    </div>
  );
}
