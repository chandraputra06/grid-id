const router = require('express').Router();
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const supabase = require('../config/supabase');
const { recommendForAsset } = require('../lib/spk');

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// GET /api/rekomendasi/:assetId — rekomendasi tindakan (SPK) untuk satu aset.
// Query: ?window=7 (hari), ?persist=true (simpan ke tabel recommendations).
router.get(
  '/:assetId',
  asyncHandler(async (req, res) => {
    const { assetId } = req.params;
    if (!UUID_RE.test(assetId)) throw new ApiError(400, 'bad_request', 'assetId harus UUID yang valid');

    const windowDays = Math.min(Math.max(parseInt(req.query.window, 10) || 7, 1), 90);
    const persist = String(req.query.persist) === 'true';

    const { data: asset, error } = await supabase
      .from('assets')
      .select('id, asset_code, name, asset_type, unit, adm4')
      .eq('id', assetId)
      .maybeSingle();
    if (error) throw new ApiError(500, 'db_error', error.message);
    if (!asset) throw new ApiError(404, 'not_found', 'Aset tidak ditemukan');

    const result = await recommendForAsset(assetId, { windowDays, persist });

    res.json({
      ok: true,
      data: {
        asset,
        ...result,
        note:
          result.defects_found === 0
            ? 'Belum ada deteksi pada jendela waktu ini. Catatan: tanpa deteksi != pasti aman - hanya belum ada temuan.'
            : undefined,
      },
    });
  })
);

module.exports = router;