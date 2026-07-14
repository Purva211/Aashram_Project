const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const savePdfLocally = (pdfBuffer, fileName) => {
  return new Promise((resolve, reject) => {
    try {
      const uploadDir = path.join(__dirname, '../uploads/correspondence');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const filePath = path.join(uploadDir, `${fileName}.pdf`);
      fs.writeFileSync(filePath, pdfBuffer);
      const baseUrl = process.env.BACKEND_URL || process.env.BASE_URL || 'https://aashram-project-1.onrender.com';
      resolve(`${baseUrl}/uploads/correspondence/${fileName}.pdf`);
    } catch (err) {
      reject(err);
    }
  });
};

const generateCorrespondencePdf = async (data, referenceNumber) => {
  const templatePath = path.join(__dirname, '../templates', 'correspondenceTemplate.html');
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template correspondenceTemplate.html not found.`);
  }

  let htmlContent = fs.readFileSync(templatePath, 'utf8');

  // Format recipient details
  let recipientHtml = `<strong>प्रति,</strong><br/>`;
  if (data.recipient.name) recipientHtml += `${data.recipient.name}<br/>`;
  if (data.recipient.organization) recipientHtml += `${data.recipient.organization}<br/>`;
  if (data.recipient.address) recipientHtml += `${data.recipient.address}<br/>`;
  
  let locationParts = [];
  if (data.recipient.city) locationParts.push(data.recipient.city);
  if (data.recipient.state) locationParts.push(data.recipient.state);
  if (data.recipient.country) locationParts.push(data.recipient.country);
  
  if (locationParts.length > 0) {
    recipientHtml += `${locationParts.join(', ')}<br/>`;
  }

  if (data.recipient.email) recipientHtml += `Email: ${data.recipient.email}<br/>`;
  if (data.recipient.mobile) recipientHtml += `Mobile: ${data.recipient.mobile}<br/>`;

  // Replacements
  const replacements = {
    referenceNumber: referenceNumber,
    date: new Date(data.letterDate).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    recipientDetails: recipientHtml,
    subject: data.subject,
    body: data.content.body,
    baseUrl: process.env.BACKEND_URL || process.env.BASE_URL || 'https://aashram-project-1.onrender.com'
  };

  for (const [key, value] of Object.entries(replacements)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    htmlContent = htmlContent.replace(regex, value || '');
  }

  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  await page.emulateMediaType('print');
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

  // Generate PDF (A4 format)
  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });

  await browser.close();

  // Ensure unique file name based on reference number
  const fileName = referenceNumber.replace(/[^a-zA-Z0-9-]/g, '_');
  const pdfUrl = await savePdfLocally(pdfBuffer, fileName);
  
  return {
    pdfUrl,
    pdfName: `${fileName}.pdf`,
    size: pdfBuffer.length
  };
};

module.exports = {
  generateCorrespondencePdf
};
