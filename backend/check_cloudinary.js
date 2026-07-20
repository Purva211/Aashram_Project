const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

const cloudinary = require('./config/cloudinary');

async function run() {
  try {
    const result = await cloudinary.api.resource('aashram_uploads/featuredImage-1784452650563-80264016');
    console.log("Cloudinary resource:", JSON.stringify(result, null, 2));
  } catch (err) {
    console.error("Cloudinary error:", err);
  }
}

run();
