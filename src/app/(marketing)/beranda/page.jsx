"use client";
import Link from "next/link";
import { Reveal } from "@/components/motion";
import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { Montserrat } from "next/font/google";
import RiskNearbyAlert from "@/components/risk-nearby-alert";

const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat", display: "swap" });

const PLN_PHONE = "123"; // Contact Center PLN resmi
const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");
const RADIUS_KM = 5;

/* ---------- Level risiko ---------- */
const LEVELS = {
  high: {
    key: "high", label: "Tinggi", zone: "Kritis",
    c: ["#FCA5A5", "#E5484D", "#B91C1C"],
    text: "text-[#E5484D]", badge: "bg-[#E5484D]/10 text-[#E5484D]", glow: "#E5484D", tint: "#FFE1E3", headTo: "#E5484D",
    pageBg: "linear-gradient(180deg, #FFFFFF 0%, #FFFFFF 30%, #FFE6EA 100%)",
    gradText: "from-[#F87171] to-[#B91C1C]",
    solid: "linear-gradient(135deg, #F87171 0%, #B91C1C 100%)",
    soft: "linear-gradient(135deg, #FFE1E3 0%, #FECACA 100%)",
  },
  medium: {
    key: "medium", label: "Medium", zone: "Waspada",
    c: ["#FDE047", "#F59E0B", "#EA7C0B"],
    text: "text-[#E8890C]", badge: "bg-[#F59E0B]/15 text-[#E8890C]", glow: "#F59E0B", tint: "#FFF1CC", headTo: "#F5B50B",
    pageBg: "linear-gradient(180deg, #FFFFFF 0%, #FFFFFF 30%, #FFF4CC 100%)",
    gradText: "from-[#F59E0B] to-[#C2410C]",
    solid: "linear-gradient(135deg, #FBBF24 0%, #EA7C0B 100%)",
    soft: "linear-gradient(135deg, #FFF1CC 0%, #FDE68A 100%)",
  },
  low: {
    key: "low", label: "Low", zone: "Aman",
    c: ["#86EFAC", "#22C55E", "#15803D"],
    text: "text-[#16A34A]", badge: "bg-[#22C55E]/10 text-[#16A34A]", glow: "#22C55E", tint: "#D9F7E4", headTo: "#22C55E",
    pageBg: "linear-gradient(180deg, #FFFFFF 0%, #FFFFFF 30%, #DDF6E6 100%)",
    gradText: "from-[#34D399] to-[#15803D]",
    solid: "linear-gradient(135deg, #4ADE80 0%, #15803D 100%)",
    soft: "linear-gradient(135deg, #D9F7E4 0%, #BBF7D0 100%)",
  },
};
// Level API (kritis/waspada/aman) -> kunci LEVELS beranda.
const AREA = { kritis: LEVELS.high, waspada: LEVELS.medium, aman: LEVELS.low };

const KATEGORI = {
  pohon: { label: "Pohon dekat kabel", icon: "park" },
  kabel: { label: "Kabel menjuntai", icon: "cable" },
  trafo: { label: "Gardu / trafo", icon: "bolt" },
  banjir: { label: "Genangan / banjir", icon: "flood" },
  tiang: { label: "Tiang miring", icon: "power" },
};

/* ---------- Helper data ---------- */
const DEFAULT_WILAYAH = { lat: -8.65, lng: 115.2167, desa: "", kecamatan: "", kabupaten: "Denpasar" };

function getWilayah() {
  try {
    const w = JSON.parse(localStorage.getItem("wilayah") || "null");
    if (w && typeof w.lat === "number" && typeof w.lng === "number") return w;
  } catch {}
  return null;
}

const RANK = { kritis: 0, waspada: 1, aman: 2 };
const distKm = (a, b) => {
  const dLat = (a.lat - b.lat) * 111.2;
  const dLng = (a.lng - b.lng) * 111.2 * Math.cos((a.lat * Math.PI) / 180);
  return Math.sqrt(dLat * dLat + dLng * dLng);
};
const laporanDekat = (data, center, radiusKm = RADIUS_KM) =>
  (data || [])
    .filter((l) => l.lat != null && l.lng != null)
    .map((l) => ({ ...l, jarak: distKm(center, l) }))
    .filter((l) => l.jarak <= radiusKm)
    .sort((a, b) => (RANK[a.level] ?? 3) - (RANK[b.level] ?? 3) || (a.menit ?? 0) - (b.menit ?? 0));

function skorRisiko(list) {
  const k = list.filter((l) => l.level === "kritis").length;
  const w = list.filter((l) => l.level === "waspada").length;
  const a = list.filter((l) => l.level === "aman").length;
  return Math.round(100 * (1 - Math.exp(-(k * 1 + w * 0.45 + a * 0.05) / 2)));
}
function agoText(m) {
  if (m == null) return "";
  if (m < 60) return `${m} mnt lalu`;
  if (m < 1440) return `${Math.round(m / 60)} jam lalu`;
  return `${Math.round(m / 1440)} hari lalu`;
}

/* ---------- Animasi angka ---------- */
function useAnimatedNumber(target, duration = 1300) {
  const [value, setValue] = useState(0);
  const fromRef = useRef(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      fromRef.current = target;
      setValue(target);
      return;
    }
    const from = fromRef.current;
    const start = performance.now();
    let raf;
    const step = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const v = from + (target - from) * eased;
      fromRef.current = v;
      setValue(v);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

/* ---------- Rekomendasi per level ---------- */
function Recommendation({ risk }) {
  const phone = <a href={`tel:${PLN_PHONE}`} className="font-extrabold underline underline-offset-2">PLN ({PLN_PHONE})</a>;
  const content = {
    high: { icon: "warning", title: "Waspada", body: <>Jika ada percikan api, asap, atau suara desingan keras yang mengkhawatirkan, segera laporkan dan hubungi {phone}.</> },
    medium: { icon: "visibility", title: "Rekomendasi", body: <>Pantau kondisi listrik di sekitarmu 3 hari ke depan. Jika gangguan berulang atau makin parah, hubungi {phone}.</> },
    low: { icon: "check_circle", title: "Aman", body: <>Tidak ada gangguan berarti di sekitarmu. Tetap pantau dan laporkan jika ada kondisi yang tidak biasa.</> },
  }[risk.key];
  return (
    <div className="mt-5 flex items-start gap-3 rounded-2xl border-2 p-4 text-left transition-all duration-700" style={{ background: `linear-gradient(135deg, ${risk.tint} 0%, #FFFFFF 80%)`, borderColor: risk.glow }}>
      <span className={`material-symbols-outlined mt-0.5 text-[22px] ${risk.text}`}>{content.icon}</span>
      <div className="text-sm text-on-surface">
        <p className={`font-extrabold ${risk.text}`}>{content.title}</p>
        <p className="mt-0.5">{content.body}</p>
      </div>
    </div>
  );
}

/* ---------- Kartu satu laporan (DATA ASLI) ---------- */
function ReportCard({ r }) {
  const lv = AREA[r.level] || LEVELS.low;
  const kat = KATEGORI[r.kategori] || { label: "Laporan", icon: "report" };
  const pelapor = r.pelapor || "Warga";
  return (
    <div className="rounded-2xl border-2 p-4 text-left shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md" style={{ background: `linear-gradient(135deg, ${lv.tint} 0%, #FFFFFF 75%)`, borderColor: lv.glow }}>
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-extrabold text-white" style={{ background: lv.solid }}>
          {String(pelapor).charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">{pelapor}</p>
          <p className="truncate text-xs text-on-surface-variant">{kat.label}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className={`text-[11px] font-extrabold ${lv.text}`}>{lv.zone}</p>
          <p className="text-xs text-on-surface-variant">{agoText(r.menit)}</p>
        </div>
      </div>

      <p className="mt-2 flex items-center gap-1 text-xs text-on-surface-variant">
        <span className="material-symbols-outlined text-[14px]">location_on</span>
        {r.lokasi || "Lokasi tidak dicatat"}{r.jarak != null ? ` · ${r.jarak.toFixed(1)} km` : ""}
      </p>

      <div className="mt-3 flex gap-3">
        {r.foto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={r.foto} alt={`Foto laporan: ${r.judul || r.deskripsi || "laporan"}`} className="h-20 w-20 shrink-0 rounded-xl object-cover" />
        ) : (
          <div className="grid h-20 w-20 shrink-0 place-items-center rounded-xl border" style={{ background: lv.soft, borderColor: `${lv.glow}55` }} aria-label="Foto laporan belum tersedia">
            <span className={`material-symbols-outlined text-[26px] ${lv.text}`}>{kat.icon}</span>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{r.judul || r.deskripsi || kat.label}</p>
          {r.status && (
            <span className={`mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${lv.badge}`}>
              <span className="material-symbols-outlined text-[14px]">assignment</span>
              {r.status}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Daftar laporan sekitar (DATA ASLI) ---------- */
function NearbyReports({ risk, reports, loading }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-4 text-left" style={{ "--glow": `${risk.glow}99` }}>
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center justify-center gap-1 rounded-full px-4 py-3 text-sm font-semibold text-white shadow-[0_6px_16px_-4px_var(--glow)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_28px_-2px_var(--glow),0_0_22px_var(--glow)] active:translate-y-0"
        style={{ background: risk.solid }}
      >
        Ketahui laporan di sekitarmu
        <span className={`material-symbols-outlined text-[18px] transition-transform ${open ? "rotate-180" : ""}`}>expand_more</span>
      </button>

      <div className={`grid transition-[grid-template-rows] duration-500 ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <div className="space-y-3 pt-3">
            <p className="text-xs font-semibold text-on-surface-variant">Laporan terbaru · radius {RADIUS_KM} km</p>
            {loading ? (
              <p className="rounded-xl bg-black/5 p-4 text-center text-sm text-on-surface-variant">Memuat laporan…</p>
            ) : reports.length === 0 ? (
              <p className="rounded-xl bg-black/5 p-4 text-center text-sm text-on-surface-variant">Belum ada laporan dalam {RADIUS_KM} km dari lokasimu.</p>
            ) : (
              reports.slice(0, 10).map((r) => <ReportCard key={r.id} r={r} />)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Beranda() {
  const router = useRouter();
  const [sending, setSending] = useState(false);
  const [wilayah, setWilayah] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Lokasi: wilayah tersimpan dulu, lalu GPS, lalu default.
  useEffect(() => {
    const saved = getWilayah();
    if (saved) return setWilayah(saved);
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setWilayah({ ...DEFAULT_WILAYAH, lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setWilayah(DEFAULT_WILAYAH),
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else setWilayah(DEFAULT_WILAYAH);
  }, []);

  // Ambil laporan publik di sekitar (refresh tiap 60 dtk).
  const wLat = wilayah?.lat;
  const wLng = wilayah?.lng;
  useEffect(() => {
    if (wLat == null || wLng == null) return;
    const ctrl = new AbortController();
    const load = () =>
      fetch(`${API_URL}/api/public/laporan?lat=${wLat}&lng=${wLng}&radius=25`, { signal: ctrl.signal })
        .then((r) => r.json())
        .then((j) => { if (j && j.ok !== false) setData(Array.isArray(j.data) ? j.data : []); })
        .catch(() => {})
        .finally(() => setLoading(false));
    setLoading(true);
    load();
    const t = setInterval(load, 60000);
    return () => { ctrl.abort(); clearInterval(t); };
  }, [wLat, wLng]);

  const w = wilayah || DEFAULT_WILAYAH;
  const center = useMemo(() => ({ lat: w.lat, lng: w.lng }), [w.lat, w.lng]);
  const place = w.desa || w.kecamatan || w.kabupaten || "lokasimu";
  const sub = [w.kecamatan, w.kabupaten].filter((x) => x && x !== place).join(", ");

  const nearby = useMemo(() => laporanDekat(data, center, RADIUS_KM), [data, center]);
  const counts = useMemo(() => ({
    kritis: nearby.filter((l) => l.level === "kritis").length,
    waspada: nearby.filter((l) => l.level === "waspada").length,
    aman: nearby.filter((l) => l.level === "aman").length,
  }), [nearby]);

  const score = useMemo(() => skorRisiko(nearby), [nearby]);
  const levelKey = counts.kritis > 0 ? "high" : counts.waspada > 0 ? "medium" : "low";
  const risk = LEVELS[levelKey];
  const shown = useAnimatedNumber(score);

  const handleNotify = () => {
    setSending(true);
    setTimeout(() => router.push("/peta-publik"), 2500);
  };

  // Faktor: "Laporan sekitar" real; faktor lain (kondisi aset, cuaca) menyusul.
  const lapTag = counts.kritis > 0 ? "Tinggi" : counts.waspada > 0 ? "Waspada" : "Rendah";
  const lapW = counts.kritis > 0 ? "w-4/5" : counts.waspada > 0 ? "w-3/5" : "w-1/5";
  const factors = [
    { label: "Laporan di sekitarmu", tag: lapTag, w: lapW, note: `${nearby.length} laporan dalam radius ${RADIUS_KM} km`,
      card: "bg-gradient-to-br from-[#38BDF8] to-[#1D4ED8] shadow-[0_10px_24px_-6px_rgba(37,99,235,0.55),0_0_22px_rgba(56,189,248,0.45)] hover:shadow-[0_20px_38px_-6px_rgba(37,99,235,0.75),0_0_34px_rgba(56,189,248,0.7)]" },
    { label: "Area kritis terdekat", tag: counts.kritis > 0 ? "Ada" : "Nihil", w: counts.kritis > 0 ? "w-4/5" : "w-1/12", note: `${counts.kritis} area kritis dalam ${RADIUS_KM} km`,
      card: "bg-gradient-to-br from-[#F87171] to-[#B91C1C] shadow-[0_10px_24px_-6px_rgba(229,72,77,0.55)] hover:shadow-[0_20px_38px_-6px_rgba(229,72,77,0.75)]" },
    { label: "Perlu diwaspadai", tag: counts.waspada > 0 ? "Pantau" : "Aman", w: counts.waspada > 0 ? "w-3/5" : "w-1/12", note: `${counts.waspada} area waspada dalam ${RADIUS_KM} km`,
      card: "bg-gradient-to-br from-[#FBBF24] to-[#EA7C0B] shadow-[0_10px_24px_-6px_rgba(245,158,11,0.55)] hover:shadow-[0_20px_38px_-6px_rgba(245,158,11,0.75)]" },
  ];

  return (
    <div className={`${montserrat.variable} mont relative overflow-hidden bg-white`}>
      <style>{`.mont, .mont *:not(.material-symbols-outlined){font-family: var(--font-montserrat), sans-serif !important;}`}</style>

      {Object.values(LEVELS).map((l) => (
        <div key={l.key} className="pointer-events-none absolute inset-0 transition-opacity duration-1000" style={{ background: l.pageBg, opacity: l.key === risk.key ? 1 : 0 }} aria-hidden />
      ))}

      <div className="relative mx-auto max-w-225 px-margin-mobile pb-20 pt-6 md:px-gutter">
        {sending && (
          <div className="fixed inset-0 z-100 grid place-items-center bg-[#0D1B2A]/85 backdrop-blur-sm">
            <div className="px-6 text-center text-white">
              <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-white/20 border-t-[#F59E0B]" />
              <p className="mt-6 text-lg font-semibold">Membuka peta risiko wilayahmu</p>
              <p className="mt-1 text-sm text-white/70">Mohon tunggu sebentar…</p>
            </div>
          </div>
        )}

        {/* Peringatan risiko di sekitar lokasi warga (data real dari API) */}
        <RiskNearbyAlert className="mb-6" />

        <Reveal>
          <div className="relative mb-6 overflow-hidden rounded-2xl border-2 bg-white p-8 transition-all duration-700" style={{ borderColor: risk.glow, boxShadow: `0 8px 28px -8px ${risk.glow}80` }}>
            <div className="text-center">
              <span className="inline-block rounded-full border-2 border-[#F59E0B] bg-transparent px-4 py-1 font-label-bold text-label-bold uppercase tracking-wider text-[#E8890C]">
                Lokasi Terkini
              </span>
              <h1 className="mt-3 bg-clip-text font-headline-md text-headline-md text-transparent capitalize" style={{ backgroundImage: `linear-gradient(90deg, #1D4ED8 0%, ${risk.headTo} 100%)` }}>
                {place}{sub ? `, ${sub}` : ""}
              </h1>
            </div>

            {/* Grafik skor (DATA ASLI) */}
            <div className="my-6 grid place-items-center">
              <div className="relative h-44 w-44">
                <div className="absolute -inset-2 rounded-full opacity-60 blur-md transition-all duration-700" style={{ background: `conic-gradient(from 0deg, transparent 0%, ${risk.glow} 35%, transparent 70%)`, animation: "spin 6s linear infinite" }} />
                <div className="relative grid h-44 w-44 place-items-center rounded-full" style={{ background: `conic-gradient(from 0deg, ${risk.c[0]} 0%, ${risk.c[1]} ${shown * 0.55}%, ${risk.c[2]} ${shown}%, #e0e2e7 ${shown}% 100%)` }}>
                  <div className="grid h-36 w-36 place-items-center rounded-full bg-white">
                    <div className="text-center">
                      <div className={`text-5xl font-black tabular-nums transition-colors duration-500 ${risk.text}`}>{Math.round(shown)}</div>
                      <div className="font-label-sm text-label-sm text-on-surface-variant">/ 100</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="font-headline-sm text-headline-sm">
                Skor Risikomu: <span className={`font-extrabold transition-colors duration-500 ${risk.text}`}>{risk.label}</span>
              </p>

              {risk.key === "high" && (
                <div className="mt-4 flex flex-col items-center gap-3">
                  <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 font-label-bold text-label-bold ${risk.badge}`}>
                    <span className="material-symbols-outlined text-[16px]">warning</span> Tangani dalam 24 jam
                  </span>
                  <button onClick={handleNotify} className="flex items-center gap-2 rounded-full bg-risk-kritis px-6 py-3 font-label-bold text-label-bold text-white shadow-[0_6px_16px_-4px_rgba(229,72,77,0.5)] transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:shadow-[0_12px_28px_-2px_rgba(229,72,77,0.8),0_0_24px_rgba(229,72,77,0.6)] active:translate-y-0 active:scale-100">
                    <span className="material-symbols-outlined text-[20px]">map</span> Lihat Peta Risiko
                  </button>
                </div>
              )}

              <Recommendation risk={risk} />
              <NearbyReports risk={risk} reports={nearby} loading={loading} />
            </div>

            {/* Ringkasan area */}
            <div className="mt-6 grid grid-cols-3 gap-3 border-t pt-5 text-center" style={{ borderColor: `${risk.glow}55` }}>
              <div className="rounded-xl px-2 py-3 shadow-sm" style={{ background: risk.solid }}>
                <p className="font-label-sm text-label-sm text-white/85">Zona</p>
                <p className="font-headline-sm text-headline-sm font-extrabold text-white">{risk.zone}</p>
              </div>
              <div className="rounded-xl px-2 py-3 shadow-sm" style={{ background: risk.soft }}>
                <p className="font-label-sm text-label-sm text-on-surface-variant">Laporan 5 km</p>
                <p className={`bg-linear-to-r bg-clip-text font-headline-sm text-headline-sm font-extrabold text-transparent ${risk.gradText}`}>{nearby.length}</p>
              </div>
              <div className="rounded-xl px-2 py-3 shadow-sm" style={{ background: risk.soft }}>
                <p className="font-label-sm text-label-sm text-on-surface-variant">Area kritis</p>
                <p className={`bg-linear-to-r bg-clip-text font-headline-sm text-headline-sm font-extrabold text-transparent ${risk.gradText}`}>{counts.kritis}</p>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            {factors.map((f) => (
              <div key={f.label} className={`rounded-2xl border-2 border-white/60 p-5 text-white transition-all duration-300 hover:-translate-y-2 ${f.card}`}>
                <div className="mb-3 flex items-start justify-between gap-2">
                  <span className="font-label-bold text-label-bold text-white">{f.label}</span>
                  <span className="shrink-0 rounded-full border border-white/70 bg-white/20 px-2.5 py-0.5 font-label-sm text-label-sm font-bold text-white">{f.tag}</span>
                </div>
                <span className="block h-2 rounded-full border border-white/70 bg-white/25">
                  <span className={`block h-full rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] ${f.w}`} />
                </span>
                <p className="mt-3 font-label-sm text-label-sm text-white/90">{f.note}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/lapor" className="flex flex-1 items-center justify-center gap-2 rounded-full bg-linear-to-r from-[#0B2A5B] to-[#1D4ED8] px-6 py-3.5 font-label-bold text-label-bold text-[#FEF08A] shadow-[0_6px_16px_-4px_rgba(11,42,91,0.5)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_28px_-2px_rgba(11,42,91,0.55),0_0_26px_rgba(250,204,21,0.65)] active:translate-y-0 [text-shadow:0_2px_6px_rgba(0,0,0,0.45)]">
              <span className="material-symbols-outlined text-[20px] [text-shadow:0_2px_6px_rgba(0,0,0,0.45)]">photo_camera</span> Lapor Kondisi
            </Link>
            <Link href="/peta-publik" className="group flex flex-1 rounded-full bg-linear-to-r from-[#4ADE80] to-[#15803D] p-0.5 shadow-[0_6px_16px_-4px_rgba(22,163,74,0.4)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_26px_-4px_rgba(22,163,74,0.5),0_0_26px_rgba(134,239,172,0.9)] active:translate-y-0">
              <span className="flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3 font-label-bold text-label-bold transition-colors duration-300 group-hover:bg-[#F0FDF4]">
                <span className="material-symbols-outlined text-[20px] text-[#16A34A]">map</span>
                <span className="bg-linear-to-r from-[#22C55E] to-[#15803D] bg-clip-text text-transparent">Lihat Peta Wilayah</span>
              </span>
            </Link>
          </div>
        </Reveal>
      </div>
    </div>
  );
}