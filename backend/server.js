const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const dns = require('dns');

// Prevent IPv6 timeout delays on external HTTPS APIs (such as EmailJS) on Windows
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '.env') });

const { isSupabaseLive, SUPABASE_URL } = require('./utils/supabaseClient');
const seedSupabaseData = require('./utils/supabaseSeed');

const authRoutes = require('./routes/authRoutes');
const gameRoutes = require('./routes/gameRoutes');
const exchangeRoutes = require('./routes/exchangeRoutes');
const orderRoutes = require('./routes/orderRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const emailRoutes = require('./routes/emailRoutes');
const sellerRoutes = require('./routes/sellerRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/exchanges', exchangeRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/admin', adminRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    appName: 'Game Hub API',
    module: 'IT32053 - E-Commerce',
    database: isSupabaseLive() ? 'connected (Supabase Cloud PostgreSQL)' : 'disconnected',
    databaseUrl: SUPABASE_URL,
    timestamp: new Date().toISOString(),
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('API Error:', err.stack || err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error occurred.',
  });
});

// Database Synchronization with Caching
let isSeeded = false;
const initDB = async () => {
  if (isSeeded) return;
  try {
    console.log(`🚀 Supabase Cloud Database active at ${SUPABASE_URL}`);
    await seedSupabaseData();
    isSeeded = true;
  } catch (err) {
    console.error('❌ Supabase Init Error:', err.message);
  }
};

// Middleware to ensure DB is initialized on serverless requests
app.use(async (req, res, next) => {
  await initDB();
  next();
});

// Start Standalone Server if run directly
if (require.main === module) {
  initDB().then(() => {
    app.listen(PORT, () => {
      console.log(`🎮 Game Hub Backend API listening on http://localhost:${PORT}`);
    });
  });
}

module.exports = app;
