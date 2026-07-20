const PDFDocument = require("pdfkit");
const fs = require('fs');
const path = require('path');
const { transliterateToMarathi, translateToMarathi } = require('./translationService');
const { drawJamaPavti } = require('./jamaPavtiGenerator');
const { generateShakhaPavtiPdf } = require('./shakhaPavtiGenerator');
const { generateDengiPavtiPdf } = require('./dengiPavtiGenerator');

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

      const formatBilingual = async (text) => {
        if (!text) return text;
        const marathiText = await translateToMarathi(text);
        return (marathiText.trim() === text.trim()) ? text : `${marathiText} / ${text}`;
      };

      const formatBilingualTransliterate = async (text) => {
        if (!text) return text;
        const marathiText = await transliterateToMarathi(text);
        return (marathiText.trim() === text.trim()) ? text : `${marathiText} / ${text}`;
      };

      const runFallback = async (type) => {
        try {
          if (donation.donorName) donation.donorName = await formatBilingualTransliterate(donation.donorName);
          else if (donation.name) donation.name = await formatBilingualTransliterate(donation.name);
          
          if (donation.address) donation.address = await formatBilingual(donation.address);
          if (donation.message) donation.message = await formatBilingual(donation.message);
          if (donation.annadaanType) donation.annadaanType = await formatBilingual(donation.annadaanType);
          
          if (donation.paymentApp) donation.paymentApp = await transliterateToMarathi(donation.paymentApp);
          else if (donation.paymentMethod) donation.paymentMethod = await transliterateToMarathi(donation.paymentMethod);

          const doc = new PDFDocument({ 
            margin: 20, 
            size: [595.28, 440], 
            info: { Title: type === "shakha_pavti" ? 'Shakha Pavati' : 'Dengi Pavati' }
          });
          const buffers = [];

          doc.on("data", (chunk) => buffers.push(chunk));
          doc.on("end", () => resolve(Buffer.concat(buffers)));
          doc.on("error", (err) => reject(err));

          const logoPath = path.join(__dirname, '../uploads/logo.png');
          const shivlingPath = path.join(__dirname, '../uploads/shiva_linga_logo.png');
          const swamijiPath = path.join(__dirname, '../uploads/guru_swamiji.png');

          const fontRegularPath = path.join(__dirname, '../assets/fonts/Mangal-Regular.ttf');
          const fontBoldPath = path.join(__dirname, '../assets/fonts/Mangal-Bold.ttf');

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

          if (fs.existsSync(fontRegularPath)) {
            doc.registerFont('Poppins', fontRegularPath);
          }
          if (fs.existsSync(fontBoldPath)) {
            doc.registerFont('Poppins-Bold', fontBoldPath);
          }

          const receiptDate = donation.approvalDate || donation.date || Date.now();
          const dateStr = new Date(receiptDate).toLocaleDateString("en-IN", {
            day: "2-digit", month: "2-digit", year: "numeric"
          });
          const receiptNo = donation.receiptNumber || donation.donationReference || `REC-${Date.now().toString().slice(-6)}`;

          const amountMarathi = convertNumberToMarathiWords(donation.amount || 0);
          const amountEnglish = convertNumberToEnglishWords(donation.amount || 0);

          if (type === "shakha_pavti") {
            drawShakhaPavtiFallback(doc, donation, receiptNo, dateStr, amountMarathi, amountEnglish, setBoldFont, setRegularFont, shivlingPath, swamijiPath);
          } else {
            drawDengiPavtiFallback(doc, donation, receiptNo, dateStr, amountMarathi, amountEnglish, setBoldFont, setRegularFont, logoPath);
          }

          doc.end();
        } catch (err) {
          reject(err);
        }
      };

      if (donation.donationType === "dengi_pavti" || !donation.donationType) {
        try {
          const pdfBuffer = await generateDengiPavtiPdf(donation);
          return resolve(pdfBuffer);
        } catch (e) {
          console.warn("[generateReceipt] Puppeteer failed for Dengi Pavti, falling back to PDFKit:", e.message);
          return await runFallback("dengi_pavti");
        }
      } else if (donation.donationType === "shakha_pavti") {
        try {
          const pdfBuffer = await generateShakhaPavtiPdf(donation);
          return resolve(pdfBuffer);
        } catch (e) {
          console.warn("[generateReceipt] Puppeteer failed for Shakha Pavti, falling back to PDFKit:", e.message);
          return await runFallback("shakha_pavti");
        }
      }
      // Async Marathi Conversions

      // Async Marathi Conversions
      if (donation.donorName) donation.donorName = await formatBilingualTransliterate(donation.donorName);
      else if (donation.name) donation.name = await formatBilingualTransliterate(donation.name);
      
      if (donation.address) donation.address = await formatBilingual(donation.address);
      if (donation.message) donation.message = await formatBilingual(donation.message);
      if (donation.annadaanType) donation.annadaanType = await formatBilingual(donation.annadaanType);
      
      // Payment methods can remain transliterated to avoid weird translations
      if (donation.paymentApp) donation.paymentApp = await transliterateToMarathi(donation.paymentApp);
      else if (donation.paymentMethod) donation.paymentMethod = await transliterateToMarathi(donation.paymentMethod);

      const isJamaPavti = donation.donationType === "jama_pavti";
      const doc = new PDFDocument({ 
        margin: 20, 
        size: isJamaPavti ? [595.28, 440] : "A4",
        info: { Title: isJamaPavti ? 'Jama Pavati' : 'Receipt' }
      });
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

      const logoPath = path.join(__dirname, '../uploads/logo.png');
      const swamijiPath = path.join(__dirname, '../uploads/guru_swamiji.png');

      // Format Date & Receipt No
      const receiptDate = donation.approvalDate || donation.date || Date.now();
      const dateStr = new Date(receiptDate).toLocaleDateString("en-IN", {
        day: "2-digit", month: "2-digit", year: "numeric"
      });
      const receiptNo = donation.receiptNumber || donation.donationReference || `REC-${Date.now().toString().slice(-6)}`;

      // Generate words
      const amountMarathi = convertNumberToMarathiWords(donation.amount || 0);
      const amountEnglish = convertNumberToEnglishWords(donation.amount || 0);

      // Prepare context for the separated template files
      const ctx = {
        doc, donation,
        logoPath, swamijiPath, receiptNo, dateStr,
        amountMarathi, amountEnglish,
        setBoldFont, setRegularFont,
        redColor, orangeColor, lightOrangeColor
      };

      const drawReceiptTemplate = (yOffset, copyTitle) => {
        ctx.yOffset = yOffset;
        ctx.copyTitle = copyTitle;

        if (donation.donationType === "jama_pavti") {
          drawJamaPavti(ctx);
        }
      };

      if (isJamaPavti) {
        // Draw Single Copy
        drawReceiptTemplate(15, ""); // No subtitle needed as per physical copy format
      } else {
        // Draw Top Copy
        drawReceiptTemplate(15, "भाविकाची प्रत / Devotee's Copy");

        // Draw Middle Divider
        doc.save();
        doc.dash(4, { space: 4 }).moveTo(20, 415).lineTo(575, 415).lineWidth(1).strokeColor('gray').stroke();
        doc.restore();

        setRegularFont(6.5);
        doc.fillColor('gray').text("✂ कापण्यासाठी / Cut Here -------------------------------------------------------------", 20, 411, { width: 555, align: 'center' });

        // Draw Bottom Copy
        drawReceiptTemplate(420, "कार्यालयीन प्रत / Office's Copy");
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

const drawDengiPavtiFallback = (doc, donation, receiptNo, dateStr, amountMarathi, amountEnglish, setBoldFont, setRegularFont, logoPath) => {
  const paddingX = 20;
  const rectW = 555;
  const rectH = 385;
  const pinkRed = "#be1e4d";

  doc.rect(paddingX, 10, rectW, rectH).lineWidth(2).strokeColor(pinkRed).stroke();
  doc.rect(paddingX + 4, 14, rectW - 8, rectH - 8).lineWidth(0.5).strokeColor(pinkRed).stroke();

  if (fs.existsSync(logoPath)) {
    try {
      doc.save();
      doc.fillOpacity(0.03).strokeOpacity(0.03);
      doc.image(logoPath, 217, 115, { width: 160 });
      doc.restore();
    } catch (e) {}
  }

  setBoldFont(11);
  doc.fillColor(pinkRed).text("।। ॐ नमः शिवाय ।। ।। गुरुनिर्वाण प्रसाद ।।", paddingX, 25, { width: rectW, align: 'center' });
  
  setBoldFont(16);
  doc.text("श्री श्री श्री १०८ ष.ब्र.गुरुमुर्ती गुरुनिर्वाण", paddingX, 40, { width: rectW, align: 'center' });
  setBoldFont(14);
  doc.text("रुद्रपशुपती कोळेकर महास्वामीजी", paddingX, 60, { width: rectW, align: 'center' });
  
  setBoldFont(10);
  doc.text("मु.पो. कोळे ता. सांगोला, जि. सोलापूर", paddingX, 80, { width: rectW, align: 'center' });

  const boxWidth = 140;
  const boxX = (595 - boxWidth) / 2;
  doc.roundedRect(boxX, 100, boxWidth, 24, 12).fill(pinkRed);
  doc.fillColor('white');
  setBoldFont(12);
  doc.text("देणगी पावती", boxX, 104, { width: boxWidth, align: 'center' });

  setBoldFont(10);
  doc.fillColor(pinkRed).text("पावती क्र. :", paddingX + 20, 140);
  setRegularFont(10);
  doc.fillColor('black').text(receiptNo, paddingX + 85, 140);
  doc.moveTo(paddingX + 80, 152).lineTo(paddingX + 200, 152).lineWidth(0.5).strokeColor(pinkRed).stroke();

  setBoldFont(10);
  doc.fillColor(pinkRed).text("दिनांक :", paddingX + 350, 140);
  setRegularFont(10);
  doc.fillColor('black').text(dateStr, paddingX + 395, 140);
  doc.moveTo(paddingX + 390, 152).lineTo(paddingX + 500, 152).lineWidth(0.5).strokeColor(pinkRed).stroke();

  const drawField = (y, label, val1, val2 = null, x2 = 0) => {
    setBoldFont(10);
    doc.fillColor(pinkRed).text(label, paddingX + 20, y);
    setRegularFont(10);
    doc.fillColor('black').text(val1 || "", paddingX + 130, y - 2, { width: x2 > 0 ? x2 - (paddingX + 140) : rectW - 160 });
    doc.moveTo(paddingX + 125, y + 10).lineTo(x2 > 0 ? x2 - 10 : paddingX + rectW - 30, y + 10).lineWidth(0.5).strokeColor(pinkRed).stroke();

    if (val2 && x2 > 0) {
      setBoldFont(10);
      doc.fillColor(pinkRed).text(val2.label, x2, y);
      setRegularFont(10);
      doc.fillColor('black').text(val2.val || "", x2 + 30, y - 2);
      doc.moveTo(x2 + 25, y + 10).lineTo(paddingX + rectW - 30, y + 10).lineWidth(0.5).strokeColor(pinkRed).stroke();
    }
  };

  const purpose = donation.message || donation.annadaanType || "देणगी / Donation";
  drawField(175, "श्री / सौ / श्रीमती", donation.donorName || donation.name);
  drawField(205, "राहणार", donation.address || "", { label: "मो.", val: donation.phone || donation.mobile }, paddingX + 350);
  drawField(235, "देणगी प्रकार", purpose);
  drawField(265, "अक्षरी रुपये", `${amountMarathi} / ${amountEnglish}`);

  const bottomY = 305;
  doc.rect(paddingX + 20, bottomY, 110, 35).fillAndStroke(pinkRed, pinkRed);
  doc.fillColor('white');
  setBoldFont(18);
  doc.text("₹", paddingX + 30, bottomY + 8);
  doc.rect(paddingX + 50, bottomY, 80, 35).fillAndStroke('white', pinkRed);
  doc.fillColor('black');
  setBoldFont(12);
  doc.text(`${donation.amount ? donation.amount.toLocaleString("en-IN") : "0"}/-`, paddingX + 55, bottomY + 11);

  setBoldFont(13);
  doc.fillColor(pinkRed).text("धन्यवाद!", paddingX + 20, bottomY + 45);

  const rightTextX = paddingX + 350;
  setBoldFont(10);
  doc.fillColor(pinkRed).text("देणगी स्विकारणाऱ्याची सही", rightTextX, bottomY + 45, { width: 180, align: 'center' });
};

const drawShakhaPavtiFallback = (doc, donation, receiptNo, dateStr, amountMarathi, amountEnglish, setBoldFont, setRegularFont, logoPath, swamijiPath) => {
  const paddingX = 20;
  const rectW = 555;
  const rectH = 385;
  const orangeColor = "#F58220";
  const darkRed = "#8B2D3B";

  doc.rect(paddingX, 10, rectW, rectH).lineWidth(2).strokeColor(orangeColor).stroke();
  doc.rect(paddingX + 4, 14, rectW - 8, rectH - 8).lineWidth(0.5).strokeColor(darkRed).stroke();

  if (fs.existsSync(swamijiPath)) {
    try {
      doc.image(swamijiPath, paddingX + 15, 20, { width: 60, height: 75 });
    } catch (e) {}
  }
  
  setBoldFont(9);
  doc.fillColor('#222222').text("।। धर्माने विश्वाला शांती मिळते ।।", paddingX + 85, 20, { width: rectW - 170, align: 'center' });
  
  setBoldFont(14);
  doc.fillColor('#D32F2F').text("श्री गुरुमूर्ती रुद्रपशुपती लिंगायत मठ संस्थान", paddingX + 85, 32, { width: rectW - 170, align: 'center' });
  
  setBoldFont(7.5);
  doc.fillColor('#333333').text("पत्रव्यवहार पत्ता : श्री गुरुमूर्ती रुद्रपशुपती मठ, मु.पो. कोळे ता.सांगोला, जि.सोलापूर ४१३३१४", paddingX + 85, 52, { width: rectW - 170, align: 'center' });
  
  setBoldFont(8);
  doc.fillColor('white').roundedRect(paddingX + 220, 64, 115, 14, 7).fill(darkRed);
  doc.fillColor('white').text("ट्रस्ट नं.: ए/१७५०", paddingX + 220, 67, { width: 115, align: 'center' });

  setBoldFont(11);
  doc.fillColor('#D8B321').text("पावती", paddingX + 180, 85);
  const branchName = donation.branchId ? (donation.branchId.name || "कोळे") : "कोळे";
  setBoldFont(9.5);
  doc.fillColor('#8B2D3B').text("शाखा मठ - ", paddingX + 230, 85);
  setRegularFont(10);
  doc.fillColor('#1A365D').text(branchName, paddingX + 285, 84);

  setBoldFont(10);
  doc.fillColor('#222222').text("पावती क्र. :", paddingX + 20, 115);
  setBoldFont(11);
  doc.fillColor('#D32F2F').text(receiptNo, paddingX + 85, 115);
  doc.moveTo(paddingX + 80, 127).lineTo(paddingX + 200, 127).lineWidth(0.5).strokeColor('#5B7590').stroke();

  setBoldFont(10);
  doc.fillColor('#222222').text("दिनांक :", paddingX + 350, 115);
  setRegularFont(10);
  doc.fillColor('#1A365D').text(dateStr, paddingX + 395, 115);
  doc.moveTo(paddingX + 390, 127).lineTo(paddingX + 500, 127).lineWidth(0.5).strokeColor('#5B7590').stroke();

  const drawField = (y, label, val1, val2 = null, x2 = 0) => {
    setBoldFont(10);
    doc.fillColor('#222222').text(label, paddingX + 20, y);
    setRegularFont(10);
    doc.fillColor('#1A365D').text(val1 || "", paddingX + 130, y - 2, { width: x2 > 0 ? x2 - (paddingX + 140) : rectW - 160 });
    doc.moveTo(paddingX + 125, y + 10).lineTo(x2 > 0 ? x2 - 10 : paddingX + rectW - 30, y + 10).lineWidth(0.5).strokeColor('#5B7590').stroke();

    if (val2 && x2 > 0) {
      setBoldFont(10);
      doc.fillColor('#222222').text(val2.label, x2, y);
      setRegularFont(10);
      doc.fillColor('#1A365D').text(val2.val || "", x2 + 30, y - 2);
      doc.moveTo(x2 + 25, y + 10).lineTo(paddingX + rectW - 30, y + 10).lineWidth(0.5).strokeColor('#5B7590').stroke();
    }
  };

  const purpose = donation.message || donation.annadaanType || "साधारण देणगी";
  drawField(150, "श्री/सौ/श्रीमती", donation.donorName || donation.name);
  drawField(185, "राहणार", donation.address || "", { label: "मो.", val: donation.phone || donation.mobile }, paddingX + 350);
  drawField(220, "आपणाकडून आज रोजी", purpose);
  drawField(255, "अक्षरी रुपये", `${amountMarathi} / ${amountEnglish}`);

  const bottomY = 300;
  
  doc.save();
  doc.translate(paddingX + 25, bottomY + 10);
  doc.rotate(45);
  doc.rect(-8, -8, 16, 16).fill('#D32F2F');
  doc.restore();
  
  doc.fillColor('white');
  setBoldFont(10);
  doc.text("₹", paddingX + 22, bottomY + 7);

  doc.roundedRect(paddingX + 40, bottomY, 110, 24, 12).fill('#8B2D3B');
  doc.fillColor('white');
  setBoldFont(10);
  doc.text(`₹ ${donation.amount ? donation.amount.toLocaleString("en-IN") : "0"}`, paddingX + 40, bottomY + 7, { width: 110, align: 'center' });

  if (fs.existsSync(logoPath)) {
    try {
      doc.image(logoPath, paddingX + 220, bottomY - 5, { width: 35, height: 25 });
    } catch (e) {}
  }
  setBoldFont(12);
  doc.fillColor('#D32F2F').text("धन्यवाद!", paddingX + 260, bottomY + 5);

  setBoldFont(9.5);
  doc.fillColor('#222222').text("देणगी स्वीकारणाराची सही", paddingX + 370, bottomY + 5, { width: 150, align: 'center' });
};
