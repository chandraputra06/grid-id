"use client";
import { usePathname } from "next/navigation";
import { SiteFooter } from "./site-footer";

export function ConditionalFooter() {
  const pathname = usePathname();
  if (pathname === "/peta-publik") return null; // tanpa footer di halaman peta
  return <SiteFooter />;
}