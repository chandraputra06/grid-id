"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

const ROLE_LABEL = { admin: "Admin", supervisor: "Supervisor", petugas: "Petugas", hardware: "Tim Hardware", warga: "Warga" };

export default function Pengaturan() {
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setMe(await api.get("/api/me"));
      } catch (e) {
        setErr(e?.message || "Gagal memuat pengaturan.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p className="py-16 text-center font-body-md text-body-md text-on-surface-variant">Memuat…</p>;
  if (err) return <p className="mx-auto max-w-lg rounded-lg bg-risk-kritis/10 px-3 py-2 text-center text-[13px] font-semibold text-risk-kritis">{err}</p>;

  const rows = [
    ["Nama", me?.full_name || "—"],
    ["Email", me?.email || "—"],
    ["Role", ROLE_LABEL[me?.role] || me?.role || "—"],
    ["No. HP", me?.phone || "—"],
    ["Unit", me?.unit || "—"],
  ];
  const org = [
    ["UID", me?.uid || "—"],
    ["UP3", me?.up3 || "—"],
    ["ULP", me?.ulp || "—"],
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-extrabold text-on-surface">Pengaturan</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">Informasi akun & unit organisasi. Untuk mengubah nama/foto/password, buka Profil.</p>
      </div>

      <div className="rounded-2xl border border-outline-variant bg-card-surface p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 font-heading text-lg font-bold text-on-surface">
          <span className="material-symbols-outlined text-brand">account_circle</span> Akun
        </h2>
        <dl className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
          {rows.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 border-b border-outline-variant/60 pb-2">
              <dt className="font-body-md text-[13px] text-on-surface-variant">{k}</dt>
              <dd className="font-body-md text-[13px] font-semibold text-on-surface">{v}</dd>
            </div>
          ))}
        </dl>
        <a href="/profil" className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 font-label-bold text-label-bold text-white transition hover:brightness-110">
          <span className="material-symbols-outlined text-[18px]">edit</span> Edit Profil
        </a>
      </div>

      <div className="rounded-2xl border border-outline-variant bg-card-surface p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 font-heading text-lg font-bold text-on-surface">
          <span className="material-symbols-outlined text-brand">apartment</span> Unit Organisasi
        </h2>
        <dl className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-3">
          {org.map(([k, v]) => (
            <div key={k} className="rounded-xl bg-surface-container-low p-3">
              <dt className="font-label-sm text-label-sm text-on-surface-variant">{k}</dt>
              <dd className="mt-0.5 font-heading text-sm font-bold text-on-surface">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 font-body-md text-[12px] text-on-surface-variant">Unit organisasi diatur oleh admin dan menentukan data yang kamu lihat (scoping).</p>
      </div>
    </div>
  );
}