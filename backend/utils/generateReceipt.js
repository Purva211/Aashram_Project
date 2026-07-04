const PDFDocument = require("pdfkit");
const fs = require('fs');
const path = require('path');
const { transliterateToMarathi, translateToMarathi } = require('./translationService');

// Helper to convert number to Marathi words
function convertNumberToMarathiWords(amount) {
  if (amount === 0) return "शून्य";
  
  const marathiNums = [
    "", "एक", "दोन", "तीन", "चार", "पाच", "सहा", "सात", "आठ", "नऊ", "दहा",
    "अकरा", "बारा", "तेरा", "चौदा", "पंधरा", "सोळा", "सतरा", "अठरा", "एकोणीस", "वीस",
    "एकवीस", "बावीस", "तेवीस", "चोवीस", "पंचवीस", "सव्वीस", "सत्तावीस", "अठ्ठावीस", "एकोणतीस", "तीस",
    "एकतीस", "बत्तीस", "तेहतीस", "चौतीस", "पस्तीस", "छत्तीस", "सडतीस", "अडतीस", "एकोणचाळीस", "चाळीस",
    "एकचाळीस", "बेचाळीस", "तेचाळीस", "चोवेचाळीस", "पंचेचाळीस", "सचेचाळीस", "सत्तेचाळीस", "अठ्ठेचाळीस", "एकोणपन्नास", "पन्नास",
    "एकपन्न", "बावन", "त्रिपन्न", "चौपन", "पंचावन", "सप्पन", "सत्तावन", "अठ्ठावन", "एकोणसाठ", "साठ",
    "एकसष्ठ", "बासष्ठ", "त्रेसष्ठ", "चौसष्ठ", "पायसष्ठ", "सहासष्ठ", "सदुसष्ठ", "अडुसष्ठ", "एकोणसत्तर", "सत्तर",
    "एकहत्तर", "बाहत्तर", "त्र्याहत्तर", "चौऱ्याहत्तर", "पंच्याहत्तर", "शहात्तर", "सत्त्याहत्तर", "अठ्ठ्याहत्तर", "एकोणऐंशी", "ऐंशी",
    "एक्याऐंशी", "ब्याऐंशी", "त्र्याऐंशी", "चौऱ्याऐंशी", "पंच्याऐंशी", "शहाऐंशी", "सत्त्याऐंशी", "अठ्ठ्याऐंशी", "एकोणनव्वद", "नव्वद",
    "एक्याण्णव", "ब्याण्णव", "त्र्याण्णव", "चौऱ्याण्णव", "पंच्याण्णव", "शहाण्णव", "सत्त्याण्णव", "अठ्ठ्याण्णव", "नव्याण्णव"
  ];

  let words = "";

  let temp = Math.floor(amount);
  const crores = Math.floor(temp / 10000000);
  temp %= 10000000;

  const lakhs = Math.floor(temp / 100000);
  temp %= 100000;

  const thousands = Math.floor(temp / 1000);
  temp %= 1000;

  const hundreds = Math.floor(temp / 100);
  temp %= 100;

  const remaining = temp;

  if (crores > 0) {
    words += (crores < 100 ? marathiNums[crores] : convertNumberToMarathiWords(crores)) + " कोटी ";
  }

  if (lakhs > 0) {
    words += marathiNums[lakhs] + " लाख ";
  }

  if (thousands > 0) {
    words += marathiNums[thousands] + " हजार ";
  }

  if (hundreds > 0) {
    words += marathiNums[hundreds] + "शे ";
  }

  if (remaining > 0) {
    words += marathiNums[remaining] + " ";
  }

  return words.trim() + " रुपये फक्त";
}

// Helper to convert number to English words
function convertNumberToEnglishWords(amount) {
  if (amount === 0) return "Zero";
  
  const units = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
                 "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function helper(num) {
    if (num < 20) return units[num];
    const digit = num % 10;
    return tens[Math.floor(num / 10)] + (digit !== 0 ? " " + units[digit] : "");
  }

  let words = "";
  let temp = Math.floor(amount);

  const crores = Math.floor(temp / 10000000);
  temp %= 10000000;

  const lakhs = Math.floor(temp / 100000);
  temp %= 100000;

  const thousands = Math.floor(temp / 1000);
  temp %= 1000;

  const hundreds = Math.floor(temp / 100);
  temp %= 100;

  const remaining = temp;

  if (crores > 0) {
    words += (crores < 20 ? units[crores] : helper(crores)) + " Crore ";
  }

  if (lakhs > 0) {
    words += helper(lakhs) + " Lakh ";
  }

  if (thousands > 0) {
    words += helper(thousands) + " Thousand ";
  }

  if (hundreds > 0) {
    words += units[hundreds] + " Hundred ";
  }

  if (remaining > 0) {
    words += helper(remaining) + " ";
  }

  return words.trim() + " Rupees Only";
}

/**
 * Generates a beautiful bilingual Marathi/English PDF receipt for a donation or annadaan.
 * Places Devotee Copy at top and Office Copy at bottom on a single A4 sheet.
 * 
 * @param {Object} donation - The donation details.
 * @returns {Promise<Buffer>} A promise that resolves to the PDF buffer.
 */
exports.generateReceiptPdf = (rawDonation) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Clone the object to prevent saving Marathi translated values to the database
      const donation = typeof rawDonation.toObject === 'function' ? rawDonation.toObject() : { ...rawDonation };

      // Async Marathi Conversions
      if (donation.donorName) donation.donorName = await transliterateToMarathi(donation.donorName);
      else if (donation.name) donation.name = await transliterateToMarathi(donation.name);
      
      if (donation.address) donation.address = await transliterateToMarathi(donation.address);
      if (donation.message) donation.message = await translateToMarathi(donation.message);
      if (donation.annadaanType) donation.annadaanType = await translateToMarathi(donation.annadaanType);
      if (donation.paymentApp) donation.paymentApp = await transliterateToMarathi(donation.paymentApp);
      else if (donation.paymentMethod) donation.paymentMethod = await transliterateToMarathi(donation.paymentMethod);

      const isJamaPavti = donation.donationType === "jama_pavti";
      const doc = new PDFDocument({ margin: 20, size: isJamaPavti ? [595.28, 440] : "A4" });
      const buffers = [];

      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", (err) => reject(err));

      const redColor = "#680000";
      const orangeColor = "#b83b1b";
      const lightOrangeColor = "#e67e22";

      // Font Paths
      const fontRegularPath = path.join(__dirname, '../assets/fonts/Mangal-Regular.ttf');
      const fontBoldPath = path.join(__dirname, '../assets/fonts/Mangal-Bold.ttf');

      // Register fonts if available
      if (fs.existsSync(fontRegularPath)) {
        doc.registerFont('Poppins', fontRegularPath);
      }
      if (fs.existsSync(fontBoldPath)) {
        doc.registerFont('Poppins-Bold', fontBoldPath);
      }

      const setRegularFont = (size) => {
        if (fs.existsSync(fontRegularPath)) {
          doc.font('Poppins').fontSize(size);
        } else {
          doc.font('Helvetica').fontSize(size);
        }
      };

      const setBoldFont = (size) => {
        if (fs.existsSync(fontBoldPath)) {
          doc.font('Poppins-Bold').fontSize(size);
        } else {
          doc.font('Helvetica-Bold').fontSize(size);
        }
      };

      const logoPath = path.join(__dirname, '../../frontend/public/logo.png');
      const swamijiPath = path.join(__dirname, '../../frontend/src/assets/kolekar1.jpeg');

      // Format Date & Receipt No
      const receiptDate = donation.approvalDate || donation.date || Date.now();
      const dateStr = new Date(receiptDate).toLocaleDateString("en-IN", {
        day: "2-digit", month: "2-digit", year: "numeric"
      });
      const receiptNo = donation.receiptNumber || donation.donationReference || `REC-${Date.now().toString().slice(-6)}`;

      // Generate words
      const amountMarathi = convertNumberToMarathiWords(donation.amount || 0);
      const amountEnglish = convertNumberToEnglishWords(donation.amount || 0);

      // Reusable function to draw a single receipt block
      const drawReceiptTemplate = (yOffset, copyTitle) => {
        
        if (donation.donationType === "jama_pavti") {
          // --- JAMA PAVTI LAYOUT ---
          const paddingX = 20;
          const rectW = 555;
          const rectH = 385;
          const pinkRed = "#d81b60"; // Pink/Red colour as requested

          // 1. Borders (Red border)
          doc.rect(paddingX, yOffset + 10, rectW, rectH).lineWidth(2).strokeColor(pinkRed).stroke();
          doc.rect(paddingX + 4, yOffset + 14, rectW - 8, rectH - 8).lineWidth(0.5).strokeColor(pinkRed).stroke();

          // Watermark
          if (fs.existsSync(logoPath)) {
            doc.save();
            doc.fillOpacity(0.03).strokeOpacity(0.03);
            doc.image(logoPath, 217, yOffset + 115, { width: 160 });
            doc.restore();
          }

          // 2. Header
          setBoldFont(16);
          doc.fillColor(pinkRed).text("श्री गुरुमूर्ती रुद्रपशुपती लिंगायत मठ निमसोड, मिरज", paddingX, yOffset + 25, { width: rectW, align: 'center' });
          
          setBoldFont(9);
          doc.text("पत्रव्यवहार पत्ता : श्री गुरुमूर्ती रुद्रपशुपती मठ, मु.पो. कोळे ता. सांगोला, जि. सोलापूर ४१३३१४", paddingX, yOffset + 50, { width: rectW, align: 'center' });

          // Left & Right Header Info
          setBoldFont(10);
          doc.fillColor(pinkRed).text("शाखा मठ - जवळा ता. सांगोला", paddingX + 20, yOffset + 75);
          doc.text("ट्रस्ट नं. : ए/ १७५० सांगली", paddingX + 20, yOffset + 75, { width: rectW - 40, align: 'right' });

          // Center: जमा पावती (with rounded rect)
          const boxWidth = 140;
          const boxX = (595 - boxWidth) / 2;
          doc.roundedRect(boxX, yOffset + 85, boxWidth, 24, 12).fill(pinkRed);
          doc.fillColor('white');
          setBoldFont(12);
          doc.text("जमा पावती", boxX, yOffset + 89, { width: boxWidth, align: 'center' });
          
          // Copy Title below
          if (copyTitle) {
            setBoldFont(7.5);
            doc.fillColor(pinkRed).text(`(${copyTitle})`, boxX, yOffset + 110, { width: boxWidth, align: 'center' });
          }

          // Metadata row
          setBoldFont(10);
          doc.fillColor(pinkRed).text("पावती नंबर :", paddingX + 20, yOffset + 130);
          setRegularFont(10);
          doc.fillColor('black').text(receiptNo, paddingX + 85, yOffset + 130);
          doc.moveTo(paddingX + 80, yOffset + 142).lineTo(paddingX + 200, yOffset + 142).lineWidth(0.5).strokeColor(pinkRed).stroke();

          setBoldFont(10);
          doc.fillColor(pinkRed).text("दिनांक :", paddingX + 350, yOffset + 130);
          setRegularFont(10);
          doc.fillColor('black').text(dateStr, paddingX + 395, yOffset + 130);
          doc.moveTo(paddingX + 390, yOffset + 142).lineTo(paddingX + 500, yOffset + 142).lineWidth(0.5).strokeColor(pinkRed).stroke();

          // Body Fields
          const drawField = (y, label, val1, val2 = null, x2 = 0) => {
            setBoldFont(10);
            doc.fillColor(pinkRed).text(label, paddingX + 20, y);
            setRegularFont(10);
            doc.fillColor('black').text(val1 || "N/A", paddingX + 160, y - 2, { width: x2 > 0 ? x2 - (paddingX + 170) : rectW - 190 });
            // Line
            doc.moveTo(paddingX + 155, y + 10).lineTo(x2 > 0 ? x2 - 10 : paddingX + rectW - 30, y + 10).lineWidth(0.5).strokeColor(pinkRed).stroke();

            if (val2 && x2 > 0) {
              setBoldFont(10);
              doc.fillColor(pinkRed).text(val2.label, x2, y);
              setRegularFont(10);
              doc.fillColor('black').text(val2.val || "N/A", x2 + 30, y - 2);
              doc.moveTo(x2 + 25, y + 10).lineTo(paddingX + rectW - 30, y + 10).lineWidth(0.5).strokeColor(pinkRed).stroke();
            }
          };

          const purpose = donation.message || donation.annadaanType || "देणगी";
          let paymentModeStr = "रोख";
          if (donation.utrNumber) {
            paymentModeStr = `UPI (UTR: ${donation.utrNumber})`;
          } else if (donation.paymentApp) {
            paymentModeStr = donation.paymentApp;
          }

          drawField(yOffset + 165, "श्री. / सौ. / श्रीमती", donation.donorName || donation.name);
          drawField(yOffset + 195, "रा.", donation.address, { label: "मो.", val: donation.phone }, paddingX + 350);
          drawField(yOffset + 225, "आजरोजी आपणाकडून", `${purpose}`);
          drawField(yOffset + 255, "अक्षरी रुपये", `${amountMarathi} / ${amountEnglish}`);
          drawField(yOffset + 285, "रोख / चेक / ड्राफ्ट नं.", paymentModeStr);

          // Signature Row & Box
          const bottomY = yOffset + 325;
          
          // Large ₹ Box (Left)
          doc.rect(paddingX + 20, bottomY, 110, 35).fillAndStroke(pinkRed, pinkRed);
          doc.fillColor('white');
          setBoldFont(18);
          doc.text("₹", paddingX + 30, bottomY + 8);
          doc.rect(paddingX + 50, bottomY, 80, 35).fillAndStroke('white', pinkRed);
          doc.fillColor('black');
          setBoldFont(12);
          doc.text(`${donation.amount ? donation.amount.toLocaleString("en-IN") : "0"}/-`, paddingX + 55, bottomY + 11);

          // Bottom Thanks
          setBoldFont(13);
          doc.fillColor(pinkRed).text("धन्यवाद!", paddingX + 20, bottomY + 45);

          // Center: पैसे देणाऱ्याची सही
          const centerTextX = paddingX + 170;
          setBoldFont(11);
          doc.fillColor(pinkRed).text("पैसे देणाऱ्याची सही", centerTextX, bottomY + 45, { width: 140, align: 'center' });
          setRegularFont(9);
          doc.fillColor('black').text(`(${donation.donorName || donation.name || ''})`, centerTextX, bottomY + 25, { width: 140, align: 'center' });

          // Center-Right: removed "मिळाले." as per request

          // Right: पैसे घेणाऱ्याची सही
          const rightTextX = paddingX + 380;
          setBoldFont(11);
          doc.fillColor(pinkRed).text("पैसे घेणाऱ्याची सही", rightTextX, bottomY + 45, { width: 140, align: 'center' });
          setRegularFont(9);
          doc.fillColor('black').text(`(Authorized Trustee)`, rightTextX, bottomY + 25, { width: 140, align: 'center' });

        } else if (donation.donationType === "shakha_pavti") {
          // --- SHAKHA PAVTI LAYOUT (Matching shakha_pavti.jpeg) ---
          // 1. Borders
          doc.rect(20, yOffset + 10, 555, 370).lineWidth(2).strokeColor(orangeColor).stroke();
          doc.rect(24, yOffset + 14, 547, 362).lineWidth(0.5).strokeColor(lightOrangeColor).stroke();

          // Watermark
          if (fs.existsSync(logoPath)) {
            doc.save();
            doc.fillOpacity(0.03).strokeOpacity(0.03);
            doc.image(logoPath, 217, yOffset + 115, { width: 160 });
            doc.restore();
          }

          // 2. Header Section
          if (fs.existsSync(swamijiPath)) {
            doc.image(swamijiPath, 35, yOffset + 25, { width: 55, height: 60 });
          } else {
            doc.rect(35, yOffset + 25, 55, 60).lineWidth(1).strokeColor(orangeColor).stroke();
          }

          if (fs.existsSync(logoPath)) {
            doc.image(logoPath, 505, yOffset + 25, { width: 55, height: 55 });
          } else {
            doc.circle(532, yOffset + 52, 25).lineWidth(1).strokeColor(orangeColor).stroke();
          }

          setBoldFont(7.5);
          doc.fillColor(orangeColor).text("।। धर्माने विश्वाला शांती मिळते ।।", 95, yOffset + 14, { width: 405, align: 'center' });

          setBoldFont(13);
          doc.fillColor(redColor).text("श्री गुरुमुर्ती रुद्रपशुपती लिंगायत मठ संस्थान", 95, yOffset + 24, { width: 405, align: 'center' });
          
          setRegularFont(8.5);
          doc.fillColor('black').text("पत्रव्यवहार पत्ता : श्री गुरुमुर्ती रुद्रपशुपती मठ, मु.पो. कोळे", 95, yOffset + 43, { width: 405, align: 'center' });
          doc.text("ता.सांगोला, जि.सोलापूर ४१३३१४  |  ट्रस्ट नं.: ए/१७५०", 95, yOffset + 56, { width: 405, align: 'center' });
          doc.text("मोबाईल: ८४२१००४८२४, ८४२१००४८२४", 95, yOffset + 69, { width: 405, align: 'center' });

          // Divider line
          doc.moveTo(28, yOffset + 88).lineTo(567, yOffset + 88).lineWidth(1).strokeColor(orangeColor).stroke();

          // 3. Receipt Title Box
          const branchName = donation.branchId ? (donation.branchId.name || "कोळे") : "कोळे";
          doc.roundedRect(170, yOffset + 93, 250, 18, 4).fill(redColor);
          doc.fillColor('white');
          setBoldFont(9.5);
          doc.text(`पावती  |  शाखा मठ - ${branchName}`, 170, yOffset + 98, { width: 250, align: 'center' });

          setBoldFont(7.5);
          doc.fillColor(redColor).text(`(${copyTitle})`, 200, yOffset + 114, { width: 195, align: 'center' });

          // 4. Metadata Row (Receipt No & Date)
          setBoldFont(8.5);
          doc.fillColor('black').text("पावती क्र. / Receipt No :", 35, yOffset + 128);
          setRegularFont(8.5);
          doc.text(receiptNo, 135, yOffset + 128);
          doc.moveTo(130, yOffset + 137).lineTo(250, yOffset + 137).lineWidth(0.5).strokeColor('gray').stroke();

          setBoldFont(8.5);
          doc.text("दिनांक / Date :", 390, yOffset + 128);
          setRegularFont(8.5);
          doc.text(dateStr, 455, yOffset + 128);
          doc.moveTo(450, yOffset + 137).lineTo(550, yOffset + 137).lineWidth(0.5).strokeColor('gray').stroke();

          // 5. Body Rows
          const drawRow = (y, labelMarathi, labelEnglish, value) => {
            setBoldFont(8.5);
            doc.fillColor(redColor).text(labelMarathi, 35, y);
            setRegularFont(7);
            doc.fillColor('gray').text(labelEnglish, 35, y + 10);
            
            setRegularFont(8.5);
            doc.fillColor('black').text(value || "N/A", 175, y + 2, { width: 380 });
            
            doc.moveTo(170, y + 13).lineTo(555, y + 13).lineWidth(0.5).strokeColor('#dddddd').stroke();
          };

          const purpose = donation.message || donation.annadaanType || "साधारण देणगी / General Donation";
          
          drawRow(yOffset + 148, "श्री / सौ / श्रीमती :", "Received From Mr./Mrs./Ms.", donation.donorName || donation.name);
          drawRow(yOffset + 170, "राहणार :", "Residential Address", `${donation.address}  |  आपल्याकडून आज रोजी`);
          drawRow(yOffset + 192, "कारण :", "Purpose of Donation", `${purpose} यासाठी`);
          drawRow(yOffset + 214, "अक्षरी रुपये :", "Amount in Words", `${amountMarathi} / ${amountEnglish}`);
          
          setRegularFont(8.5);
          doc.fillColor('black').text("आज रोजी मिळाले. धन्यवाद.", 35, yOffset + 233);

          // 6. Saffron Amount Box
          doc.rect(35, yOffset + 248, 170, 32).lineWidth(1.5).strokeColor(orangeColor).stroke();
          doc.rect(38, yOffset + 251, 164, 26).lineWidth(0.5).strokeColor(orangeColor).stroke();
          setBoldFont(10);
          doc.fillColor('black').text("रुपये / Rs.", 48, yOffset + 259);
          setBoldFont(12);
          doc.fillColor(redColor).text(`${donation.amount ? donation.amount.toLocaleString("en-IN") : "0"} /-`, 110, yOffset + 257);

          // 7. Shivalinga & Swamiji bottom images
          if (fs.existsSync(logoPath)) {
            doc.image(logoPath, 225, yOffset + 248, { width: 32, height: 32 });
            setBoldFont(7.5);
            doc.fillColor('black').text("धन्यवाद!", 220, yOffset + 283, { width: 42, align: 'center' });
          }
          if (fs.existsSync(swamijiPath)) {
            doc.image(swamijiPath, 280, yOffset + 245, { width: 35, height: 42 });
          }

          // 8. Signature Area
          doc.moveTo(380, yOffset + 267).lineTo(540, yOffset + 267).lineWidth(0.5).strokeColor('black').stroke();
          setBoldFont(8);
          doc.fillColor('black').text("घेणार सही / Receiver's Signature", 380, yOffset + 271, { width: 160, align: 'center' });

          // 9. Bottom Bank & Exemption details
          setBoldFont(7);
          doc.fillColor('black').text("८०-जी आयकर सवलत प्रमाणपत्र उपलब्ध आहे. (80-G Tax Exemption Certificate Available)", 35, yOffset + 295);
          setRegularFont(6.5);
          doc.fillColor('#555555').text("बँक खाते तपशील / Bank A/C: SBI, A/c No: 39582736281, IFSC: SBIN0001234, Branch: Kole", 35, yOffset + 305);

          // 10. Bottom Footer messages
          doc.moveTo(28, yOffset + 318).lineTo(567, yOffset + 318).lineWidth(0.5).strokeColor(orangeColor).stroke();
          
          setBoldFont(8.5);
          doc.fillColor(redColor).text("।। मठाचे बांधकाम प्रगतीपथावर आहे, सढळ हस्ते मदत करा ।।", 28, yOffset + 323, { align: 'center', width: 539 });
          
          setBoldFont(9);
          doc.fillColor(orangeColor).text("|| ॐ नमः शिवाय ||        || हर हर महादेव ||", 28, yOffset + 337, { align: 'center', width: 539 });

        } else {
          // --- DENGI & JAMA PAVTI LAYOUT (Matching dengi_pavti.jpeg) ---
          // 1. Borders
          doc.rect(20, yOffset + 10, 555, 370).lineWidth(2).strokeColor(redColor).stroke();
          doc.rect(24, yOffset + 14, 547, 362).lineWidth(0.5).strokeColor(orangeColor).stroke();

          // Watermark
          if (fs.existsSync(logoPath)) {
            doc.save();
            doc.fillOpacity(0.03).strokeOpacity(0.03);
            doc.image(logoPath, 217, yOffset + 115, { width: 160 });
            doc.restore();
          }

          // 2. Header Section (Slogan, Title, Location - NO PHOTOS as per dengi_pavti.jpeg)
          setBoldFont(7.5);
          doc.fillColor(orangeColor).text("।। ॐ नमः शिवाय ।।          ।।  गुरुनिर्वाण प्रसाद  ।।", 95, yOffset + 14, { width: 405, align: 'center' });

          setBoldFont(13);
          doc.fillColor(redColor).text("श्री श्री श्री १०८ च.ब्र. गुरुमुर्ती गुरुनिर्वाण", 95, yOffset + 23, { width: 405, align: 'center' });
          doc.text("रुद्रपशुपती कोळेकर महास्वामीजी", 95, yOffset + 37, { width: 405, align: 'center' });
          
          setBoldFont(9.5);
          doc.text("कोळे ता. सांगोला जि. सोलापूर", 95, yOffset + 51, { width: 405, align: 'center' });

          setRegularFont(7);
          doc.fillColor('black').text("Shri Shri Shri 108 Ch.Br. Gurumurti Gurunirvan Rudrapashupati Kolekar Mahaswamiji", 95, yOffset + 65, { width: 405, align: 'center' });
          doc.text("Kole, Tal. Sangola, Dist. Solapur.  Mobile: 8421004824, 8421004824", 95, yOffset + 75, { width: 405, align: 'center' });

          // Divider line
          doc.moveTo(28, yOffset + 88).lineTo(567, yOffset + 88).lineWidth(1).strokeColor(orangeColor).stroke();

          // 3. Receipt Title Box
          let receiptTitle = "देणगी पावती / DONATION RECEIPT";
          if (donation.donationType === "shakha_pavti") {
            const branchName = donation.branchId ? (donation.branchId.name || "कोळे") : "कोळे";
            receiptTitle = `शाखा पावती / BRANCH RECEIPT - ${branchName}`;
          }

          const boxWidth = donation.donationType === "shakha_pavti" ? 280 : 195;
          const boxX = 297.5 - (boxWidth / 2); // Center-aligned on A4 (width 595)
          doc.roundedRect(boxX, yOffset + 93, boxWidth, 18, 4).fill(redColor);
          doc.fillColor('white');
          setBoldFont(9);
          doc.text(receiptTitle, boxX, yOffset + 98, { width: boxWidth, align: 'center' });

          setBoldFont(7.5);
          doc.fillColor(redColor).text(`(${copyTitle})`, boxX, yOffset + 114, { width: boxWidth, align: 'center' });

          // 4. Metadata Row (Receipt No & Date)
          setBoldFont(8.5);
          doc.fillColor('black').text("पावती क्र. / Receipt No :", 35, yOffset + 128);
          setRegularFont(8.5);
          doc.text(receiptNo, 135, yOffset + 128);
          doc.moveTo(130, yOffset + 137).lineTo(250, yOffset + 137).lineWidth(0.5).strokeColor('gray').stroke();

          setBoldFont(8.5);
          doc.text("दिनांक / Date :", 390, yOffset + 128);
          setRegularFont(8.5);
          doc.text(dateStr, 455, yOffset + 128);
          doc.moveTo(450, yOffset + 137).lineTo(550, yOffset + 137).lineWidth(0.5).strokeColor('gray').stroke();

          // 5. Body Rows
          const drawRow = (y, labelMarathi, labelEnglish, value) => {
            setBoldFont(8.5);
            doc.fillColor(redColor).text(labelMarathi, 35, y);
            setRegularFont(7);
            doc.fillColor('gray').text(labelEnglish, 35, y + 10);
            
            setRegularFont(8.5);
            doc.fillColor('black').text(value || "N/A", 175, y + 2, { width: 380 });
            
            doc.moveTo(170, y + 13).lineTo(555, y + 13).lineWidth(0.5).strokeColor('#dddddd').stroke();
          };

          const defaultPurpose = donation.donationType === "shakha_pavti" ? "साधारण देणगी / General Donation" : "दीक्षाविधी कार्यक्रमाकरिता";
          const purpose = donation.message || donation.annadaanType || defaultPurpose;
          const utrText = donation.utrNumber ? ` (UTR: ${donation.utrNumber})` : "";
          const paymentDetails = `${donation.paymentApp || donation.paymentMethod || "Online"}${utrText}`;

          drawRow(yOffset + 148, "श्री / सौ / श्रीमती :", "Received From Mr./Mrs./Ms.", donation.donorName || donation.name);
          drawRow(yOffset + 170, "राहणार :", "Residential Address", `${donation.address}  |  आपल्याकडून आज रोजी`);
          drawRow(yOffset + 192, "कारण :", "Purpose of Donation", `${purpose} देणगी`);
          drawRow(yOffset + 214, "अक्षरी रुपये :", "Amount in Words", `${amountMarathi} / ${amountEnglish}`);
          
          setRegularFont(8.5);
          doc.fillColor('black').text("आज रोजी मिळाले. धन्यवाद.", 35, yOffset + 233);

          // 6. Saffron Amount Box
          doc.rect(35, yOffset + 248, 170, 32).lineWidth(1.5).strokeColor(redColor).stroke();
          doc.rect(38, yOffset + 251, 164, 26).lineWidth(0.5).strokeColor(redColor).stroke();
          setBoldFont(10);
          doc.fillColor('black').text("रुपये / Rs.", 48, yOffset + 259);
          setBoldFont(12);
          doc.fillColor(redColor).text(`${donation.amount ? donation.amount.toLocaleString("en-IN") : "0"} /-`, 110, yOffset + 257);

          // 7. Signature Area
          doc.moveTo(380, yOffset + 267).lineTo(540, yOffset + 267).lineWidth(0.5).strokeColor('black').stroke();
          setBoldFont(8);
          doc.fillColor('black').text("घेणार सही / Receiver's Signature", 380, yOffset + 271, { width: 160, align: 'center' });

          // 8. Bottom Bank & Exemption details
          setBoldFont(7);
          doc.fillColor('black').text("८०-जी आयकर सवलत प्रमाणपत्र उपलब्ध आहे. (80-G Tax Exemption Certificate Available)", 35, yOffset + 295);
          setRegularFont(6.5);
          doc.fillColor('#555555').text("बँक खाते तपशील / Bank A/C: SBI, A/c No: 39582736281, IFSC: SBIN0001234, Branch: Kole", 35, yOffset + 305);

          // 9. Bottom Footer messages
          doc.moveTo(28, yOffset + 318).lineTo(567, yOffset + 318).lineWidth(0.5).strokeColor(orangeColor).stroke();
          
          setBoldFont(8.5);
          doc.fillColor(redColor).text("।। मठाचे बांधकाम प्रगतीपथावर आहे, सढळ हस्ते मदत करा ।।", 28, yOffset + 323, { align: 'center', width: 539 });
          
          setBoldFont(9);
          doc.fillColor(orangeColor).text("|| ॐ नमः शिवाय ||        || हर हर महादेव ||", 28, yOffset + 337, { align: 'center', width: 539 });
        }
      };

      // Draw Single Copy
      drawReceiptTemplate(15, ""); // No subtitle needed as per physical copy format

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
