const express = require('express');
const GameListing = require('../models/GameListing');
const Review = require('../models/Review');
const Notification = require('../models/Notification');
const { authMiddleware, optionalAuth } = require('../middleware/auth');
const { sendEmailNotification } = require('../utils/mailer');

const router = express.Router();

// Get games with dynamic filters & search
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      search,
      platform,
      genre,
      condition,
      exchangeable,
      listingType,
      minPrice,
      maxPrice,
      sort,
      sellerId,
      featured,
      limit = 50,
      page = 1,
    } = req.query;

    const query = { status: 'Active', isApproved: true };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { genre: { $regex: search, $options: 'i' } },
      ];
    }

    if (platform && platform !== 'All') {
      query.platform = platform;
    }

    if (genre && genre !== 'All') {
      query.genre = genre;
    }

    if (condition && condition !== 'All') {
      query.condition = condition;
    }

    // Sellers must never see pure barter/trade listings
    if (req.user?.role === 'seller') {
      query.price = { $gt: 0 };
    } else if (listingType === 'buy') {
      query.price = { $gt: 0 };
    } else if (listingType === 'trade') {
      query.exchangeable = true;
    } else if (exchangeable !== undefined && exchangeable !== '' && exchangeable !== 'all') {
      query.exchangeable = exchangeable === 'true';
    }

    if (minPrice || maxPrice) {
      query.price = query.price || {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (sellerId) {
      query.sellerId = sellerId;
    }

    if (featured === 'true') {
      query.isFeatured = true;
    }

    // Sorting
    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    if (sort === 'price_desc') sortOption = { price: -1 };
    if (sort === 'rating') sortOption = { rating: -1 };
    if (sort === 'title') sortOption = { title: 1 };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await GameListing.countDocuments(query);
    const games = await GameListing.find(query)
      .populate('sellerId', 'name email role shopName trustScore successfulTrades profileImage')
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      games,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    console.error('Fetch games error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve games catalog.' });
  }
});

// Meta stats (Platforms, Genres, Counts)
router.get('/meta/categories', async (req, res) => {
  try {
    const platforms = ['PS5', 'Xbox Series X', 'PC', 'Nintendo Switch'];
    const genres = ['Action', 'RPG', 'Adventure', 'Sports', 'Shooter', 'Open World', 'Racing', 'Horror', 'Fighting', 'Strategy'];
    const totalExchangeable = await GameListing.countDocuments({ exchangeable: true, status: 'Active' });
    const totalStoreGames = await GameListing.countDocuments({ exchangeable: false, status: 'Active' });

    res.json({
      success: true,
      platforms,
      genres,
      totalExchangeable,
      totalStoreGames,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch categories.' });
  }
});

// Get single game details
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const game = await GameListing.findById(req.params.id).populate(
      'sellerId',
      'name email role shopName shopDescription trustScore successfulTrades profileImage city'
    );

    if (!game) {
      return res.status(404).json({ success: false, message: 'Game listing not found.' });
    }

    // Get reviews for this game
    const reviews = await Review.find({ listingId: game._id })
      .populate('reviewerId', 'name profileImage')
      .sort({ createdAt: -1 });

    // Similar games in same genre/platform
    const similarGames = await GameListing.find({
      _id: { $ne: game._id },
      $or: [{ genre: game.genre }, { platform: game.platform }],
      status: 'Active',
    })
      .limit(4)
      .populate('sellerId', 'name role trustScore');

    res.json({
      success: true,
      game,
      reviews,
      similarGames,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load game details.' });
  }
});

// Add new listing (Seller or C2C user)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      title,
      description,
      platform,
      genre,
      condition,
      price,
      stock,
      exchangeable,
      wantedGames,
      imageUrl,
      screenshots,
    } = req.body;

    const isExchange = Boolean(exchangeable);
    const parsedPrice = isExchange ? Number(price || 0) : Number(price);

    if (!title || !platform || !genre || (!isExchange && (price === undefined || isNaN(parsedPrice) || parsedPrice < 0))) {
      return res.status(400).json({ success: false, message: 'Title, platform, genre, and price are required for store sales.' });
    }

    // Role restriction: Sellers can only sell in the store catalog, not barter/exchange
    if (req.user.role === 'seller' && isExchange) {
      return res.status(403).json({
        success: false,
        message: 'Official Sellers can only list games for retail sale in the Store Catalog. Game barter/exchange is exclusive to regular gamer accounts.',
      });
    }

    const defaultImg =
      imageUrl ||
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80';

    const newListing = await GameListing.create({
      sellerId: req.user._id,
      title,
      description: description || `Original ${title} for ${platform}. Tested and fully working.`,
      platform,
      genre,
      condition: condition || (req.user.role === 'seller' ? 'Brand New' : 'Like New'),
      isNewGame: condition === 'Brand New',
      price: parsedPrice,
      originalPrice: parsedPrice > 0 ? parsedPrice * 1.15 : 0,
      stock: stock !== undefined ? Number(stock) : 1,
      exchangeable: req.user.role === 'seller' ? false : Boolean(exchangeable),
      wantedGames: req.user.role === 'seller' ? '' : (wantedGames || ''),
      imageUrl: defaultImg,
      screenshots: Array.isArray(screenshots) ? screenshots : [defaultImg],
      status: 'Active',
      isApproved: true,
      rating: 5.0,
      reviewsCount: 0,
    });

    const populated = await GameListing.findById(newListing._id).populate(
      'sellerId',
      'name role shopName trustScore profileImage'
    );

    // Send Real / Automated Email Notification to User/Seller
    try {
      await sendEmailNotification({
        to: req.user.email,
        toName: req.user.name,
        subject: `🎉 Game Listed Successfully: ${newListing.title} (${newListing.platform}) - Game Hub`,
        templateType: 'item_listed',
        data: {
          game: newListing,
          user: req.user,
        },
      });

      // In-App Notification
      await Notification.create({
        userId: req.user._id,
        title: '🎮 New Game Listed!',
        message: `Your game "${newListing.title}" (${newListing.platform}) is now active on Game Hub!`,
        type: 'listing',
        link: newListing.exchangeable ? '/my-exchanges' : '/catalog-section',
      });
    } catch (mailErr) {
      console.warn('Mail notification non-blocking error:', mailErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Game listing added successfully! Confirmation sent to your email.',
      game: populated,
    });
  } catch (err) {
    console.error('Add game error:', err);
    res.status(500).json({ success: false, message: 'Failed to add game listing.' });
  }
});

// Update listing (Seller/Owner)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const game = await GameListing.findById(req.params.id);
    if (!game) {
      return res.status(404).json({ success: false, message: 'Listing not found.' });
    }

    // Only owner or admin can edit
    if (game.sellerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to edit this listing.' });
    }

    const updates = req.body;
    Object.keys(updates).forEach((key) => {
      if (key !== '_id' && key !== 'sellerId') {
        game[key] = updates[key];
      }
    });

    await game.save();
    res.json({ success: true, message: 'Listing updated successfully!', game });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update listing.' });
  }
});

// Delete listing
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const game = await GameListing.findById(req.params.id);
    if (!game) {
      return res.status(404).json({ success: false, message: 'Listing not found.' });
    }

    if (game.sellerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this listing.' });
    }

    await GameListing.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Listing removed successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete listing.' });
  }
});

module.exports = router;
