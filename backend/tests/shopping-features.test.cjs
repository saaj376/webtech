const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const root = require('node:path').resolve(__dirname, '..') + '/';
const { buildSummary, reportingWindow } = require(root + 'utils/analyticsSummary');

test('IST date boundary, period length and empty data', () => {
  const { start, end } = reportingWindow(7, new Date('2026-11-05T19:00:00Z'));
  assert.equal(start.toISOString(), '2026-10-30T18:30:00.000Z');
  assert.equal(end.toISOString(), '2026-11-05T19:00:00.000Z');
  const data = buildSummary({ orders: [], events: [], newCustomers: 0, days: 7, start });
  assert.equal(data.daily.length, 7);
  assert.equal(data.daily[6].date, '2026-11-06');
  assert.equal(data.sales.average, 0);
  assert.deepEqual(data.funnel.map(x => x.count), [0, 0, 0]);
});
test('sales exclude cancellations; funnel deduplicates and nests customers', () => {
  const start = new Date('2026-11-04T18:30:00Z');
  const orders = [
    { emailId: 'a', status: 'placed', totalAmount: 100, createdAt: start },
    { emailId: 'a', status: 'delivered', totalAmount: 200, createdAt: start },
    { emailId: 'b', status: 'cancelled', totalAmount: 900, createdAt: start },
    { emailId: 'c', status: 'shipped', totalAmount: 300, createdAt: start },
  ];
  const events = [ ['a', 'view'], ['a', 'view'], ['a', 'add_to_cart'], ['b', 'view'], ['b', 'add_to_cart'], ['c', 'add_to_cart'] ].map(([emailId, type]) => ({ userId: { emailId }, type }));
  const data = buildSummary({ orders, events, newCustomers: 2, days: 7, start });
  assert.deepEqual(data.sales, { value: 600, orders: 3, average: 200 });
  assert.deepEqual(data.customers, { newCustomers: 2, buyers: 2, repeatBuyers: 1 });
  assert.deepEqual(data.funnel.map(x => x.count), [2, 2, 1]);
  assert.equal(data.daily[0].value, 600);
  assert.equal(data.daily[1].value, 0);
  assert.equal(data.statuses.find(x => x.name === 'cancelled').count, 1);
});

const express = require(root + 'node_modules/express');
const jwt = require(root + 'node_modules/jsonwebtoken');
const Product = require(root + 'models/Product');
const Order = require(root + 'models/Order');
const Review = require(root + 'models/Review');
let server, base, delivered = false, written, productExists = true;
const userId = '507f1f77bcf86cd799439011';
process.env.JWT_SECRET = 'isolated-test-secret';
const token = role => jwt.sign({ userId, emailId: 'a@example.com', role }, process.env.JWT_SECRET, { expiresIn: '1h' });
async function request(path, { role = 'user', auth = true, ...options } = {}) {
  return fetch(base + path, { ...options, headers: { 'Content-Type': 'application/json', ...(auth ? { Authorization: 'Bearer ' + token(role) } : {}) } });
}
before(async () => {
  Product.exists = async () => productExists;
  Order.exists = async () => delivered;
  Review.findOneAndUpdate = async (filter, update) => { written = { filter, update }; };
  Review.find = () => ({ sort: () => ({ limit: () => ({ populate: () => ({ lean: async () => [] }) }) }) });
  Review.aggregate = async () => [];
  Review.findOne = () => ({ select: () => ({ lean: async () => null }) });
  const app = express();
  app.use(express.json());
  app.use('/products/:productId/reviews', require(root + 'routes/reviews'));
  app.use('/analytics', require(root + 'routes/analytics'));
  server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.on('listening', resolve));
  base = 'http://127.0.0.1:' + server.address().port;
});
after(() => new Promise(resolve => server.close(resolve)));
test('review authentication, eligibility, validation and server-owned identity', async () => {
  assert.equal((await request('/products/1/reviews', { auth: false })).status, 401);
  assert.equal((await request('/products/no/reviews')).status, 400);
  const put = body => request('/products/1/reviews/me', { method: 'PUT', body: JSON.stringify(body) });
  assert.equal((await put({ rating: 5 })).status, 403);
  delivered = true;
  for (const rating of [0, 6, 2.5, '5']) assert.equal((await put({ rating })).status, 400);
  assert.equal((await put({ rating: 5, comment: 'x'.repeat(1001) })).status, 400);
  assert.equal((await put({ rating: 4, comment: ' Good ', userId: 'someone-else' })).status, 200);
  assert.equal(written.filter.userId, userId);
  assert.equal(written.update.$set.comment, 'Good');
  const response = await request('/products/1/reviews');
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.average, 0);
  assert.equal(data.count, 0);
  assert.equal(data.canReview, true);
  productExists = false;
  assert.equal((await request('/products/1/reviews')).status, 404);
});
test('analytics summary requires admin and validates date selection', async () => {
  assert.equal((await request('/analytics/summary', { auth: false })).status, 401);
  assert.equal((await request('/analytics/summary')).status, 403);
  assert.equal((await request('/analytics/summary?days=999', { role: 'admin' })).status, 400);
});

test('admin summary returns zero-filled report for empty database', async () => {
  const User = require(root + 'models/User');
  const Event = require(root + 'models/AnalyticsEvent');
  Order.find = () => ({ select: () => ({ lean: async () => [] }) });
  Event.find = () => ({ select: () => ({ populate: () => ({ lean: async () => [] }) }) });
  Event.findOne = () => ({ sort: () => ({ select: () => ({ lean: async () => null }) }) });
  User.countDocuments = async () => 0;
  const response = await request('/analytics/summary?days=7', { role: 'admin' });
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.daily.length, 7);
  assert.equal(data.sales.value, 0);
  assert.equal(data.trackingSince, null);
});
