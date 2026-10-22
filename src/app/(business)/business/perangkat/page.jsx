"use client";
import { useState } from "react";
import { CONNECTION, qs, useApi } from "@/lib/hardware";
import { Card, ErrorBox, FilterBar, Loading, PageHeader, Select, TextInput } from "@/components/hardware/ui";
import { DevicesTable } from "@/components/hardware/devices-table";

export default function BusinessDevices() {
  const [f, setF] = useState({ q: "", unit: "", status: "" });
  const set = (k) => (v) => setF((x) => ({ ...x, [k]: v }));
  const { data, error, loading, reload } = useApi(`/api/business/devices${qs(f)}`, { intervalMs: 30000 });
  const devices = (data && data.devices) || [];
  return (
    <div className="space-y-5">
      <PageHeader title="Perangkat" subtitle="Perangkat GRID·ID yang terpasang pada aset organisasi Anda." />
      <FilterBar>
        <TextInput label="Cari" value={f.q} onChange={set("q")} placeholder="ID perangkat atau aset" className="lg:col-span-2" />
        <Select label="Lokasi" value={f.unit} onChange={set("unit")}>
          <option value="">Semua lokasi</option>
          {((data && data.units) || []).map((u) => <option key={u} value={u}>{u}</option>)}
        </Select>
        <Select label="Status" value={f.status} onChange={set("status")} className="lg:col-span-2">
          <option value="">Semua status</option>
          {Object.entries(CONNECTION).map(([k, m]) => <option key={k} value={k}>{m.label}</option>)}
        </Select>
      </FilterBar>
      <ErrorBox message={error} onRetry={reload} />
      <Card title={`Perangkat (${devices.length})`} icon="memory">
        {loading && !data ? <Loading /> : <DevicesTable devices={devices} detailHref={(id) => `/business/perangkat/detail?id=${id}`} />}
      </Card>
    </div>
  );
}
