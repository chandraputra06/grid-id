"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { supabase } from "@/lib/supabase";

const ROLE_META = {
  admin: { label: "Admin", cls: "bg-brand/10 text-brand", desc: "Akses penuh: dashboard, prioritas, verifikasi, dan manajemen user." },
  petugas: { label: "Petugas", cls: "bg-risk-waspada/10 text-risk-waspada", desc: "Akses dashboard, prioritas, dan verifikasi laporan di lapangan." },
  warga: { label: "Warga", cls: "bg-risk-aman/10 text-risk-aman", desc: "Mengirim laporan kondisi aset lewat halaman publik." },
};

function initials(name, email) {
  const src = (name || "").trim() || (email || "").trim();
  if (!src) return "?";
  const parts = src.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return src.slice(0, 2).toUpperCase();
}

export default function Profil() {
  const router = useRouter();
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [out, setOut] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/masuk");
        return;
      }
      try {
        const data = await api.get("/api/me");
        setMe(data);
      } catch (e) {
        setErr(e?.message || "Gagal memuat profil.");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  async function logout() {
    if (out) return;
    setOut(true);
    try {
      await supabase.auth.signOut();
    } finally {
      router.replace("/masuk");
    }
  }

  const meta = me ? ROLE_META[me.role] || ROLE_META.warga : null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-extrabold text-on-surface">Profil Saya</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">Informasi akun yang sedang login.</p>
      </div>

      {loading ? (
        <p className="py-10 text-center font-body-md text-body-md text-on-surface-variant">Memuat…</p>
      ) : err ? (
        <p className="rounded-lg bg-risk-kritis/10 px-3 py-2 text-[13px] font-semibold text-risk-kritis">{err}</p>
      ) : (
        <div className="rounded-2xl border border-outline-variant bg-card-surface p-6 shadow-sm">
          {/* Header kartu: avatar + nama */}
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-brand/10 font-heading text-2xl font-extrabold text-brand ring-2 ring-brand/20">
              {initials(me.full_name, me.email)}
            </div>
            <div className="min-w-0">
              <h2 className="truncate font-heading text-xl font-bold text-on-surface">{me.full_name || "Tanpa Nama"}</h2>
              <p className="truncate font-body-md text-body-md text-on-surface-variant">{me.email}</p>
              {meta && (
                <span className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold ${meta.cls}`}>{meta.label}</span>
              )}
            </div>
          </div>

          {meta && (
            <p className="mt-4 rounded-xl bg-surface-variant/40 px-4 py-3 font-body-md text-[13px] text-on-surface-variant">{meta.desc}</p>
          )}

          {/* Detail */}
          <dl className="mt-5 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
            <Info icon="badge" label="Nama Lengkap" value={me.full_name} />
            <Info icon="mail" label="Email" value={me.email} />
            <Info icon="shield_person" label="Role" value={meta?.label} />
            <Info icon="call" label="No. HP" value={me.phone} />
            <Info icon="apartment" label="Unit" value={me.unit} />
          </dl>

          {/* Logout */}
          <div className="mt-6 border-t border-outline-variant pt-5">
            <button onClick={logout} disabled={out}
              className="flex items-center justify-center gap-2 rounded-full border border-risk-kritis/30 bg-risk-kritis/5 px-5 py-2.5 font-label-bold text-label-bold text-risk-kritis transition-all hover:bg-risk-kritis/10 active:scale-95 disabled:opacity-60">
              <span className="material-symbols-outlined text-[18px]">{out ? "hourglass_top" : "logout"}</span>
              {out ? "Keluar…" : "Logout"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Info({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <span className="material-symbols-outlined mt-0.5 text-[20px] text-brand">{icon}</span>
      <div className="min-w-0">
        <dt className="font-label-sm text-label-sm text-on-surface-variant">{label}</dt>
        <dd className="truncate font-body-md text-[14px] font-semibold text-on-surface">{value || "—"}</dd>
      </div>
    </div>
  );
}