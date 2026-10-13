const mongoose = require('mongoose');

const exchangeRequestSchema = new mongoose.Schema(
  {
    requesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    offeredListingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GameListing',
      required: true,
    },
    wantedListingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GameListing',
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Rejected', 'Counter-offer', 'Shipped', 'Delivered', 'Completed', 'Cancelled'],
      default: 'Pending',
    },
    message: {
      type: String,
      default: '',
    },
    counterOfferMessage: {
      type: String,
      default: '',
    },
    trackingNumberRequester: {
      type: String,
      default: '',
    },
    trackingNumberReceiver: {
      type: String,
      default: '',
    },
    deliveryStatusRequester: {
      type: String,
      enum: ['Preparing', 'Shipped', 'Delivered'],
      default: 'Preparing',
    },
    deliveryStatusReceiver: {
      type: String,
      enum: ['Preparing', 'Shipped', 'Delivered'],
      default: 'Preparing',
    },
    requesterAddress: {
      type: String,
      default: '',
    },
    receiverAddress: {
      type: String,
      default: '',
    },
    isReviewedByRequester: {
      type: Boolean,
      default: false,
    },
    isReviewedByReceiver: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ExchangeRequest', exchangeRequestSchema);
