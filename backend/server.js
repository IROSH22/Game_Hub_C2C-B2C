const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dns = require('dns');

// Prevent IPv6 timeout delays on external HTTPS APIs (such as EmailJS) on Windows
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

dotenv.config();

const authRoutes = require('./routes/authRoutes');
const gameRoutes = require('./routes/gameRoutes');
const exchangeRoutes = require('./routes/exchangeRoutes');
const orderRoutes = require('./routes/orderRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const emailRoutes = require('./routes/emailRoutes');
const sellerRoutes = require('./routes/sellerRoutes');
const adminRoutes = require('./routes/adminRoutes');
const seedDatabase = require('./utils/seedData');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/gamehub';

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
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
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

// Database Connection Function with Caching for Serverless / Cloud
let isConnected = false;
const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState === 1) {
    return;
  }
  try {
    await mongoose.connect(MONGODB_URI);
    isConnected = true;
    console.log(`🚀 Connected to MongoDB at ${MONGODB_URI}`);
    await seedDatabase();
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
  }
};

// Middleware to ensure DB connection on serverless requests
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// Start Standalone Server if run directly
if (require.main === module) {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`🎮 Game Hub Backend API listening on http://localhost:${PORT}`);
    });
  });
}

module.exports = app;
