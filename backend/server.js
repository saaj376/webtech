const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '.env'), quiet: true });

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Product = require('./models/Product');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');

const app = express();

app.use(express.json());
app.use(cors());
app.use('/api/users', userRoutes);
app.use('/api/login', authRoutes);
app.use('/api/products', productRoutes);

// Keep malformed JSON responses consistent with registration validation.
app.use((error, req, res, next) => {
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Invalid input details' });
  }
  return next(error);
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
    await Promise.all([User.init(), Product.init()]);
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
