"use client";
import { defectLabel, fmtDateTime, fmtNum, fmtRelative, pct } from "@/lib/hardware";
import { Badge, ConnectionBadge, EmptyState, RiskBadge, SimBadge, Table, Td } from "./ui";

// Tabel perangkat — kolom sesuai kebutuhan Device Management Supervisor.
export function DevicesTable({ devices, detailHref }) {
  if (!devices.length) return <EmptyState icon="memory" title="Tidak ada perangkat" text="Tidak ada perangkat untuk filter ini." />;
  return (
    <Table head={["ID perangkat", "Nama", "Gardu / aset", "Lokasi", "Status", "Pembaruan terakhir", "Suhu maks.", "Suara", "Gas (raw)", "Hasil AI terakhir", "Prioritas", "Peringatan", ""]} minWidth={1280}>
      {devices.map((d) => (
        <tr key={d.id} className="border-b border-outline-variant/60">
          <Td><a href={detailHref(d.id)} className="font-heading font-bold text-brand hover:underline">{d.device_code}</a></Td>
          <Td>{d.name || <span className="text-on-surface-variant">—</span>}</Td>
          <Td>{d.asset ? <><p className="font-semibold">{d.asset.name}</p><p className="text-[11px] text-on-surface-variant">{d.asset.asset_code}</p></> : <span className="text-on-surface-variant">Belum dikaitkan</span>}</Td>
          <Td>{(d.asset && d.asset.unit) || "—"}</Td>
          <Td><ConnectionBadge state={d.connection} at={d.last_telemetry_at} /></Td>
          <Td>
            <p>{d.last_telemetry_at ? fmtRelative(d.last_telemetry_at) : "Belum pernah"}</p>
            {d.last_telemetry_at && <p className="text-[11px] text-on-surface-variant">{fmtDateTime(d.last_telemetry_at)}</p>}
          </Td>
          <Td>{d.latest ? fmtNum(d.latest.max_temp_c, 1, "°C") : "—"}{d.latest && <SimBadge show={d.latest.source === "simulasi"} />}</Td>
          <Td>{d.latest ? fmtNum(d.latest.sound_level_db, 1, "dB") : "—"}</Td>
          <Td>{d.latest ? fmtNum(d.latest.gas_raw, 0) : "—"}</Td>
          <Td>
            {d.last_ai ? (
              d.last_ai.top ? (
                <><p className="font-semibold">{defectLabel(d.last_ai.top.defect)} · {pct(d.last_ai.top.confidence)}</p><p className="text-[11px] text-on-surface-variant">{fmtRelative(d.last_ai.captured_at)}</p></>
              ) : (
                <><p>Tanpa temuan</p><p className="text-[11px] text-on-surface-variant">{fmtRelative(d.last_ai.captured_at)}</p></>
              )
            ) : <span className="text-on-surface-variant">Belum ada</span>}
          </Td>
          <Td><RiskBadge priority={d.priority} /></Td>
          <Td>{d.open_alerts ? <Badge cls="bg-risk-kritis/10 text-risk-kritis" icon="notifications_active">{d.open_alerts} aktif</Badge> : <span className="text-on-surface-variant">—</span>}</Td>
          <Td><a href={detailHref(d.id)} className="whitespace-nowrap font-heading text-sm font-bold text-brand hover:underline">Detail →</a></Td>
        </tr>
      ))}
    </Table>
  );
}
