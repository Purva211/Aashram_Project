const mongoose = require('mongoose');
const ReceiptArchive = require('./models/ReceiptArchive');
require('dotenv').config();

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/aashram");
    const notices = await ReceiptArchive.find({ category: 'Notice' }).sort({ createdAt: -1 }).limit(5);
    console.log("Recent Notices:");
    notices.forEach(n => {
      console.log(`- ${n.receiptNumber}: ${n.createdAt} | PDF: ${n.pdfUrl}`);
    });
  } catch (err) {
    console.error(err);
  }
  process.exit();
})();
