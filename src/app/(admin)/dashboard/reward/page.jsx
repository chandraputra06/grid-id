"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

const MEDAL = ["🥇", "🥈", "🥉"];

export default function Reward() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const d = await api.get("/api/reward/leaderboard");
      setData(d);
    } catch (e) {
      setErr(e?.message || "Gagal memuat leaderboard.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const board = data?.leaderboard || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-extrabold text-on-surface">Program Reward</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Peringkat kontributor warga — poin dari laporan yang terverifikasi (menjadi data berlabel untuk melatih model).
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-2xl border border-outline-variant bg-card-surface p-5 shadow-sm">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-risk-aman/10"><span className="material-symbols-outlined text-risk-aman">verified</span></span>
          <div><p className="font-heading text-2xl font-extrabold text-on-surface">{loading ? "…" : data?.total_verified ?? 0}</p><p className="font-body-md text-[12px] text-on-surface-variant">Laporan Terverifikasi</p></div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-outline-variant bg-card-surface p-5 shadow-sm">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand/10"><span className="material-symbols-outlined text-brand">groups</span></span>
          <div><p className="font-heading text-2xl font-extrabold text-on-surface">{loading ? "…" : data?.total_pelapor ?? 0}</p><p className="font-body-md text-[12px] text-on-surface-variant">Pelapor Berkontribusi</p></div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-outline-variant bg-card-surface shadow-sm">
        <div className="flex items-center justify-between border-b border-outline-variant p-4">
          <h2 className="font-heading font-bold">Papan Peringkat</h2>
          <button onClick={load} className="font-label-sm text-label-sm font-semibold text-brand hover:underline">Muat ulang</button>
        </div>
        {err && <p className="m-4 rounded-lg bg-risk-kritis/10 px-3 py-2 text-[13px] font-semibold text-risk-kritis">{err}</p>}
        {loading ? (
          <p className="py-10 text-center font-body-md text-body-md text-on-surface-variant">Memuat…</p>
        ) : board.length === 0 ? (
          <p className="py-10 text-center font-body-md text-body-md text-on-surface-variant">Belum ada laporan terverifikasi.</p>
        ) : (
          <ul className="divide-y divide-outline-variant/60">
            {board.map((row, i) => (
              <li key={row.name + i} className={`flex items-center gap-4 p-4 ${i < 3 ? "bg-brand/5" : ""}`}>
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-surface-container-low font-heading text-sm font-bold text-on-surface">
                  {MEDAL[i] || i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-heading text-sm font-bold text-on-surface">{row.name}</p>
                  <p className="font-body-md text-[12px] text-on-surface-variant">{row.verified} laporan terverifikasi</p>
                </div>
                <span className="shrink-0 rounded-full bg-risk-aman/10 px-3 py-1 font-heading text-sm font-bold text-risk-aman">{row.points} poin</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}