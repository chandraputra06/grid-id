"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { api } from "@/lib/api";
import { roleHome } from "@/lib/roles";

// Lindungi area berbasis role.
// <AuthGuard allow={["admin","petugas","supervisor"]}>...</AuthGuard>
// - belum login  -> /masuk
// - role tak diizinkan -> diarahkan ke home role-nya
export function AuthGuard({ allow = [], children }) {
  const router = useRouter();
  const [state, setState] = useState("checking"); // checking | ok | denied

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        if (!cancelled) router.replace("/masuk");
        return;
      }
      let role = "warga";
      try {
        const me = await api.get("/api/me");
        role = me.role || "warga";
      } catch {
        // gagal ambil profil -> perlakukan sebagai belum berwenang
      }
      if (cancelled) return;
      if (allow.length === 0 || allow.includes(role)) {
        setState("ok");
      } else {
        setState("denied");
        router.replace(roleHome(role));
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (state !== "ok") {
    return (
      <div className="grid min-h-screen place-items-center bg-surface-container-low">
        <p className="font-body-md text-body-md text-on-surface-variant">
          {state === "denied" ? "Mengalihkan…" : "Memeriksa akses…"}
        </p>
      </div>
    );
  }
  return children;
}

export default AuthGuard;