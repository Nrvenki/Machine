const mongoose = require('mongoose');

const machineSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  rating: { type: Number, required: true, min: 0, max: 5 },
  quantity: { type: Number, required: true, min: 0 },
  image: { type: String },
}, { timestamps: true });

const Machine = mongoose.model('Machine', machineSchema);
module.exports = Machine;