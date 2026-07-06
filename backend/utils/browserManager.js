const puppeteer = require('puppeteer');

let browserInstance = null;

async function getBrowser() {
  if (browserInstance) {
    return browserInstance;
  }
  
  try {
    browserInstance = await puppeteer.launch({
      headless: 'shell',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    // Handle browser disconnection
    browserInstance.on('disconnected', () => {
      console.log('Puppeteer browser disconnected. Re-launching...');
      browserInstance = null;
    });

    return browserInstance;
  } catch (err) {
    console.error("Failed to launch Puppeteer:", err);
    throw err;
  }
}

module.exports = { getBrowser };
