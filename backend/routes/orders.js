const express = require('express');
const mongoose = require('mongoose');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/admin');
const orderAccess = require('../middleware/orderAccess');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Order = require('../models/Order');

const router = express.Router();

const transitions = {
  placed: ['shipped'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
};

router.use(authMiddleware);

router.post('/', async (req, res) => {
  const cart = await Cart.findOne({ emailId: req.user.emailId });

  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ message: 'Cart is empty' });
  }

  const session = await mongoose.startSession();

  try {
    let order;

    await session.withTransaction(async () => {
      const items = [];

      for (const item of cart.items) {
        const result = await Product.updateOne(
          { productId: item.productId, quantity: { $gte: item.quantity } },
          { $inc: { quantity: -item.quantity } },
          { session },
        );

        if (result.modifiedCount === 0) {
          throw new Error(`Not enough stock for product ${item.productId}`);
        }

        const product = await Product.findOne({ productId: item.productId }).session(session);

        if (!product) {
          throw new Error(`Product ${item.productId} not found`);
        }

        items.push({
          productId: product.productId,
          productName: product.productName,
          price: product.productPrice,
          quantity: item.quantity,
          size: product.size?.[0] || '',
        });
      }

      const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

      [order] = await Order.create([{
        emailId: req.user.emailId,
        items,
        totalAmount,
        status: 'placed',
      }], { session });

      await Cart.updateOne(
        { emailId: req.user.emailId },
        { $set: { items: [] } },
        { session },
      );
    });

    return res.status(201).json({ message: 'Order placed.', order });
  } catch (error) {
    return res.status(400).json({ message: error.message || 'Unable to place order.' });
  } finally {
    await session.endSession();
  }
});

router.get('/', async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { emailId: req.user.emailId };
    const orders = await Order.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ orders });
  } catch {
    console.error('Order retrieval failed.');
    return res.status(500).json({ message: 'Unable to load orders. Please try again later.' });
  }
});

router.patch('/:id/cancel', orderAccess, async (req, res) => {
  const session = await mongoose.startSession();

  try {
    let cancelledOrder;

    await session.withTransaction(async () => {
      cancelledOrder = await Order.findOneAndUpdate(
        { _id: req.order._id, status: 'placed' },
        { $set: { status: 'cancelled' } },
        { returnDocument: 'after', session },
      );

      if (!cancelledOrder) {
        throw new Error('Cannot cancel this order');
      }

      for (const item of req.order.items) {
        await Product.updateOne(
          { productId: item.productId },
          { $inc: { quantity: item.quantity } },
          { session },
        );
      }
    });

    return res.status(200).json({
      message: 'Order cancelled and stock restored.',
      order: cancelledOrder,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message || 'Unable to cancel order.' });
  } finally {
    await session.endSession();
  }
});

router.patch('/:id/status', adminMiddleware, orderAccess, async (req, res) => {
  const { status } = req.body || {};

  if (!transitions[req.order.status]?.includes(status)) {
    return res.status(400).json({
      message: `Cannot change status from ${req.order.status} to ${status}`,
    });
  }

  try {
    req.order.status = status;
    await req.order.save();
    return res.status(200).json({ message: `Order marked as ${status}.`, order: req.order });
  } catch {
    console.error('Order status update failed.');
    return res.status(500).json({ message: 'Unable to update order. Please try again later.' });
  }
});

module.exports = router;
