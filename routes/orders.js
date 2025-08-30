const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Machine = require('../models/Machine');
const Client = require('../models/Client');

// Place a new order
router.post('/', async (req, res) => {
  console.log('📦 Order placement request received');
  console.log('📋 Request body:', req.body);
  
  try {
    const { clientName, mobileNumber, machineId, machineName, quantity, totalPrice, address, email, password } = req.body;

    console.log('🔍 Extracted order data:');
    console.log('- Client Name:', clientName);
    console.log('- Mobile Number:', mobileNumber);
    console.log('- Machine ID:', machineId);
    console.log('- Machine Name:', machineName);
    console.log('- Quantity:', quantity);
    console.log('- Total Price:', totalPrice);
    console.log('- Address:', address);

    // Validate required fields
    if (!clientName || !mobileNumber || !machineId || !machineName || !quantity || !totalPrice || !address) {
      console.log('❌ Validation failed: Missing required fields');
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate mobile number (basic 10-digit check)
    if (!/^\d{10}$/.test(mobileNumber)) {
      console.log('❌ Validation failed: Invalid mobile number');
      return res.status(400).json({ error: 'Invalid mobile number. Must be 10 digits.' });
    }

    // Validate machineId
    if (!mongoose.Types.ObjectId.isValid(machineId)) {
      console.log('❌ Validation failed: Invalid machine ID format');
      return res.status(400).json({ error: 'Invalid machine ID format' });
    }

    console.log('✅ Validation passed, checking machine availability');

    // Check if machine exists and has sufficient quantity
    const machine = await Machine.findById(machineId);
    if (!machine) {
      console.log('❌ Machine not found:', machineId);
      return res.status(404).json({ error: 'Machine not found' });
    }
    if (machine.quantity < quantity) {
      console.log('❌ Insufficient quantity. Available:', machine.quantity, 'Requested:', quantity);
      return res.status(400).json({ error: `Only ${machine.quantity} units available` });
    }

    console.log('✅ Machine found and quantity available');

    // Update client record - always try to update the machine count
    console.log('📝 Updating client record');
    
    // First, try to find the client by email if provided
    let client = null;
    if (email) {
      client = await Client.findOne({ email: email });
      console.log('🔍 Client found by email:', client ? 'Yes' : 'No');
    }
    
    // If not found by email, try to find by mobile number
    if (!client) {
      client = await Client.findOne({ mobile: mobileNumber });
      console.log('🔍 Client found by mobile:', client ? 'Yes' : 'No');
    }
    
    // If client exists, update their machine count
    if (client) {
      console.log('📝 Updating existing client machine count');
      console.log('📊 Current machine count:', client.machine);
      console.log('📊 Adding quantity:', quantity);
      
      client.machine += quantity;
      await client.save();
      
      console.log('✅ Client machine count updated to:', client.machine);
    } else {
      console.log('📝 Creating new client record');
      // Create new client if not found
      const newClient = new Client({
        name: clientName,
        email: email || `${clientName.toLowerCase()}@example.com`, // Fallback email
        password: password || 'default123', // Fallback password
        mobile: mobileNumber,
        address: address,
        machine: quantity, // Set initial machine count
      });
      
      await newClient.save();
      client = newClient;
      console.log('✅ New client created with machine count:', newClient.machine);
    }

    console.log('📝 Creating new order');

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
    console.log('✅ Order saved successfully:', newOrder._id);

    // Update machine quantity
    machine.quantity -= quantity;
    await machine.save();
    console.log('✅ Machine quantity updated');

    console.log('🎉 Order placement completed successfully');
    console.log('📊 Final Summary:');
    console.log('- Order ID:', newOrder._id);
    console.log('- Client Name:', clientName);
    console.log('- Mobile:', mobileNumber);
    console.log('- Machine:', machineName);
    console.log('- Quantity:', quantity);
    console.log('- Total Price:', totalPrice);
    console.log('- Client Machine Count Updated:', client ? client.machine : 'N/A');
    
    res.status(201).json({ message: 'Order placed successfully', order: newOrder });
  } catch (err) {
    console.error('❌ Error placing order:', err);
    res.status(500).json({ error: 'Server error while placing order' });
  }
});

// Get all orders (with optional filtering)
router.get('/', async (req, res) => {
  try {
    const { clientName, mobileNumber, email } = req.query;
    let query = {};

    // If query parameters are provided, filter orders
    if (clientName || mobileNumber || email) {
      if (clientName) {
        query.clientName = { $regex: clientName, $options: 'i' }; // Case-insensitive search
      }
      if (mobileNumber) {
        query.mobileNumber = mobileNumber;
      }
      if (email) {
        // If email is provided, we need to find the client first and then get their orders
        const client = await Client.findOne({ email: email });
        if (client) {
          query.$or = [
            { clientName: client.name },
            { mobileNumber: client.mobile }
          ];
        }
      }
    }

    const orders = await Order.find(query).populate('machineId', 'name price').sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ error: 'Server error while fetching orders' });
  }
});

// Get orders by client email
router.get('/client/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    // First find the client by email
    const client = await Client.findOne({ email: email });
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Then find all orders for this client
    const orders = await Order.find({
      $or: [
        { clientName: client.name },
        { mobileNumber: client.mobile }
      ]
    }).populate('machineId', 'name price').sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error('Error fetching client orders:', err);
    res.status(500).json({ error: 'Server error while fetching client orders' });
  }
});

// Get orders by client mobile number
router.get('/mobile/:mobileNumber', async (req, res) => {
  try {
    const { mobileNumber } = req.params;
    
    const orders = await Order.find({ mobileNumber: mobileNumber })
      .populate('machineId', 'name price')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error('Error fetching orders by mobile:', err);
    res.status(500).json({ error: 'Server error while fetching orders by mobile' });
  }
});

module.exports = router;