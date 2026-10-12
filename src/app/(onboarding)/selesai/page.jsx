"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

/*
  Taruh di folder /public:
  - grid-logos.png
  - maskot-penjaga-grid.png
  - bg-masuk.png
*/

/* ---------- Tema biru dominan + aksen kuning/oranye ---------- */
const BLUE_GRAD = "linear-gradient(90deg, #1E40AF 0%, #2563EB 55%, #38BDF8 100%)";
const COVER = "linear-gradient(160deg, #FFFFFF 0%, #E8F2FF 55%, #CFE2FF 100%)"; // dipasang dengan opacity 90%
const COLORS = ["#2563EB", "#38BDF8", "#FBBF24", "#F97316", "#1D4ED8", "#FDE68A", "#60A5FA"];

/* Acak yang deterministik */
const rnd = (i, s) => {
  const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/* 22 meriam kiri, 22 meriam kanan, 26 hujan dari atas */
const PIECES = Array.from({ length: 70 }, (_, i) => {
  const type = i < 22 ? "left" : i < 44 ? "right" : "rain";
  const w = 6 + Math.round(rnd(i, 1) * 7);
  return {
    type,
    color: COLORS[Math.floor(rnd(i, 2) * COLORS.length)],
    w,
    h: rnd(i, 3) > 0.5 ? w : Math.round(w * 1.8),
    round: rnd(i, 4) > 0.7,
    delay: type === "rain" ? 0.6 + rnd(i, 5) * 1.6 : 0.15 + rnd(i, 5) * 0.35,
    dur: type === "rain" ? 2.8 + rnd(i, 6) * 2 : 2.6 + rnd(i, 6) * 1.6,
    x: type === "left" ? 8 + rnd(i, 7) * 55 : type === "right" ? -(8 + rnd(i, 7) * 55) : (rnd(i, 7) - 0.5) * 20,
    up: -(40 + rnd(i, 8) * 50),
    r: (rnd(i, 9) > 0.5 ? 1 : -1) * (360 + rnd(i, 10) * 720),
    left: rnd(i, 11) * 100,
  };
});

function Confetti() {
  return (
    <div className="wl-confetti pointer-events-none fixed inset-0 z-[60] overflow-hidden" aria-hidden>
      {PIECES.map((p, i) => {
        const base = {
          width: p.w,
          height: p.h,
          background: p.color,
          borderRadius: p.round ? "50%" : 2,
          "--x": p.type === "rain" ? `${p.x}vw` : `${p.x}vw`,
          "--up": `${p.up}vh`,
          "--r": `${p.r}deg`,
        };
        if (p.type === "left")
          return <span key={i} className="absolute" style={{ ...base, left: 0, bottom: 0, animation: `wlShoot ${p.dur}s linear ${p.delay}s both` }} />;
        if (p.type === "right")
          return <span key={i} className="absolute" style={{ ...base, right: 0, bottom: 0, animation: `wlShoot ${p.dur}s linear ${p.delay}s both` }} />;
        return <span key={i} className="absolute" style={{ ...base, left: `${p.left}%`, top: 0, animation: `wlRain ${p.dur}s ease-in ${p.delay}s both` }} />;
      })}
    </div>
  );
}

const rise = (n) => ({ animation: `wlRise 0.7s cubic-bezier(.16,1,.3,1) ${0.35 + n * 0.1}s both` });

export default function Selesai() {
  const [mounted, setMounted] = useState(false);
  const [burst, setBurst] = useState(0);
  const [place, setPlace] = useState("wilayahmu");

  useEffect(() => {
    setMounted(true);
    try {
      const w = JSON.parse(localStorage.getItem("wilayah") || "null");
      if (w) {
        const name = [w.banjar, w.desa].filter(Boolean).join(", ") || w.kecamatan || w.kabupaten;
        if (name) setPlace(name);
      }
    } catch {}
  }, []);

  return (
    <div
      className="wl-font fixed inset-0 z-40 overflow-y-auto"
      style={{ backgroundColor: "#EAF3FF", backgroundImage: "url('/bg-masuk.png')", backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');

        .wl-font, .wl-font *:not(.material-symbols-outlined) { font-family: 'Montserrat', sans-serif !important; }

        @keyframes wlCard { from { opacity: 0; transform: translateY(28px) scale(.97) } to { opacity: 1; transform: translateY(0) scale(1) } }
        @keyframes wlRise { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes wlMascotIn { 0% { transform: translateY(-120px) scale(.3) rotate(-25deg); opacity: 0 } 55% { transform: translateY(10px) scale(1.12) rotate(6deg); opacity: 1 } 80% { transform: translateY(-4px) scale(.97) rotate(-2deg) } 100% { transform: translateY(0) scale(1) rotate(0) } }
        @keyframes wlDance { 0%,100% { transform: translateY(0) scale(1,1) rotate(-3deg) } 15% { transform: translateY(0) scale(1.07,.93) rotate(0) } 45% { transform: translateY(-16px) scale(.96,1.05) rotate(4deg) } 75% { transform: translateY(0) scale(1.05,.95) rotate(-2deg) } }
        @keyframes wlShadow { 0%,100% { transform: translateX(-50%) scaleX(1); opacity: .35 } 45% { transform: translateX(-50%) scaleX(.65); opacity: .18 } }
        @keyframes wlHalo { 0%,100% { opacity: .55; transform: scale(.92) } 50% { opacity: 1; transform: scale(1.12) } }
        @keyframes wlRing { 0% { transform: scale(.5); opacity: .7 } 100% { transform: scale(1.5); opacity: 0 } }
        @keyframes wlTwinkle { 0%,100% { opacity: .25; transform: scale(.6) rotate(0) } 50% { opacity: 1; transform: scale(1.25) rotate(25deg) } }
        @keyframes wlBadge { 0% { transform: scale(0) rotate(-12deg); opacity: 0 } 70% { transform: scale(1.15) rotate(3deg); opacity: 1 } 100% { transform: scale(1) rotate(0) } }
        @keyframes wlGlow { 0%,100% { box-shadow: 0 10px 22px -8px rgba(37,99,235,.75), 0 0 0 rgba(251,191,36,0) } 50% { box-shadow: 0 10px 26px -6px rgba(37,99,235,.85), 0 0 28px rgba(251,191,36,.55) } }
        @keyframes wlShine { 0% { left: -60% } 55%,100% { left: 160% } }
        @keyframes wlWiggle { 0%,100% { transform: translateX(0) } 50% { transform: translateX(5px) } }

        @keyframes wlShoot {
          0% { transform: translate(0,0) rotate(0); opacity: 1; animation-timing-function: cubic-bezier(.1,.7,.3,1) }
          35% { transform: translate(var(--x), var(--up)) rotate(calc(var(--r) * .4)); opacity: 1; animation-timing-function: cubic-bezier(.45,0,1,1) }
          100% { transform: translate(calc(var(--x) * 1.3), 25vh) rotate(var(--r)); opacity: 0 }
        }
        @keyframes wlRain {
          0% { transform: translate(0,-8vh) rotate(0); opacity: 1 }
          100% { transform: translate(var(--x), 110vh) rotate(var(--r)); opacity: .9 }
        }

        .wl-cta { animation: wlGlow 2.6s ease-in-out 1.6s infinite; }
        .wl-cta:hover { animation: none; }
        .wl-shine { animation: wlShine 3.6s ease-in-out 2s infinite; }
        .wl-arrow { animation: wlWiggle 1.4s ease-in-out infinite; }

        @media (prefers-reduced-motion: reduce) {
          .wl-confetti { display: none; }
          .no-motion, .no-motion *, .wl-cta, .wl-arrow, .wl-shine { animation: none !important; }
        }
      `}</style>

      {/* Cover putih-biru soft (opacity 90%) di atas gambar background */}
      <div className="pointer-events-none fixed inset-0" style={{ background: COVER, opacity: 0.9 }} />

      {mounted && <Confetti key={burst} />}

      <div className="relative z-10 grid min-h-full place-items-center px-4 py-10">
        <div
          className="no-motion w-full max-w-md rounded-3xl border border-white bg-white p-6 text-center shadow-[0_24px_60px_-12px_rgba(37,99,235,0.45)] sm:p-8"
          style={{ animation: "wlCard 0.9s cubic-bezier(.16,1,.3,1) both" }}
        >
          {/* Logo */}
          <div style={rise(0)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/grid-logos.png" alt="GRID.ID" className="mx-auto h-9 w-auto object-contain" />
          </div>

          {/* Maskot (klik untuk confetti lagi) */}
          <button
            type="button"
            onClick={() => setBurst((b) => b + 1)}
            aria-label="Rayakan lagi"
            className="relative mx-auto mt-4 block h-48 w-48 cursor-pointer outline-none"
          >
            <span className="absolute inset-3 rounded-full blur-2xl" style={{ background: "radial-gradient(circle, rgba(56,189,248,.75) 0%, rgba(251,191,36,.45) 60%, transparent 100%)", animation: "wlHalo 2.4s ease-in-out infinite" }} />
            <span className="absolute inset-4 rounded-full border-2 border-[#38BDF8]" style={{ animation: "wlRing 2.2s ease-out 1s infinite" }} />
            <span className="absolute inset-4 rounded-full border-2 border-[#FBBF24]" style={{ animation: "wlRing 2.2s ease-out 2.1s infinite" }} />

            {[["6%", "14%", "#FBBF24", "0s", 22], ["88%", "10%", "#F97316", ".5s", 18], ["2%", "62%", "#38BDF8", "1s", 16], ["92%", "58%", "#FBBF24", ".25s", 20]].map(([l, t, c, d, s], i) => (
              <span key={i} className="material-symbols-outlined absolute" style={{ left: l, top: t, color: c, fontSize: s, fontVariationSettings: "'FILL' 1", animation: `wlTwinkle 1.8s ease-in-out ${d} infinite` }}>auto_awesome</span>
            ))}

            <span className="absolute bottom-3 left-1/2 h-4 w-28 rounded-full bg-[#1E40AF] blur-md" style={{ animation: "wlShadow 2.4s ease-in-out 1s infinite" }} />

            <span className="absolute inset-0 block" style={{ animation: "wlMascotIn 1s cubic-bezier(.3,1.3,.5,1) .3s both" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/maskot-penjaga-grid.png"
                alt="Maskot Penjaga Grid"
                className="h-full w-full object-contain drop-shadow-[0_12px_14px_rgba(30,64,175,0.35)]"
                style={{ transformOrigin: "50% 100%", animation: "wlDance 2.4s ease-in-out 1.3s infinite" }}
              />
            </span>
          </button>

          {/* Badge selamat */}
          <div className="mt-1 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-white shadow-md" style={{ background: "linear-gradient(90deg,#F97316,#FBBF24)", animation: "wlBadge .7s cubic-bezier(.3,1.4,.5,1) 1s both" }}>
            <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>celebration</span>
            Selamat!
          </div>

          <div style={rise(3)}>
            <h1 className="mt-3 bg-gradient-to-r from-[#1E40AF] via-[#2563EB] to-[#38BDF8] bg-clip-text font-headline-md text-headline-md text-transparent">
              Kamu kini Penjaga Grid!
            </h1>
            <p className="mt-2 font-body-md text-body-md text-on-surface-variant">
              Lokasimu: <span className="font-bold text-[#2563EB]">{place}</span>. Skor risiko sedang dihitung.
            </p>
          </div>

          <div style={rise(5)}>
            <Link
              href="/beranda"
              className="wl-cta group relative mt-6 flex items-center justify-center gap-2 overflow-hidden rounded-full py-3.5 font-label-bold text-label-bold text-[#FDE047] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_32px_-6px_rgba(37,99,235,0.8),0_0_30px_rgba(251,191,36,0.7)] active:translate-y-0 active:scale-95"
              style={{ background: BLUE_GRAD, textShadow: "0 1px 3px rgba(0,0,0,0.3)" }}
            >
              <span className="wl-shine pointer-events-none absolute inset-y-0 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-[#FDE68A]/60 to-transparent" />
              <span className="material-symbols-outlined relative text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
              <span className="relative">Lihat Skor Risikoku</span>
              <span className="wl-arrow material-symbols-outlined relative text-[18px]">arrow_forward</span>
            </Link>

            <Link
              href="/peta-publik"
              className="relative mt-4 inline-flex items-center gap-1 font-label-bold text-label-bold text-[#2563EB] transition-colors hover:text-[#1E40AF] after:absolute after:-bottom-0.5 after:left-0 after:h-0.5 after:w-0 after:rounded-full after:bg-gradient-to-r after:from-[#FBBF24] after:to-[#F97316] after:transition-all after:duration-300 hover:after:w-full"
            >
              <span className="material-symbols-outlined text-[18px]">map</span>
              Jelajahi Peta Publik
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}