"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { api } from "@/lib/api";
import { roleHome } from "@/lib/roles";

// Lindungi area berbasis role.
// <AuthGuard allow={["admin","petugas","supervisor"]}>...</AuthGuard>
// - belum login / error / timeout -> /masuk
// - role tak diizinkan -> diarahkan ke home role-nya
export function AuthGuard({ allow = [], children }) {
  const router = useRouter();
  const [state, setState] = useState("checking"); // checking | ok | denied

  useEffect(() => {
    let done = false;
    const finish = (s, to) => {
      if (done) return;
      done = true;
      setState(s);
      if (to) router.replace(to);
    };

    // Failsafe: jangan pernah menggantung lebih dari 8 detik.
    const timer = setTimeout(() => finish("denied", "/masuk"), 8000);

    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const session = data?.session;
        if (!session) {
          clearTimeout(timer);
          return finish("denied", "/masuk");
        }
        let role = "warga";
        try {
          const me = await api.get("/api/me");
          role = me?.role || "warga";
        } catch {
          // gagal ambil profil -> tetap lanjut dengan asumsi role minimal
        }
        clearTimeout(timer);
        if (allow.length === 0 || allow.includes(role)) finish("ok");
        else finish("denied", roleHome(role));
      } catch {
        clearTimeout(timer);
        finish("denied", "/masuk");
      }
    })();

    return () => {
      done = true;
      clearTimeout(timer);
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