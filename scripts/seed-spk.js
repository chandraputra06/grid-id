// Seed aturan SPK (spk_rules). Idempotent: kosongkan lalu isi ulang set kanonik.
// Jalankan: npm run seed:spk
require('dotenv').config();
const supabase = require('../src/config/supabase');

const RULES = [
  // isolator_pecah
  { defect: 'isolator_pecah', severity_min: 0,  severity_max: 40,  priority: 1, action_text: 'Jadwalkan inspeksi lanjutan isolator dalam 14 hari; dokumentasikan foto kondisi.' },
  { defect: 'isolator_pecah', severity_min: 40, severity_max: 70,  priority: 2, action_text: 'Rencanakan penggantian isolator pada pemeliharaan terjadwal (<=7 hari).' },
  { defect: 'isolator_pecah', severity_min: 70, severity_max: 100, priority: 3, action_text: 'Penggantian/isolasi isolator SEGERA (<=24 jam) - risiko flashover tinggi.' },
  // korosi
  { defect: 'korosi', severity_min: 0,  severity_max: 40,  priority: 1, action_text: 'Pantau rutin; bersihkan permukaan & aplikasikan pelapis anti-karat saat kunjungan berikut.' },
  { defect: 'korosi', severity_min: 40, severity_max: 70,  priority: 2, action_text: 'Jadwalkan perbaikan permukaan & pengecatan ulang dalam <=7 hari.' },
  { defect: 'korosi', severity_min: 70, severity_max: 100, priority: 3, action_text: 'Periksa integritas struktural SEGERA; ganti komponen terkorosi (<=48 jam).' },
  // kabel_bermasalah
  { defect: 'kabel_bermasalah', severity_min: 0,  severity_max: 40,  priority: 1, action_text: 'Kencangkan/rapikan sambungan saat kunjungan terjadwal; catat titik temuan.' },
  { defect: 'kabel_bermasalah', severity_min: 40, severity_max: 70,  priority: 2, action_text: 'Perbaiki sambungan/jumper dalam <=3 hari; cek titik panas dengan thermografi.' },
  { defect: 'kabel_bermasalah', severity_min: 70, severity_max: 100, priority: 3, action_text: 'Amankan area & perbaiki SEGERA (<=24 jam) - risiko hubung singkat/kabel putus.' },
  // komponen_hilang
  { defect: 'komponen_hilang', severity_min: 0,  severity_max: 40,  priority: 1, action_text: 'Verifikasi kelengkapan komponen; lengkapi pada pemeliharaan berikut.' },
  { defect: 'komponen_hilang', severity_min: 40, severity_max: 70,  priority: 2, action_text: 'Pasang kembali komponen yang hilang dalam <=3 hari.' },
  { defect: 'komponen_hilang', severity_min: 70, severity_max: 100, priority: 3, action_text: 'Lengkapi komponen pengaman (arrester/grounding) SEGERA (<=24 jam).' },
];

async function main() {
  const { error: delErr } = await supabase
    .from('spk_rules')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
  if (delErr) throw delErr;

  const { data, error } = await supabase.from('spk_rules').insert(RULES).select();
  if (error) throw error;
  console.log(`\u2713 Seed spk_rules: ${data.length} aturan (4 kelas x 3 band severity).`);
}

main().catch((e) => {
  console.error('Seed spk_rules gagal:', e.message);
  process.exit(1);
});