const mongoose = require('mongoose');

const contactEnquirySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'Devotee', required: false },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  subject: { type: String },
  message: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['New', 'In Progress', 'Replied', 'Resolved'], 
    default: 'New' 
  },
  internalNotes: [{
    note: { type: String, required: true },
    addedBy: { type: String }, // e.g., "Trustee Name"
    date: { type: Date, default: Date.now }
  }],
  ipAddress: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('ContactEnquiry', contactEnquirySchema);
