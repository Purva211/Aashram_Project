const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const cloudinary = require('../config/cloudinary');

async function testUpload() {
  try {
    console.log("Using Cloudinary credentials:");
    console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
    console.log("API Key:", process.env.CLOUDINARY_API_KEY ? "Exists" : "Missing");
    console.log("API Secret:", process.env.CLOUDINARY_API_SECRET ? "Exists" : "Missing");

    // Create a dummy text file
    const testFilePath = path.join(__dirname, 'test_file.txt');
    fs.writeFileSync(testFilePath, 'dummy data');

    console.log("\nUploading test file...");
    const result = await cloudinary.uploader.upload(testFilePath, {
      folder: 'aashram_uploads',
      public_id: 'test_file.txt',
      resource_type: 'raw',
      use_filename: true,
      unique_filename: false
    });

    console.log("Upload successful!");
    console.log("Secure URL:", result.secure_url);

    // Clean up local test file
    fs.unlinkSync(testFilePath);

    console.log("\nTesting fallback redirect URL:");
    const testUrl = `http://localhost:5000/uploads/test_file.txt`;
    console.log(`Open this in your browser: ${testUrl}`);
    console.log(`It should redirect to: https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/aashram_uploads/test_file.txt`);
  } catch (error) {
    console.error("Test upload failed:", error);
  }
}

testUpload();
