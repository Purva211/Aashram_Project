const mongoose = require("mongoose");

const receiptArchiveSchema = new mongoose.Schema({
  receiptNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Notice',
      'Donation', 
      'Branch Donation', 
      'Annadan',
      'Prasad',
      'Payment',
      'Expense'
    ]
  },
  branchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Branch",
    required: false
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false, // E.g., points to Donation ID or Announcement ID
  },
  referenceModel: {
    type: String,
    required: false, // E.g., 'Donation', 'Announcement'
  },
  dynamicData: {
    type: Object, // JSON blob of the data used to generate the template
    required: true
  },
  pdfUrl: {
    type: String,
    required: false // Populated after Puppeteer generation + upload
  },
  status: {
    type: String,
    enum: ['Draft', 'Generated', 'Cancelled'],
    default: 'Generated'
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'generatedByModel',
    required: true
  },
  generatedByModel: {
    type: String,
    enum: ['Admin', 'Trustee', 'BranchManager', 'Accountant', 'Devotee'],
    required: true
  },
  deliveryStatus: {
    emailSent: { type: Boolean, default: false },
    whatsappSent: { type: Boolean, default: false },
    printed: { type: Boolean, default: false },
    downloadedCount: { type: Number, default: 0 }
  }
}, { timestamps: true });

module.exports = mongoose.model("ReceiptArchive", receiptArchiveSchema);
