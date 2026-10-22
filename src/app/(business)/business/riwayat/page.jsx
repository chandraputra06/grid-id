"use client";
import { useState } from "react";
import { dayEndIso, dayStartIso, downloadCSV, fmtDateTime, isoToDateInput, qs, toCSV, useApi, defectLabel } from "@/lib/hardware";
import { Card, Chips, ErrorBox, FilterBar, GhostButton, Loading, PageHeader, Select, TextInput } from "@/components/hardware/ui";
import { InspectionsTable } from "@/components/hardware/inspections-table";
import { SnapshotGallery } from "@/components/hardware/snapshot-gallery";
import { FrameModal } from "@/components/hardware/frame-modal";

const API = "/api/business";

// Riwayat kronologis seluruh inspeksi (termasuk tanpa temuan) + galeri gambar.
export default function BusinessHistory() {
  const [view, setView] = useState("tabel");
  const [f, setF] = useState({ from: isoToDateInput(new Date(Date.now() - 13 * 864e5).toISOString()), to: isoToDateInput(new Date().toISOString()), asset_id: "" });
  const [frameId, setFrameId] = useState(null);
  const set = (k) => (v) => setF((x) => ({ ...x, [k]: v }));
  const assets = useApi(`${API}/assets`);
  const { data, error, loading, reload } = useApi(view === "tabel" ? `${API}/inspections${qs({ from: dayStartIso(f.from), to: dayEndIso(f.to), asset_id: f.asset_id, limit: 200 })}` : null);
  const items = (data && data.inspections) || [];

  function exportCsv() {
    downloadCSV(`riwayat-inspeksi_${f.from}_${f.to}.csv`, toCSV(items, [
      { label: "Waktu", value: (i) => fmtDateTime(i.captured_at, true) }, { label: "Aset", value: (i) => (i.asset ? i.asset.name : "") },
      { label: "Perangkat", value: (i) => i.device.device_code }, { label: "Status AI", value: "inference_status" },
      { label: "Temuan", value: (i) => i.detections.map((d) => `${defectLabel(d.defect)} (${Math.round(d.confidence * 100)}%)`).join("; ") },
      { label: "Suhu maks (C)", value: (i) => (i.telemetry ? i.telemetry.max_temp_c : "") }, { label: "Sumber", value: "source" },
    ]));
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Riwayat Inspeksi" subtitle="Seluruh inspeksi otomatis pada aset Anda secara kronologis, termasuk yang tidak menemukan kerusakan."
        actions={view === "tabel" && <GhostButton icon="download" onClick={exportCsv} disabled={!items.length}>Ekspor CSV</GhostButton>} />
      <Chips items={[{ key: "tabel", label: "Tabel inspeksi" }, { key: "galeri", label: "Galeri gambar" }]} value={view} onChange={setView} />
      <FilterBar>
        <Select label="Aset" value={f.asset_id} onChange={set("asset_id")} className="lg:col-span-2">
          <option value="">Semua aset</option>
          {((assets.data && assets.data.assets) || []).map((a) => <option key={a.asset.id} value={a.asset.id}>{a.asset.name} · {a.asset.asset_code}</option>)}
        </Select>
        {view === "tabel" && <TextInput label="Dari tanggal" type="date" value={f.from} onChange={set("from")} />}
        {view === "tabel" && <TextInput label="Sampai tanggal" type="date" value={f.to} onChange={set("to")} />}
      </FilterBar>
      {view === "tabel" ? (
        <>
          <ErrorBox message={error} onRetry={reload} />
          <Card title={`Inspeksi (${items.length}${data && data.has_more ? "+" : ""})`} icon="history">
            {loading && !data ? <Loading /> : <InspectionsTable items={items} onOpen={setFrameId} deviceHref={(id) => `/business/perangkat/detail?id=${id}`} showFollowup={false} />}
          </Card>
        </>
      ) : (
        <Card title="Galeri gambar inspeksi" icon="photo_library">
          <SnapshotGallery apiBase={API} assetId={f.asset_id || undefined} onOpen={setFrameId} pageSize={24} />
        </Card>
      )}
      <FrameModal apiBase={API} frameId={frameId} onClose={() => setFrameId(null)} />
    </div>
  );
}
