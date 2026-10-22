"use client";
import { FOLLOWUP, INFERENCE_STATUS, defectLabel, fmtDateTime, fmtNum, pct } from "@/lib/hardware";
import { Badge, EmptyState, RiskBadge, SimBadge, Table, Td } from "./ui";
import { FrameImage } from "./frame-image";

// Tabel riwayat inspeksi (frame RGB yang diproses AI) — dipakai Supervisor & Business Portal.
export function InspectionsTable({ items, onOpen, deviceHref, showFollowup = true }) {
  if (!items.length) {
    return <EmptyState icon="image_search" title="Belum ada inspeksi" text="Inspeksi tercatat setelah snapshot RGB terunggah dan diproses model AI." />;
  }
  const head = ["Waktu", "Perangkat / Lokasi", "Gambar RGB", "Thermal", "Kelas kerusakan", "Confidence", "Suhu maks.", "Prioritas"];
  if (showFollowup) head.push("Tindak lanjut");
  return (
    <Table head={head} minWidth={1040}>
      {items.map((it) => {
        const top = it.detections && it.detections[0];
        const fu = FOLLOWUP[it.followup_status] || FOLLOWUP.menunggu_ai;
        const inf = INFERENCE_STATUS[it.inference_status] || INFERENCE_STATUS.pending;
        return (
          <tr key={it.frame_id} className="border-b border-outline-variant/60">
            <Td>
              <p className="font-semibold">{fmtDateTime(it.captured_at)}</p>
              <SimBadge show={it.source === "simulasi"} />
            </Td>
            <Td>
              {deviceHref && it.device && it.device.id ? (
                <a href={deviceHref(it.device.id)} className="font-heading font-bold text-brand hover:underline">{it.device.name || it.device.device_code}</a>
              ) : (
                <p className="font-heading font-bold">{(it.device && (it.device.name || it.device.device_code)) || "—"}</p>
              )}
              <p className="text-[12px] text-on-surface-variant">{it.asset ? `${it.asset.name}${it.asset.unit ? ` · ${it.asset.unit}` : ""}` : "Aset belum dikaitkan"}</p>
            </Td>
            <Td>
              <div className="w-28">
                <FrameImage frame={it} showBoxes={false} className="aspect-[4/3]" onClick={() => onOpen(it.frame_id)} />
              </div>
            </Td>
            <Td>{it.thermal_frame_id ? <Badge cls="bg-brand/10 text-brand" icon="thermostat">Tersedia</Badge> : <span className="text-on-surface-variant">—</span>}</Td>
            <Td>
              {it.inference_status !== "done" ? (
                <Badge cls={inf.cls}>{inf.label}</Badge>
              ) : top ? (
                <>
                  <p className="font-semibold">{defectLabel(top.defect)}</p>
                  {it.detections.length > 1 && <p className="text-[11px] text-on-surface-variant">+{it.detections.length - 1} deteksi lain</p>}
                </>
              ) : (
                <span className="text-on-surface-variant">Tidak terdeteksi</span>
              )}
            </Td>
            <Td className="font-heading font-bold">{top ? pct(top.confidence) : "—"}</Td>
            <Td>{it.telemetry ? fmtNum(it.telemetry.max_temp_c, 1, "°C") : "—"}</Td>
            <Td><RiskBadge priority={it.priority} /></Td>
            {showFollowup && <Td><Badge cls={fu.cls}>{fu.label}</Badge></Td>}
          </tr>
        );
      })}
    </Table>
  );
}
