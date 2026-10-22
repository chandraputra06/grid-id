import { AuthGuard } from "@/components/auth-guard";
import { BusinessShell } from "@/components/business-shell";

// GRID.ID Business Portal — hanya role b2b. Pembatasan data per organisasi ditegakkan di backend (/api/business).
export default function BusinessLayout({ children }) {
  return (
    <AuthGuard allow={["b2b"]}>
      <BusinessShell>{children}</BusinessShell>
    </AuthGuard>
  );
}
