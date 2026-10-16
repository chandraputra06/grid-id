"use client";
import { useState, useEffect, useRef } from "react";
import { Reveal } from "@/components/motion";
import { supabase } from "@/lib/supabase";

/* ============ PENGATURAN ============ */
const AVATAR_FALLBACK = "/maskot-prediktif.png"; // dipakai kalau akun belum punya foto profil
const NEXT_LEVEL_AT = 2000;

const MASCOT_SRC = "/maskot-progresss.png";
const MASCOT_LEADERBOARD = "/maskot-leaderboard.png";

const MEDAL_IMAGES = true;

const MEDALS = [
  { file: "medali1.png", icon: "bolt", c: ["#FFF3B0", "#F5B301", "#B45309"] },
  { file: "medali2.png", icon: "storm", c: ["#BAE6FD", "#2563EB", "#1E3A8A"] },
  { file: "medali3.png", icon: "cable", c: ["#FBCFE8", "#EC4899", "#9D174D"] },
  { file: "medali4.png", icon: "eco", c: ["#BBF7D0", "#16A34A", "#14532D"] },
  { file: "medali5.png", icon: "visibility", c: ["#E9D5FF", "#9333EA", "#581C87"] },
  { file: "medali6.png", icon: "local_fire_department", c: ["#FED7AA", "#F97316", "#9A3412"] },
  { file: "medali7.png", icon: "water_drop", c: ["#A5F3FC", "#06B6D4", "#155E75"] },
  { file: "medali8.png", icon: "shield", c: ["#FECACA", "#EF4444", "#7F1D1D"] },
  { file: "medali9.png", icon: "emoji_events", c: ["#BAE6FD", "#2563EB", "#365314"] },
];

const MISI0 = [
  { id: 1, label: "Laporan 1 Tiang Miring", sub: "Batas: 2 hari lagi", pts: 50, done: false },
  { id: 2, label: "Validasi Cuaca Lokal", sub: "Selesai", pts: 20, done: true },
  { id: 3, label: "Cek Skor Risiko Hari Ini", sub: "Batas: hari ini", pts: 10, done: false },
];

const REWARDS = {
  token: {
    title: "Voucher Token Listrik", icon: "bolt", note: "Token dikirim ke meteran prabayarmu",
    items: [
      { id: "t20", name: "Token Rp20.000", cost: 500 },
      { id: "t50", name: "Token Rp50.000", cost: 1100 },
      { id: "t100", name: "Token Rp100.000", cost: 2200 },
    ],
  },
  donasi: {
    title: "Donasi Lingkungan", icon: "volunteer_activism", note: "Poinmu jadi aksi nyata untuk lingkungan",
    items: [
      { id: "d1", name: "Tanam 1 Pohon", cost: 100 },
      { id: "d2", name: "Bersihkan Sungai", cost: 250 },
      { id: "d3", name: "Panel Surya Desa", cost: 500 },
    ],
  },
};

const PANTUN = [
  "Buah duku buah manggis, dimakan enak di siang hari.\nPoin terkumpul bikin senyum manis, token listrik gratis, dompet happy hari ini.",
  "Naik sepeda ke kebun jambu, jambunya manis dibagi dua. \nLapor kabel menjuntai itu, dapat poin, listrik pun aman semua.",
  "Ke pasar beli ketupat, pulangnya mampir beli sagu. \nKalau colokan terasa hangat, cabut dulu, jangan ditunggu.",
  "Beli sandal di toko Pak Dadang, pulang jalan sambil bernyanyi.\nPoin dikumpul jangan terbuang, tukar token biar dapur nggak sepi.",
];

const fmt = (n) => Math.round(n).toLocaleString("id-ID");
const rnd = () => Math.random().toString(36).slice(2, 6).toUpperCase();

// "medali1.png" -> "Medali 1"
const medalName = (m) => m.file.replace(/\.[^.]+$/, "").replace(/^medali(\d+)/i, "Medali $1");

// Bentuk data user dari akun Supabase yang sedang login
function buildUser(u) {
  const prefix = u?.email?.split("@")[0] || "";
  const name = (u?.user_metadata?.full_name || u?.user_metadata?.name || prefix || "Penjaga Grid").trim();
  const p = name.split(/\s+/);
  return {
    name,
    short: p.length > 1 ? `${p[0]} ${p[1][0]}.` : p[0],
    username: prefix ? `@${prefix.toLowerCase()}` : "",
    avatar: u?.user_metadata?.avatar_url || AVATAR_FALLBACK,
  };
}

/* ============ HOOK: angka beranimasi ============ */
function useAnimatedNumber(target, { from, duration = 900 } = {}) {
  const [value, setValue] = useState(from ?? target);
  const fromRef = useRef(from ?? target);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      fromRef.current = target;
      setValue(target);
      return;
    }
    const s = fromRef.current;
    const t0 = performance.now();
    let raf;
    const step = (now) => {
      const p = Math.min(1, (now - t0) / duration);
      const v = s + (target - s) * (1 - Math.pow(1 - p, 3));
      fromRef.current = v;
      setValue(v);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

/* ============ KOMPONEN KECIL ============ */
function Bolt3D({ size = 56 }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden style={{ filter: "drop-shadow(0 0 10px rgba(250,204,21,.8)) drop-shadow(0 6px 6px rgba(180,83,9,.4))" }}>
      <defs>
        <linearGradient id="msBF" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FEF08A" /><stop offset=".5" stopColor="#FACC15" /><stop offset="1" stopColor="#F59E0B" />
        </linearGradient>
        <linearGradient id="msBS" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#B45309" /><stop offset="1" stopColor="#7C2D12" />
        </linearGradient>
      </defs>
      <polygon points="36,3 12,36 28,36 22,61 52,24 35,24 44,3" fill="url(#msBS)" transform="translate(3,4)" />
      <polygon points="36,3 12,36 28,36 22,61 52,24 35,24 44,3" fill="url(#msBF)" stroke="#FDE68A" strokeWidth="1.5" strokeLinejoin="round" />
      <polygon points="36,3 22,22 30,22 38,3" fill="#fff" opacity=".45" />
    </svg>
  );
}

function Mascot({ className = "" }) {
  if (MASCOT_SRC) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={MASCOT_SRC} alt="" className={`object-contain ${className}`} />;
  }
  return (
    <svg viewBox="0 0 120 150" className={className} aria-hidden>
      <defs>
        <linearGradient id="msMB" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#7DD3FC" /><stop offset="1" stopColor="#1D4ED8" /></linearGradient>
        <linearGradient id="msMY" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FEF08A" /><stop offset="1" stopColor="#FACC15" /></linearGradient>
      </defs>
      <polygon points="62,2 46,30 58,30 50,52 76,22 63,22" fill="url(#msMY)" stroke="#F59E0B" strokeWidth="2" strokeLinejoin="round" />
      <ellipse cx="42" cy="141" rx="13" ry="7" fill="#FACC15" /><ellipse cx="78" cy="141" rx="13" ry="7" fill="#FACC15" />
      <ellipse cx="18" cy="92" rx="9" ry="14" fill="#38BDF8" transform="rotate(25 18 92)" />
      <g style={{ transformOrigin: "102px 80px", animation: "msWave .7s ease-in-out infinite alternate" }}>
        <ellipse cx="102" cy="88" rx="9" ry="14" fill="#38BDF8" transform="rotate(-25 102 88)" />
      </g>
      <ellipse cx="60" cy="94" rx="40" ry="44" fill="url(#msMB)" />
      <ellipse cx="60" cy="108" rx="24" ry="26" fill="#fff" opacity=".9" />
      <circle cx="46" cy="82" r="9" fill="#fff" /><circle cx="74" cy="82" r="9" fill="#fff" />
      <circle cx="48" cy="83" r="4.5" fill="#0B2A5B" /><circle cx="76" cy="83" r="4.5" fill="#0B2A5B" />
      <circle cx="49.5" cy="81" r="1.5" fill="#fff" /><circle cx="77.5" cy="81" r="1.5" fill="#fff" />
      <circle cx="36" cy="97" r="5" fill="#FDA4AF" opacity=".7" /><circle cx="84" cy="97" r="5" fill="#FDA4AF" opacity=".7" />
      <path d="M50 98 Q60 109 70 98" stroke="#0B2A5B" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <polygon points="62,112 55,124 60,124 57,134 68,120 62,120" fill="#FACC15" />
    </svg>
  );
}

function Medal({ m, size = 76, delay = 0 }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(from 210deg, ${m.c[0]}, ${m.c[1]}, ${m.c[0]}, ${m.c[1]}, ${m.c[0]})`,
          boxShadow: `0 8px 16px -4px ${m.c[1]}99, inset 0 -4px 6px rgba(0,0,0,.25), inset 0 3px 5px rgba(255,255,255,.6)`,
        }}
      />
      <div
        className="absolute grid place-items-center overflow-hidden rounded-full"
        style={{
          inset: size * 0.1,
          background: `radial-gradient(circle at 30% 25%, ${m.c[0]}, ${m.c[1]} 70%, ${m.c[2]})`,
          boxShadow: "inset 0 3px 6px rgba(0,0,0,.25), inset 0 -2px 4px rgba(255,255,255,.4)",
        }}
      >
        {MEDAL_IMAGES ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`/${m.file}`} alt={medalName(m)} className="h-full w-full object-cover" />
        ) : (
          <span className="material-symbols-outlined text-white drop-shadow-[0_2px_3px_rgba(0,0,0,.35)]" style={{ fontSize: size * 0.42, fontVariationSettings: "'FILL' 1" }}>{m.icon}</span>
        )}
        <span className="msSheen absolute inset-y-0 left-0 w-1/3 bg-linear-to-r from-transparent via-white/75 to-transparent" style={{ animationDelay: `${delay}s` }} />
      </div>
      <span className="absolute left-[18%] top-[10%] h-[18%] w-[34%] rotate-[-30deg] rounded-full bg-white/50 blur-[1px]" />
    </div>
  );
}

function Burst({ n = 14, colors = ["#FDE047", "#F97316", "#38BDF8", "#EC4899"] }) {
  return (
    <span className="pointer-events-none absolute left-1/2 top-1/2" aria-hidden>
      {Array.from({ length: n }).map((_, i) => {
        const a = (i / n) * Math.PI * 2;
        const d = 70 + (i % 3) * 28;
        return (
          <i
            key={i}
            className="msConf absolute block h-2 w-2 rounded-sm"
            style={{ "--dx": `${Math.cos(a) * d}px`, "--dy": `${Math.sin(a) * d}px`, background: colors[i % colors.length], animationDelay: `${(i % 4) * 0.03}s` }}
          />
        );
      })}
    </span>
  );
}

function Modal({ onClose, label, children }) {
  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={label}
      className="fixed inset-0 z-100 grid place-items-center overflow-y-auto p-4"
      style={{ background: "rgba(7,20,52,.72)", backdropFilter: "blur(6px)", animation: "msFade .25s ease-out both" }}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      {children}
    </div>
  );
}

/* ============ GRAFIK PROGRESS + MASKOT ============ */
function Chart({ points }) {
  const W = 600, H = 210, PX = 34, PT = 34, PB = 34, maxV = 1600;
  const data = [120, 260, 410, 640, 790, 980, points];
  const pts = data.map((v, i) => ({
    x: PX + (i * (W - 2 * PX)) / (data.length - 1),
    y: H - PB - (Math.min(v, maxV) / maxV) * (H - PT - PB),
  }));
  const line = pts.reduce((d, p, i) => (i ? `${d} C${(pts[i - 1].x + p.x) / 2},${pts[i - 1].y} ${(pts[i - 1].x + p.x) / 2},${p.y} ${p.x},${p.y}` : `M${p.x},${p.y}`), "");
  const last = pts[pts.length - 1];
  const area = `${line} L${last.x},${H - PB} L${pts[0].x},${H - PB} Z`;
  const labels = ["M1", "M2", "M3", "M4", "M5", "M6", "Kini"];

  return (
    <div className="relative rounded-2xl p-3" style={{ background: "linear-gradient(180deg,#EAF2FF 0%,#FFFFFF 100%)" }}>
      <div className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label="Grafik kenaikan poin selama 7 minggu">
          <defs>
            <linearGradient id="msLine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#1D4ED8" /><stop offset=".4" stopColor="#38BDF8" /><stop offset=".75" stopColor="#FACC15" /><stop offset="1" stopColor="#F59E0B" />
            </linearGradient>
            <linearGradient id="msArea" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#3B82F6" stopOpacity=".32" /><stop offset="1" stopColor="#FACC15" stopOpacity=".38" />
            </linearGradient>
            <filter id="msGlowF"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          </defs>
          {[0.25, 0.5, 0.75].map((f) => (
            <line key={f} x1={PX} x2={W - PX} y1={PT + f * (H - PT - PB)} y2={PT + f * (H - PT - PB)} stroke="#1D4ED8" strokeOpacity=".1" strokeDasharray="4 6" />
          ))}
          <path d={area} fill="url(#msArea)" className="msAreaIn" />
          <path d={line} pathLength="1" fill="none" stroke="url(#msLine)" strokeWidth="5" strokeLinecap="round" filter="url(#msGlowF)" className="msDraw" />
          {pts.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={i === pts.length - 1 ? 7 : 4.5} fill="#fff" stroke={i > 4 ? "#F59E0B" : "#2563EB"} strokeWidth="3" />
          ))}
          <circle cx={last.x} cy={last.y} r="7" fill="none" stroke="#FACC15" strokeWidth="2" className="msRing" />
          {pts.map((p, i) => (
            <text key={i} x={p.x} y={H - 10} textAnchor="middle" fontSize="11" fontWeight="600" fill="#4B5D8A">{labels[i]}</text>
          ))}
        </svg>

        {/* Maskot duduk di titik terakhir */}
        <div
          className="pointer-events-none absolute w-20 sm:w-24 md:w-28"
          style={{ left: `${(last.x / W) * 100}%`, top: `${(last.y / H) * 100}%`, transform: "translate(-55%,-88%)" }}
        >
          <Mascot className="msFloat block h-auto w-full max-w-none drop-shadow-[0_8px_8px_rgba(29,78,216,.35)]" />
        </div>
      </div>
    </div>
  );
}

/* ============ MODAL MEDALI ============ */
function MedalModal({ m, onClose }) {
  return (
    <Modal onClose={onClose} label={`Detail ${medalName(m)}`}>
      <div
        className="relative w-full max-w-sm overflow-hidden rounded-3xl p-8 text-center text-white"
        style={{ background: "linear-gradient(160deg,#0A2259,#1D4ED8)", animation: "msPopIn .55s cubic-bezier(.3,1.4,.5,1) both", boxShadow: `0 0 60px ${m.c[1]}88` }}
      >
        <div className="pointer-events-none absolute left-1/2 top-24 h-48 w-48 -translate-x-1/2 rounded-full blur-3xl" style={{ background: m.c[1], opacity: 0.55 }} />
        <div className="relative mx-auto" style={{ perspective: 700, width: 170, height: 170 }}>
          <div className="msSpin3d" style={{ transformStyle: "preserve-3d" }}>
            <Medal m={m} size={170} delay={0} />
          </div>
          <Burst n={12} colors={[m.c[0], "#FDE047", "#fff"]} />
        </div>
        <h3 className="relative mt-6 font-headline-sm text-headline-sm">{medalName(m)}</h3>
        <p className="relative mt-1 text-sm text-white/80">Lencana dari misimu. Deskripsi medali akan tampil di sini.</p>
        <button onClick={onClose} autoFocus className="relative mt-6 rounded-full bg-white px-6 py-2.5 font-label-bold text-label-bold text-[#1D4ED8] transition-all hover:-translate-y-0.5 hover:shadow-[0_0_24px_rgba(253,224,71,.9)] active:scale-95">
          Tutup
        </button>
      </div>
    </Modal>
  );
}

/* ============ MODAL TUKAR REWARD (kupon) ============ */
const notch = (where) => {
  const y = where === "bottom" ? "100%" : "0";
  const g = `radial-gradient(circle at 0 ${y}, transparent 13px, #000 14px), radial-gradient(circle at 100% ${y}, transparent 13px, #000 14px)`;
  return { WebkitMaskImage: g, maskImage: g, WebkitMaskComposite: "source-in", maskComposite: "intersect" };
};

function RewardModal({ kind, points, onRedeem, onClose }) {
  const cfg = REWARDS[kind];
  const [sel, setSel] = useState(null);
  const [phase, setPhase] = useState("pick"); // pick | proc | done
  const [code, setCode] = useState("");
  const timer = useRef(null);
  const sp = useAnimatedNumber(points, { duration: 1100 });
  useEffect(() => () => clearTimeout(timer.current), []);
  const item = cfg.items.find((i) => i.id === sel);

  const exchange = () => {
    if (!item || item.cost > points || phase !== "pick") return;
    setPhase("proc");
    timer.current = setTimeout(() => {
      onRedeem(item.cost);
      setCode(`GRID-${rnd()}-${rnd()}`);
      setPhase("done");
    }, 1500);
  };

  return (
    <Modal onClose={onClose} label={cfg.title}>
      <div className="w-full max-w-sm" style={{ filter: "drop-shadow(0 20px 30px rgba(0,0,0,.45))", animation: "msPopIn .55s cubic-bezier(.3,1.4,.5,1) both" }}>
        <div style={phase === "proc" ? { animation: "msShake .4s linear infinite" } : undefined}>
          {/* Bagian atas kupon */}
          <div className="overflow-hidden rounded-t-3xl bg-white" style={notch("bottom")}>
            <div className="relative p-5 text-white" style={{ background: "linear-gradient(135deg,#F97316,#FB7185 55%,#EC4899)" }}>
              <button onClick={onClose} aria-label="Tutup" className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/20 transition-colors hover:bg-white/35">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-white/25 shadow-inner">
                  <span className="material-symbols-outlined text-[26px]" style={{ fontVariationSettings: "'FILL' 1" }}>{cfg.icon}</span>
                </span>
                <div>
                  <p className="font-headline-sm text-headline-sm">{phase === "done" ? "Berhasil ditukar!" : cfg.title}</p>
                  <p className="text-xs text-white/85">{phase === "done" ? "Terima kasih sudah menjaga grid" : cfg.note}</p>
                </div>
              </div>
            </div>

            <div className="relative px-5 pb-8 pt-4">
              {phase === "pick" && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-on-surface-variant">Pilih voucher</p>
                  {cfg.items.map((it) => {
                    const lack = it.cost > points;
                    const on = sel === it.id;
                    return (
                      <button
                        key={it.id}
                        disabled={lack}
                        onClick={() => setSel(it.id)}
                        className={`flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left transition-all ${
                          on ? "border-[#F97316] bg-[#FFF3E8] shadow-[0_6px_16px_-6px_rgba(249,115,22,.7)]" : "border-outline-variant hover:border-[#FDBA74]"
                        } ${lack ? "cursor-not-allowed opacity-45" : "hover:-translate-y-0.5"}`}
                      >
                        <span className={`material-symbols-outlined text-[22px] ${on ? "text-[#F97316]" : "text-outline"}`} style={on ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                          {on ? "check_circle" : "radio_button_unchecked"}
                        </span>
                        <span className="flex-1 font-label-bold text-label-bold">{it.name}</span>
                        <span className="text-xs font-bold text-[#C2410C]">{lack ? "Poin kurang" : `${fmt(it.cost)} poin`}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {phase === "proc" && (
                <div className="grid place-items-center py-8 text-center">
                  <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#FDBA74]/40 border-t-[#F97316]" />
                  <p className="mt-4 font-label-bold text-label-bold">Menukar poinmu…</p>
                </div>
              )}

              {phase === "done" && (
                <div className="relative grid place-items-center py-4 text-center">
                  <Burst n={18} />
                  <span className="msStamp grid h-20 w-20 place-items-center rounded-full border-4 border-[#16A34A] text-[#16A34A]">
                    <span className="material-symbols-outlined text-[44px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                  </span>
                  <p className="mt-3 font-label-bold text-label-bold">{item.name}</p>
                  {kind === "token" ? (
                    <div className="mt-2 rounded-xl border-2 border-dashed border-[#F97316] bg-[#FFF3E8] px-4 py-2 font-mono text-base font-bold tracking-wider text-[#C2410C]">{code}</div>
                  ) : (
                    <p className="mt-2 text-sm text-on-surface-variant">Donasimu tercatat atas namamu. Kode: <b>{code}</b></p>
                  )}
                  <span className="msPlus mt-2 inline-block font-black text-[#EF4444]" style={{ animationIterationCount: 1 }}>−{fmt(item.cost)} poin</span>
                </div>
              )}
            </div>
          </div>

          {/* Bagian bawah kupon (stub) */}
          <div className="rounded-b-3xl border-t-2 border-dashed border-[#F9A8D4] bg-white px-5 pb-5 pt-6" style={notch("top")}>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <p className="text-[11px] font-semibold text-on-surface-variant">Saldo poin</p>
                <p className="flex items-center gap-1 text-lg font-black text-[#B45309]">
                  <span className="material-symbols-outlined text-[20px] text-[#FACC15] drop-shadow-[0_0_6px_rgba(250,204,21,.9)]" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                  {fmt(sp)}
                </p>
              </div>
              {phase === "done" ? (
                <button onClick={onClose} autoFocus className="rounded-full px-6 py-3 font-label-bold text-label-bold text-white shadow-[0_8px_20px_-6px_rgba(236,72,153,.8)] transition-all hover:-translate-y-0.5 active:scale-95" style={{ background: "linear-gradient(90deg,#F59E0B,#F97316,#EC4899)" }}>
                  Selesai
                </button>
              ) : (
                <button
                  onClick={exchange}
                  disabled={!item || item.cost > points || phase !== "pick"}
                  className="rounded-full px-6 py-3 font-label-bold text-label-bold text-white shadow-[0_8px_20px_-6px_rgba(236,72,153,.8)] transition-all hover:-translate-y-0.5 hover:shadow-[0_0_28px_rgba(251,191,36,.9)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                  style={{ background: "linear-gradient(90deg,#F59E0B,#F97316,#EC4899)" }}
                >
                  {phase === "proc" ? "Menukar…" : "Tukar Sekarang"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

/* ============ HALAMAN ============ */
const IDLE_BG = "linear-gradient(135deg,#1D4ED8,#3B82F6)";
const DONE_BG = "linear-gradient(120deg,#38BDF8 0%,#3B82F6 40%,#FACC15 100%)";

export default function Misi() {
  // Data user dari akun yang sedang login (berlaku untuk semua role)
  const [USER, setUser] = useState(() => buildUser(null));
  useEffect(() => {
    let off = false;
    supabase.auth.getUser().then(({ data }) => {
      if (!off) setUser(buildUser(data?.user));
    });
    return () => { off = true; };
  }, []);

  const BOARD = [
    { rank: 1, name: "Budi S.", pts: 2450 },
    { rank: 2, name: "Siti A.", pts: 2100 },
    { rank: 5, name: USER.short, me: true },
  ];

  const [points, setPoints] = useState(1240);
  const [misi, setMisi] = useState(MISI0);
  const [pop, setPop] = useState(null);
  const [medal, setMedal] = useState(null);
  const [glowId, setGlowId] = useState(null);
  const [reward, setReward] = useState(null);
  const [glowBtn, setGlowBtn] = useState(null);
  const [pi, setPi] = useState(0);
  const [avatarOk, setAvatarOk] = useState(true);

  useEffect(() => { setAvatarOk(true); }, [USER.avatar]);

  const shown = useAnimatedNumber(points, { from: 0, duration: 1400 });
  const pct = Math.max(0, Math.min(100, (shown / NEXT_LEVEL_AT) * 100));
  const remain = Math.max(0, NEXT_LEVEL_AT - points);

  useEffect(() => {
    const id = setInterval(() => setPi((i) => (i + 1) % PANTUN.length), 7000);
    return () => clearInterval(id);
  }, []);

  const completeMisi = (m) => {
    if (m.done) return;
    setMisi((l) => l.map((x) => (x.id === m.id ? { ...x, done: true, sub: "Selesai" } : x)));
    setPoints((p) => p + m.pts);
    setPop({ id: m.id, key: Date.now() });
    setTimeout(() => setPop(null), 1300);
  };

  const openMedal = (m) => {
    setGlowId(m.file);
    setTimeout(() => { setMedal(m); setGlowId(null); }, 380);
  };

  const openReward = (kind) => {
    setGlowBtn(kind);
    setTimeout(() => { setReward(kind); setGlowBtn(null); }, 450);
  };

  return (
    <div className="ms-anim mx-auto max-w-275 px-margin-mobile pb-20 pt-15 md:px-gutter">
      <style>{`
        @keyframes msFade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes msFloat { 0%,100% { transform: translateY(0) rotate(-2deg) } 50% { transform: translateY(-9px) rotate(2deg) } }
        @keyframes msHalo { 0%,100% { transform: scale(.9); opacity: .5 } 50% { transform: scale(1.3); opacity: .95 } }
        @keyframes msWave { from { transform: rotate(-12deg) } to { transform: rotate(22deg) } }
        @keyframes msDraw { from { stroke-dashoffset: 1 } to { stroke-dashoffset: 0 } }
        @keyframes msAreaIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes msRing { 0% { r: 7; opacity: .9 } 100% { r: 20; opacity: 0 } }
        @keyframes msSheen { 0%,55% { transform: translateX(-160%) skewX(-20deg) } 100% { transform: translateX(420%) skewX(-20deg) } }
        @keyframes msConf { from { transform: translate(0,0) scale(1) rotate(0); opacity: 1 } to { transform: translate(var(--dx),var(--dy)) scale(.4) rotate(220deg); opacity: 0 } }
        @keyframes msPopIn { 0% { opacity: 0; transform: scale(.6) rotate(-6deg) } 60% { opacity: 1; transform: scale(1.05) rotate(1deg) } 100% { opacity: 1; transform: scale(1) rotate(0) } }
        @keyframes msShake { 0%,100% { transform: translateX(0) } 25% { transform: translateX(-4px) rotate(-1deg) } 75% { transform: translateX(4px) rotate(1deg) } }
        @keyframes msStamp { 0% { opacity: 0; transform: scale(2.4) rotate(-20deg) } 60% { opacity: 1; transform: scale(.9) rotate(-8deg) } 100% { opacity: 1; transform: scale(1) rotate(-8deg) } }
        @keyframes msSpin3d { from { transform: rotateY(0) } to { transform: rotateY(360deg) } }
        @keyframes msGlowMedal { 0%,100% { box-shadow: 0 0 0 0 rgba(250,204,21,0) } 50% { box-shadow: 0 0 34px 12px rgba(250,204,21,.85) } }
        @keyframes msGlowBtn { from { box-shadow: 0 0 0 rgba(253,224,71,0) } to { box-shadow: 0 0 34px 10px rgba(253,224,71,.95) } }
        @keyframes msPop { 0% { transform: scale(1) } 40% { transform: scale(1.04) } 100% { transform: scale(1) } }
        @keyframes msPlus { from { transform: translateY(0); opacity: 1 } to { transform: translateY(-34px); opacity: 0 } }
        @keyframes msSweep { from { transform: translateX(-120%) skewX(-18deg) } to { transform: translateX(380%) skewX(-18deg) } }
        @keyframes msPantun { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: translateY(0) } }

        .msFloat { animation: msFloat 3.2s ease-in-out infinite; }
        .msHalo { animation: msHalo 2.4s ease-in-out infinite; }
        .msDraw { stroke-dasharray: 1; animation: msDraw 1.6s ease-out .3s both; }
        .msAreaIn { animation: msAreaIn 1s ease-out 1.1s both; }
        .msRing { animation: msRing 1.8s ease-out 1.8s infinite; }
        .msSheen { animation: msSheen 3.4s ease-in-out infinite; }
        .msConf { animation: msConf .95s ease-out forwards; }
        .msStamp { animation: msStamp .6s cubic-bezier(.3,1.4,.5,1) .1s both; }
        .msSpin3d { animation: msSpin3d 6s linear infinite; }
        .msGlowMedal { animation: msGlowMedal .45s ease-out; }
        .msGlowBtn { animation: msGlowBtn .35s ease-out forwards; }
        .msPop { animation: msPop .5s ease-out; }
        .msPlus { animation: msPlus 1.1s ease-out forwards; }
        .msSweep { animation: msSweep .9s ease-out forwards; }

        @media (prefers-reduced-motion: reduce) {
          .ms-anim *, .ms-anim { animation: none !important; }
          .ms-anim .msConf { display: none; }
        }
      `}</style>

      {/* Heading di luar box */}
      <Reveal>
        <div className="mb-8 flex flex-wrap items-center justify-center gap-3 text-center">
          <span className="relative grid place-items-center">
            <i className="msHalo absolute inset-0 rounded-full bg-[#FACC15]/60 blur-xl" />
            <span className="msFloat relative"><Bolt3D size={60} /></span>
          </span>
          <h1 className="font-headline-md text-headline-md">
            <span className="text-on-surface">Selamat Datang </span>
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(90deg,#1D4ED8 0%,#3B82F6 35%,#F59E0B 72%,#FACC15 100%)" }}>
              Penjaga Grid!
            </span>
          </h1>
        </div>
      </Reveal>

      {/* Box profil */}
      <Reveal delay={0.05}>
        <div
          className="relative mb-6 overflow-hidden rounded-3xl p-6 text-white"
          style={{
            background: "linear-gradient(135deg,#0A2259 0%,#1D4ED8 55%,#3B82F6 100%)",
            boxShadow: "0 18px 40px -14px rgba(29,78,216,.7), inset 0 1px 0 rgba(255,255,255,.3), inset 0 -3px 0 rgba(0,0,0,.18)",
          }}
        >
          <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-20 left-10 h-48 w-48 rounded-full bg-[#38BDF8]/25 blur-3xl" />
          <div className="relative flex flex-wrap items-center gap-5">
            <div className="rounded-full p-0.75 shadow-[0_0_24px_rgba(250,204,21,.55)]" style={{ background: "linear-gradient(135deg,#FDE047,#F97316)" }}>
              {avatarOk ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={USER.avatar} alt={`Foto profil ${USER.name}`} onError={() => setAvatarOk(false)} className="h-20 w-20 rounded-full bg-white object-cover sm:h-24 sm:w-24" />
              ) : (
                <div className="grid h-20 w-20 place-items-center rounded-full bg-[#1D4ED8] text-3xl font-black sm:h-24 sm:w-24">{USER.name[0]}</div>
              )}
            </div>

            <div className="min-w-55 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-headline-md text-headline-md leading-tight">{USER.name}</h2>
                <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-bold">Level 4 · Penjaga Grid</span>
              </div>
              {USER.username && <p className="text-sm text-white/75">{USER.username}</p>}

              <div className="mt-3 flex items-center justify-between text-sm font-bold">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[22px] text-[#FDE047] drop-shadow-[0_0_8px_rgba(253,224,71,.95)]" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                  {fmt(shown)} poin
                </span>
                <span className="text-white/70">{fmt(NEXT_LEVEL_AT)}</span>
              </div>
              <div className="relative mt-1.5 h-3.5 rounded-full bg-white/20 shadow-inner" role="progressbar" aria-valuemin={0} aria-valuemax={NEXT_LEVEL_AT} aria-valuenow={Math.round(points)} aria-label="Progres poin menuju Level 5">
                <div className="h-full rounded-full shadow-[0_0_14px_rgba(249,115,22,.8)]" style={{ width: `${pct}%`, background: "linear-gradient(90deg,#FDE047,#F59E0B 55%,#EF4444)" }} />
                <span className="material-symbols-outlined pointer-events-none absolute top-1/2 text-[22px] text-[#FDE047] drop-shadow-[0_0_8px_rgba(253,224,71,1)]" style={{ left: `${pct}%`, transform: "translate(-50%,-50%)", fontVariationSettings: "'FILL' 1" }}>bolt</span>
              </div>
            </div>

            <div className="hidden text-right sm:block">
              <p className="text-xs text-white/75">Menuju Level 5</p>
              <p className="font-label-bold text-label-bold">{fmt(remain)} poin lagi</p>
            </div>
          </div>
        </div>
      </Reveal>

      <div className="mb-6 grid gap-6 lg:grid-cols-3">
        {/* Box besar: progress + lencana */}
        <div className="lg:col-span-2">
          <Reveal delay={0.1}>
            <div className="rounded-3xl border border-outline-variant bg-card-surface p-5 shadow-[0_4px_12px_rgba(13,27,42,0.05)]">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h2 className="flex items-center gap-2 font-headline-sm text-headline-sm">
                  <span className="material-symbols-outlined text-[22px] text-[#1D4ED8]">show_chart</span> Progress Poinmu
                </h2>
                <span className="rounded-full bg-linear-to-r from-[#DBEAFE] to-[#FEF3C7] px-3 py-1 text-xs font-bold text-[#1E3A8A]">7 minggu terakhir</span>
              </div>
              <Chart points={points} />

              <div className="mb-2 mt-5 flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-label-bold text-label-bold">
                  <span className="material-symbols-outlined text-[20px] text-[#F59E0B]" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span> Lencana
                </h3>
                <span className="text-xs text-on-surface-variant">{MEDALS.length} lencana · gulir untuk lihat lagi</span>
              </div>
              {/* 3 lencana terlihat, sisanya digulir ke bawah */}
              <div className="relative">
                <div className="grid max-h-44 snap-y snap-mandatory auto-rows-44 grid-cols-3 overflow-y-auto rounded-2xl bg-linear-to-b from-[#F4F8FF] to-white" style={{ scrollbarWidth: "thin" }} tabIndex={0} aria-label="Daftar lencana, gulir ke bawah untuk melihat lebih banyak">
                  {MEDALS.map((m, i) => (
                    <button key={m.file} onClick={() => openMedal(m)} className="group flex snap-start flex-col items-center justify-center gap-2 p-2 outline-none focus-visible:bg-[#EAF2FF]">
                      <span className={`rounded-full transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-110 group-active:scale-95 ${glowId === m.file ? "msGlowMedal" : ""}`}>
                        <Medal m={m} size={84} delay={(i % 3) * 0.5} />
                      </span>
                      <span className="text-xs font-semibold text-on-surface-variant">{medalName(m)}</span>
                    </button>
                  ))}
                </div>
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 rounded-b-2xl bg-linear-to-t from-white to-transparent" />
              </div>
            </div>
          </Reveal>
        </div>

        {/* Kolom kanan: peringkat + misi harian */}
        <div className="flex flex-col gap-6">
          <Reveal delay={0.15}>
            <div className="relative overflow-hidden rounded-3xl p-5 text-white" style={{ background: "linear-gradient(135deg,#1E3A8A,#2563EB 55%,#38BDF8)", boxShadow: "0 16px 32px -14px rgba(37,99,235,.7), inset 0 1px 0 rgba(255,255,255,.3)" }}>
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <p className="font-label-sm text-label-sm text-white/80">Peringkat Kecamatan</p>
                  <div className="flex items-end gap-2">
                    <span className="text-5xl font-black leading-none">#5</span>
                    <span className="mb-1 inline-flex items-center text-xs font-bold text-[#FDE047]">
                      <span className="material-symbols-outlined text-[16px]">arrow_upward</span> naik 2
                    </span>
                  </div>
                </div>

                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={MASCOT_LEADERBOARD}
                  alt="Maskot leaderboard"
                  className="msFloat h-24 w-24 shrink-0 object-contain drop-shadow-[0_8px_10px_rgba(0,0,0,.3)]"
                />
              </div>
              <ul className="mt-3 space-y-1.5">
                {BOARD.map((b) => (
                  <li
                    key={b.rank}
                    className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm ${
                      b.me ? "font-extrabold text-[#0B2A5B] shadow-[0_0_18px_rgba(253,224,71,.75)] ring-2 ring-white/70" : "bg-white/10"
                    }`}
                    style={b.me ? { background: "linear-gradient(90deg,#FDE047,#F59E0B)" } : undefined}
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-5 text-center font-bold">{b.rank}</span>
                      {b.name}
                      {b.me && <span className="rounded-full bg-[#0B2A5B] px-1.5 py-0.5 text-[10px] font-bold text-[#FDE047]">Kamu</span>}
                    </span>
                    <span className="tabular-nums">{fmt(b.me ? points : b.pts)} p</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="rounded-3xl border border-[#BFD7FF] p-5" style={{ background: "linear-gradient(160deg,#EAF2FF,#DCE9FF)" }}>
              <h2 className="mb-2 flex items-center gap-2 font-headline-sm text-headline-sm text-[#1E3A8A]">
                <span className="material-symbols-outlined text-[20px]">checklist</span> Misi Harian
              </h2>
              <p className="mb-3 flex items-start gap-2 rounded-lg bg-white/70 p-2.5 text-xs text-[#33508F]">
                <span className="material-symbols-outlined text-[16px]">info</span>
                Laporan pencegahan dini memberi 2× lebih banyak poin dibanding laporan darurat.
              </p>
              <div className="space-y-2.5">
                {misi.map((m) => {
                  const hit = pop?.id === m.id;
                  return (
                    <button
                      key={m.id}
                      disabled={m.done}
                      onClick={() => completeMisi(m)}
                      aria-label={m.done ? `${m.label}, selesai` : `Selesaikan misi ${m.label}`}
                      className={`relative flex w-full items-center justify-between gap-2 overflow-hidden rounded-xl p-3 text-left text-white transition-all duration-300 ${
                        m.done ? "cursor-default" : "hover:-translate-y-0.5 hover:shadow-[0_10px_20px_-8px_rgba(29,78,216,.85)] active:scale-[.98]"
                      } ${hit ? "msPop" : ""}`}
                      style={{ background: m.done ? DONE_BG : IDLE_BG, boxShadow: m.done ? "0 10px 24px -8px rgba(250,204,21,.8)" : undefined }}
                    >
                      {hit && (
                        <>
                          <span key={`s${pop.key}`} className="msSweep pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-white/50 blur-[2px]" />
                          <Burst n={10} />
                          <span key={`p${pop.key}`} className="msPlus absolute right-3 top-1 text-sm font-black text-[#FDE047] [text-shadow:0_1px_3px_rgba(0,0,0,.4)]">+{m.pts}</span>
                        </>
                      )}
                      <span className="relative flex items-center gap-2">
                        <span className="material-symbols-outlined text-[22px] drop-shadow" style={m.done ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                          {m.done ? "check_circle" : "radio_button_unchecked"}
                        </span>
                        <span>
                          <span className="block font-label-bold text-label-bold [text-shadow:0_1px_3px_rgba(0,0,0,.3)]">{m.label}</span>
                          <span className="block text-xs text-white/85 [text-shadow:0_1px_2px_rgba(0,0,0,.3)]">{m.sub}</span>
                        </span>
                      </span>
                      <span className="relative shrink-0 rounded-full bg-white/25 px-2 py-1 text-xs font-bold">+{m.pts} Poin</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      {/* Tukar reward */}
      <Reveal delay={0.25}>
        <div className="flex flex-col items-center justify-between gap-4 rounded-3xl p-6 text-white md:flex-row" style={{ background: "linear-gradient(110deg,#F97316 0%,#FB7185 55%,#EC4899 100%)", boxShadow: "0 18px 36px -14px rgba(236,72,153,.65), inset 0 1px 0 rgba(255,255,255,.35)" }}>
          <div className="text-center md:text-left">
            <h3 className="font-headline-sm text-headline-sm">Tukar Reward</h3>
            <p className="font-body-md text-body-md text-white/90">Tukarkan poinmu dengan berbagai keuntungan menarik.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => openReward("token")}
              className={`flex items-center gap-2 rounded-full bg-white px-4 py-2.5 font-label-bold text-label-bold text-[#C2410C] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_26px_rgba(253,224,71,.9)] active:scale-95 ${glowBtn === "token" ? "msGlowBtn" : ""}`}
            >
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span> Voucher Token Listrik
            </button>
            <button
              onClick={() => openReward("donasi")}
              className={`flex items-center gap-2 rounded-full bg-white/20 px-4 py-2.5 font-label-bold text-label-bold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-white/30 hover:shadow-[0_0_26px_rgba(253,224,71,.9)] active:scale-95 ${glowBtn === "donasi" ? "msGlowBtn" : ""}`}
            >
              <span className="material-symbols-outlined text-[18px]">volunteer_activism</span> Donasi Lingkungan
            </button>
          </div>
        </div>
      </Reveal>

      {/* Pantun */}
      <Reveal delay={0.3}>
        <div className="mt-5 rounded-2xl border border-[#FBCFE8] bg-linear-to-r from-[#FFF4E8] to-[#FFEFF5] px-5 py-4 text-center">
          <p className="mb-1 flex items-center justify-center gap-1 text-xs font-bold text-[#C2410C]">
            <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span> Pantun Penjaga Grid
          </p>
          <p key={pi} className="whitespace-pre-line text-sm italic leading-relaxed text-[#7C2D12]" style={{ animation: "msPantun .6s ease-out both" }}>
            {PANTUN[pi]}
          </p>
        </div>
      </Reveal>

      {medal && <MedalModal m={medal} onClose={() => setMedal(null)} />}
      {reward && <RewardModal kind={reward} points={points} onRedeem={(c) => setPoints((p) => p - c)} onClose={() => setReward(null)} />}
    </div>
  );
}