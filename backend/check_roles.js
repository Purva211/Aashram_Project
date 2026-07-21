const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log("Collections:", collections.map(c => c.name));

    // Let's query all users from different collections
    const Admin = mongoose.model('Admin', new mongoose.Schema({}, { strict: false }), 'admins');
    const Trustee = mongoose.model('Trustee', new mongoose.Schema({}, { strict: false }), 'trustees');
    const Devotee = mongoose.model('Devotee', new mongoose.Schema({}, { strict: false }), 'devotees');
    const BranchManager = mongoose.model('BranchManager', new mongoose.Schema({}, { strict: false }), 'branchmanagers');
    
    const admins = await Admin.find({});
    const trustees = await Trustee.find({});
    const devotees = await Devotee.find({});
    const managers = await BranchManager.find({});

    console.log("Admins:", admins.map(u => ({ email: u.email, role: u.role })));
    console.log("Trustees:", trustees.map(u => ({ email: u.email, role: u.role })));
    console.log("Devotees:", devotees.map(u => ({ email: u.email, role: u.role })));
    console.log("Managers:", managers.map(u => ({ email: u.email, role: u.role })));

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
