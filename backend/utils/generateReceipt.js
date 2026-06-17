const PDFDocument = require("pdfkit");
const fs = require('fs');
const path = require('path');

/**
 * Generates a PDF receipt for a donation or annadaan.
 * 
 * @param {Object} donation - The donation details.
 * @param {string} donation.donorName - The name of the devotee.
 * @param {string} donation.name - Alternative name of the devotee.
 * @param {number} donation.amount - The donation amount.
 * @param {string} donation.message - Purpose of donation.
 * @param {string} donation.annadaanType - Purpose of annadaan.
 * @param {string} donation.utrNumber - UTR number.
 * @param {string} donation.status - Status.
 * @param {string} donation.paymentApp - Payment app.
 * @param {string} donation.address - Address.
 * @param {string} donation.phone - Phone number.
 * @param {string} donation.receiptNumber - Receipt Number.
 * @param {string} donation.donationReference - Alternative Receipt Number.
 * @param {Date|string} donation.date - The date of the donation.
 * @returns {Promise<Buffer>} A promise that resolves to the PDF buffer.
 */
exports.generateReceiptPdf = (donation) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: "A4" });
      const buffers = [];

      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", (err) => reject(err));

      const redColor = "#680000";
      const orangeColor = "#b83b1b";
      const lightOrangeColor = "#e67e22";
      const yellowBg = "#ffe89c";
      const brightRed = "#da3c0b";

      // 1. Draw Outer Borders
      doc.rect(15, 15, 565, 812).lineWidth(3).strokeColor(orangeColor).stroke();
      doc.rect(20, 20, 555, 802).lineWidth(1).strokeColor(lightOrangeColor).stroke();

      // Background Watermark (opacity handled via PDF graphics state)
      const logoPath = path.join(__dirname, '../../frontend/public/logo.png');
      if (fs.existsSync(logoPath)) {
        doc.save();
        doc.fillOpacity(0.06).strokeOpacity(0.06);
        doc.image(logoPath, 150, 250, { width: 300 });
        doc.restore();
      }

      // 2. Header Section
      // Real Logo
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 40, 40, { width: 120, height: 120, fit: [120, 120] });
      } else {
        doc.circle(100, 100, 50).lineWidth(2).strokeColor(redColor).stroke();
        doc.font("Helvetica-Bold").fontSize(12).fillColor(redColor).text("KOLEKAR", 65, 95);
      }

      // Main Titles
      doc.font("Helvetica-Bold").fontSize(24).fillColor(redColor).text("KOLEKAR MAHASWAMIJI\nMATH, KOLE", 180, 50, { width: 380, align: "center", lineGap: 5 });
      
      // Pill shape for subtitle (Moved down to avoid overlap with line height)
      doc.roundedRect(240, 130, 230, 22, 11).fill(redColor);
      doc.fillColor("white").fontSize(12).text("* MUKHYA SHAKHA MATH-KOLE *", 240, 136, { width: 230, align: "center" });

      doc.fillColor(redColor).fontSize(14).text("Shri. Gurumurti Rudrapashupati", 180, 163, { align: "center", width: 380 });
      doc.text("Lingayat Math Sansthan, Nimsod.", 180, 180, { align: "center", width: 380 });

      // Horizontal decorative line
      doc.moveTo(250, 203).lineTo(490, 203).lineWidth(1).strokeColor(orangeColor).stroke();

      doc.moveDown(3);

      // 3. Contact Info
      doc.font("Helvetica-Bold").fontSize(11).fillColor("black");
      doc.text("Head Office: Kole", 40, 225);
      doc.text("Email: gurumurtikolekarmaharaj44@gmail.com", 40, 243);
      doc.text("Contact No: 8421004824", 40, 261);

      // 4. Exemption & Receipt Info Bar
      const dateStr = new Date(donation.date || Date.now()).toLocaleDateString("en-IN", {
        day: "2-digit", month: "2-digit", year: "numeric"
      });
      const receiptNo = donation.receiptNumber || donation.donationReference || `REC-${Date.now().toString().slice(-6)}`;

      doc.rect(20, 285, 555, 35).fill(yellowBg);
      doc.moveTo(20, 285).lineTo(575, 285).lineWidth(1).strokeColor(orangeColor).stroke();
      doc.moveTo(20, 320).lineTo(575, 320).lineWidth(1).strokeColor(orangeColor).stroke();

      doc.fillColor("black").fontSize(11);
      doc.text("Income Tax Exemption (80-G) Number:", 40, 297);
      doc.moveTo(260, 307).lineTo(380, 307).lineWidth(1).strokeColor("black").stroke();

      doc.text(`Receipt No:   ${receiptNo}`, 400, 290);
      doc.moveTo(465, 300).lineTo(560, 300).lineWidth(1).strokeColor("black").stroke();
      
      doc.text(`Date:            ${dateStr}`, 400, 307);
      doc.moveTo(465, 317).lineTo(560, 317).lineWidth(1).strokeColor("black").stroke();

      // 5. Two Column Details
      const leftX = 40;
      const rightX = 350;
      const startY = 350;

      // --- Left Column ---
      doc.font("Helvetica-Bold").fontSize(14).fillColor(redColor).text("Donors Detail:", leftX, startY);
      doc.font("Helvetica-Oblique").fontSize(12).fillColor("black").text("Received With Thanks", leftX, startY + 25);

      // From
      doc.font("Helvetica-Bold").fontSize(11).text("From", leftX, startY + 60);
      doc.text(donation.donorName || donation.name || "N/A", leftX + 45, startY + 60);
      doc.moveTo(leftX + 40, startY + 72).lineTo(leftX + 280, startY + 72).lineWidth(1).strokeColor("gray").stroke();

      // Address
      doc.text("Address:", leftX, startY + 95);
      doc.text(donation.address || "N/A", leftX + 60, startY + 95, { width: 220, height: 30 });
      doc.moveTo(leftX + 55, startY + 107).lineTo(leftX + 280, startY + 107).lineWidth(1).strokeColor("gray").stroke();
      doc.moveTo(leftX + 55, startY + 127).lineTo(leftX + 280, startY + 127).lineWidth(1).strokeColor("gray").stroke();

      // Contact No
      doc.text("Contact No:", leftX, startY + 150);
      doc.text(donation.phone || "N/A", leftX + 75, startY + 150);
      doc.moveTo(leftX + 70, startY + 162).lineTo(leftX + 280, startY + 162).lineWidth(1).strokeColor("gray").stroke();

      // INR Box
      doc.rect(leftX, startY + 190, 280, 40).lineWidth(1).strokeColor(lightOrangeColor).stroke();
      doc.fontSize(14).fillColor("black").text("INR.", leftX + 15, startY + 203);
      doc.text(donation.amount ? donation.amount.toLocaleString("en-IN") : "", leftX + 80, startY + 203);
      doc.moveTo(leftX + 70, startY + 215).lineTo(leftX + 260, startY + 215).lineWidth(1).strokeColor("black").stroke();


      // --- Right Column ---
      const drawRightBox = (yOffset, title, values) => {
        const y = startY + yOffset;
        doc.rect(rightX, y, 205, 20).fill(brightRed);
        doc.font("Helvetica-Bold").fontSize(11).fillColor("white").text(title, rightX + 10, y + 5);
        
        doc.fillColor("black").fontSize(11);
        
        // Ensure at least one line is drawn, but no empty extra lines
        const linesToDraw = values.length > 0 ? values : [""];
        
        linesToDraw.forEach((val, index) => {
           const lineY = y + 30 + (index * 25);
           doc.text(val, rightX + 5, lineY);
           doc.moveTo(rightX, lineY + 12).lineTo(rightX + 205, lineY + 12).lineWidth(1).strokeColor("black").stroke();
        });
        
        // Return the total height consumed so the next box can be positioned correctly
        return 20 + 10 + (linesToDraw.length * 25);
      };

      const purpose = donation.message || donation.annadaanType || "General Donation";
      const status = donation.status || "Completed";
      const mode = donation.paymentApp || donation.paymentMethod || "Online";
      const utr = donation.utrNumber ? `UTR No: ${donation.utrNumber}` : "UTR No: N/A";

      let currentRightYOffset = 0;
      
      // Transaction Detail
      currentRightYOffset += drawRightBox(currentRightYOffset, "Transaction Detail:", [utr]);
      currentRightYOffset += 15; // padding
      
      // Purpose of Donation
      currentRightYOffset += drawRightBox(currentRightYOffset, "Purpose of Donation:", [purpose]);
      currentRightYOffset += 15;
      
      // Payment Details
      currentRightYOffset += drawRightBox(currentRightYOffset, "Payment Details:", [status]);
      currentRightYOffset += 15;
      
      // Mode of Payment
      drawRightBox(currentRightYOffset, "Mode of Payment:", [mode]);

      // 6. Footer
      doc.moveTo(400, 720).lineTo(550, 720).lineWidth(1).strokeColor("black").stroke();
      doc.font("Helvetica-Bold").fontSize(10).fillColor("black").text("Authorised Signatory", 400, 725, { width: 150, align: "center" });

      doc.moveTo(40, 750).lineTo(555, 750).lineWidth(1).strokeColor(orangeColor).stroke();
      
      // Footer Decorative Icon
      if (fs.existsSync(logoPath)) {
         doc.image(logoPath, 285, 735, { width: 20 });
      }
      doc.font("Helvetica-Bold").fontSize(14).fillColor(redColor).text("|| OM NAMAH SHIVAY ||      || HAR HAR MAHADEV ||", 40, 770, { align: "center" });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
