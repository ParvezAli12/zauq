const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  customer: {
    fullName: { type: String, required: true },
    email:    { type: String, required: true },
    phone:    { type: String, required: true }
  },
  shippingAddress: {
    street:   { type: String, required: true },
    city:     { type: String, required: true },
    province: { type: String, required: true }
  },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },
    name:    String,
    price:   Number,
    qty:     Number,
    size:    { type: String, default: '50ml' }
  }],
  payment: {
    method: { type: String, enum: ['cod', 'easypaisa', 'bank'], default: 'cod' },
    status: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' }
  },
  shipping: {
    method: { type: String, enum: ['standard', 'express', 'sameday'], default: 'standard' },
    cost:   { type: Number, default: 0 }
  },
  subtotal:  { type: Number, required: true },
  total:     { type: Number, required: true },
  status:    { type: String, enum: ['processing', 'confirmed', 'shipped', 'delivered', 'cancelled'], default: 'processing' },
  notes:     { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

// Fix — async pre-save without next()
OrderSchema.pre('save', async function() {
  if (!this.orderId) {
    this.orderId = 'ZQ-' + Date.now().toString().slice(-6);
  }
});

module.exports = mongoose.model('Order', OrderSchema);