"use client";
// Primitif UI Hardware Monitoring — memakai ulang pola kartu, badge, tombol & tabel
// dari halaman dashboard existing (token globals.css: brand, risk-*, surface-*, outline-variant).
import { useEffect } from "react";
import { ALERT_PRIORITY, ALERT_STATUS, CONNECTION, INTEGRATION, RISK, fmtRelative } from "@/lib/hardware";

export function PageHeader({ title, subtitle, actions, badge }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-heading text-2xl font-extrabold text-on-surface">{title}</h1>
          {badge}
        </div>
        {subtitle && <p className="max-w-3xl font-body-md text-body-md text-on-surface-variant">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ title, icon, right, children, className = "", bodyClass = "" }) {
  return (
    <section className={`rounded-2xl border border-outline-variant bg-card-surface p-5 shadow-sm ${className}`}>
      {(title || right) && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          {title && (
            <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-on-surface">
              {icon && <span className="material-symbols-outlined text-brand">{icon}</span>}
              {title}
            </h2>
          )}
          {right}
        </div>
      )}
      <div className={bodyClass}>{children}</div>
    </section>
  );
}

// Kartu statistik — sama dengan KPI di Dashboard Ringkasan & Perangkat IoT.
export function StatCard({ label, value, icon, tone = "text-brand bg-brand/10", sub, loading }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-outline-variant bg-card-surface p-4 shadow-sm">
      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${tone}`}>
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
      </span>
      <div className="min-w-0">
        <p className="font-heading text-2xl font-extrabold leading-tight text-on-surface">{loading ? "…" : value}</p>
        <p className="font-body-md text-[12px] leading-snug text-on-surface-variant">{label}</p>
        {sub && <p className="truncate font-body-md text-[11px] text-on-surface-variant">{sub}</p>}
      </div>
    </div>
  );
}

export function Badge({ cls = "bg-surface-container-low text-on-surface-variant", icon, children, title }) {
  return (
    <span title={title} className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-bold ${cls}`}>
      {icon && <span className="material-symbols-outlined text-[14px]">{icon}</span>}
      {children}
    </span>
  );
}

export function ConnectionBadge({ state, at }) {
  const m = CONNECTION[state] || CONNECTION.never;
  return (
    <Badge cls={m.cls} icon={m.icon} title={at ? `Telemetri terakhir ${fmtRelative(at)}` : undefined}>
      {m.label}
    </Badge>
  );
}

export function RiskBadge({ priority }) {
  if (!priority || !priority.level) return <Badge title="Risk Score aset belum dihitung">Belum dinilai</Badge>;
  const m = RISK[priority.level] || RISK.aman;
  return (
    <Badge cls={m.cls} title={`Risk Score ${Math.round(priority.score)} (mekanisme Risk Score GRID·ID)`}>
      <span className={`h-2 w-2 rounded-full ${m.dot}`} />
      {m.label}
      {priority.score != null && <span className="font-semibold opacity-80">· {Math.round(priority.score)}</span>}
    </Badge>
  );
}

export function AlertPriorityBadge({ p }) {
  const m = ALERT_PRIORITY[p] || ALERT_PRIORITY.rendah;
  return <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${m.cls}`}>{m.label.toUpperCase()}</span>;
}

export function AlertStatusBadge({ s }) {
  const m = ALERT_STATUS[s] || ALERT_STATUS.baru;
  return <Badge cls={m.cls}>{m.label}</Badge>;
}

// Label wajib untuk data hasil skrip simulasi.
export function SimBadge({ show = true }) {
  if (!show) return null;
  return (
    <Badge cls="bg-accent/15 text-on-secondary-container" icon="science" title="Data dari skrip simulasi, bukan perangkat nyata">
      SIMULASI
    </Badge>
  );
}

export function Loading({ text = "Memuat…" }) {
  return <p className="py-10 text-center font-body-md text-body-md text-on-surface-variant">{text}</p>;
}

export function ErrorBox({ message, onRetry }) {
  if (!message) return null;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-outline-variant bg-risk-kritis/5 p-4">
      <p className="flex items-center gap-2 text-[13px] font-semibold text-risk-kritis">
        <span className="material-symbols-outlined text-[18px]">error</span>
        {message}
      </p>
      {onRetry && (
        <button onClick={onRetry} className="rounded-full bg-brand px-4 py-1.5 text-[13px] font-bold text-white hover:brightness-110">
          Coba lagi
        </button>
      )}
    </div>
  );
}

export function EmptyState({ icon = "inbox", title, text, children, compact }) {
  return (
    <div className={`rounded-xl bg-surface-container-low text-center ${compact ? "p-4" : "p-8"}`}>
      <span className={`material-symbols-outlined text-on-surface-variant ${compact ? "text-3xl" : "text-5xl"}`}>{icon}</span>
      {title && <p className="mt-1 font-heading text-sm font-bold text-on-surface">{title}</p>}
      {text && <p className="mx-auto max-w-md font-body-md text-[13px] text-on-surface-variant">{text}</p>}
      {children}
    </div>
  );
}

// Banner status integrasi — jujur: hanya muncul saat BELUM ada telemetri yang diterima.
// Data bisa masuk lewat adapter REST (Sistem_IoT) maupun bridge firebase-admin; begitu ada
// telemetri, pipeline terbukti bekerja sehingga banner disembunyikan. Firebase Storage tidak
// wajib karena gambar insiden memakai URL publik (ImgBB), bukan Firebase Storage.
export function IntegrationBanner({ firebase, storage, lastTelemetryAt }) {
  if (lastTelemetryAt) return null; // telemetri mengalir -> jangan klaim data belum diterima
  if (!firebase) return null; // status integrasi belum termuat
  const m = INTEGRATION[firebase] || INTEGRATION.error;
  const note =
    firebase === "initialized"
      ? "Sumber data siap, namun belum ada telemetri yang diterima dari perangkat mana pun."
      : "Belum ada telemetri yang diterima. Pastikan sumber data (adapter Sistem_IoT atau bridge) aktif dan Rules RTDB mengizinkan baca.";
  return (
    <div className={`flex items-start gap-3 rounded-2xl border border-outline-variant p-4 ${m.cls}`}>
      <span className="material-symbols-outlined">{m.icon}</span>
      <div>
        <p className="font-heading text-sm font-bold">{m.label}</p>
        <p className="font-body-md text-[13px] text-on-surface-variant">{note}</p>
      </div>
    </div>
  );
}

// Kontrol filter — gaya sama dengan form di halaman Verifikasi/Pengguna.
export function Select({ label, value, onChange, children, className = "", disabled }) {
  return (
    <label className={`block ${className}`}>
      {label && <span className="mb-1 block font-label-sm text-label-sm text-on-surface-variant">{label}</span>}
      <select value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-outline-variant bg-white px-3 py-2 text-sm outline-none focus:border-brand">
        {children}
      </select>
    </label>
  );
}

export function TextInput({ label, value, onChange, placeholder, type = "text", className = "", ...rest }) {
  return (
    <label className={`block ${className}`}>
      {label && <span className="mb-1 block font-label-sm text-label-sm text-on-surface-variant">{label}</span>}
      <input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} {...rest}
        className="w-full rounded-lg border border-outline-variant bg-white px-3 py-2 text-sm outline-none focus:border-brand" />
    </label>
  );
}

export function FilterBar({ children }) {
  return <div className="grid grid-cols-1 gap-3 rounded-2xl border border-outline-variant bg-card-surface p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-5">{children}</div>;
}

export function Chips({ items, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((c) => {
        const active = value === c.key;
        return (
          <button key={c.key} onClick={() => onChange(c.key)}
            className={`flex items-center gap-2 rounded-full border px-4 py-1.5 font-heading text-xs font-bold transition-colors ${
              active ? "border-brand bg-brand text-white" : "border-outline-variant bg-card-surface text-on-surface-variant hover:bg-surface-container-low"
            }`}>
            {c.label}
            {c.n !== undefined && <span className={`rounded-full px-1.5 text-[11px] ${active ? "bg-white/20" : "bg-surface-container-low"}`}>{c.n}</span>}
          </button>
        );
      })}
    </div>
  );
}

export function PrimaryButton({ children, icon, onClick, disabled, type = "button" }) {
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className="flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 font-label-bold text-label-bold text-white transition hover:brightness-110 active:scale-95 disabled:opacity-60">
      {icon && <span className="material-symbols-outlined text-[18px]">{icon}</span>}
      {children}
    </button>
  );
}

export function GhostButton({ children, icon, onClick, disabled }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      className="flex items-center gap-1.5 rounded-full border border-outline-variant bg-card-surface px-4 py-2 font-label-bold text-label-bold text-on-surface-variant transition hover:bg-surface-container-low disabled:opacity-60">
      {icon && <span className="material-symbols-outlined text-[18px]">{icon}</span>}
      {children}
    </button>
  );
}

// Modal sederhana (overlay + kartu) — tutup dengan Esc / klik latar.
export function Modal({ open, onClose, title, children, wide }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-on-surface/40 p-4 sm:p-8" onClick={onClose} role="dialog" aria-modal="true">
      <div className={`w-full ${wide ? "max-w-5xl" : "max-w-lg"} rounded-2xl border border-outline-variant bg-card-surface shadow-xl`} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-outline-variant px-5 py-3">
          <h3 className="font-heading text-base font-bold text-on-surface">{title}</h3>
          <button onClick={onClose} aria-label="Tutup" className="grid h-8 w-8 place-items-center rounded-lg text-on-surface-variant hover:bg-surface-container-low">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

// Tabel dengan kepala bergaya sama seperti halaman Laporan/Perangkat.
export function Table({ head, children, minWidth = 760 }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left" style={{ minWidth }}>
        <thead>
          <tr className="border-b border-outline-variant font-heading text-[11px] uppercase tracking-wider text-on-surface-variant">
            {head.map((h) => (
              <th key={h} className="px-3 py-2.5 first:pl-0">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function Td({ children, className = "" }) {
  return <td className={`px-3 py-2.5 align-top font-body-md text-[13px] text-on-surface first:pl-0 ${className}`}>{children}</td>;
}

// Penanda waktu pembaruan per sumber data (live / snapshot / telemetri berbeda).
export function Freshness({ icon, label, at, note }) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-surface-container-low px-3 py-2">
      <span className="material-symbols-outlined text-[18px] text-brand">{icon}</span>
      <div className="min-w-0">
        <p className="font-heading text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">{label}</p>
        <p className="truncate font-body-md text-[12px] text-on-surface">{note || (at ? fmtRelative(at) : "Belum ada data")}</p>
      </div>
    </div>
  );
}