"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

/*
  Persiapan:
  1) npm i leaflet
  2) Taruh di folder /public: grid-logos.png, maskot-semangat.png, dan bg-akses-lokasi.png
*/

/* ---------- Tema hijau soft sedikit kekuningan ---------- */
const GRAD = "linear-gradient(90deg, #1F9D55 0%, #4CBF6B 55%, #9CCB45 100%)";
const GRAD_135 = "linear-gradient(135deg, #1F9D55 0%, #4CBF6B 55%, #9CCB45 100%)";
const PAGE_BG = "linear-gradient(160deg, #FFFFFF 0%, #F1FAEA 50%, #DDF2C8 100%)"; // cadangan jika gambar belum termuat
const PAGE_IMG = "linear-gradient(160deg, rgba(255,255,255,0.80) 0%, rgba(241,250,234,0.95) 100%), url('/bg-akses-lokasi.png')";

/* ---------- Cakupan seluruh Pulau Bali ---------- */
const BALI_CENTER = [-8.4095, 115.1889];
const BALI_BOUNDS = [
  [-9.0, 114.35], // barat daya
  [-7.95, 115.8], // timur laut
];
const NOMINATIM = "https://nominatim.openstreetmap.org";

const inBali = (lat, lng) =>
  lat >= BALI_BOUNDS[0][0] && lat <= BALI_BOUNDS[1][0] && lng >= BALI_BOUNDS[0][1] && lng <= BALI_BOUNDS[1][1];

/* Petakan alamat Nominatim -> tingkat administrasi Indonesia */
function parseAdmin(addr = {}) {
  const kabupaten = addr.county || addr.city || addr.regency || addr.state_district || "";
  const kecamatan = addr.municipality || addr.city_district || addr.district || addr.subdistrict || "";
  const desa = addr.village || addr.suburb || addr.town || "";
  const banjar = addr.hamlet || addr.neighbourhood || addr.quarter || addr.isolated_dwelling || "";
  return {
    provinsi: addr.state || "Bali",
    kabupaten,
    kecamatan,
    desa,
    banjar,
  };
}

/* ---------- Quotes selama loading ---------- */
const QUOTES = [
  "Siaga hari ini, aman sepanjang hari.",
  "Satu penjaga, sejuta kewaspadaan.",
  "Lingkungan yang aman dimulai dari wilayahmu.",
  "Data yang tepat bisa menyelamatkan banyak orang.",
  "Tahu risikonya, tenang menghadapinya.",
  "Bersama kita jaga Bali tetap tangguh.",
];
const QUOTE_MS = 1700;
const LOAD_MS = 3800; // lama layar loading sebelum pindah halaman

/* [left, top, warna, ukuran, delay] bintang berkelap-kelip */
const STARS = [
  ["8%", "18%", "#FEF08A", 22, "0s"],
  ["86%", "14%", "#FFFFFF", 18, ".5s"],
  ["14%", "60%", "#FFFFFF", 16, "1s"],
  ["90%", "55%", "#FEF08A", 24, ".3s"],
  ["30%", "84%", "#FEF08A", 18, ".8s"],
  ["72%", "86%", "#FFFFFF", 20, "1.2s"],
  ["46%", "6%", "#FFFFFF", 14, ".6s"],
  ["62%", "24%", "#FEF08A", 14, "1.4s"],
];
/* [left, durasi, delay, ukuran] gelembung cahaya naik */
const BUBBLES = [
  ["10%", "6s", ".2s", 10],
  ["28%", "7s", "1.4s", 8],
  ["46%", "5.5s", ".8s", 12],
  ["64%", "6.5s", "2s", 9],
  ["82%", "7.5s", ".5s", 11],
  ["92%", "5s", "1.8s", 7],
];

/* ---------- Layar loading saat pindah halaman ---------- */
function TransitionOverlay({ text }) {
  const [q, setQ] = useState(() => Math.floor(Math.random() * QUOTES.length));

  useEffect(() => {
    const t = setInterval(() => setQ((n) => (n + 1) % QUOTES.length), QUOTE_MS);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="no-motion fixed inset-0 z-100 grid place-items-center overflow-hidden" style={{ background: GRAD_135, animation: "wlFade 0.4s ease-out both" }}>
      {/* Titik cahaya berkelip */}
      {[["12%", "20%", "0s"], ["82%", "16%", ".4s"], ["20%", "78%", ".8s"], ["88%", "70%", ".2s"], ["50%", "10%", ".6s"]].map(([l, tp, d], i) => (
        <span key={i} className="absolute h-3 w-3 rounded-full bg-[#FEF08A] blur-[1px]" style={{ left: l, top: tp, animation: `wlSpark 1.4s ease-in-out ${d} infinite` }} />
      ))}

      {/* Bintang kelap-kelip */}
      {STARS.map(([l, tp, c, s, d], i) => (
        <span key={`s${i}`} className="material-symbols-outlined absolute" style={{ left: l, top: tp, color: c, fontSize: s, fontVariationSettings: "'FILL' 1", filter: `drop-shadow(0 0 6px ${c})`, animation: `wlTwinkle 1.8s ease-in-out ${d} infinite` }}>auto_awesome</span>
      ))}

      {/* Gelembung cahaya naik pelan */}
      {BUBBLES.map(([l, dur, d, s], i) => (
        <span key={`b${i}`} className="absolute -bottom-4 rounded-full bg-white/40 blur-[1px]" style={{ left: l, width: s, height: s, animation: `wlFloat ${dur} linear ${d} infinite` }} />
      ))}

      <div className="flex flex-col items-center px-6 text-center">
        {/* Maskot dengan glow + bayangan */}
        <div className="relative" style={{ animation: "wlDrop 0.9s cubic-bezier(.3,1.3,.5,1) both" }}>
          <div className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl" style={{ background: "radial-gradient(circle, rgba(254,240,138,.85) 0%, rgba(255,255,255,.4) 55%, transparent 100%)", animation: "wlHalo 1.6s ease-in-out infinite" }} />
          <span className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/70" style={{ animation: "wlRing 2s ease-out 1s infinite" }} />
          <span className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#FEF08A]/80" style={{ animation: "wlRing 2s ease-out 2s infinite" }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/maskot-semangat.png"
            alt="GRID.ID"
            className="relative h-44 w-auto object-contain drop-shadow-[0_14px_20px_rgba(0,0,0,0.35)]"
            style={{ transformOrigin: "50% 100%", animation: "wlBounce 1.1s ease-in-out 0.9s infinite" }}
          />
          <div className="mx-auto -mt-1 h-3 w-24 rounded-full bg-black/30 blur-sm" style={{ animation: "wlShadow 1.1s ease-in-out 0.9s infinite" }} />
        </div>

        <p className="mt-6 text-base font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]" style={{ animation: "wlFade 0.6s ease-out 1.2s both" }}>{text}</p>

        {/* Progress bar */}
        <div className="relative mt-4 h-2.5 w-64 rounded-full bg-white/25 shadow-[inset_0_1px_3px_rgba(0,0,0,0.2)]">
          <div className="relative h-full rounded-full bg-linear-to-r from-white to-[#FEF08A] shadow-[0_0_14px_rgba(255,255,255,0.9)]" style={{ animation: `wlBar ${(LOAD_MS - 400) / 1000}s ease-in-out 0.3s both` }}>
            <span className="absolute -right-1.5 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-white shadow-[0_0_14px_4px_rgba(254,240,138,0.95)]" style={{ animation: "wlSpark 0.8s ease-in-out infinite" }} />
          </div>
        </div>

        {/* Quotes berganti-ganti */}
        <div className="mt-6 flex min-h-16 w-72 max-w-full items-center justify-center rounded-2xl bg-white/15 px-4 py-3 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.3)] backdrop-blur-sm">
          <p key={q} className="text-sm font-medium italic leading-snug text-white" style={{ animation: `wlQuote ${QUOTE_MS}ms ease-in-out both` }}>
            <span className="material-symbols-outlined mr-1 align-middle text-[16px] text-[#FEF08A]" style={{ fontVariationSettings: "'FILL' 1" }}>format_quote</span>
            {QUOTES[q]}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ---------- Pin lucu: mata + senyum, berubah "o" saat diangkat ---------- */
function Pin({ lifted }) {
  return (
    <svg width="40" height="52" viewBox="0 0 40 52" aria-hidden>
      <defs>
        <linearGradient id="wlPinG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#9CCB45" />
          <stop offset="1" stopColor="#15803D" />
        </linearGradient>
      </defs>
      <path d="M20 50C20 50 4 31 4 19a16 16 0 0 1 32 0c0 12-16 31-16 31z" fill="url(#wlPinG)" stroke="#fff" strokeWidth="2.5" />
      <circle cx="20" cy="19" r="10" fill="#fff" />
      <circle cx="16.5" cy="17.5" r="1.9" fill="#14532D" />
      <circle cx="23.5" cy="17.5" r="1.9" fill="#14532D" />
      {lifted ? (
        <circle cx="20" cy="23" r="2" fill="#14532D" />
      ) : (
        <path d="M16 21.5q4 3.6 8 0" stroke="#14532D" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      )}
    </svg>
  );
}

const rise = (n) => ({ animation: `wlRise 0.7s cubic-bezier(.16,1,.3,1) ${0.35 + n * 0.08}s both` });

export default function Wilayah() {
  const router = useRouter();
  const mapEl = useRef(null);
  const mapRef = useRef(null);
  const geoAbort = useRef(null);
  const skipGeocode = useRef(false);

  const [leaving, setLeaving] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [dropKey, setDropKey] = useState(0);
  const [center, setCenter] = useState({ lat: BALI_CENTER[0], lng: BALI_CENTER[1] });
  const [zoom, setZoom] = useState(9);
  const [admin, setAdmin] = useState(null); // hasil reverse geocoding
  const [resolving, setResolving] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const [note, setNote] = useState("");
  const [mapReady, setMapReady] = useState(false);

  /* ---------- Reverse geocoding (detail wilayah di titik pin) ---------- */
  const resolveAt = useCallback(async (lat, lng) => {
    if (geoAbort.current) geoAbort.current.abort();
    const ctrl = new AbortController();
    geoAbort.current = ctrl;
    setResolving(true);
    try {
      const url = `${NOMINATIM}/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=id`;
      const res = await fetch(url, { signal: ctrl.signal });
      const data = await res.json();
      if (data && data.address) setAdmin({ ...parseAdmin(data.address), raw: data.display_name });
      else setAdmin(null);
      setResolving(false);
    } catch (err) {
      if (err.name !== "AbortError") {
        setAdmin(null);
        setResolving(false);
      }
    }
  }, []);

  /* ---------- Inisialisasi Leaflet (client only) ---------- */
  useEffect(() => {
    let map;
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !mapEl.current) return;

      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      map = L.map(mapEl.current, {
        center: BALI_CENTER,
        zoom: 9,
        minZoom: 8,
        maxZoom: 19,
        maxBounds: [[-9.4, 113.9], [-7.6, 116.3]],
        maxBoundsViscosity: 0.8,
        zoomControl: false,
        attributionControl: true,
        inertia: true,
        tap: true,
        touchZoom: true, // pinch
        dragging: true, // drag & swipe
        scrollWheelZoom: true,
        doubleClickZoom: true,
        bounceAtZoomLimits: true,
      });

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      L.control.zoom({ position: "bottomright" }).addTo(map);
      map.fitBounds(BALI_BOUNDS, { padding: [10, 10] });

      map.on("movestart", () => setDragging(true));
      map.on("zoomend", () => setZoom(map.getZoom()));
      map.on("moveend", () => {
        const c = map.getCenter();
        setDragging(false);
        setCenter({ lat: c.lat, lng: c.lng });
        setDropKey((k) => k + 1);
        if (skipGeocode.current) {
          skipGeocode.current = false;
        }
        // Detail administrasi hanya bermakna jika sudah cukup di-zoom
        if (map.getZoom() >= 11) resolveAt(c.lat, c.lng);
        else setAdmin(null);
      });

      mapRef.current = map;
      setMapReady(true);
      setZoom(map.getZoom());
      setTimeout(() => map.invalidateSize(), 100);
    })();

    return () => {
      cancelled = true;
      if (geoAbort.current) geoAbort.current.abort();
      if (map) map.remove();
      mapRef.current = null;
    };
  }, [resolveAt]);

  /* ---------- Jaga peta tetap pas saat ukuran layout berubah ---------- */
  useEffect(() => {
    if (!mapReady || !mapEl.current) return;
    const ro = new ResizeObserver(() => mapRef.current?.invalidateSize());
    ro.observe(mapEl.current);
    return () => ro.disconnect();
  }, [mapReady]);

  /* ---------- Cari wilayah (debounce) ---------- */
  useEffect(() => {
    const q = query.trim();
    if (q.length < 3) {
      setResults([]);
      return;
    }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const [[s, w], [n, e]] = BALI_BOUNDS;
        const url = `${NOMINATIM}/search?format=jsonv2&q=${encodeURIComponent(q)}&countrycodes=id&viewbox=${w},${n},${e},${s}&bounded=1&addressdetails=1&limit=6&accept-language=id`;
        const res = await fetch(url, { signal: ctrl.signal });
        const data = await res.json();
        setResults(Array.isArray(data) ? data : []);
      } catch (err) {
        if (err.name !== "AbortError") setResults([]);
      }
      setSearching(false);
    }, 500);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [query]);

  const flyTo = (lat, lng, z = 15) => {
    if (!mapRef.current) return;
    mapRef.current.flyTo([lat, lng], z, { duration: 1.1 });
  };

  const pickResult = (r) => {
    setNote("");
    setQuery("");
    setResults([]);
    const z = r.boundingbox ? 14 : 15;
    flyTo(parseFloat(r.lat), parseFloat(r.lon), z);
  };

  const resetBali = () => {
    if (mapRef.current) mapRef.current.flyToBounds(BALI_BOUNDS, { padding: [10, 10], duration: 1 });
  };

  const useMyLocation = () => {
    setNote("");
    if (!navigator.geolocation) {
      setNote("Browsermu belum mendukung GPS. Geser peta untuk memilih manual.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setLocating(false);
        const { latitude, longitude } = p.coords;
        if (inBali(latitude, longitude)) flyTo(latitude, longitude, 16);
        else setNote("Lokasimu di luar Pulau Bali. Geser peta untuk memilih wilayah.");
      },
      () => {
        setLocating(false);
        setNote("Izin lokasi ditolak. Geser peta untuk memilih manual.");
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const go = (href, text) => {
    if (leaving) return;
    try {
      localStorage.setItem(
        "wilayah",
        JSON.stringify({ lat: center.lat, lng: center.lng, ...(admin || {}) })
      );
    } catch {}
    setLeaving(text);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setTimeout(() => router.push(href), reduce ? 300 : LOAD_MS);
  };

  /* Tingkat detail yang sedang ditampilkan */
  const levels = [
    { key: "kabupaten", label: "Kabupaten / Kota", icon: "domain" },
    { key: "kecamatan", label: "Kecamatan", icon: "location_city" },
    { key: "desa", label: "Desa / Kelurahan", icon: "holiday_village" },
    { key: "banjar", label: "Banjar / Dusun", icon: "home_pin" },
  ];
  const zoomHint =
    zoom < 11 ? "Zoom lebih dekat untuk melihat detail wilayah" : zoom < 14 ? "Zoom lagi untuk detail desa & banjar" : "";

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto" style={{ background: PAGE_BG, backgroundImage: PAGE_IMG, backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" }}>
      <style>{`
        @keyframes wlFade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes wlDrop { 0% { transform: translateY(-140%) scale(.8); opacity: 0 } 55% { transform: translateY(12%) scale(1.05); opacity: 1 } 75% { transform: translateY(-6%) } 100% { transform: translateY(0) } }
        @keyframes wlBounce { 0%,100% { transform: translateY(0) scale(1,1) rotate(-3deg) } 20% { transform: translateY(0) scale(1.08,.92) rotate(0) } 50% { transform: translateY(-28px) scale(.95,1.06) rotate(3deg) } 80% { transform: translateY(0) scale(1.06,.94) rotate(-1deg) } }
        @keyframes wlShadow { 0%,100% { transform: scaleX(1); opacity: .9 } 50% { transform: scaleX(.6); opacity: .5 } }
        @keyframes wlHalo { 0%,100% { opacity: .5; transform: translate(-50%,-50%) scale(.9) } 50% { opacity: .95; transform: translate(-50%,-50%) scale(1.15) } }
        @keyframes wlBar { from { width: 0 } to { width: 100% } }
        @keyframes wlSpark { 0%,100% { opacity: .2; transform: scale(.6) } 50% { opacity: 1; transform: scale(1.2) } }
        @keyframes wlTwinkle { 0%,100% { opacity: .2; transform: scale(.5) rotate(0deg) } 50% { opacity: 1; transform: scale(1.3) rotate(30deg) } }
        @keyframes wlFloat { 0% { transform: translateY(0); opacity: 0 } 15% { opacity: .8 } 100% { transform: translateY(-110vh); opacity: 0 } }
        @keyframes wlRing { 0% { transform: translate(-50%,-50%) scale(.6); opacity: .8 } 100% { transform: translate(-50%,-50%) scale(1.7); opacity: 0 } }
        @keyframes wlQuote { 0% { opacity: 0; transform: translateY(10px) } 15%,85% { opacity: 1; transform: translateY(0) } 100% { opacity: 0; transform: translateY(-8px) } }

        @keyframes wlCard { from { opacity: 0; transform: translateY(28px) scale(.97) } to { opacity: 1; transform: translateY(0) scale(1) } }
        @keyframes wlRise { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes wlGlow { 0%,100% { box-shadow: 0 8px 20px -6px rgba(31,157,85,.7), 0 0 0 rgba(156,203,69,0) } 50% { box-shadow: 0 8px 22px -6px rgba(31,157,85,.8), 0 0 26px rgba(156,203,69,.6) } }
        @keyframes wlWiggle { 0%,100% { transform: translateX(0) } 50% { transform: translateX(4px) } }
        @keyframes wlDropPin { 0% { transform: translateY(-14px) scale(1.08) } 55% { transform: translateY(2px) scale(.96,1.04) } 100% { transform: translateY(0) scale(1) } }
        @keyframes wlRipple { 0% { transform: translate(-50%,-50%) scale(.2); opacity: .7 } 100% { transform: translate(-50%,-50%) scale(1.6); opacity: 0 } }
        @keyframes wlPulse { 0%,100% { transform: translate(-50%,-50%) scale(1); opacity: .45 } 50% { transform: translate(-50%,-50%) scale(1.5); opacity: .15 } }
        @keyframes wlChip { from { opacity: 0; transform: translateY(8px) scale(.96) } to { opacity: 1; transform: translateY(0) scale(1) } }
        @keyframes wlHint { 0%,100% { opacity: .55 } 50% { opacity: 1 } }
        @keyframes wlWobble { 0%,100% { transform: rotate(-4deg) } 50% { transform: rotate(4deg) } }

        .wl-btn { animation: wlGlow 2.6s ease-in-out 1.6s infinite; }
        .wl-btn:hover { animation: none; }
        .wl-arrow { animation: wlWiggle 1.4s ease-in-out infinite; }
        .fld:focus { border-color: #4CBF6B; box-shadow: 0 0 0 4px rgba(156,203,69,.35); }

        /* Leaflet: samakan dengan tema */
        .wl-map .leaflet-container { width: 100%; height: 100%; background: #E9F5DA; font-family: inherit; touch-action: none; }
        .wl-map .leaflet-control-zoom { border: none !important; box-shadow: 0 6px 16px -6px rgba(31,157,85,.6); border-radius: 12px; overflow: hidden; }
        .wl-map .leaflet-control-zoom a { color: #15803D; background: rgba(255,255,255,.95); border-bottom-color: #E8F7DC; }
        .wl-map .leaflet-control-zoom a:hover { background: #F1FAEA; }
        .wl-map .leaflet-control-attribution { font-size: 9px; background: rgba(255,255,255,.75); }

        @media (prefers-reduced-motion: reduce) {
          .no-motion, .no-motion *, .wl-btn, .wl-arrow { animation: none !important; }
        }
      `}</style>

      {leaving && <TransitionOverlay text={leaving} />}

      <div className="relative z-10 grid min-h-full place-items-center px-4 py-10">
        <div
          className="no-motion grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/70 bg-white/90 shadow-[0_24px_60px_-12px_rgba(31,157,85,0.45)] backdrop-blur-md md:grid-cols-[1.15fr_1fr] md:grid-rows-[auto_1fr_auto]"
          style={{ animation: "wlCard 0.9s cubic-bezier(.16,1,.3,1) both" }}
        >
          {/* ===== Header + Cari (kanan di desktop, atas di HP) ===== */}
          <div className="p-6 pb-0 sm:p-8 sm:pb-0 md:col-start-2 md:row-start-1 md:pl-10">
            <div className="text-center md:text-left" style={rise(0)}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/grid-logos.png" alt="GRID.ID" className="mx-auto mb-3 h-10 w-auto object-contain md:mx-0" />
              <h1 className="font-headline-sm text-headline-sm">Pilih wilayahmu</h1>
              <p className="mt-1 font-body-md text-body-md text-on-surface-variant">
                Geser peta Bali sampai pin tepat di lokasimu. Zoom untuk lihat desa &amp; banjar.
              </p>
            </div>

            {/* Cari */}
            <div className="relative mt-5" style={rise(1)}>
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-outline">search</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari kabupaten, kecamatan, desa, atau banjar"
                className="fld w-full rounded-xl border border-outline-variant bg-white/80 py-2.5 pl-10 pr-10 font-body-md text-body-md outline-none transition-all"
              />
              {searching && (
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-[18px] text-[#1F9D55]">progress_activity</span>
              )}
            </div>

            {/* Hasil pencarian + GPS */}
            <div className="mt-3 overflow-hidden rounded-xl border border-outline-variant bg-white/70" style={rise(2)}>
              {query.trim().length >= 3 && !searching && results.length === 0 && (
                <p className="p-3 text-center font-label-sm text-label-sm text-on-surface-variant">Wilayah tidak ditemukan. Coba geser peta.</p>
              )}
              {results.map((r) => {
                const a = parseAdmin(r.address);
                const title = r.name || r.display_name.split(",")[0];
                const sub = [a.desa, a.kecamatan, a.kabupaten].filter(Boolean).join(", ");
                return (
                  <button
                    key={r.place_id}
                    onClick={() => pickResult(r)}
                    className="flex w-full items-center gap-3 border-b border-outline-variant/60 p-3 text-left transition-colors hover:bg-[#F1FAEA]"
                  >
                    <span className="material-symbols-outlined text-[20px] text-[#1F9D55]">location_on</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-label-bold text-label-bold">{title}</p>
                      <p className="truncate font-label-sm text-label-sm text-on-surface-variant">{sub || r.display_name}</p>
                    </div>
                  </button>
                );
              })}
              <button
                onClick={useMyLocation}
                disabled={locating}
                className="flex w-full items-center gap-3 p-3 text-left text-[#15803D] transition-colors hover:bg-[#F1FAEA] disabled:opacity-60"
              >
                <span className={`material-symbols-outlined text-[20px] ${locating ? "animate-spin" : ""}`}>{locating ? "progress_activity" : "my_location"}</span>
                <span className="font-label-bold text-label-bold">{locating ? "Mencari lokasimu…" : "Gunakan Lokasi Saat Ini"}</span>
              </button>
            </div>

            <p role="status" aria-live="polite" className={`mt-2 text-center font-label-sm text-label-sm text-[#B45309] md:text-left ${note ? "" : "hidden"}`}>{note}</p>
          </div>

          {/* ===== Peta (kiri di desktop, tengah di HP) ===== */}
          <div
            className="wl-map relative mt-4 h-80 w-full sm:h-96 md:col-start-1 md:row-span-3 md:row-start-1 md:mt-0 md:h-auto md:min-h-150"
            style={rise(3)}
          >
            <div ref={mapEl} className="absolute inset-0" role="application" aria-label="Peta Bali. Seret atau geser untuk memindahkan, cubit atau scroll untuk zoom." />

            {!mapReady && (
              <div className="absolute inset-0 grid place-items-center bg-[#E9F5DA] text-sm font-semibold text-[#3F6B2A]">Memuat peta Bali…</div>
            )}

            {/* Pin tetap di tengah peta (peta yang bergerak) */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 z-500">
              <span className="absolute h-10 w-10 rounded-full bg-[#4CBF6B]/40" style={{ animation: "wlPulse 2s ease-in-out infinite", left: 0, top: 0 }} />
              <span className="absolute rounded-full bg-black/25 blur-[2px]" style={{ width: dragging ? 12 : 18, height: dragging ? 5 : 7, left: 0, top: 0, transform: "translate(-50%,-50%)", transition: "all .2s" }} />
              <span key={dropKey} className="absolute h-14 w-14 rounded-full border-2 border-[#4CBF6B]" style={{ left: 0, top: 0, opacity: 0, animation: dropKey > 0 ? "wlRipple .8s ease-out" : "none" }} />
              <div style={{ transform: "translate(-50%,-100%)" }}>
                <div
                  key={dragging ? "up" : `down-${dropKey}`}
                  style={{
                    transformOrigin: "50% 100%",
                    animation: dragging ? "wlWobble .5s ease-in-out infinite" : "wlDropPin .5s cubic-bezier(.3,1.4,.5,1)",
                    translate: dragging ? "0 -12px" : "0 0",
                    transition: "translate .2s",
                  }}
                  className="drop-shadow-[0_6px_6px_rgba(21,128,61,0.45)]"
                >
                  <Pin lifted={dragging} />
                </div>
              </div>
            </div>

            {/* Tombol lihat seluruh Bali */}
            <button
              onClick={resetBali}
              aria-label="Lihat seluruh Bali"
              className="absolute left-3 top-3 z-500 flex items-center gap-1 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-bold text-[#15803D] shadow-md transition-colors hover:bg-[#F1FAEA]"
            >
              <span className="material-symbols-outlined text-[16px]">zoom_out_map</span>
              Seluruh Bali
            </button>

            <span className="pointer-events-none absolute bottom-3 left-1/2 z-500 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/85 px-3 py-1 text-[10px] font-semibold text-[#3F6B2A]" style={{ animation: "wlHint 2.4s ease-in-out infinite" }}>
              Geser &amp; cubit peta untuk memilih
            </span>
          </div>

          {/* ===== Detail wilayah di titik pin ===== */}
          <div className="px-6 pt-4 sm:px-8 md:col-start-2 md:row-start-2 md:pl-10" style={rise(4)}>
            <div
              key={dropKey}
              className="rounded-2xl border border-[#9CCB45]/50 bg-linear-to-r from-[#F1FAEA] to-[#E8F7DC] p-3"
              style={{ animation: "wlChip .45s cubic-bezier(.3,1.3,.5,1) both" }}
              aria-live="polite"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-white shadow-md" style={{ background: GRAD_135 }}>
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
                </span>
                <div className="min-w-0">
                  <p className="truncate font-label-bold text-label-bold">
                    {admin ? admin.banjar || admin.desa || admin.kecamatan || admin.kabupaten || "Bali" : "Provinsi Bali"}
                  </p>
                  <p className="font-label-sm text-label-sm tabular-nums text-[#3F6B2A]">
                    {center.lat.toFixed(5)}, {center.lng.toFixed(5)}
                  </p>
                </div>
                {resolving && <span className="material-symbols-outlined ml-auto animate-spin text-[18px] text-[#1F9D55]">progress_activity</span>}
              </div>

              {admin ? (
                <dl className="mt-3 grid grid-cols-1 gap-1.5">
                  {levels.map((l) => (
                    <div key={l.key} className="flex items-center gap-2 rounded-lg bg-white/70 px-2.5 py-1.5">
                      <span className="material-symbols-outlined text-[16px] text-[#1F9D55]">{l.icon}</span>
                      <dt className="w-28 shrink-0 font-label-sm text-label-sm text-on-surface-variant">{l.label}</dt>
                      <dd className="min-w-0 flex-1 truncate font-label-bold text-label-bold">{admin[l.key] || "—"}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="mt-2 font-label-sm text-label-sm text-on-surface-variant">{zoomHint || "Detail wilayah tidak ditemukan di titik ini."}</p>
              )}
            </div>
          </div>

          {/* ===== Dots + tombol Selesai ===== */}
          <div className="p-6 pt-4 sm:p-8 sm:pt-4 md:col-start-2 md:row-start-3 md:pl-10">
            <div className="flex justify-center gap-1.5" style={rise(5)}>
              <span className="h-1.5 w-1.5 rounded-full bg-outline-variant" />
              <span className="h-1.5 w-1.5 rounded-full bg-outline-variant" />
              <span className="h-1.5 w-6 rounded-full" style={{ background: GRAD }} />
            </div>

            <div style={rise(6)}>
              <button
                onClick={() => go("/selesai", "Menyiapkan berandamu…")}
                className="wl-btn group relative mt-4 flex w-full items-center justify-center gap-2 overflow-hidden rounded-full py-3 font-label-bold text-label-bold text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_30px_-4px_rgba(31,157,85,0.8),0_0_28px_rgba(156,203,69,0.75)] active:translate-y-0 active:scale-95 active:shadow-[0_0_36px_rgba(156,203,69,1)]"
                style={{ background: GRAD, textShadow: "0 1px 3px rgba(0,0,0,0.25)" }}
              >
                <span className="pointer-events-none absolute inset-y-0 -left-full w-1/2 -skew-x-12 bg-white/35 transition-all duration-700 group-hover:left-[150%]" />
                <span className="relative">Selesai</span>
                <span className="wl-arrow material-symbols-outlined relative text-[18px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}