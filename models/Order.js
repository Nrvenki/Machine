const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  clientName: { type: String, required: true },
  machineId: { type: String, required: true },
  machineName: { type: String, required: true },
  quantity: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  address: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Order', orderSchema);
