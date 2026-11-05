const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/admin');
const Product = require('../models/Product');

const router = express.Router();

router.post('/', authMiddleware, async (req, res) => {
  const { productId, type } = req.body || {};

  if (!Number.isSafeInteger(productId) || productId < 1 ||
      !['click', 'add_to_cart'].includes(type)) {
    return res.status(400).json({ message: 'Invalid analytics event' });
  }

  const field = type === 'click' ? 'clicks' : 'addToCarts';

  try {
    const result = await Product.updateOne(
      { productId },
      { $inc: { [field]: 1 } },
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.status(200).json({ message: 'Recorded' });
  } catch {
    console.error('Analytics update failed.');
    return res.status(500).json({ message: 'Unable to record event. Please try again later.' });
  }
});

router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const analytics = await Product.find()
      .select('productId productName clicks addToCarts -_id')
      .sort({ clicks: -1, addToCarts: -1, productId: 1 });

    return res.status(200).json({ analytics });
  } catch {
    console.error('Analytics retrieval failed.');
    return res.status(500).json({ message: 'Unable to load analytics. Please try again later.' });
  }
});

module.exports = router;
