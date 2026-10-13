const mongoose = require('mongoose');

const gameListingSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    platform: {
      type: String,
      required: true,
      enum: ['PS5', 'Xbox Series X', 'PC', 'Nintendo Switch', 'PS4', 'Xbox One'],
    },
    genre: {
      type: String,
      required: true,
      enum: ['Action', 'RPG', 'Adventure', 'Sports', 'Shooter', 'Open World', 'Racing', 'Horror', 'Fighting', 'Strategy'],
    },
    condition: {
      type: String,
      required: true,
      enum: ['Brand New', 'Like New', 'Good', 'Fair'],
      default: 'Brand New',
    },
    isNewGame: {
      type: Boolean,
      default: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    originalPrice: {
      type: Number,
      default: 0,
    },
    stock: {
      type: Number,
      required: true,
      default: 1,
      min: 0,
    },
    exchangeable: {
      type: Boolean,
      default: false,
    },
    wantedGames: {
      type: String,
      default: '',
    },
    imageUrl: {
      type: String,
      required: true,
    },
    screenshots: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Sold'],
      default: 'Active',
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      default: 4.8,
    },
    reviewsCount: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Add index for fast search and filter
gameListingSchema.index({ title: 'text', description: 'text', platform: 1, genre: 1, condition: 1, exchangeable: 1 });

module.exports = mongoose.model('GameListing', gameListingSchema);
