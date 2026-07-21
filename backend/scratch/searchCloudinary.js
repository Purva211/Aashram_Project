const dotenv = require('dotenv');
dotenv.config({ path: './.env' });
const cloudinary = require('../config/cloudinary');

async function run() {
  try {
    const result = await cloudinary.api.resources({
      max_results: 500
    });
    console.log("Filtered Cloudinary resources (containing profiles, profileImage, or aashram):");
    result.resources.forEach(r => {
      if (r.public_id.includes("profile") || r.public_id.includes("aashram")) {
        console.log(`- ${r.public_id} (${r.resource_type}) -> ${r.secure_url}`);
      }
    });
  } catch (err) {
    console.error("Cloudinary list error:", err);
  }
}

run();
