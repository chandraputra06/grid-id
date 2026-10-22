"use client";
import { useApi, useQueryParam } from "@/lib/hardware";
import { DeviceDetail } from "@/components/hardware/device-detail";
import { Loading } from "@/components/hardware/ui";

export default function HardwareDeviceDetail() {
  const id = useQueryParam("id");
  const me = useApi("/api/me");
  if (id === null || (me.loading && !me.data)) return <Loading />;
  return (
    <DeviceDetail
      deviceId={id}
      apiBase="/api/hardware"
      mode="staff"
      role={me.data && me.data.role}
      backHref="/dashboard/hardware/perangkat"
      inspectionsHref={`/dashboard/hardware/inspeksi?device_id=${id}`}
      alertsHref={`/dashboard/hardware/peringatan?device_id=${id}`}
    />
  );
}
