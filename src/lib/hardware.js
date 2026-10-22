// Util bersama Hardware Monitoring (Supervisor PLN) & GRID.ID Business Portal.
"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";

// ---------------------------------------------------------------- Label & gaya (token GRID·ID)
export const CONNECTION = {
  online: { label: "Online", icon: "wifi", cls: "bg-risk-aman/10 text-risk-aman" },
  late: { label: "Telemetri terlambat", icon: "schedule", cls: "bg-risk-waspada/10 text-risk-waspada" },
  offline: { label: "Offline", icon: "wifi_off", cls: "bg-risk-kritis/10 text-risk-kritis" },
  never: { label: "Belum ada data", icon: "hourglass_empty", cls: "bg-surface-container-low text-on-surface-variant" },
};

// Prioritas inspeksi = level Risk Score existing (risk_scores) — mekanisme penilaian yang sudah ada.
export const RISK = {
  kritis: { label: "Kritis", dot: "bg-risk-kritis", cls: "bg-risk-kritis/10 text-risk-kritis" },
  waspada: { label: "Waspada", dot: "bg-risk-waspada", cls: "bg-risk-waspada/10 text-risk-waspada" },
  aman: { label: "Aman", dot: "bg-risk-aman", cls: "bg-risk-aman/10 text-risk-aman" },
};

export const ALERT_PRIORITY = {
  tinggi: { label: "Tinggi", cls: "bg-risk-kritis text-white", soft: "bg-risk-kritis/10 text-risk-kritis", edge: "border-l-risk-kritis" },
  sedang: { label: "Sedang", cls: "bg-risk-waspada text-white", soft: "bg-risk-waspada/10 text-risk-waspada", edge: "border-l-risk-waspada" },
  rendah: { label: "Rendah", cls: "bg-on-surface-variant text-white", soft: "bg-surface-container-low text-on-surface-variant", edge: "border-l-outline" },
};

export const ALERT_STATUS = {
  baru: { label: "Baru", cls: "bg-brand/10 text-brand" },
  ditinjau: { label: "Ditinjau", cls: "bg-risk-waspada/10 text-risk-waspada" },
  selesai: { label: "Selesai", cls: "bg-risk-aman/10 text-risk-aman" },
};

export const ALERT_CATEGORY = {
  offline: { label: "Perangkat offline", icon: "wifi_off" },
  telemetry_late: { label: "Telemetri terlambat", icon: "schedule" },
  temp_threshold: { label: "Suhu melewati ambang", icon: "device_thermostat" },
  audio_anomaly: { label: "Anomali suara", icon: "graphic_eq" },
  gas_threshold: { label: "Indikasi gas/asap", icon: "air" },
  alarm_perangkat: { label: "Alarm perangkat", icon: "notifications_active" },
  ai_detection: { label: "Deteksi AI (YOLO)", icon: "neurology" },
  upload_failed: { label: "Upload gambar gagal", icon: "cloud_off" },
};

export const UPLOAD_STATUS = {
  pending: { label: "Menunggu gambar", icon: "hourglass_top", cls: "bg-surface-container-low text-on-surface-variant" },
  uploaded: { label: "Terunggah", icon: "cloud_done", cls: "bg-risk-aman/10 text-risk-aman" },
  failed: { label: "Upload gagal", icon: "cloud_off", cls: "bg-risk-kritis/10 text-risk-kritis" },
};

export const INFERENCE_STATUS = {
  pending: { label: "Menunggu pemrosesan AI", icon: "hourglass_top", cls: "bg-surface-container-low text-on-surface-variant" },
  processing: { label: "Sedang diproses AI", icon: "autorenew", cls: "bg-brand/10 text-brand" },
  done: { label: "AI selesai", icon: "neurology", cls: "bg-risk-aman/10 text-risk-aman" },
  failed: { label: "AI gagal", icon: "error", cls: "bg-risk-kritis/10 text-risk-kritis" },
  skipped: { label: "Dilewati", icon: "skip_next", cls: "bg-surface-container-low text-on-surface-variant" },
  not_applicable: { label: "—", icon: "remove", cls: "bg-surface-container-low text-on-surface-variant" },
};

export const FOLLOWUP = {
  menunggu_ai: { label: "Menunggu AI", cls: "bg-surface-container-low text-on-surface-variant" },
  tidak_ada_temuan: { label: "Tidak ada temuan", cls: "bg-risk-aman/10 text-risk-aman" },
  di_bawah_ambang: { label: "Di bawah ambang alert", cls: "bg-surface-container-low text-on-surface-variant" },
  baru: { label: "Belum ditindaklanjuti", cls: "bg-brand/10 text-brand" },
  ditinjau: { label: "Ditinjau", cls: "bg-risk-waspada/10 text-risk-waspada" },
  selesai: { label: "Selesai", cls: "bg-risk-aman/10 text-risk-aman" },
};

// Sama dengan label di halaman Detail Aset existing.
export const DEFECT = {
  isolator_pecah: "Isolator pecah",
  korosi: "Korosi",
  kabel_bermasalah: "Kabel bermasalah",
  komponen_hilang: "Komponen hilang",
};
export const defectLabel = (d) => DEFECT[d] || d || "—";

export const INTEGRATION = {
  initialized: { label: "Firebase terinisialisasi", cls: "bg-risk-aman/10 text-risk-aman", icon: "cloud_done" },
  not_configured: { label: "Firebase belum dikonfigurasi", cls: "bg-risk-waspada/10 text-risk-waspada", icon: "cloud_off" },
  sdk_missing: { label: "SDK Firebase belum terpasang di server", cls: "bg-risk-waspada/10 text-risk-waspada", icon: "cloud_off" },
  error: { label: "Kesalahan konfigurasi Firebase", cls: "bg-risk-kritis/10 text-risk-kritis", icon: "error" },
};

// Metrik telemetri (hanya ditampilkan bila perangkat mengirimnya).
export const METRICS = [
  { key: "max_temp_c", label: "Suhu maks. thermal", unit: "°C", digits: 1, icon: "device_thermostat", group: "Thermal" },
  { key: "avg_temp_c", label: "Suhu rata-rata thermal", unit: "°C", digits: 1, icon: "thermostat", group: "Thermal" },
  { key: "delta_temp_c", label: "Selisih suhu", unit: "°C", digits: 1, icon: "thermometer_gain", group: "Thermal" },
  { key: "ambient_temp_c", label: "Suhu lingkungan", unit: "°C", digits: 1, icon: "sunny", group: "Lingkungan" },
  { key: "humidity_pct", label: "Kelembapan", unit: "%", digits: 0, icon: "humidity_percentage", group: "Lingkungan" },
  { key: "gas_raw", label: "Sensor gas/asap", unit: "raw", digits: 0, icon: "air", group: "Gas", note: "Nilai ADC mentah, belum terkalibrasi ppm" },
  { key: "distance_cm", label: "Jarak pengukuran", unit: "cm", digits: 0, icon: "straighten", group: "Jarak" },
  { key: "sound_level_db", label: "Tingkat suara", unit: "dB", digits: 1, icon: "volume_up", group: "Suara" },
  { key: "dominant_freq_hz", label: "Frekuensi dominan", unit: "Hz", digits: 0, icon: "graphic_eq", group: "Suara" },
  { key: "rssi_dbm", label: "Kekuatan sinyal", unit: "dBm", digits: 0, icon: "signal_cellular_alt", group: "Perangkat" },
  { key: "pan_deg", label: "Sudut pan", unit: "°", digits: 0, icon: "360", group: "Pan/Tilt" },
  { key: "tilt_deg", label: "Sudut tilt", unit: "°", digits: 0, icon: "swap_vert", group: "Pan/Tilt" },
];
export const CHART_METRICS = ["max_temp_c", "avg_temp_c", "delta_temp_c", "ambient_temp_c", "humidity_pct", "sound_level_db", "gas_raw", "rssi_dbm"];
export const metricMeta = (k) => METRICS.find((m) => m.key === k);

// ---------------------------------------------------------------- Format
export function fmtNum(v, digits = 1, unit = "") {
  if (v === null || v === undefined || v === "" || Number.isNaN(Number(v))) return "—";
  const n = Number(v).toLocaleString("id-ID", { minimumFractionDigits: digits, maximumFractionDigits: digits });
  return unit ? `${n} ${unit}` : n;
}

export function fmtDateTime(iso, withYear = false) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("id-ID", { day: "2-digit", month: "short", ...(withYear ? { year: "numeric" } : {}), hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function fmtTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

export function fmtRelative(iso, now = Date.now()) {
  if (!iso) return "belum pernah";
  const ms = Date.parse(iso);
  if (!Number.isFinite(ms)) return "—";
  const s = Math.round((now - ms) / 1000);
  if (s < 0) return "baru saja";
  if (s < 60) return `${s} dtk lalu`;
  if (s < 3600) return `${Math.floor(s / 60)} mnt lalu`;
  if (s < 86400) return `${Math.floor(s / 3600)} jam lalu`;
  return `${Math.floor(s / 86400)} hari lalu`;
}

export const pct = (v) => (v === null || v === undefined ? "—" : `${Math.round(Number(v) * 100)}%`);

// ---------------------------------------------------------------- Rentang waktu
export const RANGE_PRESETS = [
  { key: "1h", label: "1 jam", ms: 3600e3 },
  { key: "6h", label: "6 jam", ms: 6 * 3600e3 },
  { key: "24h", label: "24 jam", ms: 864e5 },
  { key: "7d", label: "7 hari", ms: 7 * 864e5 },
  { key: "30d", label: "30 hari", ms: 30 * 864e5 },
];

export function rangeFromPreset(key) {
  const p = RANGE_PRESETS.find((x) => x.key === key) || RANGE_PRESETS[2];
  const to = new Date();
  return { from: new Date(to.getTime() - p.ms).toISOString(), to: to.toISOString() };
}

// "YYYY-MM-DD" (input date) -> ISO awal/akhir hari lokal
export function dayStartIso(d) {
  return d ? new Date(`${d}T00:00:00`).toISOString() : undefined;
}
export function dayEndIso(d) {
  return d ? new Date(`${d}T23:59:59.999`).toISOString() : undefined;
}
export function isoToDateInput(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const z = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
}

export function qs(params) {
  const sp = new URLSearchParams();
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") sp.set(k, String(v));
  });
  const s = sp.toString();
  return s ? `?${s}` : "";
}

// ---------------------------------------------------------------- Data hooks
/**
 * Ambil data dari API + polling opsional (berhenti saat tab disembunyikan).
 * @returns {{data, error, loading, reload, updatedAt}}
 */
export function useApi(path, { intervalMs = 0, enabled = true } = {}) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState(null);
  const alive = useRef(true);
  const seq = useRef(0);

  const load = useCallback(
    async (silent = false) => {
      if (!path || !enabled) return;
      const my = ++seq.current;
      if (!silent) setLoading(true);
      try {
        const d = await api.get(path);
        if (!alive.current || my !== seq.current) return;
        setData(d);
        setError("");
        setUpdatedAt(new Date().toISOString());
      } catch (e) {
        if (!alive.current || my !== seq.current) return;
        setError(e?.message || "Terjadi kesalahan koneksi.");
      } finally {
        if (alive.current && my === seq.current) setLoading(false);
      }
    },
    [path, enabled]
  );

  useEffect(() => {
    alive.current = true;
    load(false);
    if (!intervalMs) return () => { alive.current = false; };
    const id = setInterval(() => {
      if (typeof document === "undefined" || document.visibilityState === "visible") load(true);
    }, intervalMs);
    return () => {
      alive.current = false;
      clearInterval(id);
    };
  }, [load, intervalMs]);

  return { data, error, loading, reload: () => load(false), updatedAt };
}

export function useQueryParam(name) {
  const [v, setV] = useState(null);
  useEffect(() => {
    setV(new URLSearchParams(window.location.search).get(name));
  }, [name]);
  return v;
}

// ---------------------------------------------------------------- Ekspor CSV
function csvCell(v) {
  if (v === null || v === undefined) return "";
  const s = String(v);
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCSV(rows, columns) {
  const head = columns.map((c) => csvCell(c.label)).join(",");
  const body = rows.map((r) => columns.map((c) => csvCell(typeof c.value === "function" ? c.value(r) : r[c.value])).join(","));
  return [head, ...body].join("\n");
}

export function downloadCSV(filename, csv) {
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
