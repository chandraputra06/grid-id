const kpis = [
  { label: "Total Kapasitas", value: "48.5", unit: "GW", icon: "bolt", tone: "text-brand", sub: "+2.4% vs bln lalu", subTone: "text-risk-aman" },
  { label: "Status Grid Utama", value: "AMAN", unit: "", icon: "verified_user", tone: "text-risk-aman", sub: "98% Gardu Induk Normal", subTone: "text-on-surface-variant" },
  { label: "AI Health Score", value: "92", unit: "/100", icon: "neurology", tone: "text-brand", sub: "Prediksi 7 hari optimal", subTone: "text-on-surface-variant" },
];

const cuaca = [
  ["Jakarta Raya", "32°", "Cerah", "Rendah", "text-risk-aman"],
  ["Surabaya", "30°", "Berawan", "Rendah", "text-risk-aman"],
  ["Medan", "26°", "Hujan Deras", "Menengah", "text-risk-waspada"],
];

const alerts = [
  { level: "KRITIS", tone: "bg-risk-kritis", box: "border-risk-kritis/30 bg-risk-kritis/5", icon: "warning", title: "Anomali Suhu Trafo — GI Sumatera", desc: "Probabilitas kegagalan 87% dalam 12 jam. Perlu inspeksi segera.", meta: "Update: 10 mnt lalu", action: "Tugaskan Teknisi" },
  { level: "WASPADA", tone: "bg-risk-waspada", box: "border-risk-waspada/30 bg-risk-waspada/5", icon: "trending_up", title: "Lonjakan Beban Puncak — Jakarta Selatan", desc: "Kapasitas mendekati ambang batas 85%. Rekomendasi redistribusi rute.", meta: "Update: 45 mnt lalu", action: "Lihat Detail" },
  { level: "AMAN", tone: "bg-risk-aman", box: "border-risk-aman/30 bg-risk-aman/5", icon: "check_circle", title: "Pemeliharaan Rutin Selesai — PLTU Jawa Bali", desc: "Sistem beroperasi pada parameter optimal. Tidak ada anomali terdeteksi.", meta: "Update: 2 jam lalu", action: null },
];

export default function AdminBeranda() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-extrabold text-on-surface">Dashboard Ringkasan Nasional</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">Pantauan kesehatan jaringan listrik nasional secara real-time.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kpis.map((k) => (
          <div key={k.label} className="flex items-start gap-4 rounded-2xl border border-outline-variant bg-card-surface p-5 shadow-sm">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand/10">
              <span className={`material-symbols-outlined ${k.tone}`} style={{ fontVariationSettings: "'FILL' 1" }}>{k.icon}</span>
            </span>
            <div className="min-w-0">
              <span className="font-heading text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">{k.label}</span>
              <div className="mt-1 font-heading text-3xl font-extrabold text-on-surface">
                {k.value}<span className="ml-1 text-base font-bold text-on-surface-variant">{k.unit}</span>
              </div>
              <p className={`mt-0.5 font-body-md text-[13px] ${k.subTone}`}>{k.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-outline-variant bg-card-surface p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-bold">Peta Topologi Grid</h2>
            <span className="font-label-sm text-label-sm text-on-surface-variant">Ringkasan Nasional</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-4 border-b border-outline-variant pb-3 font-body-md text-[12px] text-on-surface-variant">
            <span>Beban: <b className="text-on-surface">45.12 GW</b></span>
            <span>Kapasitas: <b className="text-on-surface">55.80 GW</b></span>
            <span>Status: <b className="text-risk-aman">Stabil</b></span>
            <span>Anomali: <b className="text-on-surface">3</b></span>
          </div>
          <div className="mt-3 grid h-60 place-items-center rounded-xl bg-gradient-to-br from-surface-container-low to-surface-container text-on-surface-variant">
            <div className="text-center">
              <span className="material-symbols-outlined text-5xl text-brand">public</span>
              <p className="mt-2 font-body-md text-[13px]">Peta topologi grid nasional (integrasi menyusul)</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-outline-variant bg-card-surface p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-bold">Kondisi Cuaca</h2>
            <span className="rounded-full bg-surface-container-low px-2 py-0.5 font-label-sm text-label-sm text-on-surface-variant">Sumber: BMKG</span>
          </div>
          <ul className="mt-4 space-y-3">
            {cuaca.map(([kota, suhu, ket, risk, tone]) => (
              <li key={kota} className="flex items-center justify-between rounded-xl bg-surface-container-low p-3">
                <div>
                  <p className="font-heading text-sm font-bold">{kota}</p>
                  <p className="font-body-md text-[12px] text-on-surface-variant">{ket} · Risiko: <span className={tone}>{risk}</span></p>
                </div>
                <span className="font-heading text-2xl font-extrabold text-brand">{suhu}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-2xl border border-outline-variant bg-card-surface p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-heading text-lg font-bold">
            <span className="material-symbols-outlined text-brand">neurology</span> Sistem Kesehatan Prediktif AI
          </h2>
          <a href="/dashboard/laporan" className="font-heading text-sm font-bold text-brand hover:underline">Lihat Laporan Lengkap →</a>
        </div>
        <div className="space-y-3">
          {alerts.map((a) => (
            <div key={a.title} className={`flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center ${a.box}`}>
              <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-white ${a.tone}`}>
                <span className="material-symbols-outlined text-[20px]">{a.icon}</span>
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-heading text-sm font-bold">{a.title}</h3>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold text-white ${a.tone}`}>{a.level}</span>
                </div>
                <p className="font-body-md text-[13px] text-on-surface-variant">{a.desc}</p>
              </div>
              <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end">
                <span className="font-label-sm text-label-sm text-on-surface-variant">{a.meta}</span>
                {a.action && <button className="font-heading text-sm font-bold text-brand hover:underline">{a.action}</button>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}