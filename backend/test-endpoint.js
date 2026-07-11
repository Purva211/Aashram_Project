const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Admin = require('./models/Admin');
require('dotenv').config();

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/aashram");
    const admin = await Admin.findOne();
    if (!admin) throw new Error("No admin found in DB");
    
    // 1. Generate real token for Admin
    const token = jwt.sign({ id: admin._id, role: "Admin" }, process.env.JWT_SECRET || "default_secret_key");
    
    console.log("Token:", token);
    
    // 2. Call the endpoint
    const res = await fetch('http://localhost:5000/api/receipts/notice', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        subject: "Test Notice",
        noticeContent: "Hello world",
        targetBranches: "All"
      })
    });
    
    const data = await res.json();
    console.log("Response:", data);
  } catch (err) {
    console.error("Error:", err);
  }
})();
