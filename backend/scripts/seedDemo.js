const path = require('node:path');
const { createHash, randomBytes } = require('node:crypto');
require('dotenv').config({ path: path.join(__dirname, '../.env'), quiet: true });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Review = require('../models/Review');
const AnalyticsEvent = require('../models/AnalyticsEvent');

// Stable IDs make reruns replace only this script's fixtures, without duplicates.
const id = key => new mongoose.Types.ObjectId(createHash('sha256').update(`wearit-demo-v1:${key}`).digest('hex').slice(0, 24));
const DAY = 86400000;
const today = new Date(new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()) + 'T00:00:00+05:30');
const ago = (days, minutes = 0) => new Date(today.getTime() - days * DAY + minutes * 60000);
const replacement = document => ({ replaceOne: { filter: { _id: document._id }, replacement: document, upsert: true, timestamps: false } });

async function seed() {
  try {
    await connectDB();
    const products = await Product.find().sort({ productId: 1 }).limit(6).lean();
    if (!products.length) throw new Error('No products found. Run npm run seed:products first.');
    await Promise.all([User.init(), Order.init(), Review.init(), AnalyticsEvent.init()]);
    const password = await bcrypt.hash(randomBytes(32).toString('hex'), 10);
    const names = ['Aarav', 'Diya', 'Kabir', 'Meera', 'Rohan', 'Ananya', 'Ishaan', 'Priya', 'Arjun', 'Tara', 'Dev', 'Nisha', 'Vihaan', 'Sara', 'Neel', 'Aisha'];
    const users = names.map((name, i) => ({ _id: id(`user-${i}`), username: name, emailId: `wearit-demo-${i}@example.invalid`, age: 22 + i, role: 'user', password, createdAt: ago(i * 5), updatedAt: ago(i * 5) }));
    // Do not reset passwords or profile edits when the seed is run again.
    await User.bulkWrite(users.map(user => ({ updateOne: { filter: { _id: user._id }, update: { $setOnInsert: user }, upsert: true, timestamps: false } })));
    const orders = [], events = [], reviews = [];
    function order(key, userIndex, selected, status, date, quantity = 1) {
      const items = selected.map(p => ({ productId: p.productId, productName: p.productName, price: p.productPrice, quantity, size: p.size?.[0] || '' }));
      orders.push({ _id: id(key), emailId: users[userIndex].emailId, items, totalAmount: items.reduce((sum, item) => sum + item.price * item.quantity, 0), status, createdAt: date, updatedAt: date });
    }
    for (let day = 0; day < 90; day++) {
      // Midnight events keep today's sample data visible even on an early run.
      const date = ago(day);
      for (let i = 0; i < users.length; i++) {
        if (users[i].createdAt > date) continue;
        const product = products[(day + i) % products.length];
        events.push({ _id: id(`view-${day}-${i}`), userId: users[i]._id, productId: product.productId, type: 'view', createdAt: date });
        if (i < 12 && (day + i) % 4 !== 0) events.push({ _id: id(`cart-${day}-${i}`), userId: users[i]._id, productId: product.productId, type: 'add_to_cart', createdAt: date });
      }
      const count = 2 + (day % 5);
      for (let i = 0; i < count; i++) {
        const buyer = (day + i) % 9;
        if (users[buyer].createdAt > date) continue;
        const status = (day + i) % 9 === 0 ? 'cancelled' : day < 2 ? 'placed' : day < 5 ? 'shipped' : 'delivered';
        order(`order-${day}-${i}`, buyer, [products[(day + i) % products.length]], status, date, 1 + (day + i) % 3);
      }
    }
    const comments = ['Comfortable and exactly as described. Happy with the quality.', 'Looks great and arrived in good condition. Would recommend.', 'Good value overall. The finish could be a little better.'];
    for (let i = 0; i < 3; i++) {
      order(`review-order-${i}`, i + 1, products, 'delivered', ago(3 + i));
      products.forEach((p, j) => reviews.push({ _id: id(`review-${i}-${p.productId}`), userId: users[i + 1]._id, productId: p.productId, rating: [5, 4, 3][(i + j) % 3], comment: comments[i], createdAt: ago(2 + i), updatedAt: ago(2 + i) }));
    }
    await Order.bulkWrite(orders.map(replacement), { timestamps: false });
    await AnalyticsEvent.bulkWrite(events.map(replacement), { timestamps: false });
    // The product/user unique index also keeps review reruns idempotent.
    await Review.bulkWrite(reviews.map(review => ({ updateOne: { filter: { productId: review.productId, userId: review.userId }, update: { $set: { rating: review.rating, comment: review.comment, createdAt: review.createdAt, updatedAt: review.updatedAt }, $setOnInsert: { _id: review._id } }, upsert: true, timestamps: false } })), { timestamps: false });
    console.log(`Demo data ready: ${users.length} customers, ${orders.length} orders, ${events.length} activity events, ${reviews.length} reviews across ${products.length} products.`);
    console.log('90 days of sample activity. Existing customer data and product inventory are unchanged.');
    console.log('Reviewed products: ' + products.map(p => `${p.productId}: ${p.productName}`).join(', '));
  } catch (error) {
    console.error(error.message?.startsWith('No products') ? error.message : 'Demo seed failed. Check MongoDB connectivity and indexes.');
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}
seed();
