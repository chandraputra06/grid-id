import Link from "next/link";

export default function Selesai() {
  return (
    <div className="text-center">
      <div className="mx-auto mb-5 grid h-24 w-24 place-items-center rounded-full bg-primary-container">
        <span className="material-symbols-outlined text-5xl text-secondary-container" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
      </div>
      <h1 className="font-headline-md text-headline-md">Kamu kini Penjaga Grid!</h1>
      <p className="mt-2 font-body-md text-body-md text-on-surface-variant">
        Lokasimu: <span className="font-bold text-primary-container">Kelurahan Sesetan</span>. Skor risiko sedang dihitung dengan data BMKG terbaru.
      </p>

      <div className="mt-4 inline-flex items-center gap-1 rounded-full bg-surface-container-low px-3 py-1 font-label-sm text-label-sm text-on-surface-variant">
        <span className="material-symbols-outlined text-[16px]">cloud</span> Sumber: BMKG
      </div>

      <Link href="/beranda" className="mt-6 block rounded-full bg-primary py-3 font-label-bold text-label-bold text-on-primary transition-transform hover:-translate-y-0.5">
        Lihat Skor Risikoku
      </Link>
      <Link href="/peta-publik" className="mt-3 block font-label-bold text-label-bold text-primary hover:underline">
        Jelajahi Peta Publik
      </Link>
    </div>
  );
}
