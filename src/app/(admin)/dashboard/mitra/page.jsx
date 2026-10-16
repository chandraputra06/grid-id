"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

const TYPES = ["vendor", "kontraktor", "pemda", "komunitas"];
const EMPTY = { name: "", type: "vendor", contact: "", unit: "", note: "" };

export default function Mitra() {
  const [list, setList] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const [d, me] = await Promise.all([api.get("/api/mitra"), api.get("/api/me").catch(() => null)]);
      setList(Array.isArray(d) ? d : []);
      setIsAdmin(me?.role === "admin");
    } catch (e) {
      setErr(e?.message || "Gagal memuat mitra.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    setMsg("");
    if (!form.name.trim()) {
      setMsg("err:Nama mitra wajib diisi.");
      return;
    }
    setBusy(true);
    try {
      await api.post("/api/mitra", { ...form, name: form.name.trim() });
      setMsg("ok:Mitra ditambahkan.");
      setForm(EMPTY);
      load();
    } catch (e2) {
      setMsg("err:" + (e2?.message || "Gagal menambah mitra."));
    } finally {
      setBusy(false);
    }
  }

  async function toggle(m) {
    try {
      await api.patch(`/api/mitra/${m.id}`, { status: m.status === "aktif" ? "nonaktif" : "aktif" });
      load();
    } catch (e) {
      setErr(e?.message || "Gagal mengubah status.");
    }
  }

  async function hapus(id) {
    try {
      await api.request(`/api/mitra/${id}`, { method: "DELETE" });
      setList((l) => l.filter((x) => x.id !== id));
    } catch (e) {
      setErr(e?.message || "Gagal menghapus mitra.");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-extrabold text-on-surface">Panel Mitra</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">Daftar mitra kerja GRID·ID (vendor, kontraktor, pemda, komunitas).</p>
      </div>

      {err && <p className="rounded-lg bg-risk-kritis/10 px-3 py-2 text-[13px] font-semibold text-risk-kritis">{err}</p>}

      <div className="grid gap-6 lg:grid-cols-3">
        {isAdmin && (
          <div className="rounded-2xl border border-outline-variant bg-card-surface p-5 shadow-sm lg:col-span-1">
            <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-on-surface">
              <span className="material-symbols-outlined text-brand">add_business</span> Tambah Mitra
            </h2>
            <form onSubmit={submit} className="mt-4 space-y-3">
              <Field label="Nama Mitra"><input value={form.name} onChange={set("name")} placeholder="PT Listrik Jaya" className="fld-m" /></Field>
              <Field label="Tipe">
                <select value={form.type} onChange={set("type")} className="fld-m">
                  {TYPES.map((t) => (<option key={t} value={t}>{t}</option>))}
                </select>
              </Field>
              <Field label="Kontak"><input value={form.contact} onChange={set("contact")} placeholder="08xx / email" className="fld-m" /></Field>
              <Field label="Unit (opsional)"><input value={form.unit} onChange={set("unit")} placeholder="UP3 Bali" className="fld-m" /></Field>
              <Field label="Catatan (opsional)"><input value={form.note} onChange={set("note")} placeholder="ruang lingkup kerja" className="fld-m" /></Field>
              <Msg value={msg} />
              <button type="submit" disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-full bg-brand py-2.5 font-label-bold text-label-bold text-white transition hover:brightness-110 active:scale-95 disabled:opacity-60">
                <span className="material-symbols-outlined text-[18px]">{busy ? "hourglass_top" : "add"}</span>{busy ? "Menyimpan…" : "Tambah"}
              </button>
            </form>
          </div>
        )}

        <div className={`rounded-2xl border border-outline-variant bg-card-surface p-5 shadow-sm ${isAdmin ? "lg:col-span-2" : "lg:col-span-3"}`}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-heading text-lg font-bold text-on-surface">Daftar Mitra</h2>
            <button onClick={load} className="font-label-sm text-label-sm font-semibold text-brand hover:underline">Muat ulang</button>
          </div>
          {loading ? (
            <p className="py-8 text-center font-body-md text-body-md text-on-surface-variant">Memuat…</p>
          ) : list.length === 0 ? (
            <p className="py-8 text-center font-body-md text-body-md text-on-surface-variant">Belum ada mitra.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left">
                <thead>
                  <tr className="border-b border-outline-variant font-heading text-[11px] uppercase tracking-wider text-on-surface-variant">
                    <th className="py-2 pr-3">Nama</th><th className="py-2 pr-3">Tipe</th><th className="py-2 pr-3">Kontak</th><th className="py-2 pr-3">Status</th>{isAdmin && <th className="py-2">Aksi</th>}
                  </tr>
                </thead>
                <tbody>
                  {list.map((m) => (
                    <tr key={m.id} className="border-b border-outline-variant/60">
                      <td className="py-2.5 pr-3 font-heading text-[13px] font-bold text-on-surface">{m.name}</td>
                      <td className="py-2.5 pr-3 font-body-md text-[13px] capitalize text-on-surface-variant">{m.type || "—"}</td>
                      <td className="py-2.5 pr-3 font-body-md text-[12px] text-on-surface-variant">{m.contact || "—"}</td>
                      <td className="py-2.5 pr-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${m.status === "aktif" ? "bg-risk-aman/10 text-risk-aman" : "bg-surface-container-low text-on-surface-variant"}`}>{m.status || "aktif"}</span>
                      </td>
                      {isAdmin && (
                        <td className="py-2.5">
                          <div className="flex items-center gap-2">
                            <button onClick={() => toggle(m)} className="font-label-sm text-label-sm font-semibold text-brand hover:underline">{m.status === "aktif" ? "Nonaktifkan" : "Aktifkan"}</button>
                            <button onClick={() => hapus(m.id)} className="font-label-sm text-label-sm font-semibold text-risk-kritis hover:underline">Hapus</button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .fld-m { width:100%; border:1px solid var(--outline-variant,#cbd5e1); border-radius:0.75rem; padding:0.55rem 0.75rem; font-size:0.875rem; background:#fff; outline:none; }
        .fld-m:focus { border-color:#2743D9; box-shadow:0 0 0 3px rgba(39,67,217,0.15); }
      `}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (<label className="block"><span className="mb-1 block font-label-sm text-label-sm text-on-surface-variant">{label}</span>{children}</label>);
}
function Msg({ value }) {
  if (!value) return null;
  const isOk = value.startsWith("ok:");
  return <p className={`rounded-lg px-3 py-2 text-[13px] font-semibold ${isOk ? "bg-risk-aman/10 text-risk-aman" : "bg-risk-kritis/10 text-risk-kritis"}`}>{value.slice(value.indexOf(":") + 1)}</p>;
}