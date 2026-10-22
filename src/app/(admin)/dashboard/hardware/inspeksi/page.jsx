"use client";
import { useEffect, useState } from "react";
import { DEFECT, dayEndIso, dayStartIso, defectLabel, downloadCSV, fmtDateTime, isoToDateInput, qs, toCSV, useApi, FOLLOWUP } from "@/lib/hardware";
import { Card, ErrorBox, FilterBar, GhostButton, Loading, PageHeader, Select, TextInput } from "@/components/hardware/ui";
import { InspectionsTable } from "@/components/hardware/inspections-table";
import { FrameModal } from "@/components/hardware/frame-modal";

const API = "/api/hardware";

export default function HardwareInspections() {
  const [f, setF] = useState({
    from: isoToDateInput(new Date(Date.now() - 6 * 864e5).toISOString()), to: isoToDateInput(new Date().toISOString()),
    device_id: "", unit: "", defect: "", inference_status: "",
  });
  const [frameId, setFrameId] = useState(null);
  const set = (k) => (v) => setF((x) => ({ ...x, [k]: v }));
  useEffect(() => {
    const d = new URLSearchParams(window.location.search).get("device_id");
    if (d) setF((x) => ({ ...x, device_id: d }));
  }, []);
  const devs = useApi(`${API}/devices`);
  const { data, error, loading, reload } = useApi(
    `${API}/inspections${qs({ from: dayStartIso(f.from), to: dayEndIso(f.to), device_id: f.device_id, unit: f.unit, defect: f.defect, inference_status: f.inference_status, limit: 200 })}`
  );
  const items = (data && data.inspections) || [];

  function exportCsv() {
    downloadCSV(`inspeksi-hardware_${f.from}_${f.to}.csv`, toCSV(items, [
      { label: "Waktu", value: (i) => fmtDateTime(i.captured_at, true) }, { label: "Frame ID", value: "frame_id" },
      { label: "Perangkat", value: (i) => i.device.device_code }, { label: "Aset", value: (i) => (i.asset ? i.asset.name : "") },
      { label: "Lokasi", value: (i) => (i.asset ? i.asset.unit : "") },
      { label: "Kelas", value: (i) => (i.detections[0] ? defectLabel(i.detections[0].defect) : "") },
      { label: "Confidence", value: (i) => (i.detections[0] ? i.detections[0].confidence : "") },
      { label: "Jumlah deteksi", value: (i) => i.detections.length }, { label: "Suhu maks (C)", value: (i) => (i.telemetry ? i.telemetry.max_temp_c : "") },
      { label: "Prioritas", value: (i) => (i.priority ? i.priority.level : "") }, { label: "Tindak lanjut", value: (i) => (FOLLOWUP[i.followup_status] || {}).label },
      { label: "Model", value: "model_version" }, { label: "Sumber", value: "source" },
    ]));
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Monitoring & Riwayat Inspeksi" subtitle="Snapshot RGB yang sudah diproses model YOLO, lengkap dengan data thermal & telemetri pada waktu pengambilan."
        actions={<GhostButton icon="download" onClick={exportCsv} disabled={!items.length}>Ekspor CSV</GhostButton>} />
      <FilterBar>
        <TextInput label="Dari tanggal" type="date" value={f.from} onChange={set("from")} />
        <TextInput label="Sampai tanggal" type="date" value={f.to} onChange={set("to")} />
        <Select label="Perangkat" value={f.device_id} onChange={set("device_id")}>
          <option value="">Semua perangkat</option>
          {((devs.data && devs.data.devices) || []).map((d) => <option key={d.id} value={d.id}>{d.device_code}{d.name ? ` · ${d.name}` : ""}</option>)}
        </Select>
        <Select label="Lokasi" value={f.unit} onChange={set("unit")}>
          <option value="">Semua lokasi</option>
          {((devs.data && devs.data.units) || []).map((u) => <option key={u} value={u}>{u}</option>)}
        </Select>
        <div className="grid grid-cols-2 gap-2">
          <Select label="Kelas kerusakan" value={f.defect} onChange={set("defect")}>
            <option value="">Semua</option>
            {Object.entries(DEFECT).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </Select>
          <Select label="Status AI" value={f.inference_status} onChange={set("inference_status")}>
            <option value="">Selesai & gagal</option>
            <option value="done">Selesai</option>
            <option value="failed">Gagal</option>
            <option value="pending">Menunggu</option>
            <option value="skipped">Dilewati</option>
          </Select>
        </div>
      </FilterBar>
      <ErrorBox message={error} onRetry={reload} />
      <Card title={`Inspeksi (${items.length}${data && data.has_more ? "+" : ""})`} icon="fact_check">
        {loading && !data ? <Loading /> : <InspectionsTable items={items} onOpen={setFrameId} deviceHref={(id) => `/dashboard/hardware/perangkat/detail?id=${id}`} />}
        {data && data.has_more && <p className="mt-3 font-body-md text-[12px] text-on-surface-variant">Menampilkan 200 inspeksi terbaru. Persempit rentang tanggal untuk melihat lebih banyak.</p>}
      </Card>
      <FrameModal apiBase={API} frameId={frameId} onClose={() => setFrameId(null)} />
    </div>
  );
}
