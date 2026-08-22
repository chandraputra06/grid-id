import Link from "next/link";
import { Reveal, HeroIn } from "@/components/motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCamera, faCloudRain, faGaugeHigh, faInfoCircle, faMagnifyingGlass,
  faMap, faTemperatureHalf, faWind, faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";

const pipeline = [
  { icon: faCamera, title: "1. Foto kondisi", body: "Warga mengunggah foto tiang atau kabel yang mencurigakan." },
  { icon: faMagnifyingGlass, title: "2. Sistem menilai", body: "Sistem memeriksa foto untuk menemukan tingkat kerusakan visual." },
  { icon: faCloudRain, title: "3. Data BMKG", body: "Data laporan dipadukan dengan prakiraan cuaca lokal dari BMKG." },
  { icon: faGaugeHigh, title: "4. Skor prioritas", body: "Skor risiko membantu menentukan tindakan tim di lapangan." },
];

const formula = [
  { label: "Kerusakan visual", pct: "40%", bar: "bg-primary-container", w: "w-[40%]", val: "text-primary-container" },
  { label: "Cuaca (Data BMKG)", pct: "35%", bar: "bg-secondary-container", w: "w-[35%]", val: "text-secondary-container" },
  { label: "Kepadatan laporan", pct: "25%", bar: "bg-tertiary", w: "w-[25%]", val: "text-tertiary" },
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
        <div className="absolute inset-0 -z-10 bg-cover bg-center" style={{ backgroundImage: "linear-gradient(rgba(13,21,38,0.72),rgba(13,21,38,0.82)), url('/hero-img.png')" }} />
        <div className="mx-auto flex max-w-[820px] flex-col items-center px-margin-mobile py-24 text-center md:py-28">
          <HeroIn><h1 className="font-heading text-4xl font-extrabold leading-[1.08] tracking-tight text-white md:text-6xl">Alur Kerja <span className="text-accent">GRID·ID</span></h1></HeroIn>
          <HeroIn delay={0.12}><p className="mx-auto mt-6 max-w-xl font-body-lg text-body-lg text-white/85">Dari laporan warga hingga rekomendasi tindakan, pahami bagaimana GRID·ID membantu menjaga jaringan listrik di sekitarmu.</p></HeroIn>
          <HeroIn delay={0.24} className="mt-9"><Link href="/beranda" className="inline-flex items-center gap-2 rounded-full bg-accent px-8 py-4 font-heading font-bold text-white shadow-[0_8px_24px_rgba(245,166,35,0.45)] transition-transform hover:-translate-y-0.5"><FontAwesomeIcon icon={faMap} className="h-4 w-4" /> Cek Risiko Lokasimu</Link></HeroIn>
        </div>
      </section>

      {/* Pipeline */}
      <section className="bg-surface-container-lowest py-24">
        <div className="mx-auto max-w-[1200px] px-gutter">
          <Reveal><h2 className="mb-16 text-center font-headline-md text-headline-md">Alur Kerja</h2></Reveal>
          <div className="relative flex flex-col items-start justify-between md:flex-row md:items-center">
            <div className="absolute left-12 right-12 top-10 z-0 hidden h-0.5 bg-outline-variant md:block" />
            {pipeline.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.12} className="relative z-10 mb-12 w-full md:mb-0 md:w-1/4">
                <div className="flex flex-col items-center">
                  <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full border-2 border-primary-container bg-surface shadow-sm">
                    <FontAwesomeIcon icon={s.icon} className="h-6 w-6 text-primary-container" />
                  </div>
                  <h3 className="mb-2 text-center font-headline-sm text-headline-sm">{s.title}</h3>
                  <p className="px-4 text-center font-body-md text-body-md text-on-surface-variant">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Transparent formula + why weather */}
      <section className="mx-auto grid max-w-[1200px] grid-cols-1 gap-12 px-gutter py-24 lg:grid-cols-12">
        <Reveal className="lg:col-span-5">
          <div className="rounded-2xl border border-surface-variant bg-card-surface p-8 shadow-[0_4px_12px_rgba(13,27,42,0.05)]">
            <h2 className="mb-6 font-headline-md text-headline-md">Skor Risiko yang bisa dijelaskan</h2>
            <p className="mb-8 font-body-md text-body-md text-on-surface-variant">
              Setiap skor disusun transparan (bukan black-box) berdasarkan tiga pilar data utama.
            </p>
            <div className="space-y-6">
              {formula.map((f) => (
                <div key={f.label}>
                  <div className="mb-2 flex justify-between font-label-sm text-label-sm">
                    <span>{f.label}</span>
                    <span className={`font-bold ${f.val}`}>{f.pct}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container">
                    <div className={`h-full ${f.bar} ${f.w}`} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 flex items-center justify-center gap-2 border-t border-surface-variant pt-6 text-on-surface-variant opacity-80">
              <FontAwesomeIcon icon={faInfoCircle} className="h-3.5 w-3.5" />
              <span className="font-label-sm text-label-sm">Sumber data cuaca: BMKG</span>
            </div>
          </div>
        </Reveal>

        <div className="lg:col-span-7">
          <Reveal><h2 className="mb-8 font-headline-md text-headline-md">Mengapa Cuaca Penting?</h2></Reveal>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {weather.map((c, i) => (
              <Reveal key={c.title} delay={i * 0.1}>
                <div className={`flex h-full flex-col items-start rounded-2xl border-l-4 bg-card-surface p-6 shadow-[0_4px_12px_rgba(13,27,42,0.05)] ${c.accent}`}>
                  <FontAwesomeIcon icon={c.icon} className={`mb-4 h-6 w-6 ${c.color}`} />
                  <h4 className="mb-2 font-headline-sm text-headline-sm">{c.title}</h4>
                  <p className="font-body-md text-body-md text-on-surface-variant">{c.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Early detection reward */}
      <section className="border-y border-outline-variant bg-surface-bright py-24">
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-12 px-gutter md:grid-cols-2">
          <Reveal>
            <h2 className="mb-6 font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg">Deteksi dini dihargai lebih tinggi</h2>
            <p className="mb-6 font-body-lg text-body-lg text-on-surface-variant">
              Kami membalik insentif: pelaporan awal sebelum kondisi memburuk memberi poin lebih tinggi
              daripada laporan yang sudah darurat — mendorong deteksi dini.
            </p>
            <ul className="space-y-4 font-body-md text-body-md">
              <li className="flex items-center gap-3"><FontAwesomeIcon icon={faCheckCircle} className="h-4 w-4 shrink-0 text-risk-aman" /> Mencegah kerusakan eskalatif</li>
              <li className="flex items-center gap-3"><FontAwesomeIcon icon={faCheckCircle} className="h-4 w-4 shrink-0 text-risk-aman" /> Mengoptimalkan rute teknisi lapangan</li>
            </ul>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="relative overflow-hidden rounded-2xl bg-card-surface p-8 shadow-[0_4px_12px_rgba(13,27,42,0.05)]">
              <div className="flex h-48 items-end justify-between gap-4 border-b border-surface-variant pb-2">
                {[["Fase Awal", "Retak Kecil", "+50 Poin", "bg-primary-container", "h-32", "text-primary-container"],
                  ["Fase Lanjut", "Miring/Pecah", "+20 Poin", "bg-secondary-container", "h-16", "text-secondary-container"],
                  ["Fase Kritis", "Sudah Putus", "+5 Poin", "bg-tertiary-container", "h-6", "text-tertiary-container"]].map(([a, b, pts, bar, h, col]) => (
                  <div key={a} className="group flex w-1/3 flex-col items-center">
                    <span className={`mb-2 font-label-bold text-label-bold opacity-0 transition-opacity group-hover:opacity-100 ${col}`}>{pts}</span>
                    <div className={`w-full rounded-t-sm ${bar} ${h} transition-opacity hover:opacity-90`} />
                    <span className="mt-2 text-center font-label-sm text-label-sm text-on-surface-variant">{a}<br />({b})</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary-container py-24 text-on-primary-container">
        <div className="mx-auto max-w-3xl px-gutter text-center">
          <Reveal><h2 className="mb-6 font-headline-lg-mobile text-headline-lg-mobile text-on-primary md:font-headline-lg md:text-headline-lg">Siap melindungi wilayahmu?</h2></Reveal>
          <Reveal delay={0.1}><p className="mb-10 font-body-lg text-body-lg text-primary-fixed-dim">Mulai periksa indeks risiko lingkungan sekitarmu hari ini.</p></Reveal>
          <Reveal delay={0.2}>
            <Link href="/beranda" className="inline-flex items-center gap-2 rounded-full bg-card-surface px-8 py-4 font-label-bold text-label-bold text-primary-container transition-transform hover:-translate-y-0.5">
              <FontAwesomeIcon icon={faMap} className="h-4 w-4" /> Cek Risiko Lokasimu
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
