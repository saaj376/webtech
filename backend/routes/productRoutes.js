const express = require('express');
const Product = require('../models/Product');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const products = await Product.find().select(
      'productId productName productPrice category quantity description -_id'
    );

    if (products.length === 0) {
      return res.status(200).json({ message: 'No products available' });
    }

    return res.status(200).json(products);
  } catch {
    console.error('Product retrieval failed.');
    return res.status(500).json({ message: 'Unable to retrieve products. Please try again later.' });
  }
});

module.exports = router;
