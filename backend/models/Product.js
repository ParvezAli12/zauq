const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  number: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  intensity: {
    type: String,
    enum: ['Light', 'Moderate', 'Intense'],
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  price100ml: {
    type: Number,
    default: 0
  },
  size: {
    type: String,
    default: '50ml'
  },
  category: {
    type: String,
    enum: ['oriental', 'floral', 'fresh', 'woody'],
    required: true
  },
  notes: {
    top:   { type: String, required: true },
    heart: { type: String, required: true },
    base:  { type: String, required: true }
  },
  description: {
    type: String,
    required: true
  },
  longDescription: {
    type: String,
    required: true
  },
  tag: {
    type: String,
    default: null
  },
  stock: {
    type: Number,
    default: 100,
    min: 0
  },
  sold: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  images: [{ type: String }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

ProductSchema.pre('save', async function() {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '');
  }
});

module.exports = mongoose.model('Product', ProductSchema);