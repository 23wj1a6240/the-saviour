const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const HealthRecord = require('../models/HealthRecord');
const CryptoJS = require('crypto-js');

const AES_KEY = process.env.AES_SECRET || 'default_aes_key_32_chars_minimum!';

const encryptData = (data) => CryptoJS.AES.encrypt(JSON.stringify(data), AES_KEY).toString();
const decryptData = (encrypted) => {
  const bytes = CryptoJS.AES.decrypt(encrypted, AES_KEY);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};

// Get user health records
router.get('/:userId', auth, async (req, res) => {
  try {
    const canAccess = req.user._id.toString() === req.params.userId || req.user.role === 'asha_worker';
    if (!canAccess) return res.status(403).json({ success: false, message: 'Access denied' });

    const records = await HealthRecord.find({ userId: req.params.userId }).sort({ visitDate: -1 });
    res.json({ success: true, records });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch records' });
  }
});

// Create health record
router.post('/', auth, async (req, res) => {
  try {
    const { userId, symptoms, diagnosis, prescription, doctorNotes, bloodPressure, temperature, weight, height, vaccinations } = req.body;

    const sensitiveData = { prescription, doctorNotes };
    const encryptedData = encryptData(sensitiveData);

    const record = new HealthRecord({
      userId: userId || req.user._id,
      symptoms, diagnosis, bloodPressure, temperature, weight, height, vaccinations,
      encryptedData,
      recordedBy: req.user._id
    });

    await record.save();
    res.status(201).json({ success: true, message: 'Health record created', record });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create record', error: err.message });
  }
});

// Update health record
router.put('/:id', auth, async (req, res) => {
  try {
    const record = await HealthRecord.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, record });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update record' });
  }
});

// Get village health stats (for ASHA workers)
router.get('/stats/village', auth, async (req, res) => {
  try {
    const records = await HealthRecord.find({}).populate('userId', 'village age gender');
    
    // Aggregate stats
    const diseaseCount = {};
    const ageGroups = { '0-18': 0, '19-40': 0, '41-60': 0, '60+': 0 };
    
    records.forEach(r => {
      if (r.diagnosis) diseaseCount[r.diagnosis] = (diseaseCount[r.diagnosis] || 0) + 1;
      if (r.userId?.age) {
        const age = r.userId.age;
        if (age <= 18) ageGroups['0-18']++;
        else if (age <= 40) ageGroups['19-40']++;
        else if (age <= 60) ageGroups['41-60']++;
        else ageGroups['60+']++;
      }
    });

    res.json({ success: true, stats: { diseaseCount, ageGroups, totalRecords: records.length } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
});

module.exports = router;
