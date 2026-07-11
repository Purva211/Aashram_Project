const Correspondence = require('../models/Correspondence');
const { generateCorrespondencePdf } = require('../utils/correspondenceEngine');

// Helper to add audit log
const addAuditLog = (letter, req, action) => {
  letter.auditTrail.push({
    user: req.user.name || req.user.displayName,
    role: req.user.role,
    action: action,
    ip: req.ip,
    browser: req.headers['user-agent']
  });
};

exports.createLetter = async (req, res) => {
  try {
    const { letterDate, subject, recipient, content } = req.body;
    
    const letter = new Correspondence({
      letterDate,
      subject,
      recipient,
      content,
      createdBy: req.user.name || req.user.displayName,
      createdById: req.user._id
    });

    addAuditLog(letter, req, 'Letter Created (Draft)');
    await letter.save();

    res.status(201).json({ success: true, data: letter });
  } catch (error) {
    console.error("Create Letter Error:", error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateDraft = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const letter = await Correspondence.findById(id);
    if (!letter || letter.isDeleted) {
      return res.status(404).json({ success: false, message: 'Letter not found' });
    }
    
    if (letter.status !== 'Draft') {
      return res.status(400).json({ success: false, message: 'Only Drafts can be updated' });
    }

    Object.assign(letter, updates);
    letter.lastModifiedBy = req.user.name || req.user.displayName;
    addAuditLog(letter, req, 'Draft Updated');
    
    await letter.save();
    res.status(200).json({ success: true, data: letter });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.generateOfficialPdf = async (req, res) => {
  try {
    const { id } = req.params;
    const letter = await Correspondence.findById(id);
    
    if (!letter || letter.isDeleted) {
      return res.status(404).json({ success: false, message: 'Letter not found' });
    }

    // Force save to trigger pre-save hook and generate referenceNumber if it doesn't have one
    if (letter.status === 'Draft') {
        letter.status = 'Generated';
        await letter.save(); 
    }

    // Now generate PDF using engine
    const fileData = await generateCorrespondencePdf(letter.toObject(), letter.referenceNumber);
    
    letter.file = {
      pdfUrl: fileData.pdfUrl,
      pdfName: fileData.pdfName,
      size: fileData.size,
      version: letter.file.version + 1
    };

    letter.status = 'Generated';
    addAuditLog(letter, req, 'PDF Generated');
    
    await letter.save();
    res.status(200).json({ success: true, data: letter });
  } catch (error) {
    console.error("Generate PDF Error:", error);
    res.status(500).json({ success: false, message: 'Server error during PDF generation' });
  }
};

exports.getAllLetters = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    
    let query = { isDeleted: false };
    if (status) query.status = status;
    
    if (search) {
      query.$or = [
        { referenceNumber: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { 'recipient.name': { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const letters = await Correspondence.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
      
    const total = await Correspondence.countDocuments(query);

    res.status(200).json({ 
      success: true, 
      data: letters,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getLetterById = async (req, res) => {
  try {
    const letter = await Correspondence.findById(req.params.id);
    if (!letter || letter.isDeleted) {
      return res.status(404).json({ success: false, message: 'Letter not found' });
    }
    res.status(200).json({ success: true, data: letter });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.archiveLetter = async (req, res) => {
  try {
    const letter = await Correspondence.findById(req.params.id);
    if (!letter || letter.isDeleted) return res.status(404).json({ success: false, message: 'Not found' });
    
    letter.status = 'Archived';
    addAuditLog(letter, req, 'Letter Archived');
    await letter.save();
    
    res.status(200).json({ success: true, data: letter });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteLetter = async (req, res) => {
  try {
    const letter = await Correspondence.findById(req.params.id);
    if (!letter || letter.isDeleted) return res.status(404).json({ success: false, message: 'Not found' });
    
    letter.isDeleted = true;
    letter.deletedAt = new Date();
    letter.status = 'Deleted';
    addAuditLog(letter, req, 'Letter Deleted');
    await letter.save();
    
    res.status(200).json({ success: true, message: 'Letter deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.recordShare = async (req, res) => {
  try {
    const { id } = req.params;
    const { actionType, recipient } = req.body;
    
    const letter = await Correspondence.findById(id);
    if (!letter || letter.isDeleted) return res.status(404).json({ success: false, message: 'Not found' });

    letter.communicationHistory.push({
      actionType,
      recipient,
      performedBy: req.user.name || req.user.displayName
    });

    if (actionType === 'Email') letter.status = 'Email Sent';
    if (actionType === 'WhatsApp' && letter.status !== 'Email Sent') letter.status = 'WhatsApp Shared';

    addAuditLog(letter, req, `${actionType} Shared to ${recipient}`);
    
    await letter.save();
    res.status(200).json({ success: true, data: letter });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
