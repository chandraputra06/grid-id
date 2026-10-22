# Frontend — Hardware Monitoring & GRID.ID Business Portal

Zip frontend yang diterima hanya berisi folder `app/`. File baru di bawah memakai alias `@/` yang sama dengan proyek:

```
app/(admin)/dashboard/hardware/          ← menu baru Supervisor PLN (di dalam AdminShell existing)
  layout.jsx  page.jsx  perangkat/  perangkat/detail/  inspeksi/  peringatan/  laporan/  pengaturan/
app/(business)/layout.jsx                ← AuthGuard allow={["b2b"]} + BusinessShell
app/(business)/business/                 ← 10 halaman B2B
components/business-shell.jsx
components/hardware/*.jsx                ← komponen bersama (kartu, badge, tabel, grafik SVG, live, snapshot, thermal, modal)
lib/hardware.js                          ← label status, format, useApi (polling), ekspor CSV
```

Tidak ada dependensi npm baru (grafik = SVG, heatmap thermal = canvas). Tidak ada SDK Firebase di frontend.
Halaman existing tidak diubah.

## Dua perubahan kecil pada file yang tidak ada di zip

**1. `components/admin-shell.jsx`** — tambah satu entri menu (sesuaikan dengan bentuk array nav yang ada):

```js
{ href: "/dashboard/hardware", label: "Hardware Monitoring", icon: "memory" }, // roles: admin, supervisor, hardware
```

Sub-menu (Overview, Perangkat, Inspeksi, Peringatan, Laporan, Aturan Peringatan) sudah ditangani `app/(admin)/dashboard/hardware/layout.jsx`.

**2. `lib/roles.js`** — arahkan role baru setelah login:

```js
// di roleHome(role):
if (role === "b2b") return "/business";
```

Pastikan `STAFF_ROLES` **tidak** memuat `"b2b"` (agar pelanggan tidak bisa membuka /dashboard).
Bila `AuthGuard` mengarahkan role yang tidak diizinkan ke `roleHome`, tidak ada perubahan lain.

## Asumsi terhadap `lib/api`

Mengikuti pemakaian di halaman existing: `api.get/post/patch(path, body)` mengembalikan `data` dari envelope dan melempar `Error` ber-`message` bila `ok:false`.

## Verifikasi yang dilakukan

Semua 19 halaman baru di-bundle (esbuild + Tailwind v4 dengan `globals.css` asli) dan dirender di Chromium terhadap server uji yang menjalankan service backend asli di atas database in-memory: 0 error konsol, tanpa scroll horizontal di 390 px dan 1440 px, skenario data lengkap dan skenario "Firebase belum dikonfigurasi". `AdminShell`, `AuthGuard`, `lib/api` asli tidak tersedia sehingga diganti stub saat uji — jalankan `npm run lint && npm run build` di repo lengkap.
