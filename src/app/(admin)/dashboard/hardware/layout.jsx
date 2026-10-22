import { HardwareSubnav } from "@/components/hardware/hardware-subnav";

// Bagian Hardware Monitoring di dalam AdminShell existing (layout (admin) tetap dipakai).
export default function HardwareLayout({ children }) {
  return (
    <div className="space-y-5">
      <HardwareSubnav />
      {children}
    </div>
  );
}
