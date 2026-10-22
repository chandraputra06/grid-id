"use client";
import { useState } from "react";
import { api } from "@/lib/api";
import { fmtDateTime, useApi } from "@/lib/hardware";
import { Badge, Card, ErrorBox, Loading, PageHeader, PrimaryButton, Select, Table, Td, TextInput } from "@/components/hardware/ui";
import { useBusinessOrg } from "@/components/business-shell";

const EMPTY = { full_name: "", email: "", password: "", org_role: "viewer" };

export default function BusinessOrganization() {
  const { org, myRole, members, reload } = useBusinessOrg();
  const assets = useApi("/api/business/assets");
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [rowBusy, setRowBusy] = useState(null);
  const isOwner = myRole === "owner";
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  async function add(e) {
    e.preventDefault();
    setMsg("");
    if (!form.email || form.password.length < 8) {
      setMsg("err:Email wajib dan password minimal 8 karakter.");
      return;
    }
    setBusy(true);
    try {
      await api.post("/api/business/members", form);
      setMsg(`ok:Anggota ${form.email} ditambahkan.`);
      setForm(EMPTY);
      reload();
    } catch (err) {
      setMsg(`err:${err?.message || "Gagal menambah anggota."}`);
    } finally {
      setBusy(false);
    }
  }
  async function changeRole(id, org_role) {
    setRowBusy(id);
    setMsg("");
    try {
      await api.patch(`/api/business/members/${id}`, { org_role });
      reload();
    } catch (err) {
      setMsg(`err:${err?.message || "Gagal mengubah peran."}`);
    } finally {
      setRowBusy(null);
    }
  }

  if (!org) return <Loading />;
  const perms = org.permissions || {};
  return (
    <div className="space-y-6">
      <PageHeader title="Organisasi & Pengguna" subtitle="Informasi organisasi, aset yang aksesnya diberikan, dan anggota yang dapat masuk ke Business Portal." />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Organisasi" icon="domain">
          <dl className="space-y-2 font-body-md text-[13px]">
            <div><dt className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Nama</dt><dd className="font-semibold">{org.name}</dd></div>
            <div><dt className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Kode</dt><dd>{org.code || "—"}</dd></div>
            <div><dt className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Jenis</dt><dd>{org.type || "—"}</dd></div>
            <div><dt className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Kontak</dt><dd>{org.contact || "—"}</dd></div>
            <div><dt className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Status</dt><dd><Badge cls="bg-risk-aman/10 text-risk-aman">{org.status}</Badge></dd></div>
            <div><dt className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Hak akses data</dt>
              <dd className="flex flex-wrap gap-1.5">
                <Badge cls="bg-brand/10 text-brand" icon="visibility">Lihat data aset</Badge>
                <Badge cls={perms.view_stream !== false ? "bg-brand/10 text-brand" : "bg-surface-container-low text-on-surface-variant"} icon="videocam">{perms.view_stream !== false ? "Lihat live stream" : "Tanpa live stream"}</Badge>
                <Badge icon="block">Tanpa kontrol perangkat</Badge>
              </dd>
            </div>
          </dl>
          <p className="mt-3 font-body-md text-[11px] text-on-surface-variant">Perubahan hak akses & aset dilakukan oleh admin GRID·ID.</p>
        </Card>
        <Card title={`Aset yang dapat diakses (${assets.data ? assets.data.assets.length : "…"})`} icon="location_city" className="lg:col-span-2">
          {assets.loading && !assets.data ? <Loading /> : (
            <Table head={["Aset", "Kode", "Lokasi", "Perangkat"]} minWidth={480}>
              {((assets.data && assets.data.assets) || []).map((a) => (
                <tr key={a.asset.id} className="border-b border-outline-variant/60">
                  <Td><a href={`/business/aset/detail?id=${a.asset.id}`} className="font-semibold text-brand hover:underline">{a.asset.name}</a></Td>
                  <Td>{a.asset.asset_code}</Td><Td>{a.asset.unit || "—"}</Td><Td>{a.devices.length}</Td>
                </tr>
              ))}
            </Table>
          )}
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title={`Anggota (${members.length})`} icon="groups" className="lg:col-span-2">
          {msg && <p className={`mb-3 rounded-lg px-3 py-2 text-[13px] font-semibold ${msg.startsWith("ok:") ? "bg-risk-aman/10 text-risk-aman" : "bg-risk-kritis/10 text-risk-kritis"}`}>{msg.slice(3)}</p>}
          <Table head={["Nama", "Email", "Peran", "Bergabung"]} minWidth={560}>
            {members.map((m) => (
              <tr key={m.id} className="border-b border-outline-variant/60">
                <Td className="font-semibold">{m.full_name || "—"}</Td>
                <Td>{m.email || "—"}</Td>
                <Td>
                  {isOwner ? (
                    <select value={m.org_role || "viewer"} disabled={rowBusy === m.id} onChange={(e) => changeRole(m.id, e.target.value)}
                      className="rounded-lg border border-outline-variant bg-white px-2 py-1 text-[12px] outline-none focus:border-brand">
                      <option value="owner">Owner</option><option value="viewer">Viewer</option>
                    </select>
                  ) : (
                    <Badge cls={m.org_role === "owner" ? "bg-brand/10 text-brand" : undefined}>{m.org_role === "owner" ? "Owner" : "Viewer"}</Badge>
                  )}
                </Td>
                <Td>{fmtDateTime(m.created_at, true)}</Td>
              </tr>
            ))}
          </Table>
        </Card>
        <Card title="Tambah anggota" icon="person_add">
          {!isOwner ? (
            <p className="font-body-md text-[13px] text-on-surface-variant">Hanya Owner organisasi yang dapat menambah anggota.</p>
          ) : (
            <form onSubmit={add} className="space-y-3">
              <TextInput label="Nama lengkap" value={form.full_name} onChange={set("full_name")} />
              <TextInput label="Email" type="email" value={form.email} onChange={set("email")} />
              <TextInput label="Password awal (min. 8 karakter)" type="password" value={form.password} onChange={set("password")} />
              <Select label="Peran" value={form.org_role} onChange={set("org_role")}>
                <option value="viewer">Viewer — melihat data</option>
                <option value="owner">Owner — juga mengelola anggota</option>
              </Select>
              <PrimaryButton type="submit" icon={busy ? "hourglass_top" : "person_add"} disabled={busy}>{busy ? "Menyimpan…" : "Tambahkan"}</PrimaryButton>
            </form>
          )}
        </Card>
      </div>
      <ErrorBox message={assets.error} onRetry={assets.reload} />
    </div>
  );
}
