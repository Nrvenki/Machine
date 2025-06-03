const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/Order'); // Use the Order model from models/Order.js
const Machine = require('../models/Machine');

// Create a new order
router.post('/', async (req, res) => {
  const { clientName, mobileNumber, machineId, machineName, quantity, totalPrice, address } = req.body;

  // Validate required fields
  if (!clientName || !mobileNumber || !machineId || !machineName || !quantity || !totalPrice || !address) {
    return res.status(400).json({ message: 'All fields are required, including mobile number' });
  }

  // Validate quantity
  if (quantity < 1) {
    return res.status(400).json({ message: 'Quantity must be at least 1' });
  }

  // Validate mobile number format (10 digits)
  if (!/^\d{10}$/.test(mobileNumber)) {
    return res.status(400).json({ message: 'Mobile number must be a valid 10-digit number' });
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

    // Create new order
    const order = new Order({
      clientName,
      mobileNumber,
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