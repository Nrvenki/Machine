const mongoose = require('mongoose');

const machineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
  rating: { type: Number },
  quantity: { type: Number, required: true },
  image: { type: String }, // Base64 string or file path
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Machine', machineSchema);