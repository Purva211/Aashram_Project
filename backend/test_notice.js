const { generateReceiptPdf } = require('./utils/receiptEngine');

async function run() {
  try {
    const url = await generateReceiptPdf('noticeTemplate', {
      subject: 'Test Subject',
      noticeContent: 'This is a test notice.\nLine 2.\nLine 3.',
      date: '01/01/2026'
    }, 'NOT-2026-TEST-SCRIPT');
    console.log('Success:', url);
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
