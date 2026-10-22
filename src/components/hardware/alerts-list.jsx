"use client";
// Daftar peringatan + tindak lanjut. Aksi hanya dirender bila canAct (Supervisor/Admin) —
// B2B melihat status saja, dan backend B2B memang tidak menyediakan endpoint ubah status.
import { useState } from "react";
import { api } from "@/lib/api";
import { ALERT_CATEGORY, ALERT_PRIORITY, fmtDateTime, fmtNum, fmtRelative } from "@/lib/hardware";
import { AlertPriorityBadge, AlertStatusBadge, Badge, EmptyState, Modal, SimBadge } from "./ui";

export function AlertsList({ alerts, canAct, onChanged, onOpenFrame, deviceHref }) {
  const [edit, setEdit] = useState(null); // { alert, status }
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  if (!alerts.length) return <EmptyState icon="notifications_off" title="Tidak ada peringatan" text="Tidak ada peringatan untuk filter ini." />;

  async function submit() {
    setBusy(true);
    setErr("");
    try {
      await api.patch(`/api/hardware/alerts/${edit.alert.id}`, { status: edit.status, note: note || undefined });
      setEdit(null);
      setNote("");
      if (onChanged) onChanged();
    } catch (e) {
      setErr(e?.message || "Gagal memperbarui peringatan.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <ul className="space-y-2">
        {alerts.map((a) => {
          const cat = ALERT_CATEGORY[a.category] || { label: a.category, icon: "warning" };
          const pr = ALERT_PRIORITY[a.priority] || ALERT_PRIORITY.rendah;
          return (
            <li key={a.id} className={`rounded-xl border border-outline-variant border-l-4 bg-card-surface p-4 ${pr.edge}`}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${pr.soft}`}>
                  <span className="material-symbols-outlined text-[20px]">{cat.icon}</span>
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-heading text-sm font-bold text-on-surface">{cat.label}</h3>
                    <AlertPriorityBadge p={a.priority} />
                    <AlertStatusBadge s={a.status} />
                    {a.category === "ai_detection" ? null : a.active ? (
                      <Badge cls="bg-risk-kritis/10 text-risk-kritis" icon="sensors">Kondisi masih berlangsung</Badge>
                    ) : (
                      <Badge icon="check">Kondisi sudah normal{a.cleared_at ? ` · ${fmtRelative(a.cleared_at)}` : ""}</Badge>
                    )}
                    <SimBadge show={a.source === "simulasi"} />
                  </div>
                  <p className="mt-1 font-body-md text-[13px] text-on-surface">{a.message}</p>
                  <p className="mt-1 font-body-md text-[12px] text-on-surface-variant">
                    {deviceHref && a.device && a.device.id ? (
                      <a href={deviceHref(a.device.id)} className="font-semibold text-brand hover:underline">{a.device.name || a.device.device_code}</a>
                    ) : (
                      <b>{(a.device && (a.device.name || a.device.device_code)) || "—"}</b>
                    )}
                    {a.asset ? ` · ${a.asset.name}${a.asset.unit ? ` · ${a.asset.unit}` : ""}` : ""}
                  </p>
                  <p className="font-body-md text-[12px] text-on-surface-variant">
                    Pertama {fmtDateTime(a.first_seen_at)} · terakhir {fmtDateTime(a.last_seen_at)} · {a.occurrences}× terpicu
                    {a.trigger_value != null ? ` · nilai ${fmtNum(a.trigger_value, a.trigger_unit === "confidence" ? 2 : 1)} ${a.trigger_unit === "confidence" ? "" : a.trigger_unit || ""}` : ""}
                    {a.threshold != null ? ` · ambang ${fmtNum(a.threshold, a.trigger_unit === "confidence" ? 2 : 1)}` : ""}
                  </p>
                  {a.note && <p className="mt-1 rounded-lg bg-surface-container-low px-2 py-1 font-body-md text-[12px] text-on-surface">Catatan: {a.note}</p>}
                </div>
                <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col sm:items-end">
                  {a.frame_id && onOpenFrame && (
                    <button onClick={() => onOpenFrame(a.frame_id)} className="font-heading text-sm font-bold text-brand hover:underline">Lihat gambar</button>
                  )}
                  {canAct && a.status === "baru" && (
                    <button onClick={() => setEdit({ alert: a, status: "ditinjau" })}
                      className="rounded-full border border-outline-variant px-3 py-1 font-label-bold text-label-bold text-on-surface-variant hover:bg-surface-container-low">Tandai ditinjau</button>
                  )}
                  {canAct && a.status !== "selesai" && (
                    <button onClick={() => setEdit({ alert: a, status: "selesai" })}
                      className="rounded-full bg-brand px-3 py-1 font-label-bold text-label-bold text-white hover:brightness-110">Selesai</button>
                  )}
                  {canAct && a.status === "selesai" && (
                    <button onClick={() => setEdit({ alert: a, status: "baru" })} className="font-label-sm text-label-sm font-semibold text-on-surface-variant hover:underline">Buka kembali</button>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <Modal open={!!edit} onClose={() => !busy && setEdit(null)} title={edit ? `Ubah status: ${edit.status === "selesai" ? "Selesai" : edit.status === "ditinjau" ? "Ditinjau" : "Buka kembali"}` : ""}>
        {edit && (
          <div className="space-y-3">
            <p className="font-body-md text-[13px] text-on-surface-variant">{edit.alert.message}</p>
            <label className="block">
              <span className="mb-1 block font-label-sm text-label-sm text-on-surface-variant">Catatan tindak lanjut (opsional)</span>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="mis. Sudah dicek petugas, sambungan dikencangkan"
                className="w-full rounded-lg border border-outline-variant bg-white px-3 py-2 text-sm outline-none focus:border-brand" />
            </label>
            {err && <p className="rounded-lg bg-risk-kritis/10 px-3 py-2 text-[13px] font-semibold text-risk-kritis">{err}</p>}
            <div className="flex justify-end gap-2">
              <button onClick={() => setEdit(null)} disabled={busy} className="rounded-full border border-outline-variant px-4 py-2 font-label-bold text-label-bold text-on-surface-variant hover:bg-surface-container">Batal</button>
              <button onClick={submit} disabled={busy} className="rounded-full bg-brand px-4 py-2 font-label-bold text-label-bold text-white hover:brightness-110 disabled:opacity-60">{busy ? "Menyimpan…" : "Simpan"}</button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
