const router = require('express').Router();
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const supabase = require('../config/supabase');

// POST /api/reports  — foto diupload ke Storage lebih dulu, kirim URL-nya.
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const {
      asset_id = null,
      source = 'warga',
      reporter_name = null,
      reporter_contact = null,
      photo_url,
      description = null,
      lat = null,
      lng = null,
    } = req.body || {};

    if (!photo_url) throw new ApiError(400, 'bad_request', 'photo_url wajib diisi');

    const { data, error } = await supabase
      .from('reports')
      .insert({ asset_id, source, reporter_name, reporter_contact, photo_url, description, lat, lng })
      .select()
      .single();
    if (error) throw new ApiError(500, 'db_error', error.message);

    res.status(201).json({ ok: true, data });
  })
);

// GET /api/reports  — 100 laporan terbaru
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) throw new ApiError(500, 'db_error', error.message);
    res.json({ ok: true, data });
  })
);

// DELETE /api/reports/:id — hapus laporan PERMANEN (admin/supervisor saja).
// Dipakai untuk membersihkan laporan yang sudah ditolak agar benar-benar hilang.
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const role = req.user?.role;
    if (role !== 'admin' && role !== 'supervisor') {
      throw new ApiError(403, 'forbidden', 'Hanya admin/supervisor yang boleh menghapus laporan');
    }
    const { id } = req.params;

    // Bersihkan juga penugasan yang menautkan laporan ini (penanda #LPR:<id>),
    // agar tidak ada tugas menggantung yang menunjuk laporan terhapus.
    await supabase.from('assignments').delete().ilike('problem_desc', `%#LPR:${id}%`);

    const { data, error } = await supabase
      .from('reports')
      .delete()
      .eq('id', id)
      .select('id')
      .maybeSingle();
    if (error) throw new ApiError(500, 'db_error', error.message);
    if (!data) throw new ApiError(404, 'not_found', 'Laporan tidak ditemukan');

    res.json({ ok: true, data: { id: data.id, deleted: true } });
  })
);

module.exports = router;