const router = require('express').Router();
const crypto = require('crypto');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const supabase = require('../config/supabase');

const AVATAR_BUCKET = 'avatars';
const ALLOWED_EXT = ['jpg', 'jpeg', 'png', 'webp'];

// GET /api/me — profil user yang sedang login. (Dipasang di belakang requireAuth.)
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, role, phone, unit, avatar_url, uid, up3, ulp')
      .eq('id', req.user.id)
      .maybeSingle();

    const p = profile || req.user.profile || {};
    res.json({
      ok: true,
      data: {
        id: req.user.id,
        email: req.user.email,
        role: p.role || req.user.role,
        full_name: p.full_name ?? null,
        phone: p.phone ?? null,
        unit: p.unit ?? null,
        avatar_url: p.avatar_url ?? null,
        uid: p.uid ?? null,
        up3: p.up3 ?? null,
        ulp: p.ulp ?? null,
      },
    });
  })
);

// PATCH /api/me — update profil sendiri (full_name, phone, unit, avatar_url).
// Role, unit organisasi (uid/up3/ulp) & email TIDAK bisa diubah di sini (keamanan).
router.patch(
  '/',
  asyncHandler(async (req, res) => {
    const { full_name, phone, unit, avatar_url } = req.body || {};
    const patch = {};
    if (full_name !== undefined) patch.full_name = full_name;
    if (phone !== undefined) patch.phone = phone;
    if (unit !== undefined) patch.unit = unit;
    if (avatar_url !== undefined) patch.avatar_url = avatar_url;
    if (Object.keys(patch).length === 0) throw new ApiError(400, 'bad_request', 'Tidak ada field untuk diupdate');

    const { data, error } = await supabase
      .from('profiles')
      .update(patch)
      .eq('id', req.user.id)
      .select('role, full_name, phone, unit, avatar_url, uid, up3, ulp')
      .single();
    if (error) throw new ApiError(500, 'db_error', error.message);

    res.json({ ok: true, data: { id: req.user.id, email: req.user.email, ...data } });
  })
);

// POST /api/me/avatar-url — signed upload URL untuk foto profil.
router.post(
  '/avatar-url',
  asyncHandler(async (req, res) => {
    let { ext = 'jpg' } = req.body || {};
    ext = String(ext).toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!ALLOWED_EXT.includes(ext)) {
      throw new ApiError(400, 'bad_request', 'Ekstensi tidak didukung (jpg/jpeg/png/webp)');
    }

    const path = `${req.user.id}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

    const { data, error } = await supabase.storage.from(AVATAR_BUCKET).createSignedUploadUrl(path);
    if (error) throw new ApiError(500, 'storage_error', error.message);

    const { data: pub } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);

    res.json({
      ok: true,
      data: {
        bucket: AVATAR_BUCKET,
        path,
        token: data.token,
        signed_url: data.signedUrl,
        public_url: pub.publicUrl,
      },
    });
  })
);

module.exports = router;