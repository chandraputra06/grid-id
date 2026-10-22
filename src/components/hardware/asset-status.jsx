"use client";
import { Badge } from "./ui";

export const MONITORING_STATUS = {
  terpantau: { label: "Terpantau", icon: "verified", cls: "bg-risk-aman/10 text-risk-aman" },
  sebagian: { label: "Sebagian perangkat offline", icon: "rule", cls: "bg-risk-waspada/10 text-risk-waspada" },
  offline: { label: "Perangkat offline", icon: "wifi_off", cls: "bg-risk-kritis/10 text-risk-kritis" },
  belum_ada_data: { label: "Belum ada data", icon: "hourglass_empty", cls: "bg-surface-container-low text-on-surface-variant" },
  tanpa_perangkat: { label: "Belum ada perangkat", icon: "do_not_disturb_on", cls: "bg-surface-container-low text-on-surface-variant" },
};

export function MonitoringBadge({ s }) {
  const m = MONITORING_STATUS[s] || MONITORING_STATUS.belum_ada_data;
  return <Badge cls={m.cls} icon={m.icon}>{m.label}</Badge>;
}
