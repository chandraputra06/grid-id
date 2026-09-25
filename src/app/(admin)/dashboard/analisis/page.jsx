const kpis = [
  { icon: "trending_up", tone: "text-risk-kritis bg-risk-kritis/10", label: "Tren Aset Kritis", value: "+3", sub: "vs bulan lalu" },
  { icon: "percent", tone: "text-brand bg-brand/10", label: "Rata-rata Skor", value: "48%", sub: "seluruh aset" },
  { icon: "neurology", tone: "text-risk-aman bg-risk-aman/10", label: "Akurasi Model AI", value: "86%", sub: "mAP data uji" },
  { icon: "description", tone: "text-accent bg-accent/10", label: "Laporan Bulan Ini", value: "342", sub: "scan masuk" },
];
const tren = [
  { b: "Apr", v: 40 }, { b: "Mei", v: 55 }, { b: "Jun", v: 48 },
  { b: "Jul", v: 62 }, { b: "Ags", v: 58 }, { b: "Sep", v: 74 },
];
const kerusakan = [
  { k: "Korosi", n: 128, c: "bg-risk-kritis" },
  { k: "Kabel kendur", n: 96, c: "bg-risk-waspada" },
  { k: "Vegetasi", n: 74, c: "bg-risk-aman" },
  { k: "Isolator retak", n: 44, c: "bg-brand" },
];
const maxK = Math.max(...kerusakan.map((x) => x.n));

export default function Analisis() {
  const maxV = Math.max(...tren.map((t) => t.v));
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-extrabold text-on-surface">Analisis</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">Insight agregat kondisi aset, tren risiko, dan kinerja model AI.</p>
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

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-outline-variant bg-card-surface p-5 shadow-sm lg:col-span-2">
          <h2 className="mb-4 font-heading font-bold">Tren Aset Kritis (6 Bulan)</h2>
          <div className="flex h-56 items-end justify-between gap-3">
            {tren.map((t) => (
              <div key={t.b} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex w-full items-end justify-center" style={{ height: "180px" }}>
                  <div className="w-8 rounded-t-md bg-brand" style={{ height: `${(t.v / maxV) * 100}%` }} />
                </div>
                <span className="font-body-md text-[12px] text-on-surface-variant">{t.b}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-outline-variant bg-card-surface p-5 shadow-sm">
          <h2 className="mb-4 font-heading font-bold">Distribusi Jenis Kerusakan</h2>
          <div className="space-y-4">
            {kerusakan.map((k) => (
              <div key={k.k}>
                <div className="mb-1 flex justify-between font-body-md text-[13px]"><span>{k.k}</span><b>{k.n}</b></div>
                <div className="h-2 w-full rounded-full bg-surface-container-low">
                  <div className={`h-2 rounded-full ${k.c}`} style={{ width: `${(k.n / maxK) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-outline-variant bg-card-surface p-5 shadow-sm">
        <h2 className="mb-3 font-heading font-bold">Korelasi Cuaca ↔ Gangguan (BMKG)</h2>
        <p className="font-body-md text-body-md text-on-surface-variant">
          72% lonjakan aset kritis terjadi saat prakiraan <b className="text-on-surface">hujan lebat / angin kencang</b>. Faktor cuaca memberi kontribusi rata-rata <b className="text-on-surface">35%</b> pada skor risiko.
        </p>
      </div>
    </div>
  );
}