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
    return next();
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
      case "DocumentHandler":
      case "document_admin":
        user = await DocumentAdmin.findById(decoded.id);
        break;
      case "BranchManager":
        user = await BranchManager.findById(decoded.id);
        break;
      case "Accountant":
        user = await Accountant.findById(decoded.id);
        break;
    }

    if (user) {
      req.user = user;
      req.user.role = decoded.role;
    }
    next();
  } catch (error) {
    // If verification fails, just proceed as unauthenticated
    next();
  }
};
