const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const Accountant = mongoose.model('Accountant', new mongoose.Schema({}, { strict: false }), 'accountants');
    
    const hash = await bcrypt.hash('admin123', 10);
    const result = await Accountant.updateMany({ email: 'sonaligodase44@gmail.com' }, { password: hash });
    console.log("Updated accountants:", result);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
