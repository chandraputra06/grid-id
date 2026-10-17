"use client";
import { useEffect, useRef } from "react";

// CSS Leaflet dimuat via <link> saat runtime (bukan diimpor lewat build),
// supaya Turbopack/PostCSS tidak memproses leaflet.css — penyebab crash build.
function ensureLeafletCss() {
  if (typeof document === "undefined") return;
  if (document.getElementById("leaflet-css")) return;
  const link = document.createElement("link");
  link.id = "leaflet-css";
  link.rel = "stylesheet";
  link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
  document.head.appendChild(link);
}

const WARNA = { kritis: "#E5484D", waspada: "#F4B740", aman: "#21A366" };
const STATUS_WARNA = { baru: "#2743D9", diproses: "#F4B740", terverifikasi: "#21A366", ditolak: "#9AA4B2" };
const STATUS_LABEL = { baru: "Baru", diproses: "Diproses", terverifikasi: "Terverifikasi", ditolak: "Ditolak" };

// Fallback koordinat contoh — dipakai hanya jika item tidak membawa lat/lng.
const KOORD = {
  1: [-8.6705, 115.2412],
  2: [-8.7210, 115.2350],
  3: [-8.7050, 115.2280],
  4: [-8.6620, 115.2400],
};

function posOf(z) {
  if (z.lat != null && z.lng != null) return [Number(z.lat), Number(z.lng)];
  return KOORD[z.id] || null;
}

function fmt(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

// zona   = aset (lingkaran penuh, warna per level)
// laporan = laporan warga/petugas (pin garis putus, warna per status)
export function PetaMap({ zona = [], laporan = [] }) {
  const ref = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    ensureLeafletCss();
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !ref.current || mapRef.current) return;
      const map = L.map(ref.current, { scrollWheelZoom: false }).setView([-8.67, 115.22], 11);
      mapRef.current = map;
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap · Cuaca: BMKG",
        maxZoom: 19,
      }).addTo(map);
      layerRef.current = L.layerGroup().addTo(map);
    })();
    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    (async () => {
      const L = (await import("leaflet")).default;
      const layer = layerRef.current;
      const map = mapRef.current;
      if (!layer || !map) return;
      layer.clearLayers();

      const pts = [];

      // Aset
      zona.forEach((z) => {
        const pos = posOf(z);
        if (!pos) return;
        pts.push(pos);
        const warna = WARNA[z.level] || "#5B6B82";
        L.circleMarker(pos, { radius: 10, color: warna, fillColor: warna, fillOpacity: 0.85, weight: 2 })
          .addTo(layer)
          .bindPopup(
            `<b style="font-family:Montserrat,sans-serif">${z.nama || ""}</b><br/>
             <span style="color:${warna};font-weight:700;text-transform:uppercase">${z.level || ""}</span>${z.skor != null ? ` · Skor ${z.skor}%` : ""}<br/>
             <span style="font-size:12px;color:#5B6B82">${z.ket || ""}</span>`
          );
      });

      // Laporan (pin garis putus, warna per status)
      laporan.forEach((r) => {
        if (r.lat == null || r.lng == null) return;
        const pos = [Number(r.lat), Number(r.lng)];
        pts.push(pos);
        const warna = STATUS_WARNA[r.status] || "#2743D9";
        const thumb = r.photo_url
          ? `<img src="${r.photo_url}" style="margin-top:4px;width:160px;height:90px;object-fit:cover;border-radius:6px"/>`
          : "";
        L.circleMarker(pos, {
          radius: 8,
          color: warna,
          fillColor: "#ffffff",
          fillOpacity: 0.95,
          weight: 3,
          dashArray: "3 3",
        })
          .addTo(layer)
          .bindPopup(
            `<b style="font-family:Montserrat,sans-serif">Laporan · ${STATUS_LABEL[r.status] || r.status || ""}</b><br/>
             <span style="font-size:12px;color:#5B6B82">${fmt(r.created_at)}${r.source ? " · " + r.source : ""}</span><br/>
             <span style="font-size:12px">${r.description || "Tanpa deskripsi"}</span>${thumb}`
          );
      });

      if (pts.length === 1) {
        map.setView(pts[0], 13);
      } else if (pts.length > 1) {
        map.fitBounds(L.latLngBounds(pts), { padding: [30, 30], maxZoom: 13 });
      }
      setTimeout(() => map.invalidateSize(), 0);
    })();
  }, [zona, laporan]);

  return <div ref={ref} className="h-full w-full" />;
}