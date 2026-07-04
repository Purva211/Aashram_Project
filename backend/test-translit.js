const https = require('https');

function transliterate(word) {
  return new Promise((resolve, reject) => {
    const url = `https://inputtools.google.com/request?text=${encodeURIComponent(word)}&itc=mr-t-i0-und&num=1`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json[0] === 'SUCCESS') {
            resolve(json[1][0][1][0]);
          } else {
            resolve(word);
          }
        } catch (e) {
          resolve(word);
        }
      });
    }).on('error', reject);
  });
}

async function test() {
  const parts = "Vrushali Patil".split(' ');
  const res = [];
  for (const part of parts) {
    res.push(await transliterate(part));
  }
  console.log('Result:', res.join(' '));
}

test();
