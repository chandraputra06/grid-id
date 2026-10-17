// GET /api/public/laporan?lat=&lng=&radius=25
// Endpoint PUBLIK (tanpa login) untuk peta publik warga.
// Mengembalikan { ok: true, data: [ ...laporan ] } dengan bentuk yang
// DICOCOKKAN ke komponen peta-publik (level, kategori, judul, menit, status, lat, lng).
// Privasi: foto & nama pelapor TIDAK diumbar; status 'ditolak' disembunyikan.
const router = require('express').Router();
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const supabase = require('../config/supabase');

// Nilai yang VALID di frontend. Wajib clamp ke sini agar komponen tak crash.
const KATEGORI_VALID = ['pohon', 'kabel', 'trafo', 'banjir', 'tiang'];
const LEVEL_VALID = ['kritis', 'waspada', 'aman'];

// Kelas AI -> kategori publik (perkiraan terbaik).
const CLASS_TO_KAT = {
  kabel_bermasalah: 'kabel',
  isolator_pecah: 'trafo',
  korosi: 'trafo',
  komponen_hilang: 'tiang',
};

// Status internal -> label publik. 'ditolak' sengaja tidak dipetakan (disembunyikan).
const STATUS_PUBLIC = {
  baru: 'Menunggu verifikasi',
  diproses: 'Ditangani petugas',
  terverifikasi: 'Selesai',
  selesai: 'Selesai',
};

function pickKategori(r) {
  const raw = String(r.category || r.kategori || r.ai_class || r.class || '').toLowerCase();
  if (KATEGORI_VALID.includes(raw)) return raw;
  if (CLASS_TO_KAT[raw]) return CLASS_TO_KAT[raw];
  const d = String(r.description || '').toLowerCase();
  if (/pohon|ranting|dahan/.test(d)) return 'pohon';
  if (/trafo|gardu|isolator/.test(d)) return 'trafo';
  if (/banjir|genang|air/.test(d)) return 'banjir';
  if (/tiang|miring/.test(d)) return 'tiang';
  if (/kabel|kawat|konektor/.test(d)) return 'kabel';
  return 'kabel';
}

function pickLevel(r) {
  const raw = String(r.level || r.risk_level || '').toLowerCase();
  if (LEVEL_VALID.includes(raw)) return raw;
  const score = Number(r.severity ?? r.score ?? r.risk_score);
  if (!Number.isNaN(score)) return score >= 65 ? 'kritis' : score >= 35 ? 'waspada' : 'aman';
  return 'waspada';
}

function pickJudul(r, kategori) {
  if (r.title || r.judul) return String(r.title || r.judul);
  const label = {
    pohon: 'Pohon dekat kabel',
    kabel: 'Kabel bermasalah',
    trafo: 'Gardu / trafo',
    banjir: 'Genangan / banjir',
    tiang: 'Tiang miring',
  }[kategori];
  return label || 'Laporan warga';
}

function menitDari(iso) {
  if (!iso) return 0;
  const ms = Date.now() - new Date(iso).getTime();
  return Math.max(0, Math.round(ms / 60000));
}

// Jarak kasar (km) untuk pra-filter radius di server.
function distKm(aLat, aLng, bLat, bLng) {
  const dLat = (aLat - bLat) * 111.2;
  const dLng = (aLng - bLng) * 111.2 * Math.cos((aLat * Math.PI) / 180);
  return Math.sqrt(dLat * dLat + dLng * dLng);
}

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const lat = req.query.lat != null ? Number(req.query.lat) : null;
    const lng = req.query.lng != null ? Number(req.query.lng) : null;
    const radius = req.query.radius != null ? Number(req.query.radius) : 25;

    // Ambil laporan ber-koordinat. select('*') agar toleran terhadap skema.
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .not('lat', 'is', null)
      .not('lng', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1000);
    if (error) throw new ApiError(500, 'db_error', error.message);

    const out = [];
    for (const r of data || []) {
      const rlat = Number(r.lat);
      const rlng = Number(r.lng);
      if (Number.isNaN(rlat) || Number.isNaN(rlng)) continue;

      // Sembunyikan laporan yang ditolak dari publik.
      const statusRaw = String(r.status || '').toLowerCase();
      if (statusRaw === 'ditolak') continue;

      // Pra-filter radius (jika titik dikirim). Beri sedikit kelonggaran.
      if (lat != null && lng != null && !Number.isNaN(lat) && !Number.isNaN(lng)) {
        if (distKm(lat, lng, rlat, rlng) > radius + 1) continue;
      }

      const kategori = pickKategori(r);
      const level = pickLevel(r);

      out.push({
        id: r.id,
        lat: rlat,
        lng: rlng,
        level,
        kategori,
        judul: pickJudul(r, kategori),
        deskripsi: r.description || 'Tanpa deskripsi',
        lokasi: r.location || r.lokasi || r.address || 'Bali',
        status: STATUS_PUBLIC[statusRaw] || 'Menunggu verifikasi',
        menit: menitDari(r.created_at),
        // Privasi: foto & identitas pelapor tidak diumbar ke publik.
        foto: null,
        pelapor: 'Warga',
      });
    }

    res.json({ ok: true, data: out });
  })
);

module.exports = router;