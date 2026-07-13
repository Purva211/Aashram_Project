const sendEmail = require('../utils/sendEmail');
const ContactEnquiry = require('../models/ContactEnquiry');

exports.sendContactEmail = async (req, res) => {
  try {
    const { name, phone, subject, message } = req.body;
    const email = req.user.email; // Extracted from authenticated user

    if (!name || !message) {
      return res.status(400).json({ success: false, message: 'Name and message are required' });
    }

    // Save to database
    const newEnquiry = await ContactEnquiry.create({
      user: req.user._id,
      name,
      email,
      phone,
      subject,
      message,
      ipAddress: req.ip || req.connection.remoteAddress
    });

    const emailSubject = subject || `New Contact Form Submission from ${name}`;
    const text = `
You have received a new message from the contact form:

Name: ${name}
Email: ${email}
Phone: ${phone || 'Not provided'}
Subject: ${subject || 'Not provided'}
Message: 
${message}
    `;

    // Send email notification using compliant approach
    await sendEmail({
      email: "gurumurtikolekarmaharaj44@gmail.com",
      replyTo: email,
      from: `"Contact Form - Website" <gurumurtikolekarmaharaj44@gmail.com>`,
      subject: emailSubject,
      message: text
    });

    res.status(200).json({ success: true, message: 'Message sent successfully', enquiryId: newEnquiry._id });
  } catch (error) {
    console.error('Contact Email Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// CRUD operations for Trust Dashboard
exports.getEnquiries = async (req, res) => {
  try {
    const { status, search, sort = '-createdAt', page = 1, limit = 20 } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const enquiries = await ContactEnquiry.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'name email');

    const total = await ContactEnquiry.countDocuments(query);

    res.status(200).json({
      success: true,
      count: enquiries.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: enquiries
    });
  } catch (error) {
    console.error('Get Enquiries Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getEnquiryById = async (req, res) => {
  try {
    const enquiry = await ContactEnquiry.findById(req.params.id).populate('user', 'name email');
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }
    res.status(200).json({ success: true, data: enquiry });
  } catch (error) {
    console.error('Get Enquiry By Id Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateEnquiryStatus = async (req, res) => {
  try {
    const { status, internalNote } = req.body;
    
    const enquiry = await ContactEnquiry.findById(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }

    if (status) {
      enquiry.status = status;
    }

    if (internalNote) {
      enquiry.internalNotes.push({
        note: internalNote,
        addedBy: req.user.name || req.user.displayName || 'Trustee',
        date: Date.now()
      });
    }

    await enquiry.save();
    res.status(200).json({ success: true, data: enquiry });
  } catch (error) {
    console.error('Update Enquiry Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteEnquiry = async (req, res) => {
  try {
    const enquiry = await ContactEnquiry.findById(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found' });
    }

    await enquiry.deleteOne();
    res.status(200).json({ success: true, message: 'Enquiry deleted successfully' });
  } catch (error) {
    console.error('Delete Enquiry Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
