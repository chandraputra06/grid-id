"use client";
import { useState } from "react";
import { defectLabel, fmtDateTime, fmtRelative, pct, qs, useApi } from "@/lib/hardware";
import { Badge, Card, ConnectionBadge, EmptyState, ErrorBox, FilterBar, Loading, PageHeader, RiskBadge, Select, Table, Td, TextInput } from "@/components/hardware/ui";
import { MONITORING_STATUS, MonitoringBadge } from "@/components/hardware/asset-status";

export default function BusinessAssets() {
  const [f, setF] = useState({ q: "", unit: "", status: "" });
  const set = (k) => (v) => setF((x) => ({ ...x, [k]: v }));
  const { data, error, loading, reload } = useApi(`/api/business/assets${qs(f)}`, { intervalMs: 60000 });
  const list = (data && data.assets) || [];
  return (
    <div className="space-y-5">
      <PageHeader title="Monitoring Aset" subtitle="Aset/gardu yang aksesnya diberikan kepada organisasi Anda beserta status pemantauannya." />
      <FilterBar>
        <TextInput label="Cari aset" value={f.q} onChange={set("q")} placeholder="Nama atau kode aset" className="lg:col-span-2" />
        <Select label="Lokasi" value={f.unit} onChange={set("unit")}>
          <option value="">Semua lokasi</option>
          {((data && data.units) || []).map((u) => <option key={u} value={u}>{u}</option>)}
        </Select>
        <Select label="Status monitoring" value={f.status} onChange={set("status")} className="lg:col-span-2">
          <option value="">Semua status</option>
          {Object.entries(MONITORING_STATUS).map(([k, m]) => <option key={k} value={k}>{m.label}</option>)}
        </Select>
      </FilterBar>
      <ErrorBox message={error} onRetry={reload} />
      <Card title={`Aset (${list.length})`} icon="location_city">
        {loading && !data ? <Loading /> : list.length === 0 ? (
          <EmptyState icon="inventory_2" title="Tidak ada aset" text="Tidak ada aset untuk filter ini, atau organisasi belum diberi akses aset." />
        ) : (
          <Table head={["Aset", "Lokasi", "Perangkat", "Status monitoring", "Inspeksi terakhir", "Temuan AI terbaru", "Prioritas", "Peringatan aktif", ""]} minWidth={1100}>
            {list.map((a) => (
              <tr key={a.asset.id} className="border-b border-outline-variant/60">
                <Td><a href={`/business/aset/detail?id=${a.asset.id}`} className="font-heading font-bold text-brand hover:underline">{a.asset.name}</a><p className="text-[11px] text-on-surface-variant">{a.asset.asset_code}{a.asset.asset_type ? ` · ${a.asset.asset_type}` : ""}</p></Td>
                <Td>{a.asset.unit || "—"}</Td>
                <Td>
                  {a.devices.length === 0 ? <span className="text-on-surface-variant">—</span> : (
                    <div className="flex flex-col gap-1">{a.devices.map((d) => <span key={d.id} className="flex items-center gap-1.5"><span className="font-semibold">{d.device_code}</span><ConnectionBadge state={d.connection} at={d.last_telemetry_at} /></span>)}</div>
                  )}
                </Td>
                <Td><MonitoringBadge s={a.monitoring_status} /></Td>
                <Td>{a.last_inspection ? <>{fmtDateTime(a.last_inspection.captured_at)}<p className="text-[11px] text-on-surface-variant">{fmtRelative(a.last_inspection.captured_at)}</p></> : <span className="text-on-surface-variant">Belum ada</span>}</Td>
                <Td>{a.last_inspection ? (a.last_inspection.top ? `${defectLabel(a.last_inspection.top.defect)} · ${pct(a.last_inspection.top.confidence)}` : "Tanpa temuan") : "—"}</Td>
                <Td><RiskBadge priority={a.priority} /></Td>
                <Td>{a.open_alerts ? <Badge cls="bg-risk-kritis/10 text-risk-kritis" icon="notifications_active">{a.open_alerts}</Badge> : "—"}</Td>
                <Td><a href={`/business/aset/detail?id=${a.asset.id}`} className="whitespace-nowrap font-heading text-sm font-bold text-brand hover:underline">Detail →</a></Td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </div>
  );
}
