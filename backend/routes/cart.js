const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const AnalyticsEvent = require('../models/AnalyticsEvent');

const router = express.Router();

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const cart = await Cart.findOne({ emailId: req.user.emailId });
    if (!cart || cart.items.length === 0) {
      return res.status(200).json({ items: [], total: 0 });
    }

    const products = await Product.find({
      productId: { $in: cart.items.map((item) => item.productId) },
    });

    const productMap = new Map(products.map((product) => [product.productId, product]));
    const items = cart.items
      .map((item) => {
        const product = productMap.get(item.productId);
        if (!product) return null;

        return {
          productId: item.productId,
          quantity: item.quantity,
          productName: product.productName,
          price: product.productPrice,
          imageUrl: product.imageUrl,
          size: product.size?.[0] || '',
        };
      })
      .filter(Boolean);

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return res.status(200).json({ items, total });
  } catch {
    console.error('Cart retrieval failed.');
    return res.status(500).json({ message: 'Unable to load cart. Please try again later.' });
  }
});

router.post('/', async (req, res) => {
  const { productId, quantity = 1 } = req.body || {};

  if (!Number.isSafeInteger(productId) || productId < 1 ||
      !Number.isSafeInteger(quantity) || quantity < 1) {
    return res.status(400).json({ message: 'Invalid cart details' });
  }

  try {
    const product = await Product.findOne({ productId });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    let cart = await Cart.findOne({ emailId: req.user.emailId });
    if (!cart) {
      cart = new Cart({ emailId: req.user.emailId, items: [] });
    }

    const item = cart.items.find((entry) => entry.productId === productId);
    const nextQuantity = (item?.quantity || 0) + quantity;

    if (nextQuantity > product.quantity) {
      return res.status(400).json({ message: 'Not enough stock available' });
    }

    if (item) {
      item.quantity = nextQuantity;
    } else {
      cart.items.push({ productId, quantity });
    }

    await cart.save();
    // Tracking must not turn a successful cart update into an error.
    await Promise.all([
      AnalyticsEvent.create({ userId: req.user.userId, productId, type: 'add_to_cart' }),
      Product.updateOne({ productId }, { $inc: { addToCarts: 1 } }),
    ]).catch(error => console.error('Cart analytics failed:', error.message));
    return res.status(200).json({ message: 'Added to cart.' });
  } catch {
    console.error('Add to cart failed.');
    return res.status(500).json({ message: 'Unable to update cart. Please try again later.' });
  }
});

router.patch('/:productId', async (req, res) => {
  const productId = Number(req.params.productId);
  const { quantity } = req.body || {};

  if (!Number.isSafeInteger(productId) || productId < 1 ||
      !Number.isSafeInteger(quantity) || quantity < 1) {
    return res.status(400).json({ message: 'Invalid cart details' });
  }

  try {
    const product = await Product.findOne({ productId });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (quantity > product.quantity) {
      return res.status(400).json({ message: 'Not enough stock available' });
    }

    const cart = await Cart.findOne({ emailId: req.user.emailId });
    const item = cart?.items.find((entry) => entry.productId === productId);

    if (!item) {
      return res.status(404).json({ message: 'Item not in cart' });
    }

    item.quantity = quantity;
    await cart.save();
    return res.status(200).json({ message: 'Cart updated.' });
  } catch {
    console.error('Cart update failed.');
    return res.status(500).json({ message: 'Unable to update cart. Please try again later.' });
  }
});

router.delete('/:productId', async (req, res) => {
  const productId = Number(req.params.productId);

  if (!Number.isSafeInteger(productId) || productId < 1) {
    return res.status(400).json({ message: 'Invalid product ID' });
  }

  try {
    const cart = await Cart.findOne({ emailId: req.user.emailId });

    if (!cart) {
      return res.status(200).json({ message: 'Cart already empty' });
    }

    cart.items = cart.items.filter((item) => item.productId !== productId);
    await cart.save();
    return res.status(200).json({ message: 'Removed from cart.' });
  } catch {
    console.error('Cart removal failed.');
    return res.status(500).json({ message: 'Unable to update cart. Please try again later.' });
  }
});

module.exports = router;
