"use client";
import { useQueryParam } from "@/lib/hardware";
import { DeviceDetail } from "@/components/hardware/device-detail";
import { Loading } from "@/components/hardware/ui";

// Mode b2b: hanya baca — tanpa kontrol perangkat, tanpa ubah status peringatan.
export default function BusinessDeviceDetail() {
  const id = useQueryParam("id");
  if (id === null) return <Loading />;
  return (
    <DeviceDetail deviceId={id} apiBase="/api/business" mode="b2b" backHref="/business/perangkat"
      inspectionsHref="/business/riwayat" alertsHref="/business/peringatan" />
  );
}
