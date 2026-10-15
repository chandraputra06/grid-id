import { AdminShell } from "@/components/admin-shell";
import { AuthGuard } from "@/components/auth-guard";

export default function AdminLayout({ children }) {
  return (
    <AuthGuard allow={["admin", "petugas"]}>
      <AdminShell>{children}</AdminShell>
    </AuthGuard>
  );
}