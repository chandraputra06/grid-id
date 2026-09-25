"use client";
import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

const WARNA = { kritis: "#E5484D", waspada: "#F4B740", aman: "#21A366" };

// koordinat contoh per aset (samakan id dengan data di halaman monitoring)
const KOORD = {
  1: [-8.6705, 115.2412],
  2: [-8.7210, 115.2350],
  3: [-8.7050, 115.2280],
  4: [-8.6620, 115.2400],
};

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
      const map = L.map(ref.current, { scrollWheelZoom: false }).setView([-8.67, 115.22], 12);
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

  // gambar ulang marker setiap kali `zona` (hasil filter) berubah
  useEffect(() => {
    (async () => {
      const L = (await import("leaflet")).default;
      const layer = layerRef.current;
      if (!layer) return;
      layer.clearLayers(); // hapus marker lama → tidak numpuk
      zona.forEach((z) => {
        const pos = KOORD[z.id];
        if (!pos) return;
        L.circleMarker(pos, {
          radius: 11,
          color: WARNA[z.level],
          fillColor: WARNA[z.level],
          fillOpacity: 0.85,
          weight: 2,
        })
          .addTo(layer)
          .bindPopup(
            `<b style="font-family:Montserrat,sans-serif">${z.nama}</b><br/>
             <span style="color:${WARNA[z.level]};font-weight:700;text-transform:uppercase">${z.level}</span> · Skor ${z.skor}%<br/>
             <span style="font-size:12px;color:#5B6B82">${z.ket}</span>`
          );
      });
    })();
  }, [zona]);

  return <div ref={ref} className="h-full w-full" />;
}