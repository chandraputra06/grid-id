import Link from "next/link";
import { Reveal, HeroIn } from "@/components/motion";

const stats = [
  ["1.240+", "Zona Terpantau"],
  ["8.500+", "Laporan Diproses"],
  ["50.000+", "Warga Terlibat"],
  ["92%", "Akurasi Prediksi"],
];

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

export default function Landing() {
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

      {/* ---------- STATS (white) ---------- */}
<section className="bg-card-surface py-16">
  <div className="mx-auto grid max-w-280 grid-cols-2 gap-8 px-gutter md:grid-cols-4">
    {stats.map(([n, l], i) => (
      <Reveal key={l} delay={i * 0.08} className="text-center">
        <div className="inline-block bg-linear-to-br from-[#021590] to-[#7bf0ff] bg-clip-text font-heading text-4xl font-extrabold text-transparent md:text-5xl">
          {n}
        </div>
        <div className="mt-1.5 font-body-md text-body-md text-on-surface-variant">
          {l}
        </div>
      </Reveal>
    ))}
  </div>
</section>

      {/* ---------- CONTENT wrapper (blue blocks + CTA) ---------- */}
     <div>
  <div className="relative isolate overflow-visible">
    {/* ===== BACKGROUND IMAGE (layer paling belakang) ===== */}
    <img
      src="/bali-bg3.png"
      alt=""
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 h-full w-full object-100% opacity-60"
    />

    {/* MENGAPA */}
    <section className="px-margin-mobile pb-4 pt-4 md:px-gutter md:pt-0">
      <div className="mx-auto max-w-325 rounded-4xl bg-linear-to-br from-[#3ba1ff] to-[#000f73] px- pb6-40 pt-10 md:px-12 md:pb-38 md:pt-16">
        <Reveal className="mx-auto max-w-4xl text-center">
          <h2 className="font-heading text-4xl font-extrabold text-white md:text-6xl">
            Mengapa Menggunakan GRID·ID?
          </h2>
          <p className="mx-auto mt-4 max-w-3xl font-body-md text-base leading-relaxed text-white md:text-lg">
            Dari deteksi dini berbasis AI hingga peta risiko real-time,
            semua yang kamu butuhkan untuk mengantisipasi pemadaman ada
            dalam satu platform yang mudah digunakan.
          </p>
        </Reveal>
        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
          {props.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.1}>
              <div className="group flex h-full min-h-37.5 items-center justify-between rounded-[10px] border-2 border-white bg-linear-to-r from-[#ffdf8e] to-[#fcffd3] px-5 py-5 shadow-sm transition-transform hover:-translate-y-3 md:px-4">
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

    {/* CARA KERJA — close to Mengapa, thick stroke + curved radius */}
    <section className="relative z-10 -mt-16 px-margin-mobile pb-6 pt-4 md:-mt-32 md:px-gutter md:pt-6">
      <div className="mx-auto max-w-325 rounded-[50px] border-0 border-white bg-linear-to-br from-[#fff384] to-[#f6b845] px-3 py-16 md:px-7 md:py-10">
        <Reveal className="text-center">
          <h2 className="font-heading text-4xl font-extrabold text-[#055dd9] md:text-6xl">
            Cara Kerja GRID.ID
          </h2>
          <p className="mt-3 font-body-lg text-base text-blue-800 md:text-lg">
            Mulai dalam hitungan menit, bantu jaga keandalan listrik di
            sekitarmu!
          </p>
        </Reveal>
        <div className="mt-8 grid grid-cols-1 gap-0 sm:grid-cols-2 md:grid-cols-4">
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
                  className={`group relative flex min-h-55 h-full flex-col items-center justify-center p-6 text-center transition-[transform,box-shadow,background-color] duration-300 ease-out hover:z-20 hover:-translate-y-2 hover:scale-[1.04] hover:bg-white hover:shadow-[0_16px_30px_rgba(13,21,38,0.22)] ${featured ? "z-10 bg-white shadow-xl ring-2 ring-[#fbf24a] md:-translate-y-1" : "bg-[#FFFFFF] shadow-xs"} ${i === 0 ? "rounded-l-[50px]" : ""} ${i === steps.length - 1 ? "rounded-r-[26px]" : ""}`}
                >
                  <div className="relative mb-3">
                    <span className="grid h-25 w-25 place-items-center overflow-hidden rounded-full bg-brand">
                      <img
                        src={stepImages[i]}
                        alt={s.title}
                        className="h-full w-full object-contain p-2"
                        loading="lazy"
                      />
                    </span>
                    <span className="absolute -right-7 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-[#fda501] font-heading text-sm font-bold text-white ring-black/10">
                      {s.n}
                    </span>
                  </div>
                  <h4 className="font-heading text-base font-bold text-brand md:text-lg">
                    {s.title}
                  </h4>
                  <p className="mt-2 font-body-md text-xs leading-[1.4] text-brand-dark md:text-sm">
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
 <section className="bg-[#ddefff] px-3 pb-16 pt-6">
    <Reveal className="mx-auto max-w-325">
      <div className="relative flex flex-col items-start justify-between gap-6 rounded-[40px]  bg-linear-to-r from-[#0a60ff] to-[#eea51e] px-8 py-20 md:flex-row md:items-center md:px-14">
        <div className="max-w-xl">
          <h2 className="font-heading text-2xl font-extrabold text-white md:text-4xl">
            Bergabung menjaga jaringan di wilayahmu
          </h2>
          <p className="mt-4 font-body-md text-body-lg text-white">
            Jadilah bagian dari solusi. Laporan dan partisipasimu membantu
            mencegah krisis sebelum terjadi.
          </p>
        </div>

        {/* MASKOT (ganti src dengan file di public/) */}
        <img
          src="/maskot-cta.png"
          alt="Maskot GRID·ID"
          className="pointer-events-none mx-auto h-auto w-48 shrink-0 self-center md:absolute md:left-[48%] md:top-1/2 md:mx-0 md:w-72 md:-translate-y-1/2 lg:w-80"
        />

        <Link
          href="/masuk"
          className="shrink-0 rounded-full border border-[#0a60ff] bg-white px-16 py-4.5 font-heading font-bold text-brand shadow-[0_10px_25px_rgba(0,0,0,0.3)] transition-all hover:-translate-y-1 hover:shadow-[0_16px_35px_rgba(0,0,0,0.35)] md:text-xl"
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
