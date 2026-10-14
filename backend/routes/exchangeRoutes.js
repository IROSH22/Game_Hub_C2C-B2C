const express = require('express');
const ExchangeRequest = require('../models/ExchangeRequest');
const GameListing = require('../models/GameListing');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Review = require('../models/Review');
const { authMiddleware, optionalAuth } = require('../middleware/auth');
const { sendEmailNotification } = require('../utils/mailer');

const router = express.Router();

// 1. Get all public exchange listings (C2C games available to barter)
router.get('/', optionalAuth, async (req, res) => {
  try {
    if (req.user?.role === 'seller') {
      return res.json({ success: true, count: 0, listings: [] });
    }

    const { platform, genre, condition, search } = req.query;

    const query = {
      exchangeable: true,
      status: 'Active',
      isApproved: true,
    };

    if (platform && platform !== 'All') query.platform = platform;
    if (genre && genre !== 'All') query.genre = genre;
    if (condition && condition !== 'All') query.condition = condition;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { wantedGames: { $regex: search, $options: 'i' } },
      ];
    }

    const exchangeListings = await GameListing.find(query)
      .populate('sellerId', 'name email trustScore successfulTrades profileImage city')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: exchangeListings.length,
      listings: exchangeListings,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve exchange hub listings.' });
  }
});

// 2. Get my own listed games for exchange
router.get('/my-listings', authMiddleware, async (req, res) => {
  try {
    if (req.user.role === 'seller') {
      return res.json({ success: true, listings: [] });
    }

    const listings = await GameListing.find({
      sellerId: req.user._id,
      exchangeable: true,
    }).sort({ createdAt: -1 });

    res.json({ success: true, listings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch your exchange listings.' });
  }
});

// 3. Get my exchange requests (Incoming & Outgoing)
router.get('/my-requests', authMiddleware, async (req, res) => {
  try {
    const incoming = await ExchangeRequest.find({ receiverId: req.user._id })
      .populate('requesterId', 'name email trustScore successfulTrades profileImage')
      .populate('offeredListingId')
      .populate('wantedListingId')
      .sort({ createdAt: -1 });

    const outgoing = await ExchangeRequest.find({ requesterId: req.user._id })
      .populate('receiverId', 'name email trustScore successfulTrades profileImage')
      .populate('offeredListingId')
      .populate('wantedListingId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      incoming,
      outgoing,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch trade requests.' });
  }
});

// 4. Send an exchange request (Offer Game A for Game B)
router.post('/request', authMiddleware, async (req, res) => {
  try {
    if (req.user.role === 'seller') {
      return res.status(403).json({
        success: false,
        message: 'Official Sellers can only sell in the Store Catalog. Game barter/exchange is exclusive to regular gamer accounts.',
      });
    }

    const { wantedListingId, offeredListingId, message } = req.body;

    if (!wantedListingId || !offeredListingId) {
      return res.status(400).json({
        success: false,
        message: 'Please choose both the game you want and the game you are offering.',
      });
    }

    const wantedGame = await GameListing.findById(wantedListingId).populate('sellerId');
    if (!wantedGame || !wantedGame.exchangeable) {
      return res.status(404).json({ success: false, message: 'The wanted game is not available for exchange.' });
    }

    if (wantedGame.sellerId._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot trade with your own listing!' });
    }

    const offeredGame = await GameListing.findById(offeredListingId);
    if (!offeredGame || offeredGame.sellerId.toString() !== req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Invalid offered game or not owned by you.' });
    }

    // Check for existing pending request between these two listings
    const existing = await ExchangeRequest.findOne({
      requesterId: req.user._id,
      wantedListingId,
      offeredListingId,
      status: 'Pending',
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'You already have a pending trade request for this game.' });
    }

    const newRequest = await ExchangeRequest.create({
      requesterId: req.user._id,
      receiverId: wantedGame.sellerId._id,
      offeredListingId,
      wantedListingId,
      message: message || `Hey! Would you like to trade your ${wantedGame.title} for my ${offeredGame.title}?`,
      status: 'Pending',
      requesterAddress: req.user.address ? `${req.user.address}, ${req.user.city}` : 'Contact for exchange address',
      receiverAddress: wantedGame.sellerId.address ? `${wantedGame.sellerId.address}, ${wantedGame.sellerId.city}` : 'Contact for exchange address',
    });

    // Create in-app notification
    await Notification.create({
      userId: wantedGame.sellerId._id,
      title: '🔄 New Trade Offer!',
      message: `${req.user.name} offered "${offeredGame.title}" for your "${wantedGame.title}".`,
      type: 'exchange_request',
      link: '/exchange-dashboard',
    });

    // Send email notification to receiver
    await sendEmailNotification({
      to: wantedGame.sellerId.email,
      toName: wantedGame.sellerId.name,
      subject: `🔄 Game Hub Trade Offer: ${offeredGame.title} for ${wantedGame.title}`,
      templateType: 'exchange_request',
      data: {
        requester: req.user,
        receiver: wantedGame.sellerId,
        offeredGame,
        wantedGame,
        message,
      },
    });

    const populated = await ExchangeRequest.findById(newRequest._id)
      .populate('receiverId', 'name email trustScore')
      .populate('offeredListingId')
      .populate('wantedListingId');

    res.status(201).json({
      success: true,
      message: 'Exchange request sent successfully! The owner will be notified.',
      request: populated,
    });
  } catch (err) {
    console.error('Exchange request error:', err);
    res.status(500).json({ success: false, message: 'Failed to submit exchange request.' });
  }
});

// 5. Respond to exchange request (Accept, Reject, Counter-offer)
router.put('/:id/respond', authMiddleware, async (req, res) => {
  try {
    const { action, counterOfferMessage } = req.body;
    const trade = await ExchangeRequest.findById(req.params.id)
      .populate('requesterId')
      .populate('receiverId')
      .populate('offeredListingId')
      .populate('wantedListingId');

    if (!trade) {
      return res.status(404).json({ success: false, message: 'Trade request not found.' });
    }

    if (trade.receiverId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the recipient can respond to this request.' });
    }

    if (action === 'accept') {
      trade.status = 'Accepted';

      // Auto-post trade agreement welcome message in live chat
      if (!trade.messages) trade.messages = [];
      trade.messages.push({
        senderId: req.user._id,
        senderName: req.user.name,
        text: `🤝 I have accepted your trade proposal! We can now coordinate our shipping addresses, courier details, and item condition right here in this live trade chat.`,
        createdAt: new Date(),
      });

      // Notify requester
      await Notification.create({
        userId: trade.requesterId._id,
        title: '🎉 Trade Offer Accepted!',
        message: `${req.user.name} accepted your trade for "${trade.wantedListingId.title}"! Prepare your shipment.`,
        type: 'exchange_status',
        link: '/exchange-dashboard',
      });

      // Send email to requester
      await sendEmailNotification({
        to: trade.requesterId.email,
        toName: trade.requesterId.name,
        subject: `🎉 Trade Accepted: ${trade.wantedListingId.title}`,
        templateType: 'exchange_accepted',
        data: {
          partnerName: req.user.name,
          gameTitle: trade.wantedListingId.title,
        },
      });
    } else if (action === 'reject') {
      trade.status = 'Rejected';

      await Notification.create({
        userId: trade.requesterId._id,
        title: 'Trade Request Declined',
        message: `${req.user.name} declined the trade offer for "${trade.wantedListingId.title}".`,
        type: 'exchange_status',
        link: '/exchange-dashboard',
      });
    } else if (action === 'counter-offer') {
      trade.status = 'Counter-offer';
      trade.counterOfferMessage = counterOfferMessage || 'I would love another game or cash addition.';

      await Notification.create({
        userId: trade.requesterId._id,
        title: '💬 Counter-Offer Received',
        message: `${req.user.name} sent a counter-offer for "${trade.wantedListingId.title}": "${trade.counterOfferMessage}"`,
        type: 'exchange_status',
        link: '/exchange-dashboard',
      });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid response action.' });
    }

    await trade.save();
    res.json({
      success: true,
      message: `Trade request successfully marked as ${trade.status}!`,
      trade,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update trade response.' });
  }
});

// 6. Update Delivery & Completion Status (Pending -> Accepted -> Shipped -> Delivered -> Completed)
router.put('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status, trackingNumber } = req.body;
    const trade = await ExchangeRequest.findById(req.params.id)
      .populate('requesterId')
      .populate('receiverId')
      .populate('offeredListingId')
      .populate('wantedListingId');

    if (!trade) {
      return res.status(404).json({ success: false, message: 'Trade not found.' });
    }

    const isRequester = trade.requesterId._id.toString() === req.user._id.toString();
    const isReceiver = trade.receiverId._id.toString() === req.user._id.toString();

    if (!isRequester && !isReceiver && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    if (trackingNumber) {
      if (isRequester) trade.trackingNumberRequester = trackingNumber;
      if (isReceiver) trade.trackingNumberReceiver = trackingNumber;
    }

    if (status) {
      trade.status = status;

      if (status === 'Completed') {
        // Increment successful trades count for both gamers!
        await User.findByIdAndUpdate(trade.requesterId._id, { $inc: { successfulTrades: 1 } });
        await User.findByIdAndUpdate(trade.receiverId._id, { $inc: { successfulTrades: 1 } });

        // Mark listings as traded/sold
        await GameListing.findByIdAndUpdate(trade.offeredListingId._id, { status: 'Sold' });
        await GameListing.findByIdAndUpdate(trade.wantedListingId._id, { status: 'Sold' });
      }

      // Notify the other party
      const notifyUser = isRequester ? trade.receiverId : trade.requesterId;
      await Notification.create({
        userId: notifyUser._id,
        title: `Trade Status: ${status}`,
        message: `Your exchange with ${req.user.name} is now ${status}!`,
        type: 'exchange_status',
        link: '/exchange-dashboard',
      });

      // Send email to the other party
      try {
        if (notifyUser.email) {
          await sendEmailNotification({
            to: notifyUser.email,
            toName: notifyUser.name,
            subject: `🔄 Trade Update: ${status} - Game Hub`,
            templateType: 'exchange_status_update',
            data: {
              status,
              partnerName: req.user.name,
              gameTitle: isRequester ? trade.wantedListingId.title : trade.offeredListingId.title,
              trackingNumber: trackingNumber || '',
            },
          });
        }
      } catch (mailErr) {
        console.warn('Exchange status email error:', mailErr.message);
      }
    }

    await trade.save();
    res.json({ success: true, message: `Trade status updated to ${trade.status}! Notification email sent.`, trade });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update exchange status.' });
  }
});

// 7. Rate & Review Trade Partner (Updates Trust Score)
router.post('/:id/review', authMiddleware, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const trade = await ExchangeRequest.findById(req.params.id);

    if (!trade || trade.status !== 'Completed') {
      return res.status(400).json({ success: false, message: 'You can only review after the trade is Completed.' });
    }

    const isRequester = trade.requesterId.toString() === req.user._id.toString();
    const isReceiver = trade.receiverId.toString() === req.user._id.toString();

    if (!isRequester && !isReceiver) {
      return res.status(403).json({ success: false, message: 'Unauthorized to review this trade.' });
    }

    const revieweeId = isRequester ? trade.receiverId : trade.requesterId;

    // Check if already reviewed
    const existing = await Review.findOne({ exchangeId: trade._id, reviewerId: req.user._id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this trade!' });
    }

    const newReview = await Review.create({
      reviewerId: req.user._id,
      revieweeId,
      exchangeId: trade._id,
      rating: Number(rating),
      comment,
      type: 'exchange',
    });

    if (isRequester) trade.isReviewedByRequester = true;
    if (isReceiver) trade.isReviewedByReceiver = true;
    await trade.save();

    // Recalculate target user's trust score
    const allUserReviews = await Review.find({ revieweeId });
    const avgScore = allUserReviews.reduce((sum, r) => sum + r.rating, 0) / allUserReviews.length;
    // Calculate Trust percentage: (avgScore / 5) * 100
    const trustPercent = Math.min(100, Math.round((avgScore / 5) * 100));

    await User.findByIdAndUpdate(revieweeId, {
      trustScore: trustPercent,
      totalRatings: allUserReviews.length,
      averageRating: Number(avgScore.toFixed(1)),
    });

    await Notification.create({
      userId: revieweeId,
      title: '🌟 New Trade Review!',
      message: `${req.user.name} gave you a ${rating}-star rating! Your Trust Score is now ${trustPercent}%.`,
      type: 'review_received',
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully! Thank you for keeping Game Hub safe.',
      review: newReview,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to submit review.' });
  }
});

// 8. Get Trade Chat Messages
router.get('/:id/messages', authMiddleware, async (req, res) => {
  try {
    const trade = await ExchangeRequest.findById(req.params.id)
      .populate('requesterId', 'name profileImage')
      .populate('receiverId', 'name profileImage');

    if (!trade) {
      return res.status(404).json({ success: false, message: 'Trade not found.' });
    }

    const requesterIdStr = (trade.requesterId?._id || trade.requesterId)?.toString();
    const receiverIdStr = (trade.receiverId?._id || trade.receiverId)?.toString();
    const currentUserIdStr = req.user._id.toString();

    const isRequester = requesterIdStr === currentUserIdStr;
    const isReceiver = receiverIdStr === currentUserIdStr;

    if (!isRequester && !isReceiver && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this trade chat.' });
    }

    res.json({
      success: true,
      messages: trade.messages || [],
      tradeStatus: trade.status,
    });
  } catch (err) {
    console.error('Fetch messages error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch trade messages: ' + err.message });
  }
});

// 9. Send a Trade Chat Message
router.post('/:id/message', authMiddleware, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Message cannot be empty.' });
    }

    const trade = await ExchangeRequest.findById(req.params.id)
      .populate('requesterId', 'name email profileImage')
      .populate('receiverId', 'name email profileImage');

    if (!trade) {
      return res.status(404).json({ success: false, message: 'Trade not found.' });
    }

    const requesterIdStr = (trade.requesterId?._id || trade.requesterId)?.toString();
    const receiverIdStr = (trade.receiverId?._id || trade.receiverId)?.toString();
    const currentUserIdStr = req.user._id.toString();

    const isRequester = requesterIdStr === currentUserIdStr;
    const isReceiver = receiverIdStr === currentUserIdStr;

    if (!isRequester && !isReceiver && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to send messages in this trade.' });
    }

    const newMsg = {
      senderId: req.user._id,
      senderName: req.user.name,
      text: text.trim(),
      createdAt: new Date(),
    };

    if (!trade.messages) trade.messages = [];
    trade.messages.push(newMsg);
    await trade.save();

    // In-app Notification for the other party (safe lookup)
    const recipientId = isRequester ? (trade.receiverId?._id || trade.receiverId) : (trade.requesterId?._id || trade.requesterId);
    if (recipientId) {
      try {
        await Notification.create({
          userId: recipientId,
          title: `💬 New Message from ${req.user.name}`,
          message: `${text.trim().slice(0, 100)}${text.length > 100 ? '...' : ''}`,
          type: 'trade_chat',
          link: '/exchange-dashboard',
        });
      } catch (notifErr) {
        console.warn('Chat notification create warning:', notifErr.message);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Message sent successfully!',
      newMessage: newMsg,
      messages: trade.messages,
    });
  } catch (err) {
    console.error('Send trade message error:', err);
    res.status(500).json({ success: false, message: 'Failed to send message: ' + err.message });
  }
});

module.exports = router;
