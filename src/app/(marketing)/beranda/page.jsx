import Link from "next/link";
import { Reveal } from "@/components/motion";

const factors = [
  { label: "Kerusakan visual", tag: "Tinggi", tagColor: "text-risk-kritis", bar: "bg-risk-kritis", w: "w-4/5", note: "Tiang miring di Jl. Diponegoro" },
  { label: "Cuaca BMKG — angin kencang 3 hari", tag: "Waspada", tagColor: "text-risk-waspada", bar: "bg-risk-waspada", w: "w-3/5", note: "Sumber: BMKG" },
  { label: "Laporan sekitar", tag: "Sedang", tagColor: "text-on-surface-variant", bar: "bg-primary-container", w: "w-2/5", note: "12 laporan dalam radius 2 km" },
];

export default function Beranda() {
  return (
    <div className="mx-auto max-w-[900px] px-margin-mobile pb-20 pt-28 md:px-gutter">
      <Reveal>
        <div className="mb-6 rounded-2xl border border-outline-variant bg-card-surface p-8 shadow-[0_4px_12px_rgba(13,27,42,0.05)]">
          <div className="text-center">
            <p className="font-label-bold text-label-bold uppercase tracking-wider text-on-surface-variant">Lokasi Terkini</p>
            <h1 className="mt-1 font-headline-md text-headline-md">Kelurahan Sesetan, Denpasar</h1>
          </div>
          <div className="my-6 grid place-items-center">
            <div className="relative grid h-44 w-44 place-items-center rounded-full" style={{ background: "conic-gradient(#E5484D 0% 74%, #e0e2e7 74% 100%)" }}>
              <div className="grid h-36 w-36 place-items-center rounded-full bg-card-surface">
                <div className="text-center">
                  <div className="text-5xl font-black">74</div>
                  <div className="font-label-sm text-label-sm text-on-surface-variant">/ 100</div>
                </div>
              </div>
            </div>
          </div>
          <div className="text-center">
            <p className="font-headline-sm text-headline-sm">Skor Risiko Lokasimu</p>
            <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-risk-kritis/10 px-3 py-1 font-label-bold text-label-bold text-risk-kritis">
              <span className="material-symbols-outlined text-[16px]">warning</span> Tangani dalam 24 jam
            </span>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-3 border-t border-outline-variant pt-5 text-center">
            {[["Zona", "Waspada"], ["Poinmu", "1.240"], ["Peringkat", "#3"]].map(([k, v]) => (
              <div key={k}>
                <p className="font-label-sm text-label-sm text-on-surface-variant">{k}</p>
                <p className="font-headline-sm text-headline-sm">{v}</p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          {factors.map((f) => (
            <div key={f.label} className="rounded-2xl border border-outline-variant bg-card-surface p-5 shadow-[0_4px_12px_rgba(13,27,42,0.05)]">
              <div className="mb-2 flex items-start justify-between gap-2">
                <span className="font-label-bold text-label-bold">{f.label}</span>
                <span className={`shrink-0 font-label-sm text-label-sm font-bold ${f.tagColor}`}>{f.tag}</span>
              </div>
              <span className="block h-2 rounded-full bg-surface-container">
                <span className={`block h-2 rounded-full ${f.bar} ${f.w}`} />
              </span>
              <p className="mt-2 font-label-sm text-label-sm text-on-surface-variant">{f.note}</p>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal delay={0.2}>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/lapor" className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 font-label-bold text-label-bold text-on-primary transition-transform hover:-translate-y-0.5">
            <span className="material-symbols-outlined text-[20px]">photo_camera</span> Lapor Kondisi
          </Link>
          <Link href="/peta-publik" className="flex flex-1 items-center justify-center gap-2 rounded-full border border-outline bg-card-surface px-6 py-3.5 font-label-bold text-label-bold text-on-surface hover:bg-surface-container-low">
            <span className="material-symbols-outlined text-[20px]">map</span> Lihat Peta Wilayah
          </Link>
        </div>
      </Reveal>
    </div>
  );
}
