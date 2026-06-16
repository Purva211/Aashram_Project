const express = require("express");
const router = express.Router();
const trusteeController = require("../controllers/trusteeController");
const authMiddleware = require("../middleware/authMiddleware");
const checkRole = require("../middleware/roleMiddleware");
const checkPermission = require("../middleware/permissionMiddleware");

// Public route to fetch trustees
router.get("/public", trusteeController.getPublicTrustees);

// All routes require 'Trustee' role
router.use(authMiddleware, checkRole("Trustee"));

router.get("/stats", trusteeController.getStats); // No permission needed for stats or let it be dashboard
router.get("/pending-counts", trusteeController.getPendingCounts);

// Documents
router.get("/documents", checkPermission('Documents'), trusteeController.getAllDocuments);
router.get("/documents/pending", checkPermission('Documents'), trusteeController.getPendingDocuments);
router.put("/documents/:id/review", checkPermission('Documents'), trusteeController.reviewDocument);

// Document Deletion Request Routes
router.get("/documents/deletion-requests", checkPermission('Documents'), trusteeController.getDeletionRequests);
router.put("/documents/:id/review-deletion", checkPermission('Documents'), trusteeController.reviewDeletionRequest);

// Profile Route
router.put("/profile", trusteeController.updateProfile);

router.get('/admins-list', trusteeController.getAllAdmins);


router.get('/branch-managers', trusteeController.getBranchManagers);
router.get('/document-admin', trusteeController.getDocumentAdmins);
router.get('/accountants', trusteeController.getAccountants);
module.exports = router;

