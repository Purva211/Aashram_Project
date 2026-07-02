const fs = require('fs');
const path = require('path');
const https = require('https');

const fontsDir = path.join(__dirname, '../assets/fonts');

// Ensure directory exists
if (!fs.existsSync(fontsDir)) {
  fs.mkdirSync(fontsDir, { recursive: true });
}

const fonts = [
  {
    name: 'Poppins-Regular.ttf',
    url: 'https://raw.githubusercontent.com/google/fonts/main/ofl/poppins/Poppins-Regular.ttf'
  },
  {
    name: 'Poppins-Bold.ttf',
    url: 'https://raw.githubusercontent.com/google/fonts/main/ofl/poppins/Poppins-Bold.ttf'
  }
];

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to get font from URL: ${url}, status code: ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`Successfully downloaded: ${path.basename(destPath)}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

async function main() {
  console.log("Starting font downloads to:", fontsDir);
  for (const font of fonts) {
    const destPath = path.join(fontsDir, font.name);
    if (fs.existsSync(destPath) && fs.statSync(destPath).size > 1000) {
      console.log(`Font already exists, skipping: ${font.name}`);
      continue;
    }
    try {
      await downloadFile(font.url, destPath);
    } catch (err) {
      console.error(`Error downloading ${font.name}:`, err.message);
      process.exit(1);
    }
  }
  console.log("Font downloads completed successfully.");
}

main();
