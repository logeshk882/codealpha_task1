const translateBtn = document.getElementById('translateBtn');
const clearBtn = document.getElementById('clearBtn');
const copyBtn = document.getElementById('copyBtn');
const speakBtn = document.getElementById('speakBtn');
const inputText = document.getElementById('inputText');
const outputText = document.getElementById('outputText');
const sourceLang = document.getElementById('sourceLang');
const targetLang = document.getElementById('targetLang');
const statusEl = document.getElementById('status');

translateBtn.addEventListener('click', async () => {
  const text = inputText.value.trim();
  if (!text) {
    statusEl.style.color = 'crimson';
    statusEl.textContent = 'Please enter text to translate.';
    return;
  }
  statusEl.style.color = '#666';
  statusEl.textContent = 'Translating...';

  try {
    const res = await fetch('/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        source: sourceLang.value || undefined,
        target: targetLang.value
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(()=>({message:'Server error'}));
      throw new Error(err.message || 'Translation failed');
    }
    const data = await res.json();
    outputText.value = data.translatedText || '';
    statusEl.style.color = 'green';
    statusEl.textContent = 'Done';
  } catch (err) {
    statusEl.style.color = 'crimson';
    statusEl.textContent = 'Error: ' + err.message;
    console.error(err);
  }
});

clearBtn.addEventListener('click', () => {
  inputText.value = '';
  outputText.value = '';
  statusEl.textContent = '';
});

copyBtn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(outputText.value);
    statusEl.style.color = 'green';
    statusEl.textContent = 'Copied to clipboard';
  } catch (e) {
    statusEl.style.color = 'crimson';
    statusEl.textContent = 'Copy failed: ' + e.message;
  }
});

speakBtn.addEventListener('click', () => {
  const text = outputText.value.trim();
  if (!text) {
    statusEl.style.color = 'crimson';
    statusEl.textContent = 'Nothing to speak.';
    return;
  }
  if (!('speechSynthesis' in window)) {
    statusEl.style.color = 'crimson';
    statusEl.textContent = 'Text-to-Speech not supported in this browser.';
    return;
  }
  const utter = new SpeechSynthesisUtterance(text);
  // try to set voice language to target lang if available
  const lang = targetLang.value || 'en';
  utter.lang = lang;
  window.speechSynthesis.cancel(); // stop previous
  window.speechSynthesis.speak(utter);
  statusEl.style.color = '#666';
  statusEl.textContent = 'Speaking...';
});
