import { PetaMap } from "@/components/peta-map";

const areas = [
  { name: "Gardu Induk Cawang", loc: "Jakarta Timur", level: "KRITIS", tone: "bg-risk-kritis", edge: "border-l-risk-kritis", icon: "warning", note: "Intensitas Tinggi", bright: true },
  { name: "SUTET Suralaya", loc: "Banten", level: "WASPADA", tone: "bg-risk-waspada", edge: "border-l-risk-waspada", icon: "air", note: "Angin 45 km/h" },
  { name: "Substation Plumpang", loc: "Jakarta Utara", level: "WASPADA", tone: "bg-risk-waspada", edge: "border-l-risk-waspada", icon: "rainy", note: "Curah hujan meningkat" },
];

export default function AdminMonitoring() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-heading text-2xl font-extrabold text-on-surface">Monitoring — Peta Risiko Cuaca</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">Overlay prediksi cuaca BMKG pada aset jaringan nasional.</p>
      </div>

      <div className="relative h-[calc(100vh-11rem)] overflow-hidden rounded-2xl border border-outline-variant shadow-sm">
        <PetaMap />

        <div className="absolute right-3 top-3 z-[500] w-[300px] max-w-[calc(100%-1.5rem)] overflow-hidden rounded-2xl border border-outline-variant bg-card-surface/97 shadow-xl backdrop-blur">
          <div className="flex items-center justify-between border-b border-outline-variant p-4">
            <h2 className="font-heading text-base font-bold">Daftar Area Berisiko Tinggi</h2>
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">expand_less</span>
          </div>
          <div className="max-h-[60vh] overflow-y-auto p-2">
            {areas.map((a) => (
              <div key={a.name} className={`mb-2 rounded-xl border-l-4 p-3 ${a.edge} ${a.bright ? "bg-surface-bright" : "bg-surface-container-low"}`}>
                <div className="mb-1 flex items-center justify-between">
                  <h3 className="font-heading text-sm font-bold">{a.name}</h3>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold text-white ${a.tone}`}>{a.level}</span>
                </div>
                <p className="flex items-center gap-1 font-body-md text-[12px] text-on-surface-variant"><span className="material-symbols-outlined text-[14px]">location_on</span>{a.loc}</p>
                <p className="mt-1 flex items-center gap-1 font-body-md text-[13px] text-on-surface"><span className="material-symbols-outlined text-[16px]">{a.icon}</span>{a.note}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-2 left-3 z-[400] rounded-full bg-card-surface/90 px-3 py-1 font-label-sm text-label-sm text-on-surface-variant shadow">Sumber: BMKG</div>
      </div>
    </div>
  );
}