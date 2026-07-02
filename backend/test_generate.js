const fs = require('fs');
const path = require('path');
const { generateReceiptPdf } = require('./utils/generateReceipt');

const baseMock = {
  donorName: "श्री. अमोल बाळासाहेब पाटील (Amol Patil)",
  address: "मु. पो. कोले, ता. कराड, जि. सातारा - ४१५१२४",
  amount: 5001,
  message: "मठ बांधकाम देणगी (Math Construction)",
  utrNumber: "395827104928",
  paymentMethod: "GPay / UPI",
  paymentApp: "Google Pay",
  receiptNumber: "RCT-2026-00045",
  date: new Date()
};

async function testType(type, filename) {
  try {
    console.log(`Generating receipt for type: ${type}...`);
    const mock = { ...baseMock, donationType: type };
    const pdfBuffer = await generateReceiptPdf(mock);
    const destPath = path.join(__dirname, filename);
    fs.writeFileSync(destPath, pdfBuffer);
    console.log(`Success: Written to ${filename} (${pdfBuffer.length} bytes)`);
  } catch (err) {
    console.error(`Failed to generate ${type}:`, err);
  }
}

async function main() {
  await testType("dengi_pavti", "test_receipt_dengi.pdf");
  await testType("shakha_pavti", "test_receipt_shakha.pdf");
  await testType("jama_pavti", "test_receipt_jama.pdf");
}

main();
