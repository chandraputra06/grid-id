const sumber = [
  { icon: "photo_camera", tone: "text-brand", title: "Scan Visual (RGB)", body: "YOLOv8: kabel kendur (conf 0.86) + korosi ringan pada terminal.", roadmap: false, box: "border-outline-variant" },
  { icon: "device_thermostat", tone: "text-risk-kritis", title: "Thermal (titik panas)", body: "Hotspot terminal +18°C dari ambang jenis Trafo 100 kVA.", roadmap: true, box: "border-outline-variant" },
  { icon: "rainy", tone: "text-risk-waspada", title: "Cuaca BMKG", body: "Prakiraan hujan lebat + angin 32 km/j (3 hari ke depan).", roadmap: false, box: "border-outline-variant" },
  { icon: "database", tone: "text-accent", title: "Output MAXIMO", body: "Skor: BURUK · pemeliharaan terjadwal 6 bln lagi (tanpa detail %).", roadmap: false, box: "border-accent/40 bg-accent/5" },
];

export default function DetailAset() {
  return (
    <div className="space-y-6">
      <div>
        <p className="flex items-center gap-1 font-body-md text-[13px] text-on-surface-variant">
          <a href="/dashboard/prioritas" className="hover:text-brand">Prioritas Aset</a>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span> Trafo TR-104
        </p>
        <h1 className="mt-1 font-heading text-2xl font-extrabold text-on-surface">Detail Aset — Trafo TR-104 (Cawang)</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">Fusion scan + BMKG + thermal + MAXIMO per identitas aset — decision-support untuk PLN.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border-2 border-brand bg-card-surface shadow-sm">
        <div className="flex items-center justify-between bg-brand px-5 py-3 text-white">
          <h2 className="flex items-center gap-2 font-heading font-extrabold"><span className="material-symbols-outlined">inventory_2</span>Ringkasan Kondisi</h2>
          <span className="rounded-full bg-white/20 px-3 py-1 text-xs">Prioritas #1 · Kritis</span>
        </div>
        <div className="grid gap-5 p-5 lg:grid-cols-3">
          <div className="space-y-4">
            <div className="rounded-xl bg-surface-container-low p-4">
              <p className="mb-2 font-heading text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Identitas Aset</p>
              <div className="space-y-1 text-sm">
                {[["Nama/Kode", "Trafo TR-104"], ["Kapasitas", "100 kVA"], ["Feeder", "Cawang"], ["Koordinat", "-8.6705, 115.2412"]].map(([k, v]) => (
                  <div key={k} className="flex justify-between"><span className="text-on-surface-variant">{k}</span><b>{v}</b></div>
                ))}
              </div>
            </div>
            <div className="rounded-xl bg-surface-container-low p-4 text-center">
              <p className="mb-2 font-heading text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Kondisi GRID·ID</p>
              <div className="relative mx-auto grid h-36 w-36 place-items-center rounded-full" style={{ background: "conic-gradient(#E5484D 0% 78%, #e0e2e7 78% 100%)" }}>
                <div className="grid h-28 w-28 place-items-center rounded-full bg-card-surface">
                  <div>
                    <div className="font-heading text-4xl font-extrabold">78<span className="text-lg">%</span></div>
                    <div className="text-[11px] text-on-surface-variant">kondisi buruk</div>
                  </div>
                </div>
              </div>
              <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-risk-kritis/10 px-3 py-1 text-xs font-bold text-risk-kritis">
                <span className="material-symbols-outlined text-[16px]">warning</span>Toleransi: Tangani &lt; 24 jam
              </div>
            </div>
          </div>

          <div className="space-y-4 lg:col-span-2">
            <p className="font-heading text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Sumber Data yang Digabung (per identitas aset)</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {sumber.map((s) => (
                <div key={s.title} className={`relative rounded-xl border p-4 ${s.box}`}>
                  {s.roadmap && <span className="absolute right-3 top-3 rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold text-accent">ROADMAP</span>}
                  <div className="mb-1 flex items-center gap-2">
                    <span className={`material-symbols-outlined text-[20px] ${s.tone}`}>{s.icon}</span>
                    <b className="font-heading text-sm">{s.title}</b>
                  </div>
                  <p className="font-body-md text-[13px] text-on-surface-variant">{s.body}</p>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-accent/40 bg-accent/5 p-4">
              <p className="mb-2 flex items-center gap-1 font-heading text-sm font-bold text-accent">
                <span className="material-symbols-outlined text-[18px]">difference</span>Yang GRID·ID tambahkan (gap MAXIMO)
              </p>
              <div className="grid gap-3 text-[13px] sm:grid-cols-2">
                <div className="rounded-lg bg-card-surface p-3">
                  <p className="mb-1 text-on-surface-variant">MAXIMO</p>
                  <p><b>"Buruk"</b> — tanpa persen, tanpa toleransi, tidak bisa mengurutkan prioritas antar-aset.</p>
                </div>
                <div className="rounded-lg bg-card-surface p-3">
                  <p className="mb-1 text-on-surface-variant">GRID·ID</p>
                  <p><b>78% — Kritis</b>, tangani &lt;24 jam karena <b>kabel kendur + hotspot + cuaca buruk</b> bertumpuk. Prioritas <b>#1</b> dari 1.240 aset.</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button className="flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 font-heading text-sm font-bold text-white">
                <span className="material-symbols-outlined text-[18px]">assignment</span>Terbitkan Work Order
              </button>
              <button className="flex items-center gap-2 rounded-full border border-outline-variant px-5 py-2.5 font-heading text-sm font-bold">
                <span className="material-symbols-outlined text-[18px]">ios_share</span>Ekspor ke MAXIMO
              </button>
              <span className="flex items-center gap-1 self-center font-body-md text-[12px] text-on-surface-variant">
                <span className="material-symbols-outlined text-[16px] text-accent">graphic_eq</span>Roadmap: parameter <b>partial discharge (noise)</b> menyusul.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}