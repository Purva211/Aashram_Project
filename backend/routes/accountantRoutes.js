const express = require("express");
const router = express.Router();
const { 
  sendVerificationOtp, 
  verifyOtp, 
  createAccountant, 
  getAccountants, 
  updateAccountant, 
  deleteAccountant,
  updateProfile
} = require("../controllers/accountantController");
const authMiddleware = require("../middleware/authMiddleware");
const checkRole = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.use(authMiddleware);

// Trustee Routes
router.post("/send-otp", checkRole(["Trustee"]), sendVerificationOtp);
router.post("/verify-otp", checkRole(["Trustee"]), verifyOtp);
router.post("/", checkRole(["Trustee"]), createAccountant);
router.get("/", checkRole(["Trustee", "Admin"]), getAccountants);
router.put("/:id", checkRole(["Trustee"]), updateAccountant);
router.delete("/:id", checkRole(["Trustee"]), deleteAccountant);

// Accountant Self Route
router.put("/profile/me", checkRole(["Accountant"]), upload.single("profileImage"), updateProfile);

module.exports = router;
