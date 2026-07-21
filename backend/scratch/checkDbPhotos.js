const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

const Devotee = require('../models/Devotee');
const Admin = require('../models/Admin');
const Trustee = require('../models/Trustee');
const BranchManager = require('../models/BranchManager');
const Accountant = require('../models/Accountant');
const DocumentAdmin = require('../models/DocumentAdmin');

async function run() {
  try {
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
    console.log("Connecting to:", uri);
    await mongoose.connect(uri);
    console.log("Connected to DB.");

    const collections = [
      { name: 'Devotee', model: Devotee },
      { name: 'Admin', model: Admin },
      { name: 'Trustee', model: Trustee },
      { name: 'BranchManager', model: BranchManager },
      { name: 'Accountant', model: Accountant },
      { name: 'DocumentAdmin', model: DocumentAdmin }
    ];

    for (const coll of collections) {
      const users = await coll.model.find({}, 'name email profilePhoto');
      console.log(`\n--- ${coll.name} collection profilePhotos: ---`);
      users.forEach(u => {
        console.log(`User: ${u.name} (${u.email}) -> profilePhoto: "${u.profilePhoto}"`);
      });
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error("DB check error:", err);
  }
}

run();
