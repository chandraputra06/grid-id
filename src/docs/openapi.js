// OpenAPI 3.0 spec GRID.ID — sumber kebenaran API contract.
// Disajikan di /api/docs (Swagger UI) dan /api/openapi.json (raw, untuk Postman/Insomnia).

const enums = {
  defect: ['isolator_pecah', 'korosi', 'kabel_bermasalah', 'komponen_hilang'],
  risk_level: ['kritis', 'waspada', 'aman'],
  condition_grade: ['baik', 'sedang', 'buruk'],
  report_status: ['baru', 'diproses', 'terverifikasi', 'ditolak'],
  report_source: ['warga', 'petugas', 'cctv'],
  weather_status: ['fresh', 'stale', 'unavailable'],
};

const ok = (dataSchema, extra = {}) => ({
  type: 'object',
  properties: { ok: { type: 'boolean', example: true }, data: dataSchema, ...extra },
  required: ['ok', 'data'],
});
const jsonOk = (dataSchema, description = 'OK', extra = {}) => ({
  description,
  content: { 'application/json': { schema: ok(dataSchema, extra) } },
});

module.exports = {
  openapi: '3.0.3',
  info: {
    title: 'GRID.ID API',
    version: '0.1.0',
    description:
      'Backend GRID.ID — decision support pemeliharaan aset PLN.\n\n' +
      'Semua respons pakai envelope:\n' +
      '- Sukses: `{ "ok": true, "data": ... }`\n' +
      '- Gagal: `{ "ok": false, "error": { "code", "message" } }`\n\n' +
      'Panduan frontend: selalu cek `ok` dulu. Panggil backend ini, BUKAN Supabase langsung (RLS memblokir anon).',
  },
  servers: [{ url: 'http://localhost:4000', description: 'Dev lokal' }],
  security: [{ bearerAuth: [] }],
  tags: [
    { name: 'Health', description: 'Status service' },
    { name: 'Cuaca', description: 'Prakiraan BMKG (cache-first)' },
    { name: 'Assets', description: 'Aset/gardu PLN + Risk Score' },
    { name: 'Scan', description: 'AI Screening (foto -> deteksi)' },
    { name: 'Reports', description: 'Laporan warga/petugas' },
    { name: 'Prioritas', description: 'Urutan risiko antar-aset' },
    { name: 'SPK', description: 'Rekomendasi tindakan (defect -> aksi)' },
    { name: 'Dashboard', description: 'Ringkasan & data peta' },
    { name: 'Auth', description: 'Autentikasi & profil (Supabase Auth)' },
    { name: 'Users', description: 'Manajemen user (admin)' },
    { name: 'Uploads', description: 'Upload foto ke Storage' },
    { name: 'Detections', description: 'Verifikasi deteksi (label training)' },
    { name: 'Dataset', description: 'Export data training (YOLO)' },
  ],

  paths: {
    '/api/health': {
      get: {
        tags: ['Health'],
        summary: 'Cek service & koneksi DB',
        security: [],
        responses: {
          200: jsonOk({
            type: 'object',
            properties: {
              service: { type: 'string', example: 'grid-id-backend' },
              status: { type: 'string', example: 'up' },
              db: { type: 'string', enum: ['ok', 'error', 'unknown'], example: 'ok' },
              time: { type: 'string', format: 'date-time' },
            },
          }),
        },
      },
    },

    '/api/cuaca': {
      get: {
        tags: ['Cuaca'],
        summary: 'Prakiraan cuaca BMKG untuk satu wilayah (adm4)',
        security: [],
        parameters: [
          { name: 'adm4', in: 'query', required: true, schema: { type: 'string', example: '51.71.01.2008' }, description: 'Kode desa/kelurahan BMKG' },
          { name: 'horizon', in: 'query', required: false, schema: { type: 'integer', minimum: 3, maximum: 72, default: 24 }, description: 'Jendela jam untuk ringkasan faktor' },
        ],
        responses: {
          200: jsonOk({ $ref: '#/components/schemas/WeatherResult' }),
          400: { $ref: '#/components/responses/Error' },
        },
      },
    },

    '/api/assets': {
      get: {
        tags: ['Assets'],
        summary: 'Daftar semua aset',
        responses: { 200: jsonOk({ type: 'array', items: { $ref: '#/components/schemas/Asset' } }) },
      },
    },

    '/api/assets/{id}': {
      get: {
        tags: ['Assets'],
        summary: 'Detail aset + kondisi MAXIMO (dummy) + skor terakhir',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          200: jsonOk({
            type: 'object',
            properties: {
              asset: { $ref: '#/components/schemas/Asset' },
              maximo: { oneOf: [{ $ref: '#/components/schemas/MaximoCondition' }, { type: 'null' }] },
              risk_score: { oneOf: [{ $ref: '#/components/schemas/RiskScore' }, { type: 'null' }] },
            },
          }),
          404: { $ref: '#/components/responses/Error' },
        },
      },
    },

    '/api/assets/{id}/score': {
      get: {
        tags: ['Assets'],
        summary: 'Hitung & simpan Risk Score aset (severity 40% / cuaca 35% / kepadatan 25%)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          200: jsonOk({ $ref: '#/components/schemas/RiskScore' }),
          404: { $ref: '#/components/responses/Error' },
        },
      },
    },

    '/api/scan': {
      post: {
        tags: ['Scan'],
        summary: 'AI Screening: deteksi pada foto -> tulis detections -> recompute skor',
        description: 'Kirim `report_id` (scan laporan yang sudah ada) ATAU `photo_url` (+ field) untuk membuat laporan lalu scan. Jika laporan terkait aset, Risk Score ikut diperbarui.',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ScanRequest' } } } },
        responses: {
          201: jsonOk({ $ref: '#/components/schemas/ScanResult' }, 'Created'),
          400: { $ref: '#/components/responses/Error' },
          404: { $ref: '#/components/responses/Error' },
        },
      },
    },

    '/api/reports': {
      get: {
        tags: ['Reports'],
        summary: '100 laporan terbaru',
        responses: { 200: jsonOk({ type: 'array', items: { $ref: '#/components/schemas/Report' } }) },
      },
      post: {
        tags: ['Reports'],
        summary: 'Buat laporan (foto diupload ke Storage dulu, kirim URL-nya)',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/NewReport' } } } },
        responses: {
          201: jsonOk({ $ref: '#/components/schemas/Report' }, 'Created'),
          400: { $ref: '#/components/responses/Error' },
        },
      },
    },

    '/api/prioritas': {
      get: {
        tags: ['Prioritas'],
        summary: 'Semua aset terurut Risk Score (desc), dengan info MAXIMO',
        responses: {
          200: jsonOk({
            type: 'array',
            items: {
              allOf: [
                { $ref: '#/components/schemas/RiskScore' },
                {
                  type: 'object',
                  properties: {
                    asset: { $ref: '#/components/schemas/Asset' },
                    maximo: { oneOf: [{ $ref: '#/components/schemas/MaximoCondition' }, { type: 'null' }] },
                  },
                },
              ],
            },
          }),
        },
      },
    },
    '/api/rekomendasi/{assetId}': {
      get: {
        tags: ['SPK'],
        summary: 'Rekomendasi tindakan untuk satu aset (SPK: defect -> aksi)',
        description:
          'Ambil deteksi terbaru aset (default 7 hari), petakan tiap kerusakan + severity ke aturan spk_rules, ' +
          'kembalikan daftar tindakan terurut prioritas. persist=true menyimpan ke tabel recommendations (ditaut ke risk_score terakhir).',
        parameters: [
          { name: 'assetId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
          { name: 'window', in: 'query', required: false, schema: { type: 'integer', minimum: 1, maximum: 90, default: 7 }, description: 'Jendela hari deteksi' },
          { name: 'persist', in: 'query', required: false, schema: { type: 'boolean', default: false }, description: 'Simpan ke tabel recommendations' },
        ],
        responses: {
          200: jsonOk({ $ref: '#/components/schemas/RekomendasiResult' }),
          400: { $ref: '#/components/responses/Error' },
          404: { $ref: '#/components/responses/Error' },
        },
      },
    },
    '/api/dashboard': {
      get: {
        tags: ['Dashboard'],
        summary: 'Ringkasan angka untuk landing (hitung skor semua aset secara fresh)',
        responses: { 200: jsonOk({ $ref: '#/components/schemas/DashboardSummary' }) },
      },
    },

    '/api/dashboard/geojson': {
      get: {
        tags: ['Dashboard'],
        summary: 'Semua aset sebagai GeoJSON FeatureCollection (peta Leaflet)',
        description: 'FeatureCollection ada di field data (bukan root). Frontend: L.geoJSON(resp.data). properties.level untuk warna marker.',
        responses: { 200: jsonOk({ $ref: '#/components/schemas/GeoJSONFeatureCollection' }) },
      },
    },
    '/api/me': {
      get: {
        tags: ['Auth'],
        summary: 'Profil user yang sedang login',
        responses: {
          200: jsonOk({ $ref: '#/components/schemas/Profile' }),
          401: { $ref: '#/components/responses/Error' },
        },
      },
      patch: {
        tags: ['Auth'],
        summary: 'Update profil sendiri (full_name, phone, unit)',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: {
            type: 'object',
            properties: {
              full_name: { type: 'string', example: 'Budi Santoso' },
              phone: { type: 'string', example: '08123456789' },
              unit: { type: 'string', example: 'UP3 Bali Selatan' },
            },
          } } },
        },
        responses: {
          200: jsonOk({ $ref: '#/components/schemas/Profile' }),
          401: { $ref: '#/components/responses/Error' },
        },
      },
    },
    '/api/uploads/sign': {
      post: {
        tags: ['Uploads'],
        summary: 'Minta signed upload URL untuk foto (upload langsung ke Storage)',
        description:
          'Alur: (1) POST sign -> dapat {path, token, public_url}; ' +
          '(2) frontend: supabase.storage.from(bucket).uploadToSignedUrl(path, token, file); ' +
          '(3) POST /api/reports { photo_url: public_url }.',
        requestBody: {
          required: false,
          content: { 'application/json': { schema: {
            type: 'object',
            properties: { ext: { type: 'string', enum: ['jpg', 'jpeg', 'png', 'webp'], default: 'jpg' } },
          } } },
        },
        responses: {
          200: jsonOk({ $ref: '#/components/schemas/SignUploadResult' }),
          400: { $ref: '#/components/responses/Error' },
        },
      },
    },
    '/api/detections': {
      get: {
        tags: ['Detections'],
        summary: 'Daftar deteksi (antrean review). Filter: verified=true|false',
        parameters: [
          { name: 'verified', in: 'query', required: false, schema: { type: 'string', enum: ['true', 'false'] } },
          { name: 'limit', in: 'query', required: false, schema: { type: 'integer', minimum: 1, maximum: 500, default: 100 } },
        ],
        responses: {
          200: jsonOk({ type: 'array', items: { $ref: '#/components/schemas/Detection' } }),
        },
      },
      post: {
        tags: ['Detections'],
        summary: 'Tambah deteksi manual (label yang dilewatkan model). verified=true.',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: {
            type: 'object',
            required: ['report_id', 'defect'],
            properties: {
              report_id: { type: 'string', format: 'uuid' },
              defect: { type: 'string', enum: enums.defect },
              severity: { type: 'number', default: 70 },
              bbox: { type: 'object', nullable: true, example: { x: 0.2, y: 0.3, w: 0.2, h: 0.2 } },
              confidence: { type: 'number', default: 1 },
            },
          } } },
        },
        responses: {
          201: jsonOk({ $ref: '#/components/schemas/Detection' }, 'Created'),
          400: { $ref: '#/components/responses/Error' },
        },
      },
    },

    '/api/detections/{id}/verify': {
      patch: {
        tags: ['Detections'],
        summary: 'Konfirmasi/koreksi deteksi lalu tandai verified (label emas untuk training)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: false,
          content: { 'application/json': { schema: {
            type: 'object',
            properties: {
              verified: { type: 'boolean', default: true },
              defect: { type: 'string', enum: enums.defect, description: 'Koreksi kelas (opsional)' },
              severity: { type: 'number', description: 'Koreksi severity 0-100 (opsional)' },
              bbox: { type: 'object', description: 'Koreksi bbox (opsional)' },
            },
          } } },
        },
        responses: {
          200: jsonOk({ $ref: '#/components/schemas/Detection' }),
          400: { $ref: '#/components/responses/Error' },
          404: { $ref: '#/components/responses/Error' },
        },
      },
    },
    '/api/dataset/export': {
      get: {
        tags: ['Dataset'],
        summary: 'Export deteksi terverifikasi sebagai manifest dataset (YOLO)',
        description:
          'Kumpulkan deteksi verified=true, kelompokkan per gambar, konversi bbox ke format center YOLO. ' +
          'format=json (default) atau csv. Dipakai inference/build_dataset.py untuk membangun dataset lokal.',
        parameters: [
          { name: 'format', in: 'query', required: false, schema: { type: 'string', enum: ['json', 'csv'], default: 'json' } },
        ],
        responses: {
          200: jsonOk({ $ref: '#/components/schemas/DatasetExport' }),
        },
      },
    },
    '/api/users': {
      get: {
        tags: ['Users'],
        summary: 'Daftar user (profil + email). Admin only.',
        responses: { 200: jsonOk({ type: 'array', items: { $ref: '#/components/schemas/Profile' } }) },
      },
      post: {
        tags: ['Users'],
        summary: 'Buat akun baru (petugas/admin/warga). Admin only.',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: {
            type: 'object',
            required: ['email', 'password'],
            properties: {
              email: { type: 'string', example: 'petugas2@grid.id' },
              password: { type: 'string', example: 'MinimalDelapan#1' },
              full_name: { type: 'string', example: 'Petugas Dua' },
              role: { type: 'string', enum: ['admin', 'petugas', 'warga'], default: 'petugas' },
              phone: { type: 'string', nullable: true },
              unit: { type: 'string', nullable: true },
            },
          } } },
        },
        responses: {
          201: jsonOk({ $ref: '#/components/schemas/Profile' }, 'Created'),
          400: { $ref: '#/components/responses/Error' },
        },
      },
    },

    '/api/users/{id}/role': {
      patch: {
        tags: ['Users'],
        summary: 'Ubah role user. Admin only.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: {
            type: 'object',
            required: ['role'],
            properties: { role: { type: 'string', enum: ['admin', 'petugas', 'warga'] } },
          } } },
        },
        responses: {
          200: jsonOk({ $ref: '#/components/schemas/Profile' }),
          400: { $ref: '#/components/responses/Error' },
          404: { $ref: '#/components/responses/Error' },
        },
      },
    },
  },

  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    responses: {
      Error: { description: 'Error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorEnvelope' } } } },
    },
    schemas: {
      ErrorEnvelope: {
        type: 'object',
        properties: {
          ok: { type: 'boolean', example: false },
          error: { type: 'object', properties: { code: { type: 'string', example: 'bad_request' }, message: { type: 'string', example: 'Parameter adm4 wajib diisi' } } },
        },
      },
      Asset: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          asset_code: { type: 'string', example: 'GD-PMG-07' },
          name: { type: 'string', example: 'Gardu Distribusi Pemogan 07' },
          asset_type: { type: 'string', example: 'gardu' },
          lat: { type: 'number', example: -8.7085 },
          lng: { type: 'number', example: 115.2 },
          adm4: { type: 'string', example: '51.71.01.2008' },
          unit: { type: 'string', example: 'UP3 Bali Selatan' },
          criticality: { type: 'string', example: 'tinggi' },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      NewReport: {
        type: 'object',
        required: ['photo_url'],
        properties: {
          photo_url: { type: 'string', example: 'https://.../foto.jpg' },
          source: { type: 'string', enum: enums.report_source, default: 'warga' },
          asset_id: { type: 'string', format: 'uuid', nullable: true },
          reporter_name: { type: 'string', nullable: true, example: 'Budi' },
          reporter_contact: { type: 'string', nullable: true, example: '08xx' },
          description: { type: 'string', nullable: true, example: 'Ada percikan di trafo' },
          lat: { type: 'number', nullable: true, example: -8.67 },
          lng: { type: 'number', nullable: true, example: 115.22 },
        },
      },
      Report: {
        allOf: [
          { $ref: '#/components/schemas/NewReport' },
          { type: 'object', properties: { id: { type: 'string', format: 'uuid' }, status: { type: 'string', enum: enums.report_status, example: 'baru' }, created_at: { type: 'string', format: 'date-time' } } },
        ],
      },
      Detection: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          report_id: { type: 'string', format: 'uuid' },
          defect: { type: 'string', enum: enums.defect },
          confidence: { type: 'number', example: 0.87 },
          severity: { type: 'number', example: 65 },
          bbox: { type: 'object', example: { x: 0.2, y: 0.3, w: 0.2, h: 0.2 } },
          model_version: { type: 'string', example: 'mock-v0' },
          verified: { type: 'boolean', example: false },
        },
      },
      MaximoCondition: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          asset_id: { type: 'string', format: 'uuid' },
          condition_score: { type: 'number', example: 68 },
          condition_grade: { type: 'string', enum: enums.condition_grade, example: 'sedang' },
          criticality: { type: 'string', example: 'tinggi' },
          last_inspection_date: { type: 'string', format: 'date' },
          next_maintenance_date: { type: 'string', format: 'date' },
          is_mock: { type: 'boolean', example: true },
          source: { type: 'string', example: 'dummy' },
        },
      },
      RiskScore: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          asset_id: { type: 'string', format: 'uuid' },
          score: { type: 'number', example: 44.4 },
          level: { type: 'string', enum: enums.risk_level, example: 'waspada' },
          severity_component: { type: 'number', example: 35.2 },
          weather_component: { type: 'number', example: 9.2 },
          density_component: { type: 'number', example: 5 },
          weather_status: { type: 'string', enum: enums.weather_status },
          maximo_condition_id: { type: 'string', format: 'uuid', nullable: true },
          computed_at: { type: 'string', format: 'date-time' },
        },
      },
      ScanRequest: {
        type: 'object',
        description: 'Kirim report_id ATAU photo_url (+field).',
        properties: {
          report_id: { type: 'string', format: 'uuid', description: 'Scan laporan yang sudah ada' },
          photo_url: { type: 'string', example: 'https://.../foto.jpg' },
          asset_id: { type: 'string', format: 'uuid', nullable: true },
          source: { type: 'string', enum: enums.report_source, default: 'warga' },
          description: { type: 'string', nullable: true },
          lat: { type: 'number', nullable: true },
          lng: { type: 'number', nullable: true },
        },
      },
      ScanResult: {
        type: 'object',
        properties: {
          report: { $ref: '#/components/schemas/Report' },
          detections: { type: 'array', items: { $ref: '#/components/schemas/Detection' } },
          risk_score: { oneOf: [{ $ref: '#/components/schemas/RiskScore' }, { type: 'null' }] },
        },
      },
      WeatherSlot: {
        type: 'object',
        properties: {
          adm4: { type: 'string' },
          t: { type: 'number', nullable: true, example: 29 },
          hu: { type: 'number', nullable: true, example: 80 },
          ws: { type: 'number', nullable: true, example: 12 },
          wd: { type: 'string', nullable: true, example: 'S' },
          weather_desc: { type: 'string', nullable: true, example: 'Hujan Ringan' },
          tcc: { type: 'number', nullable: true, example: 90 },
          analysis_date: { type: 'string', nullable: true },
          valid_from: { type: 'string' },
          valid_to: { type: 'string', nullable: true },
          status: { type: 'string', enum: enums.weather_status },
        },
      },
      WeatherFactors: {
        type: 'object',
        properties: {
          angin_max_kmh: { type: 'number', nullable: true, example: 18.5 },
          hujan: { type: 'boolean', example: true },
          kelembapan_avg: { type: 'number', nullable: true, example: 82 },
          suhu_avg: { type: 'number', nullable: true, example: 29.3 },
          slot_dipakai: { type: 'integer', example: 8 },
          horizon_jam: { type: 'integer', example: 24 },
        },
      },
      WeatherResult: {
        type: 'object',
        properties: {
          adm4: { type: 'string', example: '51.71.01.2008' },
          status: { type: 'string', enum: enums.weather_status, example: 'fresh' },
          fetched_at: { type: 'string', format: 'date-time', nullable: true },
          factors: { oneOf: [{ $ref: '#/components/schemas/WeatherFactors' }, { type: 'null' }] },
          forecast: { type: 'array', items: { $ref: '#/components/schemas/WeatherSlot' } },
        },
      },
      Recommendation: {
        type: 'object',
        properties: {
          defect: { type: 'string', enum: enums.defect },
          severity: { type: 'number', example: 82 },
          confidence: { type: 'number', example: 0.88 },
          count: { type: 'integer', example: 2 },
          action_text: { type: 'string', example: 'Penggantian/isolasi isolator SEGERA (<=24 jam).' },
          priority: { type: 'integer', example: 3, description: 'Makin tinggi makin mendesak (1-3)' },
          rule_id: { type: 'string', format: 'uuid' },
        },
      },
      RekomendasiResult: {
        type: 'object',
        properties: {
          asset: { $ref: '#/components/schemas/Asset' },
          window_days: { type: 'integer', example: 7 },
          detections_total: { type: 'integer', example: 3 },
          defects_found: { type: 'integer', example: 2 },
          recommendations: { type: 'array', items: { $ref: '#/components/schemas/Recommendation' } },
          persisted: { type: 'boolean', example: false },
          risk_score_id: { type: 'string', format: 'uuid', nullable: true },
          note: { type: 'string', nullable: true },
        },
      },
      DashboardSummary: {
        type: 'object',
        properties: {
          total_aset: { type: 'integer', example: 5 },
          by_level: {
            type: 'object',
            properties: {
              kritis: { type: 'integer', example: 1 },
              waspada: { type: 'integer', example: 2 },
              aman: { type: 'integer', example: 2 },
            },
          },
          aset_terkritis: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                asset_id: { type: 'string', format: 'uuid' },
                asset_code: { type: 'string', example: 'GD-PMG-07' },
                name: { type: 'string' },
                score: { type: 'number', example: 76.5 },
                level: { type: 'string', enum: enums.risk_level },
              },
            },
          },
          laporan: {
            type: 'object',
            properties: {
              total: { type: 'integer', example: 12 },
              baru: { type: 'integer', example: 4 },
              diproses: { type: 'integer', example: 3 },
              terverifikasi: { type: 'integer', example: 4 },
              ditolak: { type: 'integer', example: 1 },
            },
          },
          deteksi_7hari: { type: 'integer', example: 8 },
          generated_at: { type: 'string', format: 'date-time' },
        },
      },
      GeoJSONFeatureCollection: {
        type: 'object',
        properties: {
          type: { type: 'string', example: 'FeatureCollection' },
          features: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                type: { type: 'string', example: 'Feature' },
                geometry: {
                  type: 'object',
                  properties: {
                    type: { type: 'string', example: 'Point' },
                    coordinates: { type: 'array', items: { type: 'number' }, example: [115.2, -8.7085] },
                  },
                },
                properties: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', format: 'uuid' },
                    asset_code: { type: 'string', example: 'GD-PMG-07' },
                    name: { type: 'string' },
                    asset_type: { type: 'string' },
                    unit: { type: 'string' },
                    criticality: { type: 'string' },
                    adm4: { type: 'string' },
                    score: { type: 'number', nullable: true, example: 76.5 },
                    level: { type: 'string', enum: enums.risk_level, nullable: true },
                  },
                },
              },
            },
          },
        },
      },
      Profile: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          email: { type: 'string', example: 'petugas@grid.id' },
          role: { type: 'string', enum: ['admin', 'petugas', 'warga'], example: 'petugas' },
          full_name: { type: 'string', nullable: true, example: 'Petugas Lapangan' },
          phone: { type: 'string', nullable: true },
          unit: { type: 'string', nullable: true },
        },
      },
      SignUploadResult: {
        type: 'object',
        properties: {
          bucket: { type: 'string', example: 'report-photos' },
          path: { type: 'string', example: '<user_id>/1699999999-uuid.jpg' },
          token: { type: 'string', description: 'Token utk uploadToSignedUrl' },
          signed_url: { type: 'string' },
          public_url: { type: 'string', example: 'https://<proj>.supabase.co/storage/v1/object/public/report-photos/...' },
        },
      },
      DatasetExport: {
        type: 'object',
        properties: {
          classes: { type: 'array', items: { type: 'string' }, example: ['isolator_pecah', 'korosi', 'kabel_bermasalah', 'komponen_hilang'] },
          count_images: { type: 'integer', example: 42 },
          count_labels: { type: 'integer', example: 58 },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                image_url: { type: 'string' },
                labels: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      class_id: { type: 'integer', example: 1 },
                      class_name: { type: 'string', example: 'korosi' },
                      x_center: { type: 'number', example: 0.39 },
                      y_center: { type: 'number', example: 0.32 },
                      w: { type: 'number', example: 0.2 },
                      h: { type: 'number', example: 0.2 },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};