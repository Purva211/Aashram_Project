const AuditLog = require("../models/AuditLog");

// Helper to log actions from within other controllers
exports.logAction = async ({ userId, role, action, details = {}, ipAddress = "" }) => {
  try {
    await AuditLog.create({
      userId,
      role,
      action,
      details,
      ipAddress
    });
  } catch (error) {
    console.error("Audit Logging Error:", error);
  }
};

// Endpoint to fetch logs
exports.getAuditLogs = async (req, res) => {
  try {
    const { userId, startDate } = req.query;
    const query = {};

    // If the user is not Admin or Trustee, force filter by their own userId for security
    if (req.user.role !== "Admin" && req.user.role !== "Trustee") {
      query.userId = req.user._id;
    } else if (userId) {
      query.userId = userId;
    }

    if (startDate) {
      query.timestamp = { $gte: new Date(startDate) };
    }

    const logs = await AuditLog.find(query).sort({ timestamp: -1 }).limit(100);
    res.status(200).json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
