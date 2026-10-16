const router = require('express').Router();
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const supabase = require('../config/supabase');


const DEFECT_KATEGORI = { kabel_bermasalah: 'kabel', isolator_pecah: 'trafo', korosi: 'tiang', komponen_hilang: 'trafo' };
const ASSET_KATEGORI = { trafo: 'trafo', gardu: 'trafo', tiang: 'tiang', kabel: 'kabel' };
const KATEGORI_LABEL = { pohon: 'Pohon dekat kabel', kabel: 'Kabel menjuntai', trafo: 'Gardu / trafo', banjir: 'Genangan / banjir', tiang: 'Tiang miring' };
const LEVEL_RANK = { aman: 0, waspada: 1, kritis: 2 };

const KEYWORDS = [
  ['banjir', /banjir|genang|rob\b|air naik/i],
  ['pohon', /pohon|dahan|ranting|beringin/i],
  ['trafo', /trafo|gardu|percikan|panel/i],
  ['tiang', /tiang|miring/i],
  ['kabel', /kabel|menjuntai|putus|fiber/i],
];

const levelDariSeverity = (s) => (s >= 70 ? 'kritis' : s >= 40 ? 'waspada' : 'aman');

function tebakKategori(report, defect, asset) {
  const teks = report.description || '';
  for (const [k, re] of KEYWORDS) if (re.test(teks)) return k; // teks warga paling spesifik (pohon/banjir tak ada di enum defect)
  if (defect && DEFECT_KATEGORI[defect]) return DEFECT_KATEGORI[defect];
  if (asset && ASSET_KATEGORI[asset.asset_type]) return ASSET_KATEGORI[asset.asset_type];
  return 'kabel';
}

function samarkanNama(nama) {
  const p = String(nama || '').trim().split(/\s+/).filter(Boolean);
  if (!p.length) return 'Warga';
  return p.length === 1 ? p[0] : `${p[0]} ${p[p.length - 1][0].toUpperCase()}.`;
}

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) throw new ApiError(400, 'bad_request', 'lat & lng wajib diisi');
    const radius = Math.min(50, Math.max(1, Number(req.query.radius) || 25)); // km

    // bounding box kasar; penyaringan jarak persis dilakukan FE per radius pilihan
    const dLat = radius / 111.2;
    const dLng = radius / (111.2 * Math.cos((lat * Math.PI) / 180) || 1);

    const { data: reports, error } = await supabase
      .from('reports')
      .select('id, asset_id, status, description, photo_url, reporter_name, lat, lng, created_at')
      .neq('status', 'ditolak')
      .gte('lat', lat - dLat).lte('lat', lat + dLat)
      .gte('lng', lng - dLng).lte('lng', lng + dLng)
      .order('created_at', { ascending: false })
      .limit(300);
    if (error) throw new ApiError(500, 'db_error', error.message);
    const list = reports || [];
    if (!list.length) return res.json({ ok: true, data: [] });

    const reportIds = list.map((r) => r.id);
    const assetIds = [...new Set(list.map((r) => r.asset_id).filter(Boolean))];

    const [dets, assets, assigns, risks] = await Promise.all([
      supabase.from('detections').select('report_id, defect, severity').in('report_id', reportIds),
      assetIds.length ? supabase.from('assets').select('id, name, asset_type').in('id', assetIds) : { data: [] },
      supabase.from('assignments').select('problem_desc, status, completed_at').like('problem_desc', '%#LPR:%').order('created_at', { ascending: false }).limit(2000),
      assetIds.length
        ? supabase.from('risk_scores').select('asset_id, level, computed_at').in('asset_id', assetIds).order('computed_at', { ascending: false })
        : { data: [] },
    ]);

    const detBy = new Map();
    for (const d of dets.data || []) {
      const cur = detBy.get(d.report_id);
      const sev = d.severity == null ? 0 : Number(d.severity);
      if (!cur || sev > cur.severity) detBy.set(d.report_id, { defect: d.defect, severity: sev });
    }
    const assetBy = new Map((assets.data || []).map((a) => [a.id, a]));
    const assignBy = new Map(); // report_id -> [penugasan], dibaca dari penanda "#LPR:<id>" di problem_desc
    const idSet = new Set(reportIds.map(String));
    for (const a of assigns.data || []) {
      const m = /#LPR:([\w-]+)/.exec(a.problem_desc || '');
      if (!m || !idSet.has(m[1])) continue;
      const arr = assignBy.get(m[1]) || [];
      arr.push(a);
      assignBy.set(m[1], arr);
    }
    const riskBy = new Map(); // risk_scores sudah urut terbaru -> ambil yang pertama
    for (const r of risks.data || []) if (!riskBy.has(r.asset_id)) riskBy.set(r.asset_id, r.level);

    const now = Date.now();
    const data = list.map((r) => {
      const det = detBy.get(r.id) || null;
      const asset = r.asset_id ? assetBy.get(r.asset_id) : null;
      const kategori = tebakKategori(r, det && det.defect, asset);

      // status tampilan (per laporan):
      //   penugasan selesai -> Selesai | ditugaskan/diterima/dikerjakan, atau sudah di-ACC supervisor -> Ditangani petugas | selain itu -> Menunggu verifikasi
      const as = assignBy.get(String(r.id)) || [];
      const selesai = as.some((a) => a.status === 'selesai');
      const ditangani = as.some((a) => ['ditugaskan', 'diterima', 'dikerjakan'].includes(a.status)) || ['diproses', 'terverifikasi'].includes(r.status);
      const status = selesai ? 'Selesai' : ditangani ? 'Ditangani petugas' : 'Menunggu verifikasi';

      // level: severity deteksi AI > risk score aset > default 'waspada' (belum ada data = jangan dianggap aman)
      let level = det ? levelDariSeverity(det.severity) : (r.asset_id && riskBy.get(r.asset_id)) || 'waspada';
      if (selesai) level = 'aman'; // sudah ditangani
      if (!(level in LEVEL_RANK)) level = 'waspada';

      const lokasi = asset ? asset.name : null;
      return {
        id: r.id,
        judul: (r.description || '').split(/[.\n]/)[0].trim().slice(0, 90) || KATEGORI_LABEL[kategori],
        kategori,
        level,
        lokasi: lokasi || `${Number(r.lat).toFixed(4)}, ${Number(r.lng).toFixed(4)}`,
        lat: Number(r.lat),
        lng: Number(r.lng),
        menit: Math.max(0, Math.round((now - new Date(r.created_at).getTime()) / 60000)),
        pelapor: samarkanNama(r.reporter_name),
        status,
        deskripsi: r.description || 'Belum ada deskripsi dari pelapor.',
        foto: r.photo_url || null,
      };
    });

    res.json({ ok: true, data });
  })
);

module.exports = router;