const Order   = require('../models/Order');
const Product = require('../models/Product');

// @route  POST /api/orders
exports.createOrder = async (req, res) => {
  try {
    const {
      customer, shippingAddress, items,
      payment, shipping, subtotal, total, notes
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items in order' });
    }

    const order = await Order.create({
      customer, shippingAddress, items,
      payment, shipping, subtotal, total,
      notes:  notes || '',
      user:   req.user ? req.user._id : null
    });

    res.status(201).json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  GET /api/orders/my
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  GET /api/orders/:id
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.id })
      .populate('items.product', 'name price');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  GET /api/orders/all
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate('user', 'firstName lastName email');
    res.json({ success: true, count: orders.length, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  PUT /api/orders/:id/status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findOne({ orderId: req.params.id });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const previousStatus = order.status;
    order.status = status;
    await order.save();

    // When status changes TO delivered — update sold count and reduce stock
    if (status === 'delivered' && previousStatus !== 'delivered') {
      for (const item of order.items) {
        // Try to find product by name since we store name in order
        const product = await Product.findOne({ name: item.name });
        if (product) {
          product.sold  += item.qty;
          product.stock  = Math.max(0, product.stock - item.qty);
          await product.save();
        }
      }
    }

    // When status changes FROM delivered back to something else — reverse sold count
    if (previousStatus === 'delivered' && status !== 'delivered') {
      for (const item of order.items) {
        const product = await Product.findOne({ name: item.name });
        if (product) {
          product.sold  = Math.max(0, product.sold - item.qty);
          product.stock += item.qty;
          await product.save();
        }
      }
    }

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};