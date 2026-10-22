"use client";
// Kerangka GRID.ID Business Portal — navigasi khusus pelanggan B2B,
// memakai token & pola visual yang sama dengan Dashboard Supervisor (AdminShell).
import { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { api } from "@/lib/api";
import { supabase } from "@/lib/supabase";

export const BUSINESS_NAV = [
  { href: "/business", label: "Overview", icon: "dashboard" },
  { href: "/business/aset", label: "Monitoring Aset", icon: "location_city" },
  { href: "/business/perangkat", label: "Perangkat", icon: "memory" },
  { href: "/business/live", label: "Live Monitoring", icon: "videocam" },
  { href: "/business/inspeksi", label: "Inspeksi AI", icon: "neurology" },
  { href: "/business/peringatan", label: "Peringatan", icon: "notifications_active" },
  { href: "/business/riwayat", label: "Riwayat Inspeksi", icon: "history" },
  { href: "/business/laporan", label: "Laporan", icon: "summarize" },
  { href: "/business/organisasi", label: "Organisasi & Pengguna", icon: "groups" },
  { href: "/business/pengaturan", label: "Pengaturan", icon: "settings" },
];

const OrgContext = createContext({ org: null, myRole: null, assetsGranted: 0, reload: () => {} });
export const useBusinessOrg = () => useContext(OrgContext);

export function BusinessShell({ children }) {
  const path = (usePathname() || "").replace(/\/$/, "");
  const [open, setOpen] = useState(false);
  const [state, setState] = useState({ loading: true, error: "", code: "", data: null });

  async function load() {
    try {
      const d = await api.get("/api/business/organization");
      setState({ loading: false, error: "", code: "", data: d });
    } catch (e) {
      setState({ loading: false, error: e?.message || "Gagal memuat organisasi.", code: e?.code || "", data: null });
    }
  }
  useEffect(() => {
    load();
  }, []);
  useEffect(() => setOpen(false), [path]);

  async function logout() {
    try {
      await supabase.auth.signOut();
    } finally {
      window.location.href = "/masuk";
    }
  }

  const org = state.data && state.data.organization;
  const ctx = { org, myRole: state.data && state.data.my_role, assetsGranted: state.data ? state.data.assets_granted : 0, members: state.data ? state.data.members : [], reload: load };
  const isActive = (href) => (href === "/business" ? path === href : path.startsWith(href));

  const nav = (
    <nav className="flex flex-col gap-1" aria-label="Navigasi Business Portal">
      {BUSINESS_NAV.map((n) => (
        <a key={n.href} href={n.href}
          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 font-heading text-sm font-bold transition-colors ${
            isActive(n.href) ? "bg-brand text-white shadow-sm" : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
          }`}>
          <span className="material-symbols-outlined text-[20px]">{n.icon}</span>
          {n.label}
        </a>
      ))}
    </nav>
  );

  return (
    <OrgContext.Provider value={ctx}>
      <div className="flex min-h-screen bg-background">
        {/* Sidebar desktop */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-outline-variant bg-card-surface p-4 lg:flex">
          <Brand />
          <div className="mt-6 flex-1 overflow-y-auto">{nav}</div>
          <button onClick={logout} className="mt-4 flex items-center gap-3 rounded-xl px-3 py-2.5 font-heading text-sm font-bold text-on-surface-variant hover:bg-surface-container-low">
            <span className="material-symbols-outlined text-[20px]">logout</span> Keluar
          </button>
        </aside>

        {/* Drawer mobile */}
        {open && (
          <div className="fixed inset-0 z-40 bg-on-surface/40 lg:hidden" onClick={() => setOpen(false)}>
            <aside className="h-full w-72 max-w-[85%] overflow-y-auto bg-card-surface p-4" onClick={(e) => e.stopPropagation()}>
              <Brand />
              <div className="mt-6">{nav}</div>
              <button onClick={logout} className="mt-4 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 font-heading text-sm font-bold text-on-surface-variant hover:bg-surface-container-low">
                <span className="material-symbols-outlined text-[20px]">logout</span> Keluar
              </button>
            </aside>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-outline-variant bg-card-surface/95 px-4 py-3 backdrop-blur sm:px-6">
            <button onClick={() => setOpen(true)} className="grid h-9 w-9 place-items-center rounded-lg text-on-surface hover:bg-surface-container-low lg:hidden" aria-label="Buka menu">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="min-w-0 flex-1">
              <p className="truncate font-heading text-sm font-bold text-on-surface">{org ? org.name : state.loading ? "Memuat organisasi…" : "Organisasi tidak tersedia"}</p>
              <p className="font-body-md text-[11px] text-on-surface-variant">
                GRID·ID Business Portal{state.data ? ` · ${state.data.assets_granted} aset · peran ${state.data.my_role === "owner" ? "Owner" : "Viewer"}` : ""}
              </p>
            </div>
            <span className="hidden rounded-full bg-brand/10 px-3 py-1 font-heading text-[11px] font-bold text-brand sm:inline">Akses baca</span>
          </header>
          <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 sm:px-6">
            {state.loading ? (
              <p className="py-16 text-center font-body-md text-body-md text-on-surface-variant">Memuat…</p>
            ) : !org ? (
              <div className="mx-auto max-w-lg rounded-2xl border border-outline-variant bg-card-surface p-8 text-center shadow-sm">
                <span className="material-symbols-outlined text-5xl text-on-surface-variant">domain_disabled</span>
                <p className="mt-2 font-heading text-lg font-bold">Akses organisasi belum tersedia</p>
                <p className="font-body-md text-body-md text-on-surface-variant">{state.error}</p>
                <button onClick={load} className="mt-4 rounded-full bg-brand px-5 py-2 font-label-bold text-label-bold text-white hover:brightness-110">Coba lagi</button>
              </div>
            ) : (
              children
            )}
          </main>
        </div>
      </div>
    </OrgContext.Provider>
  );
}

function Brand() {
  return (
    <a href="/business" className="flex items-center gap-2 px-2">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-white">
        <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
      </span>
      <span>
        <span className="block font-heading text-lg font-black leading-none text-on-surface">GRID<span className="text-accent">·</span>ID</span>
        <span className="block font-heading text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Business Portal</span>
      </span>
    </a>
  );
}
