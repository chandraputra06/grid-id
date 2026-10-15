"use client";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";

const TYPE_ICON = {
  trafo: "transform",
  gardu: "electrical_services",
  tiang: "cell_tower",
  sutet: "bolt",
  sutm: "bolt",
  sutt: "bolt",
  feeder: "power",
};
const PAGE_SIZE = 10;

function iconFor(t) {
  return TYPE_ICON[String(t || "").toLowerCase()] || "category";
}
function cap(s) {
  if (!s) return "Lainnya";
  return String(s).charAt(0).toUpperCase() + String(s).slice(1);
}
function coords(a) {
  if (a.lat == null || a.lng == null) return "—";
  return `${Number(a.lat).toFixed(4)}, ${Number(a.lng).toFixed(4)}`;
}
function lengkap(a) {
  return a.lat != null && a.lng != null;
}

export default function PemetaanGrid() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [page, setPage] = useState(1);

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const d = await api.get("/api/assets");
      setAssets(Array.isArray(d) ? d : []);
    } catch (e) {
      setErr(e?.message || "Gagal memuat daftar aset.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const jenis = useMemo(() => {
    const m = new Map();
    for (const a of assets) {
      const t = a.asset_type || "lainnya";
      m.set(t, (m.get(t) || 0) + 1);
    }
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4).map(([t, n]) => ({ j: cap(t), n, icon: iconFor(t) }));
  }, [assets]);

  const complete = useMemo(() => assets.filter(lengkap).length, [assets]);

  const totalPages = Math.max(1, Math.ceil(assets.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const rows = assets.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-extrabold text-on-surface">Pemetaan Grid</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">Registri aset — setiap aset wajib punya identitas (nama + koordinat) agar dapat disinkronkan dengan MAXIMO.</p>
      </div>

      {err && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-outline-variant bg-risk-kritis/5 p-4">
          <p className="text-[13px] font-semibold text-risk-kritis">{err}</p>
          <button onClick={load} className="rounded-full bg-brand px-4 py-1.5 text-[13px] font-bold text-white hover:brightness-110">Coba lagi</button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(loading ? [] : jenis).map((j) => (
          <div key={j.j} className="flex items-center gap-3 rounded-2xl border border-outline-variant bg-card-surface p-5 shadow-sm">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand/10"><span className="material-symbols-outlined text-brand">{j.icon}</span></span>
            <div><p className="font-heading text-2xl font-extrabold text-on-surface">{j.n}</p><p className="font-body-md text-[12px] text-on-surface-variant">{j.j}</p></div>
          </div>
        ))}
        {loading && <div className="col-span-full py-4 text-center font-body-md text-on-surface-variant">Memuat ringkasan…</div>}
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-outline-variant bg-accent/5 p-4">
        <span className="material-symbols-outlined text-accent">info</span>
        <p className="font-body-md text-[13px] text-on-surface-variant">
          <b className="text-on-surface">{complete} dari {assets.length} aset</b> sudah memiliki identitas lengkap (nama + koordinat).
          {assets.length - complete > 0 ? ` ${assets.length - complete} aset perlu dilengkapi agar bisa dikoordinasikan dengan MAXIMO.` : " Semua aset lengkap."}
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-outline-variant bg-card-surface shadow-sm">
        <div className="border-b border-outline-variant p-4"><h2 className="font-heading font-bold">Daftar Aset</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-outline-variant font-heading text-[11px] uppercase tracking-wider text-on-surface-variant">
                <th className="p-4">Kode</th><th className="p-4">Nama Aset</th><th className="p-4">Tipe</th><th className="p-4">Koordinat</th><th className="p-4">Kelengkapan</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center font-body-md text-on-surface-variant">Memuat…</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center font-body-md text-on-surface-variant">Belum ada aset.</td></tr>
              ) : (
                rows.map((a) => (
                  <tr key={a.id || a.asset_code} className="border-b border-outline-variant/60 hover:bg-surface-container-low">
                    <td className="p-4 font-heading font-bold text-brand">{a.asset_code || "—"}</td>
                    <td className="p-4">{a.name || "—"}</td>
                    <td className="p-4 text-on-surface-variant">{cap(a.asset_type)}</td>
                    <td className="p-4 font-body-md text-[12px] text-on-surface-variant">{coords(a)}</td>
                    <td className="p-4">
                      {lengkap(a) ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-risk-aman/10 px-2.5 py-1 text-[11px] font-bold text-risk-aman"><span className="material-symbols-outlined text-[14px]">check_circle</span>Lengkap</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-risk-waspada/10 px-2.5 py-1 text-[11px] font-bold text-risk-waspada"><span className="material-symbols-outlined text-[14px]">error</span>Belum lengkap</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && assets.length > 0 && (
          <div className="flex items-center justify-between p-4">
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              Menampilkan {(pageSafe - 1) * PAGE_SIZE + 1}–{Math.min(pageSafe * PAGE_SIZE, assets.length)} dari {assets.length} aset
            </span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={pageSafe <= 1} className="grid h-8 w-8 place-items-center rounded-lg text-on-surface-variant hover:bg-surface-container-low disabled:opacity-40">
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              <span className="px-2 font-heading text-sm font-bold text-on-surface">{pageSafe} / {totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={pageSafe >= totalPages} className="grid h-8 w-8 place-items-center rounded-lg text-on-surface-variant hover:bg-surface-container-low disabled:opacity-40">
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}