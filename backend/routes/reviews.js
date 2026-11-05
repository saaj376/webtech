const router = require('express').Router({ mergeParams: true });
const auth = require('../middleware/authMiddleware');
const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
router.use(auth);
router.use(async (req, res, next) => {
  const productId = Number(req.params.productId);
  if (!Number.isSafeInteger(productId) || productId < 1) return res.status(400).json({ message: 'Invalid product ID' });
  if (!await Product.exists({ productId })) return res.status(404).json({ message: 'Product not found' });
  req.productId = productId;
  next();
});
async function eligible(req) {
  return Boolean(await Order.exists({ emailId: req.user.emailId, status: 'delivered', 'items.productId': req.productId }));
}
router.get('/', async (req, res) => {
  const [reviews, summary, ownReview, canReview] = await Promise.all([
    Review.find({ productId: req.productId }).sort({ createdAt: -1 }).limit(50).populate('userId', 'username').lean(),
    Review.aggregate([{ $match: { productId: req.productId } }, { $group: { _id: null, average: { $avg: '$rating' }, count: { $sum: 1 } } }]),
    Review.findOne({ productId: req.productId, userId: req.user.userId }).select('rating comment').lean(),
    eligible(req),
  ]);
  res.json({ reviews: reviews.map(r => ({ _id: r._id, username: r.userId?.username || 'Customer', rating: r.rating, comment: r.comment, createdAt: r.createdAt })), average: summary[0]?.average || 0, count: summary[0]?.count || 0, ownReview, canReview });
});
router.put('/me', async (req, res) => {
  const { rating, comment = '' } = req.body || {};
  if (!Number.isInteger(rating) || rating < 1 || rating > 5 || typeof comment !== 'string' || comment.length > 1000) return res.status(400).json({ message: 'Choose a rating from 1 to 5 and a comment under 1,001 characters.' });
  if (!await eligible(req)) return res.status(403).json({ message: 'You can review this product after your order is delivered.' });
  await Review.findOneAndUpdate({ productId: req.productId, userId: req.user.userId }, { $set: { rating, comment: comment.trim() } }, { upsert: true, runValidators: true });
  res.json({ message: 'Review saved.' });
});
module.exports = router;
