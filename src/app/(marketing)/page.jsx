"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Reveal, HeroIn } from "@/components/motion";

/* ---------- DATA STATS (dari backend) ---------- */
// GET {API}/api/public/stats -> { ok, data: { zona_terpantau, laporan_diproses, warga_terlibat, akurasi_prediksi } }
const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

async function fetchStats(signal) {
  const res = await fetch(`${API_URL}/api/public/stats`, { signal });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json || json.ok === false) throw new Error(json?.error?.message || "Gagal memuat statistik");
  return json.data;
}

const fmtCount = (n) => (n == null ? "—" : n > 0 ? `${n.toLocaleString("id-ID")}+` : "0");
const fmtPct = (n) => (n == null ? "—" : `${n}%`);

const props = [
  {
    title: "Prediksi Dini",
    body: "Sistem AI menganalisis pola historis dan cuaca untuk memberikan skor risiko pemadaman sebelum terjadi.",
  },
  {
    title: "Lapor & Dapatkan Poin",
    body: "Laporkan kondisi tiang atau kabel bermasalah di sekitarmu, biarkan AI memvalidasinya, dan kumpulkan poin kontribusi.",
  },
  {
    title: "Peta Kesehatan Jaringan",
    body: "Akses peta interaktif yang menunjukkan status kesehatan infrastruktur listrik di berbagai wilayah secara real-time.",
  },
];

const steps = [
  {
    n: 1,
    icon: "add_a_photo",
    title: "Foto Kondisi",
    body: "Warga dapat melaporkan visual infrastruktur yang mencurigakan.",
  },
  {
    n: 2,
    icon: "smart_toy",
    title: "AI Menilai",
    body: "Sistem memproses gambar untuk mendeteksi anomali secara otomatis.",
  },
  {
    n: 3,
    icon: "rainy",
    title: "Cuaca BMKG",
    body: "Data laporan digabungkan dengan data cuaca dari BMKG.",
  },
  {
    n: 4,
    icon: "speed",
    title: "Skor Prioritas",
    body: "Tingkat risiko dihasilkan untuk mitigasi pemadaman proaktif.",
  },
];

/*
  SISTEM SPACING & RADIUS (biar konsisten):
  - Padding horizontal section : px-margin-mobile md:px-gutter
  - Radius container besar     : rounded-3xl md:rounded-[48px]
  - Radius card kecil          : rounded-2xl / rounded-[10px]
  - Gap grid                   : gap-4 md:gap-5
  - Judul section              : text-3xl sm:text-4xl md:text-5xl lg:text-6xl
*/

export default function Landing() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const ctrl = new AbortController();
    fetchStats(ctrl.signal)
      .then(setData)
      .catch(() => {}); // gagal/abort -> tetap tampil "—"
    return () => ctrl.abort();
  }, []);

  const stats = [
    [fmtCount(data?.zona_terpantau), "Zona Terpantau"],
    [fmtCount(data?.laporan_diproses), "Laporan Diproses"],
    [fmtCount(data?.warga_terlibat), "Warga Terlibat"],
    [fmtPct(data?.akurasi_prediksi), "Akurasi Prediksi"],
  ];

  return (
    <>
         {/* ---------- HERO ---------- */}
      <section className="relative isolate overflow-hidden">
        <div
          className="absolute inset-0 -z-10 bg-cover bg-center"
          style={{
          backgroundImage:
          "linear-gradient(to right, rgba(59,161,255,0.8), rgba(0,12,92,0.7)), url('/hero-new2.png')",
          }}

        />
        <div className="mx-auto flex max-w-205 flex-col items-center px-margin-mobile py-24 text-center md:py-16">
          <HeroIn>
            <h1 className="font-heading text-4xl font-extrabold leading-[1.08] tracking-tight text-white md:text-6xl">
             Ketahui resiko{" "}
             <span className="bg-linear-to-b from-[#ffe67e] to-[#fed400] bg-clip-text text-transparent">
             Pemadaman Listrik
             </span>{" "}
             lokasimu sebelum terjadi
              </h1> 
          </HeroIn>
          <HeroIn delay={0.12}>
          <p className="mx-auto mt-6 max-w-xl font-body-lg text-body-lg text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
             Menggabungkan kecerdasan buatan (AI) dengan data cuaca resmi BMKG
             untuk memprediksi gangguan jaringan listrik dengan akurasi tinggi.
             Lindungi aktivitasmu dari pemadaman tak terduga.
          </p>
        </HeroIn>
          <HeroIn delay={0.24} className="mt-9 w-full max-w-md">
            <Link
              href="/beranda"
              className="block rounded-full bg-accent py-4 text-center font-heading font-bold text-white shadow-[0_8px_24px_rgba(245,166,35,0.45)] transition-transform hover:-translate-y-0.5"
            >
              Cek Resiko
            </Link>
            <div className="relative mt-4">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-accent">
                location_on
              </span>
              <input
                type="text"
                placeholder="Masukkan kelurahan atau desamu"
                className="w-full rounded-full border-2 border-accent/80 bg-white/19 py-3.5 pl-12 pr-4 font-body-md text-body-md text-white placeholder:text-white outline-none backdrop-blur(60px) focus:border-accent"
              />
            </div>
          </HeroIn>
        </div>
      </section>
      
      {/* ---------- STATS ---------- */}
      <section className="bg-card-surface py-12 md:py-16">
        <div className="mx-auto grid max-w-280 grid-cols-2 gap-x-4 gap-y-8 px-margin-mobile md:grid-cols-4 md:gap-8 md:px-gutter">
          {stats.map(([n, l], i) => (
            <Reveal key={l} delay={i * 0.08} className="text-center">
              <div className="inline-block bg-linear-to-br from-[#021590] to-[#7bf0ff] bg-clip-text font-heading text-3xl font-extrabold text-transparent sm:text-4xl md:text-5xl">
                {n}
              </div>
              <div className="mt-1.5 font-body-md text-sm text-on-surface-variant md:text-body-md">
                {l}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- CONTENT wrapper (blue block + yellow block + CTA) ---------- */}
      <div>
        <div className="relative isolate overflow-visible">
          {/* BACKGROUND IMAGE */}
          <img
            src="/bali-bg3.png"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover opacity-60"
          />

          {/* MENGAPA */}
          <section className="px-margin-mobile pt-6 md:px-gutter md:pt-8">
            {/* pb besar = ruang untuk overlap section Cara Kerja */}
            <div className="mx-auto max-w-325 rounded-3xl bg-linear-to-br from-[#3ba1ff] to-[#000f73] px-5 pb-20 pt-10 sm:px-8 md:rounded-[48px] md:px-12 md:pb-36 md:pt-16">
              <Reveal className="mx-auto max-w-4xl text-center">
                <h2 className="font-heading text-3xl font-extrabold text-white sm:text-4xl md:text-5xl lg:text-6xl">
                  Mengapa Menggunakan GRID·ID?
                </h2>
                <p className="mx-auto mt-4 max-w-3xl font-body-md text-base leading-relaxed text-white md:text-lg">
                  Dari deteksi dini berbasis AI hingga peta risiko real-time,
                  semua yang kamu butuhkan untuk mengantisipasi pemadaman ada
                  dalam satu platform yang mudah digunakan.
                </p>
              </Reveal>
              <div className="mt-8 grid grid-cols-1 gap-4 md:mt-10 md:grid-cols-3 md:gap-5">
                {props.map((p, i) => (
                  <Reveal key={p.title} delay={i * 0.1}>
                    <div className="group flex h-full min-h-32 items-center justify-between gap-3 rounded-[10px] border-2 border-white bg-linear-to-r from-[#ffdf8e] to-[#fcffd3] p-5 shadow-sm transition-transform hover:-translate-y-2 md:min-h-37.5">
                      <div>
                        <h3 className="font-heading text-base font-bold text-brand md:text-lg">
                          {p.title}
                        </h3>
                        <p className="mt-2 font-body-md text-xs leading-[1.6] text-brand-dark md:text-sm">
                          {p.body}
                        </p>
                      </div>
                      <span
                        className="material-symbols-outlined shrink-0 text-[34px] text-white transition-transform group-hover:translate-x-0.5"
                        style={{ fontVariationSettings: "'wght' 600" }}
                      >
                        chevron_right
                      </span>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          {/* CARA KERJA — overlap ke Mengapa */}
          <section className="relative z-10 -mt-12 px-margin-mobile pb-8 md:-mt-28 md:px-gutter md:pb-10">
            <div className="mx-auto max-w-325 rounded-3xl bg-linear-to-br from-[#fff384] to-[#f6b845] px-4 py-10 sm:px-6 md:rounded-[48px] md:px-8 md:py-12">
              <Reveal className="text-center">
                <h2 className="font-heading text-3xl font-extrabold text-[#055dd9] sm:text-4xl md:text-5xl lg:text-6xl">
                  Cara Kerja GRID.ID
                </h2>
                <p className="mx-auto mt-3 max-w-2xl font-body-lg text-base text-blue-800 md:text-lg">
                  Mulai dalam hitungan menit, bantu jaga keandalan listrik di
                  sekitarmu!
                </p>
              </Reveal>

              {/* mobile/tablet: card terpisah (gap-4); desktop: strip menyambung (gap-0) */}
              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:mt-10 md:grid-cols-4 md:gap-0">
                {steps.map((s, i) => {
                  const featured = i === 2;
                  const stepImages = [
                    "/foto.png",
                    "/ai-analysis.png",
                    "/cuaca-bmkg.png",
                    "/prioritas.png",
                  ];
                  return (
                    <Reveal key={s.n} delay={i * 0.1}>
                      <div
                        className={`group relative flex h-full min-h-55 flex-col items-center justify-center rounded-3xl p-6 text-center transition-[transform,box-shadow,background-color] duration-300 ease-out hover:z-20 hover:-translate-y-2 hover:scale-[1.03] hover:bg-white hover:shadow-[0_16px_30px_rgba(13,21,38,0.22)] md:rounded-none ${
                          featured
                            ? "z-10 bg-white shadow-xl ring-2 ring-[#fbf24a] md:-translate-y-1"
                            : "bg-white shadow-xs"
                        } ${i === 0 ? "md:rounded-l-[40px]" : ""} ${
                          i === steps.length - 1 ? "md:rounded-r-[40px]" : ""
                        }`}
                      >
                        <div className="relative mb-3">
                          <span className="grid h-24 w-24 place-items-center overflow-hidden rounded-full bg-brand md:h-25 md:w-25">
                            <img
                              src={stepImages[i]}
                              alt={s.title}
                              className="h-full w-full object-contain p-2"
                              loading="lazy"
                            />
                          </span>
                          <span className="absolute -right-5 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-[#fda501] font-heading text-sm font-bold text-white md:-right-6 md:h-10 md:w-10">
                            {s.n}
                          </span>
                        </div>
                        <h4 className="font-heading text-base font-bold text-brand md:text-lg">
                          {s.title}
                        </h4>
                        <p className="mt-2 max-w-60 font-body-md text-xs leading-normal text-brand-dark md:text-sm">
                          {s.body}
                        </p>
                      </div>
                    </Reveal>
                  );
                })}
              </div>
            </div>
          </section>
        </div>

        {/* ---------- CTA ---------- */}
        <section className="bg-[#ddefff] px-margin-mobile pb-12 pt-6 md:px-gutter md:pb-16">
          <Reveal className="mx-auto max-w-325">
            <div className="relative flex flex-col items-center justify-between gap-6 rounded-3xl bg-linear-to-r from-[#0a60ff] to-[#eea51e] px-6 py-10 text-center sm:px-8 md:flex-row md:items-center md:gap-8 md:rounded-[48px] md:px-14 md:py-16 md:text-left">
              <div className="max-w-xl">
                <h2 className="font-heading text-2xl font-extrabold text-white sm:text-3xl md:text-4xl">
                  Bergabung menjaga jaringan di wilayahmu
                </h2>
                <p className="mt-3 font-body-md text-body-lg text-white md:mt-4">
                  Jadilah bagian dari solusi. Laporan dan partisipasimu membantu
                  mencegah krisis sebelum terjadi.
                </p>
              </div>

              {/* MASKOT (ganti src dengan file di public/) */}
              <img
                src="/maskot-cta.png"
                alt="Maskot GRID·ID"
                className="pointer-events-none h-auto w-40 shrink-0 sm:w-48 md:absolute md:left-[48%] md:top-1/2 md:w-72 md:-translate-y-1/2 lg:w-80"
              />

              <Link
                href="/masuk"
                className="w-full shrink-0 rounded-full border border-[#0a60ff] bg-white px-8 py-4 text-center font-heading font-bold text-brand shadow-[0_10px_25px_rgba(0,0,0,0.3)] transition-all hover:-translate-y-1 hover:shadow-[0_16px_35px_rgba(0,0,0,0.35)] sm:w-auto md:px-16 md:py-4.5 md:text-xl"
              >
                Mulai Sekarang!
              </Link>
            </div>
          </Reveal>
        </section>
      </div>
    </>
  );
}