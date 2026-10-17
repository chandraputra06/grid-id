"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { api } from "@/lib/api";
import { roleHome } from "@/lib/roles";

// Lindungi area berbasis role.
// <AuthGuard allow={["admin","petugas","supervisor","hardware"]}>...</AuthGuard>
// - belum login / error / timeout -> /masuk
// - role tak diizinkan -> diarahkan ke home role-nya
// ANTI-LOOP: bila ditolak, TIDAK pernah redirect balik ke area /dashboard
//   (yang baru saja menolak) — dilempar ke /masuk agar tak berputar.
export function AuthGuard({ allow = [], children }) {
  const router = useRouter();
  const pathname = usePathname();
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

        let role = null;
        try {
          const me = await api.get("/api/me");
          role = me?.role || null;
        } catch {
          role = null;
        }
        clearTimeout(timer);

        if (role && (allow.length === 0 || allow.includes(role))) {
          return finish("ok");
        }

        // Ditolak / role tak dikenal. Hitung tujuan dengan pengaman loop.
        const target = role ? roleHome(role) : "/masuk";
        if (!role || target === pathname || target.startsWith("/dashboard")) {
          finish("denied", "/masuk");
        } else {
          finish("denied", target);
        }
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
        <div className="flex flex-col items-center gap-3">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-outline-variant border-t-brand" />
          <p className="font-body-md text-body-md text-on-surface-variant">
            {state === "denied" ? "Mengalihkan…" : "Memeriksa akses…"}
          </p>
        </div>
      </div>
    );
  }
  return children;
}

export default AuthGuard;