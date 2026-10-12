"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

/* Taruh di folder /public:
   maskot-akses-lokasi.png, bg-akses-lokasi.png, maskot-login-loading.png (untuk layar loading) */

const GREEN_GRAD = "linear-gradient(90deg, #15803D 0%, #059669 50%, #0E7490 100%)";
const GREEN_GRAD_135 = "linear-gradient(135deg, #0B3C5D 0%, #0F766E 40%, #22C55E 100%)";

/* ---------- Layar loading saat pindah halaman ---------- */
function TransitionOverlay({ text }) {
  const letters = "GRID·ID".split("");
  return (
    <div
      className="no-motion fixed inset-0 z-[100] grid place-items-center overflow-hidden"
      style={{ background: GREEN_GRAD_135, animation: "lkFade 0.4s ease-out both" }}
    >
      {[["12%", "20%", "0s"], ["82%", "16%", ".4s"], ["20%", "78%", ".8s"], ["88%", "70%", ".2s"], ["50%", "10%", ".6s"]].map(([l, tp, d], i) => (
        <span key={i} className="absolute h-3 w-3 rounded-full bg-[#FEF08A] blur-[1px]" style={{ left: l, top: tp, animation: `lkSpark 1.4s ease-in-out ${d} infinite` }} />
      ))}
      <div className="flex flex-col items-center px-6 text-center">
        <div className="relative" style={{ animation: "lkDrop 0.9s cubic-bezier(.3,1.3,.5,1) both" }}>
          <div className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/30 blur-2xl" style={{ animation: "lkHalo 1.6s ease-in-out infinite" }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/maskot-login-loading.png"
            alt=""
            className="relative h-44 w-auto object-contain drop-shadow-[0_12px_20px_rgba(0,0,0,0.3)]"
            style={{ transformOrigin: "50% 100%", animation: "lkBounce 1.1s ease-in-out 0.9s infinite" }}
          />
          <div className="mx-auto -mt-1 h-3 w-24 rounded-full bg-black/30 blur-sm" style={{ animation: "lkShadow 1.1s ease-in-out 0.9s infinite" }} />
        </div>
        <div className="mt-4 flex text-5xl font-black tracking-wide text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.35)]">
          {letters.map((ch, i) => (
            <span key={i} className={ch === "·" ? "text-[#FEF08A]" : ""} style={{ animation: `lkPop 0.5s cubic-bezier(.3,1.4,.5,1) ${0.7 + i * 0.09}s both` }}>
              {ch}
            </span>
          ))}
        </div>
        <p className="mt-3 text-sm font-semibold text-white/90" style={{ animation: "lkFade 0.6s ease-out 1.4s both" }}>{text}</p>
        <div className="mt-5 h-2 w-56 overflow-hidden rounded-full bg-white/25">
          <div className="h-full rounded-full bg-gradient-to-r from-white to-[#FEF08A] shadow-[0_0_12px_rgba(255,255,255,0.8)]" style={{ animation: "lkBar 2.2s ease-in-out 0.3s both" }} />
        </div>
      </div>
    </div>
  );
}

// Animasi masuk berurutan: rise(n) = muncul dengan jeda ke-n
const rise = (n) => ({ animation: `lkRise 0.7s cubic-bezier(.16,1,.3,1) ${0.45 + n * 0.08}s both` });

export default function Lokasi() {
  const router = useRouter();
  const [leaving, setLeaving] = useState(null);

  const go = (href, text) => {
    if (leaving) return;
    setLeaving(text);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setTimeout(() => router.push(href), reduce ? 300 : 2600);
  };

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-white">
      <style>{`
        @keyframes lkFade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes lkDrop { 0% { transform: translateY(-140%) scale(.8); opacity: 0 } 55% { transform: translateY(12%) scale(1.05); opacity: 1 } 75% { transform: translateY(-6%) } 100% { transform: translateY(0) } }
        @keyframes lkBounce {
          0%, 100% { transform: translateY(0) scale(1, 1) rotate(-3deg) }
          20% { transform: translateY(0) scale(1.08, .92) rotate(0deg) }
          50% { transform: translateY(-28px) scale(.95, 1.06) rotate(3deg) }
          80% { transform: translateY(0) scale(1.06, .94) rotate(-1deg) }
        }
        @keyframes lkShadow { 0%, 100% { transform: scaleX(1); opacity: .9 } 50% { transform: scaleX(.6); opacity: .5 } }
        @keyframes lkHalo { 0%, 100% { opacity: .5; transform: translate(-50%, -50%) scale(.9) } 50% { opacity: .9; transform: translate(-50%, -50%) scale(1.15) } }
        @keyframes lkPop { 0% { transform: translateY(24px) scale(.4); opacity: 0 } 70% { transform: translateY(-6px) scale(1.15); opacity: 1 } 100% { transform: translateY(0) scale(1); opacity: 1 } }
        @keyframes lkBar { from { width: 0 } to { width: 100% } }
        @keyframes lkSpark { 0%, 100% { opacity: .2; transform: scale(.6) } 50% { opacity: 1; transform: scale(1.2) } }

        @keyframes lkCard { from { opacity: 0; transform: translateY(28px) scale(.97) } to { opacity: 1; transform: translateY(0) scale(1) } }
        @keyframes lkRise { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes lkMascotIn { from { opacity: 0; transform: translateY(20px) scale(.9) } to { opacity: 1; transform: translateY(0) scale(1) } }
        @keyframes lkFloat { 0%, 100% { transform: translateY(0) rotate(-1.5deg) } 50% { transform: translateY(-9px) rotate(1.5deg) } }
        @keyframes lkRing { 0% { transform: scale(.7); opacity: .55 } 100% { transform: scale(1.5); opacity: 0 } }
        @keyframes lkBg { from { opacity: 0; transform: scale(1.05) } to { opacity: 1; transform: scale(1) } }
        @keyframes lkGlow { 0%, 100% { box-shadow: 0 8px 20px -6px rgba(5,150,105,.7), 0 0 0 rgba(34,197,94,0) } 50% { box-shadow: 0 8px 22px -6px rgba(5,150,105,.8), 0 0 26px rgba(34,197,94,.55) } }

        .lk-btn { animation: lkGlow 2.6s ease-in-out 1.6s infinite; }
        .lk-btn:hover { animation: none; }

        @media (prefers-reduced-motion: reduce) {
          .no-motion, .no-motion *, .lk-btn { animation: none !important; }
        }
      `}</style>

      {leaving && <TransitionOverlay text={leaving} />}

      {/* Background gambar */}
      <div
        className="no-motion absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/bg-akses-lokasi.png')", animation: "lkBg 1.4s ease-out both" }}
        aria-hidden
      />
      {/* Cover gradien putih -> hijau soft, opacity 90% */}
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{ background: "linear-gradient(160deg, #FFFFFF 0%, #EAFBF0 50%, #C9F0D8 100%)" }}
        aria-hidden
      />

      <div className="relative z-10 grid min-h-full place-items-center px-4 py-10">
        <div
          className="no-motion w-full max-w-md rounded-3xl border border-white/70 bg-white/90 p-6 text-center shadow-[0_24px_60px_-12px_rgba(5,150,105,0.5)] backdrop-blur-md sm:p-8"
          style={{ animation: "lkCard 0.9s cubic-bezier(.16,1,.3,1) both" }}
        >
          {/* Maskot akses lokasi, melayang pelan dengan cincin sinyal */}
          <div className="relative mx-auto mb-5 grid h-44 w-44 place-items-center">
            <span className="absolute inset-4 rounded-full border-2 border-[#22C55E]/60" style={{ animation: "lkRing 2.4s ease-out 1.2s infinite" }} aria-hidden />
            <span className="absolute inset-4 rounded-full border-2 border-[#22C55E]/60" style={{ animation: "lkRing 2.4s ease-out 2.4s infinite" }} aria-hidden />
            <div className="absolute inset-6 rounded-full bg-gradient-to-br from-[#BBF7D0] to-[#A5F3FC] opacity-70 blur-xl" aria-hidden />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/maskot-akses-lokasi.png"
              alt="Maskot akses lokasi GRID·ID"
              className="relative h-full w-full object-contain drop-shadow-[0_12px_18px_rgba(5,150,105,0.35)]"
              style={{ animation: "lkMascotIn 0.9s cubic-bezier(.16,1,.3,1) 0.3s both, lkFloat 3.2s ease-in-out 1.3s infinite" }}
            />
          </div>

          <div style={rise(0)}>
            <h1 className="font-headline-sm text-headline-sm">Izinkan akses lokasi</h1>
            <p className="mt-2 font-body-md text-body-md text-on-surface-variant">
              Kami memakai lokasimu untuk menghitung skor risiko dan prakiraan cuaca BMKG di sekitarmu. Lokasimu tidak dibagikan ke publik.
            </p>
          </div>

          <div style={rise(1)}>
            <button
              onClick={() => go("/wilayah", "Menyiapkan wilayahmu…")}
              className="lk-btn group relative mt-6 flex w-full items-center justify-center gap-2 overflow-hidden rounded-full py-3 font-label-bold text-label-bold text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_30px_-4px_rgba(5,150,105,0.8),0_0_28px_rgba(34,197,94,0.7)] active:translate-y-0 active:scale-95 active:shadow-[0_0_36px_rgba(34,197,94,0.95)]"
              style={{ background: GREEN_GRAD }}
            >
              <span className="pointer-events-none absolute inset-y-0 -left-full w-1/2 -skew-x-12 bg-white/35 transition-all duration-700 group-hover:left-[150%]" />
              <span className="material-symbols-outlined relative text-[20px] transition-transform duration-300 group-hover:scale-110">my_location</span>
              <span className="relative">Izinkan Lokasi</span>
            </button>
          </div>

          <div style={rise(2)}>
            <button
              onClick={() => go("/wilayah", "Menyiapkan wilayahmu…")}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border-2 border-[#16A34A]/60 bg-white/80 py-2.5 font-label-bold text-label-bold text-[#15803D] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#22C55E] hover:bg-[#F0FDF4] hover:shadow-[0_8px_18px_-6px_rgba(34,197,94,0.7)] active:translate-y-0 active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">edit_location_alt</span> Pilih manual
            </button>
          </div>

          <div className="mt-5 flex items-center justify-center gap-1.5 font-label-sm text-label-sm text-on-surface-variant" style={rise(3)}>
            <span className="material-symbols-outlined text-[16px] text-[#16A34A]">lock</span> Privasimu aman
          </div>

          <div className="mt-6 flex justify-center gap-1.5" style={rise(4)}>
            <span className="h-1.5 w-1.5 rounded-full bg-outline-variant" />
            <span className="h-1.5 w-6 rounded-full" style={{ background: GREEN_GRAD }} />
            <span className="h-1.5 w-1.5 rounded-full bg-outline-variant" />
          </div>
        </div>
      </div>
    </div>
  );
}