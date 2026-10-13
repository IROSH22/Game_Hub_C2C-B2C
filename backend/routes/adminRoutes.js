const express = require('express');
const User = require('../models/User');
const GameListing = require('../models/GameListing');
const Order = require('../models/Order');
const ExchangeRequest = require('../models/ExchangeRequest');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

// Admin Overview
router.get('/overview', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalGames = await GameListing.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalExchanges = await ExchangeRequest.countDocuments();

    const orders = await Order.find({ paymentStatus: 'Paid' });
    const totalPlatformRevenue = orders.reduce((sum, ord) => sum + ord.totalAmount, 0);

    const pendingExchanges = await ExchangeRequest.countDocuments({ status: 'Pending' });
    const completedExchanges = await ExchangeRequest.countDocuments({ status: 'Completed' });

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalGames,
        totalOrders,
        totalExchanges,
        totalPlatformRevenue: Number(totalPlatformRevenue.toFixed(2)),
        pendingExchanges,
        completedExchanges,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve admin overview.' });
  }
});

// Admin User Management
router.get('/users', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch users.' });
  }
});

// Toggle User Ban
router.patch('/users/:id/toggle-ban', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    user.isBanned = !user.isBanned;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.name} is now ${user.isBanned ? 'Banned' : 'Active'}.`,
      user,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to toggle ban.' });
  }
});

// Admin All Listings Management
router.get('/games', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const games = await GameListing.find()
      .populate('sellerId', 'name email role shopName')
      .sort({ createdAt: -1 });
    res.json({ success: true, games });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch all games.' });
  }
});

// Admin Toggle Feature / Approval
router.patch('/games/:id/toggle-featured', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const game = await GameListing.findById(req.params.id);
    if (!game) return res.status(404).json({ success: false, message: 'Game not found.' });

    game.isFeatured = !game.isFeatured;
    await game.save();

    res.json({ success: true, message: `Game featured status updated.`, game });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update feature status.' });
  }
});

// Admin All Orders
router.get('/orders', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('buyerId', 'name email phone')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch all orders.' });
  }
});

// Admin All Exchanges
router.get('/exchanges', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const exchanges = await ExchangeRequest.find()
      .populate('requesterId', 'name email trustScore')
      .populate('receiverId', 'name email trustScore')
      .populate('offeredListingId')
      .populate('wantedListingId')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: exchanges.length, exchanges });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch all exchanges.' });
  }
});

module.exports = router;
