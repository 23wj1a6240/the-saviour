const mongoose = require('mongoose');

const emergencySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  location: {
    latitude: Number,
    longitude: Number,
    address: String
  },
  description: { type: String },
  status: { type: String, enum: ['active', 'resolved', 'acknowledged'], default: 'active' },
  alertsSent: [{
    phone: String,
    status: String,
    sentAt: Date
  }],
  respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resolvedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Emergency', emergencySchema);
