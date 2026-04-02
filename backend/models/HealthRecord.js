const mongoose = require('mongoose');

const healthRecordSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  symptoms: [{ type: String }],
  diagnosis: { type: String },
  prescription: { type: String },
  doctorNotes: { type: String },
  bloodPressure: { type: String },
  temperature: { type: Number },
  weight: { type: Number },
  height: { type: Number },
  vaccinations: [{
    name: String,
    date: Date,
    nextDue: Date,
    administered: Boolean
  }],
  visitDate: { type: Date, default: Date.now },
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  encryptedData: { type: String }, // AES encrypted sensitive data
  attachments: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('HealthRecord', healthRecordSchema);
