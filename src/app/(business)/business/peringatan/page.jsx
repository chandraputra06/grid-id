"use client";
import { useState } from "react";
import { ALERT_CATEGORY, dayEndIso, dayStartIso, isoToDateInput, qs, useApi } from "@/lib/hardware";
import { Card, Chips, ErrorBox, FilterBar, Loading, PageHeader, Select, TextInput } from "@/components/hardware/ui";
import { AlertsList } from "@/components/hardware/alerts-list";
import { FrameModal } from "@/components/hardware/frame-modal";

const API = "/api/business";

export default function BusinessAlerts() {
  const [f, setF] = useState({ status: "terbuka", category: "", unit: "", from: isoToDateInput(new Date(Date.now() - 29 * 864e5).toISOString()), to: isoToDateInput(new Date().toISOString()) });
  const [frameId, setFrameId] = useState(null);
  const set = (k) => (v) => setF((x) => ({ ...x, [k]: v }));
  const assets = useApi(`${API}/assets`);
  const { data, error, loading, reload } = useApi(`${API}/alerts${qs({ status: f.status, category: f.category, unit: f.unit, from: dayStartIso(f.from), to: dayEndIso(f.to), limit: 300 })}`, { intervalMs: 60000 });
  const alerts = (data && data.alerts) || [];
  return (
    <div className="space-y-5">
      <PageHeader title="Peringatan" subtitle="Peringatan yang berkaitan dengan aset organisasi Anda. Status tindak lanjut dikelola tim operasional GRID·ID / PLN." />
      <Chips items={[{ key: "terbuka", label: "Terbuka" }, { key: "selesai", label: "Selesai" }, { key: "", label: "Semua" }]} value={f.status} onChange={set("status")} />
      <FilterBar>
        <TextInput label="Dari tanggal" type="date" value={f.from} onChange={set("from")} />
        <TextInput label="Sampai tanggal" type="date" value={f.to} onChange={set("to")} />
        <Select label="Lokasi" value={f.unit} onChange={set("unit")}>
          <option value="">Semua lokasi</option>
          {((assets.data && assets.data.units) || []).map((u) => <option key={u} value={u}>{u}</option>)}
        </Select>
        <Select label="Kategori" value={f.category} onChange={set("category")} className="lg:col-span-2">
          <option value="">Semua kategori</option>
          {Object.entries(ALERT_CATEGORY).map(([k, m]) => <option key={k} value={k}>{m.label}</option>)}
        </Select>
      </FilterBar>
      <ErrorBox message={error} onRetry={reload} />
      <Card title={`Peringatan (${alerts.length})`} icon="notifications_active">
        {loading && !data ? <Loading /> : <AlertsList alerts={alerts} canAct={false} onOpenFrame={setFrameId} deviceHref={(id) => `/business/perangkat/detail?id=${id}`} />}
      </Card>
      <FrameModal apiBase={API} frameId={frameId} onClose={() => setFrameId(null)} />
    </div>
  );
}
