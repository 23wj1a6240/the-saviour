const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const User = require('../models/User');

// Get all villagers (for ASHA worker)
router.get('/villagers', auth, async (req, res) => {
  try {
    const villagers = await User.find({ role: 'villager' }).select('-password');
    res.json({ success: true, villagers });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch villagers' });
  }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
});

// Update profile
router.put('/profile', auth, async (req, res) => {
  try {
    const updates = req.body;
    delete updates.password;
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
});

module.exports = router;
