"use client";

import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera, faCheckCircle, faExclamationTriangle, faImage, faRotateLeft } from "@fortawesome/free-solid-svg-icons";

export default function Lapor() {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState("");
  const [fileName, setFileName] = useState("");

  function openCamera() {
    inputRef.current?.click();
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setFileName(file.name);
  }

  function resetScan() {
    if (preview) URL.revokeObjectURL(preview);
    setPreview("");
    setFileName("");
    if (inputRef.current) inputRef.current.value = "";
  }

  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  return (
    <div className="mx-auto max-w-190 px-margin-mobile pb-20 pt-28 md:px-gutter">
      <div className="mb-6 text-center">
        <h1 className="font-headline-md text-headline-md">Lapor Kondisi Infrastruktur</h1>
        <p className="mt-2 font-body-md text-body-md text-on-surface-variant">
          Ambil foto tiang atau kabel dari jarak aman. Hasil penilaian otomatis akan tersedia setelah koneksi sistem siap.
        </p>
      </div>

      <div className="mb-6 flex items-start gap-3 rounded-xl border border-risk-kritis/30 bg-risk-kritis/10 p-4">
        <FontAwesomeIcon icon={faExclamationTriangle} className="mt-1 h-5 w-5 shrink-0 text-risk-kritis" />
        <div>
          <p className="font-label-bold text-label-bold text-risk-kritis">Peringatan Keselamatan</p>
          <p className="font-body-md text-body-md text-on-surface-variant">Jaga jarak aman. Jangan mendekati infrastruktur rusak dan ambil foto dari jarak minimal 5 meter.</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-outline-variant bg-card-surface shadow-[0_4px_12px_rgba(13,27,42,0.05)]">
        <div className="border-b border-outline-variant p-5">
          <div className="flex items-center gap-2 font-label-bold text-label-bold text-primary-container">
            <FontAwesomeIcon icon={faCamera} className="h-4 w-4" /> Scan kondisi jaringan
          </div>
          <p className="mt-1 font-body-md text-body-md text-on-surface-variant">Foto akan tersimpan di halaman ini saja. Belum ada pengiriman atau perhitungan model.</p>
        </div>

        <div className="p-5">
          {preview ? (
            <div className="space-y-4">
              <div className="overflow-hidden rounded-xl bg-surface-container">
                <img src={preview} alt="Preview foto kondisi infrastruktur" className="max-h-110 w-full object-contain" />
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="flex items-center gap-2 font-label-sm text-label-sm text-risk-aman"><FontAwesomeIcon icon={faCheckCircle} className="h-4 w-4" /> Foto siap diproses: {fileName}</p>
                <button type="button" onClick={resetScan} className="inline-flex items-center justify-center gap-2 rounded-full border border-outline px-5 py-3 font-label-bold text-label-bold text-on-surface transition hover:bg-surface-container-low"><FontAwesomeIcon icon={faRotateLeft} className="h-4 w-4" /> Ambil ulang</button>
              </div>
              <div className="rounded-xl bg-surface-container-low p-4 font-body-md text-body-md text-on-surface-variant">Foto sudah berhasil dipindai. Penilaian risiko menunggu koneksi model dan belum dihitung.</div>
            </div>
          ) : (
            <button type="button" onClick={openCamera} className="flex min-h-70 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-primary-container/50 bg-primary-container/5 px-6 text-center transition hover:border-primary-container hover:bg-primary-container/10">
              <span className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-primary-container text-on-primary"><FontAwesomeIcon icon={faCamera} className="h-7 w-7" /></span>
              <span className="font-headline-sm text-headline-sm text-primary-container">Buka Kamera untuk Scan</span>
              <span className="mt-2 font-body-md text-body-md text-on-surface-variant">atau pilih foto dari perangkatmu</span>
            </button>
          )}
          <input ref={inputRef} type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" />
          {!preview && <button type="button" onClick={openCamera} className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 font-label-bold text-label-bold text-on-primary transition hover:-translate-y-0.5"><FontAwesomeIcon icon={faImage} className="h-4 w-4" /> Pilih Foto dari Galeri</button>}
        </div>
      </div>
    </div>
  );
}
