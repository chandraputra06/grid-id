"use client";
import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

const WARNA = { kritis: "#E5484D", waspada: "#F4B740", aman: "#21A366" };

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

export function PetaMap({ zona = [] }) {
  const ref = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);

  // buat peta sekali
  useEffect(() => {
    let cancelled = false;
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
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    };
  }, []);

  // gambar ulang marker setiap kali `zona` (hasil filter / data API) berubah
  useEffect(() => {
    (async () => {
      const L = (await import("leaflet")).default;
      const layer = layerRef.current;
      const map = mapRef.current;
      if (!layer || !map) return;
      layer.clearLayers(); // hapus marker lama → tidak numpuk

      const pts = [];
      zona.forEach((z) => {
        const pos = posOf(z);
        if (!pos) return;
        pts.push(pos);
        const warna = WARNA[z.level] || "#5B6B82";
        L.circleMarker(pos, {
          radius: 10,
          color: warna,
          fillColor: warna,
          fillOpacity: 0.85,
          weight: 2,
        })
          .addTo(layer)
          .bindPopup(
            `<b style="font-family:Montserrat,sans-serif">${z.nama || ""}</b><br/>
             <span style="color:${warna};font-weight:700;text-transform:uppercase">${z.level || ""}</span>${z.skor != null ? ` · Skor ${z.skor}%` : ""}<br/>
             <span style="font-size:12px;color:#5B6B82">${z.ket || ""}</span>`
          );
      });

      if (pts.length === 1) {
        map.setView(pts[0], 13);
      } else if (pts.length > 1) {
        map.fitBounds(L.latLngBounds(pts), { padding: [30, 30], maxZoom: 13 });
      }
      // kontainer kadang belum punya ukuran saat init → recalculate agar peta tidak abu-abu
      setTimeout(() => map.invalidateSize(), 0);
    })();
  }, [zona]);

  return <div ref={ref} className="h-full w-full" />;
}