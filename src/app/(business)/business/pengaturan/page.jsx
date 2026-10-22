"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useApi } from "@/lib/hardware";
import { Card, GhostButton, Loading, PageHeader, PrimaryButton, TextInput } from "@/components/hardware/ui";
import { useBusinessOrg } from "@/components/business-shell";

export default function BusinessSettings() {
  const me = useApi("/api/me");
  const { org, myRole } = useBusinessOrg();
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function changePw(e) {
    e.preventDefault();
    setMsg("");
    if (pw.length < 8) return setMsg("err:Password minimal 8 karakter.");
    if (pw !== pw2) return setMsg("err:Konfirmasi password tidak sama.");
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: pw });
      if (error) throw error;
      setPw("");
      setPw2("");
      setMsg("ok:Password berhasil diganti.");
    } catch (err) {
      setMsg(`err:${err?.message || "Gagal mengganti password."}`);
    } finally {
      setBusy(false);
    }
    return null;
  }
  async function logout() {
    try {
      await supabase.auth.signOut();
    } finally {
      window.location.href = "/masuk";
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Pengaturan" subtitle="Akun Anda di GRID·ID Business Portal." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Akun" icon="account_circle">
          {me.loading && !me.data ? <Loading /> : me.data ? (
            <dl className="space-y-2 font-body-md text-[13px]">
              <div><dt className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Nama</dt><dd className="font-semibold">{me.data.full_name || "—"}</dd></div>
              <div><dt className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Email</dt><dd>{me.data.email}</dd></div>
              <div><dt className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Organisasi</dt><dd>{org ? org.name : "—"} · {myRole === "owner" ? "Owner" : "Viewer"}</dd></div>
            </dl>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-2">
            <a href="/profil" className="flex items-center gap-1.5 rounded-full border border-outline-variant bg-card-surface px-4 py-2 font-label-bold text-label-bold text-on-surface-variant hover:bg-surface-container-low">
              <span className="material-symbols-outlined text-[18px]">edit</span> Ubah profil
            </a>
            <GhostButton icon="logout" onClick={logout}>Keluar</GhostButton>
          </div>
        </Card>
        <Card title="Ganti password" icon="lock">
          <form onSubmit={changePw} className="space-y-3">
            <TextInput label="Password baru" type="password" value={pw} onChange={setPw} autoComplete="new-password" />
            <TextInput label="Ulangi password baru" type="password" value={pw2} onChange={setPw2} autoComplete="new-password" />
            {msg && <p className={`rounded-lg px-3 py-2 text-[13px] font-semibold ${msg.startsWith("ok:") ? "bg-risk-aman/10 text-risk-aman" : "bg-risk-kritis/10 text-risk-kritis"}`}>{msg.slice(3)}</p>}
            <PrimaryButton type="submit" icon="key" disabled={busy}>{busy ? "Menyimpan…" : "Simpan password"}</PrimaryButton>
          </form>
        </Card>
      </div>
    </div>
  );
}
