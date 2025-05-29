const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Client = require('../models/Client');

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const client = await Client.findOne({ email: email.toLowerCase().trim() });
    if (!client) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (password.trim() !== client.password) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { clientId: client._id, email: client.email },
      process.env.JWT_SECRET || 'qwertyuioplkjhgfdsazxcvbnm1234',
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      client: {
        id: client._id,
        name: client.name,
        email: client.email
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;