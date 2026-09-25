const integrasi = [
  { n: "MAXIMO", d: "Sinkron output kondisi & ekspor laporan detail", status: "Terhubung", tone: "text-risk-aman", icon: "database" },
  { n: "API BMKG", d: "Prakiraan cuaca per kelurahan (adm4)", status: "Terhubung", tone: "text-risk-aman", icon: "cloud" },
  { n: "PLN Mobile", d: "Kanal input laporan warga (roadmap)", status: "Belum", tone: "text-on-surface-variant", icon: "smartphone" },
];
const ambang = [
  { j: "Trafo ≤ 100 kVA", kritis: "≥ +15°C", waspada: "+8–14°C" },
  { j: "Trafo > 100 kVA", kritis: "≥ +12°C", waspada: "+6–11°C" },
  { j: "Sambungan/Isolator", kritis: "≥ +10°C", waspada: "+5–9°C" },
];

export default function Pengaturan() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-extrabold text-on-surface">Pengaturan</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">Integrasi data, ambang skor risiko, dan preferensi sistem.</p>
      </div>

      <div className="rounded-2xl border border-outline-variant bg-card-surface p-5 shadow-sm">
        <h2 className="mb-4 font-heading font-bold">Integrasi Data</h2>
        <div className="space-y-3">
          {integrasi.map((i) => (
            <div key={i.n} className="flex items-center justify-between rounded-xl border border-outline-variant p-4">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-surface-container-low"><span className="material-symbols-outlined text-brand">{i.icon}</span></span>
                <div><p className="font-heading text-sm font-bold">{i.n}</p><p className="font-body-md text-[12px] text-on-surface-variant">{i.d}</p></div>
              </div>
              <span className={`font-heading text-sm font-bold ${i.tone}`}>{i.status}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-outline-variant bg-card-surface p-5 shadow-sm">
        <div className="mb-2 flex items-center gap-2">
          <h2 className="font-heading font-bold">Ambang Skor Risiko (per jenis aset)</h2>
          <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-bold text-accent">dikalibrasi bersama PLN</span>
        </div>
        <p className="mb-3 font-body-md text-[13px] text-on-surface-variant">Ambang thermal berbeda per jenis & kapasitas aset (mis. Trafo 100 kVA ≠ 160 kVA).</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead><tr className="border-b border-outline-variant font-heading text-[11px] uppercase tracking-wider text-on-surface-variant"><th className="p-3">Jenis Aset</th><th className="p-3">Kritis (ΔT)</th><th className="p-3">Waspada (ΔT)</th></tr></thead>
            <tbody>
              {ambang.map((a) => (
                <tr key={a.j} className="border-b border-outline-variant/60">
                  <td className="p-3 font-bold">{a.j}</td>
                  <td className="p-3"><span className="rounded-full bg-risk-kritis/10 px-2 py-0.5 text-[11px] font-bold text-risk-kritis">{a.kritis}</span></td>
                  <td className="p-3"><span className="rounded-full bg-risk-waspada/10 px-2 py-0.5 text-[11px] font-bold text-risk-waspada">{a.waspada}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}