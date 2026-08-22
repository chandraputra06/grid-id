import Link from "next/link";

const suggestions = [["Sesetan", "Denpasar Selatan, Bali"], ["Pedungan", "Denpasar Selatan, Bali"]];

export default function Wilayah() {
  return (
    <div>
      <h1 className="text-center font-headline-sm text-headline-sm">Pilih wilayahmu</h1>
      <p className="mt-1 text-center font-body-md text-body-md text-on-surface-variant">
        Tentukan lokasi area monitoring untuk data yang relevan.
      </p>

      <div className="relative mt-5">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-outline">search</span>
        <input placeholder="Cari kelurahan atau desa" defaultValue="Sesetan" className="w-full rounded-xl border border-outline-variant bg-surface-container-low py-2.5 pl-10 pr-4 font-body-md text-body-md outline-none focus:border-primary-container" />
      </div>

      <div className="mt-3 overflow-hidden rounded-xl border border-outline-variant">
        {suggestions.map(([name, area], i) => (
          <button key={name} className={`flex w-full items-center gap-3 p-3 text-left hover:bg-surface-container-low ${i === 0 ? "bg-primary-container/5" : ""}`}>
            <span className="material-symbols-outlined text-[20px] text-primary-container">location_on</span>
            <div>
              <p className="font-label-bold text-label-bold">{name}</p>
              <p className="font-label-sm text-label-sm text-on-surface-variant">{area}</p>
            </div>
          </button>
        ))}
        <button className="flex w-full items-center gap-3 border-t border-outline-variant p-3 text-left text-primary hover:bg-surface-container-low">
          <span className="material-symbols-outlined text-[20px]">my_location</span>
          <span className="font-label-bold text-label-bold">Gunakan Lokasi Saat Ini</span>
        </button>
      </div>

      <div className="mt-3 grid h-28 place-items-center overflow-hidden rounded-xl bg-surface-container">
        <span className="material-symbols-outlined text-4xl text-outline">map</span>
      </div>

      <div className="mt-4 flex justify-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-outline-variant" />
        <span className="h-1.5 w-1.5 rounded-full bg-outline-variant" />
        <span className="h-1.5 w-6 rounded-full bg-primary-container" />
      </div>

      <Link href="/selesai" className="mt-4 flex items-center justify-center gap-2 rounded-full bg-primary py-3 font-label-bold text-label-bold text-on-primary transition-transform hover:-translate-y-0.5">
        Selesai <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
      </Link>
    </div>
  );
}
