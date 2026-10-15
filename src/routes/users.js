const router = require('express').Router();
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const supabase = require('../config/supabase');

const ROLES = ['admin', 'petugas', 'warga'];
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// GET /api/users — daftar user (profil + email). Admin only.
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, full_name, role, phone, unit, created_at')
      .order('created_at', { ascending: false });
    if (error) throw new ApiError(500, 'db_error', error.message);

    const { data: authData, error: authErr } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (authErr) throw new ApiError(500, 'auth_error', authErr.message);
    const emailById = new Map((authData?.users || []).map((u) => [u.id, u.email]));

    const data = (profiles || []).map((p) => ({ ...p, email: emailById.get(p.id) || null }));
    res.json({ ok: true, data });
  })
);

// POST /api/users — buat akun (petugas/admin/warga). Admin only.
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { email, password, full_name = '', role = 'petugas', phone = null, unit = null } = req.body || {};
    if (!email || !password) throw new ApiError(400, 'bad_request', 'Email dan password wajib diisi');
    if (String(password).length < 8) throw new ApiError(400, 'bad_request', 'Password minimal 8 karakter');
    if (!ROLES.includes(role)) throw new ApiError(400, 'bad_request', 'Role tidak valid');

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name, role },
    });
    if (error) throw new ApiError(400, 'create_failed', error.message);

    // Trigger sudah membuat profil dengan role dari metadata. Lengkapi phone/unit bila ada.
    if (phone || unit) {
      await supabase.from('profiles').update({ phone, unit }).eq('id', data.user.id);
    }

    res.status(201).json({ ok: true, data: { id: data.user.id, email, role, full_name, phone, unit } });
  })
);

// PATCH /api/users/:id/role — ubah role user. Admin only.
router.patch(
  '/:id/role',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!UUID_RE.test(id)) throw new ApiError(400, 'bad_request', 'id harus UUID');
    const { role } = req.body || {};
    if (!ROLES.includes(role)) throw new ApiError(400, 'bad_request', 'Role tidak valid');

    const { data, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', id)
      .select('id, full_name, role, phone, unit')
      .maybeSingle();
    if (error) throw new ApiError(500, 'db_error', error.message);
    if (!data) throw new ApiError(404, 'not_found', 'User tidak ditemukan');

    res.json({ ok: true, data });
  })
);

module.exports = router;