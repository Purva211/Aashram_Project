require('dotenv').config();
require('dns').setDefaultResultOrder('ipv4first');
const mailService = require('./services/mailService');

(async () => {
  try {
    console.log("Testing email configuration...");
    console.log("EMAIL_USER:", process.env.EMAIL_USER ? "SET" : "UNSET");
    console.log("EMAIL_PASS:", process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD ? "SET" : "UNSET");
    console.log("EMAIL_HOST:", process.env.EMAIL_HOST);
    console.log("EMAIL_PORT:", process.env.EMAIL_PORT);
    console.log("EMAIL_SECURE:", process.env.EMAIL_SECURE);

    await mailService.sendNotificationEmail(
      "test@example.com",
      "Test Email",
      "This is a test email."
    );
    console.log("Email sent successfully!");
  } catch (err) {
    console.error("Error sending email:", err);
  }
})();
