const express = require('express');
const cors = require('cors');
const env = require('./config/env');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const swaggerUi = require('swagger-ui-express');
const openapi = require('./docs/openapi');
const { requireAuth, requireRole } = require('./middleware/auth');

const app = express();

app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json({ limit: '2mb' }));

// Docs (publik)
app.get('/api/openapi.json', (req, res) => res.json(openapi));
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openapi, { customSiteTitle: 'GRID.ID API Docs' }));

// Publik (tanpa login)
app.use('/api/health', require('./routes/health'));
app.use('/api/cuaca', require('./routes/cuaca'));

// Perlu login (semua role)
app.use('/api/me', requireAuth, require('./routes/me'));
app.use('/api/assets', requireAuth, require('./routes/assets'));
app.use('/api/reports', requireAuth, require('./routes/reports'));
app.use('/api/scan', requireAuth, require('./routes/scan'));
app.use('/api/uploads', requireAuth, require('./routes/uploads'));

// Admin + Petugas saja
app.use('/api/dashboard', requireAuth, requireRole('admin', 'petugas'), require('./routes/dashboard'));
app.use('/api/prioritas', requireAuth, requireRole('admin', 'petugas'), require('./routes/prioritas'));
app.use('/api/rekomendasi', requireAuth, requireRole('admin', 'petugas'), require('./routes/rekomendasi'));

// 404 + error handler (harus paling bawah)
app.use(notFound);
app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`GRID.ID backend jalan di http://localhost:${env.PORT}`);
  console.log(`Coba: http://localhost:${env.PORT}/api/health`);
  console.log(`Docs: http://localhost:${env.PORT}/api/docs`);
});