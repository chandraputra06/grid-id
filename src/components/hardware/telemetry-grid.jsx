"use client";
// Telemetri terbaru — hanya metrik yang benar-benar dikirim perangkat. Nilai kosong ditampilkan "—", bukan 0.
import { METRICS, fmtDateTime, fmtNum, fmtRelative } from "@/lib/hardware";
import { Badge, EmptyState, SimBadge } from "./ui";

export function TelemetryGrid({ telemetry, thresholds }) {
  if (!telemetry) {
    return <EmptyState compact icon="sensors_off" title="Belum ada data telemetri" text="Perangkat belum mengirim telemetri ke Firebase, atau bridge backend belum aktif." />;
  }
  const t = telemetry;
  const sent = METRICS.filter((m) => t[m.key] !== null && t[m.key] !== undefined);
  const missing = METRICS.filter((m) => t[m.key] === null || t[m.key] === undefined);
  const errs = Array.isArray(t.validation_errors) ? t.validation_errors : [];
  const over = (m) =>
    (m.key === "max_temp_c" && thresholds && thresholds.temp_max_c != null && t.max_temp_c > thresholds.temp_max_c) ||
    (m.key === "gas_raw" && thresholds && thresholds.gas_raw_max != null && t.gas_raw > thresholds.gas_raw_max);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge icon="schedule">{fmtDateTime(t.captured_at)} · {fmtRelative(t.captured_at)}</Badge>
        {!t.timestamp_valid && <Badge cls="bg-risk-waspada/10 text-risk-waspada" icon="history_toggle_off" title="Timestamp perangkat tidak valid; dipakai waktu server">Timestamp perangkat tidak valid</Badge>}
        {!t.valid && <Badge cls="bg-risk-kritis/10 text-risk-kritis" icon="report">Data tidak valid</Badge>}
        <SimBadge show={t.source === "simulasi"} />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
        {sent.map((m) => (
          <div key={m.key} className={`rounded-xl p-3 ${over(m) ? "bg-risk-kritis/10 ring-1 ring-risk-kritis/40" : "bg-surface-container-low"}`}>
            <p className="flex items-center gap-1 font-heading text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
              <span className="material-symbols-outlined text-[16px]">{m.icon}</span>
              {m.label}
            </p>
            <p className="mt-1 font-heading text-xl font-extrabold text-on-surface">
              {fmtNum(t[m.key], m.digits)}
              <span className="ml-1 text-xs font-bold text-on-surface-variant">{m.unit}</span>
            </p>
            {m.note && <p className="font-body-md text-[10px] text-on-surface-variant">{m.note}</p>}
          </div>
        ))}
        {t.audio_anomaly !== null && t.audio_anomaly !== undefined && (
          <div className={`rounded-xl p-3 ${t.audio_anomaly ? "bg-risk-waspada/10" : "bg-surface-container-low"}`}>
            <p className="font-heading text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Anomali audio</p>
            <p className="mt-1 font-heading text-base font-extrabold text-on-surface">{t.audio_anomaly ? "Terindikasi" : "Tidak ada"}</p>
          </div>
        )}
        {t.alarm_state !== null && t.alarm_state !== undefined && (
          <div className={`rounded-xl p-3 ${t.alarm_state ? "bg-risk-kritis/10" : "bg-surface-container-low"}`}>
            <p className="font-heading text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Status alarm</p>
            <p className="mt-1 font-heading text-base font-extrabold text-on-surface">{t.alarm_state ? "Aktif" : "Normal"}</p>
          </div>
        )}
        {t.gps_lat != null && (
          <div className="rounded-xl bg-surface-container-low p-3">
            <p className="font-heading text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">GPS</p>
            <p className="mt-1 font-body-md text-[13px] font-semibold text-on-surface">{Number(t.gps_lat).toFixed(5)}, {Number(t.gps_lng).toFixed(5)}</p>
          </div>
        )}
      </div>

      {missing.length > 0 && (
        <p className="font-body-md text-[11px] text-on-surface-variant">
          Tidak dikirim perangkat pada paket ini: {missing.map((m) => m.label.toLowerCase()).join(", ")}{t.gps_lat == null ? ", GPS" : ""}.
        </p>
      )}
      {errs.length > 0 && (
        <details className="rounded-xl border border-outline-variant p-3">
          <summary className="cursor-pointer font-heading text-xs font-bold text-on-surface">Catatan validasi ({errs.length})</summary>
          <ul className="mt-2 space-y-1">
            {errs.map((e, i) => (
              <li key={i} className="font-body-md text-[12px] text-on-surface-variant"><b>{e.field}</b>: {e.reason}{e.value !== undefined ? ` (${String(e.value)})` : ""}</li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
