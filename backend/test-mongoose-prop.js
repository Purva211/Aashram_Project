const mongoose = require('mongoose');
const Admin = require('./models/Admin');
require('dotenv').config();

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/aashram");
    const admin = await Admin.findOne();
    
    // Simulate auth middleware
    const req = {};
    req.user = admin;
    req.user.role = "TestRole";
    
    console.log("req.user.role is:", req.user.role);
    
    // Simulate checkNoticeRole
    if (['Admin', 'Trustee'].includes(req.user.role)) {
      console.log("Access Granted!");
    } else {
      console.log("Access Denied! Role was:", req.user.role);
    }
    
  } catch (err) {
    console.error(err);
  }
  process.exit();
})();
