const PDFDocument = require("pdfkit");
const fs = require('fs');
const path = require('path');

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
exports.generateReceiptPdf = (donation) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 20, size: "A4" });
      const buffers = [];

      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", (err) => reject(err));

      const redColor = "#680000";
      const orangeColor = "#b83b1b";
      const lightOrangeColor = "#e67e22";

      // Font Paths
      const fontRegularPath = path.join(__dirname, '../assets/fonts/Poppins-Regular.ttf');
      const fontBoldPath = path.join(__dirname, '../assets/fonts/Poppins-Bold.ttf');

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
      const dateStr = new Date(donation.date || Date.now()).toLocaleDateString("en-IN", {
        day: "2-digit", month: "2-digit", year: "numeric"
      });
      const receiptNo = donation.receiptNumber || donation.donationReference || `REC-${Date.now().toString().slice(-6)}`;

      // Generate words
      const amountMarathi = convertNumberToMarathiWords(donation.amount || 0);
      const amountEnglish = convertNumberToEnglishWords(donation.amount || 0);

      // Reusable function to draw a single receipt block
      const drawReceiptTemplate = (yOffset, copyTitle) => {
        const isShakha = false; // Bypassed to make branch/shakha template same as admin template
        
        if (isShakha) {
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
          if (donation.donationType === "jama_pavti") {
            receiptTitle = "जमा पावती / JAMA RECEIPT";
          } else if (donation.donationType === "shakha_pavti") {
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

      // Draw Top Copy
      drawReceiptTemplate(15, "भाविकाची प्रत / Devotee's Copy");

      // Draw Middle Divider
      doc.save();
      doc.dash(4, { space: 4 }).moveTo(20, 400).lineTo(575, 400).lineWidth(1).strokeColor('gray').stroke();
      doc.restore();

      setRegularFont(6.5);
      doc.fillColor('gray').text("✂ कापण्यासाठी / Cut Here -------------------------------------------------------------", 20, 396, { width: 555, align: 'center' });

      // Draw Bottom Copy
      drawReceiptTemplate(415, "कार्यालयीन प्रत / Office's Copy");

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
