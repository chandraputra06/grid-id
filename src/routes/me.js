const router = require('express').Router();
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const supabase = require('../config/supabase');

// GET /api/me — profil user yang sedang login. (Dipasang di belakang requireAuth.)
router.get(
  '/',
  asyncHandler(async (req, res) => {
    res.json({
      ok: true,
      data: {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
        full_name: req.user.profile ? req.user.profile.full_name : null,
        phone: req.user.profile ? req.user.profile.phone : null,
        unit: req.user.profile ? req.user.profile.unit : null,
      },
    });
  })
);

// PATCH /api/me — update profil sendiri (full_name, phone, unit). Role TIDAK bisa diubah di sini.
router.patch(
  '/',
  asyncHandler(async (req, res) => {
    const { full_name, phone, unit } = req.body || {};
    const patch = {};
    if (full_name !== undefined) patch.full_name = full_name;
    if (phone !== undefined) patch.phone = phone;
    if (unit !== undefined) patch.unit = unit;
    if (Object.keys(patch).length === 0) throw new ApiError(400, 'bad_request', 'Tidak ada field untuk diupdate');

    const { data, error } = await supabase
      .from('profiles')
      .update(patch)
      .eq('id', req.user.id)
      .select('role, full_name, phone, unit')
      .single();
    if (error) throw new ApiError(500, 'db_error', error.message);

    res.json({ ok: true, data: { id: req.user.id, email: req.user.email, ...data } });
  })
);

module.exports = router;