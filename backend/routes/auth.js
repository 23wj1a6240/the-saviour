const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getJwtSecret } = require('../middleware/auth');

const createToken = (user) => jwt.sign(
  { userId: user._id, role: user.role },
  getJwtSecret(),
  { expiresIn: '1h', algorithm: 'HS256' }
);

// Public registration always creates a villager account. Elevated roles must
// be provisioned through a trusted administrative workflow.
router.post('/register', async (req, res) => {
  try {
    const { name, phone, email, password, age, gender, village, district, state, income, language } = req.body || {};
    if (!name || !phone || typeof password !== 'string' || password.length < 12) {
      return res.status(400).json({
        success: false,
        message: 'Name, phone, and a password of at least 12 characters are required'
      });
    }

    const existingUser = await User.findOne({ phone });
    if (existingUser) return res.status(400).json({ success: false, message: 'Phone number already registered' });

    const user = new User({
      name, phone, email, password, age, gender, village, district, state, income, language,
      role: 'villager'
    });
    await user.save();

    const token = createToken(user);
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: { id: user._id, name: user.name, phone: user.phone, role: user.role, language: user.language }
    });
  } catch (err) {
    if (err.message && err.message.startsWith('JWT_SECRET')) {
      return res.status(500).json({ success: false, message: 'Authentication is not configured securely' });
    }
    console.error('Registration failed:', err.message);
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body || {};
    if (!phone || typeof password !== 'string') {
      return res.status(400).json({ success: false, message: 'Phone and password are required' });
    }

    const user = await User.findOne({ phone });
    if (!user || user.isActive === false) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Invalid credentials' });

    const token = createToken(user);
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, phone: user.phone, role: user.role, village: user.village, language: user.language }
    });
  } catch (err) {
    if (err.message && err.message.startsWith('JWT_SECRET')) {
      return res.status(500).json({ success: false, message: 'Authentication is not configured securely' });
    }
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

module.exports = router;
