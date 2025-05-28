const express = require('express');
const router = express.Router();
const Machine = require('../models/Machine');

// GET /api/machines
router.get('/', async (req, res) => {
  try {
    const machines = await Machine.find().lean();
    res.status(200).json(machines);
  } catch (err) {
    console.error('Error fetching machines:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/machines
router.post('/', async (req, res) => {
  try {
    const { name, price, description, rating, quantity, image } = req.body;
    const newMachine = new Machine({ name, price, description, rating, quantity, image });
    await newMachine.save();
    res.status(201).json(newMachine);
  } catch (err) {
    console.error('Error adding machine:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/machines/:id
router.put('/:id', async (req, res) => {
  try {
    const { name, price, description, rating, quantity, image } = req.body;
    const machine = await Machine.findByIdAndUpdate(
      req.params.id,
      { name, price, description, rating, quantity, image },
      { new: true }
    );
    if (!machine) {
      return res.status(404).json({ message: 'Machine not found' });
    }
    res.status(200).json(machine);
  } catch (err) {
    console.error('Error updating machine:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/machines/:id
router.delete('/:id', async (req, res) => {
  try {
    const machine = await Machine.findByIdAndDelete(req.params.id);
    if (!machine) {
      return res.status(404).json({ message: 'Machine not found' });
    }
    res.status(200).json({ message: 'Machine deleted' });
  } catch (err) {
    console.error('Error deleting machine:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;