const router = require('express').Router();
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const supabase = require('../config/supabase');

// Gerbang verifikasi ganda: AI sudah klasifikasi, supervisor keputusan akhir.
// Laporan baru TIDAK jadi tugas sampai di-ACC supervisor.

// GET /api/review/queue — laporan menunggu verifikasi (status 'baru').
router.get(
  '/queue',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('status', 'baru')
      .order('created_at', { ascending: false })
      .limit(200);
    if (error) throw new ApiError(500, 'db_error', error.message);
    res.json({ ok: true, data: data || [] });
  })
);

// POST /api/review/:reportId — keputusan supervisor.
// body: { decision: 'acc'|'reject', assigned_to?, problem_desc?, priority?, deadline?, note? }
// acc  -> reports.status='terverifikasi' (+ buat assignment bila assigned_to diisi)
// reject -> reports.status='ditolak'
router.post(
  '/:reportId',
  asyncHandler(async (req, res) => {
    const { decision, assigned_to, problem_desc, priority, deadline } = req.body || {};
    if (!['acc', 'reject'].includes(decision)) throw new ApiError(400, 'bad_request', "decision harus 'acc' atau 'reject'");

    const { data: rep, error: e0 } = await supabase.from('reports').select('*').eq('id', req.params.reportId).maybeSingle();
    if (e0) throw new ApiError(500, 'db_error', e0.message);
    if (!rep) throw new ApiError(404, 'not_found', 'Laporan tidak ditemukan');

    if (decision === 'reject') {
      const { data, error } = await supabase.from('reports').update({ status: 'ditolak' }).eq('id', rep.id).select('*').single();
      if (error) throw new ApiError(500, 'db_error', error.message);
      return res.json({ ok: true, data: { report: data, assignment: null } });
    }

    // acc -> terverifikasi (label emas untuk training)
    const { data: report, error: eU } = await supabase
      .from('reports')
      .update({ status: 'terverifikasi' })
      .eq('id', rep.id)
      .select('*')
      .single();
    if (eU) throw new ApiError(500, 'db_error', eU.message);

    let assignment = null;
    if (assigned_to) {
      const pr = priority != null ? Number(priority) : 2;
      const row = {
        asset_id: rep.asset_id || null,
        created_by: req.user.id,
        assigned_to,
        // penanda laporan (#LPR:<id>) dipakai Peta Publik untuk membaca status per laporan, tanpa ubah skema DB
        problem_desc: `${problem_desc || rep.description || 'Tindak lanjut laporan terverifikasi'}\n#LPR:${rep.id}`,
        priority: [1, 2, 3].includes(pr) ? pr : 2,
        deadline: deadline || null,
        status: 'ditugaskan',
      };
      const { data, error } = await supabase.from('assignments').insert(row).select('*').single();
      if (error) throw new ApiError(500, 'db_error', error.message);
      assignment = data;
    }

    res.json({ ok: true, data: { report, assignment } });
  })
);

module.exports = router;