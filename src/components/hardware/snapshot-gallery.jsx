"use client";
// Snapshot RGB berkala — BUKAN video live. Ditampilkan sebagai gambar diam dengan waktu pengambilan.
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { INFERENCE_STATUS, UPLOAD_STATUS, defectLabel, fmtDateTime, fmtRelative, pct, qs } from "@/lib/hardware";
import { Badge, EmptyState, ErrorBox, GhostButton, SimBadge } from "./ui";
import { FrameImage } from "./frame-image";

export function LatestSnapshot({ frame, onOpen }) {
  const up = frame ? UPLOAD_STATUS[frame.upload_status] || UPLOAD_STATUS.pending : null;
  const inf = frame ? INFERENCE_STATUS[frame.inference_status] || INFERENCE_STATUS.pending : null;
  return (
    <div className="space-y-2">
      <FrameImage frame={frame} className="aspect-video" onClick={frame ? () => onOpen(frame.frame_id) : undefined} />
      {frame ? (
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge icon="photo_camera">Snapshot · {fmtDateTime(frame.captured_at)}</Badge>
          <Badge cls={up.cls} icon={up.icon}>{up.label}</Badge>
          <Badge cls={inf.cls} icon={inf.icon}>{inf.label}</Badge>
          <SimBadge show={frame.source === "simulasi"} />
        </div>
      ) : (
        <p className="font-body-md text-[12px] text-on-surface-variant">Belum ada snapshot RGB dari perangkat ini.</p>
      )}
      {frame && <p className="font-body-md text-[11px] text-on-surface-variant">Gambar diam yang diambil {fmtRelative(frame.captured_at)} — bukan tayangan langsung.</p>}
    </div>
  );
}

export function SnapshotGallery({ apiBase, deviceId, assetId, onOpen, pageSize = 12 }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [hasMore, setHasMore] = useState(false);
  const [days, setDays] = useState(7);

  async function load(before) {
    setLoading(true);
    setErr("");
    try {
      const to = new Date();
      const from = new Date(to.getTime() - days * 864e5);
      const d = await api.get(`${apiBase}/frames${qs({ device_id: deviceId, asset_id: assetId, frame_type: "rgb", limit: pageSize, before, from: from.toISOString(), to: to.toISOString() })}`);
      setItems((prev) => (before ? [...prev, ...(d.frames || [])] : d.frames || []));
      setHasMore(!!d.has_more);
    } catch (e) {
      setErr(e?.message || "Gagal memuat galeri gambar.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [deviceId, assetId, days]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-body-md text-[12px] text-on-surface-variant">{items.length} gambar · {days} hari terakhir</p>
        <select value={days} onChange={(e) => setDays(Number(e.target.value))} className="rounded-lg border border-outline-variant bg-white px-2 py-1 text-[12px] outline-none focus:border-brand">
          <option value={1}>24 jam</option>
          <option value={7}>7 hari</option>
          <option value={30}>30 hari</option>
          <option value={90}>90 hari</option>
        </select>
      </div>
      <ErrorBox message={err} onRetry={() => load()} />
      {!loading && !err && items.length === 0 ? (
        <EmptyState compact icon="photo_library" title="Menunggu gambar" text="Belum ada snapshot RGB pada rentang ini." />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((f) => {
            const top = f.detections && f.detections[0];
            const inf = INFERENCE_STATUS[f.inference_status] || INFERENCE_STATUS.pending;
            return (
              <div key={f.frame_id} className="space-y-1">
                <FrameImage frame={f} showBoxes={false} className="aspect-[4/3]" onClick={() => onOpen(f.frame_id)} />
                <p className="font-body-md text-[11px] font-semibold text-on-surface">{fmtDateTime(f.captured_at)}</p>
                <div className="flex flex-wrap gap-1">
                  {f.inference_status === "done" ? (
                    top ? <Badge cls="bg-risk-waspada/10 text-risk-waspada">{defectLabel(top.defect)} {pct(top.confidence)}</Badge> : <Badge cls="bg-risk-aman/10 text-risk-aman">Tanpa temuan</Badge>
                  ) : (
                    <Badge cls={inf.cls}>{inf.label}</Badge>
                  )}
                  <SimBadge show={f.source === "simulasi"} />
                </div>
              </div>
            );
          })}
        </div>
      )}
      {loading && <p className="text-center font-body-md text-[12px] text-on-surface-variant">Memuat…</p>}
      {hasMore && !loading && (
        <div className="flex justify-center">
          <GhostButton icon="expand_more" onClick={() => load(items[items.length - 1].captured_at)}>Muat gambar lebih lama</GhostButton>
        </div>
      )}
    </div>
  );
}

const INTERVALS = [5, 10, 30, 60];

// Kontrol interval snapshot — hanya dirender bila perangkat menyatakan mendukung.
export function SnapshotIntervalControl({ device, canControl, onSaved }) {
  const [val, setVal] = useState(device.snapshot_interval_s || "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const supported = device.capabilities && device.capabilities.snapshot_interval_control;

  if (!supported) {
    return <p className="font-body-md text-[12px] text-on-surface-variant">Interval snapshot diatur di firmware perangkat (pengaturan dari dashboard belum didukung perangkat ini).</p>;
  }
  if (!canControl) {
    return <p className="font-body-md text-[12px] text-on-surface-variant">Interval snapshot diminta: {device.snapshot_interval_s ? `${device.snapshot_interval_s} detik` : "belum diatur"}.</p>;
  }
  async function save(s) {
    setBusy(true);
    setMsg("");
    try {
      const r = await api.patch(`/api/hardware/devices/${device.id}/snapshot-interval`, { interval_s: s });
      setVal(s);
      setMsg(`ok:${(r && r.note) || "Terkirim."}`);
      if (onSaved) onSaved();
    } catch (e) {
      setMsg(`err:${e?.message || "Gagal mengirim konfigurasi."}`);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="space-y-2">
      <p className="font-label-sm text-label-sm text-on-surface-variant">Interval snapshot otomatis</p>
      <div className="flex flex-wrap gap-2">
        {INTERVALS.map((s) => (
          <button key={s} disabled={busy} onClick={() => save(s)}
            className={`rounded-full border px-3 py-1 font-heading text-xs font-bold transition ${Number(val) === s ? "border-brand bg-brand text-white" : "border-outline-variant bg-card-surface text-on-surface-variant hover:bg-surface-container-low"} disabled:opacity-60`}>
            {s} dtk
          </button>
        ))}
      </div>
      {msg && <p className={`text-[12px] font-semibold ${msg.startsWith("ok:") ? "text-risk-aman" : "text-risk-kritis"}`}>{msg.slice(3)}</p>}
      <p className="font-body-md text-[11px] text-on-surface-variant">Dikirim ke Firebase (/device_config). Berlaku setelah firmware membaca konfigurasi — pantau jarak waktu antar snapshot untuk memastikan.</p>
    </div>
  );
}
