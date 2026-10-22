"use client";
// Gambar RGB + overlay bounding box YOLO.
// bbox mengikuti kontrak layanan AI existing: {x, y, w, h} ternormalisasi 0–1, (x,y) = titik tengah.
import { useState } from "react";
import { defectLabel, pct } from "@/lib/hardware";

export function FrameImage({ frame, showBoxes = true, className = "aspect-[4/3]", onClick }) {
  const [err, setErr] = useState(false);
  const dets = (frame && frame.detections) || [];

  let placeholder = null;
  if (!frame) placeholder = { icon: "image", text: "Menunggu gambar" };
  else if (frame.upload_status === "failed") placeholder = { icon: "cloud_off", text: "Upload gambar gagal" };
  else if (frame.upload_status === "pending") placeholder = { icon: "hourglass_top", text: "Menunggu gambar terunggah" };
  else if (!frame.image_url) placeholder = { icon: "cloud_off", text: frame.storage === "ready" ? "Gambar tidak dapat diakses" : "Penyimpanan gambar belum dikonfigurasi" };
  else if (err) placeholder = { icon: "broken_image", text: "Gambar gagal dimuat (tautan mungkin kedaluwarsa)" };

  const Wrapper = onClick ? "button" : "div";
  return (
    <Wrapper type={onClick ? "button" : undefined} onClick={onClick}
      className={`relative block w-full overflow-hidden rounded-xl bg-surface-container-low ${className} ${onClick ? "cursor-zoom-in text-left" : ""}`}>
      {placeholder ? (
        <div className="grid h-full w-full place-items-center p-3 text-center text-on-surface-variant">
          <div>
            <span className="material-symbols-outlined text-3xl">{placeholder.icon}</span>
            <p className="font-body-md text-[12px]">{placeholder.text}</p>
          </div>
        </div>
      ) : (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={frame.image_url} alt={`Snapshot ${frame.frame_id}`} className="h-full w-full object-cover" loading="lazy" onError={() => setErr(true)} />
          {showBoxes &&
            dets.map((d) =>
              d.bbox ? (
                <div key={d.id} className="pointer-events-none absolute border-2 border-accent"
                  style={{
                    left: `${(d.bbox.x - d.bbox.w / 2) * 100}%`,
                    top: `${(d.bbox.y - d.bbox.h / 2) * 100}%`,
                    width: `${d.bbox.w * 100}%`,
                    height: `${d.bbox.h * 100}%`,
                  }}>
                  <span className="absolute -top-5 left-0 whitespace-nowrap rounded bg-accent px-1.5 text-[10px] font-bold text-on-surface">
                    {defectLabel(d.defect)} {pct(d.confidence)}
                  </span>
                </div>
              ) : null
            )}
        </>
      )}
    </Wrapper>
  );
}

export function DetectionList({ detections, empty = "Tidak ada kerusakan terdeteksi oleh model." }) {
  if (!detections || !detections.length) return <p className="font-body-md text-[13px] text-on-surface-variant">{empty}</p>;
  return (
    <ul className="space-y-2">
      {detections.map((d) => (
        <li key={d.id} className="flex items-center justify-between gap-3 rounded-xl bg-surface-container-low px-3 py-2">
          <div className="min-w-0">
            <p className="font-heading text-sm font-bold text-on-surface">{defectLabel(d.defect)}</p>
            <p className="font-body-md text-[11px] text-on-surface-variant">
              {d.model_version ? `Model ${d.model_version}` : "Versi model tidak dilaporkan"}
              {d.severity != null ? ` · severity ${Math.round(d.severity)}` : ""}
              {d.verified ? " · terverifikasi" : " · belum diverifikasi manusia"}
            </p>
          </div>
          <span className="shrink-0 font-heading text-lg font-extrabold text-brand">{pct(d.confidence)}</span>
        </li>
      ))}
    </ul>
  );
}
