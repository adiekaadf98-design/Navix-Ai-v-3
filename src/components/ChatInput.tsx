import { useState, useRef, useEffect } from 'react';
import { ArrowUp, StopCircle, Paperclip, Mic, X, Video, Film, Image as ImageIcon, ChevronDown, Sparkles, ArrowDown, TrendingUp, Search, Zap, Shield, CreditCard } from 'lucide-react';
import { Attachment } from '../types';
import { EffortLevel } from '../services/ThinkingEngine';
import { ModelThinkingSelector } from './ModelThinkingSelector';
import { useAuthStore } from '../store/useAuthStore';
import { QuotaService } from '../services/quotaService';

const TRADING_SUGGESTIONS = [
  "Analisis teknikal",
  "Analisis fundamental",
  "Prediksi harga Bitcoin",
  "Prediksi harga Ethereum",
  "Support dan Resistance",
  "Relative Strength Index (RSI)",
  "Moving Average Convergence Divergence (MACD)",
  "Pola Head and Shoulders",
  "Pola Double Top",
  "Pola Double Bottom",
  "Bullish Divergence",
  "Bearish Divergence",
  "Fibonacci Retracement",
  "Bollinger Bands",
  "Volume Profile",
  "Candlestick Patterns",
  "Golden Cross",
  "Death Cross",
  "Smart Money Concepts (SMC)",
  "Order Block",
  "Liquidity Sweep",
  "Market Structure Shift",
  "Cara menggunakan MACD",
  "Apa itu RSI?"
];

interface ChatInputProps {
  onSendMessage: (message: string, attachments: Attachment[]) => void;
  isLoading: boolean;
  showErrorBox: (message: string) => void;
  selectedModel?: string;
  onModelChange?: (model: string) => void;
  effortLevel?: EffortLevel | string;
  setEffortLevel?: (effort: EffortLevel | string) => void;
  thinkingMode?: boolean;
  setThinkingMode?: (enabled: boolean) => void;
  showScrollToBottom?: boolean;
  onScrollToBottom?: () => void;
}

export function ChatInput({ 
  onSendMessage, 
  isLoading, 
  showErrorBox,
  selectedModel = 'gemini-3.6-flash',
  onModelChange,
  effortLevel = 'medium',
  setEffortLevel,
  thinkingMode = true,
  setThinkingMode,
  showScrollToBottom,
  onScrollToBottom
}: ChatInputProps) {
  const { user } = useAuthStore();
  const [quotaStatus, setQuotaStatus] = useState(() => QuotaService.getQuotaStatusSync(user));

  useEffect(() => {
    let cancelled = false;
    QuotaService.getQuotaStatus(user).then(status => {
      if (!cancelled) setQuotaStatus(status);
    });
    return () => { cancelled = true; };
  }, [user, isLoading]);

  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isRefVideoPanelOpen, setIsRefVideoPanelOpen] = useState(false);
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);
  const [refVideo, setRefVideo] = useState<Attachment | null>(null);
  const [refImage, setRefImage] = useState<Attachment | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
  
  const refVideoInputRef = useRef<HTMLInputElement>(null);
  const refImageInputRef = useRef<HTMLInputElement>(null);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);

  const getModelDisplayName = (modelId: string) => {
    const id = (modelId || '').toLowerCase();
    if (id.includes('pro')) return 'Navix Pro';
    if (id.includes('lite')) return 'Navix Lite';
    return 'Navix Flash';
  };

  const getModelCompactName = (modelId: string) => {
    const id = (modelId || '').toLowerCase();
    if (id.includes('pro')) return 'Pro';
    if (id.includes('lite')) return 'Lite';
    return 'Flash';
  };

  const autoResize = () => {
    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        const newHeight = Math.min(textareaRef.current.scrollHeight, 200);
        textareaRef.current.style.height = `${newHeight}px`;
      }
    });
  };

  const handleSubmit = () => {
    if ((!input.trim() && attachments.length === 0 && !refVideo && !refImage) || isLoading) return;
    
    const finalAttachments = [...attachments];
    if (refImage) {
      finalAttachments.push(refImage);
    }
    if (refVideo) {
      finalAttachments.push(refVideo);
    }
    
    onSendMessage(input.trim(), finalAttachments);
    setInput('');
    setAttachments([]);
    setRefVideo(null);
    setRefImage(null);
    setIsRefVideoPanelOpen(false);
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveSuggestionIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveSuggestionIndex(prev => (prev > 0 ? prev - 1 : 0));
        return;
      }
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        setInput(suggestions[activeSuggestionIndex]);
        setSuggestions([]);
        return;
      }
      if (e.key === 'Escape') {
        setSuggestions([]);
        return;
      }
    }

    const isModEnter = e.key === 'Enter' && (e.metaKey || e.ctrlKey);
    const isPlainEnter = e.key === 'Enter' && !e.shiftKey;
    
    if (isPlainEnter || isModEnter) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInput(value);
    autoResize();

    if (value.trim().length > 1) {
      const lowerValue = value.toLowerCase();
      const filtered = TRADING_SUGGESTIONS.filter(s => 
        s.toLowerCase().includes(lowerValue) && s.toLowerCase() !== lowerValue
      ).slice(0, 5);
      setSuggestions(filtered);
      setActiveSuggestionIndex(0);
    } else {
      setSuggestions([]);
    }
  };

  const handleRefVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Data = event.target?.result as string;
        const base64 = base64Data.split(',')[1];
        setRefVideo({
          type: 'video',
          url: URL.createObjectURL(file),
          mimeType: file.type,
          data: base64,
          name: file.name
        });
      };
      reader.readAsDataURL(file);
    }
    if (refVideoInputRef.current) {
      refVideoInputRef.current.value = '';
    }
  };

  const handleRefImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Data = event.target?.result as string;
        const base64 = base64Data.split(',')[1];
        setRefImage({
          type: 'image',
          url: URL.createObjectURL(file),
          mimeType: file.type,
          data: base64,
          name: file.name
        });
      };
      reader.readAsDataURL(file);
    }
    if (refImageInputRef.current) {
      refImageInputRef.current.value = '';
    }
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    if (attachments.length + newFiles.length > 50) {
      showErrorBox("Maksimal 50 file dapat dikirim dalam satu pesan.");
      return;
    }

    newFiles.forEach(file => {
      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');
      
      if (!isVideo && !isImage) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Data = event.target?.result as string; 
        const base64 = base64Data.split(',')[1];
        
        setAttachments(prev => [...prev, {
          type: isVideo ? 'video' : 'image',
          url: URL.createObjectURL(file),
          mimeType: file.type,
          data: base64
        }]);
      };
      reader.readAsDataURL(file);
    });
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      }
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64Data = event.target?.result as string;
          const base64 = base64Data.split(',')[1];
          setAttachments(prev => [...prev, {
            type: 'audio',
            url: URL.createObjectURL(audioBlob),
            mimeType: 'audio/webm',
            data: base64
          }]);
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone", err);
      showErrorBox("Tidak dapat mengakses mikrofon (Permission denied).");
    }
  };

  const removeAttachment = (indexToRemove: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== indexToRemove));
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/90 to-transparent pt-20 shrink-0 z-20">
      <div className="max-w-3xl mx-auto pb-safe">
        {attachments.length > 0 && (
          <div className="mb-3 flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
            {attachments.map((att, i) => (
              <div key={i} className="relative w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-neutral-800 border border-neutral-700">
                {att.type === 'image' && <img src={att.url} className="w-full h-full object-cover" />}
                {att.type === 'video' && (
                  <div className="w-full h-full relative">
                    <video src={att.url} className="w-full h-full object-cover" muted playsInline preload="metadata" />
                    <div className="absolute inset-0 bg-black/25 flex items-center justify-center pointer-events-none">
                      <Video size={16} className="text-white drop-shadow-md" />
                    </div>
                  </div>
                )}
                {att.type === 'audio' && <div className="w-full h-full flex items-center justify-center bg-neutral-900 text-red-500"><Mic size={24} /></div>}
                <button 
                  onClick={() => removeAttachment(i)}
                  className="absolute top-1 right-1 w-5 h-5 bg-neutral-900/80 rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-colors backdrop-blur-sm z-10"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        {isRefVideoPanelOpen && (
          <div className="mb-4 bg-neutral-900/80 backdrop-blur-md border border-indigo-500/30 p-4 rounded-xl shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between mb-4 border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Film size={18} className="text-indigo-400" />
                <span className="text-sm font-medium text-neutral-200">Image-to-Video (Referensi Gerakan)</span>
              </div>
              <button onClick={() => setIsRefVideoPanelOpen(false)} className="text-neutral-500 hover:text-neutral-300 bg-neutral-800/50 hover:bg-neutral-800 p-1 rounded-md transition-colors">
                <X size={16} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Box 1: Image */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 px-1">
                  <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px] font-bold">1</div>
                  <span className="text-xs font-medium text-neutral-400">Pilih Gambar Objek</span>
                </div>
                {!refImage ? (
                  <div 
                    onClick={() => refImageInputRef.current?.click()}
                    className="w-full h-16 sm:h-20 border-2 border-dashed border-neutral-700 hover:border-blue-500/50 rounded-lg flex flex-row items-center justify-center gap-3 cursor-pointer transition-colors group bg-neutral-800/30 hover:bg-neutral-800/60"
                  >
                    <div className="w-8 h-8 bg-neutral-800 group-hover:bg-blue-500/10 rounded-full flex items-center justify-center">
                      <ImageIcon size={24} className="text-neutral-400 group-hover:text-blue-400" />
                    </div>
                    <p className="text-sm text-neutral-300 font-medium">Unggah Gambar</p>
                  </div>
                ) : (
                  <div className="relative w-full h-16 sm:h-20 bg-neutral-800 rounded-lg border border-neutral-700 overflow-hidden group">
                    <img src={refImage.url} className="w-full h-full object-cover" alt="Reference Image" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button 
                        onClick={() => setRefImage(null)}
                        className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-md transition-colors shadow-lg"
                      >
                        Hapus Gambar
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Box 2: Video */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 px-1">
                  <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px] font-bold">2</div>
                  <span className="text-xs font-medium text-neutral-400">Pilih Video Gerakan</span>
                </div>
                {!refVideo ? (
                  <div 
                    onClick={() => refVideoInputRef.current?.click()}
                    className="w-full h-16 sm:h-20 border-2 border-dashed border-neutral-700 hover:border-indigo-500/50 rounded-lg flex flex-row items-center justify-center gap-3 cursor-pointer transition-colors group bg-neutral-800/30 hover:bg-neutral-800/60"
                  >
                    <div className="w-8 h-8 bg-neutral-800 group-hover:bg-indigo-500/10 rounded-full flex items-center justify-center">
                      <Video size={24} className="text-neutral-400 group-hover:text-indigo-400" />
                    </div>
                    <p className="text-sm text-neutral-300 font-medium">Unggah Video</p>
                  </div>
                ) : (
                  <div className="relative w-full h-16 sm:h-20 bg-neutral-800 rounded-lg border border-neutral-700 overflow-hidden group">
                    <video src={refVideo.url} className="w-full h-full object-cover" muted playsInline preload="metadata" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-2 pointer-events-none">
                      <p className="text-[10px] font-medium text-neutral-200 truncate max-w-full flex items-center gap-1.5">
                        <Film size={12} className="text-indigo-400 shrink-0" />
                        {refVideo.name || 'Video Referensi'}
                      </p>
                    </div>
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button 
                        onClick={() => setRefVideo(null)}
                        className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-md transition-colors shadow-lg"
                      >
                        Hapus Video
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <p className="text-[10px] text-neutral-500 text-center mt-4">AI akan mengekstrak gerakan dari Video (2) dan menerapkannya pada Gambar (1).</p>
          </div>
        )}
        
        <div className="flex justify-between items-center mb-2 px-2 text-[10px] font-mono text-neutral-500 uppercase tracking-wider">
          <div className="flex flex-wrap items-center gap-1.5 text-neutral-600">
            <span className="hidden sm:inline">Shortcuts:</span>
            <kbd className="px-1 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-400 font-mono text-[9px]">Enter</kbd>
            <span className="lowercase text-neutral-700">or</span>
            <kbd className="px-1 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-400 font-mono text-[9px]">⌘↵</kbd>
            <span className="lowercase text-neutral-700">to send</span>
            <span className="text-neutral-800 hidden sm:inline">|</span>
            <span className="hidden sm:inline">
              <kbd className="px-1 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-400 font-mono text-[9px]">Esc</kbd>
              <span className="lowercase text-neutral-700 ml-1">close sidebar</span>
            </span>
          </div>

          {input.length > 0 && (
            <div className="flex gap-3 text-[10px] tracking-[0.15em] animate-in fade-in duration-300">
              <div className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-neutral-700" />
                <span>{input.length} chars</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-red-500/30" />
                <span>~{Math.ceil(input.length / 4)} tokens</span>
              </div>
            </div>
          )}
        </div>

        <div className="relative bg-[#1c1c1c] rounded-[24px] border border-neutral-800 shadow-[0_0_30px_rgba(0,0,0,0.5)] flex flex-col p-3 focus-within:border-neutral-700 focus-within:ring-1 focus-within:ring-neutral-700/50 transition-all duration-300">
          {suggestions.length > 0 && (
            <div className="absolute bottom-[calc(100%+8px)] left-0 right-0 bg-[#1c1c1c] border border-neutral-700/50 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
              {suggestions.map((suggestion, idx) => (
                <div 
                  key={suggestion}
                  className={`px-4 py-2.5 text-sm cursor-pointer transition-colors flex items-center gap-3 ${idx === activeSuggestionIndex ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-200'}`}
                  onClick={() => {
                    setInput(suggestion);
                    setSuggestions([]);
                    if (textareaRef.current) {
                      textareaRef.current.focus();
                    }
                  }}
                  onMouseEnter={() => setActiveSuggestionIndex(idx)}
                >
                  <Search size={14} className={idx === activeSuggestionIndex ? 'text-indigo-400' : 'text-neutral-500'} />
                  {suggestion}
                </div>
              ))}
            </div>
          )}

          {showScrollToBottom && (
            <button
              type="button"
              onClick={onScrollToBottom}
              className="absolute -top-11 left-1/2 -translate-x-1/2 z-30 w-8 h-8 rounded-full bg-neutral-900/95 hover:bg-neutral-800 text-white border border-neutral-700/90 shadow-xl flex items-center justify-center transition-all cursor-pointer backdrop-blur-md group hover:border-neutral-500 animate-in fade-in slide-in-from-bottom-2"
              title="Gulir ke paling bawah"
            >
              <ArrowDown size={16} className="text-white group-hover:translate-y-0.5 transition-transform" />
            </button>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            multiple 
            accept="image/*,video/*,audio/*"
          />
          <input 
            type="file" 
            ref={refVideoInputRef} 
            onChange={handleRefVideoUpload} 
            className="hidden" 
            accept="video/*"
          />
          <input 
            type="file" 
            ref={refImageInputRef} 
            onChange={handleRefImageUpload} 
            className="hidden" 
            accept="image/*"
          />
          
          {/* Row 1: Textarea */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={isRecording ? "Sedang merekam suara..." : "Tulis pesan..."}
            className="w-full bg-transparent text-neutral-100 placeholder:text-neutral-500 resize-none outline-none py-1 px-2 max-h-[200px] overflow-y-auto text-base sm:text-sm md:text-base disabled:opacity-50 min-h-[44px]"
            disabled={isRecording}
            rows={1}
          />

          {/* Row 2: Claude-style Single-Line Action Toolbar */}
          <div className="flex items-center justify-between pt-1.5 mt-1 border-t border-neutral-800/40 gap-1.5">
            {/* Left toolbar tools: Attachment, Model Selector, Video Ref */}
            <div className="flex items-center gap-1 sm:gap-1.5 shrink min-w-0">
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/70 rounded-full transition-colors shrink-0"
                title="Lampirkan Foto / File"
              >
                <Paperclip size={17} />
              </button>

              {/* Model & Thinking Level Selector Button (Claude style) */}
              <button
                type="button"
                onClick={() => setIsModelModalOpen(true)}
                className="flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-neutral-800/80 hover:bg-neutral-800 border border-neutral-700/60 hover:border-neutral-600 text-neutral-200 text-[11px] sm:text-xs font-medium transition-all group cursor-pointer shadow-xs shrink-0 whitespace-nowrap"
                title="Pilih Model AI & Tingkatan Berpikir"
              >
                <Sparkles size={11} className={thinkingMode ? 'text-amber-400 shrink-0 animate-pulse' : 'text-neutral-400 shrink-0'} />
                <span className="font-sans font-medium text-[11px] sm:text-xs text-neutral-200">
                  <span className="sm:hidden">{getModelCompactName(selectedModel)}</span>
                  <span className="hidden sm:inline">{getModelDisplayName(selectedModel)}</span>
                </span>
                <span className="text-[9px] sm:text-[10px] text-neutral-400 font-mono">
                  • {effortLevel || 'medium'}
                </span>
                <ChevronDown size={11} className="text-neutral-400 group-hover:text-neutral-200 shrink-0" />
              </button>

              <button 
                type="button"
                onClick={() => setIsRefVideoPanelOpen(!isRefVideoPanelOpen)}
                className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full transition-colors shrink-0 ${isRefVideoPanelOpen ? 'bg-indigo-500/20 text-indigo-400' : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/70'}`}
                title="Referensi Gerakan Video"
              >
                <Film size={16} />
              </button>
            </div>

            {/* Right toolbar tools: Voice Recording & Send */}
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 ml-auto">
              <button 
                type="button"
                onClick={toggleRecording}
                className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full transition-all duration-300 shrink-0 ${isRecording ? 'bg-red-500/20 text-red-500 animate-pulse' : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/70'}`}
                title="Rekam Suara"
              >
                {isRecording ? <StopCircle size={17} /> : <Mic size={17} />}
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={(!input.trim() && attachments.length === 0 && !refVideo) || isLoading}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-neutral-100 disabled:opacity-30 hover:bg-neutral-300 disabled:hover:bg-neutral-100 flex items-center justify-center text-neutral-900 transition-all cursor-pointer shadow-sm shrink-0"
                aria-label="Kirim Pesan"
              >
                {isLoading ? <StopCircle size={15} /> : <ArrowUp size={15} className="stroke-[2.5px]" />}
              </button>
            </div>
          </div>
        </div>

        {/* Quota & Disclaimer subtext */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3 text-[11px] text-neutral-500 text-center mt-2 px-2">
          {quotaStatus.isDeveloper ? (
            <span className="inline-flex items-center gap-1 text-[10px] text-red-400 font-mono font-medium">
              <Shield size={11} className="text-red-400" />
              Dev Mode • Unlimited (∞)
            </span>
          ) : quotaStatus.credits > 0 ? (
            <span className="inline-flex items-center gap-1 text-[10px] text-blue-400 font-mono font-medium">
              <Zap size={11} className="text-blue-400" />
              Paket {quotaStatus.plan.toUpperCase()} • {quotaStatus.credits} Query
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] text-neutral-400 font-medium">
              <Zap size={11} className={quotaStatus.remainingToday > 0 ? "text-emerald-400" : "text-amber-400"} />
              Free Trial: <strong className={quotaStatus.remainingToday > 0 ? "text-neutral-200" : "text-amber-400"}>{quotaStatus.remainingToday}/{quotaStatus.dailyFreeLimit}</strong> chat gratis hari ini
            </span>
          )}
          <span className="hidden sm:inline text-neutral-700">•</span>
          <p className="text-[10px] sm:text-[11px] text-neutral-500">
            Navix AI dapat membuat kesalahan. Periksa data penting.
          </p>
        </div>

        {/* Model Thinking Selector Modal */}
        {selectedModel && onModelChange && setEffortLevel && setThinkingMode && (
          <ModelThinkingSelector
            isOpen={isModelModalOpen}
            onClose={() => setIsModelModalOpen(false)}
            selectedModel={selectedModel}
            onModelChange={onModelChange}
            effortLevel={effortLevel}
            setEffortLevel={setEffortLevel}
            thinkingMode={thinkingMode}
            setThinkingMode={setThinkingMode}
          />
        )}
      </div>
    </div>
  );
}
