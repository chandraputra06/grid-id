const env = require('../config/env');

const CLASSES = ['isolator_pecah', 'korosi', 'kabel_bermasalah', 'komponen_hilang'];

function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Fallback mock (dipakai kalau service inference tidak di-set / tidak tersedia).
function mockInfer(photoUrl) {
  const h = hashStr(photoUrl);
  const r = h % 10;
  const n = r < 2 ? 0 : r < 8 ? 1 : 2;
  const dets = [];
  for (let i = 0; i < n; i++) {
    const hi = hashStr(`${photoUrl}#${i}`);
    dets.push({
      defect: CLASSES[hi % 4],
      confidence: Math.round((0.55 + (hi % 40) / 100) * 100) / 100,
      severity: 40 + ((hi >>> 3) % 51),
      bbox: { x: (hi % 60) / 100, y: ((hi >>> 2) % 60) / 100, w: 0.2, h: 0.2 },
      model_version: 'mock-v0',
    });
  }
  return dets;
}

// Panggil service inference (FastAPI). Gagal/timeout -> fallback mock lokal.
async function infer(photoUrl) {
  const url = env.INFERENCE_URL;
  if (url) {
    try {
      const resp = await fetch(`${url.replace(/\/$/, '')}/infer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photo_url: photoUrl }),
        signal: AbortSignal.timeout(8000),
      });
      if (resp.ok) {
        const json = await resp.json();
        const dets = json && json.data && json.data.detections;
        if (Array.isArray(dets)) return dets;
      }
    } catch (e) {
      // service tidak tersedia -> fallback di bawah
    }
  }
  return mockInfer(photoUrl);
}

module.exports = { infer, mockInfer, CLASSES };