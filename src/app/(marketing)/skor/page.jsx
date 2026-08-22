import Link from "next/link";
import { Reveal } from "@/components/motion";

const rows = [
  ["Tingkat kerusakan visual", "0.40", "bg-primary-container", "w-[40%]"],
  ["Faktor cuaca (BMKG)", "0.35", "bg-secondary-container", "w-[35%]"],
  ["Kepadatan laporan", "0.25", "bg-tertiary", "w-[25%]"],
];

export default function Skor() {
  return (
    <div className="mx-auto max-w-[720px] px-margin-mobile pb-20 pt-28 md:px-gutter">
      <Reveal>
        <div className="rounded-2xl border border-outline-variant bg-card-surface p-8 shadow-[0_4px_12px_rgba(13,27,42,0.05)]">
          <div className="text-center">
            <h1 className="font-headline-md text-headline-md">Skor Risiko &amp; Prioritas</h1>
            <p className="mt-2 font-body-md text-body-md text-on-surface-variant">
              Laporanmu telah dianalisis oleh sistem. Berikut estimasi tingkat urgensi berdasarkan data yang dikumpulkan.
            </p>
          </div>

          <div className="my-8 flex flex-col items-center gap-6 md:flex-row md:items-start md:justify-center">
            <div className="grid place-items-center">
              <div className="relative grid h-40 w-40 place-items-center rounded-full" style={{ background: "conic-gradient(#E5484D 0% 74%, #e0e2e7 74% 100%)" }}>
                <div className="grid h-32 w-32 place-items-center rounded-full bg-card-surface">
                  <div className="text-center">
                    <div className="text-4xl font-black">74</div>
                    <div className="font-label-sm text-label-sm text-on-surface-variant">/ 100</div>
                  </div>
                </div>
              </div>
              <span className="mt-3 font-label-bold text-label-bold text-risk-kritis">RISIKO TINGGI</span>
            </div>

            <div className="w-full max-w-sm">
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-risk-kritis/10 p-3">
                <span className="material-symbols-outlined text-risk-kritis" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                <span className="font-label-bold text-label-bold text-risk-kritis">Tangani dalam 24 jam</span>
              </div>
              <div className="space-y-3">
                {rows.map(([label, val, bar, w]) => (
                  <div key={label}>
                    <div className="mb-1 flex justify-between font-label-sm text-label-sm">
                      <span className="flex items-center gap-1 text-on-surface-variant">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span> {label}
                      </span>
                      <span className="font-bold">{val}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container">
                      <div className={`h-full ${bar} ${w}`} />
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-3 flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant">
                <span className="material-symbols-outlined text-[14px]">info</span> Sumber: BMKG
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-outline-variant pt-6 sm:flex-row sm:justify-end">
            <button className="flex items-center justify-center gap-2 rounded-full border border-outline bg-card-surface px-5 py-3 font-label-bold text-label-bold hover:bg-surface-container-low">
              <span className="material-symbols-outlined text-[18px]">bookmark</span> Simpan draf
            </button>
            <Link href="/misi" className="flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 font-label-bold text-label-bold text-on-primary transition-transform hover:-translate-y-0.5">
              Kirim ke Sistem PLN
              <span className="rounded-full bg-on-primary/20 px-2 py-0.5 text-xs">+50 Poin</span>
            </Link>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
