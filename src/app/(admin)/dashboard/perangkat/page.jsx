"use client";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";

const TYPE_META = {
  camera: { label: "Kamera", icon: "photo_camera" },
  thermal: { label: "Thermal", icon: "device_thermostat" },
  sensor: { label: "Sensor", icon: "sensors" },
};
const EMPTY = { device_code: "", type: "camera", asset_id: "" };

function fmt(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}

export default function Perangkat() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listErr, setListErr] = useState("");
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [formMsg, setFormMsg] = useState("");

  async function load() {
    setLoading(true);
    setListErr("");
    try {
      const d = await api.get("/api/devices");
      setDevices(Array.isArray(d) ? d : []);
    } catch (e) {
      setListErr(e?.message || "Gagal memuat perangkat.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const stats = useMemo(() => {
    const online = devices.filter((d) => d.status === "online").length;
    return { total: devices.length, online, offline: devices.length - online };
  }, [devices]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    setFormMsg("");
    if (!form.device_code.trim()) {
      setFormMsg("err:Kode perangkat wajib diisi.");
      return;
    }
    setBusy(true);
    try {
      await api.post("/api/devices", {
        device_code: form.device_code.trim(),
        type: form.type,
        asset_id: form.asset_id || null,
      });
      setFormMsg(`ok:Perangkat ${form.device_code} terdaftar.`);
      setForm(EMPTY);
      load();
    } catch (err) {
      setFormMsg("err:" + (err?.message || "Gagal mendaftar perangkat."));
    } finally {
      setBusy(false);
    }
  }

  const KPI = [
    { label: "Total Perangkat", value: stats.total, icon: "hub", tone: "text-brand bg-brand/10" },
    { label: "Online", value: stats.online, icon: "wifi", tone: "text-risk-aman bg-risk-aman/10" },
    { label: "Offline", value: stats.offline, icon: "wifi_off", tone: "text-on-surface-variant bg-surface-container-low" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-extrabold text-on-surface">Perangkat IoT</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Registry alat (kamera/thermal/sensor) yang mengirim data ke GRID·ID — bahan mentah untuk melatih model.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {KPI.map((k) => (
          <div key={k.label} className="flex items-center gap-3 rounded-2xl border border-outline-variant bg-card-surface p-5 shadow-sm">
            <span className={`grid h-11 w-11 place-items-center rounded-xl ${k.tone}`}>
              <span className="material-symbols-outlined">{k.icon}</span>
            </span>
            <div>
              <p className="font-heading text-2xl font-extrabold text-on-surface">{loading ? "…" : k.value}</p>
              <p className="font-body-md text-[12px] text-on-surface-variant">{k.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Tambah perangkat */}
        <div className="rounded-2xl border border-outline-variant bg-card-surface p-5 shadow-sm lg:col-span-1">
          <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-on-surface">
            <span className="material-symbols-outlined text-brand">add_circle</span> Daftar Perangkat
          </h2>
          <form onSubmit={submit} className="mt-4 space-y-3">
            <Field label="Kode Perangkat">
              <input value={form.device_code} onChange={set("device_code")} placeholder="CAM-DPS-001" className="fld-d" />
            </Field>
            <Field label="Tipe">
              <select value={form.type} onChange={set("type")} className="fld-d">
                <option value="camera">Kamera</option>
                <option value="thermal">Thermal</option>
                <option value="sensor">Sensor</option>
              </select>
            </Field>
            <Field label="ID Aset terkait (opsional)">
              <input value={form.asset_id} onChange={set("asset_id")} placeholder="UUID aset" className="fld-d" />
            </Field>
            <Msg value={formMsg} />
            <button type="submit" disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-brand py-2.5 font-label-bold text-label-bold text-white transition hover:brightness-110 active:scale-95 disabled:opacity-60">
              <span className="material-symbols-outlined text-[18px]">{busy ? "hourglass_top" : "add"}</span>
              {busy ? "Menyimpan…" : "Daftarkan"}
            </button>
          </form>
        </div>

        {/* Daftar perangkat */}
        <div className="rounded-2xl border border-outline-variant bg-card-surface p-5 shadow-sm lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-on-surface">
              <span className="material-symbols-outlined text-brand">lan</span> Daftar Perangkat
            </h2>
            <button onClick={load} className="font-label-sm text-label-sm font-semibold text-brand hover:underline">Muat ulang</button>
          </div>
          {listErr && <p className="mb-3 rounded-lg bg-risk-kritis/10 px-3 py-2 text-[13px] font-semibold text-risk-kritis">{listErr}</p>}
          {loading ? (
            <p className="py-8 text-center font-body-md text-body-md text-on-surface-variant">Memuat…</p>
          ) : devices.length === 0 ? (
            <p className="py-8 text-center font-body-md text-body-md text-on-surface-variant">Belum ada perangkat terdaftar.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left">
                <thead>
                  <tr className="border-b border-outline-variant font-heading text-[11px] uppercase tracking-wider text-on-surface-variant">
                    <th className="py-2 pr-3">Kode</th>
                    <th className="py-2 pr-3">Tipe</th>
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2">Terakhir aktif</th>
                  </tr>
                </thead>
                <tbody>
                  {devices.map((d) => {
                    const meta = TYPE_META[d.type] || { label: d.type || "—", icon: "device_unknown" };
                    const online = d.status === "online";
                    return (
                      <tr key={d.id} className="border-b border-outline-variant/60">
                        <td className="py-2.5 pr-3 font-heading text-[13px] font-bold text-brand">{d.device_code}</td>
                        <td className="py-2.5 pr-3 font-body-md text-[13px] text-on-surface">
                          <span className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">{meta.icon}</span>
                            {meta.label}
                          </span>
                        </td>
                        <td className="py-2.5 pr-3">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${online ? "bg-risk-aman/10 text-risk-aman" : "bg-surface-container-low text-on-surface-variant"}`}>
                            <span className="material-symbols-outlined text-[14px]">{online ? "wifi" : "wifi_off"}</span>
                            {online ? "Online" : "Offline"}
                          </span>
                        </td>
                        <td className="py-2.5 font-body-md text-[12px] text-on-surface-variant">{fmt(d.last_seen)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .fld-d { width:100%; border:1px solid var(--outline-variant,#cbd5e1); border-radius:0.75rem; padding:0.55rem 0.75rem; font-size:0.875rem; background:#fff; outline:none; }
        .fld-d:focus { border-color:#2743D9; box-shadow:0 0 0 3px rgba(39,67,217,0.15); }
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
  return <p className={`rounded-lg px-3 py-2 text-[13px] font-semibold ${isOk ? "bg-risk-aman/10 text-risk-aman" : "bg-risk-kritis/10 text-risk-kritis"}`}>{text}</p>;
}