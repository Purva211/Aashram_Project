const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const Trustee = require("../models/Trustee");
const Devotee = require("../models/Devotee");
const BranchManager = require("../models/BranchManager");
const Accountant = require("../models/Accountant");
const DocumentAdmin = require("../models/DocumentAdmin");

module.exports = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(); // Proceed without setting req.user
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret_key");

    let user = null;
    switch (decoded.role) {
      case "Admin":
        user = await Admin.findById(decoded.id);
        break;
      case "Trustee":
        user = await Trustee.findById(decoded.id);
        break;
      case "Devotee":
        user = await Devotee.findById(decoded.id);
        break;
      case "BranchManager":
        user = await BranchManager.findById(decoded.id);
        break;
      case "Accountant":
        user = await Accountant.findById(decoded.id);
        break;
      case "DocumentHandler":
      case "document_admin":
        user = await DocumentAdmin.findById(decoded.id);
        break;
    }

    if (user) {
      user.role = decoded.role;
      req.user = user;
    }
    next();
  } catch (error) {
    // If token is invalid, just proceed as an unauthenticated user instead of throwing an error
    console.error("Optional auth error:", error);
    next();
  }
};
