const Branch = require("../models/Branch");

exports.createBranch = async (req, res) => {
  try {
    const userRole = req.user.role;
    if (userRole === "Admin" || userRole === "BranchManager") {
      return res.status(403).json({ success: false, message: "Not authorized to create branches." });
    }

    const { name, location, contact, description } = req.body;
    
    if (!name || !location) {
      return res.status(400).json({ success: false, message: "Name and location are required" });
    }

    let image = "";
    if (req.file) {
      image = `${process.env.BACKEND_URL || 'http://localhost:5000'}/uploads/${req.file.filename}`;
    }

    const branch = new Branch({ name, location, contact, description, image });
    await branch.save();
    
    res.status(201).json({ success: true, branch });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getBranches = async (req, res) => {
  try {
    const branches = await Branch.find().sort({ createdAt: -1 });
    res.json({ success: true, branches });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateBranch = async (req, res) => {
  try {
    const userRole = req.user.role;
    const branchId = req.params.id;

    if (userRole === "Admin") {
      return res.status(403).json({ success: false, message: "Admins are read-only." });
    }

    if (userRole === "BranchManager" && (!req.user.branch || req.user.branch.toString() !== branchId)) {
      return res.status(403).json({ success: false, message: "Not authorized to update this branch." });
    }

    const { name, location, contact, description } = req.body;
    const updateData = { name, location, contact, description };

    if (userRole === "BranchManager" && req.body.members) {
      try {
        updateData.members = typeof req.body.members === 'string' ? JSON.parse(req.body.members) : req.body.members;
      } catch(e) {
        console.error("Failed to parse members:", e);
      }
    }

    if (req.file) {
      updateData.image = `${process.env.BACKEND_URL || 'http://localhost:5000'}/uploads/${req.file.filename}`;
    }

    const branch = await Branch.findByIdAndUpdate(
      req.params.id,
      updateData,
      { returnDocument: 'after', runValidators: true }
    );

    if (!branch) {
      return res.status(404).json({ success: false, message: "Branch not found" });
    }

    res.json({ success: true, branch });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteBranch = async (req, res) => {
  try {
    const userRole = req.user.role;
    if (userRole === "Admin" || userRole === "BranchManager") {
      return res.status(403).json({ success: false, message: "Not authorized to delete branches." });
    }
    const branch = await Branch.findByIdAndDelete(req.params.id);
    
    if (!branch) {
      return res.status(404).json({ success: false, message: "Branch not found" });
    }

    res.json({ success: true, message: "Branch deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
