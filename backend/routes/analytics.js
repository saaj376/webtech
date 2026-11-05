const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/admin');
const Product = require('../models/Product');

const router = express.Router();

const AnalyticsEvent = require('../models/AnalyticsEvent');
const { buildSummary, reportingWindow } = require('../utils/analyticsSummary');
const Order = require('../models/Order');
const User = require('../models/User');

router.post('/', authMiddleware, async (req, res) => {
  const { productId, type } = req.body || {};
  if (!Number.isSafeInteger(productId) || productId < 1 || type !== 'click') return res.status(400).json({ message: 'Invalid analytics event' });
  if (!await Product.exists({ productId })) return res.status(404).json({ message: 'Product not found' });
  await AnalyticsEvent.create({ productId, userId: req.user.userId, type: 'view' });
  await Product.updateOne({ productId }, { $inc: { clicks: 1 } });
  res.json({ message: 'Recorded' });
});

router.get('/summary', authMiddleware, adminMiddleware, async (req, res) => {
  const days = Number(req.query.days || 30);
  if (![7, 30, 90].includes(days)) return res.status(400).json({ message: 'Choose 7, 30, or 90 days.' });
  const { start, end } = reportingWindow(days);
  const range = { $gte: start, $lt: end };
  const [orders, events, newCustomers, firstEvent] = await Promise.all([
    Order.find({ createdAt: range }).select('emailId totalAmount status createdAt').lean(),
    AnalyticsEvent.find({ createdAt: range }).select('userId type').populate('userId', 'emailId').lean(),
    User.countDocuments({ role: 'user', createdAt: range }),
    AnalyticsEvent.findOne().sort({ createdAt: 1 }).select('createdAt').lean(),
  ]);
  res.json({ ...buildSummary({ orders, events, newCustomers, days, start }), trackingSince: firstEvent?.createdAt || null });
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
