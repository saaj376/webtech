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
  category: {
    type: String,
    required: true,
    enum: ['Tops', 'Bottoms', 'Outerwear', 'Footwear', 'Accessories'],
  },
  size: { type: [String], default: [] },
  color: { type: String, default: '', trim: true },
  brand: { type: String, default: '', trim: true },
  gender: { type: String, enum: ['Men', 'Women', 'Unisex'], default: 'Unisex' },
  quantity: {
    type: Number,
    required: true,
    min: 0,
    validate: { validator: Number.isSafeInteger, message: 'Quantity must be a non-negative whole number.' },
  },
  description: { type: String, required: true, trim: true },
  imageUrl: { type: String, default: '' },
  clicks: {
    type: Number,
    default: 0,
    min: 0,
    validate: { validator: Number.isSafeInteger, message: 'Clicks must be a non-negative whole number.' },
  },
  addToCarts: {
    type: Number,
    default: 0,
    min: 0,
    validate: { validator: Number.isSafeInteger, message: 'Add-to-cart count must be a non-negative whole number.' },
  },
}, { collection: 'products' });

module.exports = mongoose.model('Product', productSchema);
