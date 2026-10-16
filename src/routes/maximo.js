const router = require('express').Router();
const crypto = require('crypto');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const supabase = require('../config/supabase');

// ============================================================
// DUMMY MAXIMO ADAPTER
// Kontrak input/output meniru IBM MAXIMO. Saat API MAXIMO asli tersedia,
// cukup ganti implementasi di file ini tanpa mengubah pemanggil.
// Semua respons menyertakan source:'dummy' agar jelas (jangan diklaim produksi).
// ============================================================

function toMaximoAsset(a) {
  return {
    ASSETNUM: a.asset_code || a.id,
    DESCRIPTION: a.name || null,
    ASSETTYPE: (a.asset_type || '').toUpperCase() || null,
    SERIALNUM: a.serial_number || null,
    STATUS: 'OPERATING',
    LOCATION: a.unit || a.adm4 || null,
    LATITUDE: a.lat ?? null,
    LONGITUDE: a.lng ?? null,
  };
}

// GET /api/maximo/assets — master aset format MAXIMO.
router.get(
  '/assets',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabase.from('assets').select('*').limit(1000);
    if (error) throw new ApiError(500, 'db_error', error.message);
    res.json({ ok: true, data: (data || []).map(toMaximoAsset), source: 'dummy' });
  })
);

// GET /api/maximo/condition/:assetId — kondisi aset format MAXIMO.
router.get(
  '/condition/:assetId',
  asyncHandler(async (req, res) => {
    const { data: asset } = await supabase.from('assets').select('asset_code').eq('id', req.params.assetId).maybeSingle();
    const { data: conds } = await supabase.from('maximo_conditions').select('*').eq('asset_id', req.params.assetId).limit(1);
    const cond = conds && conds[0];
    if (!cond) {
      return res.json({ ok: true, data: null, source: 'dummy', note: 'Belum ada kondisi MAXIMO untuk aset ini' });
    }
    res.json({
      ok: true,
      data: {
        ASSETNUM: (asset && asset.asset_code) || req.params.assetId,
        CONDITIONSCORE: cond.condition_score ?? null,
        CONDITIONGRADE: (cond.condition_grade || '').toUpperCase() || null,
        LASTINSPECTION: cond.last_inspection_date || null,
        NEXTPM: cond.next_maintenance_date || null,
      },
      source: 'dummy',
    });
  })
);

// POST /api/maximo/workorder — terima rekomendasi GRID.ID -> Work Order format MAXIMO (dummy).
// body: { asset_id?|asset_code?, description?, worktype?, priority?, risk_score?, risk_level?, sched_start? }
router.post(
  '/workorder',
  asyncHandler(async (req, res) => {
    const b = req.body || {};
    let assetCode = b.asset_code || null;
    if (!assetCode && b.asset_id) {
      const { data } = await supabase.from('assets').select('asset_code').eq('id', b.asset_id).maybeSingle();
      assetCode = (data && data.asset_code) || null;
    }
    if (!assetCode) throw new ApiError(400, 'bad_request', 'asset_id atau asset_code wajib');

    const pr = b.priority != null ? Number(b.priority) : 2;
    const wonum = 'GRID-WO-' + Date.now().toString(36).toUpperCase() + '-' + crypto.randomBytes(2).toString('hex').toUpperCase();

    const wo = {
      WONUM: wonum,
      ASSETNUM: assetCode,
      DESCRIPTION: b.description || 'Tindak lanjut rekomendasi GRID.ID',
      WORKTYPE: b.worktype || 'CM',
      PRIORITY: [1, 2, 3].includes(pr) ? pr : 2,
      STATUS: 'WAPPR',
      REPORTDATE: new Date().toISOString(),
      SCHEDSTART: b.sched_start || null,
      GRIDID_RISKSCORE: b.risk_score ?? null,
      GRIDID_RISKLEVEL: b.risk_level || null,
    };

    // (dummy) tidak benar-benar dikirim ke MAXIMO; dikembalikan sebagai bukti kontrak.
    res.status(201).json({ ok: true, data: wo, source: 'dummy' });
  })
);

module.exports = router;