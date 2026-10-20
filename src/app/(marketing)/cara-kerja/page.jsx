import Link from "next/link";
import { Reveal, HeroIn } from "@/components/motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCamera, faCloudRain, faGaugeHigh, faInfoCircle, faMagnifyingGlass,
  faMap, faTemperatureHalf, faWind, faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";

const stepColors = [
  { from: "#ffd23f", to: "#ffb020", text: "#c27c00" }, // 1: kuning
  { from: "#ffb347", to: "#f5873a", text: "#c2570c" }, // 2: orange
  { from: "#3e6ad8", to: "#7fb0ff", text: "#2f5bd0" }, // 3: biru
  { from: "#00278d", to: "#3e6ad8", text: "#00278d" }, // 4: biru tua
];

const pipeline = [
  { icon: faCamera, title: "1. Foto kondisi", body: "Warga mengunggah foto tiang atau kabel yang mencurigakan." },
  { icon: faMagnifyingGlass, title: "2. Sistem menilai", body: "Sistem memeriksa foto untuk menemukan tingkat kerusakan visual." },
  { icon: faCloudRain, title: "3. Data BMKG", body: "Data laporan dipadukan dengan prakiraan cuaca lokal dari BMKG." },
  { icon: faGaugeHigh, title: "4. Skor prioritas", body: "Skor risiko membantu menentukan tindakan tim di lapangan." },
];

const formula = [
  {
    label: "Kerusakan visual",
    pct: 45,
    icon: "/icon-kerusakan.png",
    from: "#0a60ff",
    to: "#34aaff",
  },
  {
    label: "Cuaca (Data BMKG)",
    pct: 35,
    icon: "/icon-cuaca.png",
    from: "#f5a623",
    to: "#ffd23f",
  },
  {
    label: "Kepadatan laporan",
    pct: 25,
    icon: "/icon-kepadatan.png",
    from: "#16a34a",
    to: "#4ade80",
  },
];

const weather = [
  { icon: faWind, accent: "border-risk-waspada", color: "text-risk-waspada", title: "Angin Kencang", body: "Meningkatkan risiko pohon tumbang mengenai jaringan kabel terbuka." },
  { icon: faCloudRain, accent: "border-risk-kritis", color: "text-risk-kritis", title: "Hujan Lebat", body: "Memperburuk isolator retak yang memicu korsleting lokal dan gardu rawan rendam." },
  { icon: faTemperatureHalf, accent: "border-tertiary", color: "text-tertiary", title: "Kelembapan", body: "Kondisi ekstrem mempercepat korosi pada sambungan transformator tua." },
];

export default function CaraKerja() {
  return (
    <>
  {/* Hero */}
  <section className="relative isolate overflow-hidden">
  {/* Background image */}
  <div
    className="absolute inset-0 -z-20 bg-cover bg-center"
    style={{ backgroundImage: "url('/hero-alurkerja.png')" }}
  />
  {/* Overlay gradasi biru transparan */}
  <div className="absolute inset-0 -z-10 bg-linear-to-r from-[#00278d] via-[#3e6ad8] to-[#34aaff] opacity-90" />

  <div className="mx-auto grid max-w-280 grid-cols-1 items-center gap-10 px-margin-mobile py-20 md:grid-cols-2 md:py-10">
    {/* Kolom kiri: teks rata kiri */}
    <div className="flex flex-col items-start text-left">
      <HeroIn>
        <h1 className="font-heading text-4xl font-extrabold leading-[1.08] tracking-tight text-white drop-shadow-[0_2px_12px_#00000073] md:text-6xl">
          Alur Kerja <span className="text-accent">GRID·ID</span>
        </h1>
      </HeroIn>

      <HeroIn delay={0.12}>
        <p className="mt-6 max-w-xl font-body-lg text-body-lg text-white/90 drop-shadow-[0_1px_6px_#00000080]">
          Dari laporan warga hingga rekomendasi tindakan, pahami bagaimana GRID·ID membantu menjaga jaringan listrik di sekitarmu.
        </p>
      </HeroIn>

      <HeroIn delay={0.24} className="mt-9">
        <Link
          href="/beranda"
          className="inline-flex items-center gap-2 rounded-full bg-accent px-8 py-4 font-heading font-bold text-white shadow-[0_8px_24px_#F5A6238C,0_0_32px_#F5A6238C] ring-1 ring-white/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_#F5A623B3,0_0_44px_#F5A623BF]"
        >
          <FontAwesomeIcon icon={faMap} className="h-4 w-4" /> Cek Risiko Lokasimu
        </Link>
      </HeroIn>
    </div>

    {/* Kolom kanan: maskot */}
    <HeroIn delay={0.36} className="flex justify-center md:justify-end">
      <img
        src="/maskot-berdua.png"
        alt="Maskot GRID·ID"
        className="w-56 drop-shadow-[0_16px_32px_#00000059] sm:w-72 md:w-full md:max-w-112.5"
      />
    </HeroIn>
  </div>
</section>

      {/* Pipeline */}
      <section className="bg-linear-to-b from-[#ffffff] to-[#fffbe4] py-12 md:py-16">
        <div className="mx-auto max-w-300 px-gutter">
          <Reveal>
            <h2 className="mx-auto mb-8 w-fit bg-linear-to-br from-blue-950 to-blue-600 bg-clip-text pb-1 text-center font-headline-md text-headline-md text-transparent md:mb-12">
              Alur Kerja
            </h2>
          </Reveal>

          <div className="relative flex flex-col items-start justify-between md:flex-row md:items-start">
            {/* Garis penghubung: kanan (biru tua) -> kiri (kuning-orange) */}
            <div className="absolute left-[12.5%] right-[12.5%] top-10 z-0 hidden h-1 -translate-y-1/2 rounded-full bg-linear-to-l from-[#00278d] via-[#3e6ad8] to-[#ffc42d] md:block" />

            {pipeline.map((s, i) => {
              const col = stepColors[i];
              return (
                <Reveal key={s.title} delay={i * 0.12} className="relative z-10 mb-8 w-full last:mb-0 md:mb-0 md:w-1/4">
                  <div className="flex flex-col items-center">
                    {/* Lingkaran gradasi + border putih */}
                    <div
                      className="mb-3 flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-white shadow-[0_6px_14px_-2px_#0D1B2A59] md:mb-4 md:h-20 md:w-20"
                      style={{ backgroundImage: `linear-gradient(135deg, ${col.from}, ${col.to})` }}
                    >
                      <FontAwesomeIcon icon={s.icon} className="h-5 w-5 text-white drop-shadow-[0_2px_3px_#00000059] md:h-6 md:w-6" />
                    </div>

                    {/* Teks mengikuti warna lingkaran */}
                    <h3 className="mb-1.5 text-center font-headline-sm text-headline-sm md:mb-2" style={{ color: col.text }}>
                      {s.title}
                    </h3>
                    <p className="px-4 text-center font-body-md text-body-md" style={{ color: col.text }}>
                      {s.body}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Transparent formula + why weather */}
      <section className="bg-linear-to-b from-[#fffbe4] to-[#ffffff]">
        <div className="mx-auto grid max-w-300 grid-cols-1 gap-8 px-gutter py-12 md:py-16 lg:grid-cols-12 lg:gap-10">
          <Reveal className="lg:col-span-5">
            <div className="rounded-2xl border border-[#fdd32c] bg-linear-to-b from-[#ffffff] to-[#fafdff] p-6 shadow-[1px_3px_10px_-2px_#0D1B2A40] md:p-8">
              <h2 className="mb-3 bg-linear-to-r from-[#3d62f7] to-[#32e0ff] bg-clip-text font-headline-md text-headline-md text-transparent">
                Skor Risiko yang bisa dijelaskan
              </h2>
              <p className="mb-5 font-body-md text-body-md text-black">
                Setiap skor disusun transparan (bukan black-box) berdasarkan tiga pilar data utama.
              </p>

              <div className="space-y-4">
                {formula.map((f) => (
                  <div key={f.label}>
                    <div className="mb-2 flex items-center justify-between font-label-sm text-label-sm">
                      <div className="flex items-center gap-3">
                        {/* Icon: kotak gradasi sesuai warna bar */}
                        <div
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full shadow-md"
                          style={{ backgroundImage: `linear-gradient(135deg, ${f.from}, ${f.to})` }}
                        >
                          <img src={f.icon} alt="" className="h-7 w-7 object-contain" />
                        </div>
                        <span>{f.label}</span>
                      </div>
                      <span className="font-bold" style={{ color: f.from }}>{f.pct}%</span>
                    </div>

                    {/* Track */}
                    <div className="relative w-full overflow-hidden rounded-full bg-surface-container" style={{ height: 8 }}>
                      {/* Fill */}
                      <div
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          height: "100%",
                          width: `${f.pct}%`,
                          borderRadius: 9999,
                          backgroundImage: `linear-gradient(90deg, ${f.from}, ${f.to})`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-center gap-2 border-t border-surface-variant pt-4 text-brand opacity-70">
                <FontAwesomeIcon icon={faInfoCircle} className="h-3.5 w-3.5" />
                <span className="font-label-sm text-label-sm">Sumber data cuaca: BMKG</span>
              </div>
            </div>
          </Reveal>

          <div className="lg:col-span-7">
            <Reveal>
              <h2 className="mb-5 w-fit bg-linear-to-r from-[#3e6ad8] to-[#f5a623] bg-clip-text pb-1 font-headline-md text-headline-md text-transparent md:mb-6">
                Mengapa Cuaca Penting?
              </h2>
            </Reveal>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
              {weather.map((c, i) => (
                <Reveal key={c.title} delay={i * 0.1}>
                  <div className="group relative isolate flex h-full flex-col items-start overflow-hidden rounded-2xl border-2 border-transparent bg-[#2a44d8] p-5 shadow-[5px_7px_10px_-1px_#0D1B2A66] transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-[#FFF3A3] hover:shadow-[8px_12px_14px_-2px_#0D1B2A80,0_0_28px_6px_#FFC42D80,0_0_56px_12px_#FFC42D40] md:p-6">
                    {/* Layer 1: gambar (ganti nama file sesuai di /public) */}
                    <div
                      className="absolute inset-0 -z-20 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                      style={{ backgroundImage: "url('/weather-card.png')" }}
                    />
                    {/* Layer 2: overlay gradasi biru tua -> biru muda */}
                    <div className="absolute inset-0 -z-10 bg-linear-to-br from-[#00278dD9] to-[#1da5ffa6]" />

                    {/* Icon kuning */}
                    <FontAwesomeIcon icon={c.icon} className="mb-3 h-6 w-6 text-[#FFC42D]" />
                    <h4 className="mb-1.5 font-headline-sm text-headline-sm text-white drop-shadow-[0_1px_6px_#00000066]">{c.title}</h4>
                    <p className="font-body-md text-body-md text-white/90 drop-shadow-[0_1px_4px_#00000066]">{c.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Early detection reward */}
      <section className="relative isolate overflow-hidden py-12 md:py-16">
        {/* Layer 1: background image (atur transparansi lewat opacity-*) */}
        <div
          className="absolute inset-0 -z-20 bg-cover bg-center opacity-30"
          style={{ backgroundImage: "url('/bg-deteksi.png')" }}
        />
        {/* Layer 2: overlay putih -> biru primary-container */}
        <div className="absolute inset-0 -z-10 bg-linear-to-br from-white/90 via-white/60 to-primary-container/40" />

        <div className="mx-auto grid max-w-300 grid-cols-1 items-center gap-8 px-gutter md:grid-cols-2 md:gap-10">
          <Reveal>
            <h2 className="mb-4 font-headline-lg-mobile text-headline-lg-mobile text-primary-container md:font-headline-lg md:text-headline-lg">
              Deteksi dini dihargai lebih tinggi
            </h2>
            <p className="mb-5 font-body-lg text-body-lg text-black">
              Kami membalik insentif: pelaporan awal sebelum kondisi memburuk memberi poin lebih tinggi
              daripada laporan yang sudah darurat — mendorong deteksi dini.
            </p>
            <ul className="flex flex-col items-start gap-3 font-body-md text-body-md">
              {["Mencegah kerusakan eskalatif", "Mengoptimalkan rute teknisi lapangan"].map((t) => (
                <li
                  key={t}
                  className="flex w-fit items-center gap-3 rounded-full bg-linear-to-r from-[#ffd23f] to-[#f5873a] px-5 py-2.5 font-semibold text-[#1a1a1a] shadow-[0_6px_16px_-2px_#F5873A80,0_0_22px_#FFC42D80] md:px-6 md:py-3"
                >
                  <FontAwesomeIcon icon={faCheckCircle} className="h-4 w-4 shrink-0 text-white drop-shadow-[0_1px_2px_#00000040]" />
                  {t}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="relative overflow-hidden rounded-2xl bg-card-surface p-5 shadow-[0_4px_12px_#0D1B2A0D] md:p-8">
              <div className="flex h-44 items-end justify-between gap-3 border-b border-surface-variant pb-2 md:h-48 md:gap-4">
                {[
                  { a: "Fase Awal", b: "Retak Kecil", pts: "+50 Poin", from: "#3e6ad8", to: "#00278d", h: 128, col: "#00278d" },
                  { a: "Fase Lanjut", b: "Miring/Pecah", pts: "+20 Poin", from: "#ffd23f", to: "#f5873a", h: 64, col: "#c2570c" },
                  { a: "Fase Kritis", b: "Sudah Putus", pts: "+5 Poin", from: "#ff8a8a", to: "#d62828", h: 24, col: "#b91c1c" },
                ].map((d) => (
                  <div key={d.a} className="group flex w-1/3 flex-col items-center">
                    <span
                      className="mb-2 font-label-bold text-label-bold opacity-0 transition-opacity group-hover:opacity-100"
                      style={{ color: d.col }}
                    >
                      {d.pts}
                    </span>
                    <div
                      className="w-full rounded-t-md transition-opacity hover:opacity-90"
                      style={{
                        height: d.h,
                        backgroundImage: `linear-gradient(to bottom, ${d.from}, ${d.to})`,
                      }}
                    />
                    <span className="mt-2 text-center font-label-sm text-label-sm text-on-surface-variant">
                      {d.a}<br />({d.b})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="relative isolate overflow-hidden bg-linear-to-r from-primary-container to-blue-900 py-12 text-on-primary-container md:py-20">
        {/* Background image (atur transparansi lewat opacity-*) */}
        <div
          className="absolute inset-0 -z-10 bg-cover bg-center opacity-5"
          style={{ backgroundImage: "url('/bg-alurkerja2.png')" }}
        />

        {/* Maskot kiri (disembunyikan di mobile) */}
        <img
          src="/cta-maskot-kiri.png"
          alt=""
          className="pointer-events-none absolute bottom-0 left-3 hidden h-48 w-auto drop-shadow-[0_12px_20px_#00000059] md:block lg:left-16 lg:h-72"
        />

        {/* Maskot kanan (tinggi sama dengan kiri) */}
        <img
          src="/cta-maskot-kanan.png"
          alt=""
          className="pointer-events-none absolute bottom-1 right-4 hidden h-48 w-auto drop-shadow-[0_12px_20px_#00000059] md:block lg:right-16 lg:h-72"
        />

        <div className="relative mx-auto max-w-3xl px-gutter text-center">
          <Reveal>
            <h2 className="mx-auto mb-4 w-fit bg-linear-to-r from-[#fff388] to-[#ffd04d] bg-clip-text pb-1 font-headline-lg-mobile text-headline-lg-mobile text-transparent drop-shadow-[0_0_8px_#FFF3A399] md:font-headline-lg md:text-headline-lg">
              Siap melindungi wilayahmu?
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mb-7 font-body-lg text-body-lg text-yellow-300">
              Mulai periksa indeks risiko lingkungan sekitarmu hari ini.
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <Link
              href="/beranda"
              className="inline-flex items-center gap-2 rounded-full bg-card-surface px-8 py-4 font-label-bold text-label-bold text-primary-container shadow-[0_6px_16px_-2px_#FFE14D80] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_-2px_#00000066,0_0_28px_6px_#FFF3A3A6]"
            >
              <FontAwesomeIcon icon={faMap} className="h-4 w-4" /> Cek Risiko Lokasimu
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}