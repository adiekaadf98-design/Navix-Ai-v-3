const fs = require('fs');
let code = fs.readFileSync('src/components/ChatArea.tsx', 'utf8');

const ttsFunc = `const handleSpeak = async (id: string, text: string) => {
    if (speakingId === id) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setSpeakingId(null);
      return;
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeakingId(id);

      let cleanText = text.replace(/\\x60\\x60\\x60[\\s\\S]*?\\x60\\x60\\x60/g, " ");
      cleanText = cleanText.replace(/[*_#]/g, "");
      
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'id-ID';
      
      // Fallback if voice isn't ready
      const voices = window.speechSynthesis.getVoices();
      const indoVoice = voices.find(v => v.lang.includes('id') || v.lang.includes('ID'));
      if (indoVoice) utterance.voice = indoVoice;
      
      utterance.onend = () => setSpeakingId(null);
      utterance.onerror = (e) => {
        console.warn("TTS Error:", e);
        setSpeakingId(null);
      };

      window.speechSynthesis.speak(utterance);
      
      // Check if actually speaking (sometimes it gets stuck)
      setTimeout(() => {
        if (!window.speechSynthesis.speaking) {
           showErrorBox("Perangkat Anda tidak mendukung fitur suara (atau sedang senyap).");
           setSpeakingId(null);
        }
      }, 1000);
    } else {
      showErrorBox("Browser Anda tidak mendukung fitur suara (Text-to-Speech).");
    }
  };`;

code = code.replace(/const handleSpeak = async \(id: string, text: string\) => \{[\s\S]*?window\.speechSynthesis\.speak\(utterance\);\n    \} else \{\n      showErrorBox\("Browser Anda tidak mendukung fitur suara \(Text-to-Speech\)\."\);\n    \}\n  \};/, ttsFunc);

fs.writeFileSync('src/components/ChatArea.tsx', code);
console.log("Updated ChatArea.tsx TTS");
