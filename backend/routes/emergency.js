const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');
const Emergency = require('../models/Emergency');
const User = require('../models/User');

router.post('/alert', auth, async (req, res) => {
  try {
    const { latitude, longitude, address, description } = req.body || {};
    const user = await User.findById(req.user._id);
    if (!user) return res.status(401).json({ success: false, message: 'User not found' });

    const emergency = new Emergency({
      userId: req.user._id,
      location: { latitude, longitude, address },
      description,
      alertsSent: []
    });
    await emergency.save();

    // SMS delivery is not implemented. Never claim that a notification was sent.
    console.warn('Emergency created; SMS delivery is not configured. Emergency ID:', emergency._id.toString());
    res.status(201).json({
      success: true,
      message: 'Emergency recorded. No SMS was sent because notification delivery is not configured.',
      simulation: true,
      emergencyId: emergency._id,
      alertsSent: 0
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to record emergency' });
  }
});

router.get('/active', auth, requireRole('asha_worker'), async (req, res) => {
  try {
    const assignedVillagers = await User.find({
      role: 'villager', assignedAshaWorker: req.user._id
    }).select('_id');
    const ids = assignedVillagers.map(user => user._id);
    const emergencies = await Emergency.find({
      status: 'active',
      $or: [{ userId: req.user._id }, { userId: { $in: ids } }]
    }).populate('userId', 'name phone village').sort({ createdAt: -1 });
    res.json({ success: true, emergencies });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch emergencies' });
  }
});

router.put('/:id/resolve', auth, requireRole('asha_worker'), async (req, res) => {
  try {
    const emergency = await Emergency.findById(req.params.id);
    if (!emergency) return res.status(404).json({ success: false, message: 'Emergency not found' });

    const patient = await User.findById(emergency.userId).select('role assignedAshaWorker');
    const isAssigned = emergency.userId.toString() === req.user._id.toString() ||
      (patient && patient.role === 'villager' && patient.assignedAshaWorker &&
        patient.assignedAshaWorker.toString() === req.user._id.toString());
    if (!isAssigned) return res.status(403).json({ success: false, message: 'Access denied' });

    emergency.status = 'resolved';
    emergency.respondedBy = req.user._id;
    emergency.resolvedAt = new Date();
    await emergency.save();
    res.json({ success: true, emergency });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to resolve emergency' });
  }
});

module.exports = router;
