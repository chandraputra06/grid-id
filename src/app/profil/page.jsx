"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { supabase } from "@/lib/supabase";

const ROLE_META = {
  admin: { label: "Admin", cls: "bg-brand/10 text-brand" },
  petugas: { label: "Petugas", cls: "bg-risk-waspada/10 text-risk-waspada" },
  warga: { label: "Warga", cls: "bg-risk-aman/10 text-risk-aman" },
};

function initials(name, email) {
  const src = (name || "").trim() || (email || "").trim();
  if (!src) return "?";
  const parts = src.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return src.slice(0, 2).toUpperCase();
}

export default function Profil() {
  const router = useRouter();
  const fileRef = useRef(null);

  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [out, setOut] = useState(false);

  // Edit profil
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [unit, setUnit] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");

  // Avatar
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [avatarErr, setAvatarErr] = useState("");

  // Password
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [savingPw, setSavingPw] = useState(false);
  const [pwMsg, setPwMsg] = useState("");

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/masuk");
        return;
      }
      try {
        const data = await api.get("/api/me");
        setMe(data);
        setFullName(data.full_name || "");
        setPhone(data.phone || "");
        setUnit(data.unit || "");
      } catch (e) {
        setErr(e?.message || "Gagal memuat profil.");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  const meta = me ? ROLE_META[me.role] || ROLE_META.warga : null;

  async function logout() {
    if (out) return;
    setOut(true);
    try {
      await supabase.auth.signOut();
    } finally {
      router.replace("/masuk");
    }
  }

  async function onPickAvatar(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setAvatarErr("");
    if (!/^image\//.test(file.type)) {
      setAvatarErr("File harus berupa gambar.");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setAvatarErr("Ukuran maksimal 3 MB.");
      return;
    }
    setAvatarBusy(true);
    try {
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const sign = await api.post("/api/me/avatar-url", { ext });
      const { error } = await supabase.storage.from(sign.bucket).uploadToSignedUrl(sign.path, sign.token, file);
      if (error) throw new Error(error.message);
      await api.patch("/api/me", { avatar_url: sign.public_url });
      setMe((m) => ({ ...m, avatar_url: sign.public_url }));
    } catch (e) {
      setAvatarErr(e?.message || "Gagal mengunggah foto.");
    } finally {
      setAvatarBusy(false);
    }
  }

  async function saveProfile(e) {
    e.preventDefault();
    if (savingProfile) return;
    setProfileMsg("");
    if (!fullName.trim()) {
      setProfileMsg("err:Nama tidak boleh kosong.");
      return;
    }
    setSavingProfile(true);
    try {
      const data = await api.patch("/api/me", { full_name: fullName.trim(), phone: phone || null, unit: unit || null });
      setMe(data);
      setProfileMsg("ok:Profil berhasil diperbarui.");
    } catch (e) {
      setProfileMsg("err:" + (e?.message || "Gagal menyimpan profil."));
    } finally {
      setSavingProfile(false);
    }
  }

  async function changePassword(e) {
    e.preventDefault();
    if (savingPw) return;
    setPwMsg("");
    if (pw.length < 8) {
      setPwMsg("err:Password minimal 8 karakter.");
      return;
    }
    if (pw !== pw2) {
      setPwMsg("err:Konfirmasi password tidak cocok.");
      return;
    }
    setSavingPw(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: pw });
      if (error) throw new Error(error.message);
      setPw("");
      setPw2("");
      setPwMsg("ok:Password berhasil diubah.");
    } catch (e) {
      setPwMsg("err:" + (e?.message || "Gagal mengubah password."));
    } finally {
      setSavingPw(false);
    }
  }

  if (loading) {
    return <p className="py-16 text-center font-body-md text-body-md text-on-surface-variant">Memuat…</p>;
  }
  if (err) {
    return <p className="mx-auto max-w-2xl rounded-lg bg-risk-kritis/10 px-3 py-2 text-[13px] font-semibold text-risk-kritis">{err}</p>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-extrabold text-on-surface">Profil Saya</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">Kelola informasi akun, foto, dan password.</p>
      </div>

      {/* Kartu identitas + foto */}
      <div className="rounded-2xl border border-outline-variant bg-card-surface p-6 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
            {me.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={me.avatar_url} alt="Foto profil" className="h-24 w-24 rounded-full object-cover ring-2 ring-brand/20" />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-brand/10 font-heading text-3xl font-extrabold text-brand ring-2 ring-brand/20">
                {initials(me.full_name, me.email)}
              </div>
            )}
            <button
              onClick={() => fileRef.current?.click()}
              disabled={avatarBusy}
              aria-label="Ubah foto"
              title="Ubah foto"
              className="absolute -bottom-1 -right-1 grid h-9 w-9 place-items-center rounded-full border-2 border-card-surface bg-brand text-white shadow transition hover:brightness-110 active:scale-95 disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-[18px]">{avatarBusy ? "hourglass_top" : "photo_camera"}</span>
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPickAvatar} />
          </div>
          <div className="min-w-0">
            <h2 className="truncate font-heading text-xl font-bold text-on-surface">{me.full_name || "Tanpa Nama"}</h2>
            <p className="truncate font-body-md text-body-md text-on-surface-variant">{me.email}</p>
            {meta && <span className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold ${meta.cls}`}>{meta.label}</span>}
          </div>
        </div>
        {avatarErr && <p className="mt-3 rounded-lg bg-risk-kritis/10 px-3 py-2 text-[13px] font-semibold text-risk-kritis">{avatarErr}</p>}
        <p className="mt-3 font-body-md text-[12px] text-on-surface-variant">Klik ikon kamera untuk mengganti foto. JPG/PNG/WebP, maks 3 MB.</p>
      </div>

      {/* Edit profil */}
      <div className="rounded-2xl border border-outline-variant bg-card-surface p-6 shadow-sm">
        <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-on-surface">
          <span className="material-symbols-outlined text-brand">badge</span> Informasi Akun
        </h2>
        <form onSubmit={saveProfile} className="mt-4 space-y-3">
          <Field label="Nama Lengkap">
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="fld-p" type="text" placeholder="Nama kamu" />
          </Field>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="No. HP">
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className="fld-p" type="text" placeholder="08xx" />
            </Field>
            <Field label="Unit">
              <input value={unit} onChange={(e) => setUnit(e.target.value)} className="fld-p" type="text" placeholder="UP3 Bali" />
            </Field>
          </div>
          <Field label="Email (tidak dapat diubah)">
            <input value={me.email || ""} className="fld-p cursor-not-allowed opacity-60" type="email" disabled />
          </Field>

          <Msg value={profileMsg} />

          <button type="submit" disabled={savingProfile}
            className="flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-2.5 font-label-bold text-label-bold text-white transition hover:brightness-110 active:scale-95 disabled:opacity-60">
            <span className="material-symbols-outlined text-[18px]">{savingProfile ? "hourglass_top" : "save"}</span>
            {savingProfile ? "Menyimpan…" : "Simpan Perubahan"}
          </button>
        </form>
      </div>

      {/* Ubah password */}
      <div className="rounded-2xl border border-outline-variant bg-card-surface p-6 shadow-sm">
        <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-on-surface">
          <span className="material-symbols-outlined text-brand">lock</span> Ubah Password
        </h2>
        <form onSubmit={changePassword} className="mt-4 space-y-3">
          <Field label="Password Baru">
            <input value={pw} onChange={(e) => setPw(e.target.value)} className="fld-p" type="password" placeholder="Min. 8 karakter" autoComplete="new-password" />
          </Field>
          <Field label="Konfirmasi Password Baru">
            <input value={pw2} onChange={(e) => setPw2(e.target.value)} className="fld-p" type="password" placeholder="Ulangi password" autoComplete="new-password" />
          </Field>

          <Msg value={pwMsg} />

          <button type="submit" disabled={savingPw}
            className="flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-2.5 font-label-bold text-label-bold text-white transition hover:brightness-110 active:scale-95 disabled:opacity-60">
            <span className="material-symbols-outlined text-[18px]">{savingPw ? "hourglass_top" : "key"}</span>
            {savingPw ? "Menyimpan…" : "Ubah Password"}
          </button>
        </form>
      </div>

      {/* Logout */}
      <div className="flex justify-end">
        <button onClick={logout} disabled={out}
          className="flex items-center gap-2 rounded-full border border-risk-kritis/30 bg-risk-kritis/5 px-5 py-2.5 font-label-bold text-label-bold text-risk-kritis transition hover:bg-risk-kritis/10 active:scale-95 disabled:opacity-60">
          <span className="material-symbols-outlined text-[18px]">{out ? "hourglass_top" : "logout"}</span>
          {out ? "Keluar…" : "Logout"}
        </button>
      </div>

      <style>{`
        .fld-p { width:100%; border:1px solid var(--outline-variant,#cbd5e1); border-radius:0.75rem; padding:0.6rem 0.8rem; font-size:0.9rem; background:#fff; outline:none; }
        .fld-p:focus { border-color:#2743D9; box-shadow:0 0 0 3px rgba(39,67,217,0.15); }
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

function Msg({ value }) {
  if (!value) return null;
  const isOk = value.startsWith("ok:");
  const text = value.slice(value.indexOf(":") + 1);
  return (
    <p className={`rounded-lg px-3 py-2 text-[13px] font-semibold ${isOk ? "bg-risk-aman/10 text-risk-aman" : "bg-risk-kritis/10 text-risk-kritis"}`}>{text}</p>
  );
}