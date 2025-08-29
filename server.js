const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const machineRoutes = require('./routes/machines');
const authRoutes = require('./routes/auth');
const clientRoutes = require('./routes/client');
const orderRoutes = require('./routes/orders');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static('uploads'));

// Request logging for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/machines', machineRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/orders', orderRoutes);

// MongoDB connection
const mongoURI = 'mongodb+srv://huntergaming2kkids_db_user:Hunter2002@cluster0.bqep4g7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ Failed to connect to MongoDB:', err));

// Health check route
app.get('/', (req, res) => {
  res.send('Server is running');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});