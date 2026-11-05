const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  productId: { type: Number, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5, validate: Number.isInteger },
  comment: { type: String, trim: true, maxlength: 1000, default: '' },
}, { timestamps: true });
schema.index({ productId: 1, userId: 1 }, { unique: true });
module.exports = mongoose.model('Review', schema);
