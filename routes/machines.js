const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Machine = require('../models/Machine');

// GET /api/machines
router.get('/', async (req, res) => {
  try {
    const machines = await Machine.find().lean();
    res.status(200).json(machines);
  } catch (err) {
    console.error('Error fetching machines:', err);
    res.status(500).json({ error: 'Server error while fetching machines' });
  }
});

// POST /api/machines
router.post('/', async (req, res) => {
  try {
    const { name, price, description, rating, quantity, image } = req.body;

    // Validate required fields
    if (!name || typeof price !== 'number' || typeof quantity !== 'number') {
      return res.status(400).json({ error: 'Name, price, and quantity are required' });
    }

    // Validate numeric fields
    if (price < 0 || quantity < 0) {
      return res.status(400).json({ error: 'Price and quantity must be non-negative' });
    }

    // Validate rating if provided
    if (rating !== undefined && (rating < 0 || rating > 5)) {
      return res.status(400).json({ error: 'Rating must be between 0 and 5' });
    }

    const newMachine = new Machine({
      name,
      price,
      description: description || '',
      rating: rating || 0,
      quantity,
      image: image || '',
    });

    await newMachine.save();
    res.status(201).json(newMachine);
  } catch (err) {
    console.error('Error adding machine:', err);
    res.status(500).json({ error: 'Server error while adding machine' });
  }
});

// PUT /api/machines/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, description, rating, quantity, image } = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid machine ID format' });
    }

    // Validate required fields
    if (!name || typeof price !== 'number' || typeof quantity !== 'number') {
      return res.status(400).json({ error: 'Name, price, and quantity are required' });
    }

    // Validate numeric fields
    if (price < 0 || quantity < 0) {
      return res.status(400).json({ error: 'Price and quantity must be non-negative' });
    }

    // Validate rating if provided
    if (rating !== undefined && (rating < 0 || rating > 5)) {
      return res.status(400).json({ error: 'Rating must be between 0 and 5' });
    }

    const machine = await Machine.findByIdAndUpdate(
      id,
      {
        name,
        price,
        description: description || '',
        rating: rating || 0,
        quantity,
        image: image || '',
      },
      { new: true, runValidators: true }
    );

    if (!machine) {
      return res.status(404).json({ error: 'Machine not found' });
    }

    res.status(200).json(machine);
  } catch (err) {
    console.error('Error updating machine:', err);
    res.status(500).json({ error: 'Server error while updating machine' });
  }
});

// DELETE /api/machines/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid machine ID format' });
    }

    const machine = await Machine.findByIdAndDelete(id);
    if (!machine) {
      return res.status(404).json({ error: 'Machine not found' });
    }

    res.status(200).json({ message: 'Machine deleted successfully' });
  } catch (err) {
    console.error('Error deleting machine:', err);
    res.status(500).json({ error: 'Server error while deleting machine' });
  }
});

module.exports = router;