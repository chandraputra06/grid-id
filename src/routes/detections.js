const router = require('express').Router();
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const supabase = require('../config/supabase');

const DEFECTS = ['isolator_pecah', 'korosi', 'kabel_bermasalah', 'komponen_hilang'];
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// GET /api/detections?verified=false|true&limit=100 — antrean review (join foto + aset)
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 100, 1), 500);
    let q = supabase
      .from('detections')
      .select('*, report:report_id(id, photo_url, asset_id, status, created_at)')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (req.query.verified === 'true') q = q.eq('verified', true);
    else if (req.query.verified === 'false') q = q.eq('verified', false);

    const { data, error } = await q;
    if (error) throw new ApiError(500, 'db_error', error.message);
    res.json({ ok: true, data });
  })
);

// PATCH /api/detections/:id/verify — konfirmasi/koreksi lalu tandai verified (label emas)
router.patch(
  '/:id/verify',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!UUID_RE.test(id)) throw new ApiError(400, 'bad_request', 'id harus UUID');

    const { defect, severity, bbox, verified = true } = req.body || {};
    const patch = { verified: !!verified };
    if (defect !== undefined) {
      if (!DEFECTS.includes(defect)) throw new ApiError(400, 'bad_request', 'defect tidak valid');
      patch.defect = defect;
    }
    if (severity !== undefined) {
      const s = Number(severity);
      if (Number.isNaN(s) || s < 0 || s > 100) throw new ApiError(400, 'bad_request', 'severity harus 0-100');
      patch.severity = s;
    }
    if (bbox !== undefined) patch.bbox = bbox;

    const { data, error } = await supabase
      .from('detections')
      .update(patch)
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw new ApiError(500, 'db_error', error.message);
    if (!data) throw new ApiError(404, 'not_found', 'Deteksi tidak ditemukan');

    res.json({ ok: true, data });
  })
);

// POST /api/detections — tambah deteksi manual (label yang dilewatkan model). verified=true.
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { report_id, defect, severity = 70, bbox = null, confidence = 1 } = req.body || {};
    if (!UUID_RE.test(report_id || '')) throw new ApiError(400, 'bad_request', 'report_id harus UUID');
    if (!DEFECTS.includes(defect)) throw new ApiError(400, 'bad_request', 'defect tidak valid');
    const s = Number(severity);
    if (Number.isNaN(s) || s < 0 || s > 100) throw new ApiError(400, 'bad_request', 'severity harus 0-100');

    const row = {
      report_id, defect, severity: s, bbox,
      confidence: Number(confidence) || 1,
      model_version: 'manual', verified: true,
    };
    const { data, error } = await supabase.from('detections').insert(row).select().single();
    if (error) throw new ApiError(500, 'db_error', error.message);
    res.status(201).json({ ok: true, data });
  })
);

module.exports = router;