const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '../.env'), quiet: true });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Product = require('../models/Product');
const products = require('../seeds/products.json');

async function seedProducts() {
  try {
    // Validate before writing; existing product IDs are left untouched.
    await Promise.all(products.map(product => new Product(product).validate()));
    await connectDB();
    await Product.init();
    const result = await Product.bulkWrite(products.map(product => ({
      updateOne: {
        filter: { productId: product.productId },
        update: { $setOnInsert: product },
        upsert: true,
      },
    })));
    console.log(`Sample products inserted: ${result.upsertedCount}; existing products preserved: ${result.matchedCount}.`);
  } catch {
    console.error('Product seed failed. Check MongoDB connectivity, permissions, and product indexes.');
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedProducts();
