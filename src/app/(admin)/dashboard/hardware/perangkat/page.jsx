"use client";
import { useState } from "react";
import { CONNECTION, RISK, dayEndIso, dayStartIso, downloadCSV, fmtDateTime, qs, toCSV, useApi, defectLabel } from "@/lib/hardware";
import { Card, ErrorBox, FilterBar, GhostButton, Loading, PageHeader, Select, TextInput } from "@/components/hardware/ui";
import { DevicesTable } from "@/components/hardware/devices-table";

const API = "/api/hardware";

export default function HardwareDevices() {
  const [f, setF] = useState({ q: "", unit: "", status: "", priority: "", from: "", to: "" });
  const set = (k) => (v) => setF((x) => ({ ...x, [k]: v }));
  const { data, error, loading, reload } = useApi(
    `${API}/devices${qs({ q: f.q, unit: f.unit, status: f.status, priority: f.priority, from: dayStartIso(f.from), to: dayEndIso(f.to) })}`,
    { intervalMs: 30000 }
  );
  const devices = (data && data.devices) || [];

  function exportCsv() {
    downloadCSV(`perangkat-hardware_${new Date().toISOString().slice(0, 10)}.csv`, toCSV(devices, [
      { label: "ID perangkat", value: "device_code" }, { label: "Nama", value: "name" },
      { label: "Aset", value: (d) => (d.asset ? d.asset.name : "") }, { label: "Kode aset", value: (d) => (d.asset ? d.asset.asset_code : "") },
      { label: "Lokasi", value: (d) => (d.asset ? d.asset.unit : "") }, { label: "Status", value: (d) => CONNECTION[d.connection].label },
      { label: "Telemetri terakhir", value: (d) => fmtDateTime(d.last_telemetry_at, true) },
      { label: "Suhu maks (C)", value: (d) => (d.latest ? d.latest.max_temp_c : "") }, { label: "Suara (dB)", value: (d) => (d.latest ? d.latest.sound_level_db : "") },
      { label: "Gas (raw)", value: (d) => (d.latest ? d.latest.gas_raw : "") },
      { label: "Hasil AI terakhir", value: (d) => (d.last_ai ? (d.last_ai.top ? defectLabel(d.last_ai.top.defect) : "Tanpa temuan") : "") },
      { label: "Prioritas", value: (d) => (d.priority ? RISK[d.priority.level].label : "Belum dinilai") }, { label: "Peringatan terbuka", value: "open_alerts" },
    ]));
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Manajemen Perangkat"
        subtitle="Kondisi setiap perangkat hardware GRID·ID. Registrasi perangkat baru tetap melalui menu Perangkat IoT."
        actions={<><GhostButton icon="download" onClick={exportCsv} disabled={!devices.length}>Ekspor CSV</GhostButton><GhostButton icon="refresh" onClick={reload}>Muat ulang</GhostButton></>}
      />
      <FilterBar>
        <TextInput label="Cari" value={f.q} onChange={set("q")} placeholder="ID, nama, gardu…" />
        <Select label="Lokasi" value={f.unit} onChange={set("unit")}>
          <option value="">Semua lokasi</option>
          {((data && data.units) || []).map((u) => <option key={u} value={u}>{u}</option>)}
        </Select>
        <Select label="Status" value={f.status} onChange={set("status")}>
          <option value="">Semua status</option>
          {Object.entries(CONNECTION).map(([k, m]) => <option key={k} value={k}>{m.label}</option>)}
        </Select>
        <Select label="Prioritas inspeksi" value={f.priority} onChange={set("priority")}>
          <option value="">Semua prioritas</option>
          {Object.entries(RISK).map(([k, m]) => <option key={k} value={k}>{m.label}</option>)}
          <option value="belum">Belum dinilai</option>
        </Select>
        <div className="grid grid-cols-2 gap-2">
          <TextInput label="Update dari" type="date" value={f.from} onChange={set("from")} />
          <TextInput label="sampai" type="date" value={f.to} onChange={set("to")} />
        </div>
      </FilterBar>
      <ErrorBox message={error} onRetry={reload} />
      <Card title={`Daftar perangkat (${devices.length})`} icon="lan">
        {loading && !data ? <Loading /> : <DevicesTable devices={devices} detailHref={(id) => `/dashboard/hardware/perangkat/detail?id=${id}`} />}
        <p className="mt-3 font-body-md text-[11px] text-on-surface-variant">Prioritas inspeksi = level Risk Score aset terakhir (mekanisme penilaian GRID·ID existing). Diperbarui otomatis tiap 30 detik.</p>
      </Card>
    </div>
  );
}
