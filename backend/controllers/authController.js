const Admin = require("../models/Admin");
const Trustee = require("../models/Trustee");
const Devotee = require("../models/Devotee");
const BranchManager = require("../models/BranchManager");
const OTPVerification = require("../models/OTPVerification");
const Accountant = require("../models/Accountant");
const generateToken = require("../utils/generateToken");
const generateOTP = require("../utils/otpGenerator");
const sendEmail = require("../utils/sendEmail");
const SystemSettings = require("../models/SystemSettings");
const DocumentAdmin = require("../models/DocumentAdmin");
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client("575853664482-vm3gho8gni1ifluc50pf742ulkbp4oob.apps.googleusercontent.com");

// Unified Login Endpoint for all roles
exports.login = async (req, res) => {
  try {
    const { email, password, role, branchId, managerId, username } = req.body;

    let user = null;
    let token = null;

    if (!password || !role) {
      return res.status(400).json({ success: false, message: "Role and password are required" });
    }

    switch (role) {
      case "Admin":
        user = await Admin.findOne({ email });
        break;
      case "Trustee":
        user = await Trustee.findOne({ email });
        break;
      case "Devotee":
        user = await Devotee.findOne({ email });
        if (user && !user.isVerified) {
          return res.status(401).json({ success: false, message: "Please verify your email first", isVerified: false });
        }
        break;
      case "BranchManager":
        user = await BranchManager.findOne({ managerId, branch: branchId }); // BM uses managerId + branchId
        break;
      case "Accountant":
        user = await Accountant.findOne({ email });
        if (user && user.accountStatus !== "active") {
          return res.status(401).json({ success: false, message: "Account is inactive" });
        }
        break;
      case "DocumentHandler":
      case "document_admin":
        user = await DocumentAdmin.findOne({ email });
        break;
      default:
        return res.status(400).json({ success: false, message: "Invalid role specified" });
    }

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    token = generateToken(user._id, role);

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      token,
      user: userResponse
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Google OAuth Login
exports.googleLogin = async (req, res) => {
  try {
    const { credential, selectedRole } = req.body;
    
    if (!credential) {
      return res.status(400).json({ success: false, message: "Google credential is required" });
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: "575853664482-vm3gho8gni1ifluc50pf742ulkbp4oob.apps.googleusercontent.com",
    });
    
    const payload = ticket.getPayload();
    const email = payload.email;
    const name = payload.name;
    const picture = payload.picture;

    let user = null;
    let role = null;

    if (selectedRole) {
      switch (selectedRole) {
        case "Admin":
          user = await Admin.findOne({ email });
          if (user) role = "Admin";
          break;
        case "Trustee":
          user = await Trustee.findOne({ email });
          if (user) role = "Trustee";
          break;
        case "Accountant":
          user = await Accountant.findOne({ email });
          if (user) {
            if (user.accountStatus !== "active") {
              return res.status(401).json({ success: false, message: "Account is inactive" });
            }
            role = "Accountant";
          }
          break;
        case "BranchManager":
          user = await BranchManager.findOne({ email });
          if (user) role = "BranchManager";
          break;
        case "Devotee":
          user = await Devotee.findOne({ email });
          if (user) role = "Devotee";
          break;
      }
    } else {
      // Fallback priority if no role is explicitly passed
      user = await Admin.findOne({ email });
      if (user) role = "Admin";
      
      if (!user) {
        user = await Trustee.findOne({ email });
        if (user) role = "Trustee";
      }
      
      if (!user) {
        user = await Accountant.findOne({ email });
        if (user) {
          if (user.accountStatus !== "active") {
            return res.status(401).json({ success: false, message: "Account is inactive" });
          }
          role = "Accountant";
        }
      }
      
      if (!user) {
        user = await BranchManager.findOne({ email });
        if (user) role = "BranchManager";
      }

      if (!user) {
        user = await Devotee.findOne({ email });
        if (user) role = "Devotee";
      }
    }

    // If user completely doesn't exist, register them as a Devotee automatically only if Devotee was selected or no role specified
    if (!user && (!selectedRole || selectedRole === "Devotee")) {
      user = await Devotee.create({
        name: name || email.split('@')[0],
        email: email,
        mobile: "0000000000",
        password: Math.random().toString(36).slice(-10), // Random password since they use Google
        address: "Google Auth User",
        isVerified: true,
        profilePhoto: picture
      });
      role = "Devotee";
    } else if (!user) {
      return res.status(401).json({ success: false, message: "No account found for the selected role. Please check your role." });
    } else {
      // If Devotee exists but is unverified, verify them since Google verified the email
      if (role === "Devotee" && !user.isVerified) {
        user.isVerified = true;
        await user.save();
      }
      
      // Update profile picture if empty
      if (!user.profilePhoto && picture) {
        user.profilePhoto = picture;
        await user.save();
      }
    }

    const token = generateToken(user._id, role);

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      token,
      user: userResponse,
      role
    });

  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(500).json({ success: false, message: "Failed to authenticate with Google" });
  }
};

// Verify Admin PIN
exports.verifyAdminPin = async (req, res) => {
  try {
    const { pin } = req.body;
    if (!pin) {
      return res.status(400).json({ success: false, message: "PIN is required" });
    }

    let settings = await SystemSettings.findOne();
    if (!settings) {
      // Create default settings if it doesn't exist
      settings = await SystemSettings.create({ adminLoginPin: 'log1008' });
    }

    if (settings.adminLoginPin === pin) {
      return res.status(200).json({ success: true, message: "PIN verified successfully" });
    } else {
      return res.status(401).json({ success: false, message: "Incorrect PIN" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Devotee Registration (Sends OTP)
exports.registerDevotee = async (req, res) => {
  try {
    const { name, email, mobile, password, address } = req.body;

    let userExists = await Devotee.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: "User already exists with this email" });
    }

    const devotee = await Devotee.create({
      name,
      email,
      mobile,
      password,
      address,
      isVerified: false
    });

    // Generate and send OTP
    const otp = generateOTP();
    await OTPVerification.create({
      email,
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 mins expiry
    });

    const message = `Dear ${name},\n\nYour OTP for registration at Kolekar Maha Swamiji Monastery, Kole is: ${otp}\n\nThis OTP is valid for 10 minutes.\n\nJai Kolekar Maha Swamiji!`;

    await sendEmail({
      email,
      subject: "Registration OTP - Kolekar Maha Swamiji Monastery",
      message,
    });

    res.status(201).json({
      success: true,
      message: "Registration successful. Please check your email for the OTP.",
      email: devotee.email
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Basic Trustee Registration
exports.registerTrustee = async (req, res) => {
  try {
    const { email, password, verifiedToken } = req.body;

    // Verify Token
    try {
      const decoded = jwt.verify(verifiedToken, process.env.JWT_SECRET || "default_secret_key");
      if (decoded.email !== email || !decoded.verified) {
        return res.status(400).json({ success: false, message: "Email verification failed or token mismatch" });
      }
    } catch (err) {
      return res.status(400).json({ success: false, message: "Invalid or expired verification token" });
    }

    let userExists = await Trustee.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: "Trustee already exists with this email" });
    }
    const trustee = await Trustee.create({
      name: email.split('@')[0],
      email,
      password,
      mobile: "0000000000",
      designation: "New Trustee",
      address: "Not Provided",
      role: 'Trustee'
    });
    res.status(201).json({
      success: true,
      message: "Trustee registered successfully. You can now login.",
      user: { name: trustee.name, email: trustee.email }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const otpRecord = await OTPVerification.findOne({ email }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    if (otpRecord.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: "OTP has expired. Please request a new one." });
    }

    if (otpRecord.otp !== otp) {
      return res.status(400).json({ success: false, message: "Incorrect OTP" });
    }

    // Mark devotee as verified
    await Devotee.findOneAndUpdate({ email }, { isVerified: true });
    
    // Delete OTP record
    await OTPVerification.deleteMany({ email });

    res.status(200).json({ success: true, message: "Email verified successfully. You can now login." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get current user profile (using token)
exports.getMe = async (req, res) => {
  try {
    const user = req.user.toObject();
    delete user.password;
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Forgot Password - Generates OTP
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Check if devotee exists
    const user = await Devotee.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "No account found with this email" });
    }

    // Generate and send OTP
    const otp = generateOTP();
    await OTPVerification.create({
      email,
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 mins expiry
    });

    const message = `Dear ${user.name},\n\nYour OTP to reset your password is: ${otp}\n\nThis OTP is valid for 10 minutes.\n\nJai Kolekar Maha Swamiji!`;
    
    await sendEmail({
      email: user.email,
      subject: "Password Reset OTP - Kolekar Maha Swamiji Monastery",
      message
    });

    res.status(200).json({ success: true, message: "OTP sent to your email" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Reset Password - Verifies OTP and updates password
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const otpRecord = await OTPVerification.findOne({ email }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    if (otpRecord.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: "OTP has expired. Please request a new one." });
    }

    if (otpRecord.otp !== otp) {
      return res.status(400).json({ success: false, message: "Incorrect OTP" });
    }

    // Find and update user password
    const user = await Devotee.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.password = newPassword;
    await user.save(); // This will trigger the pre-save hook to hash the new password
    
    // Delete OTP records for this email
    await OTPVerification.deleteMany({ email });

    res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};