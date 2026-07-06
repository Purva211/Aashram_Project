const https = require('https');
const translate = require('google-translate-api-x');

/**
 * Transliterates an English proper noun into Marathi using Google Input Tools API.
 * Preserves words that are already in Marathi or numbers.
 * @param {string} text
 * @returns {Promise<string>}
 */
async function transliterateToMarathi(text) {
  if (!text) return '';
  
  // Collapse 3 or more consecutive identical letters to 2 to help the transliteration API (e.g. "sonaaaa" -> "sonaa")
  text = text.replace(/(.)\1{2,}/g, '$1$1');
  
  const words = text.split(/\s+/);
  const resultWords = [];

  for (const word of words) {
    // If it's already Marathi/Hindi (Devanagari block) or numbers, skip transliteration
    if (/^[\u0900-\u097F\d]+$/.test(word)) {
      resultWords.push(word);
      continue;
    }

    try {
      const transliterated = await new Promise((resolve, reject) => {
        const url = `https://inputtools.google.com/request?text=${encodeURIComponent(word)}&itc=mr-t-i0-und&num=1`;
        https.get(url, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            try {
              const json = JSON.parse(data);
              if (json[0] === 'SUCCESS' && json[1] && json[1][0] && json[1][0][1] && json[1][0][1][0]) {
                resolve(json[1][0][1][0]);
              } else {
                resolve(word); // Fallback to original
              }
            } catch (e) {
              resolve(word); // Fallback to original
            }
          });
        }).on('error', (err) => {
          resolve(word); // Fallback on network error
        });
      });
      resultWords.push(transliterated);
    } catch (err) {
      resultWords.push(word);
    }
  }

  return resultWords.join(' ');
}

/**
 * Translates an English sentence into Marathi using Google Translate API.
 * @param {string} text
 * @returns {Promise<string>}
 */
async function translateToMarathi(text) {
  if (!text) return '';
  
  // If it's already Devanagari, just return
  if (/^[\u0900-\u097F\d\s]+$/.test(text)) {
    return text;
  }

  try {
    const res = await translate(text, { to: 'mr' });
    return res.text;
  } catch (err) {
    console.error("Translation API failed, falling back to original:", err.message);
    return text;
  }
}

module.exports = {
  transliterateToMarathi,
  translateToMarathi
};
