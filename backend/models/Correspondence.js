const mongoose = require('mongoose');
const Sequence = require('./Sequence');

const auditLogSchema = new mongoose.Schema({
  user: { type: String },
  role: { type: String },
  action: { type: String },
  date: { type: Date, default: Date.now },
  ip: { type: String },
  browser: { type: String }
}, { _id: false });

const historySchema = new mongoose.Schema({
  actionType: { type: String, enum: ['Email', 'WhatsApp', 'Download', 'Print'] },
  recipient: { type: String }, // Email or Mobile number
  date: { type: Date, default: Date.now },
  status: { type: String, default: 'Success' },
  performedBy: { type: String }
}, { _id: false });

const correspondenceSchema = new mongoose.Schema({
  referenceNumber: { type: String, unique: true },
  letterDate: { type: Date, required: true },
  subject: { type: String, required: true },
  
  recipient: {
    name: { type: String, required: true },
    organization: { type: String },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    email: { type: String },
    mobile: { type: String }
  },

  content: {
    body: { type: String, required: true }, // HTML content from Rich Text Editor
    closing: {
      regards: { type: String, default: 'Yours faithfully' },
      name: { type: String },
      designation: { type: String }
    }
  },

  status: {
    type: String,
    enum: ['Draft', 'Generated', 'Email Sent', 'WhatsApp Shared', 'Archived'],
    default: 'Draft'
  },

  file: {
    pdfUrl: { type: String },
    pdfName: { type: String },
    size: { type: Number },
    version: { type: Number, default: 1 }
  },

  auditTrail: [auditLogSchema],
  communicationHistory: [historySchema],

  createdBy: { type: String }, // User ID or Name
  createdById: { type: mongoose.Schema.Types.ObjectId, ref: 'Trustee' },
  lastModifiedBy: { type: String },
  
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date }

}, { timestamps: true });

// Pre-save hook for auto-generating reference number
correspondenceSchema.pre('save', async function(next) {
  if (this.isNew && this.status !== 'Draft' && !this.referenceNumber) {
    try {
      const year = new Date().getFullYear();
      const prefix = `OC-${year}`;
      const sequence = await Sequence.findOneAndUpdate(
        { sequenceName: prefix },
        { $inc: { currentValue: 1 } },
        { new: true, upsert: true }
      );
      const numStr = sequence.currentValue.toString().padStart(4, '0');
      this.referenceNumber = `${prefix}-${numStr}`;
    } catch (err) {
      return next(err);
    }
  }
  next();
});

module.exports = mongoose.model('Correspondence', correspondenceSchema);
