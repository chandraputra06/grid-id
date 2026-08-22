import Link from "next/link";

export default function Lokasi() {
  return (
    <div className="text-center">
      <div className="mx-auto mb-5 grid h-24 w-24 place-items-center rounded-full bg-primary-container/10">
        <span className="material-symbols-outlined text-5xl text-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
      </div>
      <h1 className="font-headline-sm text-headline-sm">Izinkan akses lokasi</h1>
      <p className="mt-2 font-body-md text-body-md text-on-surface-variant">
        Kami memakai lokasimu untuk menghitung skor risiko dan prakiraan cuaca BMKG di sekitarmu. Lokasimu tidak dibagikan ke publik.
      </p>

      <Link href="/wilayah" className="mt-6 block rounded-full bg-primary py-3 font-label-bold text-label-bold text-on-primary transition-transform hover:-translate-y-0.5">
        Izinkan Lokasi
      </Link>
      <Link href="/wilayah" className="mt-3 block font-label-bold text-label-bold text-primary hover:underline">
        Pilih manual
      </Link>

      <div className="mt-5 flex items-center justify-center gap-1.5 font-label-sm text-label-sm text-on-surface-variant">
        <span className="material-symbols-outlined text-[16px] text-risk-aman">lock</span> Privasimu aman
      </div>

      <div className="mt-6 flex justify-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-outline-variant" />
        <span className="h-1.5 w-6 rounded-full bg-primary-container" />
        <span className="h-1.5 w-1.5 rounded-full bg-outline-variant" />
      </div>
    </div>
  );
}
