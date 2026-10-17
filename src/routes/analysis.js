// Agregasi "dossier" analisis untuk layar Verifikasi supervisor.
// Menggabungkan: hasil klasifikasi AI + aset + riwayat laporan/inspeksi aset
// + riwayat MAXIMO (dummy adapter) -> narasi + faktor risiko + rekomendasi.
// Read-only, additive. Semua query defensif (tabel/kolom boleh tak lengkap).
const router = require('express').Router();
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const supabase = require('../config/supabase');

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// ---- helper: ambil data secara aman (tabel/kolom boleh tidak ada) ----
async function safe(fn, fallback) {
  try {
    const v = await fn();
    return v ?? fallback;
  } catch {
    return fallback;
  }
}

const CLASS_LABEL = {
  isolator_pecah: 'Isolator Pecah',
  korosi: 'Korosi',
  kabel_bermasalah: 'Kabel Bermasalah',
  komponen_hilang: 'Komponen Hilang',
};

// Rekomendasi tindakan per kelas kerusakan (acuan teknis, bukan perintah final).
const CLASS_RECO = {
  isolator_pecah: [
    'Jadwalkan penggantian isolator; isolasi beban bila memungkinkan.',
    'Periksa isolator sekitar pada rangka yang sama (retak merambat).',
  ],
  korosi: [
    'Bersihkan korosi & lapis ulang anti-karat pada terminal/konektor.',
    'Thermovisi titik sambungan untuk deteksi hot-spot.',
  ],
  kabel_bermasalah: [
    'Periksa pengupasan & kekencangan konektor; ganti bila terkelupas.',
    'Ukur suhu sambungan saat berbeban.',
  ],
  komponen_hilang: [
    'Lengkapi komponen yang hilang sesuai spesifikasi gardu.',
    'Tinjau potensi pencurian/vandalisme; perkuat pengamanan.',
  ],
};

// ---- dummy MAXIMO deterministik dari serial (konsisten untuk demo PLN) ----
function hashStr(s) {
  let h = 0;
  const str = String(s || '');
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}
function maximoHistory(serial) {
  if (!serial) return { wo: [], last_pm: null, failures_12m: 0 };
  const h = hashStr(serial);
  const types = ['Preventive Maintenance', 'Corrective Maintenance', 'Inspeksi Rutin', 'Penggantian Komponen'];
  const notes = ['Pengencangan terminal', 'Pembersihan isolator', 'Ganti konektor', 'Thermovisi normal', 'Korosi ringan dibersihkan'];
  const n = 2 + (h % 3); // 2..4
  const now = Date.now();
  const wo = [];
  for (let i = 0; i < n; i++) {
    const daysAgo = 25 + ((h >> (i * 3)) % 410);
    const d = new Date(now - daysAgo * 864e5);
    wo.push({
      wo_id: `WO-${(h % 90000) + 10000 + i}`,
      type: types[(h >> i) % types.length],
      status: 'CLOSED',
      date: d.toISOString().slice(0, 10),
      note: notes[(h >> (i * 2)) % notes.length],
    });
  }
  wo.sort((a, b) => (a.date < b.date ? 1 : -1));
  const last_pm = (wo.find((w) => /Preventive|Inspeksi/.test(w.type)) || wo[0]).date;
  return { wo, last_pm, failures_12m: h % 3 }; // 0..2
}

function pct(x) {
  if (x == null) return null;
  return x <= 1 ? Math.round(x * 100) : Math.round(x);
}

function buildNarrative({ ai, asset, priorReports, inspections, maximo }) {
  const parts = [];
  const label = ai?.label || 'anomali tak terklasifikasi';
  const conf = pct(ai?.confidence);
  const sev = ai?.severity != null ? ai.severity : null;

  parts.push(
    `Model AI mengklasifikasikan citra sebagai "${label}"` +
      (conf != null ? ` dengan keyakinan ${conf}%` : '') +
      (sev != null ? `, estimasi tingkat keparahan ${sev}/100` : '') +
      '.'
  );

  if (asset) {
    parts.push(
      `Aset terkait: ${asset.name || asset.type || '—'} (SN ${asset.serial_number || '—'})` +
        (asset.unit ? `, unit ${asset.unit}` : '') +
        '.'
    );
  } else {
    parts.push('Aset belum terhubung ke laporan ini — perlu dikonfirmasi petugas di lapangan.');
  }

  if (maximo && maximo.wo.length) {
    parts.push(
      `Riwayat MAXIMO: ${maximo.wo.length} work order, PM terakhir ${maximo.last_pm || 'tak tercatat'}, ` +
        `${maximo.failures_12m} kegagalan dalam 12 bulan terakhir.`
    );
  }

  const priorN = priorReports?.length || 0;
  const inspN = inspections?.length || 0;
  if (priorN > 0) {
    parts.push(`Aset ini sudah ${priorN} kali dilaporkan sebelumnya — indikasi masalah berulang.`);
  } else {
    parts.push('Belum ada laporan sebelumnya pada aset ini.');
  }
  if (inspN > 0) parts.push(`Terdapat ${inspN} catatan inspeksi lapangan terkait.`);

  return parts.join(' ');
}

function buildRiskFactors({ ai, priorReports, maximo }) {
  const f = [];
  const conf = pct(ai?.confidence);
  if (conf != null) {
    f.push({
      label: 'Keyakinan AI',
      value: `${conf}%`,
      level: conf >= 80 ? 'tinggi' : conf >= 55 ? 'sedang' : 'rendah',
    });
  }
  if (ai?.severity != null) {
    f.push({
      label: 'Tingkat keparahan',
      value: `${ai.severity}/100`,
      level: ai.severity >= 70 ? 'tinggi' : ai.severity >= 40 ? 'sedang' : 'rendah',
    });
  }
  const priorN = priorReports?.length || 0;
  f.push({
    label: 'Laporan berulang',
    value: `${priorN}×`,
    level: priorN >= 2 ? 'tinggi' : priorN === 1 ? 'sedang' : 'rendah',
  });
  if (maximo) {
    f.push({
      label: 'Kegagalan 12 bln (MAXIMO)',
      value: `${maximo.failures_12m}`,
      level: maximo.failures_12m >= 2 ? 'tinggi' : maximo.failures_12m === 1 ? 'sedang' : 'rendah',
    });
  }
  return f;
}

// GET /api/analysis/report/:id — dossier lengkap untuk satu laporan.
router.get(
  '/report/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!UUID_RE.test(id)) throw new ApiError(400, 'bad_request', 'id harus UUID');

    const report = await safe(async () => {
      const { data, error } = await supabase.from('reports').select('*').eq('id', id).maybeSingle();
      if (error) throw error;
      return data;
    }, null);
    if (!report) throw new ApiError(404, 'not_found', 'Laporan tidak ditemukan');

    // Klasifikasi AI — bisa inline di report, atau di tabel detections.
    let ai = null;
    const inlineClass = report.ai_class || report.class || report.detected_class || null;
    if (inlineClass) {
      ai = {
        label: CLASS_LABEL[inlineClass] || inlineClass,
        raw_class: inlineClass,
        confidence: report.ai_confidence ?? report.confidence ?? null,
        severity: report.severity ?? report.score ?? null,
        model_version: report.model_version || null,
      };
    } else {
      const det = await safe(async () => {
        const { data } = await supabase
          .from('detections')
          .select('*')
          .eq('report_id', id)
          .order('created_at', { ascending: false })
          .limit(1);
        return data?.[0] || null;
      }, null);
      if (det) {
        const c = det.class || det.ai_class || det.label || null;
        ai = {
          label: CLASS_LABEL[c] || c || 'anomali',
          raw_class: c,
          confidence: det.confidence ?? null,
          severity: det.severity ?? det.score ?? null,
          model_version: det.model_version || null,
        };
      }
    }

    const serial = report.serial_number || report.asset_serial || null;

    // Aset terkait.
    const asset = await safe(async () => {
      if (report.asset_id) {
        const { data } = await supabase.from('assets').select('*').eq('id', report.asset_id).maybeSingle();
        if (data) return data;
      }
      if (serial) {
        const { data } = await supabase.from('assets').select('*').eq('serial_number', serial).maybeSingle();
        return data || null;
      }
      return null;
    }, null);

    const effSerial = serial || asset?.serial_number || null;

    // Riwayat laporan lain pada aset yang sama.
    const priorReports = await safe(async () => {
      if (!effSerial) return [];
      const { data } = await supabase
        .from('reports')
        .select('id, status, note, created_at')
        .eq('serial_number', effSerial)
        .neq('id', id)
        .order('created_at', { ascending: false })
        .limit(5);
      return data || [];
    }, []);

    // Riwayat inspeksi lapangan pada aset yang sama.
    const inspections = await safe(async () => {
      if (!effSerial) return [];
      const { data } = await supabase
        .from('inspections')
        .select('id, device_type, diagnosis, score, humidity, created_at')
        .eq('serial_number', effSerial)
        .order('created_at', { ascending: false })
        .limit(5);
      return data || [];
    }, []);

    const maximo = maximoHistory(effSerial);

    const narrative = buildNarrative({ ai, asset, priorReports, inspections, maximo });
    const risk_factors = buildRiskFactors({ ai, priorReports, maximo });
    const recommendations = (ai?.raw_class && CLASS_RECO[ai.raw_class]) || [
      'Tinjau citra & lokasi; verifikasi tingkat urgensi sebelum penugasan.',
    ];

    res.json({
      ok: true,
      data: {
        report: {
          id: report.id,
          status: report.status || null,
          note: report.note || null,
          reporter_name: report.reporter_name || null,
          lat: report.lat ?? null,
          lng: report.lng ?? null,
          created_at: report.created_at || null,
        },
        ai,
        asset: asset
          ? {
              serial_number: asset.serial_number || null,
              type: asset.type || null,
              name: asset.name || null,
              unit: asset.unit || null,
              lat: asset.lat ?? null,
              lng: asset.lng ?? null,
            }
          : null,
        prior_reports: priorReports,
        inspections,
        maximo,
        narrative,
        risk_factors,
        recommendations,
      },
    });
  })
);

module.exports = router;