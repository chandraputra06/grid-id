"use client";
// Peringatan risiko di sekitar lokasi warga.
// Sumber data: GET /api/public/laporan?lat=&lng=&radius=  (level sudah diturunkan backend:
//   severity AI > risk_scores aset > default). Tidak perlu endpoint baru.
// Pola notifikasi: banner in-page + notifikasi native (Notification API) saat tab terbuka & kritis.
// BUKAN web-push background (tanpa service worker) — cocok untuk static export di Hostinger.
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");

const LEVEL = {
  kritis: { label: "KRITIS", icon: "warning", accent: "#EF4444", bg: "#FEF2F2", border: "#FCA5A5", text: "#B91C1C" },
  waspada: { label: "WASPADA", icon: "error", accent: "#F59E0B", bg: "#FFFBEB", border: "#FCD34D", text: "#B45309" },
  aman: { label: "AMAN", icon: "check_circle", accent: "#21A366", bg: "#ECFDF5", border: "#A7F3D0", text: "#15803D" },
};

// Jarak kasar (km) — cukup untuk filter radius kecil.
const distKm = (a, b) => {
  const dLat = (a.lat - b.lat) * 111.2;
  const dLng = (a.lng - b.lng) * 111.2 * Math.cos((a.lat * Math.PI) / 180);
  return Math.sqrt(dLat * dLat + dLng * dLng);
};
const levelFromScore = (s) => (s >= 65 ? "kritis" : s >= 35 ? "waspada" : "aman");

// Skor 0-100 dari kumpulan laporan di sekitar (sama rumus dengan halaman peta publik).
function scoreOf(list) {
  const k = list.filter((l) => l.level === "kritis").length;
  const w = list.filter((l) => l.level === "waspada").length;
  const a = list.filter((l) => l.level === "aman").length;
  return Math.round(100 * (1 - Math.exp(-(k * 1 + w * 0.45 + a * 0.05) / 2)));
}

function savedWilayah() {
  try {
    const w = JSON.parse(localStorage.getItem("wilayah") || "null");
    if (w && typeof w.lat === "number" && typeof w.lng === "number") return { lat: w.lat, lng: w.lng };
  } catch {}
  return null;
}

// Lokasi: pakai wilayah tersimpan (pilihan user) dulu; kalau tidak ada, minta GPS.
function getLocation() {
  return new Promise((resolve) => {
    const saved = savedWilayah();
    if (saved) return resolve(saved);
    if (typeof navigator === "undefined" || !navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  });
}

export default function RiskNearbyAlert({ radius = 5, className = "" }) {
  const [state, setState] = useState("loading"); // loading | ok | quiet
  const [summary, setSummary] = useState(null); // { score, level, counts, nearest }
  const [dismissed, setDismissed] = useState(false);
  const [notifPerm, setNotifPerm] = useState("unsupported");
  const firedRef = useRef(false);

  useEffect(() => {
    if (typeof Notification !== "undefined") setNotifPerm(Notification.permission);
  }, []);

  async function load() {
    const loc = await getLocation();
    if (!loc) return setState("quiet");
    try {
      const res = await fetch(`${API_URL}/api/public/laporan?lat=${loc.lat}&lng=${loc.lng}&radius=${radius}`);
      const json = await res.json().catch(() => null);
      if (!res.ok || !json || json.ok === false) throw new Error();
      const data = Array.isArray(json.data) ? json.data : [];
      const near = data
        .filter((l) => l.lat != null && l.lng != null)
        .map((l) => ({ ...l, jarak: distKm(loc, l) }))
        .filter((l) => l.jarak <= radius)
        .sort((a, b) => a.jarak - b.jarak);
      const counts = {
        kritis: near.filter((l) => l.level === "kritis").length,
        waspada: near.filter((l) => l.level === "waspada").length,
        aman: near.filter((l) => l.level === "aman").length,
        total: near.length,
      };
      if (counts.total === 0) return setState("quiet"); // tidak ada data → jangan klaim apa pun
      const score = scoreOf(near);
      const level = counts.kritis > 0 ? "kritis" : levelFromScore(score);
      setSummary({ score, level, counts, nearest: near[0] || null });
      setState("ok");
    } catch {
      setState("quiet"); // gagal → diam, jangan ganggu pengguna
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 180000); // refresh tiap 3 menit
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [radius]);

  // Notifikasi native — hanya saat kritis, sekali, dan bila izin sudah diberikan.
  useEffect(() => {
    if (!summary || summary.counts.kritis <= 0 || firedRef.current) return;
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
    firedRef.current = true;
    try {
      new Notification("GRID.ID — Area kritis di sekitarmu", {
        body: `Ada ${summary.counts.kritis} area berisiko tinggi dalam ${radius} km. Jaga jarak dari infrastruktur rusak; laporkan ke PLN 123.`,
        icon: "/grid-logos.png",
      });
    } catch {}
  }, [summary, radius]);

  async function enableNotif() {
    if (typeof Notification === "undefined") return;
    try {
      const p = await Notification.requestPermission();
      setNotifPerm(p);
    } catch {}
  }

  if (dismissed || state !== "ok" || !summary) return null;

  const m = LEVEL[summary.level];
  const { counts, score } = summary;
  const critical = counts.kritis > 0;
  const headline = critical
    ? `Ada ${counts.kritis} area berisiko tinggi di dekatmu`
    : summary.level === "waspada"
    ? `${counts.waspada} area perlu diwaspadai dalam ${radius} km`
    : `Area sekitar relatif aman`;

  return (
    <div className={className} role={critical ? "alert" : undefined}>
      <div
        className="flex flex-wrap items-center gap-3 rounded-xl border p-3 shadow-sm"
        style={{ background: m.bg, borderColor: m.border }}
      >
        <span
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full font-extrabold text-white"
          style={{ background: m.accent }}
          aria-hidden="true"
        >
          {score}
        </span>

        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-[14px] font-extrabold leading-tight" style={{ color: m.text }}>
            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              {m.icon}
            </span>
            {headline}
          </p>
          <p className="mt-0.5 text-[12px] text-on-surface-variant">
            Skor area <b>{score}/100</b> · {counts.kritis} kritis · {counts.waspada} waspada dalam {radius} km dari lokasimu.
            {critical ? " Jaga jarak dari infrastruktur rusak, hubungi PLN 123." : ""}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {critical && notifPerm === "default" && (
            <button
              type="button"
              onClick={enableNotif}
              className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-bold text-white shadow-sm transition active:scale-95"
              style={{ background: m.accent }}
            >
              <span className="material-symbols-outlined text-[16px]">notifications_active</span> Aktifkan notifikasi
            </button>
          )}
          <Link
            href="/peta-publik"
            className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-[12px] font-bold transition active:scale-95"
            style={{ borderColor: m.border, color: m.text, background: "#fff" }}
          >
            <span className="material-symbols-outlined text-[16px]">map</span> Lihat peta
          </Link>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label="Tutup peringatan"
            className="grid h-7 w-7 place-items-center rounded-full transition hover:bg-black/5"
            style={{ color: m.text }}
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      </div>
    </div>
  );
}