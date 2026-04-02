const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');
const User = require('../models/User');
const HealthRecord = require('../models/HealthRecord');

// Register a villager (by ASHA worker)
router.post('/register-villager', auth, async (req, res) => {
  try {
    const { name, phone, age, gender, village, district, income } = req.body;
    
    const existing = await User.findOne({ phone });
    if (existing) return res.status(400).json({ success: false, message: 'Phone already registered' });

    const villager = new User({
      name, phone, age, gender, village, district, income,
      role: 'villager',
      password: phone, // default password = phone number
      assignedAshaWorker: req.user._id
    });
    await villager.save();

    res.status(201).json({ success: true, message: 'Villager registered successfully', villager: { id: villager._id, name, phone } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Registration failed', error: err.message });
  }
});

// Get all villagers under this ASHA worker
router.get('/my-villagers', auth, async (req, res) => {
  try {
    const villagers = await User.find({ assignedAshaWorker: req.user._id, role: 'villager' }).select('-password');
    res.json({ success: true, villagers });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch villagers' });
  }
});

// Village health stats
router.get('/stats', auth, async (req, res) => {
  try {
    const totalVillagers = await User.countDocuments({ role: 'villager' });
    const totalRecords = await HealthRecord.countDocuments({});
    
    const recentRecords = await HealthRecord.find({}).populate('userId', 'age gender').sort({ createdAt: -1 }).limit(100);
    
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
      stats: {
        totalVillagers,
        totalRecords,
        diseaseDist,
        vaccinationStats,
        activeEmergencies: 0
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
});

module.exports = router;
