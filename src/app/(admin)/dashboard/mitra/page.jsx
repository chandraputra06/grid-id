const mitra = [
  { n: "PLN UP3 Denpasar", peran: "Unit Distribusi (User utama)", tone: "bg-brand/10 text-brand", wo: 12, status: "Aktif" },
  { n: "PT Kontraktor Bali Terang", peran: "Kontraktor Pemeliharaan", tone: "bg-risk-waspada/10 text-risk-waspada", wo: 8, status: "Aktif" },
  { n: "CSR Bank Daerah", peran: "Mitra Pendanaan (CSR/ESG)", tone: "bg-risk-aman/10 text-risk-aman", wo: 0, status: "Aktif" },
];

export default function PanelMitra() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-extrabold text-on-surface">Panel Mitra</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">PLN, kontraktor, dan mitra CSR yang terhubung dengan GRID·ID.</p>
        </div>
        <button className="flex shrink-0 items-center gap-2 rounded-full bg-brand px-5 py-2.5 font-heading text-sm font-bold text-white"><span className="material-symbols-outlined text-[20px]">add</span>Undang Mitra</button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {mitra.map((m) => (
          <div key={m.n} className="rounded-2xl border border-outline-variant bg-card-surface p-5 shadow-sm">
            <div className="mb-3 flex items-start justify-between">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-surface-container-low"><span className="material-symbols-outlined text-brand">groups</span></span>
              <span className="rounded-full bg-risk-aman/10 px-2.5 py-1 text-[11px] font-bold text-risk-aman">{m.status}</span>
            </div>
            <h3 className="font-heading text-sm font-bold">{m.n}</h3>
            <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-bold ${m.tone}`}>{m.peran}</span>
            <p className="mt-3 font-body-md text-[13px] text-on-surface-variant">Work order aktif: <b className="text-on-surface">{m.wo}</b></p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-outline-variant bg-card-surface p-5 shadow-sm">
        <h2 className="mb-2 font-heading font-bold">Impact Report (untuk Mitra CSR)</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {[["Aset terpantau", "1.240"], ["Warga terlibat", "1.842"], ["Gangguan tercegah (est.)", "38"]].map(([l, v]) => (
            <div key={l} className="rounded-xl bg-surface-container-low p-4 text-center">
              <p className="font-heading text-2xl font-extrabold text-brand">{v}</p>
              <p className="font-body-md text-[12px] text-on-surface-variant">{l}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}