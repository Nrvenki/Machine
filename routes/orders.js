const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Machine = require('../models/Machine');

// Place a new order
router.post('/', async (req, res) => {
  try {
    const { clientName, mobileNumber, machineId, machineName, quantity, totalPrice, address } = req.body;

    // Validate required fields
    if (!clientName || !mobileNumber || !machineId || !machineName || !quantity || !totalPrice || !address) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate mobile number (basic 10-digit check)
    if (!/^\d{10}$/.test(mobileNumber)) {
      return res.status(400).json({ error: 'Invalid mobile number. Must be 10 digits.' });
    }

    // Validate machineId
    if (!mongoose.Types.ObjectId.isValid(machineId)) {
      return res.status(400).json({ error: 'Invalid machine ID format' });
    }

    // Check if machine exists and has sufficient quantity
    const machine = await Machine.findById(machineId);
    if (!machine) {
      return res.status(404).json({ error: 'Machine not found' });
    }
    if (machine.quantity < quantity) {
      return res.status(400).json({ error: `Only ${machine.quantity} units available` });
    }

    // Create new order
    const newOrder = new Order({
      clientName,
      mobileNumber,
      machineId,
      machineName,
      quantity,
      totalPrice,
      address,
    });

    // Save order
    await newOrder.save();

    // Update machine quantity
    machine.quantity -= quantity;
    await machine.save();

    res.status(201).json({ message: 'Order placed successfully', order: newOrder });
  } catch (err) {
    console.error('Error placing order:', err);
    res.status(500).json({ error: 'Server error while placing order' });
  }
});

// Get all orders
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().populate('machineId', 'name price');
    res.json(orders);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ error: 'Server error while fetching orders' });
  }
});

module.exports = router;