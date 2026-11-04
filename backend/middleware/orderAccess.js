const mongoose = require('mongoose');
const Order = require('../models/Order');

async function orderAccess(req, res, next) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid order id' });
  }

  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const isOwner = order.emailId === req.user.emailId;
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only manage your own orders' });
    }

    req.order = order;
  } catch {
    console.error('Order lookup failed.');
    return res.status(500).json({ message: 'Unable to manage order. Please try again later.' });
  }

  return next();
}

module.exports = orderAccess;
