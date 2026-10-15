"use client";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";

const STATUS = {
  baru: { label: "Baru", badge: "bg-brand", chip: "bg-brand/10 text-brand" },
  diproses: { label: "Diproses", badge: "bg-risk-waspada", chip: "bg-risk-waspada/10 text-risk-waspada" },
  terverifikasi: { label: "Terverifikasi", badge: "bg-risk-aman", chip: "bg-risk-aman/10 text-risk-aman" },
  ditolak: { label: "Ditolak", badge: "bg-on-surface-variant", chip: "bg-surface-container-low text-on-surface-variant" },
};

const SOURCE = { warga: "Laporan Warga", petugas: "Laporan Petugas", cctv: "CCTV" };

const FILTERS = [
  { key: "all", label: "Semua Status" },
  { key: "baru", label: "Baru" },
  { key: "diproses", label: "Diproses" },
  { key: "terverifikasi", label: "Terverifikasi" },
  { key: "ditolak", label: "Ditolak" },
];

const PAGE_SIZE = 8;

function fmtDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}

function coords(r) {
  if (r.lat == null || r.lng == null) return null;
  return `${Number(r.lat).toFixed(4)}, ${Number(r.lng).toFixed(4)}`;
}

export default function AdminLaporan() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const d = await api.get("/api/reports");
      setReports(Array.isArray(d) ? d : []);
    } catch (e) {
      setErr(e?.message || "Gagal memuat laporan.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const counts = useMemo(() => {
    const c = { baru: 0, diproses: 0, terverifikasi: 0, ditolak: 0 };
    for (const r of reports) if (c[r.status] != null) c[r.status] += 1;
    return c;
  }, [reports]);

  const filtered = useMemo(() => {
    return filter === "all" ? reports : reports.filter((r) => r.status === filter);
  }, [reports, filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const pageRows = filtered.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE);

  function setFilterReset(k) {
    setFilter(k);
    setPage(1);
  }

  const cards = [
    { value: String(counts.baru), label: "Laporan Baru Menunggu", tag: "BELUM DIPROSES", tagTone: "bg-brand/10 text-brand", icon: "inbox", iconTone: "text-brand" },
    { value: String(counts.diproses), label: "Sedang Diproses", tag: "BERJALAN", tagTone: "bg-risk-waspada/10 text-risk-waspada", icon: "engineering", iconTone: "text-risk-waspada" },
    { value: String(counts.terverifikasi), label: "Terverifikasi (Label Emas)", tag: "DATA TRAINING", tagTone: "bg-risk-aman/10 text-risk-aman", icon: "verified", iconTone: "text-risk-aman", highlight: true },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-extrabold text-on-surface">Laporan Lapangan &amp; Verifikasi</h1>
          <p className="max-w-2xl font-body-md text-body-md text-on-surface-variant">Laporan foto dari warga &amp; petugas. Verifikasi mengubahnya jadi data berlabel untuk melatih model AI.</p>
        </div>
        <a href="/lapor" className="flex shrink-0 items-center gap-2 rounded-full bg-brand px-5 py-2.5 font-heading text-sm font-bold text-white transition-transform hover:-translate-y-0.5">
          <span className="material-symbols-outlined text-[20px]">add</span> Lapor Temuan
        </a>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className={`rounded-2xl border bg-card-surface p-5 shadow-sm ${c.highlight ? "border-brand ring-1 ring-brand" : "border-outline-variant"}`}>
            <div className="flex items-start justify-between">
              <span className={`material-symbols-outlined ${c.iconTone}`} style={{ fontVariationSettings: "'FILL' 1" }}>{c.icon}</span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${c.tagTone}`}>{c.tag}</span>
            </div>
            <div className="mt-2 font-heading text-4xl font-extrabold text-on-surface">{loading ? "…" : c.value}</div>
            <p className="mt-1 font-body-md text-[13px] text-on-surface-variant">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-outline-variant bg-card-surface shadow-sm">
        <div className="flex flex-wrap items-center gap-2 border-b border-outline-variant p-4">
          {FILTERS.map((t) => (
            <button
              key={t.key}
              onClick={() => setFilterReset(t.key)}
              className={`rounded-full px-4 py-1.5 font-heading text-xs font-bold transition-colors ${filter === t.key ? "bg-brand text-white" : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"}`}
            >
              {t.label}
            </button>
          ))}
          <span className="ml-auto flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant">
            <span className="material-symbols-outlined text-[16px]">swap_vert</span> Urutan: Terbaru
          </span>
        </div>

        {err && (
          <div className="flex items-center justify-between gap-3 border-b border-outline-variant bg-risk-kritis/5 p-4">
            <p className="text-[13px] font-semibold text-risk-kritis">{err}</p>
            <button onClick={load} className="rounded-full bg-brand px-4 py-1.5 text-[13px] font-bold text-white hover:brightness-110">Coba lagi</button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left">
            <thead>
              <tr className="border-b border-outline-variant font-heading text-[11px] uppercase tracking-wider text-on-surface-variant">
                <th className="p-4">ID Laporan</th>
                <th className="p-4">Pelapor / Lokasi</th>
                <th className="p-4">Deskripsi</th>
                <th className="p-4">Status</th>
                <th className="p-4">Tanggal / Waktu</th>
                <th className="p-4">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="p-8 text-center font-body-md text-on-surface-variant">Memuat laporan…</td></tr>
              ) : pageRows.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center font-body-md text-on-surface-variant">Tidak ada laporan untuk filter ini.</td></tr>
              ) : (
                pageRows.map((r) => {
                  const st = STATUS[r.status] || STATUS.baru;
                  const c = coords(r);
                  return (
                    <tr key={r.id} className="border-b border-outline-variant/60 align-top">
                      <td className="p-4">
                        <p className="font-heading text-sm font-bold text-brand">#{String(r.id || "").slice(0, 8)}</p>
                        <p className="font-body-md text-[12px] text-on-surface-variant">{SOURCE[r.source] || r.source || "—"}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-body-md text-[13px] font-semibold text-on-surface">{r.reporter_name || "Anonim"}</p>
                        <p className="font-body-md text-[12px] text-on-surface-variant">{c || (r.asset_id ? "Terkait aset" : "Lokasi tidak dicatat")}</p>
                      </td>
                      <td className="max-w-xs p-4 font-body-md text-[13px] text-on-surface-variant">{r.description || "Tanpa deskripsi"}</td>
                      <td className="p-4"><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold text-white ${st.badge}`}>{st.label}</span></td>
                      <td className="p-4 font-body-md text-[13px] text-on-surface-variant">{fmtDate(r.created_at)}</td>
                      <td className="p-4">
                        {r.photo_url ? (
                          <a href={r.photo_url} target="_blank" rel="noopener noreferrer" className="font-heading text-sm font-bold text-brand hover:underline">Lihat Foto</a>
                        ) : (
                          <span className="font-body-md text-[12px] text-on-surface-variant">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between p-4">
          <span className="font-label-sm text-label-sm text-on-surface-variant">
            {filtered.length === 0 ? "Tidak ada laporan" : `Menampilkan ${(pageSafe - 1) * PAGE_SIZE + 1}–${Math.min(pageSafe * PAGE_SIZE, filtered.length)} dari ${filtered.length} laporan`}
          </span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={pageSafe <= 1}
              className="grid h-8 w-8 place-items-center rounded-lg text-on-surface-variant hover:bg-surface-container-low disabled:opacity-40">
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <span className="px-2 font-heading text-sm font-bold text-on-surface">{pageSafe} / {totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={pageSafe >= totalPages}
              className="grid h-8 w-8 place-items-center rounded-lg text-on-surface-variant hover:bg-surface-container-low disabled:opacity-40">
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}