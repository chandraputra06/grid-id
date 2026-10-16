const router = require('express').Router();
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const supabase = require('../config/supabase');

const STATUS = ['ditugaskan', 'diterima', 'dikerjakan', 'selesai', 'ditolak'];
const isSuper = (r) => r === 'admin' || r === 'supervisor';

// Lampirkan ringkasan aset + nama petugas (hindari embed yang ambigu).
async function attach(rows) {
  const assetIds = [...new Set(rows.map((r) => r.asset_id).filter(Boolean))];
  const petugasIds = [...new Set(rows.map((r) => r.assigned_to).filter(Boolean))];
  const assets = {};
  const profs = {};
  if (assetIds.length) {
    const { data } = await supabase.from('assets').select('id, asset_code, name, unit, lat, lng').in('id', assetIds);
    (data || []).forEach((a) => (assets[a.id] = a));
  }
  if (petugasIds.length) {
    const { data } = await supabase.from('profiles').select('id, full_name').in('id', petugasIds);
    (data || []).forEach((p) => (profs[p.id] = p));
  }
  return rows.map((r) => ({ ...r, asset: assets[r.asset_id] || null, petugas: profs[r.assigned_to] || null }));
}

// GET /api/assignments?status= — petugas: miliknya; supervisor: yang dia buat; admin: semua.
router.get(
  '/',
  asyncHandler(async (req, res) => {
    let q = supabase.from('assignments').select('*').order('created_at', { ascending: false }).limit(300);
    if (req.query.status) q = q.eq('status', req.query.status);
    if (req.user.role === 'petugas') q = q.eq('assigned_to', req.user.id);
    else if (req.user.role === 'supervisor') q = q.eq('created_by', req.user.id);
    const { data, error } = await q;
    if (error) throw new ApiError(500, 'db_error', error.message);
    res.json({ ok: true, data: await attach(data || []) });
  })
);

// GET /api/assignments/:id — detail + report penyelesaian.
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabase.from('assignments').select('*').eq('id', req.params.id).maybeSingle();
    if (error) throw new ApiError(500, 'db_error', error.message);
    if (!data) throw new ApiError(404, 'not_found', 'Penugasan tidak ditemukan');
    const [withMeta] = await attach([data]);
    const { data: reports } = await supabase
      .from('assignment_reports')
      .select('*')
      .eq('assignment_id', data.id)
      .order('created_at', { ascending: false });
    res.json({ ok: true, data: { ...withMeta, reports: reports || [] } });
  })
);

// POST /api/assignments — supervisor/admin menugaskan petugas.
router.post(
  '/',
  asyncHandler(async (req, res) => {
    if (!isSuper(req.user.role)) throw new ApiError(403, 'forbidden', 'Hanya supervisor/admin yang bisa menugaskan');
    const b = req.body || {};
    if (!b.assigned_to) throw new ApiError(400, 'bad_request', 'assigned_to (petugas) wajib');
    const priority = b.priority != null ? Number(b.priority) : 2;
    if (![1, 2, 3].includes(priority)) throw new ApiError(400, 'bad_request', 'priority harus 1-3');
    const row = {
      asset_id: b.asset_id || null,
      created_by: req.user.id,
      assigned_to: b.assigned_to,
      problem_desc: b.problem_desc || null,
      priority,
      deadline: b.deadline || null,
      status: 'ditugaskan',
    };
    const { data, error } = await supabase.from('assignments').insert(row).select('*').single();
    if (error) throw new ApiError(500, 'db_error', error.message);
    res.status(201).json({ ok: true, data });
  })
);

// PATCH /api/assignments/:id/accept — petugas menerima (acc).
router.patch(
  '/:id/accept',
  asyncHandler(async (req, res) => {
    const { data: a, error: e0 } = await supabase.from('assignments').select('*').eq('id', req.params.id).maybeSingle();
    if (e0) throw new ApiError(500, 'db_error', e0.message);
    if (!a) throw new ApiError(404, 'not_found', 'Penugasan tidak ditemukan');
    if (req.user.role === 'petugas' && a.assigned_to !== req.user.id) throw new ApiError(403, 'forbidden', 'Bukan penugasanmu');
    if (a.status !== 'ditugaskan') throw new ApiError(400, 'bad_request', `Tidak bisa accept dari status '${a.status}'`);
    const { data, error } = await supabase
      .from('assignments')
      .update({ status: 'diterima', accepted_at: new Date().toISOString() })
      .eq('id', a.id)
      .select('*')
      .single();
    if (error) throw new ApiError(500, 'db_error', error.message);
    res.json({ ok: true, data });
  })
);

// PATCH /api/assignments/:id/status — ubah status (dikerjakan/selesai/ditolak).
router.patch(
  '/:id/status',
  asyncHandler(async (req, res) => {
    const { status } = req.body || {};
    if (!STATUS.includes(status)) throw new ApiError(400, 'bad_request', 'status tidak valid');
    const { data: a, error: e0 } = await supabase.from('assignments').select('*').eq('id', req.params.id).maybeSingle();
    if (e0) throw new ApiError(500, 'db_error', e0.message);
    if (!a) throw new ApiError(404, 'not_found', 'Penugasan tidak ditemukan');
    if (req.user.role === 'petugas' && a.assigned_to !== req.user.id) throw new ApiError(403, 'forbidden', 'Bukan penugasanmu');
    const patch = { status };
    if (status === 'selesai') patch.completed_at = new Date().toISOString();
    const { data, error } = await supabase.from('assignments').update(patch).eq('id', a.id).select('*').single();
    if (error) throw new ApiError(500, 'db_error', error.message);
    res.json({ ok: true, data });
  })
);

// POST /api/assignments/:id/report — petugas lapor penyelesaian -> status selesai.
router.post(
  '/:id/report',
  asyncHandler(async (req, res) => {
    const { data: a, error: e0 } = await supabase.from('assignments').select('*').eq('id', req.params.id).maybeSingle();
    if (e0) throw new ApiError(500, 'db_error', e0.message);
    if (!a) throw new ApiError(404, 'not_found', 'Penugasan tidak ditemukan');
    if (req.user.role === 'petugas' && a.assigned_to !== req.user.id) throw new ApiError(403, 'forbidden', 'Bukan penugasanmu');
    const b = req.body || {};
    const row = {
      assignment_id: a.id,
      tools_used: b.tools_used || null,
      prior_repair_count: b.prior_repair_count ?? null,
      problem_found: b.problem_found || null,
      actions_done: b.actions_done || null,
      after_photos: b.after_photos || null,
    };
    const { data, error } = await supabase.from('assignment_reports').insert(row).select('*').single();
    if (error) throw new ApiError(500, 'db_error', error.message);
    await supabase.from('assignments').update({ status: 'selesai', completed_at: new Date().toISOString() }).eq('id', a.id);
    res.status(201).json({ ok: true, data });
  })
);

module.exports = router;