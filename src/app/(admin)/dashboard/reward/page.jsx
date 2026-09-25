const kpis = [
  { icon: "group", tone: "text-brand bg-brand/10", label: "Warga Aktif", value: "1.842", sub: "30 hari terakhir" },
  { icon: "photo_camera", tone: "text-accent bg-accent/10", label: "Scan Masuk", value: "5.310", sub: "Tier-1 data" },
  { icon: "stars", tone: "text-risk-waspada bg-risk-waspada/10", label: "Poin Terdistribusi", value: "128rb", sub: "total" },
  { icon: "redeem", tone: "text-risk-aman bg-risk-aman/10", label: "Reward Ditukar", value: "214", sub: "voucher & donasi" },
];
const board = [
  { r: 1, n: "I Wayan S.", p: 2450 }, { r: 2, n: "Kadek A.", p: 2100 },
  { r: 3, n: "Made D.", p: 1870 }, { r: 4, n: "Ni Luh P.", p: 1640 },
];
const rewards = [
  { r: "Voucher Token Listrik 50rb", biaya: "500 poin", stok: 120 },
  { r: "Donasi Program Lingkungan", biaya: "300 poin", stok: "∞" },
  { r: "Merchandise GRID·ID", biaya: "800 poin", stok: 45 },
];

export default function ProgramReward() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-extrabold text-on-surface">Program Reward — Grid Mission</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">Mekanisme insentif warga sebagai sumber data Tier-1 (scan visual). Poin cair setelah laporan tervalidasi.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="flex items-start gap-3 rounded-2xl border border-outline-variant bg-card-surface p-5 shadow-sm">
            <span className={`grid h-11 w-11 place-items-center rounded-xl ${k.tone}`}><span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{k.icon}</span></span>
            <div><p className="font-heading text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">{k.label}</p><p className="font-heading text-3xl font-extrabold text-on-surface">{k.value}</p><p className="font-body-md text-[12px] text-on-surface-variant">{k.sub}</p></div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-outline-variant bg-card-surface p-5 shadow-sm">
          <h2 className="mb-4 font-heading font-bold">Papan Peringkat Warga</h2>
          <ul className="space-y-2">
            {board.map((b) => (
              <li key={b.n} className="flex items-center justify-between rounded-xl bg-surface-container-low p-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-brand/10 font-heading font-bold text-brand">{b.r}</span>
                  <span className="font-heading text-sm font-bold">{b.n}</span>
                </div>
                <span className="font-body-md text-sm text-on-surface-variant">{b.p} poin</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-outline-variant bg-card-surface p-5 shadow-sm">
          <h2 className="mb-4 font-heading font-bold">Katalog Reward</h2>
          <ul className="space-y-2">
            {rewards.map((r) => (
              <li key={r.r} className="flex items-center justify-between rounded-xl border border-outline-variant p-3">
                <div><p className="font-heading text-sm font-bold">{r.r}</p><p className="font-body-md text-[12px] text-accent">{r.biaya}</p></div>
                <span className="font-body-md text-[12px] text-on-surface-variant">Stok: {r.stok}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}