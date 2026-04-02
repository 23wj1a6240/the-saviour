const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String, trim: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['villager', 'asha_worker'], default: 'villager' },
  age: { type: Number },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  village: { type: String },
  district: { type: String },
  state: { type: String },
  income: { type: Number },
  language: { type: String, default: 'en' },
  emergencyContacts: [{
    name: String,
    phone: String,
    relation: String
  }],
  assignedAshaWorker: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
