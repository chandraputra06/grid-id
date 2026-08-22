import { Reveal } from "@/components/motion";

const misi = [
  { label: "Laporan 1 Tiang Miring", sub: "Batas: 2 hari lagi", pts: "+50 Poin", done: false },
  { label: "Validasi Cuaca Lokal", sub: "Selesai", pts: "+20 Poin", done: true },
];
const badges = [
  { icon: "bolt", label: "Mata Elang", active: true },
  { icon: "storm", label: "Pahlawan Badai", active: true },
  { icon: "cable", label: "Deteksi Kabel", active: false },
];
const board = [["1", "Budi S.", "2.450 p"], ["2", "Siti A.", "2.100 p"], ["5", "Anda", "1.240 p"]];

export default function Misi() {
  return (
    <div className="mx-auto max-w-[1000px] px-margin-mobile pb-20 pt-28 md:px-gutter">
      {/* Level card */}
      <Reveal>
        <div className="mb-6 flex items-center gap-5 rounded-2xl border-l-4 border-primary-container bg-card-surface p-6 shadow-[0_4px_12px_rgba(13,27,42,0.05)]">
          <div className="relative grid h-20 w-20 place-items-center rounded-full" style={{ background: "conic-gradient(#1e4fd8 0% 60%, #e0e2e7 60% 100%)" }}>
            <div className="grid h-16 w-16 place-items-center rounded-full bg-card-surface text-center">
              <div>
                <div className="font-label-sm text-[10px] uppercase text-on-surface-variant">Level</div>
                <div className="text-xl font-black text-primary-container">4</div>
              </div>
            </div>
          </div>
          <div className="flex-1">
            <h1 className="font-headline-md text-headline-md">Penjaga Grid</h1>
            <p className="flex items-center gap-1 font-body-md text-body-md text-on-surface-variant">
              <span className="material-symbols-outlined text-[18px] text-secondary-container" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              1.240 poin terkumpul
            </p>
          </div>
          <div className="hidden text-right sm:block">
            <p className="font-label-sm text-label-sm text-on-surface-variant">Menuju Level 5</p>
            <p className="font-label-bold text-label-bold">760 poin lagi</p>
          </div>
        </div>
      </Reveal>

      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Misi minggu ini */}
        <Reveal delay={0.05}>
          <div className="h-full rounded-2xl border border-outline-variant bg-card-surface p-5 shadow-[0_4px_12px_rgba(13,27,42,0.05)]">
            <h2 className="mb-3 flex items-center gap-2 font-headline-sm text-headline-sm">
              <span className="material-symbols-outlined text-[20px] text-primary-container">checklist</span> Misi Minggu Ini
            </h2>
            <p className="mb-4 flex items-start gap-2 rounded-lg bg-surface-container-low p-3 font-label-sm text-label-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-[16px]">info</span>
              Laporan pencegahan dini (sebelum insiden) memberikan 2× lebih banyak poin dibanding laporan darurat.
            </p>
            <div className="space-y-3">
              {misi.map((m) => (
                <div key={m.label} className="flex items-center justify-between rounded-xl border border-outline-variant p-3">
                  <div className="flex items-center gap-2">
                    <span className={`material-symbols-outlined text-[20px] ${m.done ? "text-risk-aman" : "text-outline"}`} style={m.done ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                      {m.done ? "check_circle" : "radio_button_unchecked"}
                    </span>
                    <div>
                      <p className="font-label-bold text-label-bold">{m.label}</p>
                      <p className="font-label-sm text-label-sm text-on-surface-variant">{m.sub}</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-primary-container/10 px-2 py-1 font-label-sm text-label-sm font-bold text-primary-container">{m.pts}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Lencana */}
        <Reveal delay={0.1}>
          <div className="h-full rounded-2xl border border-outline-variant bg-card-surface p-5 shadow-[0_4px_12px_rgba(13,27,42,0.05)]">
            <h2 className="mb-4 flex items-center gap-2 font-headline-sm text-headline-sm">
              <span className="material-symbols-outlined text-[20px] text-secondary-container">military_tech</span> Lencana
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {badges.map((b) => (
                <div key={b.label} className="flex flex-col items-center gap-2 text-center">
                  <div className={`grid h-14 w-14 place-items-center rounded-full ${b.active ? "bg-primary-container text-on-primary" : "bg-surface-container text-outline"}`}>
                    <span className="material-symbols-outlined" style={b.active ? { fontVariationSettings: "'FILL' 1" } : undefined}>{b.active ? b.icon : "lock"}</span>
                  </div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Leaderboard */}
        <Reveal delay={0.15}>
          <div className="h-full rounded-2xl border border-outline-variant bg-card-surface p-5 shadow-[0_4px_12px_rgba(13,27,42,0.05)]">
            <h2 className="mb-4 flex items-center gap-2 font-headline-sm text-headline-sm">
              <span className="material-symbols-outlined text-[20px] text-tertiary">leaderboard</span> Papan Peringkat Kecamatan
            </h2>
            <ul className="space-y-2">
              {board.map(([rank, name, pts]) => (
                <li key={name} className={`flex items-center justify-between rounded-lg p-2 ${name === "Anda" ? "bg-primary-container/10" : ""}`}>
                  <div className="flex items-center gap-3">
                    <span className="w-5 text-center font-label-bold text-label-bold text-on-surface-variant">{rank}</span>
                    <div className="grid h-7 w-7 place-items-center rounded-full bg-surface-container text-xs">{name[0]}</div>
                    <span className={`font-label-bold text-label-bold ${name === "Anda" ? "text-primary-container" : ""}`}>{name}</span>
                  </div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">{pts}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>

      {/* Tukar reward */}
      <Reveal delay={0.2}>
        <div className="flex flex-col items-center justify-between gap-4 rounded-2xl bg-primary-container p-6 text-on-primary md:flex-row">
          <div>
            <h3 className="font-headline-sm text-headline-sm">Tukar Reward</h3>
            <p className="font-body-md text-body-md text-on-primary/80">Tukarkan poinmu dengan berbagai keuntungan menarik.</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 rounded-full bg-card-surface px-4 py-2.5 font-label-bold text-label-bold text-primary-container transition-transform hover:-translate-y-0.5">
              <span className="material-symbols-outlined text-[18px]">bolt</span> Voucher Token Listrik
            </button>
            <button className="flex items-center gap-2 rounded-full bg-on-primary/15 px-4 py-2.5 font-label-bold text-label-bold text-on-primary hover:bg-on-primary/25">
              <span className="material-symbols-outlined text-[18px]">volunteer_activism</span> Donasi Lingkungan
            </button>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
