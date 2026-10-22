"use client";
import { useState } from "react";
import { qs, useApi } from "@/lib/hardware";
import { Card, Loading, PageHeader } from "@/components/hardware/ui";
import { ReportView } from "@/components/hardware/report-view";
import { InspectionsTable } from "@/components/hardware/inspections-table";
import { FrameModal } from "@/components/hardware/frame-modal";
import { useBusinessOrg } from "@/components/business-shell";

const API = "/api/business";

export default function BusinessReport() {
  const { org } = useBusinessOrg();
  const assets = useApi(`${API}/assets`);
  const findings = useApi(`${API}/inspections${qs({ from: new Date(Date.now() - 30 * 864e5).toISOString(), with_detections: "true", inference_status: "done", limit: 50 })}`);
  const [frameId, setFrameId] = useState(null);
  return (
    <div className="space-y-5">
      <PageHeader title="Laporan" subtitle="Ringkasan inspeksi, riwayat temuan, tren kondisi aset, dan peringatan per periode — dapat diekspor ke CSV atau dicetak/PDF." />
      <ReportView apiBase={API} unitOptions={(assets.data && assets.data.units) || []} audience="b2b" orgName={org && org.name} />
      <Card title="Gambar terkait temuan (30 hari terakhir)" icon="photo_library">
        {findings.loading && !findings.data ? <Loading /> : (
          <InspectionsTable items={(findings.data && findings.data.inspections) || []} onOpen={setFrameId} deviceHref={(id) => `/business/perangkat/detail?id=${id}`} showFollowup={false} />
        )}
      </Card>
      <FrameModal apiBase={API} frameId={frameId} onClose={() => setFrameId(null)} />
    </div>
  );
}
