"use client";
// Panel Live RGB. Stream video berasal dari layanan streaming perangkat (MJPEG / HLS / pemutar web),
// BUKAN dari Firebase. Status "LIVE" hanya tampil setelah stream benar-benar termuat.
import { useEffect, useRef, useState } from "react";
import { Badge, EmptyState } from "./ui";

const TYPE_LABEL = { mjpeg: "MJPEG", hls: "HLS", iframe: "Pemutar web" };

export function LiveStreamPanel({ device, compact = false }) {
  const stream = device && device.stream;
  const [state, setState] = useState("connecting"); // connecting | live | error | unsupported
  const [nonce, setNonce] = useState(0);
  const videoRef = useRef(null);
  const h = compact ? "h-48" : "aspect-video";

  const mixed =
    stream && typeof window !== "undefined" && window.location.protocol === "https:" && String(stream.url).startsWith("http:");

  useEffect(() => {
    setState(mixed ? "error" : "connecting");
    if (!stream || mixed) return undefined;
    if (stream.type === "hls") {
      const v = videoRef.current;
      if (v && !v.canPlayType("application/vnd.apple.mpegurl")) setState("unsupported");
    }
    // Batas waktu koneksi 15 detik
    const id = setTimeout(() => setState((s) => (s === "connecting" ? "error" : s)), 15000);
    return () => clearTimeout(id);
  }, [stream && stream.url, stream && stream.type, nonce, mixed]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!device) return null;

  if (!device.stream_configured) {
    return (
      <EmptyState compact icon="videocam_off" title="Live stream belum dikonfigurasi"
        text="Perangkat ini belum memiliki URL stream. Snapshot berkala tetap ditampilkan terpisah." />
    );
  }
  if (!stream) {
    return (
      <EmptyState compact icon="lock" title="Live stream tidak tersedia untuk akun ini"
        text="Organisasi Anda belum diberi izin melihat live stream perangkat ini." />
    );
  }
  // Stream tetap dicoba walau telemetri offline (jalur berbeda), namun beri konteks.
  const telemetryDown = device.connection === "offline" || device.connection === "never";

  return (
    <div className="space-y-2">
      <div className={`relative overflow-hidden rounded-xl bg-on-surface ${h}`}>
        {stream.type === "mjpeg" && !mixed && (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={nonce} src={stream.url} alt={`Live RGB ${device.device_code}`} className="h-full w-full object-contain"
            onLoad={() => setState("live")} onError={() => setState("error")} />
        )}
        {stream.type === "hls" && !mixed && (
          <video key={nonce} ref={videoRef} src={stream.url} className="h-full w-full object-contain" autoPlay muted playsInline controls
            onPlaying={() => setState("live")} onError={() => setState("error")} />
        )}
        {stream.type === "iframe" && !mixed && (
          <iframe key={nonce} src={stream.url} title={`Live RGB ${device.device_code}`} className="h-full w-full border-0"
            allow="autoplay; fullscreen" sandbox="allow-scripts allow-same-origin" onLoad={() => setState("live")} />
        )}

        <div className="absolute left-2 top-2 flex gap-1.5">
          {state === "live" ? (
            <Badge cls="bg-risk-kritis text-white" icon="radio_button_checked">LIVE</Badge>
          ) : state === "connecting" ? (
            <Badge cls="bg-white/90 text-on-surface" icon="hourglass_top">Menghubungkan…</Badge>
          ) : null}
          <Badge cls="bg-white/90 text-on-surface">{TYPE_LABEL[stream.type] || stream.type}</Badge>
        </div>

        {(state === "error" || state === "unsupported") && (
          <div className="absolute inset-0 grid place-items-center bg-on-surface/80 p-4 text-center">
            <div>
              <span className="material-symbols-outlined text-4xl text-white">videocam_off</span>
              <p className="mt-1 font-heading text-sm font-bold text-white">
                {mixed ? "Stream diblokir browser" : state === "unsupported" ? "Browser tidak mendukung HLS" : "Stream tidak dapat dijangkau"}
              </p>
              <p className="mx-auto max-w-xs font-body-md text-[12px] text-white/80">
                {mixed
                  ? "URL stream memakai http:// sementara dashboard https://. Sajikan stream lewat HTTPS (mis. reverse proxy)."
                  : state === "unsupported"
                    ? "Gunakan Safari/iOS, atau sajikan stream sebagai MJPEG / pemutar web."
                    : "Perangkat atau server streaming mungkin offline. Snapshot terakhir tetap tersedia di panel sebelah."}
              </p>
              {!mixed && (
                <button onClick={() => setNonce((n) => n + 1)} className="mt-3 rounded-full bg-white px-4 py-1.5 text-[12px] font-bold text-brand">
                  Coba sambungkan ulang
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      {telemetryDown && (
        <p className="font-body-md text-[11px] font-semibold text-risk-waspada">Telemetri perangkat sedang tidak diterima — stream mungkin juga tidak aktif.</p>
      )}
      <p className="font-body-md text-[11px] text-on-surface-variant">
        Live stream langsung dari perangkat — berbeda dari snapshot berkala dan tidak direkam oleh GRID·ID.
      </p>
    </div>
  );
}
