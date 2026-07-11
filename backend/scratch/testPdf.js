const { generateReceiptPdf } = require('../utils/receiptEngine');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

(async () => {
  try {
    console.log("Generating PDF...");
    const url = await generateReceiptPdf('donationTemplate', {
      donorName: 'Test Devotee',
      date: '28-06-2026',
      address: 'Mumbai',
      phone: '9876543210',
      amountInWords: 'One Thousand Rupees Only',
      amount: '1000'
    }, 'DON-2026-TEST1');
    console.log("PDF Uploaded to:", url);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
