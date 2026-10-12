"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCamera,
  faCameraRotate,
  faCheckCircle,
  faExclamationTriangle,
  faImage,
  faRotateLeft,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

const LOAD_DURATION_MS = 2000;
const QUOTES = [
  "Mohon tunggu, sistem sedang disiapkan...",
  "Please wait, sebentar lagi siap digunakan...",
  "Hampir selesai, kamera akan segera terbuka...",
];

export default function Lapor() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [preview, setPreview] = useState("");
  const [fileName, setFileName] = useState("");

  // Loading screen
  const [showLoader, setShowLoader] = useState(false);
  const [progress, setProgress] = useState(0);
  const [quoteIndex, setQuoteIndex] = useState(0);

  // Kamera
  const [showCamera, setShowCamera] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [facingMode, setFacingMode] = useState("environment");
  const [retryKey, setRetryKey] = useState(0);
  const [flash, setFlash] = useState(false);

  // Semua tombol di kotak scan: loading 5 detik lalu buka kamera
  function startLoading() {
    setProgress(0);
    setQuoteIndex(0);
    setShowLoader(true);
  }

  function closeLoader() {
    setShowLoader(false);
    setProgress(0);
    setQuoteIndex(0);
  }

  function closeCamera() {
    setShowCamera(false);
    setCameraReady(false);
    setCameraError("");
  }

  function stopStream() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  function setPhoto(file) {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
    setFileName(file.name);
  }

  function resetScan() {
    if (preview) URL.revokeObjectURL(preview);
    setPreview("");
    setFileName("");
  }

  // Ambil foto dari video kamera
  function capturePhoto() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);

    // Efek kilatan putih seperti kamera beneran
    setFlash(true);
    setTimeout(() => setFlash(false), 200);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `foto-${Date.now()}.jpg`, { type: "image/jpeg" });
        setPhoto(file);
        setTimeout(closeCamera, 250);
      },
      "image/jpeg",
      0.92
    );
  }

  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  // Loading 5 detik: progress bar + ganti quote, lalu buka kamera
  useEffect(() => {
    if (!showLoader) return;
    const start = Date.now();
    const tick = setInterval(() => {
      const elapsed = Date.now() - start;
      const p = Math.min((elapsed / LOAD_DURATION_MS) * 100, 100);
      setProgress(p);
      setQuoteIndex(Math.min(Math.floor(elapsed / (LOAD_DURATION_MS / QUOTES.length)), QUOTES.length - 1));
      if (p >= 100) {
        clearInterval(tick);
        setShowLoader(false);
        setShowCamera(true);
      }
    }, 100);
    return () => clearInterval(tick);
  }, [showLoader]);

  // Nyalakan kamera saat layar kamera tampil (ulang saat ganti kamera atau coba lagi)
  useEffect(() => {
    if (!showCamera) return;
    let cancelled = false;

    async function startCamera() {
      setCameraError("");
      setCameraReady(false);
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError("Kamera tidak didukung. Pastikan halaman dibuka lewat localhost atau HTTPS.");
        return;
      }
      try {
        stopStream();
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: facingMode } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play?.().catch(() => {});
        }
      } catch (err) {
        if (err?.name === "NotAllowedError") {
          setCameraError("Izin kamera ditolak. Izinkan akses kamera di pengaturan browser, lalu coba lagi.");
        } else {
          setCameraError("Kamera tidak ditemukan atau sedang dipakai aplikasi lain.");
        }
      }
    }

    startCamera();
    return () => {
      cancelled = true;
      stopStream();
    };
  }, [showCamera, facingMode, retryKey]);

  // Kunci scroll saat overlay tampil + tutup dengan tombol Esc
  useEffect(() => {
    if (!showLoader && !showCamera) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (showCamera) closeCamera();
      else closeLoader();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [showLoader, showCamera]);

  return (
    <div className="relative isolate min-h-screen bg-[url('/bg-scan.png')] bg-cover bg-center bg-no-repeat">
      {/* Cover gradient biru tua -> biru cerah di atas background image */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#0A1F44] to-[#1E90FF] opacity-80" />

      {/* Loading screen layar penuh (di-portal ke body supaya menutupi navbar juga) */}
      {showLoader &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0A1F44E6] p-5">
            <div className="animate-quote-fade relative w-full max-w-sm rounded-2xl bg-white px-6 pb-6 pt-5 text-center shadow-[0_10px_40px_#00000080]">
              {/* Tombol X */}
              <button
                type="button"
                onClick={closeLoader}
                aria-label="Tutup"
                className="absolute -right-3 -top-3 grid h-9 w-9 place-items-center rounded-full border-2 border-white bg-[#0020a1] text-white shadow-[0_4px_10px_#00000059] transition hover:scale-110 hover:bg-[#991B1B]"
              >
                <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
              </button>

              <img
                src="/maskot-loading.png"
                alt="Maskot"
                className="animate-mascot-bounce mx-auto mb-4 h-28 w-auto object-contain"
              />

              {/* Loading bar */}
              <div className="h-3 w-full overflow-hidden rounded-full bg-[#E0F2FE]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#38BDF8] to-[#0020a1] transition-[width] duration-100 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-2 font-label-sm text-label-sm text-[#0369A1]">{Math.round(progress)}%</p>

              {/* Quote berganti 3 variasi */}
              <p key={quoteIndex} className="animate-quote-fade mt-3 min-h-12 font-body-md text-body-md text-[#0A1F44]">
                {QUOTES[quoteIndex]}
              </p>
            </div>
          </div>,
          document.body
        )}

      {/* Layar kamera live (layar penuh) dengan animasi buka diafragma */}
      {showCamera &&
        createPortal(
          <div className="animate-camera-open fixed inset-0 z-[110] flex flex-col bg-[#000000]">
            {/* Bar atas */}
            <div className="flex items-center justify-between bg-[#0A1F44] px-4 py-3 text-white">
              <div className="flex items-center gap-2 font-label-bold text-label-bold">
                <FontAwesomeIcon icon={faCamera} className="h-4 w-4" /> Scan kondisi jaringan
              </div>
              <button
                type="button"
                onClick={closeCamera}
                aria-label="Tutup kamera"
                className="grid h-9 w-9 place-items-center rounded-full bg-[#FFFFFF26] text-white transition hover:bg-[#991B1B]"
              >
                <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
              </button>
            </div>

            {/* Area video */}
            <div className="relative flex-1 overflow-hidden">
              {cameraError ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 px-8 text-center">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="h-10 w-10 text-[#FF4D4D]" />
                  <p className="max-w-sm font-body-md text-body-md text-white">{cameraError}</p>
                  <button
                    type="button"
                    onClick={() => setRetryKey((k) => k + 1)}
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#38BDF8] to-[#0020a1] px-6 py-3 font-label-bold text-label-bold text-white shadow-md transition hover:-translate-y-1"
                  >
                    <FontAwesomeIcon icon={faRotateLeft} className="h-4 w-4" /> Coba Lagi
                  </button>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    onLoadedData={() => setCameraReady(true)}
                    className={`h-full w-full object-cover transition-opacity duration-700 ${cameraReady ? "opacity-100" : "opacity-0"} ${facingMode === "user" ? "-scale-x-100" : ""}`}
                  />

                  {/* Teks saat kamera menyala */}
                  {!cameraReady && (
                    <p className="absolute inset-0 grid place-items-center font-label-sm text-label-sm text-white">
                      Menyalakan kamera...
                    </p>
                  )}

                  {/* Bingkai viewfinder */}
                  <div className="animate-viewfinder-in pointer-events-none absolute inset-8 sm:inset-16">
                    <span className="absolute left-0 top-0 h-8 w-8 rounded-tl-lg border-l-4 border-t-4 border-[#FFFFFF]" />
                    <span className="absolute right-0 top-0 h-8 w-8 rounded-tr-lg border-r-4 border-t-4 border-[#FFFFFF]" />
                    <span className="absolute bottom-0 left-0 h-8 w-8 rounded-bl-lg border-b-4 border-l-4 border-[#FFFFFF]" />
                    <span className="absolute bottom-0 right-0 h-8 w-8 rounded-br-lg border-b-4 border-r-4 border-[#FFFFFF]" />
                  </div>

                  <p className="pointer-events-none absolute left-0 right-0 top-8 text-center font-label-sm text-label-sm text-white drop-shadow-[0_1px_4px_#000000CC]">
                    Arahkan ke tiang atau kabel dari jarak minimal 5 meter
                  </p>
                </>
              )}

              {/* Kilatan putih saat foto diambil */}
              <div
                className={`pointer-events-none absolute inset-0 bg-[#FFFFFF] transition-opacity duration-200 ${flash ? "opacity-100" : "opacity-0"}`}
              />
            </div>

            {/* Bar bawah: rana + ganti kamera */}
            {!cameraError && (
              <div className="flex items-center justify-center bg-[#0A1F44] px-6 py-5">
                <div className="grid w-full max-w-sm grid-cols-3 items-center">
                  <div />
                  <button
                    type="button"
                    onClick={capturePhoto}
                    aria-label="Ambil foto"
                    className="mx-auto grid h-16 w-16 place-items-center rounded-full border-4 border-[#FFFFFF] transition active:scale-90"
                  >
                    <span className="block h-12 w-12 rounded-full bg-[#FFFFFF] transition hover:bg-[#BAE6FD]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setFacingMode((m) => (m === "environment" ? "user" : "environment"))}
                    aria-label="Ganti kamera"
                    className="ml-auto grid h-11 w-11 place-items-center rounded-full bg-[#FFFFFF26] text-white transition hover:bg-[#FFFFFF4D]"
                  >
                    <FontAwesomeIcon icon={faCameraRotate} className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </div>,
          document.body
        )}

      <div className="mx-auto max-w-190 px-margin-mobile pb-20 pt-28 md:px-gutter">
        <div className="mb-6 text-center">
          <h1 className="font-headline-md text-headline-md text-white">Lapor Kondisi Infrastruktur</h1>
          <p className="mt-2 font-body-md text-body-md text-white/85">
            Ambil foto tiang atau kabel dari jarak aman. Hasil penilaian otomatis akan tersedia setelah koneksi sistem siap.
          </p>
        </div>

        {/* Peringatan Keselamatan */}
        <div className="group relative mb-6 overflow-hidden rounded-xl border border-[#FCA5A599] bg-gradient-to-r from-white to-[#FECACA] p-4 pr-32 sm:pr-40">
          <div className="relative z-10">
            {/* Capsule: icon + judul */}
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#991B1B] to-[#FF4D4D] px-4 py-1.5 text-white shadow-[0_4px_10px_#DC262659]">
              <FontAwesomeIcon icon={faExclamationTriangle} className="h-4 w-4 shrink-0 text-white" />
              <p className="font-label-bold text-label-bold text-white">Peringatan Keselamatan</p>
            </div>

            <p className="mt-2 pl-4 font-body-md text-body-md text-on-surface-variant">
              <span className="font-bold text-[#DC2626]">Jaga jarak aman.</span> Jangan mendekati infrastruktur rusak
              <br />
              dan ambil foto dari jarak <span className="font-bold text-[#DC2626]">minimal 5 meter.</span>
            </p>
          </div>

          {/* Glow merah: fade in setelah maskot pop up, lebih terang saat hover */}
          <div className="pointer-events-none absolute -bottom-4 right-0 h-28 w-28 sm:h-36 sm:w-36">
            <div className="animate-glow-after-pop h-full w-full rounded-full bg-[#FF1F1F] blur-2xl transition-transform duration-500 group-hover:scale-125" />
          </div>

          {/* Maskot slide naik dari bawah, nempel ke bawah box */}
          <img
            src="/maskot-lapor.png"
            alt="Maskot"
            className="animate-mascot-pop pointer-events-none absolute bottom-0 right-2 z-10 h-20 w-auto object-contain object-bottom transition-[filter] duration-300 group-hover:drop-shadow-[0_0_14px_#FF1F1F] sm:right-4 sm:h-24"
          />
        </div>

        {/* Card scan */}
        <div className="overflow-hidden rounded-2xl border border-[#FFFFFF66] bg-gradient-to-br from-[#BAE6FD] to-[#FEF08A] shadow-[0_4px_12px_#0D1B2A26]">
          {/* Header */}
          <div className="border-b border-[#FFFFFF80] bg-gradient-to-r from-[#BAE6FD] via-[#E0F2FE] to-[#FEF9C3] p-5">
            <div className="flex items-center gap-2 font-label-bold text-label-bold text-primary-container">
              <FontAwesomeIcon icon={faCamera} className="h-4 w-4" /> Scan kondisi jaringan
            </div>
            <p className="mt-1 font-body-md text-body-md text-on-surface-variant">
              Foto akan tersimpan di halaman ini saja. Belum ada pengiriman atau perhitungan model.
            </p>
          </div>

          <div className="p-5">
            {preview ? (
              <div className="space-y-4">
                <div className="overflow-hidden rounded-xl bg-surface-container">
                  <img src={preview} alt="Preview foto kondisi infrastruktur" className="max-h-110 w-full object-contain" />
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="flex items-center gap-2 font-label-sm text-label-sm text-risk-aman">
                    <FontAwesomeIcon icon={faCheckCircle} className="h-4 w-4" /> Foto siap diproses: {fileName}
                  </p>
                  <button
                    type="button"
                    onClick={resetScan}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-outline bg-[#FFFFFFB3] px-5 py-3 font-label-bold text-label-bold text-on-surface transition hover:bg-white"
                  >
                    <FontAwesomeIcon icon={faRotateLeft} className="h-4 w-4" /> Ambil ulang
                  </button>
                </div>
                <div className="rounded-xl bg-[#FFFFFFB3] p-4 font-body-md text-body-md text-on-surface-variant">
                  Foto sudah berhasil dipindai. Penilaian risiko menunggu koneksi model dan belum dihitung.
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={startLoading}
                className="relative flex min-h-70 w-full flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-[#0284C799] bg-[url('/img-scan.png')] bg-cover bg-center px-6 text-center transition hover:border-[#0284C7]"
              >
                {/* Overlay tipis supaya teks tetap terbaca */}
                <span className="absolute inset-0 bg-[#FFFFFF66]" />
                <span className="relative mb-4 grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-[#0369A1] to-[#38BDF8] text-white shadow-[0_6px_14px_#0369A173]">
                  <FontAwesomeIcon icon={faCamera} className="h-7 w-7" />
                </span>
                <span className="relative font-headline-sm text-headline-sm text-[#0369A1]">Buka Kamera untuk Scan</span>
                <span className="relative mt-2 font-body-md text-body-md text-[#0369A1]">atau pilih foto dari perangkatmu</span>
              </button>
            )}

            {!preview && (
              <button
                type="button"
                onClick={startLoading}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#38BDF8] to-[#0020a1] py-3.5 font-label-bold text-label-bold text-white shadow-md transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_0_28px_#FACC15D9] hover:drop-shadow-[0_14px_24px_#00000040]"
              >
                <FontAwesomeIcon icon={faImage} className="h-4 w-4" /> Pilih Foto dari Galeri
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}