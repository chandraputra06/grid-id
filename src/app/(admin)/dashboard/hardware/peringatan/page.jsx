"use client";
import { useEffect, useState } from "react";
import { ALERT_CATEGORY, ALERT_PRIORITY, ALERT_STATUS, dayEndIso, dayStartIso, downloadCSV, fmtDateTime, isoToDateInput, qs, toCSV, useApi } from "@/lib/hardware";
import { Card, Chips, ErrorBox, FilterBar, GhostButton, Loading, PageHeader, Select, TextInput } from "@/components/hardware/ui";
import { AlertsList } from "@/components/hardware/alerts-list";
import { FrameModal } from "@/components/hardware/frame-modal";

const API = "/api/hardware";

export default function HardwareAlerts() {
  const [f, setF] = useState({
    status: "terbuka", category: "", priority: "", unit: "", device_id: "",
    from: isoToDateInput(new Date(Date.now() - 29 * 864e5).toISOString()), to: isoToDateInput(new Date().toISOString()),
  });
  const [frameId, setFrameId] = useState(null);
  const set = (k) => (v) => setF((x) => ({ ...x, [k]: v }));
  useEffect(() => {
    const d = new URLSearchParams(window.location.search).get("device_id");
    if (d) setF((x) => ({ ...x, device_id: d, status: "" }));
  }, []);
  const me = useApi("/api/me");
  const devs = useApi(`${API}/devices`);
  const { data, error, loading, reload } = useApi(
    `${API}/alerts${qs({ status: f.status, category: f.category, priority: f.priority, unit: f.unit, device_id: f.device_id, from: dayStartIso(f.from), to: dayEndIso(f.to), limit: 300 })}`,
    { intervalMs: 30000 }
  );
  const alerts = (data && data.alerts) || [];
  const role = me.data && me.data.role;
  const canAct = role === "admin" || role === "supervisor";

  function exportCsv() {
    downloadCSV(`peringatan-hardware_${f.from}_${f.to}.csv`, toCSV(alerts, [
      { label: "Kategori", value: (a) => (ALERT_CATEGORY[a.category] || {}).label || a.category }, { label: "Prioritas", value: (a) => ALERT_PRIORITY[a.priority].label },
      { label: "Status", value: (a) => ALERT_STATUS[a.status].label }, { label: "Kondisi aktif", value: (a) => (a.active ? "Ya" : "Tidak") },
      { label: "Perangkat", value: (a) => a.device.device_code }, { label: "Aset", value: (a) => (a.asset ? a.asset.name : "") },
      { label: "Lokasi", value: (a) => (a.asset ? a.asset.unit : "") }, { label: "Pertama", value: (a) => fmtDateTime(a.first_seen_at, true) },
      { label: "Terakhir", value: (a) => fmtDateTime(a.last_seen_at, true) }, { label: "Jumlah", value: "occurrences" },
      { label: "Nilai pemicu", value: "trigger_value" }, { label: "Satuan", value: "trigger_unit" }, { label: "Ambang", value: "threshold" },
      { label: "Pesan", value: "message" }, { label: "Catatan", value: "note" },
    ]));
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Peringatan & Tindak Lanjut"
        subtitle="Peringatan otomatis dari telemetri, konektivitas, upload gambar, dan hasil AI. Setiap peringatan adalah indikasi yang perlu diverifikasi — bukan vonis kerusakan."
        actions={<GhostButton icon="download" onClick={exportCsv} disabled={!alerts.length}>Ekspor CSV</GhostButton>} />
      <Chips items={[{ key: "terbuka", label: "Terbuka" }, { key: "baru", label: "Baru" }, { key: "ditinjau", label: "Ditinjau" }, { key: "selesai", label: "Selesai" }, { key: "", label: "Semua" }]}
        value={f.status} onChange={set("status")} />
      <FilterBar>
        <Select label="Kategori" value={f.category} onChange={set("category")}>
          <option value="">Semua kategori</option>
          {Object.entries(ALERT_CATEGORY).map(([k, m]) => <option key={k} value={k}>{m.label}</option>)}
        </Select>
        <Select label="Prioritas" value={f.priority} onChange={set("priority")}>
          <option value="">Semua prioritas</option>
          {Object.entries(ALERT_PRIORITY).map(([k, m]) => <option key={k} value={k}>{m.label}</option>)}
        </Select>
        <Select label="Lokasi / perangkat" value={f.device_id || f.unit} onChange={(v) => {
          const isDev = ((devs.data && devs.data.devices) || []).some((d) => d.id === v);
          setF((x) => ({ ...x, device_id: isDev ? v : "", unit: isDev ? "" : v }));
        }}>
          <option value="">Semua</option>
          <optgroup label="Lokasi">{((devs.data && devs.data.units) || []).map((u) => <option key={u} value={u}>{u}</option>)}</optgroup>
          <optgroup label="Perangkat">{((devs.data && devs.data.devices) || []).map((d) => <option key={d.id} value={d.id}>{d.device_code}</option>)}</optgroup>
        </Select>
        <TextInput label="Dari tanggal" type="date" value={f.from} onChange={set("from")} />
        <TextInput label="Sampai tanggal" type="date" value={f.to} onChange={set("to")} />
      </FilterBar>
      <ErrorBox message={error} onRetry={reload} />
      {!canAct && me.data && <p className="font-body-md text-[12px] text-on-surface-variant">Role Anda ({role}) hanya dapat melihat peringatan. Perubahan status dilakukan Supervisor/Admin.</p>}
      <Card title={`Peringatan (${alerts.length})`} icon="notifications_active">
        {loading && !data ? <Loading /> : (
          <AlertsList alerts={alerts} canAct={canAct} onChanged={reload} onOpenFrame={setFrameId} deviceHref={(id) => `/dashboard/hardware/perangkat/detail?id=${id}`} />
        )}
      </Card>
      <FrameModal apiBase={API} frameId={frameId} onClose={() => setFrameId(null)} />
    </div>
  );
}
