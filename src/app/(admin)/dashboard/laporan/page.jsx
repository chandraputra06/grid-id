const cards = [
  { value: "12", label: "Laporan Kritis Menunggu", tag: "HARI INI", tagTone: "bg-risk-kritis/10 text-risk-kritis", icon: "warning", iconTone: "text-risk-kritis" },
  { value: "45", label: "Jadwal Pemeliharaan Aktif", tag: "MINGGU INI", tagTone: "bg-risk-waspada/10 text-risk-waspada", icon: "engineering", iconTone: "text-risk-waspada" },
  { value: "Badai Ringan", label: "Beban Puncak Jawa-Bali", tag: "AI PREDIKSI", tagTone: "bg-brand/10 text-brand", icon: "insights", iconTone: "text-brand", small: true },
];

const rows = [
  { id: "RPT-2025-089", jenis: "Pemeliharaan Korektif", aset: "Gardu Induk Cawang", loc: "Jawa-Bali · Trafo Unit 2", desc: "Kebocoran oli pada bushing transformer, terdeteksi penurunan tekanan signifikan.", level: "KRITIS", tone: "bg-risk-kritis", time: "Hari ini, 14:00 WIB", timeTone: "text-risk-kritis" },
  { id: "RPT-2025-092", jenis: "Inspeksi Rutin", aset: "SUTET 500kV Ungaran", loc: "Jawa-Bali · Tower 45-50", desc: "Jarak bebas kendor (sagging) mendekati batas toleransi vegetasi di bawah jalur.", level: "WASPADA", tone: "bg-risk-waspada", time: "Besok, 08:00 WIB", timeTone: "text-on-surface-variant" },
  { id: "RPT-2025-085", jenis: "Pemeliharaan Preventif", aset: "PLTU Paiton Unit 9", loc: "Jawa-Bali · Sistem Pendingin", desc: "Penggantian filter sirkulasi air pendingin sesuai jadwal operasional tahunan.", level: "AMAN", tone: "bg-risk-aman", time: "24 Nov 2025", timeTone: "text-on-surface-variant" },
  { id: "RPT-2025-097", jenis: "Monitoring AI", aset: "Substasi Balikpapan", loc: "Kalimantan · Switchgear B", desc: "Peningkatan suhu terminal koneksi terdeteksi oleh sensor termal IoT (+15% dari baseline).", level: "WASPADA", tone: "bg-risk-waspada", time: "Dalam 48 Jam", timeTone: "text-on-surface-variant" },
];

export default function AdminLaporan() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-extrabold text-on-surface">Laporan Pemeliharaan &amp; Risiko</h1>
          <p className="max-w-2xl font-body-md text-body-md text-on-surface-variant">Prioritaskan tindakan atas status kritis untuk meminimalkan gangguan jaringan.</p>
        </div>
        <button className="flex shrink-0 items-center gap-2 rounded-full bg-brand px-5 py-2.5 font-heading text-sm font-bold text-white transition-transform hover:-translate-y-0.5">
          <span className="material-symbols-outlined text-[20px]">add</span> Lapor Temuan
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((c, ci) => (
          <div key={c.label} className={`rounded-2xl border bg-card-surface p-5 shadow-sm ${ci === 2 ? "border-brand ring-1 ring-brand" : "border-outline-variant"}`}>
            <div className="flex items-start justify-between">
              <span className={`material-symbols-outlined ${c.iconTone}`} style={{ fontVariationSettings: "'FILL' 1" }}>{c.icon}</span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${c.tagTone}`}>{c.tag}</span>
            </div>
            <div className={`mt-2 font-heading font-extrabold text-on-surface ${c.small ? "text-xl" : "text-4xl"}`}>{c.value}</div>
            <p className="mt-1 font-body-md text-[13px] text-on-surface-variant">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-outline-variant bg-card-surface shadow-sm">
        <div className="flex flex-wrap items-center gap-2 border-b border-outline-variant p-4">
          <button className="flex items-center gap-1 rounded-full border border-outline-variant px-3 py-1.5 font-heading text-xs font-bold text-on-surface-variant">Semua Wilayah <span className="material-symbols-outlined text-[16px]">expand_more</span></button>
          {["Semua Status", "Kritis", "Waspada", "Aman"].map((t, i) => (
            <button key={t} className={`rounded-full px-4 py-1.5 font-heading text-xs font-bold ${i === 0 ? "bg-brand text-white" : "bg-surface-container-low text-on-surface-variant"}`}>{t}</button>
          ))}
          <span className="ml-auto flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant"><span className="material-symbols-outlined text-[16px]">swap_vert</span> Urutkan: Tanggal</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left">
            <thead>
              <tr className="border-b border-outline-variant font-heading text-[11px] uppercase tracking-wider text-on-surface-variant">
                <th className="p-4">ID Laporan</th>
                <th className="p-4">Lokasi / Aset</th>
                <th className="p-4">Deskripsi Masalah</th>
                <th className="p-4">Tingkat Risiko</th>
                <th className="p-4">Tanggal / Waktu</th>
                <th className="p-4">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-outline-variant/60 align-top">
                  <td className="p-4">
                    <p className="font-heading text-sm font-bold text-brand">{r.id}</p>
                    <p className="font-body-md text-[12px] text-on-surface-variant">{r.jenis}</p>
                  </td>
                  <td className="p-4">
                    <p className="font-body-md text-[13px] font-semibold text-on-surface">{r.aset}</p>
                    <p className="font-body-md text-[12px] text-on-surface-variant">{r.loc}</p>
                  </td>
                  <td className="max-w-xs p-4 font-body-md text-[13px] text-on-surface-variant">{r.desc}</td>
                  <td className="p-4"><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold text-white ${r.tone}`}>{r.level}</span></td>
                  <td className={`p-4 font-body-md text-[13px] font-semibold ${r.timeTone}`}>{r.time}</td>
                  <td className="p-4"><button className="grid h-8 w-8 place-items-center rounded-full text-on-surface-variant hover:bg-surface-container-low"><span className="material-symbols-outlined text-[20px]">more_vert</span></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between p-4">
          <span className="font-label-sm text-label-sm text-on-surface-variant">Menampilkan 1–4 dari 124 laporan</span>
          <div className="flex items-center gap-1">
            <button className="grid h-8 w-8 place-items-center rounded-lg text-on-surface-variant hover:bg-surface-container-low"><span className="material-symbols-outlined text-[18px]">chevron_left</span></button>
            {["1", "2", "3"].map((p, i) => (
              <button key={p} className={`h-8 w-8 rounded-lg font-heading text-sm font-bold ${i === 0 ? "bg-brand text-white" : "text-on-surface-variant hover:bg-surface-container-low"}`}>{p}</button>
            ))}
            <button className="grid h-8 w-8 place-items-center rounded-lg text-on-surface-variant hover:bg-surface-container-low"><span className="material-symbols-outlined text-[18px]">chevron_right</span></button>
          </div>
        </div>
      </div>
    </div>
  );
}