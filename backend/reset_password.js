const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const Admin = mongoose.model('Admin', new mongoose.Schema({}, { strict: false }), 'admins');
    const admin = await Admin.findOne({ email: 'admin@mahakaleshwar.com' });
    if (!admin) {
      console.log("Admin not found");
      return;
    }
    
    const oldHash = admin.get('password');
    console.log("Old Admin Password Hash:", oldHash);
    
    // Hash 'admin123'
    const newHash = await bcrypt.hash('admin123', 10);
    admin.set('password', newHash);
    await admin.save();
    console.log("Admin password updated to 'admin123' (hash:", newHash, ")");
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
