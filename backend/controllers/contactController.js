const sendEmail = require('../utils/sendEmail');

exports.sendContactEmail = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const subject = `New Contact Form Submission from ${name}`;
    const text = `
You have received a new message from the contact form:

Name: ${name}
Email: ${email}
Message: 
${message}
    `;

    // send to shrirudrpashupati@gmail.com
    await sendEmail({
      email: "shrirudrpashupati@gmail.com",
      subject: subject,
      message: text
    });

    res.status(200).json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    console.error('Contact Email Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
