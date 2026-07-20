const express = require("express");
const cors = require("cors");

const dotenv = require("dotenv");

dotenv.config();

const app = express();

const path = require("path");

// Middleware
app.use(cors());


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const fs = require("fs");
app.use("/uploads", (req, res, next) => {
  const localFilePath = path.join(__dirname, "uploads", req.path);
  
  // 1. If file exists locally, serve it statically
  if (fs.existsSync(localFilePath) && fs.lstatSync(localFilePath).isFile()) {
    return express.static(path.join(__dirname, "uploads"), {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.mp4')) {
          res.set('Accept-Ranges', 'bytes');
          res.set('Content-Type', 'video/mp4');
          res.set('Cache-Control', 'no-cache');
        }
      }
    })(req, res, next);
  }
  
  // 2. Otherwise redirect to Cloudinary
  const relativePath = req.path.replace(/^\//, "");
  const ext = path.extname(relativePath).toLowerCase();
  
  let resourceType = "image";
  if ([".mp4", ".webm", ".mov", ".avi", ".mkv", ".mp3", ".wav", ".aac", ".ogg", ".flac", ".m4a"].includes(ext)) {
    resourceType = "video";
  } else if ([".pdf", ".vtt", ".docx", ".doc", ".xls", ".xlsx"].includes(ext)) {
    resourceType = "raw";
  }
  
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "dkciljoot";
  const cloudinaryUrl = `https://res.cloudinary.com/${cloudName}/${resourceType}/upload/aashram_uploads/${relativePath}`;
  
  res.redirect(cloudinaryUrl);
});


// Default auth routes
app.use("/api/auth", require("./routes/authRoutes"));

app.use("/api/admins", require("./routes/adminRoutes"));
app.use("/api/trustees", require("./routes/trusteeRoutes"));
app.use("/api/accountants", require("./routes/accountantRoutes"));
app.use("/api/audit-logs", require("./routes/auditRoutes"));
app.use("/api/branch-managers", require("./routes/branchManagerRoutes"));
app.use("/api/devotees", require("./routes/devoteeRoutes"));
app.use("/api/family", require("./routes/familyRoutes"));
app.use("/api/donations", require("./routes/donationRoutes"));
app.use("/api/events", require("./routes/eventRoutes"));
app.use("/api/bulletins", require("./routes/bulletinRoutes"));
app.use("/api/announcements", require("./routes/announcementRoutes"));

app.use("/api/branches", require("./routes/branchRoutes"));
app.use("/api/document-admin", require("./routes/documentAuthRoutes"));
app.use("/api/documents", require("./routes/documentRoutes"));
app.use("/api/live", require("./routes/liveRoutes"));
app.use("/api/annadaan", require("./routes/annadaanRoutes"));
app.use("/api/gallery", require("./routes/galleryRoutes"));
app.use("/api/news", require("./routes/newsRoutes"));
app.use("/api/stats", require("./routes/statsRoutes"));
app.use("/api/math-history", require("./routes/mathHistoryRoutes"));
app.use("/api/lineage", require("./routes/lineageRoutes"));
app.use("/api/user", require("./routes/userDashboardRoutes"));
app.use("/api/contact", require("./routes/contactRoutes"));
app.use("/api/audio", require("./routes/audioRoutes"));
app.use("/api/receipts", require("./routes/receiptArchiveRoutes"));
app.use("/api/correspondence", require("./routes/correspondenceRoutes"));

// Serve static frontend build if dist directory exists
const frontendDist = path.join(__dirname, "../frontend/dist");
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api/") || req.path.startsWith("/uploads/")) {
      return next();
    }
    res.sendFile(path.join(frontendDist, "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("Temple Management System API is running...");
  });
}

// 404 handler for API and uploads routes
app.use((req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ success: false, message: "API route not found" });
  }
  if (req.path.startsWith("/uploads/")) {
    return res.status(404).json({ success: false, message: "File not found" });
  }
  res.status(404).send("Page Not Found");
});

module.exports = app;