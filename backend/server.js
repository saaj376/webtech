const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '.env'), quiet: true });

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const sanitizeMongo = require('./middleware/sanitizeMongo');
const User = require('./models/User');
const Product = require('./models/Product');
const Cart = require('./models/Cart');
const Order = require('./models/Order');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');
const analyticsRoutes = require('./routes/analytics');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10kb' }));
app.use(sanitizeMongo);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', mongo: mongoose.connection.readyState === 1 });
});

app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests. Please try again later.' },
}));

app.use('/api/login', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.LOGIN_MAX_ATTEMPTS) || 5,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts. Try again in 15 minutes.' },
}));

app.use('/api/users', userRoutes);
app.use('/api/login', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);

// Keep malformed JSON responses consistent with registration validation.
app.use((error, req, res, next) => {
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Invalid input details' });
  }
  return next(error);
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  console.error(error);
  return res.status(500).json({ message: 'Server error.' });
});

app.get('/', (req, res) => {
  res.send('Shopping App Backend Running');
});

async function startServer() {
  const port = Number(process.env.PORT || 5000);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535.');
  }

  await connectDB();
  try {
    await Promise.all([User.init(), Product.init(), Cart.init(), Order.init()]);
  } catch {
    await mongoose.disconnect();
    throw new Error('Unable to initialize database indexes. Check database permissions and existing duplicate values.');
  }

  const server = app.listen(port, () => {
    console.log(`Shopping App Backend listening on http://localhost:${port}`);
  });

  server.on('error', async (error) => {
    console.error(`HTTP server failed to start (${error.code || 'unknown error'}).`);
    await mongoose.disconnect();
    process.exitCode = 1;
  });

  return server;
}

if (require.main === module) {
  startServer().catch((error) => {
    console.error(`Backend startup failed: ${error.message}`);
    process.exitCode = 1;
  });
}

module.exports = { app, startServer };
