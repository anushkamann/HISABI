'use strict';

require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const morgan  = require('morgan');

const { testConnection } = require('./src/config/db');
const routes             = require('./src/routes/index');
const errorHandler       = require('./src/middleware/errorHandler');

const app  = express();
const PORT = process.env.PORT || 5000;

/* ──────────────────────────────────────────
   Global Middleware
────────────────────────────────────────── */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

/* ──────────────────────────────────────────
   Health Check
────────────────────────────────────────── */
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Hisabi API is running 🚀', timestamp: new Date().toISOString() });
});

/* ──────────────────────────────────────────
   API Routes
────────────────────────────────────────── */
app.use('/api', routes);

/* ──────────────────────────────────────────
   404 Handler
────────────────────────────────────────── */
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.originalUrl} not found.` });
});

/* ──────────────────────────────────────────
   Centralized Error Handler
────────────────────────────────────────── */
app.use(errorHandler);

/* ──────────────────────────────────────────
   Start Server
────────────────────────────────────────── */
(async () => {
  await testConnection();   // exits process if DB is unreachable
  app.listen(PORT, () => {
    console.log(`🚀  Hisabi API listening on http://localhost:${PORT}`);
    console.log(`📋  Health check → http://localhost:${PORT}/health`);
  });
})();

module.exports = app;
