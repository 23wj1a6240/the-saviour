const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');
const User = require('../models/User');

router.get('/villagers', auth, requireRole('asha_worker'), async (req, res) => {
  try {
    const villagers = await User.find({
      role: 'villager',
      assignedAshaWorker: req.user._id
    }).select('-password');
    res.json({ success: true, villagers });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch villagers' });
  }
});

router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
});

router.put('/profile', auth, async (req, res) => {
  try {
    const allowedFields = ['name', 'email', 'age', 'gender', 'village', 'district', 'state', 'income', 'language', 'emergencyContacts'];
    const updates = {};
    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body || {}, field)) updates[field] = req.body[field];
    }
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'No supported profile fields supplied' });
    }
    const user = await User.findByIdAndUpdate(req.user._id, { $set: updates }, {
      new: true, runValidators: true
    }).select('-password');
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
});

module.exports = router;
