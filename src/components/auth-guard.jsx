"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { api } from "@/lib/api";

// Client-side guard: requires a session and (optionally) one of the allowed roles.
export function AuthGuard({ allow, children }) {
  const router = useRouter();
  const [state, setState] = useState("checking"); // checking | ok | denied

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        if (active) { setState("denied"); router.replace("/masuk"); }
        return;
      }
      let role = "warga";
      try {
        const me = await api.get("/api/me");
        role = me.role || "warga";
      } catch {
        // ignore; fall through to role check
      }
      if (!active) return;
      if (!allow || allow.includes(role)) {
        setState("ok");
      } else {
        setState("denied");
        router.replace("/masuk");
      }
    })();
    return () => { active = false; };
  }, [allow, router]);

  if (state !== "ok") {
    return (
      <div className="grid min-h-screen place-items-center text-on-surface-variant">
        <p className="font-body-md text-body-md">Memeriksa akses…</p>
      </div>
    );
  }
  return children;
}