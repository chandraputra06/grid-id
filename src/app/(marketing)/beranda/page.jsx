"use client";
import Link from "next/link";
import { Reveal } from "@/components/motion";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Montserrat } from "next/font/google";
import RiskNearbyAlert from "@/components/risk-nearby-alert";

const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat", display: "swap" });

const PLN_PHONE = "123"; // Contact Center PLN resmi, ganti kalau perlu

/* ---------- Level risiko ---------- */
const LEVELS = {
  high: {
    key: "high", label: "Tinggi", zone: "Kritis",
    c: ["#FCA5A5", "#E5484D", "#B91C1C"],
    text: "text-[#E5484D]",
    badge: "bg-[#E5484D]/10 text-[#E5484D]",
    glow: "#E5484D",
    tint: "#FFE1E3",
    headTo: "#E5484D", // heading: biru -> merah
    pageBg: "linear-gradient(180deg, #FFFFFF 0%, #FFFFFF 30%, #FFE6EA 100%)",
    gradText: "from-[#F87171] to-[#B91C1C]",
    solid: "linear-gradient(135deg, #F87171 0%, #B91C1C 100%)",
    soft: "linear-gradient(135deg, #FFE1E3 0%, #FECACA 100%)",
  },
  medium: {
    key: "medium", label: "Medium", zone: "Waspada",
    c: ["#FDE047", "#F59E0B", "#EA7C0B"],
    text: "text-[#E8890C]",
    badge: "bg-[#F59E0B]/15 text-[#E8890C]",
    glow: "#F59E0B",
    tint: "#FFF1CC",
    headTo: "#F5B50B", // heading: biru -> kuning
    pageBg: "linear-gradient(180deg, #FFFFFF 0%, #FFFFFF 30%, #FFF4CC 100%)",
    gradText: "from-[#F59E0B] to-[#C2410C]",
    solid: "linear-gradient(135deg, #FBBF24 0%, #EA7C0B 100%)",
    soft: "linear-gradient(135deg, #FFF1CC 0%, #FDE68A 100%)",
  },
  low: {
    key: "low", label: "Low", zone: "Aman",
    c: ["#86EFAC", "#22C55E", "#15803D"],
    text: "text-[#16A34A]",
    badge: "bg-[#22C55E]/10 text-[#16A34A]",
    glow: "#22C55E",
    tint: "#D9F7E4",
    headTo: "#22C55E", // heading: biru -> hijau
    pageBg: "linear-gradient(180deg, #FFFFFF 0%, #FFFFFF 30%, #DDF6E6 100%)",
    gradText: "from-[#34D399] to-[#15803D]",
    solid: "linear-gradient(135deg, #4ADE80 0%, #15803D 100%)",
    soft: "linear-gradient(135deg, #D9F7E4 0%, #BBF7D0 100%)",
  },
};

function getRisk(score) {
  if (score >= 80) return LEVELS.high;
  if (score >= 40) return LEVELS.medium;
  return LEVELS.low;
}

/* ---------- Animasi angka / sweep grafik ---------- */
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

/* ---------- Data laporan di sekitar (contoh, ganti dengan data API) ---------- */
// level : "high" | "medium" | "low"  -> menentukan warna kartu
// step  : 1 = Baru diterima, 2 = Penjadwalan, 3 = Dalam proses perbaikan, 4 = Selesai
// foto  : isi URL foto laporan kalau ada (kosong = placeholder)
const STATUS = [
  { label: "Baru diterima", icon: "inbox" },
  { label: "Penjadwalan", icon: "event" },
  { label: "Dalam proses perbaikan", icon: "build" },
  { label: "Selesai", icon: "check_circle" },
];

const REPORTS = [
  { id: 1, nama: "Made Ayu", user: "made_ayu", lokasi: "Jl. Diponegoro Gg. 5, Sesetan", desc: "Percikan api di meteran depan rumah.", level: "high", step: 3, hari: 1, foto: "" },
  { id: 2, nama: "Wayan Surya", user: "wayan_s", lokasi: "Jl. Gurita, Sesetan", desc: "Tiang listrik miring setelah angin kencang.", level: "high", step: 2, hari: 2, foto: "" },
  { id: 3, nama: "Komang Dewi", user: "komang_dw", lokasi: "Jl. Raya Sesetan No. 18", desc: "MCB mulai panas dan sering turun.", level: "medium", step: 1, hari: 2, foto: "" },
  { id: 4, nama: "Putu Adi", user: "putuadi", lokasi: "Gg. Mawar, Sesetan", desc: "Kabel menjuntai dekat pohon, belum ada gangguan.", level: "medium", step: 2, hari: 4, foto: "" },
  { id: 5, nama: "Ni Luh Sari", user: "luh_sari", lokasi: "Jl. Pulau Moyo, Sesetan", desc: "Lampu jalan berkedip di satu titik.", level: "low", step: 4, hari: 6, foto: "" },
];

/* ---------- Rekomendasi per level ---------- */
function Recommendation({ risk }) {
  const phone = (
    <a href={`tel:${PLN_PHONE}`} className="font-extrabold underline underline-offset-2">PLN ({PLN_PHONE})</a>
  );
  const content = {
    high: {
      icon: "warning", title: "Waspada",
      body: <>Jika ada percikan api, asap, atau suara desingan keras yang mengkhawatirkan, segera laporkan dan hubungi {phone}.</>,
    },
    medium: {
      icon: "visibility", title: "Rekomendasi",
      body: <>Pantau kondisi listrik di sekitarmu 3 hari ke depan. Jika gangguan berulang atau makin parah, hubungi {phone}.</>,
    },
    low: {
      icon: "check_circle", title: "Aman",
      body: <>Tidak ada gangguan berarti di sekitarmu. Tetap pantau dan laporkan jika ada kondisi yang tidak biasa.</>,
    },
  }[risk.key];

  return (
    <div
      className="mt-5 flex items-start gap-3 rounded-2xl border-2 p-4 text-left transition-all duration-700"
      style={{ background: `linear-gradient(135deg, ${risk.tint} 0%, #FFFFFF 80%)`, borderColor: risk.glow }}
    >
      <span className={`material-symbols-outlined mt-0.5 text-[22px] ${risk.text}`}>{content.icon}</span>
      <div className="text-sm text-on-surface">
        <p className={`font-extrabold ${risk.text}`}>{content.title}</p>
        <p className="mt-0.5">{content.body}</p>
      </div>
    </div>
  );
}

/* ---------- Kartu satu laporan ---------- */
function ReportCard({ r }) {
  const lv = LEVELS[r.level];
  const st = STATUS[r.step - 1];
  return (
    <div
      className="rounded-2xl border-2 p-4 text-left shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
      style={{ background: `linear-gradient(135deg, ${lv.tint} 0%, #FFFFFF 75%)`, borderColor: lv.glow }}
    >
      {/* Profil */}
      <div className="flex items-center gap-3">
        <div
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-extrabold text-white"
          style={{ background: lv.solid }}
        >
          {r.nama.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">{r.nama}</p>
          <p className="truncate text-xs text-on-surface-variant">@{r.user}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className={`text-[11px] font-extrabold ${lv.text}`}>{lv.zone}</p>
          <p className="text-xs text-on-surface-variant">{r.hari} hari lalu</p>
        </div>
      </div>

      {/* Lokasi */}
      <p className="mt-2 flex items-center gap-1 text-xs text-on-surface-variant">
        <span className="material-symbols-outlined text-[14px]">location_on</span>
        {r.lokasi}
      </p>

      {/* Foto + deskripsi */}
      <div className="mt-3 flex gap-3">
        {r.foto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={r.foto} alt={`Foto laporan: ${r.desc}`} className="h-20 w-20 shrink-0 rounded-xl object-cover" />
        ) : (
          <div
            className="grid h-20 w-20 shrink-0 place-items-center rounded-xl border"
            style={{ background: lv.soft, borderColor: `${lv.glow}55` }}
            aria-label="Foto laporan belum tersedia"
          >
            <span className={`material-symbols-outlined text-[26px] ${lv.text}`}>photo_camera</span>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{r.desc}</p>
          <span className={`mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${lv.badge}`}>
            <span className="material-symbols-outlined text-[14px]">{st.icon}</span>
            {st.label}
          </span>
        </div>
      </div>

      {/* Progress penanganan */}
      <div className="mt-3 flex gap-1" role="img" aria-label={`Progres ${r.step} dari 4: ${st.label}`}>
        {[1, 2, 3, 4].map((n) => (
          <span
            key={n}
            className="h-1.5 flex-1 rounded-full"
            style={{ background: n <= r.step ? lv.solid : "rgba(13,27,42,0.10)" }}
          />
        ))}
      </div>
    </div>
  );
}

/* ---------- Tombol + daftar laporan sekitar ---------- */
function NearbyReports({ risk }) {
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
            <p className="text-xs font-semibold text-on-surface-variant">Laporan terbaru · radius 2 km</p>
            {REPORTS.map((r) => (
              <ReportCard key={r.id} r={r} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Kartu faktor ---------- */
const factors = [
  {
    label: "Kondisi tiang listrik", tag: "Tinggi", w: "w-4/5", note: "Tiang miring di Jl. Diponegoro",
    card: "bg-gradient-to-br from-[#F87171] to-[#B91C1C] shadow-[0_10px_24px_-6px_rgba(229,72,77,0.55)] hover:shadow-[0_20px_38px_-6px_rgba(229,72,77,0.75)]",
  },
  {
    label: "Cuaca BMKG angin kencang 3 hari", tag: "Waspada", w: "w-3/5", note: "Sumber: BMKG",
    card: "bg-gradient-to-br from-[#FBBF24] to-[#EA7C0B] shadow-[0_10px_24px_-6px_rgba(245,158,11,0.55)] hover:shadow-[0_20px_38px_-6px_rgba(245,158,11,0.75)]",
  },
  {
    label: "Laporan sekitar", tag: "Sedang", w: "w-2/5", note: "12 laporan dalam radius 2 km",
    card: "bg-gradient-to-br from-[#38BDF8] to-[#1D4ED8] shadow-[0_10px_24px_-6px_rgba(37,99,235,0.55),0_0_22px_rgba(56,189,248,0.45)] hover:shadow-[0_20px_38px_-6px_rgba(37,99,235,0.75),0_0_34px_rgba(56,189,248,0.7)]",
  },
];

export default function Beranda() {
  const router = useRouter();
  const [score, setScore] = useState(74); // ganti dengan skor dari API
  const [sending, setSending] = useState(false);
  const SHOW_DEBUG = true; // slider tes, set false kalau sudah tidak perlu

  const risk = getRisk(score);
  const shown = useAnimatedNumber(score);

  const handleNotify = () => {
    setSending(true);
    setTimeout(() => router.push("/pantau-pln"), 2500);
  };

  const stats = [
    { k: "Zona", v: risk.zone, solid: true },
    { k: "Poinmu", v: "1.240" },
    { k: "Peringkat", v: "#3" },
  ];

  return (
    <div className={`${montserrat.variable} mont relative overflow-hidden bg-white`}>
      {/* Semua font jadi Montserrat (ikon Material Symbols tidak ikut diganti) */}
      <style>{`.mont, .mont *:not(.material-symbols-outlined){font-family: var(--font-montserrat), sans-serif !important;}`}</style>

      {/* Background halaman: putih -> warna soft sesuai level (cross-fade) */}
      {Object.values(LEVELS).map((l) => (
        <div
          key={l.key}
          className="pointer-events-none absolute inset-0 transition-opacity duration-1000"
          style={{ background: l.pageBg, opacity: l.key === risk.key ? 1 : 0 }}
          aria-hidden
        />
      ))}

      <div className="relative mx-auto max-w-225 px-margin-mobile pb-20 pt-6 md:px-gutter">
        {sending && (
          <div className="fixed inset-0 z-100 grid place-items-center bg-[#0D1B2A]/85 backdrop-blur-sm">
            <div className="px-6 text-center text-white">
              <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-white/20 border-t-[#F59E0B]" />
              <p className="mt-6 text-lg font-semibold">Kami akan mengirimkan laporanmu ke PLN</p>
              <p className="mt-1 text-sm text-white/70">Mohon tunggu sebentar…</p>
            </div>
          </div>
        )}

        {/* Peringatan risiko di sekitar lokasi warga (data real dari API) */}
        <RiskNearbyAlert className="mb-6" />

        <Reveal>
          <div
            className="relative mb-6 overflow-hidden rounded-2xl border-2 bg-white p-8 transition-all duration-700"
            style={{ borderColor: risk.glow, boxShadow: `0 8px 28px -8px ${risk.glow}80` }}
          >
            <div className="text-center">
              <span className="inline-block rounded-full border-2 border-[#F59E0B] bg-transparent px-4 py-1 font-label-bold text-label-bold uppercase tracking-wider text-[#E8890C]">
                Lokasi Terkini
              </span>
              <h1
                className="mt-3 bg-clip-text font-headline-md text-headline-md text-transparent"
                style={{ backgroundImage: `linear-gradient(90deg, #1D4ED8 0%, ${risk.headTo} 100%)` }}
              >
                Kelurahan Sesetan, Denpasar
              </h1>
            </div>

            {/* Grafik skor */}
            <div className="my-6 grid place-items-center">
              <div className="relative h-44 w-44">
                <div
                  className="absolute -inset-2 rounded-full opacity-60 blur-md transition-all duration-700"
                  style={{
                    background: `conic-gradient(from 0deg, transparent 0%, ${risk.glow} 35%, transparent 70%)`,
                    animation: "spin 6s linear infinite",
                  }}
                />
                <div
                  className="relative grid h-44 w-44 place-items-center rounded-full"
                  style={{
                    background: `conic-gradient(from 0deg, ${risk.c[0]} 0%, ${risk.c[1]} ${shown * 0.55}%, ${risk.c[2]} ${shown}%, #e0e2e7 ${shown}% 100%)`,
                  }}
                >
                  <div className="grid h-36 w-36 place-items-center rounded-full bg-white">
                    <div className="text-center">
                      <div className={`text-5xl font-black tabular-nums transition-colors duration-500 ${risk.text}`}>
                        {Math.round(shown)}
                      </div>
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
                  <button
                    onClick={handleNotify}
                    className="flex items-center gap-2 rounded-full bg-risk-kritis px-6 py-3 font-label-bold text-label-bold text-white shadow-[0_6px_16px_-4px_rgba(229,72,77,0.5)] transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:shadow-[0_12px_28px_-2px_rgba(229,72,77,0.8),0_0_24px_rgba(229,72,77,0.6)] active:translate-y-0 active:scale-100"
                  >
                    <span className="material-symbols-outlined text-[20px]">notifications_active</span> Notifikasi PLN
                  </button>
                </div>
              )}

              <Recommendation risk={risk} />
              <NearbyReports risk={risk} />
            </div>

            {/* Zona / Poin / Peringkat */}
            <div className="mt-6 grid grid-cols-3 gap-3 border-t pt-5 text-center" style={{ borderColor: `${risk.glow}55` }}>
              {stats.map((s) => (
                <div key={s.k} className="rounded-xl px-2 py-3 shadow-sm" style={{ background: s.solid ? risk.solid : risk.soft }}>
                  <p className={`font-label-sm text-label-sm ${s.solid ? "text-white/85" : "text-on-surface-variant"}`}>{s.k}</p>
                  {s.solid ? (
                    <p className="font-headline-sm text-headline-sm font-extrabold text-white">{s.v}</p>
                  ) : (
                    <p className={`bg-linear-0-to-r bg-clip-text font-headline-sm text-headline-sm font-extrabold text-transparent ${risk.gradText}`}>
                      {s.v}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {SHOW_DEBUG && (
              <div className="mt-5 rounded-xl border border-dashed border-outline-variant p-3 text-center text-xs text-on-surface-variant">
                Tes skor: {score}
                <input type="range" min="0" max="100" value={score} onChange={(e) => setScore(Number(e.target.value))} className="mt-1 block w-full" />
              </div>
            )}
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            {factors.map((f) => (
              <div
                key={f.note}
                className={`rounded-2xl border-2 border-white/60 p-5 text-white transition-all duration-300 hover:-translate-y-2 ${f.card}`}
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <span className="font-label-bold text-label-bold text-white">{f.label}</span>
                  <span className="shrink-0 rounded-full border border-white/70 bg-white/20 px-2.5 py-0.5 font-label-sm text-label-sm font-bold text-white">
                    {f.tag}
                  </span>
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
            <Link
              href="/lapor"
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-linear-to-r from-[#0B2A5B] to-[#1D4ED8] px-6 py-3.5 font-label-bold text-label-bold text-[#FEF08A] shadow-[0_6px_16px_-4px_rgba(11,42,91,0.5)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_28px_-2px_rgba(11,42,91,0.55),0_0_26px_rgba(250,204,21,0.65)] active:translate-y-0 active:shadow-[0_4px_12px_-2px_rgba(11,42,91,0.6),0_0_18px_rgba(250,204,21,0.8)] [text-shadow:0_2px_6px_rgba(0,0,0,0.45)]"
            >
              <span className="material-symbols-outlined text-[20px] [text-shadow:0_2px_6px_rgba(0,0,0,0.45)]">photo_camera</span> Lapor Kondisi
            </Link>

            {/* Outline gradasi hijau + teks gradasi hijau */}
            <Link
              href="/peta-publik"
              className="group flex flex-1 rounded-full bg-linear-to-r from-[#4ADE80] to-[#15803D] p-0.5 shadow-[0_6px_16px_-4px_rgba(22,163,74,0.4)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_26px_-4px_rgba(22,163,74,0.5),0_0_26px_rgba(134,239,172,0.9)] active:translate-y-0 active:shadow-[0_6px_16px_-2px_rgba(22,163,74,0.55),0_0_32px_rgba(134,239,172,1)]"
            >
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