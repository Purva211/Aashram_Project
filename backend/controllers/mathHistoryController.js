const MathHistory = require('../models/MathHistory');
const fs = require('fs');
const path = require('path');

// Get all records (Admin/Trustee view)
exports.getAllRecords = async (req, res) => {
  try {
    const records = await MathHistory.find().sort({ order: 1, createdAt: -1 });
    res.status(200).json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// Get published records (Public view)
exports.getPublicRecords = async (req, res) => {
  try {
    const records = await MathHistory.find({ status: 'Published' }).sort({ order: 1, createdAt: -1 });
    res.status(200).json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// Create a new record
exports.createRecord = async (req, res) => {
  try {
    const { title, era, content, category, status, order } = req.body;
    let media = [];

    if (req.files && req.files.length > 0) {
      media = req.files.map(file => {
        // Determine type based on mimetype
        let type = 'document';
        if (file.mimetype.startsWith('image/')) type = 'image';
        else if (file.mimetype.startsWith('video/')) type = 'video';
        
        return {
          url: `/uploads/${file.filename}`,
          type
        };
      });
    }

    const newRecord = new MathHistory({
      title,
      era,
      content,
      category: category || 'Origin',
      status: status || 'Draft',
      order: order ? parseInt(order) : 0,
      media
    });

    const savedRecord = await newRecord.save();
    res.status(201).json({ success: true, data: savedRecord });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating record', error: error.message });
  }
};

// Update a record
exports.updateRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, era, content, category, status, order } = req.body;

    let updateData = { title, era, content, category, status, order };

    if (req.files && req.files.length > 0) {
      const media = req.files.map(file => {
        let type = 'document';
        if (file.mimetype.startsWith('image/')) type = 'image';
        else if (file.mimetype.startsWith('video/')) type = 'video';
        
        return {
          url: `/uploads/${file.filename}`,
          type
        };
      });
      // Optionally could append or replace. For simplicity, replace if new files uploaded.
      updateData.media = media;
    }

    const updatedRecord = await MathHistory.findByIdAndUpdate(id, updateData, { returnDocument: 'after' });
    if (!updatedRecord) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    res.status(200).json({ success: true, data: updatedRecord });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating record', error: error.message });
  }
};

// Delete a record
exports.deleteRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRecord = await MathHistory.findByIdAndDelete(id);
    
    if (!deletedRecord) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    res.status(200).json({ success: true, message: 'Record deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting record', error: error.message });
  }
};

// Update status
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedRecord = await MathHistory.findByIdAndUpdate(id, { status }, { returnDocument: 'after' });
    if (!updatedRecord) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    res.status(200).json({ success: true, data: updatedRecord });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating status', error: error.message });
  }
};
