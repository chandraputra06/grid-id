const router = require('express').Router();
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const supabase = require('../config/supabase');

const isAdmin = (r) => r === 'admin';
const FIELDS = ['name', 'type', 'contact', 'unit', 'status', 'note'];

// GET /api/mitra — daftar mitra (semua staf boleh lihat).
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabase.from('partners').select('*').order('created_at', { ascending: false });
    if (error) throw new ApiError(500, 'db_error', error.message);
    res.json({ ok: true, data: data || [] });
  })
);

// POST /api/mitra — tambah mitra (admin).
router.post(
  '/',
  asyncHandler(async (req, res) => {
    if (!isAdmin(req.user.role)) throw new ApiError(403, 'forbidden', 'Hanya admin');
    const b = req.body || {};
    if (!b.name) throw new ApiError(400, 'bad_request', 'Nama mitra wajib');
    const row = { name: b.name, type: b.type || null, contact: b.contact || null, unit: b.unit || null, status: b.status || 'aktif', note: b.note || null };
    const { data, error } = await supabase.from('partners').insert(row).select('*').single();
    if (error) throw new ApiError(400, 'create_failed', error.message);
    res.status(201).json({ ok: true, data });
  })
);

// PATCH /api/mitra/:id — ubah mitra (admin).
router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    if (!isAdmin(req.user.role)) throw new ApiError(403, 'forbidden', 'Hanya admin');
    const b = req.body || {};
    const patch = {};
    FIELDS.forEach((k) => {
      if (b[k] !== undefined) patch[k] = b[k];
    });
    if (Object.keys(patch).length === 0) throw new ApiError(400, 'bad_request', 'Tidak ada field untuk diupdate');
    const { data, error } = await supabase.from('partners').update(patch).eq('id', req.params.id).select('*').maybeSingle();
    if (error) throw new ApiError(500, 'db_error', error.message);
    if (!data) throw new ApiError(404, 'not_found', 'Mitra tidak ditemukan');
    res.json({ ok: true, data });
  })
);

// DELETE /api/mitra/:id — hapus mitra (admin).
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    if (!isAdmin(req.user.role)) throw new ApiError(403, 'forbidden', 'Hanya admin');
    const { error } = await supabase.from('partners').delete().eq('id', req.params.id);
    if (error) throw new ApiError(500, 'db_error', error.message);
    res.json({ ok: true, data: { deleted: true } });
  })
);

module.exports = router;