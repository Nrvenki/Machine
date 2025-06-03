const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Machine = require('../models/Machine');

// Order Schema
const orderSchema = new mongoose.Schema({
  clientName: {
    type: String,
    required: true,
  },
  machineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Machine',
    required: true,
  },
  machineName: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  address: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Order = mongoose.model('Order', orderSchema);

// Create a new order
router.post('/', async (req, res) => {
  const { clientName, machineId, machineName, quantity, totalPrice, address } = req.body;

  // Validate required fields
  if (!clientName || !machineId || !machineName || !quantity || !totalPrice || !address) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Validate quantity
  if (quantity < 1) {
    return res.status(400).json({ message: 'Quantity must be at least 1' });
  }

  try {
    // Check if machine exists and has sufficient stock
    const machine = await Machine.findById(machineId);
    if (!machine) {
      return res.status(404).json({ message: 'Machine not found' });
    }
    if (machine.quantity < quantity) {
      return res.status(400).json({ message: `Only ${machine.quantity} units available` });
    }

    // Update machine quantity
    machine.quantity -= quantity;
    await machine.save();

    // Create new orde
    const order = new Order({
      clientName,
      machineId,
      machineName,
      quantity,
      totalPrice,
      address,
    });

    const newOrder = await order.save();
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all orders (optional, for admin use)
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().populate('machineId', 'name price');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;