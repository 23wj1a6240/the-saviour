require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

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
const isProduction = process.env.NODE_ENV === 'production';
const frontendUrl = process.env.FRONTEND_URL;

if (isProduction) {
  for (const name of ['JWT_SECRET', 'AES_SECRET', 'MONGODB_URI', 'FRONTEND_URL']) {
    if (!process.env[name]) throw new Error(`Missing required production environment variable: ${name}`);
  }
  if (process.env.JWT_SECRET.length < 32 || process.env.AES_SECRET.length < 32) {
    throw new Error('JWT_SECRET and AES_SECRET must each be at least 32 characters');
  }
}

app.use(cors({
  origin: (origin, callback) => {
    const allowed = new Set([
      ...(frontendUrl ? [frontendUrl] : []),
      ...(!isProduction ? ['http://localhost:3000', 'http://127.0.0.1:3000'] : [])
    ]);
    if (!origin || allowed.has(origin)) return callback(null, true);
    return callback(new Error('Origin not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

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

app.use((err, req, res, next) => {
  console.error('Request failed:', err.message);
  if (res.headersSent) return next(err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || (!isProduction ? 'mongodb://localhost:27017/the-saviour' : null);

if (require.main === module) {
  if (!MONGODB_URI) throw new Error('MONGODB_URI must be configured');
  mongoose.connect(MONGODB_URI)
    .then(() => {
      console.log('MongoDB connected');
      app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch(err => {
      console.error('MongoDB connection failed; refusing to start:', err.message);
      process.exit(1);
    });
}

module.exports = app;
