const LineageMember = require('../models/LineageMember');

// Get all members (Admin view)
exports.getAllMembers = async (req, res) => {
  try {
    const members = await LineageMember.find().populate('parentId', 'name').sort({ createdAt: 1 });
    res.status(200).json({ success: true, data: members });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// Get published members (Public view)
exports.getPublicMembers = async (req, res) => {
  try {
    const members = await LineageMember.find({ status: 'Published' }).sort({ createdAt: 1 });
    res.status(200).json({ success: true, data: members });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// Create a new member
exports.createMember = async (req, res) => {
  try {
    const { name, era, shortDescription, biography, status, parentId } = req.body;

    const newMemberData = {
      name,
      era,
      shortDescription,
      biography,
      status: status || 'Draft',
      parentId: parentId || null
    };

    if (req.files) {
      if (req.files.profileImage) {
        newMemberData.profileImage = req.files.profileImage[0].path;
      }
      if (req.files.galleryImages) {
        newMemberData.galleryImages = req.files.galleryImages.map(f => f.path);
      }
      if (req.files.documents) {
        newMemberData.documents = req.files.documents.map(f => f.path);
      }
    }

    const newMember = new LineageMember(newMemberData);
    const savedMember = await newMember.save();
    
    res.status(201).json({ success: true, data: savedMember });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating member', error: error.message });
  }
};

// Update a member
exports.updateMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, era, shortDescription, biography, status, parentId } = req.body;

    const updateData = { name, era, shortDescription, biography, status, parentId: parentId || null };
    if (req.files) {
      if (req.files.profileImage) {
        updateData.profileImage = req.files.profileImage[0].path;
      }
      if (req.files.galleryImages) {
        updateData.galleryImages = req.files.galleryImages.map(f => f.path);
      }
      if (req.files.documents) {
        updateData.documents = req.files.documents.map(f => f.path);
      }
    }

    const updatedMember = await LineageMember.findByIdAndUpdate(id, updateData, { returnDocument: 'after' });
    
    if (!updatedMember) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    res.status(200).json({ success: true, data: updatedMember });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating member', error: error.message });
  }
};

// Delete a member
exports.deleteMember = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedMember = await LineageMember.findByIdAndDelete(id);
    
    if (!deletedMember) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    res.status(200).json({ success: true, message: 'Member deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting member', error: error.message });
  }
};

// Update status
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedMember = await LineageMember.findByIdAndUpdate(id, { status }, { returnDocument: 'after' });
    
    if (!updatedMember) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    res.status(200).json({ success: true, data: updatedMember });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating status', error: error.message });
  }
};
