// src/lib/ai-defects.js
// Satu sumber kebenaran untuk kelas kerusakan AI (model yolov8s-grid7-v1.0).
// Dipakai di halaman lapor, verifikasi, dossier analisis, dan mana pun bbox/label ditampilkan.
// CATATAN: 'korosi' & 'komponen_hilang' sudah DIHAPUS. Jangan dipakai lagi.

export const DEFECTS = [
  "benda_asing",
  "isolator_pecah",
  "kabel_bermasalah",
  "percikan_api",
  "pohon_miring_tumbang",
  "tiang_tumbang",
];

// Label manusiawi
export const DEFECT_LABEL = {
  benda_asing: "Benda asing",
  isolator_pecah: "Isolator pecah",
  kabel_bermasalah: "Kabel bermasalah",
  percikan_api: "Percikan api",
  pohon_miring_tumbang: "Pohon miring/tumbang",
  tiang_tumbang: "Tiang tumbang",
};

// Kategori (field `category` dari layanan AI)
export const CATEGORY_LABEL = {
  kerusakan_komponen: "Kerusakan komponen",
  gangguan_eksternal: "Gangguan eksternal",
  kejadian_kritis: "Kejadian kritis",
};

// Dua kelas dengan akurasi model masih rendah -> wajib badge "Perlu verifikasi petugas".
export const NEEDS_REVIEW = new Set(["kabel_bermasalah", "pohon_miring_tumbang"]);

export function defectLabel(d) {
  return DEFECT_LABEL[d] || d || "Tidak dikenal";
}
export function categoryLabel(c) {
  return CATEGORY_LABEL[c] || c || "—";
}
export function needsReview(defect) {
  return NEEDS_REVIEW.has(defect);
}

/**
 * Konversi bbox YOLO (x,y = titik tengah; w,h = lebar/tinggi; ternormalisasi 0-1)
 * menjadi kotak piksel untuk digambar di atas foto.
 * @param {{x:number,y:number,w:number,h:number}} b
 * @param {number} imgW lebar gambar yang DITAMPILKAN (px)
 * @param {number} imgH tinggi gambar yang DITAMPILKAN (px)
 */
export function bboxToPx(b, imgW, imgH) {
  if (!b) return { left: 0, top: 0, width: 0, height: 0 };
  return {
    left: (b.x - b.w / 2) * imgW,
    top: (b.y - b.h / 2) * imgH,
    width: b.w * imgW,
    height: b.h * imgH,
  };
}

// Warna kotak berdasarkan severity (0-100). Urutkan deteksi severity tertinggi di atas.
export function severityColor(sev) {
  const s = Number(sev) || 0;
  if (s >= 70) return "#E5484D"; // kritis
  if (s >= 40) return "#F4B740"; // waspada
  return "#2743D9";              // rendah/info
}

// Urutkan deteksi: severity tertinggi dulu.
export function sortBySeverity(dets) {
  return [...(dets || [])].sort((a, b) => (Number(b.severity) || 0) - (Number(a.severity) || 0));
}