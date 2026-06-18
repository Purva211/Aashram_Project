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
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Default auth routes
app.use("/api/auth", require("./routes/authRoutes"));

app.use("/api/admins", require("./routes/adminRoutes"));
app.use("/api/trustees", require("./routes/trusteeRoutes"));
app.use("/api/accountants", require("./routes/accountantRoutes"));
app.use("/api/audit-logs", require("./routes/auditRoutes"));
app.use("/api/branch-managers", require("./routes/branchManagerRoutes"));
app.use("/api/devotees", require("./routes/devoteeRoutes"));
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
app.use("/api/stats", require("./routes/statsRoutes"));
app.use("/api/math-history", require("./routes/mathHistoryRoutes"));
app.use("/api/lineage", require("./routes/lineageRoutes"));
app.use("/api/user", require("./routes/userDashboardRoutes"));
app.use("/api/contact", require("./routes/contactRoutes"));
app.use("/api/audio", require("./routes/audioRoutes"));

app.get("/", (req, res) => {
  res.send("Temple Management System API is running...");
});

module.exports = app;