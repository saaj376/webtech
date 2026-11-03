const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productId: {
    type: Number,
    required: true,
    unique: true,
    min: 1,
    validate: { validator: Number.isSafeInteger, message: 'Product ID must be a positive whole number.' },
  },
  productName: { type: String, required: true, trim: true },
  productPrice: {
    type: Number,
    required: true,
    min: 0,
    validate: { validator: Number.isFinite, message: 'Price must be a finite number.' },
  },
  category: { type: String, required: true, trim: true },
  quantity: {
    type: Number,
    required: true,
    min: 0,
    validate: { validator: Number.isSafeInteger, message: 'Quantity must be a non-negative whole number.' },
  },
  description: { type: String, required: true, trim: true },
}, { collection: 'products' });

module.exports = mongoose.model('Product', productSchema);
