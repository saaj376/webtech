const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  emailId: { type: String, required: true, unique: true, lowercase: true, trim: true },
  items: [{
    productId: {
      type: Number,
      required: true,
      validate: { validator: Number.isSafeInteger, message: 'Product ID must be a whole number.' },
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      validate: { validator: Number.isSafeInteger, message: 'Quantity must be a positive whole number.' },
    },
  }],
}, { collection: 'carts', timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);
