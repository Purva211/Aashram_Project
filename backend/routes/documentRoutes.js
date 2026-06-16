const express = require("express");
const router = express.Router();
const {
  createDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument
} = require("../controllers/documentController");
const verifyDocumentAdmin = require("../middleware/verifyDocumentAdmin");
const documentUpload = require("../middleware/documentUpload");

// Public route
router.get("/public", require("../controllers/documentController").getPublicDocuments);

// All routes below require authentication as document admin
router.use(verifyDocumentAdmin);

router.route("/")
  .get(getDocuments)
  .post(documentUpload.single("pdf"), createDocument);

router.route("/:id")
  .get(getDocumentById)
  .put(documentUpload.single("pdf"), updateDocument)
  .delete(deleteDocument);

router.put("/:id/approve-deletion", require("../controllers/documentController").approveDocumentDeletion);

module.exports = router;
