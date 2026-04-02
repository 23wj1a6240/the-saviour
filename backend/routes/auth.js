const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, phone, email, password, role, age, gender, village, district, state, income, language } = req.body;
    
    const existingUser = await User.findOne({ phone });
    if (existingUser) return res.status(400).json({ success: false, message: 'Phone number already registered' });

    const user = new User({ name, phone, email, password, role, age, gender, village, district, state, income, language });
    await user.save();

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: { id: user._id, name: user.name, phone: user.phone, role: user.role, language: user.language }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Registration failed', error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    const user = await User.findOne({ phone });
    if (!user) return res.status(400).json({ success: false, message: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, phone: user.phone, role: user.role, village: user.village, language: user.language }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

module.exports = router;
