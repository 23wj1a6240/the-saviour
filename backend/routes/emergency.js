const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Emergency = require('../models/Emergency');
const User = require('../models/User');

// Trigger emergency alert
router.post('/alert', auth, async (req, res) => {
  try {
    const { latitude, longitude, address, description } = req.body;
    const user = await User.findById(req.user._id);

    const emergency = new Emergency({
      userId: req.user._id,
      location: { latitude, longitude, address },
      description,
      alertsSent: []
    });

    const alertsSent = [];

    // In production: use Twilio to send SMS
    // For demo: log and simulate
    const recipients = [
      ...user.emergencyContacts.map(c => ({ phone: c.phone, type: 'family' })),
    ];

    recipients.forEach(r => {
      alertsSent.push({ phone: r.phone, status: 'sent', sentAt: new Date() });
      console.log(`📱 Emergency SMS would be sent to ${r.phone}`);
    });

    emergency.alertsSent = alertsSent;
    await emergency.save();

    // TODO: Real Twilio integration:
    // const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    // await twilio.messages.create({ body: message, from: process.env.TWILIO_PHONE_NUMBER, to: phone });

    res.json({
      success: true,
      message: 'Emergency alerts sent successfully',
      emergencyId: emergency._id,
      alertsSent: alertsSent.length
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to send emergency alert', error: err.message });
  }
});

// Get active emergencies (for ASHA workers)
router.get('/active', auth, async (req, res) => {
  try {
    const emergencies = await Emergency.find({ status: 'active' })
      .populate('userId', 'name phone village')
      .sort({ createdAt: -1 });
    res.json({ success: true, emergencies });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch emergencies' });
  }
});

// Resolve emergency
router.put('/:id/resolve', auth, async (req, res) => {
  try {
    const emergency = await Emergency.findByIdAndUpdate(req.params.id, {
      status: 'resolved',
      respondedBy: req.user._id,
      resolvedAt: new Date()
    }, { new: true });
    res.json({ success: true, emergency });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to resolve emergency' });
  }
});

module.exports = router;
