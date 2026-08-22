import Link from "next/link";

export default function Masuk() {
  return (
    <div>
      <div className="text-center">
        <h1 className="font-headline-sm text-headline-sm">Selamat datang di GRID·ID</h1>
        <p className="mt-1 font-body-md text-body-md text-on-surface-variant">Pantau risiko listrik di lokasimu.</p>
      </div>

      <div className="mt-6 flex rounded-full border border-outline-variant bg-surface-container-low p-1 font-label-bold text-label-bold">
        <button className="flex-1 rounded-full bg-primary py-2 text-on-primary">Masuk</button>
        <button className="flex-1 rounded-full py-2 text-on-surface-variant">Daftar</button>
      </div>

      <div className="mt-5 space-y-3">
        <div>
          <label className="mb-1 block font-label-sm text-label-sm text-on-surface-variant">Email</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-outline">mail</span>
            <input type="email" placeholder="Masukkan email Anda" className="w-full rounded-xl border border-outline-variant bg-surface-container-low py-2.5 pl-10 pr-4 font-body-md text-body-md outline-none focus:border-primary-container" />
          </div>
        </div>
        <div>
          <label className="mb-1 block font-label-sm text-label-sm text-on-surface-variant">Kata Sandi</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-outline">lock</span>
            <input type="password" placeholder="Masukkan kata sandi" className="w-full rounded-xl border border-outline-variant bg-surface-container-low py-2.5 pl-10 pr-4 font-body-md text-body-md outline-none focus:border-primary-container" />
          </div>
        </div>
      </div>

      <Link href="/lokasi" className="mt-5 flex items-center justify-center gap-2 rounded-full bg-primary py-3 font-label-bold text-label-bold text-on-primary transition-transform hover:-translate-y-0.5">
        Lanjutkan <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
      </Link>

      <div className="my-4 flex items-center gap-3 font-label-sm text-label-sm text-on-surface-variant">
        <span className="h-px flex-1 bg-outline-variant" /> ATAU <span className="h-px flex-1 bg-outline-variant" />
      </div>
      <button className="flex w-full items-center justify-center gap-2 rounded-full border border-outline-variant py-3 font-label-bold text-label-bold hover:bg-surface-container-low">
        <span className="material-symbols-outlined text-[18px]">g_translate</span> Masuk dengan Google
      </button>

      <Link href="/peta-publik" className="mt-4 block text-center font-label-sm text-label-sm text-primary hover:underline">
        Lewati dulu, lihat Peta Publik
      </Link>

      <div className="mt-6 flex justify-center gap-1.5">
        <span className="h-1.5 w-6 rounded-full bg-primary-container" />
        <span className="h-1.5 w-1.5 rounded-full bg-outline-variant" />
        <span className="h-1.5 w-1.5 rounded-full bg-outline-variant" />
      </div>
    </div>
  );
}
