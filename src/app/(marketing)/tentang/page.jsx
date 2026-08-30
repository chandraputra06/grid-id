import { Reveal, HeroIn } from "@/components/motion";
import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBolt,
  faCloud,
  faExclamationTriangle,
  faMap,
  faQuoteLeft,
  faUser,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";

const stats = [["1.240+", "Zona Terpantau"], ["8.500+", "Laporan Diproses"], ["50.000+", "Warga Terlibat"]];
const sources = [
  { icon: faCloud, color: "text-primary", label: "Data Cuaca BMKG" },
  { icon: faBolt, color: "text-secondary-container", label: "Jaringan Utilitas (PLN)" },
  { icon: faUsers, color: "text-risk-aman", label: "Inisiatif CSR / ESG" },
];
const team = [
  { name: "Kadek Adika Ananda Aryana", role: "Pimpinan dan Kepala Bidang Keuangan", image: "/dedik.png" },
  { name: "Putu Disa Kalinda Dharmasaputra", role: "Kepala Pemasaran dan Komunikasi", image: "/disa.png" },
  { name: "I Putu Thio Mahapradana", role: "Pemimpin Riset & Validasi Ilmiah", image: "/thio.png" },
  { name: "I Gusti Putu Chandra Putra Artha Kusuma", role: "Kepala Bidang Teknologi", image: "/chandra.png" },
];

export default function Tentang() {
  return (
    <>
      {/* Mission hero */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-cover bg-center" style={{ backgroundImage: "linear-gradient(rgba(13,21,38,0.72),rgba(13,21,38,0.82)), url('/tentang-img.jpeg')" }} />
        <div className="mx-auto flex max-w-[820px] flex-col items-center px-margin-mobile py-24 text-center md:py-28">
          <HeroIn><span className="font-label-bold text-label-bold uppercase tracking-wider text-accent">Tentang GRID·ID</span></HeroIn>
          <HeroIn delay={0.08}><h1 className="mt-4 font-heading text-4xl font-extrabold leading-[1.08] tracking-tight text-white md:text-6xl">Jaringan listrik yang lebih <span className="text-accent">andal</span></h1></HeroIn>
          <HeroIn delay={0.16}><p className="mx-auto mt-6 max-w-xl font-body-lg text-body-lg text-white/85">GRID·ID menghubungkan laporan warga, data cuaca, dan tindakan preventif untuk membantu menjaga keandalan listrik di sekitar kita.</p></HeroIn>
          <HeroIn delay={0.24} className="mt-9"><Link href="/beranda" className="inline-flex items-center gap-2 rounded-full bg-accent px-8 py-4 font-heading font-bold text-white shadow-[0_8px_24px_rgba(245,166,35,0.45)] transition-transform hover:-translate-y-0.5"><FontAwesomeIcon icon={faMap} className="h-4 w-4" /> Cek Risiko Lokasimu</Link></HeroIn>
        </div>
      </section>

      {/* Problem & opportunity */}
      <section className="bg-surface-container-lowest py-section-gap">
        <div className="mx-auto max-w-[1280px] px-margin-mobile md:px-gutter">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Reveal>
              <div className="flex h-full flex-col gap-4 rounded-2xl border border-outline-variant/30 bg-card-surface p-8 shadow-[0_4px_12px_rgba(13,27,42,0.05)]">
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-error-container text-on-error-container">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="h-5 w-5" />
                </div>
                <h3 className="font-headline-md text-headline-md">Pelaporan Reaktif</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Secara tradisional, masalah ditangani setelah pemadaman terjadi — menyebabkan gangguan
                  lama dan biaya perbaikan tinggi, menurunkan keandalan utilitas.
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="relative flex h-full flex-col gap-4 overflow-hidden rounded-2xl border-l-4 border-primary-container bg-card-surface p-8 shadow-[0_4px_12px_rgba(13,27,42,0.05)]">
                <div className="z-10 mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary-container text-on-primary">
                  <FontAwesomeIcon icon={faBolt} className="h-5 w-5" />
                </div>
                <h3 className="z-10 font-headline-md text-headline-md">Pemeliharaan Prediktif</h3>
                <p className="z-10 font-body-md text-body-md text-on-surface-variant">
                  GRID·ID memberdayakan warga dan utilitas dengan wawasan berbasis data untuk mengidentifikasi
                  area berisiko tinggi sebelum krisis terjadi.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Positioning quote */}
      <section className="bg-primary py-20 text-on-primary md:py-32">
        <Reveal className="mx-auto flex max-w-[800px] flex-col items-center gap-6 px-margin-mobile text-center md:px-gutter">
          <FontAwesomeIcon icon={faQuoteLeft} className="h-8 w-8 text-primary-fixed-dim" />
          <h2 className="font-headline-lg-mobile text-headline-lg-mobile leading-tight md:font-headline-lg md:text-headline-lg">
            &ldquo;Kami bukan aplikasi pelapor baru — kami lapisan kecerdasan yang menjembatani warga dan penyedia layanan.&rdquo;
          </h2>
        </Reveal>
      </section>

      {/* Data sources */}
      <section className="mx-auto max-w-[1280px] px-margin-mobile py-section-gap md:px-gutter">
        <Reveal className="mb-10 text-center">
          <h3 className="mb-2 font-headline-sm text-headline-sm">Didukung oleh Data Terpercaya</h3>
          <p className="font-body-md text-body-md text-on-surface-variant">Mengintegrasikan data dari lembaga berwenang untuk akurasi tertinggi.</p>
        </Reveal>
        <div className="flex flex-wrap justify-center gap-6">
          {sources.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.1}>
              <div className="flex min-w-[200px] flex-col items-center gap-3 rounded-2xl border border-outline-variant/20 bg-card-surface px-8 py-6 shadow-[0_4px_12px_rgba(13,27,42,0.05)]">
                <FontAwesomeIcon icon={s.icon} className={`h-7 w-7 ${s.color}`} />
                <span className="font-label-bold text-label-bold">{s.label}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Impact stats */}
      <section className="bg-surface-container-low py-section-gap">
        <div className="mx-auto max-w-[1280px] px-margin-mobile md:px-gutter">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {stats.map(([n, l], i) => (
              <Reveal key={l} delay={i * 0.1}>
                <div className="rounded-2xl bg-card-surface p-8 text-center shadow-[0_4px_12px_rgba(13,27,42,0.05)]">
                  <div className="mb-2 font-headline-lg text-headline-lg text-primary">{n}</div>
                  <div className="font-label-bold text-label-bold text-on-surface-variant">{l}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="mx-auto max-w-[1280px] px-margin-mobile py-section-gap md:px-gutter md:py-24">
        <Reveal className="mb-12 text-center">
          <h3 className="mb-2 font-headline-md text-headline-md">Tim Penggerak</h3>
          <p className="font-body-md text-body-md text-on-surface-variant">Para profesional di balik teknologi GRID·ID.</p>
        </Reveal>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {team.map((member, i) => (
            <Reveal key={member.name} delay={i * 0.08}>
              <div className="flex flex-col items-center gap-4">
                <div className="relative h-32 w-32 overflow-hidden rounded-full bg-surface-container-highest shadow-sm">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="text-center">
                  <h4 className="font-label-bold text-label-bold">{member.name}</h4>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">{member.role}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto mb-24 max-w-[1000px] px-margin-mobile md:px-gutter">
        <Reveal>
          <div className="relative flex flex-col items-center justify-between gap-8 overflow-hidden rounded-2xl bg-primary-container p-10 text-on-primary-container shadow-[0_8px_24px_rgba(30,79,216,0.2)] md:flex-row md:p-16">
            <div className="z-10 flex max-w-lg flex-col gap-4">
              <h2 className="font-headline-md text-headline-md text-on-primary">Bergabung menjaga jaringan di wilayahmu</h2>
              <p className="font-body-md text-body-md text-on-primary/80">Laporan dan partisipasimu membantu mencegah krisis sebelum terjadi.</p>
            </div>
            <a href="/masuk" className="z-10 min-w-[200px] rounded-full bg-on-primary px-8 py-4 text-center font-label-bold text-label-bold text-primary shadow-sm transition-transform hover:-translate-y-0.5">Mulai Sekarang</a>
          </div>
        </Reveal>
      </section>
    </>
  );
}
