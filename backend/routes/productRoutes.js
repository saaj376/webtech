const express = require('express');
const Product = require('../models/Product');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/admin');

const router = express.Router();

const productFields = [
  'productId',
  'productName',
  'productPrice',
  'category',
  'size',
  'color',
  'brand',
  'gender',
  'quantity',
  'description',
  'imageUrl',
].join(' ');

const sortableFields = ['productId', 'productName', 'productPrice', 'category', 'quantity'];

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function handleProductError(error, res) {
  if (error.code === 11000) {
    return res.status(409).json({ message: 'Product ID already exists' });
  }

  if (error.name === 'ValidationError' || error.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid product details' });
  }

  console.error('Product operation failed.');
  return res.status(500).json({ message: 'Unable to manage products. Please try again later.' });
}

router.get('/', authMiddleware, async (req, res) => {
  const { q, category, gender, sort = 'productId', order = 'asc' } = req.query;
  const filter = {};

  if (typeof q === 'string' && q.trim()) {
    const pattern = new RegExp(escapeRegex(q.trim()), 'i');
    filter.$or = [{ productName: pattern }, { description: pattern }];
  }
  if (typeof category === 'string' && category) filter.category = category;
  if (typeof gender === 'string' && gender) filter.gender = gender;

  const sortField = sortableFields.includes(sort) ? sort : 'productId';
  const sortOrder = order === 'desc' ? -1 : 1;

  try {
    const products = await Product.find(filter)
      .select(productFields)
      .sort({ [sortField]: sortOrder });

    if (products.length === 0) {
      return res.status(200).json({ message: 'No products available' });
    }

    return res.status(200).json(products);
  } catch {
    console.error('Product retrieval failed.');
    return res.status(500).json({ message: 'Unable to retrieve products. Please try again later.' });
  }
});

router.get('/:productId', authMiddleware, async (req, res) => {
  const productId = Number(req.params.productId);

  if (!Number.isSafeInteger(productId) || productId < 1) {
    return res.status(400).json({ message: 'Invalid product ID' });
  }

  try {
    const product = await Product.findOne({ productId }).select(productFields);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.status(200).json(product);
  } catch {
    console.error('Product retrieval failed.');
    return res.status(500).json({ message: 'Unable to retrieve products. Please try again later.' });
  }
});

router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const product = await Product.create(req.body || {});
    return res.status(201).json(product);
  } catch (error) {
    return handleProductError(error, res);
  }
});

router.put('/:productId', authMiddleware, adminMiddleware, async (req, res) => {
  const productId = Number(req.params.productId);

  if (!Number.isSafeInteger(productId) || productId < 1) {
    return res.status(400).json({ message: 'Invalid product ID' });
  }

  try {
    const existing = await Product.findOne({ productId }).select('clicks addToCarts');

    if (!existing) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Keep analytics counters when the rest of the product is replaced.
    const product = await Product.findOneAndReplace(
      { productId },
      {
        ...(req.body || {}),
        productId,
        clicks: existing.clicks || 0,
        addToCarts: existing.addToCarts || 0,
      },
      { returnDocument: 'after', runValidators: true, upsert: false },
    );

    return res.status(200).json(product);
  } catch (error) {
    return handleProductError(error, res);
  }
});

router.patch('/:productId', authMiddleware, adminMiddleware, async (req, res) => {
  const productId = Number(req.params.productId);

  if (!Number.isSafeInteger(productId) || productId < 1) {
    return res.status(400).json({ message: 'Invalid product ID' });
  }

  try {
    const product = await Product.findOneAndUpdate(
      { productId },
      { $set: req.body || {} },
      { returnDocument: 'after', runValidators: true, upsert: false },
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.status(200).json(product);
  } catch (error) {
    return handleProductError(error, res);
  }
});

router.delete('/:productId', authMiddleware, adminMiddleware, async (req, res) => {
  const productId = Number(req.params.productId);

  if (!Number.isSafeInteger(productId) || productId < 1) {
    return res.status(400).json({ message: 'Invalid product ID' });
  }

  try {
    const product = await Product.findOneAndDelete({ productId });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.status(200).json({ message: `Deleted ${product.productName}.` });
  } catch (error) {
    return handleProductError(error, res);
  }
});

module.exports = router;
