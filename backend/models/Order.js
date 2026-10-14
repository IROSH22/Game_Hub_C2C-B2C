const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  listingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GameListing',
    required: true,
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  platform: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  condition: {
    type: String,
    default: 'Brand New',
  },
});

const orderSchema = new mongoose.Schema(
  {
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [orderItemSchema],
    subtotal: {
      type: Number,
      required: true,
    },
    shippingFee: {
      type: Number,
      default: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    couponCode: {
      type: String,
      default: '',
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
    },
    paymentMethod: {
      type: String,
      enum: ['Credit Card', 'Stripe', 'PayPal', 'Cash on Delivery'],
      default: 'Stripe',
    },
    paymentStatus: {
      type: String,
      enum: ['Paid', 'Pending', 'Failed', 'Refunded'],
      default: 'Paid',
    },
    orderStatus: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Confirmed',
    },
    transactionId: {
      type: String,
      required: true,
    },
    cardLast4: {
      type: String,
      default: '4242',
    },
    paymentSignature: {
      type: String,
      default: '',
    },
    riskScore: {
      type: String,
      default: 'Low Risk (Verified)',
    },
    securityCheck: {
      type: Boolean,
      default: true,
    },
    isReviewed: {
      type: Boolean,
      default: false,
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Order', orderSchema);
