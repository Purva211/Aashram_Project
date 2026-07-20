const Gallery = require("../models/Gallery");

// Get all gallery items
exports.getGalleryItems = async (req, res) => {
  try {
    const items = await Gallery.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const isVideoUrl = (u) => {
  if (!u) return false;
  const lower = u.toLowerCase();
  return lower.includes('youtube.com') || lower.includes('youtu.be') || lower.includes('vimeo.com') ||
         ['.mp4', '.webm', '.mov', '.mkv', '.avi'].some(ext => lower.includes(ext));
};

// Create a gallery item
exports.createGalleryItem = async (req, res) => {
  try {
    const { title, type, category } = req.body;
    let url = req.body.url;
    let itemType = type || 'image';

    if (req.file) {
      url = req.file.path;
      itemType = req.file.mimetype.startsWith('video/') ? 'video' : 'image';
    } else if (url && isVideoUrl(url)) {
      itemType = 'video';
    }

    if (!url) {
      return res.status(400).json({ success: false, message: "Please provide a URL or upload a file" });
    }

    const newItem = await Gallery.create({ title, url, type: itemType, category });
    res.status(201).json({ success: true, data: newItem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a gallery item
exports.updateGalleryItem = async (req, res) => {
  try {
    const { title, type, category } = req.body;
    let url = req.body.url;
    let itemType = type;

    if (req.file) {
      url = req.file.path;
      itemType = req.file.mimetype.startsWith('video/') ? 'video' : 'image';
    } else if (url && isVideoUrl(url)) {
      itemType = 'video';
    }

    const updateData = { title, category };
    if (url) updateData.url = url;
    if (itemType) updateData.type = itemType;
    else if (type) updateData.type = type;

    const item = await Gallery.findByIdAndUpdate(
      req.params.id,
      updateData,
      { returnDocument: 'after', runValidators: true }
    );
    if (!item) {
      return res.status(404).json({ success: false, message: "Gallery item not found" });
    }
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a gallery item
exports.deleteGalleryItem = async (req, res) => {
  try {
    const item = await Gallery.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: "Gallery item not found" });
    }
    res.status(200).json({ success: true, message: "Gallery item deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
