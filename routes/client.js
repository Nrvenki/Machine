const express = require('express');
const router = express.Router();
const Client = require('../models/Client');
const bcrypt = require('bcryptjs');

// GET all clients (excluding passwords)
router.get('/clients', async (req, res) => {
  try {
    const clients = await Client.find({}, { password: 0 });
    res.json(clients);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Register new client
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, mobile, address } = req.body;

    // Validate required fields
    if (!name || !email || !password || !mobile || !address) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingClient = await Client.findOne({ email });
    if (existingClient) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const newClient = new Client({ name, email, password, mobile, address });
    await newClient.save();

    res.status(201).json({ message: 'Client registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login client
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const client = await Client.findOne({ email });
    if (!client) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, client.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Return client info (excluding password)
    const { name, mobile, address } = client;
    res.json({ message: 'Login successful', client: { name, email, mobile, address } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a client
router.delete('/clients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('Attempting to delete client with ID:', id); // Debug log
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log('Invalid ID format:', id);
      return res.status(400).json({ 
        success: false,
        message: 'Invalid client ID format' 
      });
    }

    const deletedClient = await Client.findByIdAndDelete(id);
    
    if (!deletedClient) {
      console.log('Client not found with ID:', id);
      return res.status(404).json({ 
        success: false,
        message: 'Client not found' 
      });
    }
    
    console.log('Successfully deleted client:', deletedClient);
    res.status(200).json({ 
      success: true,
      message: 'Client deleted successfully',
      deletedClient: {
        id: deletedClient._id,
        name: deletedClient.name,
        email: deletedClient.email
      }
    });
    
  } catch (err) {
    console.error('Error deleting client:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error while deleting client',
      error: err.message 
    });
  }
});

module.exports = router;