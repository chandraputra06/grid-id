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
  {/* Background image */}
  <div
    className="absolute inset-0 -z-20 bg-cover bg-center"
    style={{ backgroundImage: "url('/tentang2-img.png')" }}
  />
  {/* Cover gradasi biru #00278d -> kuning-oranye #fcc57d, opacity 60% */}
  <div className="absolute inset-0 -z-10 bg-linear-to-r from-[#00247e] to-[#ffb554] opacity-80" />

  {/* Padding atas/bawah dipindah ke kolom teks supaya maskot bisa nempel ke bawah section */}
  <div className="mx-auto grid max-w-300 grid-cols-1 items-stretch gap-0 px-margin-mobile md:grid-cols-2 md:gap-4 md:px-12 lg:px-16">
    {/* KIRI: teks rata kiri */}
    <div className="flex flex-col items-start justify-center py-16 text-left md:py-20">
      <HeroIn>
        <h1 className="font-heading text-3xl font-extrabold leading-[1.1] tracking-tight text-white drop-shadow-[0_4px_12px_#00000059] sm:text-4xl md:text-5xl lg:text-[3.5rem]">
          <span className="block whitespace-nowrap">Mengubah Data</span>
          <span className="block whitespace-nowrap bg-linear-to-r from-[#FFB800] via-[#FFD34D] to-[#FFE9A8] bg-clip-text text-transparent drop-shadow-[0_0_14px_#FFC828BF]">
            Menjadi Keandalan
          </span>
        </h1>
      </HeroIn>

      <HeroIn delay={0.08}>
        <p className="mt-6 max-w-md font-body-lg text-body-lg leading-relaxed text-white/90 drop-shadow-[0_2px_6px_#00000066]">
          Dari laporan warga hingga rekomendasi tindakan, pahami bagaimana
          GRID·ID membantu menjaga jaringan listrik di sekitarmu.
        </p>
      </HeroIn>

            <HeroIn delay={0.16} className="mt-8 w-full sm:w-auto">
        <Link
          href="/beranda"
          className="group inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-full border border-white bg-linear-to-r from-[#ffbf00] to-[#007dff] px-6 py-3.5 font-heading text-base font-bold text-white shadow-[0_8px_20px_#0000004D] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_0_20px_#FFF4A3F2,0_0_45px_#FFF08CD9,0_0_80px_#FFEB7899] sm:w-auto sm:px-8 sm:py-4 sm:text-lg sm:hover:scale-105"
        >
          <FontAwesomeIcon icon={faMap} className="h-4 w-4 drop-shadow-[0_2px_3px_#00000080]" />
          <span className="[text-shadow:0_2px_4px_#00000073]">
            Cek Risiko Lokasimu
          </span>
        </Link>
      </HeroIn>
    </div>

    {/* KANAN: maskot nempel bawah section, tinggi mengikuti blok teks di desktop */}
    <div className="relative flex items-end justify-center md:justify-end">
      <HeroIn delay={0.2} className="relative flex h-full w-full items-end justify-center md:justify-end">
        <img
          src="/tentang-maskot1.png"
          alt="Maskot GRID·ID dan warga mengecek risiko listrik"
          className="block h-auto w-full max-w-95 object-contain object-bottom drop-shadow-[0_12px_28px_#00000059] md:absolute md:bottom-0 md:right-0 md:h-[92%] md:max-w-full md:object-bottom-right"
        />
      </HeroIn>
    </div>
  </div>
</section>

      {/* Problem & opportunity */}
      <section className="bg-surface-container-lowest py-12 md:py-16">
        <style>{`
          @keyframes gridid-twinkle {
            0%, 100% { transform: scale(0.4) rotate(0deg); opacity: 0; }
            50% { transform: scale(1) rotate(45deg); opacity: 1; }
          }
          @keyframes gridid-ring {
            0% { transform: scale(1); opacity: 0.7; }
            100% { transform: scale(1.06); opacity: 0; }
          }
          @keyframes gridid-shimmer {
            0% { transform: translateX(-120%) skewX(-20deg); }
            100% { transform: translateX(260%) skewX(-20deg); }
          }
          @keyframes gridid-shake {
            0%, 100% { transform: rotate(0deg); }
            25% { transform: rotate(-4deg); }
            75% { transform: rotate(4deg); }
          }
          @keyframes gridid-wiggle {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            25% { transform: translateY(-4px) rotate(-5deg); }
            50% { transform: translateY(0) rotate(0deg); }
            75% { transform: translateY(-4px) rotate(5deg); }
          }
          @media (prefers-reduced-motion: reduce) {
            .gridid-anim { animation: none !important; }
          }
        `}</style>

        <div className="mx-auto max-w-7xl px-margin-mobile md:px-gutter">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
            {/* ===== KIRI: MENUNGGU GANGGUAN  <->  PELAPORAN REAKTIF ===== */}
            <Reveal>
              <div className="group relative h-full transition-transform duration-300 ease-out hover:-translate-y-3 focus-within:-translate-y-3">
                <div
                  tabIndex={0}
                  className="relative grid h-full cursor-pointer rounded-2xl outline-none focus-visible:ring-4 focus-visible:ring-red-300 md:min-h-57.5"
                >
                  {/* Kotak putih outline merah */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 rounded-2xl border-2 border-red-500 bg-card-surface shadow-[0_12px_28px_-10px_#DC262659,0_4px_10px_#0D1B2A14] transition-opacity duration-300 group-hover:opacity-0 group-focus-within:opacity-0"
                  />
                  {/* Kotak gradasi merah */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 overflow-hidden rounded-2xl border-2 border-white bg-linear-to-br from-[#5f0f0f] via-[#b91c1c] to-[#f87171] opacity-0 shadow-[0_18px_36px_#7F1D1D59] transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100"
                  >
                    <span className="absolute inset-2 rounded-xl border border-white/70" />
                  </span>

                  {/* Maskot menunggu: di atas teks (mobile), di kanan box (md+) */}
                  <div className="pointer-events-none relative z-20 col-start-1 row-start-1 flex h-40 origin-center items-center justify-center pt-6 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-50 group-hover:opacity-0 group-focus-within:scale-50 group-focus-within:opacity-0 sm:h-44 md:absolute md:inset-y-5 md:right-5 md:h-auto md:w-[34%] md:pt-0">
                    <img
                      src="/maskot-menunggu.png"
                      alt="Maskot GRID·ID bingung menunggu gangguan"
                      draggable={false}
                      className="h-full w-auto max-w-full select-none object-contain drop-shadow-[0_8px_14px_#0000004D] md:h-auto md:max-h-full"
                    />
                  </div>

                  {/* Maskot reaktif (pop up saat hover/klik) */}
                  <div className="pointer-events-none relative z-20 col-start-1 row-start-1 flex h-40 origin-center scale-50 items-center justify-center pt-6 opacity-0 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-100 group-hover:opacity-100 group-hover:delay-100 group-focus-within:scale-100 group-focus-within:opacity-100 group-focus-within:delay-100 sm:h-44 md:absolute md:inset-y-5 md:right-5 md:h-auto md:w-[34%] md:pt-0">
                    <img
                      src="/maskot-reaktif.png"
                      alt="Maskot GRID·ID kaget karena gangguan listrik"
                      draggable={false}
                      className="gridid-anim h-full w-auto max-w-full select-none object-contain drop-shadow-[0_8px_14px_#00000059] group-hover:animate-[gridid-shake_0.5s_ease-in-out_0.6s_infinite] group-focus-within:animate-[gridid-shake_0.5s_ease-in-out_0.6s_infinite] md:h-auto md:max-h-full"
                    />
                  </div>

                  {/* Teks: Menunggu Gangguan */}
                  <div className="relative z-10 col-start-1 row-start-2 flex items-start px-6 pb-6 pt-1 text-center transition-opacity duration-300 group-hover:opacity-0 group-focus-within:opacity-0 md:row-start-1 md:items-center md:py-8 md:pl-8 md:pr-[42%] md:text-left">
                    <div className="flex w-full flex-col items-center gap-2 md:items-start">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-error-container text-on-error-container">
                        <FontAwesomeIcon icon={faExclamationTriangle} className="h-4 w-4" />
                      </div>
                      <h3 className="font-headline-md text-headline-md leading-tight text-red-700 md:whitespace-nowrap">
                        Menunggu Gangguan
                      </h3>
                      <p className="mx-auto max-w-75 font-body-md text-[13px] leading-5 text-red-600 sm:text-sm sm:leading-5 md:mx-0 md:min-h-20">
                        Gangguan terjadi, laporan masuk, lalu penanganan dimulai. Tanda-tanda risiko pada
                        aset bisa saja terlewat sebelum menjadi masalah.
                      </p>
                    </div>
                  </div>

                  {/* Teks: Pelaporan Reaktif */}
                  <div className="relative z-10 col-start-1 row-start-2 flex items-start px-6 pb-6 pt-1 text-center opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100 md:row-start-1 md:items-center md:py-8 md:pl-8 md:pr-[42%] md:text-left">
                    <div className="flex w-full flex-col items-center gap-2 md:items-start">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 text-white">
                        <FontAwesomeIcon icon={faExclamationTriangle} className="h-4 w-4" />
                      </div>
                      <h3 className="font-headline-md text-headline-md leading-tight text-white md:whitespace-nowrap">
                        Pelaporan Reaktif
                      </h3>
                      <p className="mx-auto max-w-65 font-body-md text-[13px] leading-5 text-white sm:text-sm sm:leading-5 md:mx-0 md:min-h-20">
                        Akibatnya, gangguan listrik jadi lebih lama dan biaya perbaikan tinggi, menurunkan
                        keandalan utilitas.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* ===== KANAN: PEMELIHARAAN PREDIKTIF  <->  JAGA LISTRIK ANDAL ===== */}
            <Reveal delay={0.1}>
              <div className="group relative h-full transition-transform duration-300 ease-out hover:-translate-y-3 focus-within:-translate-y-3">
                {/* Bintang berkelap-kelip di sekitar kartu */}
                {[
                  { top: "-14px", left: "12%", s: 16, d: "0s" },
                  { top: "18%", left: "-18px", s: 20, d: "0.3s" },
                  { top: "65%", left: "-14px", s: 14, d: "0.7s" },
                  { top: "-12px", left: "58%", s: 14, d: "0.5s" },
                  { top: "12%", right: "-18px", s: 18, d: "0.2s" },
                  { top: "72%", right: "-16px", s: 22, d: "0.9s" },
                  { bottom: "-16px", left: "30%", s: 16, d: "0.6s" },
                  { bottom: "-14px", right: "22%", s: 14, d: "0.1s" },
                ].map((p, i) => (
                  <span
                    key={i}
                    aria-hidden="true"
                    className="gridid-anim pointer-events-none absolute z-30 leading-none text-yellow-300 opacity-0 drop-shadow-[0_0_6px_#FACC15E6] group-hover:animate-[gridid-twinkle_1.6s_ease-in-out_infinite] group-focus-within:animate-[gridid-twinkle_1.6s_ease-in-out_infinite]"
                    style={{
                      top: p.top,
                      bottom: p.bottom,
                      left: p.left,
                      right: p.right,
                      fontSize: p.s,
                      animationDelay: p.d,
                    }}
                  >
                    ✦
                  </span>
                ))}

                {/* Cincin kuning berdenyut */}
                <span
                  aria-hidden="true"
                  className="gridid-anim pointer-events-none absolute inset-0 z-0 rounded-2xl border-2 border-yellow-300 opacity-0 group-hover:animate-[gridid-ring_1.4s_ease-out_infinite] group-focus-within:animate-[gridid-ring_1.4s_ease-out_infinite]"
                />

                <div
                  tabIndex={0}
                  className="relative grid h-full cursor-pointer rounded-2xl outline-none focus-visible:ring-4 focus-visible:ring-yellow-300 md:min-h-57.5"
                >
                  {/* Kotak putih outline biru */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 rounded-2xl border-2 border-l-4 border-blue-600 bg-card-surface shadow-[0_12px_28px_-10px_#2563EB59,0_4px_10px_#0D1B2A14] transition-opacity duration-300 group-hover:opacity-0 group-focus-within:opacity-0"
                  />
                  {/* Kotak gradasi biru + glow kuning + kilau */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 overflow-hidden rounded-2xl border-2 border-yellow-300 bg-linear-to-br from-[#0a1f5c] via-[#1d4ed8] to-[#60a5fa] opacity-0 shadow-[0_0_0_2px_#FDE047E6,0_0_44px_10px_#FACC158C,0_24px_40px_#0D1B2A66] transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100"
                  >
                    <span className="gridid-anim pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-linear-to-r from-transparent via-white/30 to-transparent group-hover:animate-[gridid-shimmer_1.8s_ease-in-out_infinite] group-focus-within:animate-[gridid-shimmer_1.8s_ease-in-out_infinite]" />
                  </span>

                  {/* Maskot prediktif: di atas teks (mobile), di kanan box (md+) */}
                  <div className="pointer-events-none relative z-20 col-start-1 row-start-1 flex h-40 origin-center items-center justify-center pt-6 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-50 group-hover:opacity-0 group-focus-within:scale-50 group-focus-within:opacity-0 sm:h-44 md:absolute md:inset-y-5 md:right-5 md:h-auto md:w-[34%] md:pt-0">
                    <img
                      src="/maskot-prediktif.png"
                      alt="Maskot GRID·ID memeriksa dengan kaca pembesar"
                      draggable={false}
                      className="h-full w-auto max-w-full select-none object-contain drop-shadow-[0_8px_14px_#0000004D] md:h-auto md:max-h-full"
                    />
                  </div>

                  {/* Maskot jaga (pop up saat hover/klik) */}
                  <div className="pointer-events-none relative z-20 col-start-1 row-start-1 flex h-40 origin-center scale-50 items-center justify-center pt-6 opacity-0 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-100 group-hover:opacity-100 group-hover:delay-100 group-focus-within:scale-100 group-focus-within:opacity-100 group-focus-within:delay-100 sm:h-44 md:absolute md:inset-y-5 md:right-5 md:h-auto md:w-[34%] md:pt-0">
                    <img
                      src="/maskot-jaga.png"
                      alt="Maskot GRID·ID memegang hati hijau"
                      draggable={false}
                      className="gridid-anim h-full w-auto max-w-full select-none object-contain drop-shadow-[0_8px_14px_#00000059] group-hover:animate-[gridid-wiggle_1s_ease-in-out_0.6s_infinite] group-focus-within:animate-[gridid-wiggle_1s_ease-in-out_0.6s_infinite] md:h-auto md:max-h-full"
                    />
                  </div>

                  {/* Teks: Pemeliharaan Prediktif */}
                  <div className="relative z-10 col-start-1 row-start-2 flex items-start px-6 pb-6 pt-1 text-center transition-opacity duration-300 group-hover:opacity-0 group-focus-within:opacity-0 md:row-start-1 md:items-center md:py-8 md:pl-8 md:pr-[42%] md:text-left">
                    <div className="flex w-full flex-col items-center gap-2 md:items-start">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-container text-on-primary">
                        <FontAwesomeIcon icon={faBolt} className="h-4 w-4" />
                      </div>
                      <h3 className="font-headline-md text-headline-md leading-tight text-blue-900 md:whitespace-nowrap">
                        Pemeliharaan Prediktif
                      </h3>
                      <p className="mx-auto max-w-57.5 font-body-md text-[13px] leading-5 text-blue-800 sm:text-sm sm:leading-5 md:mx-0 md:min-h-20">
                        Melalui foto, data cuaca, informasi aset, GRID.ID menggunakan AI untuk membantu
                        mengenali indikasi kerusakan dan menentukan aset yang perlu diprioritaskan
                      </p>
                    </div>
                  </div>

                  {/* Teks: Jaga Listrik Andal */}
                  <div className="relative z-10 col-start-1 row-start-2 flex items-start px-6 pb-6 pt-1 text-center opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100 md:row-start-1 md:items-center md:py-8 md:pl-8 md:pr-[42%] md:text-left">
                    <div className="flex w-full flex-col items-center gap-2 md:items-start">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-yellow-300 text-blue-950 shadow-[0_0_20px_#FACC15E6]">
                        <FontAwesomeIcon icon={faBolt} className="h-4 w-4" />
                      </div>
                      <h3 className="font-headline-md text-headline-md leading-tight text-yellow-300 [text-shadow:0_0_14px_#FACC1599] md:whitespace-nowrap">
                        Jaga Listrik Andal
                      </h3>
                      <p className="mx-auto max-w-57.5 font-body-md text-[13px] leading-5 text-yellow-300 sm:text-sm sm:leading-5 md:mx-0 md:min-h-20">
                        Lihat kabel menjuntai atau tiang miring? Scan, laporkan, nikmati listrik yang lebih
                        andal!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
      {/* Positioning quote */}
    <section className="gridid-quote-section relative isolate overflow-hidden bg-primary pt-10 text-on-primary md:pt-14">
  <style>{`
    /* Penanda "section sudah terlihat" (0 -> 1), diisi oleh scroll */
    @property --gridid-in {
      syntax: "<number>";
      inherits: true;
      initial-value: 0;
    }

    .gridid-quote-section { view-timeline-name: --gridid-quote; }

    /* Highlight: teks di depan, batang gradasi di belakang */
    .gridid-highlight {
      position: relative;
      isolation: isolate;
      display: inline-block;
      max-width: 100%;
      padding: 0.04em 0.4em;
      text-shadow: 0 0 8px #ffffff8c, 0 0 2px #ffffff59;
    }
    .gridid-highlight::before {
      content: "";
      position: absolute;
      inset: 0;
      z-index: -1;
      background-image: linear-gradient(to right, #e1a900b3, #007dffb3);
      box-shadow: 0 0 12px #ffffff40;
      /* Kondisi akhir (default / browser yang belum mendukung): tampil penuh */
      clip-path: inset(-14px -14px -14px -14px);
    }

    @keyframes gridid-flag {
      from { --gridid-in: 0; }
      to   { --gridid-in: 1; }
    }
    /* Highlight terbuka dari kiri ke kanan, gradasi tidak ikut melar */
    @keyframes gridid-reveal {
      from { clip-path: inset(-14px 100% -14px -14px); }
      to   { clip-path: inset(-14px -14px -14px -14px); }
    }
    @keyframes gridid-fade-in {
      from { opacity: 0; transform: translateY(18px) scale(0.97); }
      to   { opacity: 1; transform: none; }
    }
    @keyframes gridid-glow-in {
      from { opacity: 0; }
      to   { opacity: 1; }
    }

    @supports (animation-timeline: view()) {
      @media (prefers-reduced-motion: no-preference) {
        /* Scroll hanya memicu penanda; saat section ~45% terlihat, penanda jadi 1 */
        .gridid-flag {
          animation: gridid-flag linear both;
          animation-timeline: --gridid-quote;
          animation-range: entry 40% entry 45%;
        }

        /* Sebelum terpicu: highlight tersembunyi */
        .gridid-highlight::before {
          clip-path: inset(-14px 100% -14px -14px);
        }

        /* Setelah terpicu: animasi berbasis waktu (halus & pelan) */
        @container style(--gridid-in: 1) {
          .gridid-highlight::before {
            animation: gridid-reveal 1.6s cubic-bezier(0.4, 0, 0.2, 1) 0.2s both;
          }
          .gridid-highlight--2::before {
            animation-delay: 1.4s;
          }
        }

        .gridid-fade {
          animation: gridid-fade-in linear both;
          animation-timeline: --gridid-quote;
          animation-range: entry 0% entry 70%;
        }
        .gridid-glow {
          animation: gridid-glow-in linear both;
          animation-timeline: --gridid-quote;
          animation-range: entry 10% entry 90%;
        }
      }
    }
  `}</style>

  {/* Background image */}
  <div
    className="absolute inset-0 -z-20 bg-cover bg-center"
    style={{ backgroundImage: "url('/bg-quotes.png')" }}
  />
  {/* Cover gradasi biru gelap -> biru, opacity 80% */}
  <div className="absolute inset-0 -z-10 bg-linear-to-r from-[#000a3f] to-[#0329af] opacity-80" />

  <div className="gridid-flag mx-auto grid max-w-300 grid-cols-1 items-stretch gap-0 px-margin-mobile md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:gap-4 md:px-gutter">
    {/* KIRI: tanda petik di kiri, teks 4 baris rata kiri, GRID.ID di bawah */}
    <Reveal className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-3 pb-6 text-left md:gap-x-6 md:gap-y-4 md:pb-10">
      <FontAwesomeIcon
        icon={faQuoteLeft}
        className="h-7 w-7 self-center text-primary-fixed-dim drop-shadow-[0_2px_6px_#00000059] md:h-10 md:w-10"
      />

      <h2 className="font-heading text-[1.35rem] font-extrabold leading-[1.35] text-white drop-shadow-[0_3px_8px_#00000059] sm:text-2xl md:text-[1.75rem] lg:text-[2rem]">
        <span className="block md:whitespace-nowrap">
          Kami{" "}
          <span className="bg-linear-to-r from-[#ff2d2d] to-[#ff7a7a] bg-clip-text text-transparent drop-shadow-[0_0_10px_#ff3b3b99]">
            bukan
          </span>{" "}
          aplikasi pelapor baru
        </span>
        <span className="block md:whitespace-nowrap">
          kami{" "}
          <span className="bg-linear-to-r from-[#ff8a00] to-[#ffd000] bg-clip-text text-transparent drop-shadow-[0_0_12px_#ffb800b3]">
            lapisan kecerdasan
          </span>{" "}
          yang
        </span>
        <span className="mt-1 block md:whitespace-nowrap">
          <span className="gridid-highlight">menjembatani warga dan</span>
        </span>
        <span className="mt-1 block md:whitespace-nowrap">
          <span className="gridid-highlight gridid-highlight--2">penyedia layanan.</span>
        </span>
      </h2>

      {/* Atribusi: garis + GRID.ID */}
      <div className="col-start-2 flex items-center gap-3">
        <span className="h-0.5 w-8 rounded-full bg-[#fff1a8] shadow-[0_0_8px_#ffe36699]" />
        <span className="text-sm font-bold tracking-wide text-[#fff1a8] [text-shadow:0_0_8px_#ffe36680]">
          GRID.ID
        </span>
      </div>
    </Reveal>

    {/* KANAN: maskot lebih besar, menempel di bawah section */}
    <div className="relative min-h-72 md:min-h-0">
      {/* Glow kuning di belakang maskot */}
      <div className="gridid-glow pointer-events-none absolute inset-x-0 bottom-[4%] mx-auto h-[90%] w-[88%] rounded-full bg-[radial-gradient(circle,#ffd54a8c_0%,#ffd54a00_70%)] blur-xl" />
      <img
        src="/maskot-quote.png"
        alt="Maskot GRID·ID bersama warga dan petugas listrik"
        draggable={false}
        className="gridid-fade absolute bottom-0 right-0 h-full w-full max-w-none select-none object-contain object-bottom drop-shadow-[0_10px_18px_#00000047] md:h-[134%]"
      />
    </div>
  </div>
</section>

      {/* Data sources */}
      <section className="relative isolate overflow-hidden py-12 md:py-16">
  {/* Background image (ganti nama file sesuai gambar barumu) */}
  <div
    className="absolute inset-0 -z-20 bg-cover bg-center"
    style={{ backgroundImage: "url('/bg-sources.png')" }}
  />
  {/* Cover gradasi putih -> soft yellow, atas ke bawah */}
  <div className="absolute inset-0 -z-10 bg-linear-to-b from-[#ffffff] to-[#fff6cc] opacity-80" />

  <div className="mx-auto max-w-7xl px-margin-mobile md:px-gutter">
    <Reveal className="mb-8 text-center">
      <h3 className="mb-2 font-headline-sm text-headline-sm text-[#00247e]">
        Didukung oleh Data Terpercaya
      </h3>
      <p className="font-body-md text-body-md text-[#0329af]">
        Mengintegrasikan data dari lembaga berwenang untuk akurasi tertinggi.
      </p>
    </Reveal>

    <div className="flex flex-wrap justify-center gap-4 md:gap-6">
      {sources.map((s, i) => {
        // Pilih tema warna berdasarkan label; kalau tidak cocok, pakai urutan (biru, kuning, hijau)
        const key = /bmkg|cuaca/i.test(s.label)
          ? "blue"
          : /pln|utilitas/i.test(s.label)
          ? "yellow"
          : /csr|esg|inisiatif/i.test(s.label)
          ? "green"
          : ["blue", "yellow", "green"][i % 3];

        const theme = {
          blue: {
            bg: "from-[#0a1f5c] to-[#4da3ff]",
            icon: "text-[#a8d4ff] drop-shadow-[0_0_8px_#4da3ffe6]",
            haloOuter: "bg-[#4da3ff99]",
            haloInner: "bg-[#a8d4ffcc]",
            shadow: "shadow-[0_8px_20px_#0a1f5c40]",
          },
          yellow: {
            bg: "from-[#e66a00] to-[#ffd000]",
            icon: "text-[#fff6a8] drop-shadow-[0_0_8px_#ffd000e6]",
            haloOuter: "bg-[#ffd00099]",
            haloInner: "bg-[#fff6a8cc]",
            shadow: "shadow-[0_8px_20px_#e66a0040]",
          },
          green: {
            bg: "from-[#0b5d2a] to-[#6ee7a0]",
            icon: "text-[#c4ffd9] drop-shadow-[0_0_8px_#4ade80e6]",
            haloOuter: "bg-[#4ade8099]",
            haloInner: "bg-[#c4ffd9cc]",
            shadow: "shadow-[0_8px_20px_#0b5d2a40]",
          },
        }[key];

        return (
          <Reveal key={s.label} delay={i * 0.1}>
            <div
              className={`relative isolate flex min-w-50 flex-col items-center gap-3 overflow-hidden rounded-2xl border border-white/40 px-6 py-5 md:px-8 md:py-6 ${theme.shadow}`}
            >
              {/* Gradasi box, opacity 80% (teks & icon tetap solid) */}
              <span
                aria-hidden="true"
                className={`absolute inset-0 -z-10 bg-linear-to-r ${theme.bg} opacity-80`}
              />

              {/* Icon + glow di belakangnya */}
              <div className="relative flex h-14 w-14 items-center justify-center">
                {/* Halo luar (lebar & lembut) */}
                <span
                  aria-hidden="true"
                  className={`absolute -inset-3 rounded-full blur-xl ${theme.haloOuter}`}
                />
                {/* Halo dalam (lebih terang, dekat icon) */}
                <span
                  aria-hidden="true"
                  className={`absolute inset-1 rounded-full blur-3xl ${theme.haloInner}`}
                />
                <FontAwesomeIcon
                  icon={s.icon}
                  className={`relative z-10 h-10 w-10 ${theme.icon}`}
                />
              </div>

              <span className="font-label-bold text-label-bold text-white drop-shadow-[0_2px_4px_#00000080]">
                {s.label}
              </span>
            </div>
          </Reveal>
        );
      })}
    </div>
  </div>
</section>

      {/* Impact stats */}
<section className="bg-linear-to-b from-[#fff9da] to-[#ffffff] py-10 md:py-14">
  <div className="mx-auto max-w-7xl px-margin-mobile md:px-gutter">
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
      {stats.map(([n, l], i) => (
        <Reveal key={l} delay={i * 0.1}>
          {/* Outline 1px gradasi biru -> kuning (lewat wrapper p-px) + shadow rapat */}
          <div className="rounded-2xl bg-linear-to-r from-[#1a6bff] to-[#ffc21a] p-px shadow-[0_8px_16px_-6px_#0d1b2a66,0_2px_5px_#0d1b2a40]">
            <div className="rounded-[15px] bg-card-surface p-6 text-center md:p-8">
              <div className="mb-2 bg-linear-to-r from-[#00247e] to-[#00c2d9] bg-clip-text font-headline-lg text-headline-lg text-transparent">
                {n}
              </div>
              <div className="font-label-bold text-label-bold text-[#0329af]">{l}</div>
            </div>
          </div>
        </Reveal>
      ))}
    </div>
  </div>
</section>

      {/* Team */}
   <section className="relative isolate overflow-hidden bg-[#ffffff] py-12 md:py-16">
  {/* Background image, opacity 20% (ganti nama file sesuai gambarmu) */}
  <div
    className="absolute inset-0 -z-10 bg-cover bg-center opacity-20"
    style={{ backgroundImage: "url('/bg-team.png')" }}
  />

  <div className="mx-auto max-w-7xl px-margin-mobile md:px-gutter">
    <Reveal className="mb-8 text-center md:mb-10">
      {/* Heading + logo, satu baris, rata tengah */}
      <h3 className="mb-0 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 font-headline-md text-headline-md leading-tight">
        <span className="bg-linear-to-r from-[#00247e] to-[#4ea7ff] bg-clip-text text-transparent">
          Meet The People Behind
        </span>
        <img
          src="/grid-logo-text.png"
          alt="GRID.ID"
          draggable={false}
          className="h-[4em] w-auto select-none object-contain"
        />
      </h3>

      {/* Deskripsi 2 baris di desktop (di HP otomatis membungkus) */}
      <p className="mx-auto font-body-md text-body-md text-on-surface-variant">
        <span className="block md:whitespace-nowrap">
          Di balik inovasi GRID.ID, ada tim yang menggabungkan teknologi, kreativitas, dan
          kolaborasi
        </span>
        <span className="block md:whitespace-nowrap">
          untuk menghadirkan solusi pemeliharaan jaringan listrik yang lebih cerdas, prediktif, dan
          andal.
        </span>
      </p>
    </Reveal>

    <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4 md:gap-x-6 md:gap-y-10">
      {team.map((member, i) => {
        // Gradasi kalem & saling nyambung kiri -> kanan:
        // biru -> biru toska -> amber -> oranye -> dark orange
        const themes = [
          "from-[#2563eb] to-[#1fa3d1]",
          "from-[#1fa3d1] to-[#f2b705]",
          "from-[#f2b705] to-[#f97316]",
          "from-[#f97316] to-[#c2410c]",
        ];
        const grad = themes[i % themes.length];

        return (
          <Reveal key={member.name} delay={i * 0.08}>
            <div className="flex flex-col items-center gap-4">
              {/* Foto: glow halus + outline 1px + shadow */}
              <div className="relative mx-auto h-32 w-32">
                {/* Glow halus di belakang, warnanya mengikuti outline */}
                <span
                  aria-hidden="true"
                  className={`absolute -inset-1.5 rounded-full bg-linear-to-r ${grad} opacity-40 blur-xl`}
                />
                {/* Outline gradasi 1px + shadow lingkaran */}
                <div
                  className={`relative h-full w-full rounded-full bg-linear-to-r ${grad} p-px shadow-[0_10px_20px_-6px_#0d1b2a73,0_3px_6px_#0d1b2a33]`}
                >
                  <div className="relative h-full w-full overflow-hidden rounded-full bg-surface-container-highest">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      sizes="128px"
                      className="object-cover"
                      // Foto selalu di tengah lingkaran
                      style={{ objectPosition: "center" }}
                    />
                  </div>
                </div>
              </div>

              {/* Nama + jabatan */}
              <div className="flex flex-col items-center gap-2 text-center">
                <h4 className="font-label-bold text-label-bold text-[#00247e]">{member.name}</h4>
                <p
                  className={`rounded-full bg-linear-to-r ${grad} px-4 py-1 font-label-sm text-label-sm font-bold text-white shadow-[0_4px_8px_-2px_#0d1b2a59] [text-shadow:0_1px_3px_#00000080]`}
                >
                  {member.role}
                </p>
              </div>
            </div>
          </Reveal>
        );
      })}
    </div>
  </div>
</section>

      {/* CTA */}
     <section className="gridid-cta-section relative isolate mb-0 overflow-hidden bg-primary pt-10 text-left md:pt-12">
  <style>{`
    .gridid-cta-section { view-timeline-name: --gridid-cta; }

    @keyframes gridid-cta-pop {
      from { opacity: 0; transform: translateX(90px) translateY(10px) scale(0.85) rotate(4deg); }
      to   { opacity: 1; transform: none; }
    }
    @keyframes gridid-cta-glow {
      from { opacity: 0; }
      to   { opacity: 1; }
    }

    /* Maskot muncul dari kanan ke kiri saat section masuk layar.
       Browser yang belum mendukung: langsung tampil tanpa animasi. */
    @supports (animation-timeline: view()) {
      @media (prefers-reduced-motion: no-preference) {
        .gridid-cta-mascot {
          animation: gridid-cta-pop linear both;
          animation-timeline: --gridid-cta;
          animation-range: entry 5% entry 75%;
        }
        .gridid-cta-glow {
          animation: gridid-cta-glow linear both;
          animation-timeline: --gridid-cta;
          animation-range: entry 15% entry 85%;
        }
      }
    }
  `}</style>

  {/* Background image (ganti nama file sesuai gambarmu) */}
  <div
    className="absolute inset-0 -z-20 bg-cover bg-center"
    style={{ backgroundImage: "url('/bg-cta.png')" }}
  />
  {/* Cover gradasi biru -> kuning, cerah tapi subtle */}
  <div className="absolute inset-0 -z-10 bg-linear-to-r from-[#1d4ed8] to-[#ffd54a] opacity-80" />

  <Reveal>
    <div className="mx-auto grid max-w-275 grid-cols-1 items-stretch gap-0 px-margin-mobile md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:gap-6 md:px-gutter">
      {/* KIRI: teks rata kiri, tombol di bawah */}
      <div className="flex flex-col items-start justify-center gap-4 pb-6 md:gap-5 md:pb-12">
       <h2 className="font-headline-md text-headline-md font-extrabold leading-tight text-white ...">
  Bergabung menjaga <br /> jaringan di wilayahmu!
</h2>

        <p className="max-w-md font-body-md text-body-md text-white [text-shadow:0_2px_6px_#0a1f5c80]">
          Laporan dan partisipasimu membantu mencegah <br/> krisis sebelum terjadi.
        </p>
        <a
          href="/masuk"
          className="mt-1 inline-block min-w-50 rounded-full bg-[#ffffff] px-8 py-4 text-center font-label-bold text-label-bold text-[#0329af] shadow-[0_8px_16px_-4px_#0a1f5c8c,0_2px_5px_#0a1f5c40] transition-transform duration-300 hover:-translate-y-0.5"
        >
          Mulai Sekarang
        </a>
      </div>

      {/* KANAN: maskot, menempel di dasar section */}
      <div className="relative min-h-60 md:min-h-0">
        {/* Glow kuning lembut di belakang maskot */}
        <div className="gridid-cta-glow pointer-events-none absolute inset-x-0 bottom-[4%] mx-auto h-[85%] w-[85%] rounded-full bg-[radial-gradient(circle,#fff3a88c_0%,#fff3a800_70%)] blur-xl" />
        <img
          src="/maskot-cta-tentang.png"
          alt="Maskot GRID·ID mengajak bergabung"
          draggable={false}
          className="gridid-cta-mascot absolute bottom-0 right-0 w-full max-w-none select-none object-contain object-bottom drop-shadow-[0_10px_18px_#0a1f5c59] h-[140%] md:h-[160%]"
        />
      </div>
    </div>
  </Reveal>
</section>
    </>
  );
}