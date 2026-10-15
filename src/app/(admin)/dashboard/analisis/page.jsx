"use client";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";

function lastMonths(n) {
  const arr = [];
  const d = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const x = new Date(d.getFullYear(), d.getMonth() - i, 1);
    arr.push({ key: `${x.getFullYear()}-${x.getMonth()}`, label: x.toLocaleDateString("id-ID", { month: "short" }) });
  }
  return arr;
}

export default function Analisis() {
  const [prioritas, setPrioritas] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const [p, r] = await Promise.all([api.get("/api/prioritas"), api.get("/api/reports")]);
      setPrioritas(Array.isArray(p) ? p : []);
      setReports(Array.isArray(r) ? r : []);
    } catch (e) {
      setErr(e?.message || "Gagal memuat data analisis.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const stats = useMemo(() => {
    const scores = prioritas.map((x) => x.score).filter((s) => s != null);
    const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const counts = { kritis: 0, waspada: 0, aman: 0 };
    for (const x of prioritas) if (counts[x.level] != null) counts[x.level] += 1;

    const now = new Date();
    const thisMonthKey = `${now.getFullYear()}-${now.getMonth()}`;
    const months = lastMonths(6);
    const byMonth = Object.fromEntries(months.map((m) => [m.key, 0]));
    let thisMonth = 0;
    for (const rp of reports) {
      if (!rp.created_at) continue;
      const d = new Date(rp.created_at);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (byMonth[key] != null) byMonth[key] += 1;
      if (key === thisMonthKey) thisMonth += 1;
    }
    const tren = months.map((m) => ({ b: m.label, v: byMonth[m.key] }));
    return { avg, counts, thisMonth, tren };
  }, [prioritas, reports]);

  const kpis = [
    { icon: "warning", tone: "text-risk-kritis bg-risk-kritis/10", label: "Aset Kritis", value: String(stats.counts.kritis), sub: "perlu tindakan segera" },
    { icon: "percent", tone: "text-brand bg-brand/10", label: "Rata-rata Skor", value: `${stats.avg}%`, sub: "seluruh aset" },
    { icon: "description", tone: "text-accent bg-accent/10", label: "Total Laporan", value: String(reports.length), sub: "sepanjang waktu" },
    { icon: "calendar_month", tone: "text-risk-aman bg-risk-aman/10", label: "Laporan Bulan Ini", value: String(stats.thisMonth), sub: "scan masuk" },
  ];

  const dist = [
    { k: "Kritis", n: stats.counts.kritis, c: "bg-risk-kritis" },
    { k: "Waspada", n: stats.counts.waspada, c: "bg-risk-waspada" },
    { k: "Aman", n: stats.counts.aman, c: "bg-risk-aman" },
  ];
  const maxK = Math.max(1, ...dist.map((x) => x.n));
  const maxV = Math.max(1, ...stats.tren.map((t) => t.v));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-extrabold text-on-surface">Analisis</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">Insight agregat kondisi aset, distribusi risiko, dan volume laporan.</p>
      </div>

      {err && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-outline-variant bg-risk-kritis/5 p-4">
          <p className="text-[13px] font-semibold text-risk-kritis">{err}</p>
          <button onClick={load} className="rounded-full bg-brand px-4 py-1.5 text-[13px] font-bold text-white hover:brightness-110">Coba lagi</button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="flex items-start gap-3 rounded-2xl border border-outline-variant bg-card-surface p-5 shadow-sm">
            <span className={`grid h-11 w-11 place-items-center rounded-xl ${k.tone}`}>
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{k.icon}</span>
            </span>
            <div>
              <p className="font-heading text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">{k.label}</p>
              <p className="font-heading text-3xl font-extrabold text-on-surface">{loading ? "…" : k.value}</p>
              <p className="font-body-md text-[12px] text-on-surface-variant">{k.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-outline-variant bg-card-surface p-5 shadow-sm lg:col-span-2">
          <h2 className="mb-4 font-heading font-bold">Laporan Masuk per Bulan (6 Bulan)</h2>
          <div className="flex h-56 items-end justify-between gap-3">
            {stats.tren.map((t) => (
              <div key={t.b} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex w-full items-end justify-center" style={{ height: "180px" }}>
                  <div className="w-8 rounded-t-md bg-brand" style={{ height: `${(t.v / maxV) * 100}%` }} title={`${t.v} laporan`} />
                </div>
                <span className="font-body-md text-[12px] text-on-surface-variant">{t.b}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-outline-variant bg-card-surface p-5 shadow-sm">
          <h2 className="mb-4 font-heading font-bold">Distribusi Tingkat Risiko</h2>
          <div className="space-y-4">
            {dist.map((k) => (
              <div key={k.k}>
                <div className="mb-1 flex justify-between font-body-md text-[13px]"><span>{k.k}</span><b>{k.n}</b></div>
                <div className="h-2 w-full rounded-full bg-surface-container-low">
                  <div className={`h-2 rounded-full ${k.c}`} style={{ width: `${(k.n / maxK) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-outline-variant bg-card-surface p-5 shadow-sm">
        <h2 className="mb-3 font-heading font-bold">Bobot Faktor pada Skor Risiko</h2>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Skor GRID·ID dihitung dari <b className="text-on-surface">severity kerusakan 40%</b>, <b className="text-on-surface">cuaca BMKG 35%</b>, dan <b className="text-on-surface">kepadatan 25%</b>.
          Rata-rata skor seluruh aset saat ini <b className="text-on-surface">{stats.avg}%</b>, dengan <b className="text-on-surface">{stats.counts.kritis}</b> aset berstatus kritis.
        </p>
      </div>
    </div>
  );
}