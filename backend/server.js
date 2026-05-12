const express     = require('express');
const cors        = require('cors');
const mongoose    = require('mongoose');
const rateLimit   = require('express-rate-limit');
const helmet      = require('helmet');
const compression = require('compression');
const morgan      = require('morgan');
require('dotenv').config();

/* ---- Route imports ---- */
const authRoutes   = require('./routes/auth');
const bucketRoutes = require('./routes/buckets');
const taskRoutes   = require('./routes/tasks');
const goalRoutes   = require('./routes/goals');
const noteRoutes   = require('./routes/notes');

const app = express();

/* ================================================
   MIDDLEWARE
   ================================================ */

const isProduction = process.env.NODE_ENV === 'production';

/* Security headers */
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

/* Gzip */
app.use(compression());

/* Logging */
if (!isProduction) {
  app.use(morgan('dev'));
}

/* CORS */
const allowedOrigins = (process.env.CLIENT_URL || '*')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: allowedOrigins.length === 1 && allowedOrigins[0] === '*' ? '*' : allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
}));

/* JSON body parser */
app.use(express.json({ limit: '1mb' }));

/* Global rate limiter — 100 req / 15 min per IP */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests. Please try again later.' }
});
app.use('/api', limiter);

/* ================================================
   ROUTES
   ================================================ */
app.use('/api/auth',    authRoutes);
app.use('/api/buckets', bucketRoutes);
app.use('/api',         taskRoutes);
app.use('/api/goals',   goalRoutes);
app.use('/api/notes',   noteRoutes);

/* Health check */
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

/* 404 handler */
app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

/* Global error handler */
app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error.' });
});

/* ================================================
   DATABASE + SERVER START
   ================================================ */
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅  MongoDB connected');
    app.listen(PORT, () => {
      console.log(`🚀  Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌  DB connection failed:', err.message);
    process.exit(1);
  });
