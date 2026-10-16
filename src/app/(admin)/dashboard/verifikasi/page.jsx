"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

const SOURCE = { warga: "Laporan Warga", petugas: "Laporan Petugas", cctv: "CCTV" };

function fmt(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}

export default function Verifikasi() {
  const [queue, setQueue] = useState([]);
  const [petugas, setPetugas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [openId, setOpenId] = useState(null);
  const [form, setForm] = useState({ assigned_to: "", problem_desc: "", priority: "2" });

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const [q, p] = await Promise.all([
        api.get("/api/review/queue"),
        api.get("/api/assignments/petugas").catch(() => []),
      ]);
      setQueue(Array.isArray(q) ? q : []);
      setPetugas(Array.isArray(p) ? p : []);
    } catch (e) {
      setErr(e?.message || "Gagal memuat antrian verifikasi.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function decide(id, decision, extra = {}) {
    if (busyId) return;
    setBusyId(id);
    setErr("");
    try {
      await api.post(`/api/review/${id}`, { decision, ...extra });
      setQueue((q) => q.filter((r) => r.id !== id));
      setOpenId(null);
      setForm({ assigned_to: "", problem_desc: "", priority: "2" });
    } catch (e) {
      setErr(e?.message || "Gagal memproses keputusan.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-extrabold text-on-surface">Antrian Verifikasi</h1>
        <p className="max-w-2xl font-body-md text-body-md text-on-surface-variant">
          AI sudah menyaring, Anda yang memutuskan. Laporan hanya jadi tugas lapangan setelah Anda ACC.
        </p>
      </div>

      {err && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-outline-variant bg-risk-kritis/5 p-4">
          <p className="text-[13px] font-semibold text-risk-kritis">{err}</p>
          <button onClick={load} className="rounded-full bg-brand px-4 py-1.5 text-[13px] font-bold text-white hover:brightness-110">Muat ulang</button>
        </div>
      )}

      {loading ? (
        <p className="py-16 text-center font-body-md text-body-md text-on-surface-variant">Memuat antrian…</p>
      ) : queue.length === 0 ? (
        <div className="rounded-2xl border border-outline-variant bg-card-surface p-10 text-center shadow-sm">
          <span className="material-symbols-outlined text-5xl text-risk-aman">task_alt</span>
          <p className="mt-2 font-heading text-lg font-bold text-on-surface">Antrian bersih</p>
          <p className="font-body-md text-body-md text-on-surface-variant">Tidak ada laporan yang menunggu verifikasi.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {queue.map((r) => {
            const open = openId === r.id;
            const busy = busyId === r.id;
            const coords = r.lat != null && r.lng != null ? `${Number(r.lat).toFixed(4)}, ${Number(r.lng).toFixed(4)}` : null;
            return (
              <div key={r.id} className="overflow-hidden rounded-2xl border border-outline-variant bg-card-surface shadow-sm">
                <div className="flex flex-col gap-4 p-5 sm:flex-row">
                  {/* Foto */}
                  <div className="h-40 w-full shrink-0 overflow-hidden rounded-xl bg-surface-container-low sm:w-56">
                    {r.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.photo_url} alt="Foto laporan" className="h-full w-full object-cover" />
                    ) : (
                      <div className="grid h-full place-items-center text-on-surface-variant">
                        <span className="material-symbols-outlined text-4xl">image_not_supported</span>
                      </div>
                    )}
                  </div>

                  {/* Info + aksi */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-[11px] font-bold text-brand">{SOURCE[r.source] || r.source || "—"}</span>
                      <span className="font-body-md text-[12px] text-on-surface-variant">#{String(r.id || "").slice(0, 8)} · {fmt(r.created_at)}</span>
                    </div>
                    <p className="mt-2 font-body-md text-[14px] text-on-surface">{r.description || "Tanpa deskripsi"}</p>
                    <p className="mt-1 flex items-center gap-1 font-body-md text-[12px] text-on-surface-variant">
                      <span className="material-symbols-outlined text-[16px]">location_on</span>
                      {coords || "Lokasi tidak dicatat"}
                    </p>

                    {!open ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          onClick={() => decide(r.id, "reject")}
                          disabled={busy}
                          className="flex items-center gap-1.5 rounded-full border border-risk-kritis/30 bg-risk-kritis/5 px-4 py-2 font-label-bold text-label-bold text-risk-kritis transition hover:bg-risk-kritis/10 disabled:opacity-60"
                        >
                          <span className="material-symbols-outlined text-[18px]">close</span> Tolak / Aman
                        </button>
                        <button
                          onClick={() => setOpenId(r.id)}
                          disabled={busy}
                          className="flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 font-label-bold text-label-bold text-white transition hover:brightness-110 disabled:opacity-60"
                        >
                          <span className="material-symbols-outlined text-[18px]">check</span> ACC &amp; Tugaskan
                        </button>
                      </div>
                    ) : (
                      <div className="mt-4 space-y-3 rounded-xl border border-outline-variant bg-surface-container-low p-4">
                        <label className="block">
                          <span className="mb-1 block font-label-sm text-label-sm text-on-surface-variant">Tugaskan ke petugas (opsional)</span>
                          <select
                            value={form.assigned_to}
                            onChange={(e) => setForm((f) => ({ ...f, assigned_to: e.target.value }))}
                            className="w-full rounded-lg border border-outline-variant bg-white px-3 py-2 text-sm outline-none focus:border-brand"
                          >
                            <option value="">— tanpa penugasan —</option>
                            {petugas.map((p) => (
                              <option key={p.id} value={p.id}>{p.full_name || p.id}{p.unit ? ` · ${p.unit}` : ""}</option>
                            ))}
                          </select>
                        </label>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
                          <label className="block">
                            <span className="mb-1 block font-label-sm text-label-sm text-on-surface-variant">Deskripsi masalah</span>
                            <input
                              value={form.problem_desc}
                              onChange={(e) => setForm((f) => ({ ...f, problem_desc: e.target.value }))}
                              placeholder="mis. isolator retak, cek segera"
                              className="w-full rounded-lg border border-outline-variant bg-white px-3 py-2 text-sm outline-none focus:border-brand"
                            />
                          </label>
                          <label className="block">
                            <span className="mb-1 block font-label-sm text-label-sm text-on-surface-variant">Prioritas</span>
                            <select
                              value={form.priority}
                              onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
                              className="rounded-lg border border-outline-variant bg-white px-3 py-2 text-sm outline-none focus:border-brand"
                            >
                              <option value="3">Mendesak</option>
                              <option value="2">Tinggi</option>
                              <option value="1">Normal</option>
                            </select>
                          </label>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() =>
                              decide(r.id, "acc", {
                                assigned_to: form.assigned_to || undefined,
                                problem_desc: form.problem_desc || undefined,
                                priority: Number(form.priority),
                              })
                            }
                            disabled={busy}
                            className="flex items-center gap-1.5 rounded-full bg-brand px-5 py-2 font-label-bold text-label-bold text-white transition hover:brightness-110 disabled:opacity-60"
                          >
                            <span className="material-symbols-outlined text-[18px]">{busy ? "hourglass_top" : "send"}</span>
                            {form.assigned_to ? "ACC & Kirim Penugasan" : "ACC (tanpa tugas)"}
                          </button>
                          <button onClick={() => setOpenId(null)} disabled={busy} className="rounded-full border border-outline-variant px-4 py-2 font-label-bold text-label-bold text-on-surface-variant hover:bg-surface-container">
                            Batal
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}