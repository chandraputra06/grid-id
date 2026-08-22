"use client";
import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

const zones = [
  { name: "Denpasar Selatan", level: "KRITIS", color: "#E5484D", lat: -8.72, lng: 115.235, note: "Beban puncak + prediksi hujan lebat (BMKG)" },
  { name: "Denpasar Barat", level: "WASPADA", color: "#F4B740", lat: -8.66, lng: 115.19, note: "Hujan lebat diprediksi 3 hari ke depan" },
  { name: "Denpasar Timur", level: "WASPADA", color: "#F4B740", lat: -8.645, lng: 115.25, note: "5 laporan vegetasi dekat kabel" },
  { name: "Denpasar Utara", level: "AMAN", color: "#21A366", lat: -8.6, lng: 115.215, note: "Kondisi normal" },
];

export function PetaMap() {
  const ref = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    let map;
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !ref.current || mapRef.current) return;
      map = L.map(ref.current, { scrollWheelZoom: false }).setView([-8.66, 115.22], 12);
      mapRef.current = map;
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap · Cuaca: BMKG',
        maxZoom: 19,
      }).addTo(map);

      zones.forEach((z) => {
        L.circle([z.lat, z.lng], {
          radius: 1900,
          color: z.color,
          fillColor: z.color,
          fillOpacity: 0.28,
          weight: 2,
        })
          .addTo(map)
          .bindPopup(
            `<div style="font-family:Poppins,sans-serif;min-width:180px">
               <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
                 <strong style="font-family:Montserrat,sans-serif">${z.name}</strong>
                 <span style="background:${z.color};color:#fff;font-size:10px;font-weight:700;padding:2px 8px;border-radius:999px">${z.level}</span>
               </div>
               <div style="font-size:12px;color:#434655">${z.note}</div>
               <div style="font-size:10px;color:#747686;margin-top:6px">Sumber: BMKG</div>
             </div>`
          );
      });
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return <div ref={ref} className="h-full w-full" />;
}
