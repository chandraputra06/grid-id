"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { api } from "@/lib/api";
import { isStaff } from "@/lib/roles";

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

function Avatar({ me }) {
  if (me?.avatar_url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={me.avatar_url} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover" />;
  }
  return (
    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand font-heading text-sm font-bold text-white">
      {initials(me?.full_name, me?.email)}
    </span>
  );
}

function NameRole({ me }) {
  return (
    <span className="min-w-0 leading-tight">
      <span className="block truncate font-heading text-[14px] font-bold text-brand">{me?.full_name || "Akun Saya"}</span>
      <span className="block truncate font-body-md text-[11px] capitalize text-on-surface-variant">{me?.role || "warga"}</span>
    </span>
  );
}

/* Tombol logout: ikon pintu keluar saja */
function LogoutBtn({ onLogout, busy }) {
  return (
    <button
      onClick={onLogout}
      disabled={busy}
      aria-label="Logout"
      title="Logout"
      className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent text-white shadow-sm transition hover:brightness-95 active:scale-95 disabled:opacity-60"
    >
      <span className="material-symbols-outlined text-[22px]">{busy ? "hourglass_top" : "logout"}</span>
    </button>
  );
}

function MenuLink({ href, icon, label, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-2.5 font-heading text-[14px] font-bold text-brand transition-colors hover:bg-surface-container-low"
    >
      <span className="material-symbols-outlined text-[20px]">{icon}</span>
      {label}
    </Link>
  );
}

/* Sudah login: chip user + logout ikon.
   Semua staf (admin/supervisor/petugas/hardware) → chip jadi dropdown (Dashboard / Profil).
   Warga → chip langsung ke profil. */
function UserPill({ me, onLogout, busy, full = false }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const canDashboard = isStaff(me?.role);

  useEffect(() => {
    function onDoc(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  if (!canDashboard) {
    return (
      <div className={`flex items-center gap-2 ${full ? "w-full" : ""}`}>
        <Link
          href="/profil"
          className={`flex items-center gap-2 rounded-full border border-outline-variant bg-card-surface py-1 pl-1 pr-3 transition hover:bg-surface-container-low ${full ? "flex-1" : ""}`}
        >
          <Avatar me={me} />
          <NameRole me={me} />
        </Link>
        <LogoutBtn onLogout={onLogout} busy={busy} />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${full ? "w-full" : ""}`}>
      <div className={`relative ${full ? "flex-1" : ""}`} ref={ref}>
        <button
          onClick={() => setOpen((v) => !v)}
          className={`flex items-center gap-2 rounded-full border border-outline-variant bg-card-surface py-1 pl-1 pr-2 transition hover:bg-surface-container-low ${full ? "w-full" : ""}`}
        >
          <Avatar me={me} />
          <NameRole me={me} />
          <span className="material-symbols-outlined ml-auto text-[18px] text-on-surface-variant">
            {open ? "expand_less" : "expand_more"}
          </span>
        </button>
        {open && (
          <div className="absolute right-0 top-[calc(100%+8px)] z-[700] w-56 overflow-hidden rounded-2xl border border-outline-variant bg-card-surface py-1 shadow-lg">
            <MenuLink href="/dashboard" icon="dashboard" label="Dashboard" onClick={() => setOpen(false)} />
            <MenuLink href="/profil" icon="account_circle" label="Profil Saya" onClick={() => setOpen(false)} />
          </div>
        )}
      </div>
      <LogoutBtn onLogout={onLogout} busy={busy} />
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
      <nav className="mx-auto flex h-20 max-w-[1200px] items-center justify-between gap-4 px-gutter">
        <Link href="/" className="flex shrink-0 items-center gap-2" onClick={() => setOpen(false)}>
          <LogoMark />
          <span className="font-heading text-xl font-extrabold tracking-tight text-brand sm:text-2xl">
            GRID<span className="text-accent">·</span>ID
          </span>
        </Link>

        {/* Center links — desktop */}
        <div className="hidden flex-1 items-center justify-center gap-1 lg:flex">
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
        <div className="hidden shrink-0 lg:block">
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