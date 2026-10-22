"use client";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { supabase } from "@/lib/supabase";

const PRIO = {
  3: { label: "Mendesak", cls: "bg-risk-kritis text-white" },
  2: { label: "Tinggi", cls: "bg-risk-waspada text-white" },
  1: { label: "Normal", cls: "bg-risk-aman text-white" },
};
const STATUS = {
  ditugaskan: { label: "Baru", cls: "bg-brand/10 text-brand" },
  diterima: { label: "Diterima", cls: "bg-risk-waspada/10 text-risk-waspada" },
  dikerjakan: { label: "Dikerjakan", cls: "bg-brand/10 text-brand" },
  selesai: { label: "Selesai", cls: "bg-risk-aman/10 text-risk-aman" },
  ditolak: { label: "Ditolak", cls: "bg-surface-container-low text-on-surface-variant" },
};
const FILTERS = [
  { key: "all", label: "Semua" },
  { key: "ditugaskan", label: "Baru" },
  { key: "aktif", label: "Aktif" },
  { key: "selesai", label: "Selesai" },
];

// Form inspeksi lapangan: jenis aset & kondisi fisik mengikuti contoh formulir.
const JENIS_ASET = ["Trafo distribusi", "Tiang dan kabel", "Isolator", "Panel listrik"];
// Kondisi fisik -> diagnosis_level (enum risk_level).
const KONDISI = [
  { v: "aman", label: "Normal" },
  { v: "waspada", label: "Perlu pemantauan" },
  { v: "kritis", label: "Perlu pemeriksaan lanjutan" },
];

function coords(a) {
  if (!a || a.lat == null || a.lng == null) return null;
  return `${Number(a.lat).toFixed(4)}, ${Number(a.lng).toFixed(4)}`;
}

function num(v) {
  return v !== "" && v != null && !Number.isNaN(Number(v)) ? Number(v) : null;
}

// Form inspeksi lapangan + upload foto RGB. Tersimpan ke /api/inspections untuk dicek supervisor.
function InspectionForm({ assignment, onCancel, onDone }) {
  const asset = assignment.asset || {};
  const [deviceType, setDeviceType] = useState(JENIS_ASET.includes(asset.asset_type) ? asset.asset_type : JENIS_ASET[0]);
  const [tempAset, setTempAset] = useState("");
  const [suhu, setSuhu] = useState("");
  const [arus, setArus] = useState("");
  const [beban, setBeban] = useState("");
  const [kondisi, setKondisi] = useState("aman");
  const [catatan, setCatatan] = useState("");
  const [files, setFiles] = useState([]); // { file, preview }
  const [lat, setLat] = useState(asset.lat ?? null);
  const [lng, setLng] = useState(asset.lng ?? null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  // Lokasi lapangan (best-effort) — menimpa koordinat aset bila tersedia.
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
      },
      () => {},
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  useEffect(() => () => files.forEach((f) => URL.revokeObjectURL(f.preview)), [files]);

  function addFiles(e) {
    const picked = Array.from(e.target.files || []);
    e.target.value = "";
    if (picked.length) setFiles((prev) => [...prev, ...picked.map((f) => ({ file: f, preview: URL.createObjectURL(f) }))]);
  }
  function removeFile(i) {
    setFiles((prev) => {
      const next = [...prev];
      const [rm] = next.splice(i, 1);
      if (rm) URL.revokeObjectURL(rm.preview);
      return next;
    });
  }

  async function uploadOne(file) {
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const sign = await api.post("/api/uploads/sign", { ext });
    const up = await supabase.storage.from(sign.bucket).uploadToSignedUrl(sign.path, sign.token, file);
    if (up.error) throw new Error(up.error.message);
    return sign.public_url;
  }

  async function submit() {
    if (busy) return;
    setErr("");
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setErr("Sesi berakhir. Silakan masuk kembali.");
      return;
    }
    setBusy(true);
    try {
      const photos = [];
      for (const f of files) photos.push(await uploadOne(f.file));

      await api.post("/api/inspections", {
        asset_id: assignment.asset_id || asset.id || null,
        device_type: deviceType || null,
        lat,
        lng,
        diagnosis_level: kondisi,
        diagnosis_text: catatan || null,
        readings: {
          temp_aset: num(tempAset),
          suhu_lingkungan: num(suhu),
          arus: num(arus),
          beban_trafo: num(beban),
        },
        photos: photos.length ? photos : null,
      });
      onDone();
    } catch (e) {
      setErr(e?.message || "Gagal menyimpan inspeksi. Coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-4 space-y-3 rounded-xl border border-outline-variant bg-surface-container-low p-4">
      <p className="font-heading text-sm font-bold text-on-surface">Formulir Inspeksi Aset</p>

      <Field label="Jenis aset">
        <div className="flex flex-wrap gap-2">
          {JENIS_ASET.map((j) => (
            <button
              key={j}
              type="button"
              onClick={() => setDeviceType(j)}
              className={`rounded-full px-3 py-1.5 text-[13px] font-bold transition ${deviceType === j ? "bg-brand text-white" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"}`}
            >
              {j}
            </button>
          ))}
        </div>
      </Field>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Temperatur aset (°C)">
          <input className="fld-t" type="number" inputMode="decimal" value={tempAset} onChange={(e) => setTempAset(e.target.value)} placeholder="mis. 58" />
        </Field>
        <Field label="Suhu lingkungan (°C)">
          <input className="fld-t" type="number" inputMode="decimal" value={suhu} onChange={(e) => setSuhu(e.target.value)} placeholder="mis. 30" />
        </Field>
        <Field label="Arus (A)">
          <input className="fld-t" type="number" inputMode="decimal" value={arus} onChange={(e) => setArus(e.target.value)} placeholder="mis. 80" />
        </Field>
        <Field label="Beban trafo (%)">
          <input className="fld-t" type="number" inputMode="decimal" value={beban} onChange={(e) => setBeban(e.target.value)} placeholder="mis. 75" />
        </Field>
      </div>

      <Field label="Kondisi fisik">
        <div className="flex flex-wrap gap-2">
          {KONDISI.map((k) => (
            <button
              key={k.v}
              type="button"
              onClick={() => setKondisi(k.v)}
              className={`rounded-full px-3 py-1.5 text-[13px] font-bold transition ${kondisi === k.v ? "bg-brand text-white" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"}`}
            >
              {k.label}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Catatan petugas">
        <textarea className="fld-t" rows={2} value={catatan} onChange={(e) => setCatatan(e.target.value)} placeholder="Contoh: terdapat korosi pada sambungan..." />
      </Field>

      {/* Foto RGB lapangan */}
      <div>
        <span className="mb-1 block font-label-sm text-label-sm text-on-surface-variant">Foto RGB lapangan</span>
        <div className="flex flex-wrap gap-2">
          {files.map((f, i) => (
            <div key={i} className="relative h-20 w-20 overflow-hidden rounded-lg border border-outline-variant">
              <img src={f.preview} alt="" className="h-full w-full object-cover" />
              <button type="button" onClick={() => removeFile(i)} aria-label="Hapus foto" className="absolute right-0 top-0 grid h-5 w-5 place-items-center rounded-bl bg-black/60 text-[12px] text-white">×</button>
            </div>
          ))}
          <label className="grid h-20 w-20 cursor-pointer place-items-center rounded-lg border border-dashed border-outline-variant text-on-surface-variant hover:bg-surface-container">
            <span className="material-symbols-outlined">add_a_photo</span>
            <input type="file" accept="image/*" capture="environment" multiple className="hidden" onChange={addFiles} />
          </label>
        </div>
      </div>

      <p className="font-body-md text-[12px] text-on-surface-variant">
        {lat != null && lng != null ? `Lokasi terlampir: ${Number(lat).toFixed(4)}, ${Number(lng).toFixed(4)}` : "Lokasi belum terlampir (izinkan akses lokasi di lapangan)."}
      </p>

      {err && <p className="rounded-lg bg-risk-kritis/10 px-3 py-2 text-[13px] font-semibold text-risk-kritis">{err}</p>}

      <div className="flex flex-wrap gap-2">
        <button
          onClick={submit}
          disabled={busy}
          className="flex items-center gap-1.5 rounded-full bg-brand px-5 py-2 font-label-bold text-label-bold text-white transition hover:brightness-110 disabled:opacity-60"
        >
          <span className="material-symbols-outlined text-[18px]">{busy ? "hourglass_top" : "save"}</span> {busy ? "Menyimpan…" : "Simpan Inspeksi"}
        </button>
        <button onClick={onCancel} disabled={busy} className="rounded-full border border-outline-variant px-4 py-2 font-label-bold text-label-bold text-on-surface-variant hover:bg-surface-container">
          Batal
        </button>
      </div>
    </div>
  );
}

export default function Tugas() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [filter, setFilter] = useState("all");
  const [busyId, setBusyId] = useState(null);
  const [reportId, setReportId] = useState(null);
  const [inspId, setInspId] = useState(null);
  const [rf, setRf] = useState({ tools_used: "", prior_repair_count: "", problem_found: "", actions_done: "" });

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const d = await api.get("/api/assignments");
      setList(Array.isArray(d) ? d : []);
    } catch (e) {
      setErr(e?.message || "Gagal memuat tugas.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (filter === "all") return list;
    if (filter === "aktif") return list.filter((a) => a.status === "diterima" || a.status === "dikerjakan");
    return list.filter((a) => a.status === filter);
  }, [list, filter]);

  async function act(id, fn) {
    if (busyId) return;
    setBusyId(id);
    setErr("");
    try {
      await fn();
      await load();
    } catch (e) {
      setErr(e?.message || "Gagal memproses.");
    } finally {
      setBusyId(null);
    }
  }

  async function submitReport(id) {
    await act(id, async () => {
      await api.post(`/api/assignments/${id}/report`, {
        tools_used: rf.tools_used || null,
        prior_repair_count: rf.prior_repair_count !== "" ? Number(rf.prior_repair_count) : null,
        problem_found: rf.problem_found || null,
        actions_done: rf.actions_done || null,
      });
      setReportId(null);
      setRf({ tools_used: "", prior_repair_count: "", problem_found: "", actions_done: "" });
    });
  }

  function openInspection(id) {
    setReportId(null);
    setInspId(id);
  }
  function openReport(id) {
    setInspId(null);
    setReportId(id);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-extrabold text-on-surface">Tugas Saya</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">Penugasan dari supervisor. Terima, inspeksi di lapangan, lalu lapor hasilnya.</p>
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
        <p className="py-16 text-center font-body-md text-body-md text-on-surface-variant">Memuat tugas…</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-outline-variant bg-card-surface p-10 text-center shadow-sm">
          <span className="material-symbols-outlined text-5xl text-on-surface-variant">assignment_turned_in</span>
          <p className="mt-2 font-body-md text-body-md text-on-surface-variant">Tidak ada tugas pada filter ini.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((a) => {
            const st = STATUS[a.status] || STATUS.ditugaskan;
            const pr = PRIO[a.priority] || PRIO[2];
            const busy = busyId === a.id;
            const asset = a.asset || {};
            const c = coords(asset);
            const openR = reportId === a.id;
            const openI = inspId === a.id;
            const inField = a.status === "diterima" || a.status === "dikerjakan";
            return (
              <div key={a.id} className="rounded-2xl border border-outline-variant bg-card-surface p-5 shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-heading text-sm font-bold text-on-surface">{asset.name || asset.asset_code || "Aset"}</h3>
                  {asset.asset_code && <span className="rounded-full bg-surface-container-low px-2 py-0.5 text-[10px] font-bold text-on-surface-variant">{asset.asset_code}</span>}
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${pr.cls}`}>{pr.label}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${st.cls}`}>{st.label}</span>
                </div>
                <p className="mt-2 font-body-md text-[14px] text-on-surface">{a.problem_desc || "Tanpa deskripsi masalah"}</p>
                <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 font-body-md text-[12px] text-on-surface-variant">
                  {c && (<span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">location_on</span>{c}</span>)}
                  {asset.unit && <span>{asset.unit}</span>}
                  {a.deadline && <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">event</span>{a.deadline}</span>}
                </p>

                {/* Aksi sesuai status */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {a.status === "ditugaskan" && (
                    <>
                      <button onClick={() => act(a.id, () => api.patch(`/api/assignments/${a.id}/accept`))} disabled={busy}
                        className="flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 font-label-bold text-label-bold text-white transition hover:brightness-110 disabled:opacity-60">
                        <span className="material-symbols-outlined text-[18px]">check</span> Terima
                      </button>
                      <button onClick={() => act(a.id, () => api.patch(`/api/assignments/${a.id}/status`, { status: "ditolak" }))} disabled={busy}
                        className="flex items-center gap-1.5 rounded-full border border-outline-variant px-4 py-2 font-label-bold text-label-bold text-on-surface-variant hover:bg-surface-container-low disabled:opacity-60">
                        Tolak
                      </button>
                    </>
                  )}
                  {a.status === "diterima" && (
                    <button onClick={() => act(a.id, () => api.patch(`/api/assignments/${a.id}/status`, { status: "dikerjakan" }))} disabled={busy}
                      className="flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 font-label-bold text-label-bold text-white transition hover:brightness-110 disabled:opacity-60">
                      <span className="material-symbols-outlined text-[18px]">play_arrow</span> Mulai Kerjakan
                    </button>
                  )}
                  {inField && !openI && (
                    <button onClick={() => openInspection(a.id)} disabled={busy}
                      className="flex items-center gap-1.5 rounded-full border border-brand px-4 py-2 font-label-bold text-label-bold text-brand transition hover:bg-brand/5 disabled:opacity-60">
                      <span className="material-symbols-outlined text-[18px]">camera</span> Inspeksi Lapangan
                    </button>
                  )}
                  {a.status === "dikerjakan" && !openR && (
                    <button onClick={() => openReport(a.id)} disabled={busy}
                      className="flex items-center gap-1.5 rounded-full bg-risk-aman px-4 py-2 font-label-bold text-label-bold text-white transition hover:brightness-110 disabled:opacity-60">
                      <span className="material-symbols-outlined text-[18px]">done_all</span> Lapor Penyelesaian
                    </button>
                  )}
                </div>

                {/* Form inspeksi lapangan + upload foto RGB */}
                {openI && (
                  <InspectionForm
                    assignment={a}
                    onCancel={() => setInspId(null)}
                    onDone={() => {
                      setInspId(null);
                      load();
                    }}
                  />
                )}

                {/* Form lapor penyelesaian */}
                {openR && (
                  <div className="mt-4 space-y-3 rounded-xl border border-outline-variant bg-surface-container-low p-4">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <Field label="Alat yang dipakai">
                        <input value={rf.tools_used} onChange={(e) => setRf((f) => ({ ...f, tools_used: e.target.value }))} placeholder="tang, tester, tangga" className="fld-t" />
                      </Field>
                      <Field label="Riwayat perbaikan (kali)">
                        <input value={rf.prior_repair_count} onChange={(e) => setRf((f) => ({ ...f, prior_repair_count: e.target.value }))} type="number" min="0" placeholder="0" className="fld-t" />
                      </Field>
                    </div>
                    <Field label="Masalah yang ditemukan">
                      <input value={rf.problem_found} onChange={(e) => setRf((f) => ({ ...f, problem_found: e.target.value }))} placeholder="mis. isolator retak" className="fld-t" />
                    </Field>
                    <Field label="Tindakan yang dilakukan">
                      <textarea value={rf.actions_done} onChange={(e) => setRf((f) => ({ ...f, actions_done: e.target.value }))} rows={2} placeholder="mis. ganti isolator, kencangkan kabel" className="fld-t" />
                    </Field>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => submitReport(a.id)} disabled={busy}
                        className="flex items-center gap-1.5 rounded-full bg-risk-aman px-5 py-2 font-label-bold text-label-bold text-white transition hover:brightness-110 disabled:opacity-60">
                        <span className="material-symbols-outlined text-[18px]">{busy ? "hourglass_top" : "send"}</span> Kirim &amp; Selesai
                      </button>
                      <button onClick={() => setReportId(null)} disabled={busy} className="rounded-full border border-outline-variant px-4 py-2 font-label-bold text-label-bold text-on-surface-variant hover:bg-surface-container">
                        Batal
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        .fld-t { width:100%; border:1px solid var(--outline-variant,#cbd5e1); border-radius:0.5rem; padding:0.5rem 0.65rem; font-size:0.875rem; background:#fff; outline:none; }
        .fld-t:focus { border-color:#2743D9; box-shadow:0 0 0 3px rgba(39,67,217,0.12); }
      `}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block font-label-sm text-label-sm text-on-surface-variant">{label}</span>
      {children}
    </label>
  );
}