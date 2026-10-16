const router = require('express').Router();
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const supabase = require('../config/supabase');

// GET /api/map/reports — laporan ber-koordinat sebagai GeoJSON (hanya staf).
// Privasi: lokasi & thumbnail laporan tidak dibuka ke publik.
router.get(
  '/reports',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabase
      .from('reports')
      .select('id, status, source, description, photo_url, lat, lng, created_at')
      .not('lat', 'is', null)
      .not('lng', 'is', null)
      .order('created_at', { ascending: false })
      .limit(500);
    if (error) throw new ApiError(500, 'db_error', error.message);

    const features = (data || []).map((r) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [Number(r.lng), Number(r.lat)] },
      properties: {
        id: r.id,
        status: r.status,
        source: r.source,
        description: r.description,
        photo_url: r.photo_url,
        created_at: r.created_at,
      },
    }));

    res.json({ ok: true, data: { type: 'FeatureCollection', features } });
  })
);

module.exports = router;