"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { api } from "@/lib/api";

/* Taruh di folder /public:
   login-img.png (maskot panel Masuk), maskot-daftar.png (maskot panel Daftar),
   maskot-login-loading.png (maskot layar loading) */

const QUOTES = {
  masuk: [
    "Gangguan Bisa Berawal dari Hal Kecil.",
    "Kenali Tandanya Sebelum Terlambat.",
    "Bukan Cuma Melihat, Saatnya Lebih Peduli.",
    "Lingkungan Aman Dimulai dari Sadar Risiko.",
    "Dari Temuanmu, Risiko Lebih Terpetakan.",
    "Kenali Risiko, Nikmati Listrik Lebih Andal.",
  ],
  daftar: [
    "Scan Sekarang, Jadi Bagian dari Perubahan!",
    "Temuanmu Berarti, Yuk Gabung GRID·ID!",
    "Bersama GRID·ID, Kenali Risiko di Sekitarmu!",
    "Kabel Menjuntai? Jangan Cuma Jadi Penonton!",
    "Tiang Miring? Yuk, Kasih Tahu GRID·ID!",
    "Gangguan Besar Bisa Berawal dari Tanda Kecil!",
    "Kenali Risiko Sebelum Menjadi Gangguan Listrik!",
  ],
};

/* ---------- Tema: biru (Masuk) & oranye (Daftar) ---------- */
const THEMES = {
  masuk: {
    grad: "linear-gradient(90deg, #0B2A5B 0%, #1D4ED8 55%, #38BDF8 100%)",
    grad135: "linear-gradient(135deg, #0B2A5B 0%, #1D4ED8 55%, #38BDF8 100%)",
    pageBg: "linear-gradient(160deg, #FFFFFF 0%, #EAF3FF 55%, #CFE5FF 100%)",
    bar: "linear-gradient(90deg, #FEF08A, #FACC15)",
    acc: "#1D4ED8",
    ring: "rgba(56,189,248,0.3)",
    soft: "#F0F9FF",
    sh: "rgba(29,78,216,0.7)",
    sh2: "rgba(56,189,248,0.7)",
    sh3: "rgba(56,189,248,0.95)",
    img: "/login-img.png",
  },
  daftar: {
    grad: "linear-gradient(90deg, #C2410C 0%, #F97316 55%, #FBBF24 100%)",
    grad135: "linear-gradient(135deg, #C2410C 0%, #F97316 55%, #FBBF24 100%)",
    pageBg: "linear-gradient(160deg, #FFFFFF 0%, #FFF4DB 55%, #FFE0A8 100%)",
    bar: "linear-gradient(90deg, #FFFFFF, #FEF08A)",
    acc: "#EA580C",
    ring: "rgba(251,191,36,0.35)",
    soft: "#FFF7ED",
    sh: "rgba(234,88,12,0.7)",
    sh2: "rgba(251,191,36,0.75)",
    sh3: "rgba(251,191,36,1)",
    img: "/maskot-daftar.png",
  },
};

/* ---------- Layar loading: maskot bergerak + GRID·ID ---------- */
function TransitionOverlay({ text, t }) {
  const letters = "GRID·ID".split("");
  return (
    <div
      className="no-motion fixed inset-0 z-100 grid place-items-center overflow-hidden"
      style={{ background: t.grad135, animation: "gridFade 0.4s ease-out both" }}
    >
      {[["12%", "20%", "0s"], ["82%", "16%", ".4s"], ["20%", "78%", ".8s"], ["88%", "70%", ".2s"], ["50%", "10%", ".6s"]].map(([l, tp, d], i) => (
        <span key={i} className="absolute h-3 w-3 rounded-full bg-[#FEF08A] blur-[1px]" style={{ left: l, top: tp, animation: `gridSpark 1.4s ease-in-out ${d} infinite` }} />
      ))}

      <div className="flex flex-col items-center px-6 text-center">
        {/* Maskot: jatuh masuk, lalu memantul dengan efek menyusut/memanjang */}
        <div className="relative" style={{ animation: "gridDrop 0.9s cubic-bezier(.3,1.3,.5,1) both" }}>
          <div
            className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/30 blur-2xl"
            style={{ animation: "haloPulse 1.6s ease-in-out infinite" }}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/maskot-login-loading.png"
            alt=""
            className="relative h-44 w-auto object-contain drop-shadow-[0_12px_20px_rgba(0,0,0,0.3)]"
            style={{ transformOrigin: "50% 100%", animation: "mascotBounce 1.1s ease-in-out 0.9s infinite" }}
          />
          <div
            className="mx-auto -mt-1 h-3 w-24 rounded-full bg-black/30 blur-sm"
            style={{ animation: "shadowPulse 1.1s ease-in-out 0.9s infinite" }}
          />
        </div>

        <div className="mt-4 flex text-5xl font-black tracking-wide text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.35)]">
          {letters.map((ch, i) => (
            <span
              key={i}
              className={ch === "·" ? "text-[#FEF08A]" : ""}
              style={{ animation: `gridPop 0.5s cubic-bezier(.3,1.4,.5,1) ${0.7 + i * 0.09}s both` }}
            >
              {ch}
            </span>
          ))}
        </div>

        <p className="mt-3 text-sm font-semibold text-white/90" style={{ animation: "gridFade 0.6s ease-out 1.4s both" }}>{text}</p>

        <div className="mt-5 h-2 w-56 overflow-hidden rounded-full bg-white/25">
          <div className="h-full rounded-full shadow-[0_0_12px_rgba(255,255,255,0.8)]" style={{ background: t.bar, animation: "gridBar 2.2s ease-in-out 0.3s both" }} />
        </div>
      </div>
    </div>
  );
}

// Animasi masuk berurutan untuk elemen form
const rise = (n) => ({ animation: `riseIn 0.7s cubic-bezier(.16,1,.3,1) ${0.55 + n * 0.07}s both` });

export default function Masuk() {
  const router = useRouter();
  const [mode, setMode] = useState("masuk");
  const [leaving, setLeaving] = useState(null);
  const [quote, setQuote] = useState("");
  const [intro, setIntro] = useState(false); // true setelah animasi masuk awal selesai

  // --- Auth state ---
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const t = THEMES[mode];

  // Kutipan acak, diganti setiap kali tab Masuk/Daftar berubah
  useEffect(() => {
    const list = QUOTES[mode];
    setQuote(list[Math.floor(Math.random() * list.length)]);
  }, [mode]);

  useEffect(() => {
    const id = setTimeout(() => setIntro(true), 1900);
    return () => clearTimeout(id);
  }, []);

  const go = (href, text) => {
    if (leaving) return;
    setLeaving(text);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setTimeout(() => router.push(href), reduce ? 300 : 2600);
  };

  // Masuk / Daftar -> Supabase Auth, lalu arahkan sesuai role.
  async function submit() {
    if (busy || leaving) return;
    setErr("");
    if (!email || !password) {
      setErr("Email dan kata sandi wajib diisi.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "masuk") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (!data.session) {
          setBusy(false);
          setMode("masuk");
          setErr("Pendaftaran berhasil. Cek email untuk verifikasi, lalu masuk.");
          return;
        }
      }
      // Sesi aktif -> tentukan role dari backend, lalu arahkan.
      let role = "warga";
      try {
        const me = await api.get("/api/me");
        role = me.role || "warga";
      } catch {
        // abaikan; default warga
      }
      if (role === "admin" || role === "petugas") go("/dashboard", "Menyiapkan dashboard…");
      else go("/lapor", "Menyiapkan laporanmu…");
    } catch (e) {
      setBusy(false);
      setErr(e?.message || "Gagal masuk. Periksa email/kata sandi.");
    }
  }

  return (
    <div
      className="fixed inset-0 z-40 overflow-y-auto bg-white"
      style={{ "--acc": t.acc, "--ring": t.ring, "--soft": t.soft, "--sh": t.sh, "--sh2": t.sh2, "--sh3": t.sh3 }}
    >
      <style>{`
        @keyframes gridFade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes gridDrop { 0% { transform: translateY(-140%) scale(.8); opacity: 0 } 55% { transform: translateY(12%) scale(1.05); opacity: 1 } 75% { transform: translateY(-6%) } 100% { transform: translateY(0) } }
        @keyframes mascotBounce {
          0%, 100% { transform: translateY(0) scale(1, 1) rotate(-3deg) }
          20% { transform: translateY(0) scale(1.08, .92) rotate(0deg) }
          50% { transform: translateY(-28px) scale(.95, 1.06) rotate(3deg) }
          80% { transform: translateY(0) scale(1.06, .94) rotate(-1deg) }
        }
        @keyframes shadowPulse { 0%, 100% { transform: scaleX(1); opacity: .9 } 50% { transform: scaleX(.6); opacity: .5 } }
        @keyframes haloPulse { 0%, 100% { opacity: .5; transform: translate(-50%, -50%) scale(.9) } 50% { opacity: .9; transform: translate(-50%, -50%) scale(1.15) } }
        @keyframes gridPop { 0% { transform: translateY(24px) scale(.4); opacity: 0 } 70% { transform: translateY(-6px) scale(1.15); opacity: 1 } 100% { transform: translateY(0) scale(1); opacity: 1 } }
        @keyframes gridBar { from { width: 0 } to { width: 100% } }
        @keyframes gridSpark { 0%, 100% { opacity: .2; transform: scale(.6) } 50% { opacity: 1; transform: scale(1.2) } }

        @keyframes cardEnter { from { opacity: 0; transform: translateY(28px) scale(.97) } to { opacity: 1; transform: translateY(0) scale(1) } }
        @keyframes panelReveal { from { clip-path: inset(0 100% 0 0) } to { clip-path: inset(0 0 0 0) } }
        @keyframes sheen { from { transform: translateX(-120%) skewX(-18deg) } to { transform: translateX(320%) skewX(-18deg) } }
        @keyframes riseIn { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes mascotIn { from { opacity: 0; transform: translateY(18px) scale(.94) } to { opacity: 1; transform: translateY(0) scale(1) } }
        @keyframes mascotFloat { 0%, 100% { transform: translateY(0) rotate(-1.5deg) } 50% { transform: translateY(-8px) rotate(1.5deg) } }
        @keyframes quoteIn { from { opacity: 0; transform: translateY(6px) } to { opacity: 1; transform: translateY(0) } }

        .fld:focus { border-color: var(--acc); box-shadow: 0 0 0 4px var(--ring); }
        .tab-off:hover { color: var(--acc); }
        .btn-alt:hover { border-color: var(--sh2); background: var(--soft); box-shadow: 0 8px 18px -6px var(--sh2); }

        @media (prefers-reduced-motion: reduce) {
          .no-motion, .no-motion * { animation: none !important; }
        }
      `}</style>

      {leaving && <TransitionOverlay text={leaving} t={t} />}

      {/* Background gradien lembut: putih -> biru (Masuk) / kuning-oranye (Daftar) */}
      {Object.entries(THEMES).map(([k, th]) => (
        <div
          key={k}
          className="pointer-events-none absolute inset-0 transition-opacity duration-1000"
          style={{ background: th.pageBg, opacity: mode === k ? 1 : 0 }}
          aria-hidden
        />
      ))}

      <div className="relative z-10 grid min-h-full place-items-center px-4 py-10">
        <div
          className="no-motion grid w-full max-w-4xl overflow-hidden rounded-3xl border border-white/70 bg-white/90 shadow-[0_24px_60px_-12px_var(--sh)] backdrop-blur-md transition-shadow duration-700 md:grid-cols-[1fr_1.1fr]"
          style={{ animation: "cardEnter 0.9s cubic-bezier(.16,1,.3,1) both" }}
        >
          {/* Kolom kiri */}
          <div
            className="relative hidden flex-col items-center justify-center gap-5 overflow-hidden p-8 md:flex"
            style={{ animation: "panelReveal 1s cubic-bezier(.77,0,.18,1) 0.2s both" }}
          >
            {/* Gradien panel (cross-fade biru <-> oranye) */}
            {Object.entries(THEMES).map(([k, th]) => (
              <div
                key={k}
                className="absolute inset-0 transition-opacity duration-700"
                style={{ background: th.grad135, opacity: mode === k ? 1 : 0 }}
                aria-hidden
              />
            ))}
            <span
              className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-linear-to-r from-transparent via-white/25 to-transparent"
              style={{ animation: "sheen 1.4s ease-in-out 1s both" }}
              aria-hidden
            />

            <p
              key={`${mode}-${quote}`}
              className="relative max-w-70 text-balance text-center text-sm font-semibold leading-snug text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.35)]"
              style={{ animation: `quoteIn 0.7s ease-out ${intro ? 0.1 : 1.2}s both`, minHeight: "2.5rem" }}
            >
              {quote}
            </p>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={mode}
              src={t.img}
              alt={mode === "masuk" ? "Maskot GRID·ID" : "Maskot pendaftaran GRID·ID"}
              className="relative max-h-80 w-full object-contain drop-shadow-[0_14px_24px_rgba(0,0,0,0.35)]"
              style={{ animation: `mascotIn 0.9s cubic-bezier(.16,1,.3,1) ${intro ? 0 : 0.9}s both, mascotFloat 3.2s ease-in-out ${intro ? 0.9 : 1.8}s infinite` }}
            />
          </div>

          {/* Kolom form */}
          <div className="p-6 sm:p-8 md:pl-10">
            <div className="text-center" style={rise(0)}>
              <h1 className="font-headline-sm text-headline-sm">Selamat datang di GRID·ID</h1>
              <p className="mt-1 font-body-md text-body-md text-on-surface-variant">Pantau risiko listrik di lokasimu.</p>
            </div>

            <div className="mt-6 flex rounded-full border border-outline-variant bg-surface-container-low p-1 font-label-bold text-label-bold" style={rise(1)}>
              {[["masuk", "Masuk"], ["daftar", "Daftar"]].map(([k, label]) => (
                <button
                  key={k}
                  onClick={() => { setMode(k); setErr(""); }}
                  className={`flex-1 rounded-full py-2 transition-all duration-300 ${
                    mode === k ? "text-white shadow-[0_6px_14px_-4px_var(--sh)]" : "tab-off text-on-surface-variant"
                  }`}
                  style={mode === k ? { background: t.grad } : undefined}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="mt-5 space-y-3">
              <div style={rise(2)}>
                <label className="mb-1 block font-label-sm text-label-sm text-on-surface-variant">Email</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-outline">mail</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Masukkan email Anda"
                    className="fld w-full rounded-xl border border-outline-variant bg-white/80 py-2.5 pl-10 pr-4 font-body-md text-body-md outline-none transition-all"
                  />
                </div>
              </div>
              <div style={rise(3)}>
                <label className="mb-1 block font-label-sm text-label-sm text-on-surface-variant">Kata Sandi</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-outline">lock</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && submit()}
                    placeholder="Masukkan kata sandi"
                    className="fld w-full rounded-xl border border-outline-variant bg-white/80 py-2.5 pl-10 pr-4 font-body-md text-body-md outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {err && (
              <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-center text-[13px] font-semibold text-red-600">
                {err}
              </p>
            )}

            <div style={rise(4)}>
              <button
                onClick={submit}
                disabled={busy}
                className="group relative mt-5 flex w-full items-center justify-center gap-2 overflow-hidden rounded-full py-3 font-label-bold text-label-bold text-white shadow-[0_8px_20px_-6px_var(--sh)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_30px_-4px_var(--sh),0_0_26px_var(--sh2)] active:translate-y-0 active:scale-95 active:shadow-[0_0_34px_var(--sh3)] disabled:opacity-60"
                style={{ background: t.grad }}
              >
                <span className="pointer-events-none absolute inset-y-0 -left-full w-1/2 -skew-x-12 bg-white/35 transition-all duration-700 group-hover:left-[150%]" />
                <span className="relative">{busy ? "Memproses…" : "Lanjutkan"}</span>
                <span className="material-symbols-outlined relative text-[18px] transition-transform duration-300 group-hover:translate-x-1">arrow_forward</span>
              </button>
            </div>

            <div className="my-4 flex items-center gap-3 font-label-sm text-label-sm text-on-surface-variant" style={rise(5)}>
              <span className="h-px flex-1 bg-outline-variant" /> ATAU <span className="h-px flex-1 bg-outline-variant" />
            </div>

            <div style={rise(6)}>
              <button className="btn-alt flex w-full items-center justify-center gap-2 rounded-full border border-outline-variant bg-white/80 py-3 font-label-bold text-label-bold transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-95">
               <div className="flex items-center gap-2">
                  <img
                    src="/google.png"
                    alt="Google"
                    className="h-4.5 w-4.5 object-contain"
                  />
                </div>
                {mode === "masuk" ? "Masuk dengan Google" : "Daftar dengan Google"}
              </button>
            </div>

            <div style={rise(7)}>
              <button
                onClick={() => go("/peta-publik", "Membuka peta publik…")}
                className="mt-4 block w-full text-center font-label-sm text-label-sm font-semibold hover:underline"
                style={{ color: t.acc }}
              >
                Lewati dulu, lihat Peta Publik
              </button>

              <div className="mt-6 flex justify-center gap-1.5">
                <span className="h-1.5 w-6 rounded-full" style={{ background: t.grad }} />
                <span className="h-1.5 w-1.5 rounded-full bg-outline-variant" />
                <span className="h-1.5 w-1.5 rounded-full bg-outline-variant" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}