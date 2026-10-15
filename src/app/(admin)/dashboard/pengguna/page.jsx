"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

const ROLE_META = {
  admin: { label: "Admin", cls: "bg-brand/10 text-brand" },
  petugas: { label: "Petugas", cls: "bg-risk-waspada/10 text-risk-waspada" },
  warga: { label: "Warga", cls: "bg-risk-aman/10 text-risk-aman" },
};

const EMPTY = { full_name: "", email: "", password: "", role: "petugas", phone: "", unit: "" };

export default function ManajemenUser() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listErr, setListErr] = useState("");

  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [formErr, setFormErr] = useState("");
  const [ok, setOk] = useState("");

  async function load() {
    setLoading(true);
    setListErr("");
    try {
      const data = await api.get("/api/users");
      setUsers(data || []);
    } catch (e) {
      setListErr(e?.message || "Gagal memuat daftar user.");
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
    setFormErr("");
    setOk("");
    if (!form.email || !form.password) {
      setFormErr("Email dan password wajib diisi.");
      return;
    }
    if (form.password.length < 8) {
      setFormErr("Password minimal 8 karakter.");
      return;
    }
    setBusy(true);
    try {
      await api.post("/api/users", {
        email: form.email,
        password: form.password,
        full_name: form.full_name || null,
        role: form.role,
        phone: form.phone || null,
        unit: form.unit || null,
      });
      setOk(`Akun ${form.email} (${form.role}) berhasil dibuat.`);
      setForm(EMPTY);
      load();
    } catch (err) {
      setFormErr(err?.message || "Gagal membuat akun.");
    } finally {
      setBusy(false);
    }
  }

  async function changeRole(id, role) {
    try {
      await api.patch(`/api/users/${id}/role`, { role });
      setUsers((list) => list.map((u) => (u.id === id ? { ...u, role } : u)));
    } catch (e) {
      setListErr(e?.message || "Gagal mengubah role.");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-extrabold text-on-surface">Manajemen User</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Kelola akun petugas &amp; admin. Warga mendaftar sendiri lewat halaman publik.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Form tambah user */}
        <div className="rounded-2xl border border-outline-variant bg-card-surface p-5 shadow-sm lg:col-span-1">
          <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-on-surface">
            <span className="material-symbols-outlined text-brand">person_add</span> Tambah Akun
          </h2>

          <form onSubmit={submit} className="mt-4 space-y-3">
            <Field label="Nama Lengkap">
              <input value={form.full_name} onChange={set("full_name")} placeholder="Budi Santoso"
                className="fld-u" type="text" />
            </Field>
            <Field label="Email">
              <input value={form.email} onChange={set("email")} placeholder="petugas@grid.id"
                className="fld-u" type="email" required />
            </Field>
            <Field label="Password">
              <input value={form.password} onChange={set("password")} placeholder="Min. 8 karakter"
                className="fld-u" type="password" required />
            </Field>
            <Field label="Role">
              <select value={form.role} onChange={set("role")} className="fld-u">
                <option value="petugas">Petugas</option>
                <option value="admin">Admin</option>
                <option value="warga">Warga</option>
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="No. HP (opsional)">
                <input value={form.phone} onChange={set("phone")} placeholder="08xx" className="fld-u" type="text" />
              </Field>
              <Field label="Unit (opsional)">
                <input value={form.unit} onChange={set("unit")} placeholder="UP3 Bali" className="fld-u" type="text" />
              </Field>
            </div>

            {formErr && <p className="rounded-lg bg-risk-kritis/10 px-3 py-2 text-[13px] font-semibold text-risk-kritis">{formErr}</p>}
            {ok && <p className="rounded-lg bg-risk-aman/10 px-3 py-2 text-[13px] font-semibold text-risk-aman">{ok}</p>}

            <button type="submit" disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-brand py-2.5 font-label-bold text-label-bold text-white transition-all hover:brightness-110 active:scale-95 disabled:opacity-60">
              <span className="material-symbols-outlined text-[18px]">{busy ? "hourglass_top" : "add"}</span>
              {busy ? "Membuat…" : "Buat Akun"}
            </button>
          </form>

          <style>{`
            .fld-u { width:100%; border:1px solid var(--outline-variant,#cbd5e1); border-radius:0.75rem; padding:0.55rem 0.75rem; font-size:0.875rem; background:#fff; outline:none; }
            .fld-u:focus { border-color:#2743D9; box-shadow:0 0 0 3px rgba(39,67,217,0.15); }
          `}</style>
        </div>

        {/* Daftar user */}
        <div className="rounded-2xl border border-outline-variant bg-card-surface p-5 shadow-sm lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-on-surface">
              <span className="material-symbols-outlined text-brand">group</span> Daftar User
            </h2>
            <button onClick={load} className="font-label-sm text-label-sm font-semibold text-brand hover:underline">Muat ulang</button>
          </div>

          {listErr && <p className="mb-3 rounded-lg bg-risk-kritis/10 px-3 py-2 text-[13px] font-semibold text-risk-kritis">{listErr}</p>}

          {loading ? (
            <p className="py-8 text-center font-body-md text-body-md text-on-surface-variant">Memuat…</p>
          ) : users.length === 0 ? (
            <p className="py-8 text-center font-body-md text-body-md text-on-surface-variant">Belum ada user.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-outline-variant font-heading text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                    <th className="py-2 pr-3">Nama</th>
                    <th className="py-2 pr-3">Email</th>
                    <th className="py-2 pr-3">Role</th>
                    <th className="py-2">Ubah Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const meta = ROLE_META[u.role] || ROLE_META.warga;
                    return (
                      <tr key={u.id} className="border-b border-outline-variant/60">
                        <td className="py-2.5 pr-3 font-body-md text-[13px] text-on-surface">{u.full_name || "—"}</td>
                        <td className="py-2.5 pr-3 font-body-md text-[13px] text-on-surface-variant">{u.email || "—"}</td>
                        <td className="py-2.5 pr-3">
                          <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${meta.cls}`}>{meta.label}</span>
                        </td>
                        <td className="py-2.5">
                          <select
                            value={u.role}
                            onChange={(e) => changeRole(u.id, e.target.value)}
                            className="rounded-lg border border-outline-variant bg-white px-2 py-1 text-[12px] outline-none focus:border-brand"
                          >
                            <option value="petugas">Petugas</option>
                            <option value="admin">Admin</option>
                            <option value="warga">Warga</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
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