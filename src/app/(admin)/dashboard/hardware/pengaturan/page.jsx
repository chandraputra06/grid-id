"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useApi } from "@/lib/hardware";
import { Card, ErrorBox, Loading, PageHeader, PrimaryButton, Select, TextInput } from "@/components/hardware/ui";

const PRIO_KEYS = [
  ["offline", "Perangkat offline"], ["telemetry_late", "Telemetri terlambat"], ["temp_threshold", "Suhu melewati ambang"],
  ["gas_threshold", "Indikasi gas/asap"], ["audio_anomaly", "Anomali suara"], ["alarm_perangkat", "Alarm perangkat"], ["upload_failed", "Upload gambar gagal"],
];

export default function HardwareSettings() {
  const me = useApi("/api/me");
  const { data, error, loading, reload } = useApi("/api/hardware/settings");
  const [f, setF] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  useEffect(() => {
    if (data) setF({ ...data.config, priority: { ...data.config.priority } });
  }, [data]);
  const canEdit = me.data && (me.data.role === "admin" || me.data.role === "supervisor");
  const set = (k) => (v) => setF((x) => ({ ...x, [k]: v }));
  const setP = (k) => (v) => setF((x) => ({ ...x, priority: { ...x.priority, [k]: v } }));

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    try {
      const body = { ...f };
      ["temp_max_c", "gas_raw_max"].forEach((k) => { body[k] = body[k] === "" || body[k] === null ? null : Number(body[k]); });
      ["telemetry_late_after_s", "offline_after_s", "consecutive_readings", "audio_anomaly_consecutive", "ai_min_confidence", "ai_severity_tinggi", "ai_severity_sedang", "inference_min_interval_s"]
        .forEach((k) => { body[k] = Number(body[k]); });
      await api.patch("/api/hardware/settings", body);
      setMsg("ok:Aturan peringatan disimpan. Berlaku untuk telemetri berikutnya (≤30 detik).");
      reload();
    } catch (err) {
      setMsg(`err:${err?.message || "Gagal menyimpan."}`);
    } finally {
      setBusy(false);
    }
  }

  if ((loading && !data) || !f) return <><ErrorBox message={error} onRetry={reload} />{!error && <Loading />}</>;
  const ro = !canEdit;
  const num = (k, label, props = {}) => <TextInput label={label} type="number" value={f[k] ?? ""} onChange={set(k)} disabled={ro} {...props} />;

  return (
    <form onSubmit={save} className="space-y-5">
      <PageHeader title="Aturan Peringatan Hardware"
        subtitle="Ambang yang dipakai sistem untuk membuat peringatan. Ambang suhu & gas sengaja kosong (nonaktif) sampai diisi pihak berwenang sesuai SOP PLN — GRID·ID tidak menetapkan ambang keselamatan listrik."
        actions={canEdit && <PrimaryButton type="submit" icon="save" disabled={busy}>{busy ? "Menyimpan…" : "Simpan"}</PrimaryButton>} />
      {ro && <p className="rounded-xl bg-surface-container-low px-4 py-2 font-body-md text-[13px] text-on-surface-variant">Mode baca: hanya Supervisor/Admin yang dapat mengubah aturan.</p>}
      {msg && <p className={`rounded-lg px-3 py-2 text-[13px] font-semibold ${msg.startsWith("ok:") ? "bg-risk-aman/10 text-risk-aman" : "bg-risk-kritis/10 text-risk-kritis"}`}>{msg.slice(3)}</p>}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Konektivitas" icon="wifi">
          <div className="grid gap-3 sm:grid-cols-2">
            {num("telemetry_late_after_s", "Telemetri terlambat setelah (detik)", { min: 30 })}
            {num("offline_after_s", "Perangkat offline setelah (detik)", { min: 60 })}
          </div>
          <p className="mt-2 font-body-md text-[12px] text-on-surface-variant">Sesuaikan dengan interval kirim telemetri firmware (mis. 3× interval).</p>
        </Card>
        <Card title="Sensor" icon="sensors">
          <div className="grid gap-3 sm:grid-cols-2">
            {num("temp_max_c", "Ambang suhu maks. thermal (°C) — kosong = nonaktif", { step: "0.1" })}
            {num("gas_raw_max", "Ambang gas (nilai raw) — kosong = nonaktif")}
            {num("consecutive_readings", "Pembacaan berturut-turut sebelum alert", { min: 1, max: 20 })}
            {num("audio_anomaly_consecutive", "Flag anomali audio berturut-turut", { min: 1, max: 20 })}
          </div>
          <p className="mt-2 font-body-md text-[12px] text-on-surface-variant">Sensor gas mengirim nilai ADC mentah (belum terkalibrasi ppm). Satu pembacaan tunggal tidak memicu alert.</p>
        </Card>
        <Card title="AI (YOLO)" icon="neurology">
          <div className="grid gap-3 sm:grid-cols-2">
            {num("ai_min_confidence", "Confidence minimum untuk alert (0–1)", { step: "0.05", min: 0, max: 1 })}
            {num("inference_min_interval_s", "Jeda minimum inferensi per perangkat (detik)", { min: 0 })}
            {num("ai_severity_tinggi", "Severity AI → prioritas tinggi (≥)", { min: 0, max: 100 })}
            {num("ai_severity_sedang", "Severity AI → prioritas sedang (≥)", { min: 0, max: 100 })}
          </div>
          <label className="mt-3 flex items-center gap-2 font-body-md text-[13px]">
            <input type="checkbox" checked={!!f.inference_enabled} onChange={(e) => set("inference_enabled")(e.target.checked)} disabled={ro} />
            Jalankan inferensi AI otomatis untuk snapshot RGB baru
          </label>
          <p className="mt-2 font-body-md text-[12px] text-on-surface-variant">Severity berasal dari layanan AI GRID·ID (tidak dihitung ulang).</p>
        </Card>
        <Card title="Prioritas per kategori" icon="flag">
          <div className="grid gap-3 sm:grid-cols-2">
            {PRIO_KEYS.map(([k, label]) => (
              <Select key={k} label={label} value={f.priority[k]} onChange={setP(k)} disabled={ro}>
                <option value="tinggi">Tinggi</option><option value="sedang">Sedang</option><option value="rendah">Rendah</option>
              </Select>
            ))}
          </div>
        </Card>
      </div>
    </form>
  );
}
