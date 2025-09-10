require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('../frontend')); // serve frontend folder

// choose provider via env: GOOGLE, AZURE, or MEMORY
const PROVIDER = process.env.TRANSLATION_PROVIDER || 'MEMORY'; // default = MEMORY

// ---------- Google Cloud v2 wrapper ----------
let googleTranslateClient;
if (PROVIDER.toUpperCase() === 'GOOGLE') {
  try {
    const { Translate } = require('@google-cloud/translate').v2;
    googleTranslateClient = new Translate();
    console.log('Using Google Translate provider');
  } catch (e) {
    console.warn('Google translate lib not available or not configured:', e.message);
  }
}

// ---------- Azure config ----------
const AZURE_KEY = process.env.AZURE_SUBSCRIPTION_KEY;
const AZURE_REGION = process.env.AZURE_REGION;
const AZURE_ENDPOINT = process.env.AZURE_ENDPOINT || 'https://api.cognitive.microsofttranslator.com';

app.post('/translate', async (req, res) => {
  const { text, source, target } = req.body || {};
  if (!text || !target) return res.status(400).json({ message: 'Missing text or target language' });

  try {
    if (PROVIDER.toUpperCase() === 'AZURE') {
      if (!AZURE_KEY) return res.status(500).json({ message: 'Azure credentials not configured' });

      const params = new URLSearchParams({ 'api-version': '3.0', to: target });
      if (source) params.append('from', source);
      const url = `${AZURE_ENDPOINT}/translate?${params.toString()}`;

      const response = await axios.post(url, [{ Text: text }], {
        headers: {
          'Ocp-Apim-Subscription-Key': AZURE_KEY,
          'Ocp-Apim-Subscription-Region': AZURE_REGION || '',
          'Content-Type': 'application/json'
        }
      });

      const translations = response.data?.[0]?.translations;
      const translatedText = translations?.[0]?.text || '';
      return res.json({ translatedText, provider: 'AZURE' });

    } else if (PROVIDER.toUpperCase() === 'GOOGLE') {
      if (!googleTranslateClient) return res.status(500).json({ message: 'Google translate client not available' });
      const opts = {};
      if (source) opts.from = source;
      const [translated] = await googleTranslateClient.translate(text, { to: target, from: source });
      return res.json({ translatedText: translated, provider: 'GOOGLE' });

    } else {
      // ---------- Free MyMemory fallback ----------
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${source || 'en'}|${target}`;
      const response = await axios.get(url);
      const translatedText = response.data?.responseData?.translatedText || '';
      return res.json({ translatedText, provider: 'MEMORY' });
    }
  } catch (err) {
    console.error('Translate error', err?.response?.data || err.message || err);
    return res.status(500).json({ message: 'Translation failed', details: err?.message || err });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT} (provider=${PROVIDER})`);
});
