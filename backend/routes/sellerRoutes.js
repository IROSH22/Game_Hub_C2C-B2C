const express = require('express');
const Order = require('../models/Order');
const GameListing = require('../models/GameListing');
const ExchangeRequest = require('../models/ExchangeRequest');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

// Seller analytics dashboard metrics
router.get('/analytics', authMiddleware, requireRole('seller', 'admin'), async (req, res) => {
  try {
    const sellerId = req.user._id;

    // Get all orders containing this seller's products
    const orders = await Order.find({ 'items.sellerId': sellerId });

    let totalRevenue = 0;
    let totalItemsSold = 0;
    const itemSalesMap = {};

    orders.forEach((ord) => {
      ord.items.forEach((it) => {
        if (it.sellerId.toString() === sellerId.toString()) {
          totalRevenue += it.price * it.quantity;
          totalItemsSold += it.quantity;
          itemSalesMap[it.title] = (itemSalesMap[it.title] || 0) + it.quantity;
        }
      });
    });

    const topGames = Object.keys(itemSalesMap)
      .map((title) => ({ title, sold: itemSalesMap[title] }))
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5);

    const activeListingsCount = await GameListing.countDocuments({ sellerId, status: 'Active' });
    const completedTradesCount = await ExchangeRequest.countDocuments({
      $or: [{ requesterId: sellerId }, { receiverId: sellerId }],
      status: 'Completed',
    });

    res.json({
      success: true,
      stats: {
        totalRevenue: Number(totalRevenue.toFixed(2)),
        totalOrders: orders.length,
        totalItemsSold,
        activeListingsCount,
        completedTradesCount,
        topGames,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch seller analytics.' });
  }
});

// Seller inventory management
router.get('/inventory', authMiddleware, requireRole('seller', 'admin'), async (req, res) => {
  try {
    const listings = await GameListing.find({ sellerId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, listings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch inventory.' });
  }
});

// Update stock or price quickly
router.patch('/inventory/:id', authMiddleware, requireRole('seller', 'admin'), async (req, res) => {
  try {
    const { stock, price, status } = req.body;
    const game = await GameListing.findOne({ _id: req.params.id, sellerId: req.user._id });

    if (!game) {
      return res.status(404).json({ success: false, message: 'Game listing not found or not owned by you.' });
    }

    if (stock !== undefined) {
      game.stock = Number(stock);
      if (game.stock === 0) game.status = 'Sold';
      else if (game.status === 'Sold' && game.stock > 0) game.status = 'Active';
    }

    if (price !== undefined) {
      game.price = Number(price);
    }

    if (status !== undefined) {
      game.status = status;
    }

    await game.save();
    res.json({ success: true, message: 'Inventory item updated!', game });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update inventory item.' });
  }
});

module.exports = router;
