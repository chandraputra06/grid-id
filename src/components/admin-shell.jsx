"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { api } from "@/lib/api";

const groups = [
  {
    label: "Operasional",
    items: [
      { icon: "dashboard", label: "Beranda", href: "/dashboard" },
      { icon: "monitoring", label: "Monitoring", href: "/dashboard/monitoring" },
      { icon: "sort", label: "Prioritas Aset", href: "/dashboard/prioritas" },
      { icon: "description", label: "Laporan", href: "/dashboard/laporan" },
      { icon: "analytics", label: "Analisis", href: "/dashboard/analisis" },
    ],
  },
  {
    label: "Ekosistem",
    items: [
      { icon: "hub", label: "Pemetaan Grid", href: "/dashboard/pemetaan" },
      { icon: "redeem", label: "Program Reward", href: "/dashboard/reward" },
      { icon: "groups", label: "Panel Mitra", href: "/dashboard/mitra" },
      { icon: "settings", label: "Pengaturan", href: "/dashboard/pengaturan" },
    ],
  },
];

// Menu khusus hardware (tim alat)
const hardwareGroup = {
  label: "Perangkat",
  items: [{ icon: "sensors", label: "Perangkat IoT", href: "/dashboard/perangkat" }],
};
// Menu khusus petugas (lapangan)
const petugasGroup = {
  label: "Lapangan",
  items: [{ icon: "assignment", label: "Tugas Saya", href: "/dashboard/tugas" }],
};
// Menu khusus supervisor/admin
const superGroup = {
  label: "Supervisi",
  items: [{ icon: "fact_check", label: "Verifikasi", href: "/dashboard/verifikasi" }],
};
// Menu khusus admin
const adminGroup = {
  label: "Administrasi",
  items: [{ icon: "manage_accounts", label: "Manajemen User", href: "/dashboard/pengguna" }],
};

function initials(name, email) {
  const src = (name || "").trim() || (email || "").trim();
  if (!src) return "A";
  const parts = src.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return src.slice(0, 2).toUpperCase();
}

function Sidebar({ pathname, onNavigate, navGroups, onLogout, busy }) {
  return (
    <div className="flex h-full w-64 flex-col bg-[#0f1c3f] text-white/70">
      <div className="flex items-center gap-2.5 border-b border-white/10 px-5 py-4">
        <img src="/grid-logos.png" alt="GRID ID" width="30" height="30" className="shrink-0 object-contain" />
        <div className="leading-tight">
          <div className="font-heading text-lg font-extrabold text-white">GRID<span className="text-accent">·</span>ID</div>
          <div className="font-body-md text-[11px] text-white/45">Infrastruktur Nasional</div>
        </div>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {navGroups.map((g) => (
          <div key={g.label}>
            <p className="px-3 pb-2 font-heading text-[10px] font-bold uppercase tracking-wider text-white/35">{g.label}</p>
            <ul className="space-y-1">
              {g.items.map((it) => {
                const active = it.href !== "#" && (it.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(it.href));
                return (
                  <li key={it.label}>
                    <Link
                      href={it.href}
                      onClick={onNavigate}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 font-heading text-sm font-bold transition-colors ${
                        active ? "bg-brand text-white shadow-lg" : "text-white/70 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">{it.icon}</span>
                      {it.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="space-y-1 border-t border-white/10 p-3">
        <Link href="/" onClick={onNavigate} className="flex items-center gap-3 rounded-xl px-3 py-2.5 font-heading text-sm font-bold text-white/70 hover:bg-white/10 hover:text-white">
          <span className="material-symbols-outlined text-[20px]">language</span> Beranda Website
        </Link>
        <Link href="/profil" onClick={onNavigate} className="flex items-center gap-3 rounded-xl px-3 py-2.5 font-heading text-sm font-bold text-white/70 hover:bg-white/10 hover:text-white">
          <span className="material-symbols-outlined text-[20px]">account_circle</span> Profil Saya
        </Link>
        <Link href="#" className="flex items-center gap-3 rounded-xl px-3 py-2.5 font-heading text-sm font-bold text-white/70 hover:bg-white/10 hover:text-white">
          <span className="material-symbols-outlined text-[20px]">support_agent</span> Bantuan Teknis
        </Link>
        <button
          onClick={onLogout}
          disabled={busy}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 font-heading text-sm font-bold text-red-300 transition-colors hover:bg-white/10 disabled:opacity-60"
        >
          <span className="material-symbols-outlined text-[20px]">{busy ? "hourglass_top" : "logout"}</span> {busy ? "Keluar…" : "Keluar"}
        </button>
      </div>
    </div>
  );
}

export function AdminShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawer, setDrawer] = useState(false);
  const [me, setMe] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get("/api/me");
        setMe(data);
      } catch {
        setMe(null);
      }
    })();
  }, []);

  async function logout() {
    if (busy) return;
    setBusy(true);
    try {
      await supabase.auth.signOut();
    } finally {
      setBusy(false);
      router.replace("/masuk");
    }
  }

  const navGroups = [...groups];
  if (me?.role === "petugas" || me?.role === "admin") navGroups.push(petugasGroup);
  if (me?.role === "supervisor" || me?.role === "admin") navGroups.push(superGroup);
  if (me?.role === "supervisor")
    navGroups.push({ label: "Pengelolaan", items: [{ icon: "manage_accounts", label: "Manajemen Petugas", href: "/dashboard/pengguna" }] });
  if (me?.role === "hardware" || me?.role === "admin") navGroups.push(hardwareGroup);
  if (me?.role === "admin") navGroups.push(adminGroup);

  return (
    <div className="flex min-h-screen bg-surface-container-low">
      <aside className="sticky top-0 hidden h-screen shrink-0 lg:block">
        <Sidebar pathname={pathname} navGroups={navGroups} onLogout={logout} busy={busy} />
      </aside>

      {drawer && (
        <div className="fixed inset-0 z-[700] lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDrawer(false)} />
          <div className="absolute left-0 top-0 h-full">
            <Sidebar pathname={pathname} onNavigate={() => setDrawer(false)} navGroups={navGroups} onLogout={logout} busy={busy} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-[600] flex h-16 items-center gap-3 border-b border-outline-variant bg-card-surface px-4 md:px-6">
          <button onClick={() => setDrawer(true)} className="grid h-10 w-10 place-items-center rounded-full text-brand hover:bg-surface-container-low lg:hidden">
            <span className="material-symbols-outlined">menu</span>
          </button>
          <div className="relative hidden max-w-md flex-1 sm:block">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-outline">search</span>
            <input placeholder="Cari gardu, anomali, aset…" className="w-full rounded-full border border-outline-variant bg-surface-container-low py-2 pl-10 pr-4 font-body-md text-body-md outline-none focus:border-brand" />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-full text-on-surface-variant hover:bg-surface-container-low">
              <span className="material-symbols-outlined">notifications</span>
            </span>
            {/* Widget user — foto default (inisial) + nama, klik → profil */}
            <Link href="/profil" className="flex items-center gap-2 rounded-full border border-outline-variant py-1 pl-1 pr-3 transition hover:bg-surface-container-low">
              {me?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={me.avatar_url} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover" />
              ) : (
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand font-heading text-sm font-bold text-white">
                  {initials(me?.full_name, me?.email)}
                </span>
              )}
              <span className="hidden min-w-0 leading-tight sm:block">
                <span className="block max-w-[140px] truncate font-heading text-[13px] font-bold text-on-surface">{me?.full_name || "Akun Saya"}</span>
                <span className="block truncate font-body-md text-[11px] capitalize text-on-surface-variant">{me?.role || "—"}</span>
              </span>
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}