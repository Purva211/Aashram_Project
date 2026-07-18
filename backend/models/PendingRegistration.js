const mongoose = require('mongoose');

const pendingRegistrationSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  middleName: { type: String },
  lastName: { type: String, required: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  mobile: { type: String, required: true },
  hashedPassword: { type: String, required: true },
  role: { type: String, required: true, enum: ['Devotee', 'Volunteer'] },
  otp: { type: String, required: true },
  otpExpiry: { type: Date, required: true },
  otpVerified: { type: Boolean, default: false },
  temporaryProfileData: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 30 * 60 * 1000), index: { expires: '0s' } }
});

module.exports = mongoose.model('PendingRegistration', pendingRegistrationSchema);
