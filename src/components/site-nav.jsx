"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { api } from "@/lib/api";

const links = [
  { href: "/", label: "Beranda" },
  { href: "/cara-kerja", label: "Cara Kerja" },
  { href: "/peta-publik", label: "Peta Publik" },
  { href: "/misi", label: "Misi" },
  { href: "/tentang", label: "Tentang" },
];

function LogoMark() {
  return <Image src="/grid-logos.png" alt="" width={30} height={42} priority />;
}

function initials(name, email) {
  const src = (name || "").trim() || (email || "").trim();
  if (!src) return "?";
  const parts = src.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return src.slice(0, 2).toUpperCase();
}

/* Belum login: pill amber "Login" + "Cek Resiko Lokasimu" */
function GuestPill({ full = false }) {
  return (
    <div className={`flex items-center gap-1 rounded-full bg-accent py-1.5 pl-5 pr-1.5 ${full ? "w-full justify-between" : ""}`}>
      <Link href="/masuk" className="px-2 font-heading text-[15px] font-bold text-white transition hover:brightness-95">
        Login
      </Link>
      <Link
        href="/beranda"
        className="rounded-full bg-[#F8F1E3] px-6 py-2.5 font-heading text-[15px] font-bold text-accent shadow-sm transition hover:bg-white"
      >
        Cek Resiko Lokasimu
      </Link>
    </div>
  );
}

/* Sudah login: chip user (foto default + nama) + tombol Logout */
function UserPill({ me, onLogout, busy, full = false }) {
  const canDashboard = me?.role === "admin" || me?.role === "petugas";
  return (
    <div className={`flex items-center gap-2 ${full ? "w-full" : ""}`}>
      {canDashboard && (
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 rounded-full bg-brand px-4 py-2.5 font-heading text-[15px] font-bold text-white shadow-sm transition hover:brightness-110 active:scale-95"
        >
          <span className="material-symbols-outlined text-[18px]">dashboard</span>
          Dashboard
        </Link>
      )}
      <Link
        href="/profil"
        className={`flex items-center gap-2 rounded-full border border-outline-variant bg-card-surface py-1 pl-1 pr-3 transition hover:bg-surface-container-low ${full ? "flex-1" : ""}`}
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand font-heading text-sm font-bold text-white">
          {initials(me?.full_name, me?.email)}
        </span>
        <span className="min-w-0 leading-tight">
          <span className="block truncate font-heading text-[14px] font-bold text-brand">{me?.full_name || "Akun Saya"}</span>
          <span className="block truncate font-body-md text-[11px] capitalize text-on-surface-variant">{me?.role || "warga"}</span>
        </span>
      </Link>
      <button
        onClick={onLogout}
        disabled={busy}
        className="flex items-center gap-1.5 rounded-full bg-accent px-5 py-2.5 font-heading text-[15px] font-bold text-white shadow-sm transition hover:brightness-95 active:scale-95 disabled:opacity-60"
      >
        <span className="material-symbols-outlined text-[18px]">{busy ? "hourglass_top" : "logout"}</span>
        {busy ? "Keluar…" : "Logout"}
      </button>
    </div>
  );
}

function AuthArea({ full = false }) {
  const router = useRouter();
  const [me, setMe] = useState(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);

  async function refresh() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setMe(null);
      setReady(true);
      return;
    }
    try {
      const data = await api.get("/api/me");
      setMe(data);
    } catch {
      setMe(null);
    } finally {
      setReady(true);
    }
  }

  useEffect(() => {
    refresh();
    const { data: sub } = supabase.auth.onAuthStateChange(() => refresh());
    return () => sub?.subscription?.unsubscribe();
  }, []);

  async function logout() {
    if (busy) return;
    setBusy(true);
    try {
      await supabase.auth.signOut();
      setMe(null);
    } finally {
      setBusy(false);
      router.replace("/masuk");
    }
  }

  // Hindari kedip "Login" sebelum status auth diketahui
  if (!ready) return <div className={full ? "h-12 w-full" : "h-12 w-[260px]"} aria-hidden />;
  if (!me) return <GuestPill full={full} />;
  return <UserPill me={me} onLogout={logout} busy={busy} full={full} />;
}

export function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-[600] w-full border-b border-outline-variant/40 bg-card-surface/95 backdrop-blur">
      <nav className="relative mx-auto flex h-20 max-w-[1200px] items-center justify-between px-gutter">
        <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <LogoMark />
          <span className="font-heading text-xl font-extrabold tracking-tight text-brand sm:text-2xl">
            GRID<span className="text-accent">·</span>ID
          </span>
        </Link>

        {/* Center links — desktop */}
        <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 lg:flex">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-full px-4 py-2 font-heading text-[16px] font-bold transition-colors ${
                  active ? "bg-[#FCE6BD] text-brand" : "text-brand hover:bg-surface-container-low"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </div>

        {/* Auth area — desktop */}
        <div className="hidden lg:block">
          <AuthArea />
        </div>

        {/* Hamburger — mobile/tablet */}
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Buka menu"
          className="grid h-11 w-11 place-items-center rounded-full text-brand hover:bg-surface-container-low lg:hidden"
        >
          <span className="material-symbols-outlined text-[28px]">{open ? "close" : "menu"}</span>
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-outline-variant/40 bg-card-surface px-gutter py-4 lg:hidden">
          <div className="flex flex-col gap-1">
            {links.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={`rounded-xl px-4 py-3 font-heading text-[16px] font-bold transition-colors ${
                    active ? "bg-[#FCE6BD] text-brand" : "text-brand hover:bg-surface-container-low"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </div>
          <div className="mt-4" onClick={() => setOpen(false)}>
            <AuthArea full />
          </div>
        </div>
      )}
    </header>
  );
}