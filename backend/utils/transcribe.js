const { createClient, webvtt } = require('@deepgram/sdk');
const fs = require('fs');

// Initialize the Deepgram client
// We initialize it inside the function so it doesn't crash on startup if DEEPGRAM_API_KEY is missing yet
const getDeepgramClient = () => {
  if (!process.env.DEEPGRAM_API_KEY) {
    throw new Error('DEEPGRAM_API_KEY is missing from .env');
  }
  return createClient(process.env.DEEPGRAM_API_KEY);
};

/**
 * Transcribes an audio URL using Deepgram and returns a WebVTT string
 * @param {string} audioUrl - The Cloudinary audio URL
 * @param {string} language - The language of the audio (e.g. 'Marathi', 'Hindi')
 * @returns {Promise<string>} The WebVTT content as a string
 */
const generateVTTFromUrl = async (audioUrl, language = 'Marathi') => {
  try {
    const deepgram = getDeepgramClient();

    console.log(`Starting Deepgram transcription for ${language} audio...`);

    // We use the Nova-2 model which is incredibly accurate
    // If language is Hindi/Marathi, we can use the 'hi' language code as it covers regional accents well
    const languageCode = language === 'English' ? 'en' : 'hi';

    const { result, error } = await deepgram.listen.prerecorded.transcribeUrl(
      { url: audioUrl },
      {
        model: 'nova-2',
        language: languageCode,
        smart_format: true,
        utterances: true,
        diarize: true,
      }
    );

    // Custom Rock-Solid WebVTT Converter
    const formatTime = (seconds) => {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = Math.floor(seconds % 60);
      const ms = Math.floor((seconds - Math.floor(seconds)) * 1000);
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
    };

    let vtt = "WEBVTT\n\n";
    const utterances = result?.results?.utterances;
    const words = result?.results?.channels?.[0]?.alternatives?.[0]?.words;

    if (utterances && utterances.length > 0) {
      utterances.forEach((u, i) => {
        vtt += `${i + 1}\n${formatTime(u.start)} --> ${formatTime(u.end)}\n${u.transcript}\n\n`;
      });
    } else if (words && words.length > 0) {
      // Fallback: group every 7 words
      let chunk = [];
      let start = words[0].start;
      let counter = 1;
      
      for (let i = 0; i < words.length; i++) {
        chunk.push(words[i].word);
        if (chunk.length >= 7 || i === words.length - 1) {
          vtt += `${counter++}\n${formatTime(start)} --> ${formatTime(words[i].end)}\n${chunk.join(' ')}\n\n`;
          chunk = [];
          if (i < words.length - 1) start = words[i + 1].start;
        }
      }
    } else {
      console.warn("Deepgram returned no utterances or words. Full result:", JSON.stringify(result).substring(0, 500));
      return "";
    }

    return vtt;
  } catch (error) {
    console.error('Transcription failed:', error);
    throw error;
  }
};

module.exports = {
  generateVTTFromUrl,
};
