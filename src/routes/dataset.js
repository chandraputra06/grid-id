const router = require('express').Router();
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const supabase = require('../config/supabase');

// Urutan kelas = class_id YOLO (0..3). JANGAN diubah urutannya setelah model dilatih.
const CLASSES = ['isolator_pecah', 'korosi', 'kabel_bermasalah', 'komponen_hilang'];
const round = (n) => Math.round(Number(n) * 1e6) / 1e6;

// GET /api/dataset/export?format=json|csv
router.get(
  '/export',
  asyncHandler(async (req, res) => {
    const format = String(req.query.format || 'json').toLowerCase();

    const { data, error } = await supabase
      .from('detections')
      .select('defect, severity, confidence, bbox, verified, report:report_id(id, photo_url)')
      .eq('verified', true);
    if (error) throw new ApiError(500, 'db_error', error.message);

    // kelompokkan per gambar. bbox: {x,y}=pojok kiri-atas, {w,h}=lebar/tinggi (ternormalisasi).
    const byImage = new Map();
    for (const d of data || []) {
      const url = d.report && d.report.photo_url;
      const classId = CLASSES.indexOf(d.defect);
      if (!url || !d.bbox || classId < 0) continue;
      const b = d.bbox;
      const label = {
        class_id: classId,
        class_name: d.defect,
        x_center: round(Number(b.x) + Number(b.w) / 2),
        y_center: round(Number(b.y) + Number(b.h) / 2),
        w: round(b.w),
        h: round(b.h),
      };
      if (!byImage.has(url)) byImage.set(url, []);
      byImage.get(url).push(label);
    }

    const items = [...byImage.entries()].map(([image_url, labels]) => ({ image_url, labels }));

    if (format === 'csv') {
      let csv = 'image_url,class_id,class_name,x_center,y_center,width,height\n';
      for (const it of items) {
        for (const l of it.labels) {
          csv += `${it.image_url},${l.class_id},${l.class_name},${l.x_center},${l.y_center},${l.w},${l.h}\n`;
        }
      }
      res.type('text/csv').send(csv);
      return;
    }

    res.json({
      ok: true,
      data: {
        classes: CLASSES,
        count_images: items.length,
        count_labels: items.reduce((a, it) => a + it.labels.length, 0),
        items,
      },
    });
  })
);

module.exports = router;