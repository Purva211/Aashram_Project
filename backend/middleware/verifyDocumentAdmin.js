const jwt = require("jsonwebtoken");
const DocumentAdmin = require("../models/DocumentAdmin");

module.exports = async (req, res, next) => {
  try {
    let token = req.headers.authorization;

    if (token && token.startsWith("Bearer ")) {
      token = token.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "No token provided, authorization denied" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret_key");

    const adminUser = await DocumentAdmin.findById(decoded.id).select("-password");

    if (!adminUser || adminUser.role !== "document_admin") {
      return res.status(403).json({ message: "Access forbidden: Not a document admin" });
    }

    req.user = adminUser;
    next();
  } catch (err) {
    console.error("Document Auth Middleware Error:", err);
    res.status(401).json({ message: "Unauthorized token" });
  }
};
