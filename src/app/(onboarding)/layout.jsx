import { AuthGuard } from "@/components/auth-guard";
import { AdminShell } from "@/components/admin-shell";
import { STAFF_ROLES } from "@/lib/roles";

export default function DashboardLayout({ children }) {
  return (
    <AuthGuard allow={STAFF_ROLES}>
      <AdminShell>{children}</AdminShell>
    </AuthGuard>
  );
}