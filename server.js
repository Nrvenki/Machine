const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const machineRoutes = require('./routes/machines');
const authRoutes = require('./routes/auth');
const clientRoutes = require('./routes/client'); // Add client routes
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
app.use('/api/auth', authRoutes); // Mount auth routes (login)
app.use('/api/auth', clientRoutes); // Mount client routes (clients, register, delete)
app.use('/api/orders', orderRoutes);

// MongoDB connection
const mongoURI = 'mongodb+srv://gamespidy4:Hunter2002@aqua.yuhz4jx.mongodb.net/?retryWrites=true&w=majority&appName=AQUA';

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