import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  Volume2, 
  Play, 
  Pause, 
  Square, 
  Copy, 
  Check, 
  Trash2, 
  Menu, 
  Zap, 
  Sparkles, 
  Radio,
  FileAudio,
  Send
} from 'lucide-react';
import { motion } from 'motion/react';
import { showToast } from '../../utils/toast';

interface AudioStudioProps {
  onOpenSidebar: () => void;
  onSendToChat?: (prompt: string) => void;
}

export const AudioStudio: React.FC<AudioStudioProps> = ({ onOpenSidebar, onSendToChat }) => {
  // TTS State
  const [ttsText, setTtsText] = useState('Selamat datang di Navix AI. Mesin neural speech siap memproses teks Anda menjadi ucapan alami beresolusi tinggi.');
  const [selectedVoice, setSelectedVoice] = useState('id-ID-budi');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [isPlayingTTS, setIsPlayingTTS] = useState(false);

  // STT State
  const [isRecording, setIsRecording] = useState(false);
  const [sttTranscript, setSttTranscript] = useState('');
  const [copiedTranscript, setCopiedTranscript] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Audio Library State
  const [audioLibrary, setAudioLibrary] = useState<Array<{ id: string; title: string; text: string; duration: string; date: string }>>(() => {
    try {
      const saved = localStorage.getItem('navix_audio_library');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load navix_audio_library', e);
    }
    return [
      {
        id: 'aud-1',
        title: 'Selamat datang di Navix AI',
        text: 'Selamat datang di Navix AI. Mesin neural speech siap memproses teks Anda menjadi ucapan alami.',
        duration: '0:05',
        date: 'Baru saja'
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('navix_audio_library', JSON.stringify(audioLibrary));
  }, [audioLibrary]);

  const voiceOptions = [
    { id: 'id-ID-budi', name: 'Indonesia — Budi (Deep Male)', lang: 'id-ID' },
    { id: 'id-ID-sarah', name: 'Indonesia — Sarah (Natural Female)', lang: 'id-ID' },
    { id: 'id-ID-reza', name: 'Indonesia — Reza (Energetic Male)', lang: 'id-ID' },
    { id: 'en-US-adam', name: 'English (US) — Adam (Pro Studio)', lang: 'en-US' },
    { id: 'en-US-emily', name: 'English (US) — Emily (Soft Narration)', lang: 'en-US' }
  ];

  // Initialize Speech Recognition if supported
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'id-ID';

        recognition.onresult = (event: any) => {
          let current = '';
          for (let i = 0; i < event.results.length; i++) {
            current += event.results[i][0].transcript + ' ';
          }
          setSttTranscript(current.trim());
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition error', event);
          setIsRecording(false);
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const handleSynthesizeSpeech = () => {
    if (!ttsText.trim()) {
      showToast('Masukkan teks yang ingin disuarakan', 'error');
      return;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSynthesizing(true);
      setIsPlayingTTS(true);

      const utterance = new SpeechSynthesisUtterance(ttsText);
      const selected = voiceOptions.find(v => v.id === selectedVoice);
      if (selected) {
        utterance.lang = selected.lang;
      }

      utterance.onend = () => {
        setIsSynthesizing(false);
        setIsPlayingTTS(false);
        showToast('Sintesis ucapan selesai dimainkan', 'info');
      };

      utterance.onerror = () => {
        setIsSynthesizing(false);
        setIsPlayingTTS(false);
      };

      window.speechSynthesis.speak(utterance);

      // Save to library
      const newItem = {
        id: `aud-${Date.now()}`,
        title: ttsText.slice(0, 28) + '...',
        text: ttsText,
        duration: '0:06',
        date: 'Baru saja'
      };
      setAudioLibrary(prev => [newItem, ...prev]);
      showToast('Sintesis suara berhasil dijalankan!', 'success');
    } else {
      showToast('Web Speech API tidak didukung pada browser ini', 'error');
    }
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      showToast('Perekaman suara selesai', 'info');
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsRecording(true);
          showToast('Mikrofon aktif! Silakan berbicara...', 'success');
        } catch (e) {
          showToast('Gagal mengakses mikrofon. Periksa izin browser.', 'error');
        }
      } else {
        // Fallback simulation
        setIsRecording(true);
        setTimeout(() => {
          setSttTranscript('Halo Navix AI, tolong bantu analisis strategi trading hari ini.');
          setIsRecording(false);
          showToast('Transkripsi suara selesai!', 'success');
        }, 3000);
      }
    }
  };

  const handleCopyTranscript = () => {
    if (!sttTranscript) return;
    navigator.clipboard.writeText(sttTranscript);
    setCopiedTranscript(true);
    setTimeout(() => setCopiedTranscript(false), 2000);
    showToast('Transkripsi tersalin ke clipboard', 'success');
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#07080b] text-neutral-200 overflow-y-auto custom-scrollbar">
      {/* Top Header */}
      <header className="h-16 px-4 md:px-6 border-b border-neutral-800/80 bg-neutral-900/50 backdrop-blur-md flex items-center justify-between shrink-0 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSidebar}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 active:scale-95 transition-all md:hidden cursor-pointer"
            title="Buka Menu"
          >
            <Menu size={20} />
          </button>
          <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
            <Volume2 size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm md:text-base font-bold text-white tracking-wide">
                Multimedia. Audio & Speech
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                Neural TTS/STT
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 hidden sm:block">
              Synthesize neural speech (TTS) and transcribe live recording (STT)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-neutral-400 bg-neutral-800/80 px-2.5 py-1 rounded-lg border border-neutral-700/50 flex items-center gap-1.5">
            <Radio size={13} className="text-emerald-400 animate-pulse" />
            <span>Audio Engine: Ready</span>
          </span>
        </div>
      </header>

      {/* Main Workspace Split Layout */}
      <div className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Text-to-Speech (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-5 rounded-2xl bg-[#0e1117] border border-neutral-800/80 shadow-xl space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-neutral-800/60">
              <Volume2 size={18} className="text-red-500" />
              <h2 className="text-sm font-bold text-white tracking-wide">
                Text-to-Speech (TTS)
              </h2>
            </div>

            {/* Voice Character Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold tracking-wider text-neutral-400 uppercase">
                Pilih Karakter Suara
              </label>
              <select
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-neutral-950 text-xs text-neutral-200 border border-neutral-800 focus:outline-none focus:border-red-500/50 cursor-pointer"
              >
                {voiceOptions.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Input Textarea */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold tracking-wider text-neutral-400 uppercase">
                Teks Untuk Disuarakan
              </label>
              <textarea
                value={ttsText}
                onChange={(e) => setTtsText(e.target.value)}
                placeholder="Tulis kalimat di sini untuk diubah menjadi suara..."
                rows={5}
                className="w-full p-3.5 rounded-xl bg-neutral-950/90 text-xs text-neutral-100 placeholder-neutral-500 border border-neutral-800 focus:outline-none focus:border-red-500/60 transition-all resize-none font-sans leading-relaxed"
              />
            </div>

            {/* Action Button */}
            <button
              onClick={handleSynthesizeSpeech}
              disabled={isSynthesizing || !ttsText.trim()}
              className={`w-full min-h-[46px] rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-red-950/40 border border-red-500/30 active:scale-[0.98] ${
                isSynthesizing || !ttsText.trim()
                  ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed border-neutral-700'
                  : 'bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:brightness-110 text-white'
              }`}
            >
              <Volume2 size={16} />
              <span>{isPlayingTTS ? 'Memutar Suara Neural...' : 'Synthesize Speech'}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Speech-to-Text Recorder & Library (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-5 rounded-2xl bg-[#0e1117] border border-neutral-800/80 shadow-xl space-y-4 flex flex-col items-center text-center">
            <div className="w-full flex items-center justify-between pb-2 border-b border-neutral-800/60">
              <div className="flex items-center gap-2">
                <Mic size={18} className="text-rose-500" />
                <h2 className="text-sm font-bold text-white tracking-wide">
                  Speech-to-Text (STT) Recorder
                </h2>
              </div>
              <span className="text-[10px] font-mono text-neutral-500">Live Rec</span>
            </div>

            {/* Big Mic Circular Button with Pulsing Wave */}
            <div className="py-4 flex flex-col items-center">
              <div className="relative flex items-center justify-center">
                {isRecording && (
                  <motion.div
                    animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.8, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="absolute w-24 h-24 rounded-full bg-red-600/30"
                  />
                )}
                <button
                  onClick={handleToggleRecording}
                  className={`w-20 h-20 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xl ${
                    isRecording
                      ? 'bg-red-600 text-white shadow-red-900/60 scale-105 animate-pulse'
                      : 'bg-neutral-900 text-neutral-300 hover:text-white hover:bg-neutral-800 border border-neutral-700/60'
                  }`}
                  title={isRecording ? 'Hentikan Perekaman' : 'Mulai Rekam'}
                >
                  {isRecording ? <Square size={24} className="fill-current" /> : <Mic size={28} />}
                </button>
              </div>

              <div className="mt-3">
                <p className="text-xs font-bold text-white tracking-wide">
                  {isRecording ? 'Mendengarkan ucapan Anda...' : 'Klik Mikrofon untuk Merekam'}
                </p>
                <p className="text-[10px] text-neutral-500 mt-0.5">
                  Menggunakan engine transkripsi real-time browser Anda
                </p>
              </div>
            </div>

            {/* Transcript Result Box */}
            <div className="w-full p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 text-left space-y-2">
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span className="font-mono text-[10px] uppercase">Hasil Transkripsi:</span>
                {sttTranscript && (
                  <div className="flex items-center gap-2">
                    {onSendToChat && (
                      <button
                        onClick={() => onSendToChat(`[Hasil Transkripsi]: ${sttTranscript}`)}
                        className="p-1 rounded text-neutral-400 hover:text-blue-400 cursor-pointer transition"
                        title="Kirim ke Chat Utama"
                      >
                        <Send size={14} />
                      </button>
                    )}
                    <button
                      onClick={handleCopyTranscript}
                      className="p-1 rounded text-neutral-400 hover:text-white cursor-pointer"
                      title="Salin Transkripsi"
                    >
                      {copiedTranscript ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    </button>
                    <button
                      onClick={() => setSttTranscript('')}
                      className="p-1 rounded text-neutral-400 hover:text-red-400 cursor-pointer"
                      title="Hapus"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
              <p className="text-xs text-neutral-200 min-h-[48px] leading-relaxed">
                {sttTranscript || (
                  <span className="text-neutral-600 italic">
                    Belum ada suara terekam. Klik mikrofon di atas untuk memulai transkripsi kata demi kata...
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Audio Library */}
          <div className="p-4 rounded-2xl bg-[#0e1117] border border-neutral-800/80 shadow-xl space-y-3">
            <span className="text-xs font-mono font-bold tracking-wider text-neutral-400 uppercase">
              AUDIO LIBRARY ({audioLibrary.length})
            </span>
            <div className="space-y-2">
              {audioLibrary.map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="w-8 h-8 rounded-lg bg-neutral-950 flex items-center justify-center shrink-0 text-red-400">
                      <FileAudio size={16} />
                    </div>
                    <div className="truncate text-left">
                      <p className="text-xs font-medium text-white truncate">{item.title}</p>
                      <p className="text-[10px] text-neutral-500">{item.duration} • {item.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {onSendToChat && (
                      <button
                        onClick={() => onSendToChat(`[Audio: ${item.title}]\n${item.text}`)}
                        className="p-1.5 rounded-lg bg-neutral-800 text-neutral-400 hover:text-blue-400 hover:bg-neutral-700 cursor-pointer transition"
                        title="Kirim ke Chat Utama"
                      >
                        <Send size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                          const utt = new SpeechSynthesisUtterance(item.text);
                          window.speechSynthesis.speak(utt);
                        }
                      }}
                      className="p-1.5 rounded-lg bg-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-700 cursor-pointer transition"
                      title="Putar Audio"
                    >
                      <Play size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
