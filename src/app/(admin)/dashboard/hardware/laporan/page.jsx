"use client";
import { useApi } from "@/lib/hardware";
import { PageHeader } from "@/components/hardware/ui";
import { ReportView } from "@/components/hardware/report-view";

export default function HardwareReport() {
  const devs = useApi("/api/hardware/devices");
  return (
    <div className="space-y-5">
      <PageHeader title="Laporan Supervisor — Hardware" subtitle="Statistik inspeksi, hasil AI, status perangkat, dan peringatan berdasarkan data nyata pada periode & lokasi terpilih." />
      <ReportView apiBase="/api/hardware" unitOptions={(devs.data && devs.data.units) || []} audience="supervisor" />
    </div>
  );
}
