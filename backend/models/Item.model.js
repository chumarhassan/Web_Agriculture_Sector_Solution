const mongoose = require('mongoose');

/**
 * Item Schema
 * Represents agricultural products tracked in the system
 */
const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true,
    unique: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['vegetable', 'fruit', 'grain', 'dairy', 'livestock', 'other'],
    default: 'other'
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    default: 'kg',
    enum: ['kg', 'lb', 'ton', 'dozen', 'liter', 'piece']
  },
  description: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true
});

// Create slug from name before saving
itemSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
  }
  next();
});

module.exports = mongoose.model('Item', itemSchema);
