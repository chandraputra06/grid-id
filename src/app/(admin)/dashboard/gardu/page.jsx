const metrics = [
  { label: "Voltase Rata-rata", value: "148.5", unit: "kV", note: "Ambang normal: 150 kV ±10%", icon: "electric_bolt", tone: "text-brand" },
  { label: "Beban Puncak", value: "82", unit: "%", note: "Mendekati batas aman", icon: "speed", tone: "text-risk-waspada" },
  { label: "Suhu Transformator", value: "78", unit: "°C", note: "+5°C dari rata-rata ini", icon: "device_thermostat", tone: "text-risk-kritis" },
];

export default function AdminGardu() {
  return (
    <div className="space-y-6">
      <div>
        <p className="flex items-center gap-1 font-body-md text-[13px] text-on-surface-variant">
          <a href="/dashboard/monitoring" className="hover:text-brand">Monitoring</a>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span> Gardu Induk Cawang
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <h1 className="font-heading text-2xl font-extrabold text-on-surface">Gardu Induk Cawang (GI-104)</h1>
          <span className="rounded-full bg-risk-waspada/15 px-3 py-1 font-heading text-xs font-bold text-risk-waspada">STATUS: WASPADA</span>
        </div>
        <p className="font-body-md text-body-md text-on-surface-variant">Monitoring real-time kesehatan sistem &amp; prediksi anomali jaringan.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-outline-variant bg-card-surface p-5 shadow-sm lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-heading text-lg font-bold"><span className="material-symbols-outlined text-brand">insights</span> Prakiraan Risiko 7 Hari Ke Depan</h2>
            <span className="rounded-full bg-brand/10 px-2 py-0.5 font-label-sm text-label-sm font-bold text-brand">AI PREDIKSI</span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Berdasarkan analisis tren suhu dan beban, terdapat <span className="font-bold text-risk-kritis">probabilitas 68%</span> terjadinya overheating pada Transformator Unit-2 saat beban puncak pukul 14:00–16:00 dalam 48 jam ke depan.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button className="flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 font-heading text-sm font-bold text-white transition-transform hover:-translate-y-0.5"><span className="material-symbols-outlined text-[18px]">event</span> Jadwalkan Inspeksi</button>
            <button className="flex items-center gap-2 rounded-full border border-outline-variant px-5 py-2.5 font-heading text-sm font-bold text-on-surface hover:bg-surface-container-low"><span className="material-symbols-outlined text-[18px]">bar_chart</span> Lihat Detail Model</button>
          </div>
        </div>

        <div className="rounded-2xl border border-outline-variant bg-card-surface p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-bold">Kondisi Cuaca</h2>
            <span className="rounded-full bg-surface-container-low px-2 py-0.5 font-label-sm text-label-sm text-on-surface-variant">BMKG</span>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <span className="material-symbols-outlined text-5xl text-risk-waspada" style={{ fontVariationSettings: "'FILL' 1" }}>thunderstorm</span>
            <div>
              <p className="font-heading text-lg font-bold">Badai Ringan</p>
              <p className="font-body-md text-[13px] text-on-surface-variant">Curah hujan 45 mm/h · Waspada petir</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-2xl border border-outline-variant bg-card-surface p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-heading text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">{m.label}</span>
              <span className={`material-symbols-outlined ${m.tone}`}>{m.icon}</span>
            </div>
            <div className="mt-2 font-heading text-3xl font-extrabold text-on-surface">{m.value}<span className="ml-1 text-base font-bold text-on-surface-variant">{m.unit}</span></div>
            <p className="mt-1 font-body-md text-[12px] text-on-surface-variant">{m.note}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-outline-variant bg-card-surface p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-lg font-bold">Tren Kesehatan (24 Jam Terakhir)</h2>
          <div className="flex rounded-full bg-surface-container-low p-1">
            <button className="rounded-full bg-brand px-3 py-1 font-heading text-xs font-bold text-white">Suhu</button>
            <button className="rounded-full px-3 py-1 font-heading text-xs font-bold text-on-surface-variant">Beban</button>
          </div>
        </div>
        <svg viewBox="0 0 800 220" className="h-56 w-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#2743d9" stopOpacity="0.18" />
              <stop offset="1" stopColor="#2743d9" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[40, 90, 140, 190].map((y) => <line key={y} x1="0" y1={y} x2="800" y2={y} stroke="#e0e2e7" strokeWidth="1" />)}
          <path d="M0 170 C 120 150, 180 90, 300 100 S 480 60, 560 70 S 720 150, 800 120" fill="none" stroke="#2743d9" strokeWidth="3" />
          <path d="M0 170 C 120 150, 180 90, 300 100 S 480 60, 560 70 S 720 150, 800 120 L 800 220 L 0 220 Z" fill="url(#fill)" />
        </svg>
        <div className="mt-2 flex justify-between font-label-sm text-label-sm text-on-surface-variant">
          <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>Sekarang</span>
        </div>
      </div>
    </div>
  );
}