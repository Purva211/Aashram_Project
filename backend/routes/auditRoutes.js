const express = require("express");
const router = express.Router();
const { getAuditLogs } = require("../controllers/auditController");
const authMiddleware = require("../middleware/authMiddleware");
const checkRole = require("../middleware/roleMiddleware");

router.use(authMiddleware);

// Audit logs are visible to Admin, Trustee, and Document Handler
router.get("/", checkRole(["Admin", "Trustee", "DocumentHandler", "document_admin"]), getAuditLogs);

module.exports = router;
