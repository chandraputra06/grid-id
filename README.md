# GRID·ID — Frontend

AI Predictive Health & Resilience Platform untuk infrastruktur ketenagalistrikan.
**Next.js 16 (App Router) · React 19 · JavaScript · Tailwind v4 · Framer Motion · Leaflet.**

## Menjalankan
```bash
npm install
npm run dev      # http://localhost:3000
```

## Halaman
- `(marketing)`: `/` (Beranda), `/cara-kerja`, `/tentang`, `/peta-publik` (peta Leaflet),
  `/beranda`, `/lapor`, `/skor`, `/misi` (citizen)
- `(onboarding)`: `/masuk`, `/lokasi`, `/wilayah`, `/selesai`

## Desain
- **Font**: Montserrat (judul) + Poppins (paragraf), dimuat via Google Fonts CDN di `layout.js`.
- **Warna**: brand blue `#2743D9`, aksen amber `#F5A623`, risk hijau/kuning/merah.
  Tokens di `globals.css` (`bg-brand`, `text-accent`, `bg-primary-container`, `text-risk-kritis`, dll).
- **Favicon**: `src/app/icon.svg` (bolt).
- **Animasi**: `components/motion.jsx` — `<Reveal>` (fade-up saat scroll) & `<HeroIn>`.

## Hero image
Hero Beranda memakai placeholder `public/hero.svg`. Untuk memakai foto PLN aslimu:
taruh file di `public/hero.jpg`, lalu di `src/app/(marketing)/page.jsx` ganti
`url('/hero.svg')` menjadi `url('/hero.jpg')`.

## Peta interaktif (Leaflet)
`components/peta-map.jsx` — vanilla Leaflet + tile OpenStreetMap + lingkaran zona
(kritis/waspada/aman) dengan popup. Dipakai di `/peta-publik`. Ganti pusat/koordinat
zona di array `zones` sesuai wilayahmu.

## Deploy ke Vercel
Push ke GitHub → import di Vercel → Deploy. Belum butuh env var.
