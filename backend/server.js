const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const healthRoutes = require('./routes/health');
const symptomRoutes = require('./routes/symptoms');
const emergencyRoutes = require('./routes/emergency');
const schemeRoutes = require('./routes/schemes');
const chatbotRoutes = require('./routes/chatbot');
const reportRoutes = require('./routes/reports');
const ashaRoutes = require('./routes/asha');

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/symptoms', symptomRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/schemes', schemeRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/asha', ashaRoutes);

app.get('/api/health-check', (req, res) => {
  res.json({ status: 'ok', message: 'The Saviour API is running' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/the-saviour';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    // Start server even without DB for demo purposes
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT} (No DB)`));
  });

module.exports = app;
