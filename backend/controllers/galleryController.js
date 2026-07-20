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

// Create a gallery item
exports.createGalleryItem = async (req, res) => {
  try {
    const { title, type, category } = req.body;
    let url = req.body.url;

    if (req.file) {
      url = req.file.path;
    }

    if (!url) {
      return res.status(400).json({ success: false, message: "Please provide a URL or upload a file" });
    }

    const newItem = await Gallery.create({ title, url, type, category });
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

    if (req.file) {
      url = req.file.path;
    }

    const updateData = { title, type, category };
    if (url) updateData.url = url;

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
