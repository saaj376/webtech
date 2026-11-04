const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  emailId: { type: String, required: true, lowercase: true, trim: true, index: true },
  items: [{
    productId: Number,
    productName: String,
    price: Number,
    quantity: Number,
    size: String,
  }],
  totalAmount: { type: Number, required: true, min: 0 },
  status: {
    type: String,
    enum: ['placed', 'shipped', 'delivered', 'cancelled'],
    default: 'placed',
  },
}, { collection: 'orders', timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
