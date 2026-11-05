const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: Number, required: true },
  type: { type: String, enum: ['view', 'add_to_cart'], required: true },
}, { timestamps: { createdAt: true, updatedAt: false } });
schema.index({ createdAt: 1, type: 1, userId: 1 });
module.exports = mongoose.model('AnalyticsEvent', schema);
