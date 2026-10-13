const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const GameListing = require('../models/GameListing');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'gamehub_super_secret_jwt_key_2026_it32053';

// Generate Token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, phone, address, city, shopName, shopDescription } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role && ['customer', 'seller', 'admin'].includes(role) ? role : 'customer',
      phone: phone || '',
      address: address || '',
      city: city || '',
      shopName: shopName || (role === 'seller' ? `${name}'s Game Store` : ''),
      shopDescription: shopDescription || '',
      profileImage: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
      trustScore: 98,
      successfulTrades: 0,
    });

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully!',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        city: user.city,
        profileImage: user.profileImage,
        shopName: user.shopName,
        trustScore: user.trustScore,
        successfulTrades: user.successfulTrades,
        wishlist: user.wishlist,
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (user.isBanned) {
      return res.status(403).json({ success: false, message: 'This account has been banned. Please contact admin.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        city: user.city,
        profileImage: user.profileImage,
        shopName: user.shopName,
        trustScore: user.trustScore,
        successfulTrades: user.successfulTrades,
        wishlist: user.wishlist,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
});

// Demo Instant Login (Convenient for lecturers & examiners)
router.post('/demo-login/:role', async (req, res) => {
  try {
    const { role } = req.params;
    let email = '';
    if (role === 'admin') email = 'admin@gamehub.com';
    else if (role === 'seller') email = 'seller@gamehub.com';
    else email = 'gamer@gamehub.com';

    let user = await User.findOne({ email });
    if (!user) {
      // Find any user with that role
      user = await User.findOne({ role });
    }

    if (!user) {
      return res.status(404).json({ success: false, message: `Demo ${role} user not found. Please run seed.` });
    }

    const token = generateToken(user);
    res.json({
      success: true,
      message: `Logged in as Demo ${user.role.toUpperCase()} (${user.name})`,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        city: user.city,
        profileImage: user.profileImage,
        shopName: user.shopName,
        trustScore: user.trustScore,
        successfulTrades: user.successfulTrades,
        wishlist: user.wishlist,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Demo login failed.' });
  }
});

// Get current profile
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password').populate('wishlist');
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch user profile.' });
  }
});

// Update Profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name, phone, address, city, shopName, shopDescription, profileImage } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (city !== undefined) user.city = city;
    if (shopName !== undefined) user.shopName = shopName;
    if (shopDescription !== undefined) user.shopDescription = shopDescription;
    if (profileImage) user.profileImage = profileImage;

    await user.save();
    res.json({ success: true, message: 'Profile updated successfully!', user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
});

// Toggle Wishlist
router.post('/toggle-wishlist/:gameId', authMiddleware, async (req, res) => {
  try {
    const { gameId } = req.params;
    const user = await User.findById(req.user._id);

    const existsIndex = user.wishlist.findIndex((id) => id.toString() === gameId);
    let isWishlisted = false;

    if (existsIndex > -1) {
      user.wishlist.splice(existsIndex, 1);
      isWishlisted = false;
    } else {
      user.wishlist.push(gameId);
      isWishlisted = true;
    }

    await user.save();
    res.json({
      success: true,
      message: isWishlisted ? 'Game added to wishlist!' : 'Game removed from wishlist!',
      isWishlisted,
      wishlistCount: user.wishlist.length,
      wishlist: user.wishlist,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update wishlist.' });
  }
});

// Get Wishlist with Smart Exchange Matching
router.get('/wishlist-matches', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    const wishlistIds = user.wishlist.map((item) => item._id);

    // Find other users' exchange listings that match titles or categories in the user's wishlist
    const wishlistTitles = user.wishlist.map((w) => w.title);

    const matchingExchangeListings = await GameListing.find({
      exchangeable: true,
      status: 'Active',
      sellerId: { $ne: user._id },
      $or: [
        { _id: { $in: wishlistIds } },
        { title: { $in: wishlistTitles } },
      ],
    }).populate('sellerId', 'name email trustScore successfulTrades profileImage');

    res.json({
      success: true,
      wishlist: user.wishlist,
      matches: matchingExchangeListings,
      matchCount: matchingExchangeListings.length,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to calculate wishlist matches.' });
  }
});

module.exports = router;
