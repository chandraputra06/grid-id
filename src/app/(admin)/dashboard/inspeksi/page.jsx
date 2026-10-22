"use client";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";

// Kondisi fisik (diagnosis_level) -> label & gaya.
const KONDISI = {
  aman: { label: "Normal", cls: "bg-risk-aman/10 text-risk-aman" },
  waspada: { label: "Perlu pemantauan", cls: "bg-risk-waspada/10 text-risk-waspada" },
  kritis: { label: "Perlu pemeriksaan lanjutan", cls: "bg-risk-kritis/10 text-risk-kritis" },
};
const REVIEW = {
  pending: { label: "Menunggu", cls: "bg-brand/10 text-brand" },
  checked: { label: "Sudah dicek", cls: "bg-risk-aman/10 text-risk-aman" },
  rejected: { label: "Ditolak", cls: "bg-risk-kritis/10 text-risk-kritis" },
};
const FILTERS = [
  { key: "pending", label: "Menunggu" },
  { key: "checked", label: "Sudah dicek" },
  { key: "rejected", label: "Ditolak" },
  { key: "all", label: "Semua" },
];

// Label + satuan pengukuran dari readings (jsonb).
const READINGS = [
  { k: "temp_aset", label: "Temperatur aset", unit: "°C" },
  { k: "suhu_lingkungan", label: "Suhu lingkungan", unit: "°C" },
  { k: "arus", label: "Arus", unit: "A" },
  { k: "beban_trafo", label: "Beban trafo", unit: "%" },
];

function fmt(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

function photosOf(insp) {
  const p = insp.photos;
  if (Array.isArray(p)) return p.filter(Boolean);
  if (typeof p === "string" && p) return [p];
  return [];
}

export default function InspeksiReview() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [filter, setFilter] = useState("pending");
  const [busyId, setBusyId] = useState(null);
  const [noteId, setNoteId] = useState(null);
  const [note, setNote] = useState("");
  const [lightbox, setLightbox] = useState("");

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const qs = filter === "all" ? "" : `?review_status=${filter}`;
      const d = await api.get(`/api/inspections${qs}`);
      setList(Array.isArray(d) ? d : []);
    } catch (e) {
      setErr(e?.message || "Gagal memuat inspeksi.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function review(id, decision) {
    if (busyId) return;
    setBusyId(id);
    setErr("");
    try {
      await api.request(`/api/inspections/${id}/review`, { method: "PATCH", body: { decision, note: note || null } });
      setNoteId(null);
      setNote("");
      await load();
    } catch (e) {
      setErr(e?.message || "Gagal menyimpan keputusan.");
    } finally {
      setBusyId(null);
    }
  }

  const count = useMemo(() => list.length, [list]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-extrabold text-on-surface">Review Inspeksi Lapangan</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">Periksa hasil inspeksi petugas, lalu tandai sudah dicek atau tolak dengan catatan.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`rounded-full px-4 py-1.5 font-heading text-xs font-bold transition-colors ${filter === t.key ? "bg-brand text-white" : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {err && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-outline-variant bg-risk-kritis/5 p-4">
          <p className="text-[13px] font-semibold text-risk-kritis">{err}</p>
          <button onClick={load} className="rounded-full bg-brand px-4 py-1.5 text-[13px] font-bold text-white hover:brightness-110">Muat ulang</button>
        </div>
      )}

      {loading ? (
        <p className="py-16 text-center font-body-md text-body-md text-on-surface-variant">Memuat inspeksi…</p>
      ) : count === 0 ? (
        <div className="rounded-2xl border border-outline-variant bg-card-surface p-10 text-center shadow-sm">
          <span className="material-symbols-outlined text-5xl text-on-surface-variant">fact_check</span>
          <p className="mt-2 font-body-md text-body-md text-on-surface-variant">Tidak ada inspeksi pada filter ini.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {list.map((it) => {
            const asset = it.asset || {};
            const kondisi = KONDISI[it.diagnosis_level] || null;
            const rv = REVIEW[it.review_status] || REVIEW.pending;
            const photos = photosOf(it);
            const readings = it.readings || {};
            const busy = busyId === it.id;
            const openNote = noteId === it.id;
            const isPending = (it.review_status || "pending") === "pending";
            return (
              <div key={it.id} className="rounded-2xl border border-outline-variant bg-card-surface p-5 shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-heading text-sm font-bold text-on-surface">{asset.name || asset.asset_code || it.device_type || "Inspeksi"}</h3>
                  {asset.asset_code && <span className="rounded-full bg-surface-container-low px-2 py-0.5 text-[10px] font-bold text-on-surface-variant">{asset.asset_code}</span>}
                  {it.device_type && <span className="rounded-full bg-surface-container-low px-2 py-0.5 text-[10px] font-bold text-on-surface-variant">{it.device_type}</span>}
                  {kondisi && <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${kondisi.cls}`}>{kondisi.label}</span>}
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${rv.cls}`}>{rv.label}</span>
                </div>

                <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 font-body-md text-[12px] text-on-surface-variant">
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">person</span>{it.petugas?.full_name || "Petugas"}</span>
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">schedule</span>{fmt(it.created_at)}</span>
                  {it.lat != null && it.lng != null && (
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">location_on</span>{Number(it.lat).toFixed(4)}, {Number(it.lng).toFixed(4)}</span>
                  )}
                </p>

                {/* Pengukuran */}
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {READINGS.map((r) => (
                    <div key={r.k} className="rounded-xl bg-surface-container-low p-3">
                      <p className="font-label-sm text-label-sm text-on-surface-variant">{r.label}</p>
                      <p className="font-heading text-lg font-bold text-on-surface">
                        {readings[r.k] != null && readings[r.k] !== "" ? `${readings[r.k]}${r.unit}` : "—"}
                      </p>
                    </div>
                  ))}
                </div>

                {it.diagnosis_text && (
                  <p className="mt-3 rounded-xl bg-surface-container-low p-3 font-body-md text-[13px] text-on-surface">
                    <span className="font-bold text-on-surface-variant">Catatan petugas: </span>{it.diagnosis_text}
                  </p>
                )}

                {/* Foto RGB lapangan */}
                {photos.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {photos.map((src, i) => (
                      <button key={i} type="button" onClick={() => setLightbox(src)} className="h-24 w-24 overflow-hidden rounded-lg border border-outline-variant">
                        <img src={src} alt={`Foto inspeksi ${i + 1}`} className="h-full w-full object-cover transition hover:scale-105" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Catatan review sebelumnya */}
                {!isPending && it.review_note && (
                  <p className="mt-3 rounded-xl bg-surface-container-low p-3 font-body-md text-[13px] text-on-surface-variant">
                    <span className="font-bold">Catatan supervisor: </span>{it.review_note}
                  </p>
                )}

                {/* Aksi review */}
                {isPending && (
                  <div className="mt-4">
                    {openNote && (
                      <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        rows={2}
                        placeholder="Catatan (opsional) untuk petugas…"
                        className="mb-3 w-full rounded-xl border border-outline-variant bg-white p-3 font-body-md text-[14px] text-on-surface outline-none focus:border-brand"
                      />
                    )}
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => review(it.id, "checked")}
                        disabled={busy}
                        className="flex items-center gap-1.5 rounded-full bg-risk-aman px-5 py-2 font-label-bold text-label-bold text-white transition hover:brightness-110 disabled:opacity-60"
                      >
                        <span className="material-symbols-outlined text-[18px]">{busy ? "hourglass_top" : "check_circle"}</span> Tandai Sudah Dicek
                      </button>
                      <button
                        onClick={() => review(it.id, "rejected")}
                        disabled={busy}
                        className="flex items-center gap-1.5 rounded-full border border-risk-kritis px-5 py-2 font-label-bold text-label-bold text-risk-kritis transition hover:bg-risk-kritis/5 disabled:opacity-60"
                      >
                        <span className="material-symbols-outlined text-[18px]">cancel</span> Tolak
                      </button>
                      <button
                        onClick={() => {
                          setNoteId(openNote ? null : it.id);
                          setNote("");
                        }}
                        disabled={busy}
                        className="rounded-full border border-outline-variant px-4 py-2 font-label-bold text-label-bold text-on-surface-variant hover:bg-surface-container-low disabled:opacity-60"
                      >
                        {openNote ? "Tutup catatan" : "Tambah catatan"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox foto */}
      {lightbox && (
        <div className="fixed inset-0 z-[800] grid place-items-center bg-black/80 p-4" onClick={() => setLightbox("")}>
          <img src={lightbox} alt="Foto inspeksi" className="max-h-[90vh] max-w-full rounded-lg object-contain" />
        </div>
      )}
    </div>
  );
}