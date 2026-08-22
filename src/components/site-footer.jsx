import Image from "next/image";

const cols = [
  { title: "Layanan", items: ["Beranda", "Peta Publik", "Lapor Kerusakan", "Misi & Reward", "Dashboard Mitra"] },
  { title: "Tentang", items: ["Cara Kerja", "Tentang Kami", "FAQ"] },
];

export function SiteFooter() {
  return (
    <footer className="w-full bg-footer text-white/85">
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-10 px-gutter py-14 md:grid-cols-12">
        <div className="md:col-span-4">
          <div className="flex items-center gap-2.5">
            <Image src="/grid-logos.png" alt="" width={28} height={39} />
            <span className="font-heading text-lg font-extrabold text-white">GRID<span className="text-accent">·</span>ID</span>
          </div>
          <p className="mt-4 max-w-xs font-body-md text-body-md text-white/60">
            Satu platform terhubung untuk keandalan jaringan listrik — menghubungkan warga, PLN, dan mitra untuk mencegah pemadaman sebelum terjadi.
          </p>
          <div className="mt-5 flex gap-3">
            {["photo_camera", "public", "forum"].map((i) => (
              <span key={i} className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white/70">
                <span className="material-symbols-outlined text-[18px]">{i}</span>
              </span>
            ))}
          </div>
        </div>

        {cols.map((c) => (
          <div key={c.title} className="md:col-span-2">
            <h4 className="mb-4 font-heading text-sm font-bold uppercase tracking-wider text-white">{c.title}</h4>
            <ul className="space-y-2.5 font-body-md text-body-md text-white/60">
              {c.items.map((it) => (
                <li key={it}><a href="#" className="transition-colors hover:text-accent">{it}</a></li>
              ))}
            </ul>
          </div>
        ))}

        <div className="md:col-span-4">
          <h4 className="mb-4 font-heading text-sm font-bold uppercase tracking-wider text-white">Kontak</h4>
          <ul className="space-y-3 font-body-md text-body-md text-white/60">
            <li className="flex items-start gap-2"><span className="material-symbols-outlined text-[18px] text-accent">location_on</span> Kampus Bukit Jimbaran, Gedung Ilmu Komputer, Bali</li>
            <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[18px] text-accent">call</span> +62 812-3456-7890</li>
            <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[18px] text-accent">mail</span> hello@grid-id.id</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center font-label-sm text-label-sm text-white/45">
        © {new Date().getFullYear()} GRID·ID. All rights reserved. Sumber data cuaca: BMKG.
      </div>
    </footer>
  );
}
