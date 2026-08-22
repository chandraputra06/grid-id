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
              "linear-gradient(rgba(13,21,38,0.72),rgba(13,21,38,0.82)), url('/hero-img.png')",
          }}
        />
        <div className="mx-auto flex max-w-[820px] flex-col items-center px-margin-mobile py-24 text-center md:py-28">
          <HeroIn>
            <h1 className="font-heading text-4xl font-extrabold leading-[1.08] tracking-tight text-white md:text-6xl">
              Ketahui risiko{" "}
              <span className="text-accent">pemadaman listrik</span> di lokasimu
              sebelum terjadi.
            </h1>
          </HeroIn>
          <HeroIn delay={0.12}>
            <p className="mx-auto mt-6 max-w-xl font-body-lg text-body-lg text-white/85">
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
                className="w-full rounded-full border-2 border-accent/80 bg-white/10 py-3.5 pl-12 pr-4 font-body-md text-body-md text-white placeholder:text-white/70 outline-none backdrop-blur focus:border-accent"
              />
            </div>
          </HeroIn>
        </div>
      </section>

      {/* ---------- STATS (white) ---------- */}
      <section className="bg-card-surface py-16">
        <div className="mx-auto grid max-w-[1120px] grid-cols-2 gap-8 px-gutter md:grid-cols-4">
          {stats.map(([n, l], i) => (
            <Reveal key={l} delay={i * 0.08} className="text-center">
              <div className="font-heading text-4xl font-extrabold text-brand md:text-5xl">
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
        <div className="relative overflow-visible">
          {/* MENGAPA */}
          <section className="px-margin-mobile pb-4 pt-8 md:px-gutter md:pt-12">
            <div className="mx-auto max-w-[1120px] rounded-[32px] bg-brand px-6 pb-40 pt-14 md:px-12 md:pb-48 md:pt-16">
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
              <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
                {props.map((p, i) => (
                  <Reveal key={p.title} delay={i * 0.1}>
                    <div className="group flex h-full min-h-[150px] items-center justify-between gap-5 rounded-[10px] border-2 border-white bg-gradient-to-r from-[#effafa] via-white to-[#3d6dd1] px-5 py-5 shadow-sm transition-transform hover:-translate-y-1 md:px-4">
                      <div>
                        <h3 className="font-heading text-base font-bold text-brand md:text-lg">
                          {p.title}
                        </h3>
                        <p className="mt-2 font-body-md text-xs leading-[1.4] text-brand-dark md:text-sm">
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
            <div className="mx-auto max-w-[1120px] rounded-[88px] border-[6px] border-white bg-brand px-3 py-16 md:px-3 md:py-20">
              <Reveal className="text-center">
                <h2 className="font-heading text-4xl font-extrabold text-white md:text-6xl">
                  Cara Kerja PawSphere
                </h2>
                <p className="mt-4 font-body-lg text-base text-white md:text-lg">
                  Mulai dalam hitungan menit, bantu jaga keandalan listrik di
                  sekitarmu!
                </p>
              </Reveal>
              <div className="mt-8 grid grid-cols-1 gap-0 sm:grid-cols-2 md:grid-cols-4">
                {steps.map((s, i) => {
                  const featured = i === 2;
                  return (
                    <Reveal key={s.n} delay={i * 0.1}>
                      <div
                        className={`group relative flex min-h-[220px] h-full flex-col items-center justify-center p-6 text-center transition-[transform,box-shadow,background-color] duration-300 ease-out hover:z-20 hover:-translate-y-2 hover:scale-[1.04] hover:bg-white hover:shadow-[0_14px_30px_rgba(13,21,38,0.22)] ${featured ? "z-10 bg-white shadow-xl ring-2 ring-[#3f62e0] md:-translate-y-1" : "bg-[#edf0f5] shadow-md"} ${i === 0 ? "rounded-l-[26px]" : ""} ${i === steps.length - 1 ? "rounded-r-[26px]" : ""}`}
                      >
                        <div className="relative mb-3">
                          <span className="grid h-12 w-12 place-items-center rounded-full bg-brand text-white">
                            <span
                              className="material-symbols-outlined"
                              style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                              {s.icon}
                            </span>
                          </span>
                          <span className="absolute -right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full bg-[#e8edf4] font-heading text-sm font-bold text-brand shadow ring-1 ring-black/5">
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
        <section className="px-3 pb-16 pt-6">
          <Reveal className="mx-auto max-w-[1240px]">
            <div className="flex flex-col items-start justify-between gap-6 rounded-[32px] bg-brand px-8 py-12 md:flex-row md:items-center md:px-14">
              <div className="max-w-xl">
                <h2 className="font-heading text-2xl font-extrabold text-white md:text-3xl">
                  Bergabung menjaga jaringan di wilayahmu
                </h2>
                <p className="mt-2 font-body-md text-body-md text-white/75">
                  Jadilah bagian dari solusi. Laporan dan partisipasimu membantu
                  mencegah krisis sebelum terjadi.
                </p>
              </div>
              <Link
                href="/masuk"
                className="shrink-0 rounded-full bg-white px-8 py-3.5 font-heading font-bold text-brand shadow-sm transition-transform hover:-translate-y-0.5"
              >
                Mulai Sekarang
              </Link>
            </div>
          </Reveal>
        </section>
      </div>
    </>
  );
}
