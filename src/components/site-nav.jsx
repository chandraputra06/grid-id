"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useState } from "react";

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

/* amber pill: "Login" white text + inset cream pill "Cek Resiko Lokasimu" */
function AuthPill({ full = false }) {
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

        {/* Auth pill — desktop */}
        <div className="hidden lg:block">
          <AuthPill />
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
            <AuthPill full />
          </div>
        </div>
      )}
    </header>
  );
}