async function englishToMarathi(text) {
  if (!text) return text;
  
  // If text already contains Marathi characters, return as is (simple heuristic)
  if (/[\u0900-\u097F]/.test(text)) return text;
  
  try {
    const url = `https://inputtools.google.com/request?text=${encodeURIComponent(text)}&itc=mr-t-i0-und&num=1`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data[0] === 'SUCCESS' && data[1]) {
      return data[1].map(item => item[1][0]).join('');
    }
    return text;
  } catch (error) {
    console.error("Transliteration Error:", error);
    return text; // fallback to original on error
  }
}

module.exports = { englishToMarathi };
