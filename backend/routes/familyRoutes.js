const express = require("express");
const router = express.Router();
const familyController = require("../controllers/familyController");
const authMiddleware = require("../middleware/authMiddleware");
const optionalAuthMiddleware = require("../middleware/optionalAuthMiddleware");

// Search & suggestions can be accessed without a token (e.g., during registration)
router.get("/search", optionalAuthMiddleware, familyController.searchFamilies);
router.get("/search-suggestions", optionalAuthMiddleware, familyController.getSearchSuggestions);

// All other routes require authentication
router.use(authMiddleware);

// Search & filter routes (Authenticated)
router.get("/by-city", familyController.getFamiliesByCity);

// Dynamic dropdown metadata routes
router.get("/filters/states", familyController.getStates);
router.get("/filters/districts", familyController.getDistricts);
router.get("/filters/cities", familyController.getCities);
router.get("/filters/villages", familyController.getVillages);

// Tree operations
router.get("/tree/:rootId", familyController.getFamilyTree);
router.get("/member/:devoteeId", familyController.getMemberDetails);

// Write operations (creating, joining, relative addition)
router.post("/create", familyController.createFamily);
router.post("/create-self-root", familyController.createSelfRoot);
router.post("/join-self", familyController.joinSelf);
router.post("/add-member", familyController.addMember);

// Analytics & Reports
router.get("/reports/data", familyController.getFamilyReportsData);

module.exports = router;
