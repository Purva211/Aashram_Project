const express = require("express");
const router = express.Router();
const { generateNotice, getReceipts } = require("../controllers/receiptArchiveController");
const verifyToken = require("../middleware/authMiddleware");

router.use(verifyToken);

router.post("/notice", generateNotice);
router.get("/", getReceipts);

module.exports = router;
