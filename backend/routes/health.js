const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');
const HealthRecord = require('../models/HealthRecord');
const User = require('../models/User');
const CryptoJS = require('crypto-js');

const getAesKey = () => {
  const key = process.env.AES_SECRET;
  if (!key || key.length < 32 || key === 'default_aes_key_32_chars_minimum!') {
    throw new Error('AES_SECRET must be configured securely');
  }
  return key;
};

const encryptData = (data) => CryptoJS.AES.encrypt(JSON.stringify(data), getAesKey()).toString();
const canAccessPatient = async (requester, patientId) => {
  if (requester._id.toString() === patientId.toString()) return true;
  if (requester.role !== 'asha_worker') return false;
  const patient = await User.findById(patientId).select('assignedAshaWorker role');
  return Boolean(patient && patient.role === 'villager' &&
    patient.assignedAshaWorker && patient.assignedAshaWorker.toString() === requester._id.toString());
};

// Get a user's health records. ASHA workers may access assigned villagers only.
router.get('/:userId', auth, async (req, res) => {
  try {
    if (!await canAccessPatient(req.user, req.params.userId)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    const records = await HealthRecord.find({ userId: req.params.userId }).sort({ visitDate: -1 });
    res.json({ success: true, records });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch records' });
  }
});

// Create a health record for self, or for a villager assigned to this ASHA worker.
router.post('/', auth, async (req, res) => {
  try {
    const { userId, symptoms, diagnosis, prescription, doctorNotes, bloodPressure, temperature, weight, height, vaccinations } = req.body || {};
    const patientId = userId || req.user._id.toString();
    if (!await canAccessPatient(req.user, patientId)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    if (req.user._id.toString() !== patientId && req.user.role !== 'asha_worker') {
      return res.status(403).json({ success: false, message: 'Only authorized health workers may create records for another user' });
    }

    const encryptedData = encryptData({ prescription, doctorNotes });
    const record = new HealthRecord({
      userId: patientId, symptoms, diagnosis, bloodPressure, temperature, weight, height, vaccinations,
      encryptedData,
      recordedBy: req.user._id
    });
    await record.save();
    res.status(201).json({ success: true, message: 'Health record created', record });
  } catch (err) {
    if (err.message && err.message.startsWith('AES_SECRET')) {
      return res.status(500).json({ success: false, message: 'Health-record encryption is not configured securely' });
    }
    res.status(500).json({ success: false, message: 'Failed to create record' });
  }
});

// Update only explicitly supported fields after checking record-level authorization.
router.put('/:id', auth, async (req, res) => {
  try {
    const record = await HealthRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });
    if (!await canAccessPatient(req.user, record.userId.toString())) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const allowedFields = ['symptoms', 'diagnosis', 'bloodPressure', 'temperature', 'weight', 'height', 'vaccinations'];
    const updates = {};
    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body || {}, field)) updates[field] = req.body[field];
    }
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'No supported fields supplied' });
    }
    Object.assign(record, updates);
    await record.save();
    res.json({ success: true, record });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update record' });
  }
});

// Aggregate only the requesting ASHA worker's assigned villagers.
router.get('/stats/village', auth, requireRole('asha_worker'), async (req, res) => {
  try {
    const assigned = await User.find({ assignedAshaWorker: req.user._id, role: 'villager' }).select('_id age gender');
    const ids = assigned.map(user => user._id);
    const records = await HealthRecord.find({ userId: { $in: ids } }).populate('userId', 'village age gender');

    const diseaseCount = {};
    const ageGroups = { '0-18': 0, '19-40': 0, '41-60': 0, '60+': 0 };
    const countedUsers = new Set();
    records.forEach(record => {
      if (record.diagnosis) diseaseCount[record.diagnosis] = (diseaseCount[record.diagnosis] || 0) + 1;
      if (record.userId && record.userId.age && !countedUsers.has(record.userId._id.toString())) {
        countedUsers.add(record.userId._id.toString());
        const age = record.userId.age;
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
