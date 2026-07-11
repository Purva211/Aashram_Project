const { generateReceiptPdf } = require("./utils/receiptEngine");
require("dotenv").config();

(async () => {
  try {
    const dynamicData = {
      subject: "Test Subject",
      noticeContent: "This is a test notice content.\nLine 2.",
      date: new Date().toLocaleDateString("en-IN", { day: '2-digit', month: '2-digit', year: 'numeric' }),
      authorName: "Admin",
      branchName: "Main Trust"
    };
    
    const url = await generateReceiptPdf("noticeTemplate", dynamicData, "NOT-2026-TEST");
    console.log("SUCCESS:", url);
  } catch (e) {
    console.error("ERROR:", e);
  }
  process.exit();
})();
