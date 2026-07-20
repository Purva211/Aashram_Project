const express = require("express");
const router = express.Router();
const { generateNotice, getReceipts, deleteReceipt } = require("../controllers/receiptArchiveController");
const verifyToken = require("../middleware/authMiddleware");

router.use(verifyToken);

router.post("/notice", generateNotice);
router.get("/", getReceipts);
router.delete("/:id", deleteReceipt);

module.exports = router;
