const router = require('express').Router();
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const supabase = require('../config/supabase');
const { computeForAsset } = require('../lib/riskScore');

// Hitung skor semua aset (tanpa simpan). Cuaca cache-first, jadi ringan.
async function scoreAllAssets() {
  const { data: assets, error } = await supabase.from('assets').select('*');
  if (error) throw new ApiError(500, 'db_error', error.message);
  const results = [];
  for (const a of assets || []) {
    try {
      const score = await computeForAsset(a, { persist: false });
      results.push({ asset: a, score });
    } catch (e) {
      results.push({ asset: a, score: null });
    }
  }
  return results;
}

// GET /api/dashboard — ringkasan angka untuk landing.
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const scored = await scoreAllAssets();

    const by_level = { kritis: 0, waspada: 0, aman: 0 };
    for (const r of scored) {
      const lvl = r.score && r.score.level;
      if (lvl && by_level[lvl] != null) by_level[lvl] += 1;
    }

    const aset_terkritis = scored
      .filter((r) => r.score)
      .sort((a, b) => b.score.score - a.score.score)
      .slice(0, 5)
      .map((r) => ({
        asset_id: r.asset.id,
        asset_code: r.asset.asset_code,
        name: r.asset.name,
        score: r.score.score,
        level: r.score.level,
      }));

    const { data: reports, error: repErr } = await supabase.from('reports').select('status');
    if (repErr) throw new ApiError(500, 'db_error', repErr.message);
    const laporan = { total: (reports || []).length, baru: 0, diproses: 0, terverifikasi: 0, ditolak: 0 };
    for (const r of reports || []) if (laporan[r.status] != null) laporan[r.status] += 1;

    const since = new Date(Date.now() - 7 * 864e5).toISOString();
    const { count: deteksi7, error: detErr } = await supabase
      .from('detections')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', since);
    if (detErr) throw new ApiError(500, 'db_error', detErr.message);

    res.json({
      ok: true,
      data: {
        total_aset: scored.length,
        by_level,
        aset_terkritis,
        laporan,
        deteksi_7hari: deteksi7 || 0,
        generated_at: new Date().toISOString(),
      },
    });
  })
);

// GET /api/dashboard/geojson — aset sebagai GeoJSON FeatureCollection (peta Leaflet).
// FeatureCollection ada di field `data`. Frontend: L.geoJSON(resp.data).
router.get(
  '/geojson',
  asyncHandler(async (req, res) => {
    const scored = await scoreAllAssets();
    const features = scored.map((r) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [r.asset.lng, r.asset.lat] },
      properties: {
        id: r.asset.id,
        asset_code: r.asset.asset_code,
        name: r.asset.name,
        asset_type: r.asset.asset_type,
        unit: r.asset.unit,
        criticality: r.asset.criticality,
        adm4: r.asset.adm4,
        score: r.score ? r.score.score : null,
        level: r.score ? r.score.level : null,
      },
    }));
    res.json({ ok: true, data: { type: 'FeatureCollection', features } });
  })
);

module.exports = router;