const router = require('express').Router();
const crypto = require('crypto');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const supabase = require('../config/supabase');

const BUCKET = 'report-photos';
const ALLOWED_EXT = ['jpg', 'jpeg', 'png', 'webp'];

// POST /api/uploads/sign
// Body: { ext? }  -> signed upload URL (frontend upload langsung ke Storage).
router.post(
  '/sign',
  asyncHandler(async (req, res) => {
    let { ext = 'jpg' } = req.body || {};
    ext = String(ext).toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!ALLOWED_EXT.includes(ext)) {
      throw new ApiError(400, 'bad_request', 'Ekstensi tidak didukung (jpg/jpeg/png/webp)');
    }

    const path = `${req.user.id}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

    const { data, error } = await supabase.storage.from(BUCKET).createSignedUploadUrl(path);
    if (error) throw new ApiError(500, 'storage_error', error.message);

    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);

    res.json({
      ok: true,
      data: {
        bucket: BUCKET,
        path,
        token: data.token,
        signed_url: data.signedUrl,
        public_url: pub.publicUrl,
      },
    });
  })
);

module.exports = router;