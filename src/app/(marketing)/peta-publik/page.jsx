"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

/*
  Satu file lengkap (tinggal paste ke app/peta-publik/page.jsx)
  Persiapan: npm i leaflet
  Foto laporan sementara memakai foto dummy dari picsum.photos.
  Untuk foto asli, tambahkan field  foto: "/laporan/xxx.jpg"  pada data laporan.
*/

/* ============================================================
   DESIGN SYSTEM (sama dengan halaman login / wilayah)
   ============================================================ */
const GRAD = "linear-gradient(90deg, #1F9D55 0%, #4CBF6B 55%, #9CCB45 100%)";
const GRAD_135 = "linear-gradient(135deg, #1F9D55 0%, #4CBF6B 55%, #9CCB45 100%)";
const CARD_SHADOW = "0 24px 60px -12px rgba(31,157,85,0.45)";

/* Warna per level risiko: kritis = merah, waspada = kuning, aman = hijau */
const LEVEL_META = {
  kritis: {
    label: "KRITIS",
    icon: "warning",
    color: "#EF4444",
    grad: "linear-gradient(135deg, #DC2626 0%, #EF4444 55%, #F87171 100%)",
    soft: "#FEF2F2",
    text: "#B91C1C",
    onGrad: "#FFFFFF",
    border: "#FCA5A5",
    glow: "rgba(239,68,68,0.55)",
  },
  waspada: {
    label: "WASPADA",
    icon: "error",
    color: "#F59E0B",
    grad: "linear-gradient(135deg, #F59E0B 0%, #FBBF24 55%, #FDE047 100%)",
    soft: "#FFFBEB",
    text: "#B45309",
    onGrad: "#78350F",
    border: "#FCD34D",
    glow: "rgba(245,158,11,0.55)",
  },
  aman: {
    label: "AMAN",
    icon: "check_circle",
    color: "#1F9D55",
    grad: "linear-gradient(135deg, #1F9D55 0%, #4CBF6B 55%, #9CCB45 100%)",
    soft: "#F1FAEA",
    text: "#15803D",
    onGrad: "#FFFFFF",
    border: "#9CCB45",
    glow: "rgba(31,157,85,0.5)",
  },
};

const KATEGORI = {
  pohon: { label: "Pohon dekat kabel", icon: "park" },
  kabel: { label: "Kabel menjuntai", icon: "cable" },
  trafo: { label: "Gardu / trafo", icon: "bolt" },
  banjir: { label: "Genangan / banjir", icon: "flood" },
  tiang: { label: "Tiang miring", icon: "power" },
};

const STATUS_ICON = {
  "Menunggu verifikasi": "hourglass_top",
  "Ditangani petugas": "engineering",
  Selesai: "task_alt",
};

/* ============================================================
   DATA SAMPLE LAPORAN
   ============================================================ */
const LAPORAN = [
  // Sanur
  { id: 1, judul: "Kabel putus menjuntai di Jl. Danau Tamblingan", kategori: "kabel", level: "kritis", lokasi: "Jl. Danau Tamblingan, Sanur", lat: -8.6935, lng: 115.2617, menit: 18, pelapor: "Komang A.", status: "Menunggu verifikasi", deskripsi: "Kabel udara putus dan menjuntai hingga ketinggian sekitar 2 meter di atas jalan. Warga sudah memasang pembatas sementara." },
  { id: 2, judul: "Dahan pohon menyentuh kabel dekat Pantai Sanur", kategori: "pohon", level: "waspada", lokasi: "Jl. Pantai Sanur", lat: -8.6978, lng: 115.264, menit: 95, pelapor: "Made S.", status: "Ditangani petugas", deskripsi: "Dahan pohon ketapang tumbuh menempel pada jaringan kabel. Berpotensi korslet bila angin kencang." },
  { id: 3, judul: "Gardu distribusi Sindhu kondisi baik", kategori: "trafo", level: "aman", lokasi: "Jl. Danau Poso, Sindhu", lat: -8.689, lng: 115.264, menit: 300, pelapor: "Ayu P.", status: "Selesai", deskripsi: "Pemeriksaan visual gardu: tidak ada kebocoran, pagar pengaman utuh, area bersih dari vegetasi." },
  { id: 4, judul: "Genangan air di bawah gardu Semawang", kategori: "banjir", level: "waspada", lokasi: "Banjar Semawang, Sanur", lat: -8.712, lng: 115.26, menit: 140, pelapor: "Wayan R.", status: "Menunggu verifikasi", deskripsi: "Air setinggi mata kaki menggenang di sekitar tiang gardu setelah hujan deras semalam." },
  { id: 5, judul: "Tiang listrik miring setelah angin kencang", kategori: "tiang", level: "kritis", lokasi: "Jl. Tanjung Sari, Sanur", lat: -8.704, lng: 115.2655, menit: 42, pelapor: "Nyoman T.", status: "Ditangani petugas", deskripsi: "Tiang miring sekitar 30 derajat dan menekan kabel ke arah rumah warga. Mohon segera ditangani." },
  { id: 16, judul: "Kabel fiber optik menggantung rendah", kategori: "kabel", level: "waspada", lokasi: "Jl. Bypass Ngurah Rai, Sanur", lat: -8.6905, lng: 115.2585, menit: 180, pelapor: "Dika P.", status: "Menunggu verifikasi", deskripsi: "Kabel menggantung sekitar 3 meter dari tanah, dikhawatirkan tersangkut kendaraan tinggi." },
  { id: 17, judul: "Trafo bersih, pagar pengaman utuh", kategori: "trafo", level: "aman", lokasi: "Jl. Cemara, Sanur", lat: -8.6995, lng: 115.2605, menit: 620, pelapor: "Eka S.", status: "Selesai", deskripsi: "Pengecekan rutin: kondisi trafo normal dan area sekitar bersih." },
  { id: 18, judul: "Air rob menggenang dekat panel pantai", kategori: "banjir", level: "kritis", lokasi: "Pantai Mertasari, Sanur", lat: -8.7185, lng: 115.2615, menit: 33, pelapor: "Yoga A.", status: "Ditangani petugas", deskripsi: "Air pasang naik hingga mendekati panel listrik pinggir pantai. Perlu penanganan segera." },
  { id: 19, judul: "Pohon beringin dipangkas rapi", kategori: "pohon", level: "aman", lokasi: "Jl. Danau Buyan, Sanur", lat: -8.6925, lng: 115.2665, menit: 1200, pelapor: "Tari W.", status: "Selesai", deskripsi: "Pemangkasan dahan di dekat kabel sudah selesai dan jarak aman terpenuhi." },
  { id: 20, judul: "Tiang beton retak di bagian bawah", kategori: "tiang", level: "waspada", lokasi: "Jl. Hang Tuah, Sanur", lat: -8.6845, lng: 115.2625, menit: 410, pelapor: "Bayu K.", status: "Menunggu verifikasi", deskripsi: "Terlihat retakan memanjang di pangkal tiang. Belum miring, tapi perlu dicek petugas." },
  // Renon & Panjer
  { id: 6, judul: "Trafo berderit dan terasa panas", kategori: "trafo", level: "waspada", lokasi: "Jl. Raya Puputan, Renon", lat: -8.6717, lng: 115.235, menit: 210, pelapor: "Dewi K.", status: "Menunggu verifikasi", deskripsi: "Terdengar suara berderit dari trafo dan permukaannya terasa hangat saat didekati." },
  { id: 7, judul: "Pohon sudah dipangkas petugas", kategori: "pohon", level: "aman", lokasi: "Jl. Tantular, Panjer", lat: -8.696, lng: 115.235, menit: 1500, pelapor: "Putu G.", status: "Selesai", deskripsi: "Pemangkasan sudah selesai, jarak aman dengan kabel terpenuhi." },
  // Sesetan, Pedungan, Sidakarya
  { id: 8, judul: "Banjir setinggi lutut dekat panel listrik", kategori: "banjir", level: "kritis", lokasi: "Jl. Raya Sesetan", lat: -8.7205, lng: 115.21, menit: 25, pelapor: "Ketut B.", status: "Ditangani petugas", deskripsi: "Air masuk ke area panel listrik pinggir jalan. Warga diminta menjauh dari titik genangan." },
  { id: 9, judul: "Kabel semrawut menempel atap warung", kategori: "kabel", level: "waspada", lokasi: "Gang Mawar, Sesetan", lat: -8.724, lng: 115.214, menit: 380, pelapor: "Rina M.", status: "Menunggu verifikasi", deskripsi: "Beberapa kabel menempel pada atap seng warung. Risiko sengatan saat hujan." },
  { id: 10, judul: "Tiang listrik dicek, kondisi tegak", kategori: "tiang", level: "aman", lokasi: "Jl. Pedungan Raya", lat: -8.711, lng: 115.193, menit: 2000, pelapor: "Adi W.", status: "Selesai", deskripsi: "Tiang dalam kondisi tegak dan pondasi kokoh." },
  { id: 11, judul: "Ranting menjalar ke jaringan kabel", kategori: "pohon", level: "waspada", lokasi: "Jl. Sidakarya", lat: -8.73, lng: 115.226, menit: 500, pelapor: "Sari L.", status: "Menunggu verifikasi", deskripsi: "Ranting pohon mangga mulai menyentuh kabel. Perlu dipangkas sebelum musim hujan." },
  // Kuta
  { id: 12, judul: "Trafo mengeluarkan percikan api", kategori: "trafo", level: "kritis", lokasi: "Jl. Legian, Kuta", lat: -8.718, lng: 115.169, menit: 12, pelapor: "John D.", status: "Ditangani petugas", deskripsi: "Percikan api terlihat dari trafo, disertai bau terbakar. Area sudah dikosongkan sementara." },
  { id: 13, judul: "Genangan sudah surut, panel aman", kategori: "banjir", level: "aman", lokasi: "Jl. Pantai Kuta", lat: -8.724, lng: 115.172, menit: 700, pelapor: "Lia S.", status: "Selesai", deskripsi: "Genangan sudah surut dan panel kering. Tidak ada kerusakan." },
  // Ubud
  { id: 14, judul: "Pohon besar condong ke arah kabel", kategori: "pohon", level: "waspada", lokasi: "Jl. Monkey Forest, Ubud", lat: -8.5069, lng: 115.2625, menit: 260, pelapor: "Gede H.", status: "Menunggu verifikasi", deskripsi: "Pohon besar mulai condong ke jaringan kabel setelah tanah di pangkalnya longsor kecil." },
  { id: 15, judul: "Kabel sudah dirapikan petugas", kategori: "kabel", level: "aman", lokasi: "Jl. Hanoman, Ubud", lat: -8.512, lng: 115.26, menit: 3000, pelapor: "Sinta N.", status: "Selesai", deskripsi: "Kabel yang sebelumnya menjuntai sudah diikat dan dirapikan." },
];

/* Foto dummy (anggap hasil scan/foto warga). Jika data punya field `foto`, itu yang dipakai. */
const fotoUrl = (l, w = 240, h = 240) => l.foto || `https://picsum.photos/seed/grid-laporan-${l.id}/${w}/${h}`;

/* ============================================================
   HELPER
   ============================================================ */
const DEFAULT_WILAYAH = { lat: -8.65, lng: 115.2167, desa: "", kecamatan: "", kabupaten: "Denpasar" };

/* Lokasi yang dipilih di halaman login/wilayah */
function getWilayah() {
  try {
    const w = JSON.parse(localStorage.getItem("wilayah") || "null");
    if (w && typeof w.lat === "number" && typeof w.lng === "number") return w;
  } catch {}
  return DEFAULT_WILAYAH;
}

const RANK = { kritis: 0, waspada: 1, aman: 2 };
const RADIUS = [3, 5, 10, 25];
const PANEL_W = 420; // lebar overlay + margin (px), dipakai untuk menggeser fokus peta

const distKm = (a, b) => {
  const dLat = (a.lat - b.lat) * 111.2;
  const dLng = (a.lng - b.lng) * 111.2 * Math.cos((a.lat * Math.PI) / 180);
  return Math.sqrt(dLat * dLat + dLng * dLng);
};

/* Laporan dalam radius (km), urut: kritis > waspada > aman, lalu terbaru */
const laporanDekat = (center, radiusKm = 5) =>
  LAPORAN.map((l) => ({ ...l, jarak: distKm(center, l) }))
    .filter((l) => l.jarak <= radiusKm)
    .sort((a, b) => RANK[a.level] - RANK[b.level] || a.menit - b.menit);

/* Skor 0-100 dari kumpulan laporan */
function skorRisiko(list) {
  const k = list.filter((l) => l.level === "kritis").length;
  const w = list.filter((l) => l.level === "waspada").length;
  const a = list.filter((l) => l.level === "aman").length;
  return Math.round(100 * (1 - Math.exp(-(k * 1 + w * 0.45 + a * 0.05) / 2)));
}
const levelDariSkor = (s) => (s >= 65 ? "kritis" : s >= 35 ? "waspada" : "aman");

function agoText(m) {
  if (m < 60) return `${m} mnt lalu`;
  if (m < 1440) return `${Math.round(m / 60)} jam lalu`;
  return `${Math.round(m / 1440)} hari lalu`;
}

/* ============================================================
   PETA (Leaflet): highlight wilayah + marker laporan
   ============================================================ */
const markerHtml = (m, icon, selected) => `
  <div class="wl-mk ${selected ? "wl-mk-on" : ""}" style="--c:${m.color};--g:${m.glow}">
    <span class="wl-mk-pulse"></span>
    <svg width="34" height="44" viewBox="0 0 40 52" aria-hidden="true">
      <path d="M20 50C20 50 4 31 4 19a16 16 0 0 1 32 0c0 12-16 31-16 31z" fill="${m.color}" stroke="#fff" stroke-width="2.5"/>
      <circle cx="20" cy="19" r="10" fill="#fff"/>
    </svg>
    <span class="material-symbols-outlined wl-mk-ic" style="color:${m.color}">${icon}</span>
  </div>`;

function PetaMap({ center, label, laporan, selectedId, onSelect, radiusKm = 5, pad }) {
  const el = useRef(null);
  const st = useRef({});
  const onSelectRef = useRef(onSelect);
  const laporanRef = useRef(laporan);
  const padRef = useRef(pad);
  const [ready, setReady] = useState(false);
  onSelectRef.current = onSelect;
  laporanRef.current = laporan;
  padRef.current = pad;

  /* Inisialisasi peta */
  useEffect(() => {
    let map;
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !el.current) return;

      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      map = L.map(el.current, {
        center: [center.lat, center.lng],
        zoom: 13,
        minZoom: 8,
        maxZoom: 19,
        maxBounds: [[-9.4, 113.9], [-7.6, 116.3]],
        maxBoundsViscosity: 0.8,
        zoomControl: false,
        inertia: true,
        tap: true,
        touchZoom: true,
        dragging: true,
        scrollWheelZoom: true,
      });

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);
      L.control.zoom({ position: "bottomright" }).addTo(map);

      /* Gradasi radial untuk highlight wilayah (hijau soft kekuningan) */
      const rend = L.svg({ padding: 0.5 }).addTo(map);
      const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
      defs.innerHTML = `
        <radialGradient id="wlAreaG" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#9CCB45" stop-opacity="0.60"/>
          <stop offset="55%" stop-color="#4CBF6B" stop-opacity="0.34"/>
          <stop offset="100%" stop-color="#1F9D55" stop-opacity="0.08"/>
        </radialGradient>
        <radialGradient id="wlAreaG2" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#FEF08A" stop-opacity="0.50"/>
          <stop offset="100%" stop-color="#9CCB45" stop-opacity="0.04"/>
        </radialGradient>`;
      rend._container.appendChild(defs);

      const ll = [center.lat, center.lng];
      const cover = L.circle(ll, { renderer: rend, radius: radiusKm * 1000, color: "#1F9D55", weight: 1.5, opacity: 0.55, dashArray: "4 8", fillOpacity: 0, interactive: false }).addTo(map);
      const area = L.circle(ll, { renderer: rend, radius: 2200, stroke: false, fillColor: "url(#wlAreaG2)", fillOpacity: 1, interactive: false }).addTo(map);
      const inner = L.circle(ll, { renderer: rend, radius: 1100, color: "#1F9D55", weight: 2.5, fillColor: "url(#wlAreaG)", fillOpacity: 1, className: "wl-ring", interactive: false }).addTo(map);

      const me = L.marker(ll, {
        icon: L.divIcon({ className: "", html: '<div class="wl-me"><span class="wl-me-p"></span><span class="wl-me-d"></span></div>', iconSize: [24, 24], iconAnchor: [12, 12] }),
        zIndexOffset: 500,
        keyboard: false,
      }).addTo(map);
      me.bindTooltip(label || "Lokasimu", { permanent: true, direction: "top", offset: [0, -14], className: "wl-tip" });

      const layer = L.layerGroup().addTo(map);
      st.current = { L, map, cover, area, inner, me, layer };
      setReady(true);
      setTimeout(() => map.invalidateSize(), 100);
    })();

    return () => {
      cancelled = true;
      if (map) map.remove();
      st.current = {};
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Pindah ke lokasi / radius (fokus digeser agar tidak tertutup overlay) */
  useEffect(() => {
    if (!ready) return;
    const { map, cover, area, inner, me } = st.current;
    const p = padRef.current || { l: 0, b: 0 };
    const ll = [center.lat, center.lng];
    cover.setLatLng(ll);
    cover.setRadius(radiusKm * 1000);
    area.setLatLng(ll);
    inner.setLatLng(ll);
    me.setLatLng(ll);
    me.setTooltipContent(label || "Lokasimu");
    map.flyToBounds(cover.getBounds(), { paddingTopLeft: [p.l + 30, 30], paddingBottomRight: [30, p.b + 30], maxZoom: 15, duration: 1.2 });
  }, [ready, center.lat, center.lng, radiusKm, label]);

  /* Marker laporan */
  useEffect(() => {
    if (!ready) return;
    const { L, layer } = st.current;
    layer.clearLayers();
    laporan.forEach((l) => {
      const m = LEVEL_META[l.level];
      const sel = l.id === selectedId;
      const icon = L.divIcon({
        className: "",
        html: markerHtml(m, KATEGORI[l.kategori].icon, sel),
        iconSize: [34, 44],
        iconAnchor: [17, 44],
      });
      L.marker([l.lat, l.lng], { icon, zIndexOffset: sel ? 1000 : 0, title: l.judul })
        .on("click", () => onSelectRef.current(l.id))
        .addTo(layer);
    });
  }, [ready, laporan, selectedId]);

  /* Terbang ke laporan terpilih */
  useEffect(() => {
    if (!ready || !selectedId) return;
    const l = laporanRef.current.find((x) => x.id === selectedId);
    if (!l) return;
    const { L, map } = st.current;
    const p = padRef.current || { l: 0, b: 0 };
    map.flyToBounds(L.latLngBounds([[l.lat, l.lng], [l.lat, l.lng]]), {
      paddingTopLeft: [p.l + 30, 60],
      paddingBottomRight: [30, p.b + 30],
      maxZoom: Math.max(map.getZoom(), 16),
      duration: 0.9,
    });
  }, [ready, selectedId]);

  return (
    <>
      <div ref={el} className="wl-peta h-full w-full" role="application" aria-label="Peta risiko Bali" />
      <style>{`
        .wl-peta.leaflet-container { background: #E9F5DA; font-family: inherit; touch-action: none; }
        .wl-peta .leaflet-control-zoom { border: none !important; box-shadow: 0 6px 16px -6px rgba(31,157,85,.6); border-radius: 12px; overflow: hidden; }
        .wl-peta .leaflet-control-zoom a { color: #15803D; background: rgba(255,255,255,.95); border-bottom-color: #E8F7DC; }
        .wl-peta .leaflet-control-zoom a:hover { background: #F1FAEA; }
        .wl-peta .leaflet-control-attribution { font-size: 9px; background: rgba(255,255,255,.75); }

        @keyframes wlDash { to { stroke-dashoffset: -24 } }
        .wl-ring { stroke-dasharray: 8 7; animation: wlDash 2.2s linear infinite; }

        @keyframes wlMkP { 0%,100% { transform: translateX(-50%) scale(1); opacity: .35 } 50% { transform: translateX(-50%) scale(1.6); opacity: .1 } }
        @keyframes wlMkBob { 0%,100% { transform: translateY(0) scale(1.25) } 50% { transform: translateY(-8px) scale(1.25) } }
        .wl-mk { position: relative; width: 34px; height: 44px; transform-origin: 50% 100%; filter: drop-shadow(0 6px 5px var(--g)); transition: transform .2s; cursor: pointer; }
        .wl-mk:hover { transform: scale(1.15); }
        .wl-mk svg { display: block; }
        .wl-mk-ic { position: absolute; left: 50%; top: 8px; transform: translateX(-50%); font-size: 15px; font-variation-settings: 'FILL' 1; }
        .wl-mk-pulse { position: absolute; left: 50%; bottom: -3px; width: 26px; height: 9px; border-radius: 50%; background: var(--c); animation: wlMkP 2s ease-in-out infinite; }
        .wl-mk-on { animation: wlMkBob .8s ease-in-out infinite; }

        @keyframes wlMeP { 0% { transform: scale(.5); opacity: .8 } 100% { transform: scale(2.6); opacity: 0 } }
        .wl-me { position: relative; width: 24px; height: 24px; }
        .wl-me-p { position: absolute; inset: 0; border-radius: 50%; background: #4CBF6B; animation: wlMeP 1.8s ease-out infinite; }
        .wl-me-d { position: absolute; inset: 4px; border-radius: 50%; border: 3px solid #fff; background: linear-gradient(135deg,#1F9D55,#9CCB45); box-shadow: 0 0 14px rgba(76,191,107,.9), 0 4px 8px rgba(21,128,61,.5); }
        .wl-tip { background: linear-gradient(90deg,#1F9D55,#4CBF6B 55%,#9CCB45); color: #fff; border: 2px solid #fff; border-radius: 999px; font-weight: 800; font-size: 11px; padding: 3px 10px; box-shadow: 0 8px 18px -6px rgba(31,157,85,.8), 0 0 18px rgba(156,203,69,.6); }
        .wl-tip:before { border-top-color: #fff; }

        @media (prefers-reduced-motion: reduce) { .wl-ring, .wl-mk-pulse, .wl-mk-on, .wl-me-p { animation: none !important; } }
      `}</style>
    </>
  );
}

/* ============================================================
   KOMPONEN KECIL
   ============================================================ */
/* Foto laporan (placeholder berwarna jika gambar gagal dimuat) */
function Foto({ l, big = false }) {
  const [err, setErr] = useState(false);
  const m = LEVEL_META[l.level];
  if (err) {
    return (
      <div className="grid h-full w-full place-items-center" style={{ background: m.grad }}>
        <span className="material-symbols-outlined text-[28px]" style={{ color: m.onGrad, fontVariationSettings: "'FILL' 1" }}>{KATEGORI[l.kategori].icon}</span>
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={fotoUrl(l, big ? 800 : 240, big ? 500 : 240)} alt={l.judul} loading="lazy" onError={() => setErr(true)} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />;
}

function Badge({ level, className = "" }) {
  const m = LEVEL_META[level];
  return (
    <span className={`inline-flex shrink-0 items-center gap-0.5 rounded-full px-2 py-0.5 text-[9px] font-extrabold tracking-wide shadow-sm ${className}`} style={{ background: m.grad, color: m.onGrad }}>
      <span className="material-symbols-outlined text-[11px]" style={{ fontVariationSettings: "'FILL' 1" }}>{m.icon}</span>
      {m.label}
    </span>
  );
}

/* ============================================================
   HALAMAN PETA PUBLIK
   ============================================================ */
export default function PetaPublik() {
  const rowRefs = useRef({});
  const [wilayah, setWilayah] = useState(null);
  const [open, setOpen] = useState(true);
  const [filter, setFilter] = useState("semua"); // semua | kritis | waspada | aman
  const [radius, setRadius] = useState(5);
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [pad, setPad] = useState({ l: 0, b: 0 });

  useEffect(() => {
    setWilayah(getWilayah());
  }, []);

  /* Geser fokus peta supaya tidak tertutup overlay */
  useEffect(() => {
    const calc = () => {
      if (!open) return setPad({ l: 0, b: 0 });
      if (window.innerWidth >= 768) return setPad({ l: PANEL_W, b: 0 });
      setPad({ l: 0, b: Math.round(window.innerHeight * 0.42) });
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, [open]);

  useEffect(() => {
    if (!detail) return;
    const onKey = (e) => e.key === "Escape" && setDetail(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [detail]);

  /* Data turunan */
  const w = wilayah || DEFAULT_WILAYAH;
  const center = useMemo(() => ({ lat: w.lat, lng: w.lng }), [w.lat, w.lng]);
  const place = w.desa || w.kecamatan || w.kabupaten || "Bali";
  const sub = [w.kecamatan, w.kabupaten].filter((x) => x && x !== place).join(", ") || "Bali";

  const semua = useMemo(() => laporanDekat(center, radius), [center, radius]);
  const counts = useMemo(() => ({
    semua: semua.length,
    kritis: semua.filter((l) => l.level === "kritis").length,
    waspada: semua.filter((l) => l.level === "waspada").length,
    aman: semua.filter((l) => l.level === "aman").length,
  }), [semua]);
  const shown = useMemo(() => (filter === "semua" ? semua : semua.filter((l) => l.level === filter)), [semua, filter]);
  const selected = shown.find((l) => l.id === selectedId) || null;

  const skor = skorRisiko(semua);
  const sm = LEVEL_META[levelDariSkor(skor)];

  /* Scroll daftar ke laporan yang dipilih (mis. saat marker di peta diklik) */
  useEffect(() => {
    if (!selected || !open) return;
    const t = setTimeout(() => rowRefs.current[selected.id]?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
    return () => clearTimeout(t);
  }, [selected?.id, open]); // eslint-disable-line react-hooks/exhaustive-deps

  const filters = [
    { key: "semua", label: "Semua", meta: { grad: GRAD_135, text: "#15803D", onGrad: "#fff", glow: "rgba(31,157,85,.5)", color: "#1F9D55" } },
    ...["kritis", "waspada", "aman"].map((k) => ({ key: k, label: LEVEL_META[k].label.charAt(0) + LEVEL_META[k].label.slice(1).toLowerCase(), meta: LEVEL_META[k] })),
  ];

  return (
    <section className="relative h-[calc(100vh-80px)] min-h-[560px] overflow-hidden">
      <style>{`
        @keyframes wlRise { from { opacity: 0; transform: translateY(12px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes wlPop { from { opacity: 0; transform: translateY(20px) scale(.96) } to { opacity: 1; transform: translateY(0) scale(1) } }
        @keyframes wlGlow { 0%,100% { box-shadow: 0 8px 20px -6px rgba(31,157,85,.7), 0 0 0 rgba(156,203,69,0) } 50% { box-shadow: 0 8px 22px -6px rgba(31,157,85,.8), 0 0 26px rgba(156,203,69,.6) } }
        @keyframes wlWiggle { 0%,100% { transform: translateX(0) } 50% { transform: translateX(4px) } }
        .wl-cta { animation: wlGlow 2.6s ease-in-out 1s infinite; }
        .wl-cta:hover { animation: none; }
        .wl-arrow { animation: wlWiggle 1.4s ease-in-out infinite; }
        .wl-in { animation: wlRise .45s cubic-bezier(.16,1,.3,1) both; }
        .wl-scroll { scrollbar-width: thin; scrollbar-color: #9CCB45 transparent; }
        .wl-scroll::-webkit-scrollbar { width: 6px; }
        .wl-scroll::-webkit-scrollbar-thumb { background: linear-gradient(#4CBF6B, #9CCB45); border-radius: 999px; }
        @media (prefers-reduced-motion: reduce) { .wl-cta, .wl-arrow, .wl-in { animation: none !important; } }
      `}</style>

      {/* ================= PETA FULL ================= */}
      <div className="absolute inset-0 z-0">
        <PetaMap center={center} label={place} laporan={shown} selectedId={selected?.id} onSelect={setSelectedId} radiusKm={radius} pad={pad} />
      </div>

      {/* Tombol buka overlay */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="absolute left-3 top-3 z-[500] flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 active:scale-95 md:left-6 md:top-6"
          style={{ background: GRAD, boxShadow: "0 10px 24px -8px rgba(31,157,85,.8)" }}
        >
          <span className="material-symbols-outlined text-[20px]">list</span> Daftar Laporan
          <span className="rounded-full bg-white/30 px-2 py-0.5 text-[11px] font-extrabold">{counts.semua}</span>
        </button>
      )}

      {/* ================= OVERLAY ================= */}
      {open && (
        <div
          className="wl-in absolute inset-x-3 bottom-3 z-[500] flex max-h-[58vh] flex-col overflow-hidden rounded-2xl border border-white/70 bg-white/95 backdrop-blur-md md:inset-x-auto md:bottom-6 md:left-6 md:top-6 md:max-h-none md:w-[396px]"
          style={{ boxShadow: CARD_SHADOW }}
        >
          {/* Header lokasi */}
          <div className="flex items-center gap-2.5 px-3.5 py-3 text-white" style={{ background: GRAD_135 }}>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/25 shadow-md">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
            </span>
            <div className="min-w-0 flex-1 leading-tight">
              <h2 className="truncate text-[15px] font-extrabold text-white">Laporan di {place}</h2>
              <p className="truncate text-[11px] text-white/85">{sub}</p>
            </div>
            <Link href="/wilayah" className="rounded-full bg-white/25 px-2.5 py-1 text-[11px] font-bold text-white transition-colors hover:bg-white/40">Ubah</Link>
            <button onClick={() => setOpen(false)} aria-label="Tutup panel" className="grid h-7 w-7 place-items-center rounded-full text-white/90 hover:bg-white/20">
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Filter + radius */}
          <div className="border-b border-[#DDF2C8] px-3 py-2.5">
            <div className="grid grid-cols-4 gap-1 rounded-full bg-[#F1FAEA] p-1">
              {filters.map((f) => {
                const on = filter === f.key;
                return (
                  <button
                    key={f.key}
                    onClick={() => setFilter(f.key)}
                    className="flex items-center justify-center gap-1 rounded-full py-1.5 text-[11px] font-bold transition-all active:scale-95"
                    style={on ? { background: f.meta.grad, color: f.meta.onGrad, boxShadow: `0 6px 14px -6px ${f.meta.glow}` } : { color: f.meta.text }}
                  >
                    {f.key !== "semua" && <span className="h-2 w-2 rounded-full" style={{ background: on ? f.meta.onGrad : f.meta.color }} />}
                    {f.label}
                    <span className="text-[10px] opacity-80">{counts[f.key]}</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Radius</span>
              {RADIUS.map((r) => (
                <button
                  key={r}
                  onClick={() => setRadius(r)}
                  className="rounded-full border px-2.5 py-0.5 text-[11px] font-bold transition-all active:scale-95"
                  style={radius === r ? { background: GRAD, color: "#fff", borderColor: "transparent" } : { background: "#fff", color: "#15803D", borderColor: "#9CCB45" }}
                >
                  {r} km
                </button>
              ))}
            </div>
          </div>

          {/* Daftar laporan (scroll) */}
          <div className="wl-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain p-2">
            {shown.map((l) => {
              const m = LEVEL_META[l.level];
              const isSel = l.id === selected?.id;
              return (
                <div
                  key={l.id}
                  ref={(node) => { rowRefs.current[l.id] = node; }}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedId(isSel ? null : l.id)}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), setSelectedId(isSel ? null : l.id))}
                  className="group mb-1.5 cursor-pointer rounded-xl border border-l-4 outline-none transition-all duration-200 hover:-translate-y-0.5 focus-visible:ring-2"
                  style={{
                    borderColor: m.border,
                    borderLeftColor: m.color,
                    background: isSel ? m.soft : "#fff",
                    boxShadow: isSel ? `0 0 0 2px ${m.color}, 0 10px 22px -10px ${m.glow}` : "0 4px 10px -8px rgba(0,0,0,.25)",
                  }}
                >
                  <div className="flex gap-2.5 p-2">
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg"><Foto l={l} /></div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="line-clamp-2 text-[12.5px] font-bold leading-tight">{l.judul}</h3>
                        <Badge level={l.level} />
                      </div>
                      <p className="mt-1 flex items-center gap-1 truncate text-[11px] text-on-surface-variant">
                        <span className="material-symbols-outlined text-[13px]" style={{ color: m.color }}>{KATEGORI[l.kategori].icon}</span>
                        <span className="truncate">{KATEGORI[l.kategori].label} · {agoText(l.menit)} · {l.jarak.toFixed(1)} km</span>
                      </p>
                    </div>
                  </div>

                  {isSel && (
                    <div className="wl-in px-2 pb-2">
                      <div className="group relative h-32 overflow-hidden rounded-lg">
                        <Foto l={l} big />
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/50 to-transparent" />
                        <span className="absolute bottom-1.5 left-2 flex items-center gap-1 text-[10px] font-semibold text-white drop-shadow">
                          <span className="material-symbols-outlined text-[12px]">location_on</span>{l.lokasi}
                        </span>
                      </div>
                      <p className="mt-2 line-clamp-3 text-[12px] leading-snug text-on-surface-variant">{l.deskripsi}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold" style={{ background: "#fff", color: m.text, border: `1px solid ${m.border}` }}>
                          <span className="material-symbols-outlined text-[13px]">{STATUS_ICON[l.status]}</span>{l.status}
                        </span>
                        <button
                          onClick={(e) => { e.stopPropagation(); setDetail(l); }}
                          className="ml-auto inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-bold transition-all hover:-translate-y-0.5 active:scale-95"
                          style={{ background: m.grad, color: m.onGrad, boxShadow: `0 8px 16px -8px ${m.glow}` }}
                        >
                          Foto &amp; detail <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {shown.length === 0 && (
              <div className="m-1 rounded-xl border border-dashed border-[#9CCB45] bg-[#F1FAEA] p-5 text-center">
                <span className="material-symbols-outlined text-[32px] text-[#1F9D55]">task_alt</span>
                <p className="mt-1 text-[13px] font-bold">Tidak ada laporan {filter === "semua" ? "" : `level ${filter} `}di radius ini</p>
                <button onClick={() => { setFilter("semua"); setRadius(25); }} className="mt-3 rounded-full px-4 py-1.5 text-xs font-bold text-white transition-all hover:-translate-y-0.5 active:scale-95" style={{ background: GRAD }}>
                  Perluas ke 25 km
                </button>
              </div>
            )}
          </div>

          {/* Footer: skor area + Cek Sekarang */}
          <div className="flex items-center gap-3 border-t border-[#DDF2C8] bg-white px-3 py-2.5">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-base font-black" style={{ background: sm.grad, color: sm.onGrad, boxShadow: `0 8px 18px -8px ${sm.glow}` }}>{skor}</span>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Skor area</p>
              <p className="text-[13px] font-extrabold" style={{ color: sm.text }}>{sm.label}</p>
            </div>
            <Link
              href="/beranda"
              className="wl-cta group relative flex items-center gap-1 overflow-hidden rounded-full px-4 py-2.5 text-[13px] font-bold text-white transition-all hover:-translate-y-0.5 active:scale-95"
              style={{ background: GRAD }}
            >
              <span className="pointer-events-none absolute inset-y-0 -left-full w-1/2 -skew-x-12 bg-white/35 transition-all duration-700 group-hover:left-[150%]" />
              <span className="relative">Cek Sekarang</span>
              <span className="wl-arrow material-symbols-outlined relative text-[16px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      )}

      {/* ================= DETAIL ================= */}
      {detail && (() => {
        const m = LEVEL_META[detail.level];
        const rows = [
          ["location_on", "Lokasi", detail.lokasi],
          [KATEGORI[detail.kategori].icon, "Kategori", KATEGORI[detail.kategori].label],
          ["schedule", "Dilaporkan", `${agoText(detail.menit)} oleh ${detail.pelapor}`],
          [STATUS_ICON[detail.status], "Status", detail.status],
          ["near_me", "Jarak", `${detail.jarak.toFixed(1)} km dari ${place}`],
        ];
        return (
          <div className="fixed inset-0 z-[700] grid place-items-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm" onClick={() => setDetail(null)}>
            <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white" style={{ animation: "wlPop .35s cubic-bezier(.16,1,.3,1) both", boxShadow: `0 30px 70px -16px ${m.glow}` }} onClick={(e) => e.stopPropagation()}>
              <div className="group relative h-60">
                <Foto l={detail} big />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />
                <Badge level={detail.level} className="absolute left-4 top-4 !px-2.5 !py-1 !text-[10px]" />
                <button onClick={() => setDetail(null)} aria-label="Tutup" className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-on-surface shadow-md transition-transform hover:scale-110">
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
              <div className="p-5">
                <h3 className="font-headline-sm text-headline-sm leading-snug">{detail.judul}</h3>
                <p className="mt-2 text-sm text-on-surface-variant">{detail.deskripsi}</p>
                <dl className="mt-4 grid gap-1.5">
                  {rows.map(([ic, k, v]) => (
                    <div key={k} className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: m.soft }}>
                      <span className="material-symbols-outlined text-[18px]" style={{ color: m.color }}>{ic}</span>
                      <dt className="w-24 shrink-0 text-[12px] text-on-surface-variant">{k}</dt>
                      <dd className="min-w-0 flex-1 text-[13px] font-bold">{v}</dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-5 flex gap-2">
                  <button onClick={() => setDetail(null)} className="flex-1 rounded-full border py-2.5 text-sm font-bold transition-all hover:-translate-y-0.5 active:scale-95" style={{ background: m.soft, color: m.text, borderColor: m.border }}>Tutup</button>
                  <button onClick={() => { setSelectedId(detail.id); setDetail(null); }} className="flex flex-1 items-center justify-center gap-1 rounded-full py-2.5 text-sm font-bold transition-all hover:-translate-y-0.5 active:scale-95" style={{ background: m.grad, color: m.onGrad, boxShadow: `0 10px 20px -8px ${m.glow}` }}>
                    <span className="material-symbols-outlined text-[18px]">map</span> Lihat di peta
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </section>
  );
}