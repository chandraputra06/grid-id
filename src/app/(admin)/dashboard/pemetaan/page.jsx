const jenis = [
  { j: "Trafo", n: 420, icon: "transform" },
  { j: "Gardu", n: 156, icon: "electrical_services" },
  { j: "Tiang", n: 560, icon: "cell_tower" },
  { j: "SUTET", n: 104, icon: "bolt" },
];
const aset = [
  { kode: "TR-104", nama: "Trafo TR-104", kap: "100 kVA", koord: "-8.6705, 115.2412", sync: true },
  { kode: "GD-212", nama: "Gardu GD-212", kap: "20 kV", koord: "-8.7210, 115.2350", sync: true },
  { kode: "TG-556", nama: "Tiang TG-556", kap: "—", koord: "-8.7050, 115.2280", sync: false },
  { kode: "TR-088", nama: "Trafo TR-088", kap: "160 kVA", koord: "-8.6620, 115.2400", sync: true },
];

export default function PemetaanGrid() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-extrabold text-on-surface">Pemetaan Grid</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">Registri aset — setiap aset wajib punya identitas (nama + koordinat) agar dapat disinkronkan dengan MAXIMO.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {jenis.map((j) => (
          <div key={j.j} className="flex items-center gap-3 rounded-2xl border border-outline-variant bg-card-surface p-5 shadow-sm">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand/10"><span className="material-symbols-outlined text-brand">{j.icon}</span></span>
            <div><p className="font-heading text-2xl font-extrabold text-on-surface">{j.n}</p><p className="font-body-md text-[12px] text-on-surface-variant">{j.j}</p></div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-outline-variant bg-accent/5 p-4 flex items-center gap-3">
        <span className="material-symbols-outlined text-accent">info</span>
        <p className="font-body-md text-[13px] text-on-surface-variant"><b className="text-on-surface">1.116 dari 1.240 aset</b> sudah memiliki identitas lengkap (nama + koordinat). 124 aset perlu dilengkapi agar bisa dikoordinasikan dengan MAXIMO.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-outline-variant bg-card-surface shadow-sm">
        <div className="border-b border-outline-variant p-4"><h2 className="font-heading font-bold">Daftar Aset</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-outline-variant font-heading text-[11px] uppercase tracking-wider text-on-surface-variant">
                <th className="p-4">Kode</th><th className="p-4">Nama Aset</th><th className="p-4">Kapasitas</th><th className="p-4">Koordinat</th><th className="p-4">Sinkron MAXIMO</th>
              </tr>
            </thead>
            <tbody>
              {aset.map((a) => (
                <tr key={a.kode} className="border-b border-outline-variant/60 hover:bg-surface-container-low">
                  <td className="p-4 font-heading font-bold text-brand">{a.kode}</td>
                  <td className="p-4">{a.nama}</td>
                  <td className="p-4 text-on-surface-variant">{a.kap}</td>
                  <td className="p-4 font-body-md text-[12px] text-on-surface-variant">{a.koord}</td>
                  <td className="p-4">
                    {a.sync
                      ? <span className="inline-flex items-center gap-1 rounded-full bg-risk-aman/10 px-2.5 py-1 text-[11px] font-bold text-risk-aman"><span className="material-symbols-outlined text-[14px]">check_circle</span>Tersinkron</span>
                      : <span className="inline-flex items-center gap-1 rounded-full bg-risk-waspada/10 px-2.5 py-1 text-[11px] font-bold text-risk-waspada"><span className="material-symbols-outlined text-[14px]">error</span>Belum lengkap</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}