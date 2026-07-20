const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const Admin = mongoose.model('Admin', new mongoose.Schema({}, { strict: false }), 'admins');
    const admins = await Admin.find({});
    console.log("Admins:", JSON.stringify(admins, null, 2));
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
