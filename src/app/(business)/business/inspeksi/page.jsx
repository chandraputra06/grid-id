"use client";
import { useState } from "react";
import { DEFECT, dayEndIso, dayStartIso, defectLabel, fmtDateTime, isoToDateInput, pct, qs, useApi, fmtNum } from "@/lib/hardware";
import { Badge, Card, EmptyState, ErrorBox, FilterBar, Loading, PageHeader, RiskBadge, Select, SimBadge, TextInput } from "@/components/hardware/ui";
import { FrameImage } from "@/components/hardware/frame-image";
import { FrameModal } from "@/components/hardware/frame-modal";

const API = "/api/business";

// Temuan AI (frame dengan deteksi YOLO). Kelas & confidence apa adanya dari model — belum diverifikasi kecuali ditandai.
export default function BusinessAiInspections() {
  const [f, setF] = useState({ from: isoToDateInput(new Date(Date.now() - 29 * 864e5).toISOString()), to: isoToDateInput(new Date().toISOString()), asset_id: "", defect: "" });
  const [frameId, setFrameId] = useState(null);
  const set = (k) => (v) => setF((x) => ({ ...x, [k]: v }));
  const assets = useApi(`${API}/assets`);
  const { data, error, loading, reload } = useApi(`${API}/inspections${qs({ from: dayStartIso(f.from), to: dayEndIso(f.to), asset_id: f.asset_id, defect: f.defect, with_detections: "true", inference_status: "done", limit: 120 })}`);
  const items = (data && data.inspections) || [];
  return (
    <div className="space-y-5">
      <PageHeader title="Inspeksi AI" subtitle="Temuan model YOLO pada snapshot perangkat. Hasil model adalah indikasi awal dan bukan verifikasi kerusakan." />
      <FilterBar>
        <TextInput label="Dari tanggal" type="date" value={f.from} onChange={set("from")} />
        <TextInput label="Sampai tanggal" type="date" value={f.to} onChange={set("to")} />
        <Select label="Aset" value={f.asset_id} onChange={set("asset_id")}>
          <option value="">Semua aset</option>
          {((assets.data && assets.data.assets) || []).map((a) => <option key={a.asset.id} value={a.asset.id}>{a.asset.name}</option>)}
        </Select>
        <Select label="Kelas deteksi" value={f.defect} onChange={set("defect")} className="lg:col-span-2">
          <option value="">Semua kelas</option>
          {Object.entries(DEFECT).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </Select>
      </FilterBar>
      <ErrorBox message={error} onRetry={reload} />
      {loading && !data ? <Loading /> : items.length === 0 ? (
        <EmptyState icon="neurology" title="Belum ada temuan AI" text="Tidak ada snapshot dengan deteksi model pada filter ini." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((it) => (
            <Card key={it.frame_id} bodyClass="space-y-3">
              <FrameImage frame={it} className="aspect-[4/3]" onClick={() => setFrameId(it.frame_id)} />
              <div className="flex flex-wrap items-center gap-1.5">
                {it.detections.map((d) => <Badge key={d.id} cls="bg-risk-waspada/10 text-risk-waspada">{defectLabel(d.defect)} {pct(d.confidence)}</Badge>)}
                <SimBadge show={it.source === "simulasi"} />
              </div>
              <div className="font-body-md text-[12px] text-on-surface-variant">
                <p><b className="text-on-surface">{it.asset ? it.asset.name : "—"}</b> · {it.device.name || it.device.device_code}</p>
                <p>Diambil {fmtDateTime(it.captured_at)} · inferensi {fmtDateTime(it.inference_at)}</p>
                <p>Suhu maks. saat itu {it.telemetry ? fmtNum(it.telemetry.max_temp_c, 1, "°C") : "—"}{it.thermal_frame_id ? " · citra thermal tersedia" : ""}</p>
              </div>
              <div className="flex items-center justify-between">
                <RiskBadge priority={it.priority} />
                <button onClick={() => setFrameId(it.frame_id)} className="font-heading text-sm font-bold text-brand hover:underline">Detail →</button>
              </div>
            </Card>
          ))}
        </div>
      )}
      <FrameModal apiBase={API} frameId={frameId} onClose={() => setFrameId(null)} />
    </div>
  );
}
