const mongoose = require('mongoose');
const { generateReceiptPdf } = require('../utils/receiptEngine');
const ReceiptArchive = require('../models/ReceiptArchive');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    const archives = await ReceiptArchive.find({ pdfUrl: { $regex: 'cloudinary' } });
    console.log(`Found ${archives.length} receipts with Cloudinary URLs.`);

    for (const archive of archives) {
      console.log(`Regenerating ${archive.receiptNumber}...`);
      
      let templateName = '';
      if (archive.category === 'Donation') templateName = 'donationTemplate';
      else if (archive.category === 'Annadan') templateName = 'annadanTemplate';
      else templateName = 'donationTemplate';

      const localPdfUrl = await generateReceiptPdf(templateName, archive.dynamicData || {}, archive.receiptNumber);
      
      archive.pdfUrl = localPdfUrl;
      await archive.save();
      console.log(`Updated ${archive.receiptNumber} to ${localPdfUrl}`);
    }

    console.log("Done fixing old receipts!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
