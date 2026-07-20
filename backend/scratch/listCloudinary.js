const dotenv = require('dotenv');
dotenv.config({ path: './.env' });
const cloudinary = require('../config/cloudinary');

async function run() {
  try {
    const result = await cloudinary.api.resources({
      max_results: 10
    });
    console.log("Latest Cloudinary resources:", JSON.stringify(result.resources, null, 2));
  } catch (err) {
    console.error("Cloudinary list error:", err);
  }
}

run();
