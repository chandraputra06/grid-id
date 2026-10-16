const router = require('express').Router();
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const supabase = require('../config/supabase');

// GET /api/reward/leaderboard — ranking pelapor berdasarkan laporan TERVERIFIKASI.
// Poin = jumlah laporan terverifikasi x 10 (label emas = kontribusi data training).
router.get(
  '/leaderboard',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabase
      .from('reports')
      .select('reporter_name, reporter_contact, status')
      .eq('status', 'terverifikasi')
      .limit(5000);
    if (error) throw new ApiError(500, 'db_error', error.message);

    const map = new Map();
    for (const r of data || []) {
      const key = (r.reporter_name || r.reporter_contact || 'Anonim').trim() || 'Anonim';
      map.set(key, (map.get(key) || 0) + 1);
    }
    const leaderboard = [...map.entries()]
      .map(([name, verified]) => ({ name, verified, points: verified * 10 }))
      .sort((a, b) => b.verified - a.verified)
      .slice(0, 50);

    res.json({
      ok: true,
      data: { leaderboard, total_verified: (data || []).length, total_pelapor: map.size },
    });
  })
);

module.exports = router;