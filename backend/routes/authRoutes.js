const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

// Unified Login
router.post("/login", authController.login);
router.post("/google-login", authController.googleLogin);
router.post("/verify-pin", authController.verifyAdminPin);

// Registration endpoints
router.post("/register/start", authController.registerStart);
router.post("/register/verify-email", authController.registerVerifyEmail);
router.post("/register/complete", authController.registerComplete);
router.post("/check-duplicate", authController.checkDuplicate);

// Password Reset endpoints
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

// Get Current User Profile
router.get("/me", authMiddleware, authController.getMe);

module.exports = router;