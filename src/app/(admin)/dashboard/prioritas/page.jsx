const assets = [
  { p: 1, n: "Trafo TR-104", loc: "Cawang · -8.6705, 115.2412", mx: "BURUK", mxc: "kritis", g: 78, lvl: "Kritis", lc: "kritis", f: ["Kabel kendur", "Hotspot +18°C", "Hujan lebat (BMKG)"] },
  { p: 2, n: "Gardu GD-212", loc: "Sesetan · -8.7210, 115.2350", mx: "SEDANG", mxc: "waspada", g: 61, lvl: "Waspada", lc: "waspada", f: ["Korosi sedang", "Angin kencang (BMKG)"] },
  { p: 3, n: "Tiang TG-556", loc: "Pedungan · -8.7050, 115.2280", mx: "SEDANG", mxc: "waspada", g: 44, lvl: "Waspada", lc: "waspada", f: ["Vegetasi dekat kabel"] },
  { p: 4, n: "Trafo TR-088", loc: "Renon · -8.6620, 115.2400", mx: "BAIK", mxc: "aman", g: 22, lvl: "Aman", lc: "aman", f: ["Kondisi normal"] },
];
const tone = {
  kritis: "text-risk-kritis bg-risk-kritis/10",
  waspada: "text-risk-waspada bg-risk-waspada/10",
  aman: "text-risk-aman bg-risk-aman/10",
};
const kpis = [
  { icon: "warning", tone: "text-risk-kritis bg-risk-kritis/10", label: "Aset Kritis", value: "3", sub: "Tangani < 24 jam" },
  { icon: "schedule", tone: "text-risk-waspada bg-risk-waspada/10", label: "Perlu Dijadwalkan", value: "12", sub: "Waspada" },
  { icon: "difference", tone: "text-brand bg-brand/10", label: "Selisih vs MAXIMO", value: "8", sub: "aset naik prioritas" },
  { icon: "inventory_2", tone: "text-risk-aman bg-risk-aman/10", label: "Aset Terpantau", value: "1.240", sub: "Feeder Denpasar" },
];

export default function PrioritasAset() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-extrabold text-on-surface">Prioritas Antar-Aset</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          GRID·ID menggabungkan scan visual, cuaca BMKG, thermal, dan output MAXIMO per identitas aset — menghasilkan skor detail (%) dan urutan prioritas yang tidak dimiliki MAXIMO.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="flex items-start gap-3 rounded-2xl border border-outline-variant bg-card-surface p-5 shadow-sm">
            <span className={`grid h-11 w-11 place-items-center rounded-xl ${k.tone}`}>
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{k.icon}</span>
            </span>
            <div>
              <p className="font-heading text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">{k.label}</p>
              <p className="font-heading text-3xl font-extrabold text-on-surface">{k.value}</p>
              <p className="font-body-md text-[12px] text-on-surface-variant">{k.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-outline-variant bg-card-surface shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant p-4">
          <h2 className="font-heading font-bold">Daftar Prioritas — GRID·ID vs MAXIMO</h2>
          <span className="flex items-center gap-1 font-body-md text-[12px] text-on-surface-variant">
            <span className="material-symbols-outlined text-[16px] text-accent">info</span>
            MAXIMO hanya beri "baik/buruk"; GRID·ID beri % + urutan.
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead>
              <tr className="border-b border-outline-variant font-heading text-[11px] uppercase tracking-wider text-on-surface-variant">
                <th className="p-4">#</th>
                <th className="p-4">Aset (Nama · Koordinat)</th>
                <th className="p-4">Skor MAXIMO</th>
                <th className="p-4">Skor GRID·ID</th>
                <th className="p-4">Faktor Pendorong</th>
                <th className="p-4">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((a) => (
                <tr key={a.n} className={`border-b border-outline-variant/60 hover:bg-surface-container-low ${a.p === 1 ? "bg-brand/5" : ""}`}>
                  <td className="p-4">
                    <span className={`grid h-7 w-7 place-items-center rounded-full font-heading font-bold ${tone[a.lc]}`}>{a.p}</span>
                  </td>
                  <td className="p-4">
                    <p className="font-heading font-bold">{a.n}</p>
                    <p className="font-body-md text-[12px] text-on-surface-variant">{a.loc}</p>
                  </td>
                  <td className="p-4">
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${tone[a.mxc]}`}>{a.mx}</span>
                    <p className="mt-1 font-body-md text-[11px] text-on-surface-variant">baik/buruk saja</p>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <b className="font-heading text-lg">{a.g}%</b>
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${tone[a.lc]}`}>{a.lvl}</span>
                    </div>
                  </td>
                  <td className="p-4 font-body-md text-[12px] text-on-surface-variant">
                    {a.f.map((x) => (
                      <span key={x} className="mb-1 mr-1 inline-block rounded bg-surface-container-low px-2 py-0.5">{x}</span>
                    ))}
                  </td>
                  <td className="p-4">
                    <a href="/dashboard/gardu" className="font-heading text-sm font-bold text-brand hover:underline">Detail →</a>
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