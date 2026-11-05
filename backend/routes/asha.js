const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');
const User = require('../models/User');
const HealthRecord = require('../models/HealthRecord');

// Villager registration is limited to authenticated ASHA workers.
// The account remains inactive until a trusted activation/password setup flow exists.
router.post('/register-villager', auth, requireRole('asha_worker'), async (req, res) => {
  try {
    const { name, phone, age, gender, village, district, income } = req.body || {};
    if (!name || !phone) {
      return res.status(400).json({ success: false, message: 'Name and phone are required' });
    }
    const existing = await User.findOne({ phone });
    if (existing) return res.status(400).json({ success: false, message: 'Phone already registered' });

    // Do not use a phone number as a password. This random secret is not disclosed;
    // a secure activation flow must be completed before the account can be used.
    const crypto = require('crypto');
    const villager = new User({
      name, phone, age, gender, village, district, income,
      role: 'villager',
      password: crypto.randomBytes(32).toString('hex'),
      isActive: false,
      assignedAshaWorker: req.user._id
    });
    await villager.save();
    res.status(201).json({
      success: true,
      message: 'Villager registered; account activation is required before login',
      villager: { id: villager._id, name, phone, activationRequired: true }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
});

router.get('/my-villagers', auth, requireRole('asha_worker'), async (req, res) => {
  try {
    const villagers = await User.find({ assignedAshaWorker: req.user._id, role: 'villager' }).select('-password');
    res.json({ success: true, villagers });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch villagers' });
  }
});

router.get('/stats', auth, requireRole('asha_worker'), async (req, res) => {
  try {
    const villagers = await User.find({ assignedAshaWorker: req.user._id, role: 'villager' }).select('_id');
    const ids = villagers.map(v => v._id);
    const totalRecords = await HealthRecord.countDocuments({ userId: { $in: ids } });
    const recentRecords = await HealthRecord.find({ userId: { $in: ids } }).sort({ createdAt: -1 }).limit(100);

    const diseaseDist = {};
    const vaccinationStats = { completed: 0, pending: 0 };
    recentRecords.forEach(r => {
      if (r.diagnosis) diseaseDist[r.diagnosis] = (diseaseDist[r.diagnosis] || 0) + 1;
      r.vaccinations?.forEach(v => {
        if (v.administered) vaccinationStats.completed++;
        else vaccinationStats.pending++;
      });
    });
    res.json({
      success: true,
      stats: { totalVillagers: villagers.length, totalRecords, diseaseDist, vaccinationStats, activeEmergencies: 0 }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
});

module.exports = router;
