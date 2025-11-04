const mongoose = require('mongoose');

/**
 * PricePoint Schema
 * Stores historical price data for items across different regions
 */
const pricePointSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: [true, 'Item reference is required']
  },
  region: {
    type: String,
    required: [true, 'Region is required'],
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
pricePointSchema.index({ item: 1, region: 1, date: -1 });
pricePointSchema.index({ region: 1, date: -1 });

module.exports = mongoose.model('PricePoint', pricePointSchema);
