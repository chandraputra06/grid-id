"use client";
// Sub-navigasi bagian "Hardware Monitoring" di Dashboard Supervisor PLN.
// Menu utama di sidebar AdminShell cukup satu entri: /dashboard/hardware.
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/dashboard/hardware", label: "Overview", icon: "dashboard" },
  { href: "/dashboard/hardware/perangkat", label: "Perangkat", icon: "memory" },
  { href: "/dashboard/hardware/inspeksi", label: "Inspeksi", icon: "fact_check" },
  { href: "/dashboard/hardware/peringatan", label: "Peringatan", icon: "notifications_active" },
  { href: "/dashboard/hardware/laporan", label: "Laporan", icon: "summarize" },
  { href: "/dashboard/hardware/pengaturan", label: "Aturan Peringatan", icon: "tune" },
];

export function HardwareSubnav() {
  const path = (usePathname() || "").replace(/\/$/, "");
  return (
    <nav aria-label="Hardware Monitoring" data-print-hide className="-mx-1 flex gap-1 overflow-x-auto border-b border-outline-variant pb-px">
      {TABS.map((t) => {
        const active = t.href === "/dashboard/hardware" ? path === t.href : path.startsWith(t.href);
        return (
          <a key={t.href} href={t.href}
            className={`flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2 font-heading text-sm font-bold transition-colors ${
              active ? "border-brand text-brand" : "border-transparent text-on-surface-variant hover:text-on-surface"
            }`}>
            <span className="material-symbols-outlined text-[18px]">{t.icon}</span>
            {t.label}
          </a>
        );
      })}
    </nav>
  );
}
