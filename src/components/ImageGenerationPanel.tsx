import { useState, useEffect } from 'react';
import { X, Sparkles, Wand2, Info, Image as ImageIcon, Camera, Smile, Palette, Scissors, Layers, History, Trash2, ExternalLink, Eye, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { HardwareStatus } from './HardwareStatus';

interface ImageGenerationPanelProps {
  onClose: () => void;
  onSendMessage: (message: string, attachments?: any[]) => void;
  isLoading: boolean;
}

interface RecentPrompt {
  id: string;
  text: string;
  preset: string;
  aspectRatio: string;
  stylePreset?: string;
  detailIntensity?: number;
  timestamp: number;
}

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
}

export function ImageGenerationPanel({ onClose, onSendMessage, isLoading }: ImageGenerationPanelProps) {
  const [prompt, setPrompt] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('standard');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [showInfo, setShowInfo] = useState(false);
  const [activeTab, setActiveTab] = useState<'prompts' | 'gallery'>('gallery');
  const [lightboxImage, setLightboxImage] = useState<GeneratedImage | null>(null);
  
  const [stylePreset, setStylePreset] = useState('photorealistic');
  const [detailIntensity, setDetailIntensity] = useState(3);

  const stylePresets = [
    { id: 'none', name: 'Default (No Extra Style)', desc: 'Gunakan gaya alami model' },
    { id: 'phone_snapshot', name: 'Jepretan HP (Smartphone Snapshot)', desc: 'Foto kasual bergaya kamera ponsel, pencahayaan alami, realistik sehari-hari, autentik' },
    { id: 'photorealistic', name: 'Photorealistic', desc: 'Foto riil, detail tajam, 8K resolution' },
    { id: 'cinematic', name: 'Cinematic', desc: 'Pencahayaan dramatis, film look, depth of field' },
    { id: 'abstract', name: 'Abstract Art', desc: 'Gaya artistik abstrak, warna kontras, ekspresif' },
    { id: 'minimalist', name: 'Minimalist', desc: 'Garis bersih, ruang negatif luas, simpel modern' },
    { id: 'anime', name: 'Anime / Illustration', desc: 'Ilustrasi anime Jepang hand-drawn' }
  ];

  const detailLevels = [
    { value: 1, label: 'Low', desc: 'Tanpa penambahan deskripsi detail ekstra' },
    { value: 2, label: 'Medium', desc: 'Menambahkan deskripsi fokus dan ketajaman sederhana' },
    { value: 3, label: 'High', desc: 'Menambahkan deskripsi standar kualitas tinggi dan fokus tajam' },
    { value: 4, label: 'Ultra', desc: 'Menambahkan detail istimewa dan pencahayaan profesional' },
    { value: 5, label: 'Masterpiece', desc: 'Menambahkan gaya mahakarya luar biasa dengan detail menakjubkan' }
  ];
  
  // Character Consistency face reference attachment
  const [characterFace, setCharacterFace] = useState<string | null>(null);
  const [characterFaceMime, setCharacterFaceMime] = useState<string | null>(null);
  const [isProxyLoading, setIsProxyLoading] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [autoEnhancePrompt, setAutoEnhancePrompt] = useState(true);

  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) return;
    setIsEnhancing(true);
    try {
      const response = await fetch("/api/enhance-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });
      const data = await response.json();
      if (data.success && data.enhancedPrompt) {
        setPrompt(data.enhancedPrompt);
      }
    } catch (e) {
      console.error("Failed to enhance prompt", e);
    } finally {
      setIsEnhancing(false);
    }
  };

  const presetReferenceImages = [
    {
      id: 'woman1',
      name: 'Wanita',
      thumbnail: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80',
      fullUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=512&h=512&q=90'
    },
    {
      id: 'man1',
      name: 'Pria Asia',
      thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80',
      fullUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=512&h=512&q=90'
    },
    {
      id: 'man2',
      name: 'Pria Eropa',
      thumbnail: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80',
      fullUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=512&h=512&q=90'
    }
  ];

  const handleSelectPresetImage = async (fullUrl: string) => {
    setIsProxyLoading(true);
    try {
      const response = await fetch(`/api/proxy-image?url=${encodeURIComponent(fullUrl)}`);
      const data = await response.json();
      if (data.success && data.base64) {
        setCharacterFace(data.base64);
        setCharacterFaceMime('image/jpeg');
      } else {
        console.error("Failed to proxy reference image:", data.error);
      }
    } catch (err) {
      console.error("Error proxying reference image:", err);
    } finally {
      setIsProxyLoading(false);
    }
  };

  // Google Composite State
  const [compositeFaceQuery, setCompositeFaceQuery] = useState('Asian woman smiling portrait');
  const [compositeClothesQuery, setCompositeClothesQuery] = useState('elegant batik shirt');
  const [compositeBgQuery, setCompositeBgQuery] = useState('aesthetic cafe sunset background');

  const [compositeFaceResults, setCompositeFaceResults] = useState<any[]>([]);
  const [compositeClothesResults, setCompositeClothesResults] = useState<any[]>([]);
  const [compositeBgResults, setCompositeBgResults] = useState<any[]>([]);

  const [selectedFaceUrl, setSelectedFaceUrl] = useState('');
  const [selectedClothesUrl, setSelectedClothesUrl] = useState('');
  const [selectedBgUrl, setSelectedBgUrl] = useState('');

  const [isSearchingFace, setIsSearchingFace] = useState(false);
  const [isSearchingClothes, setIsSearchingClothes] = useState(false);
  const [isSearchingBg, setIsSearchingBg] = useState(false);

  const searchComponent = async (type: 'face' | 'clothes' | 'bg', query: string) => {
    if (type === 'face') setIsSearchingFace(true);
    if (type === 'clothes') setIsSearchingClothes(true);
    if (type === 'bg') setIsSearchingBg(true);

    try {
      const response = await fetch(`/api/search-unsplash?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      if (data.success && data.results) {
        if (type === 'face') {
          setCompositeFaceResults(data.results);
          if (data.results.length > 0) setSelectedFaceUrl(data.results[0].fullUrl);
        } else if (type === 'clothes') {
          setCompositeClothesResults(data.results);
          if (data.results.length > 0) setSelectedClothesUrl(data.results[0].fullUrl);
        } else if (type === 'bg') {
          setCompositeBgResults(data.results);
          if (data.results.length > 0) setSelectedBgUrl(data.results[0].fullUrl);
        }
      }
    } catch (e) {
      console.error(`Search ${type} error:`, e);
    } finally {
      if (type === 'face') setIsSearchingFace(false);
      if (type === 'clothes') setIsSearchingClothes(false);
      if (type === 'bg') setIsSearchingBg(false);
    }
  };

  const triggerAllCompositeSearches = () => {
    searchComponent('face', compositeFaceQuery);
    searchComponent('clothes', compositeClothesQuery);
    searchComponent('bg', compositeBgQuery);
  };

  const [recentPrompts, setRecentPrompts] = useState<RecentPrompt[]>(() => {
    try {
      const saved = localStorage.getItem('navix_recent_image_prompts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>(() => {
    try {
      const saved = localStorage.getItem('navix_generated_images_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('navix_recent_image_prompts', JSON.stringify(recentPrompts));
    } catch (err) {
      console.warn("Failed to save recent prompts to localStorage", err);
    }
  }, [recentPrompts]);

  useEffect(() => {
    const handleUpdate = () => {
      try {
        const saved = localStorage.getItem('navix_generated_images_history');
        if (saved) {
          setGeneratedImages(JSON.parse(saved));
        }
      } catch (err) {
        console.warn("Failed to load generated images history", err);
      }
    };

    window.addEventListener('navix_image_history_updated', handleUpdate);
    return () => {
      window.removeEventListener('navix_image_history_updated', handleUpdate);
    };
  }, []);

  useEffect(() => {
    if (selectedPreset === 'google_composite' && compositeFaceResults.length === 0) {
      triggerAllCompositeSearches();
    }
  }, [selectedPreset]);

  const presets = [
    {
      id: 'standard',
      name: 'Standard 2K Gen',
      description: 'Ubah teks menjadi gambar resolusi tinggi dengan watermark SynthID.',
      icon: ImageIcon,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10 border-blue-500/20',
      promptPrefix: 'Buat gambar baru dari awal beresolusi tinggi dengan detail sinematik dan SynthID: '
    },
    {
      id: 'gemini_me',
      name: 'Gemini Me',
      description: 'Buat foto selfie kustom dengan mempertahankan konsistensi wajah di latar belakang ekstrem.',
      icon: Smile,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10 border-yellow-500/20',
      promptPrefix: 'Lakukan penyuntingan foto wajah subjek secara mulus dan tempatkan ke dalam pemandangan: '
    },
    {
      id: 'figurine',
      name: 'Figurine Styling',
      description: 'Ubah foto subjek atau render karakter menjadi bentuk figurin / mainan miniatur imut.',
      icon: Camera,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10 border-purple-500/20',
      promptPrefix: 'Ubah subjek menjadi gaya figurin 3D miniatur imut berkualitas tinggi: '
    },
    {
      id: 'aesthetic',
      name: 'Aesthetic Makeover',
      description: 'Gaya retro studio mal, preppy era 80-an, atau grunge era 90-an.',
      icon: Palette,
      color: 'text-pink-400',
      bgColor: 'bg-pink-500/10 border-pink-500/20',
      promptPrefix: 'Berikan makeover gaya retro studio 80s/90s yang berestetika tinggi pada gambar: '
    },
    {
      id: 'hairstyle',
      name: 'Infinite Hairstyles',
      description: 'Eksperimen ganti gaya rambut tanpa batas pada sebuah foto wajah.',
      icon: Scissors,
      color: 'text-teal-400',
      bgColor: 'bg-teal-500/10 border-teal-500/20',
      promptPrefix: 'Ganti gaya rambut subjek secara presisi dan realistis menjadi: '
    },
    {
      id: 'camera_scan',
      name: 'Mesin Scan Kamera',
      description: 'Menyempurnakan gambar agar terlihat 100% nyata (Hyper-Realistic) seperti hasil jepretan kamera.',
      icon: Camera,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10 border-green-500/20',
      promptPrefix: 'Gunakan referensi gambar asli dan edit/sempurnakan detail pencahayaan, tekstur kulit, ketajaman, dan resolusi agar menjadi foto dunia nyata (RAW camera photo, natural skin texture, DSLR, ultra-photorealistic) tanpa mengubah identitas/pose aslinya: '
    },
    {
      id: 'blend',
      name: 'Photo Combination',
      description: 'Campur (blending) beberapa gambar terpisah menjadi satu scene baru secara mulus.',
      icon: Layers,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10 border-red-500/20',
      promptPrefix: 'Gabungkan beberapa elemen gambar secara mulus dan harmonis dengan tema: '
    },
    {
      id: 'google_composite',
      name: 'Google Composite',
      description: 'Padukan Wajah + Baju + Latar Belakang Google/Unsplash tanpa merubah wajah.',
      icon: Layers,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10 border-emerald-500/20',
      promptPrefix: '[GOOGLE_COMPOSITE]'
    },
    {
      id: 'local_dream',
      name: 'Local Dream (On-Device)',
      description: 'Generasi gambar lokal on-device tanpa kuota internet dengan Snapdragon NPU / GPU Android.',
      icon: Sparkles,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10 border-cyan-500/20',
      promptPrefix: 'Gunakan Local Dream on-device engine untuk membuat gambar: '
    }
  ];

  const aspectRatios = [
    { value: '1:1', label: '1:1 (Square)', desc: 'Ideal untuk avatar/profil' },
    { value: '16:9', label: '16:9 (Landscape)', desc: 'Hero banner/layar lebar' },
    { value: '9:16', label: '9:16 (Portrait)', desc: 'Mobile/story' },
    { value: '4:3', label: '4:3 (Classic)', desc: 'Card thumbnail' },
    { value: '3:4', label: '3:4 (Tall)', desc: 'Photo portrait' }
  ];

  const handleCharacterFaceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setCharacterFace(result);
        setCharacterFaceMime(file.type);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    const trimmedPrompt = prompt.trim();
    if (selectedPreset !== 'google_composite' && !trimmedPrompt) return;
    if (isLoading) return;
    
    const activePreset = presets.find(p => p.id === selectedPreset);
    const prefix = activePreset ? activePreset.promptPrefix : '';

    const styleDescriptors: Record<string, string> = {
      none: '',
      phone_snapshot: ', raw candid smartphone photo, iPhone snapshot, natural skin texture, visible micro-pores, natural everyday lighting, hand-held camera angle, authentic real person snapshot',
      photorealistic: ', raw photograph, natural skin texture, visible micro-pores, 35mm lens, sharp focus, natural textures, unretouched real photo',
      cinematic: ', cinematic lighting, dramatic atmosphere, depth of field, 35mm photograph, movie scene framing',
      abstract: ', abstract art style, vibrant color palette, non-representational, modern artistic expression, high contrast',
      minimalist: ', minimalist style, clean lines, simple elements, generous negative space, elegant',
      anime: ', anime digital illustration, hand-drawn art style, cell shaded, vibrant colors'
    };

    const detailDescriptors: Record<number, string> = {
      1: ', simple composition',
      2: ', clear details, sharp focus',
      3: ', highly detailed, sharp focus, rich natural textures',
      4: ', exquisite details, natural lighting, razor sharp focus, detailed skin micro-textures',
      5: ', masterwork photo, intricate natural details, balanced composition, spectacular directional lighting, authentic real-world textures'
    };

    const styleSuffix = styleDescriptors[stylePreset] || '';
    const detailSuffix = detailDescriptors[detailIntensity] || '';
    
    let processedPrompt = trimmedPrompt;
    if (autoEnhancePrompt && trimmedPrompt && selectedPreset !== 'google_composite') {
      try {
        const response = await fetch("/api/enhance-prompt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: trimmedPrompt })
        });
        const data = await response.json();
        if (data.success && data.enhancedPrompt) {
          processedPrompt = data.enhancedPrompt;
        }
      } catch (e) {
        console.warn("Auto enhance prompt fallback:", e);
      }
    }

    let fullMessage = '';
    const attachmentsToSend: any[] = [];

    if (selectedPreset === 'google_composite') {
      if (!selectedFaceUrl || !selectedClothesUrl || !selectedBgUrl) {
        alert("Harap cari dan pilih ketiga komponen (Wajah, Pakaian, Latar) terlebih dahulu.");
        return;
      }
      fullMessage = `[GOOGLE_COMPOSITE]\nFace: ${selectedFaceUrl}\nClothes: ${selectedClothesUrl}\nBackground: ${selectedBgUrl}\nPrompt: ${trimmedPrompt || 'posing elegantly, looking at camera'}`;
    } else {
      fullMessage = `${prefix}${processedPrompt}${styleSuffix}${detailSuffix} (Rasio Aspek: ${aspectRatio})`;
      if (characterFace) {
        // Pass raw base64 string
        const rawBase64 = characterFace.replace(/^data:image\/[a-z]+;base64,/, '');
        attachmentsToSend.push({
          type: 'image',
          mimeType: characterFaceMime || 'image/jpeg',
          data: rawBase64
        });
        fullMessage = `[KONSISTENSI KARAKTER AKTIF]\n${fullMessage}`;
      }
    }

    onSendMessage(fullMessage, attachmentsToSend);
    
    // Save to recent prompts
    const newPromptItem: RecentPrompt = {
      id: Math.random().toString(36).substring(2, 11),
      text: trimmedPrompt || 'Google Element Composite',
      preset: selectedPreset,
      aspectRatio: aspectRatio,
      stylePreset: stylePreset,
      detailIntensity: detailIntensity,
      timestamp: Date.now()
    };

    setRecentPrompts(prev => {
      // Filter out duplicate text prompts with the same preset and aspect ratio
      const filtered = prev.filter(p => !(p.text.toLowerCase() === trimmedPrompt.toLowerCase() && p.preset === selectedPreset && p.aspectRatio === aspectRatio));
      return [newPromptItem, ...filtered].slice(0, 10);
    });

    // Reset prompt
    setPrompt('');
  };

  const currentPresetObj = presets.find(p => p.id === selectedPreset);

  return (
    <>
    <motion.div 
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      className="w-full md:w-[380px] h-full bg-[#121212] border-l border-neutral-800 flex flex-col shrink-0 z-30 overflow-hidden"
    >
      {/* Header */}
      <div className="h-14 border-b border-neutral-800 px-4 flex items-center justify-between bg-neutral-900/40 shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="text-cyan-400" size={18} />
          <div>
            <h2 className="text-sm font-bold text-neutral-100 font-sans flex items-center gap-1.5">
              Navix AI Vision Studio
            </h2>
            <p className="text-[10px] text-neutral-500 font-mono tracking-wider uppercase">Neural Vision & Image Engine</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setShowInfo(!showInfo)}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
            title="Info Fitur"
          >
            <Info size={16} />
          </button>
          <button 
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Main Content scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar pb-24">
        
        {/* Info panel */}
        {showInfo && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-neutral-900/90 border border-neutral-800 p-3.5 rounded-xl text-xs text-neutral-300 space-y-2.5 leading-relaxed"
          >
            <div className="flex items-center gap-2 font-bold text-neutral-100 border-b border-neutral-800 pb-1.5">
              <Sparkles className="text-cyan-400" size={14} />
              <span>Teknologi Navix AI Neural Vision</span>
            </div>
            <p>
              <strong>Pemahaman Spasial:</strong> Model ini mengerti fisika dunia nyata (bayangan, pencahayaan, perspektif) sehingga interaksi objek terlihat sangat nyata.
            </p>
            <p>
              <strong>SynthID Watermark:</strong> Setiap hasil gambar disematkan watermark digital tak kasat mata yang aman dan transparan sebagai penanda AI.
            </p>
            <p>
              <strong>Personal Intelligence:</strong> Menghasilkan teks tulisan di dalam gambar dengan ejaan yang akurat dalam berbagai bahasa.
            </p>
          </motion.div>
        )}

        {/* Prompt Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider block">
              Deskripsi Gambar (Prompt)
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAutoEnhancePrompt(!autoEnhancePrompt)}
                className={`text-[9px] px-2 py-0.5 rounded-full font-mono transition-all border ${
                  autoEnhancePrompt 
                    ? 'bg-purple-950/60 text-purple-300 border-purple-500/40' 
                    : 'bg-neutral-900 text-neutral-500 border-neutral-800 hover:text-neutral-300'
                }`}
                title="Aktifkan untuk secara otomatis mendetailkan prompt sebelum dikirim ke engine"
              >
                Auto-Enhance: {autoEnhancePrompt ? 'ON' : 'OFF'}
              </button>
              <button
                onClick={handleEnhancePrompt}
                disabled={isEnhancing || !prompt.trim()}
                className="text-[9px] flex items-center gap-1 font-mono font-bold uppercase tracking-wider text-purple-400 hover:text-purple-300 disabled:opacity-50 transition-colors"
                title="Secara otomatis mendetailkan deskripsi menjadi perintah yang kompleks, akurat, dan fotorealistik sekarang"
              >
                {isEnhancing ? (
                  <div className="w-3 h-3 border border-purple-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Wand2 size={10} />
                )}
                Smart Prompt Enhancer
              </button>
            </div>
          </div>
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={
                selectedPreset === 'standard' 
                  ? "Deskripsikan karya visual beresolusi tinggi yang ingin dibuat..." 
                  : `Berikan deskripsi tambahan untuk fitur ${currentPresetObj?.name || ''}...`
              }
              rows={4}
              className="w-full bg-[#1c1c1c] text-neutral-100 placeholder:text-neutral-600 border border-neutral-800 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 rounded-xl p-3 text-sm resize-none outline-none transition-all"
            />
            {prompt.length > 0 && (
              <span className="absolute bottom-2.5 right-3 text-[9px] font-mono text-neutral-600">
                {prompt.length} chars
              </span>
            )}
          </div>
        </div>

        {/* Local Dream Real-Time Android Hardware Status (NNAPI/NPU/GPU/CPU) */}
        {selectedPreset === 'local_dream' && (
          <div className="space-y-2 border-t border-cyan-500/20 pt-3">
            <HardwareStatus id="panel-local-dream-hw-status" />
          </div>
        )}

        {/* Character Consistency Upload (Point 2) */}
        {selectedPreset !== 'google_composite' && (
          <div className="space-y-2 border-t border-neutral-800/60 pt-4">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider block">
                Konsistensi Karakter (Penahan Wajah)
              </label>
              <span className="text-[9px] font-mono font-bold text-red-500 bg-red-500/5 px-1.5 py-0.5 rounded border border-red-500/10">
                NEW
              </span>
            </div>
            
            <div className="bg-[#161616] border border-neutral-800 rounded-xl p-3 flex items-center gap-3">
              <div className="relative shrink-0 w-12 h-12 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center overflow-hidden group">
                {characterFace ? (
                  <>
                    <img src={characterFace} alt="Face Reference" className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => { setCharacterFace(null); setCharacterFaceMime(null); }}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-red-500 transition-opacity"
                      title="Hapus acuan"
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                ) : (
                  <Camera size={18} className="text-neutral-600" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-neutral-300">Foto Acuan Wajah</p>
                <p className="text-[9px] text-neutral-500 mt-0.5 leading-normal">
                  Kunci struktur wajah asli Anda ke background baru secara realistis.
                </p>
              </div>
              
              <div>
                <label className="cursor-pointer bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 text-[10px] font-semibold py-1.5 px-2.5 rounded-lg transition-colors block text-center">
                  Pilih Foto
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleCharacterFaceUpload} 
                  />
                </label>
              </div>
            </div>

            {/* Preset templates */}
            <div className="bg-[#161616]/40 border border-neutral-800/60 rounded-xl p-2.5 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-neutral-400 font-medium">Atau klik salah satu dari 3 model foto Google ini:</p>
                {isProxyLoading && (
                  <div className="w-3.5 h-3.5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                )}
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {presetReferenceImages.map((img) => (
                  <button
                    key={img.id}
                    type="button"
                    disabled={isProxyLoading}
                    onClick={() => handleSelectPresetImage(img.fullUrl)}
                    className="flex items-center gap-1.5 bg-[#1c1c1c] hover:bg-neutral-800/80 disabled:opacity-50 border border-neutral-800/80 px-2 py-1 rounded-lg transition-colors cursor-pointer text-left shrink-0"
                    title={`Gunakan wajah ${img.name}`}
                  >
                    <img src={img.thumbnail} alt={img.name} className="w-5 h-5 rounded-full object-cover border border-neutral-700" referrerPolicy="no-referrer" />
                    <span className="text-[9px] font-medium text-neutral-300 whitespace-nowrap">{img.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Google Composite Selection Block */}
        {selectedPreset === 'google_composite' && (
          <div className="space-y-4 border-t border-neutral-800/60 pt-4">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider block">
                Google Composite (Fusi 3 Foto)
              </label>
              <span className="text-[9px] font-mono font-bold text-emerald-500 bg-emerald-500/5 px-1.5 py-0.5 rounded border border-emerald-500/10">
                ADVANCED AI
              </span>
            </div>

            <p className="text-[10px] text-neutral-500 leading-normal bg-[#161616]/60 border border-neutral-800/40 p-2.5 rounded-xl">
              Cari & tentukan 3 foto acuan dari Google (Wajah, Baju, Background). AI akan menggabungkannya secara sempurna di balik layar.
            </p>

            {/* Component 1: Face */}
            <div className="space-y-1.5 bg-[#161616] border border-neutral-800 rounded-xl p-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-neutral-300">1. Wajah Model / Manusia</span>
                {isSearchingFace && <div className="w-3 h-3 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />}
              </div>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={compositeFaceQuery}
                  onChange={(e) => setCompositeFaceQuery(e.target.value)}
                  placeholder="Contoh: Asian woman smiling portrait..."
                  className="flex-1 bg-neutral-900 border border-neutral-800 focus:border-emerald-500/40 rounded-lg px-2.5 py-1.5 text-xs outline-none text-neutral-200 placeholder:text-neutral-600"
                />
                <button
                  type="button"
                  onClick={() => searchComponent('face', compositeFaceQuery)}
                  className="bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 p-2 rounded-lg cursor-pointer transition-colors"
                  title="Cari wajah"
                >
                  <Search size={12} className="text-neutral-300" />
                </button>
              </div>
              
              {/* Results horizontal scroll */}
              {compositeFaceResults.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pt-2 pb-1 no-scrollbar">
                  {compositeFaceResults.map((img) => (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => setSelectedFaceUrl(img.fullUrl)}
                      className={`relative shrink-0 w-12 h-12 rounded-lg overflow-hidden border cursor-pointer transition-all ${
                        selectedFaceUrl === img.fullUrl 
                          ? 'border-emerald-500 ring-2 ring-emerald-500/20 scale-95' 
                          : 'border-neutral-800 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img.thumbnail} alt="Face search" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Component 2: Clothes */}
            <div className="space-y-1.5 bg-[#161616] border border-neutral-800 rounded-xl p-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-neutral-300">2. Model Pakaian / Baju</span>
                {isSearchingClothes && <div className="w-3 h-3 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />}
              </div>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={compositeClothesQuery}
                  onChange={(e) => setCompositeClothesQuery(e.target.value)}
                  placeholder="Contoh: luxury traditional batik shirt..."
                  className="flex-1 bg-neutral-900 border border-neutral-800 focus:border-emerald-500/40 rounded-lg px-2.5 py-1.5 text-xs outline-none text-neutral-200 placeholder:text-neutral-600"
                />
                <button
                  type="button"
                  onClick={() => searchComponent('clothes', compositeClothesQuery)}
                  className="bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 p-2 rounded-lg cursor-pointer transition-colors"
                  title="Cari pakaian"
                >
                  <Search size={12} className="text-neutral-300" />
                </button>
              </div>
              
              {/* Results horizontal scroll */}
              {compositeClothesResults.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pt-2 pb-1 no-scrollbar">
                  {compositeClothesResults.map((img) => (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => setSelectedClothesUrl(img.fullUrl)}
                      className={`relative shrink-0 w-12 h-12 rounded-lg overflow-hidden border cursor-pointer transition-all ${
                        selectedClothesUrl === img.fullUrl 
                          ? 'border-emerald-500 ring-2 ring-emerald-500/20 scale-95' 
                          : 'border-neutral-800 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img.thumbnail} alt="Clothes search" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Component 3: Background */}
            <div className="space-y-1.5 bg-[#161616] border border-neutral-800 rounded-xl p-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-neutral-300">3. Latar Belakang / Scene</span>
                {isSearchingBg && <div className="w-3 h-3 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />}
              </div>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={compositeBgQuery}
                  onChange={(e) => setCompositeBgQuery(e.target.value)}
                  placeholder="Contoh: beautiful library background..."
                  className="flex-1 bg-neutral-900 border border-neutral-800 focus:border-emerald-500/40 rounded-lg px-2.5 py-1.5 text-xs outline-none text-neutral-200 placeholder:text-neutral-600"
                />
                <button
                  type="button"
                  onClick={() => searchComponent('bg', compositeBgQuery)}
                  className="bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 p-2 rounded-lg cursor-pointer transition-colors"
                  title="Cari latar belakang"
                >
                  <Search size={12} className="text-neutral-300" />
                </button>
              </div>
              
              {/* Results horizontal scroll */}
              {compositeBgResults.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pt-2 pb-1 no-scrollbar">
                  {compositeBgResults.map((img) => (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => setSelectedBgUrl(img.fullUrl)}
                      className={`relative shrink-0 w-12 h-12 rounded-lg overflow-hidden border cursor-pointer transition-all ${
                        selectedBgUrl === img.fullUrl 
                          ? 'border-emerald-500 ring-2 ring-emerald-500/20 scale-95' 
                          : 'border-neutral-800 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img.thumbnail} alt="Background search" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={triggerAllCompositeSearches}
                disabled={isSearchingFace || isSearchingClothes || isSearchingBg}
                className="w-full bg-[#1c1c1c] hover:bg-neutral-800 border border-neutral-800/80 py-2 rounded-xl text-[10px] font-bold text-neutral-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Search size={12} />
                Cari & Ambil Ulang Semua Komponen
              </button>
            </div>
          </div>
        )}

        {/* Preset Selector */}
        <div className="space-y-2">
          <label className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider block">
            Pilih Fitur / Preset
          </label>
          <div className="grid grid-cols-1 gap-2">
            {presets.map((preset) => {
              const IconComp = preset.icon;
              const isSelected = selectedPreset === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => setSelectedPreset(preset.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all duration-200 cursor-pointer flex gap-3 ${
                    isSelected 
                      ? 'bg-[#1c1c1c] border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.05)]' 
                      : 'bg-[#161616]/50 border-neutral-800 hover:border-neutral-700 hover:bg-[#161616]'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${preset.bgColor} shrink-0 flex items-center justify-center h-9 w-9`}>
                    <IconComp size={18} className={preset.color} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-neutral-200">{preset.name}</span>
                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      )}
                    </div>
                    <p className="text-[10px] text-neutral-500 mt-0.5 line-clamp-2 leading-normal">
                      {preset.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Style Preset & Detail Intensity (Customization) */}
        <div className="space-y-4 border-t border-neutral-800/60 pt-4">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider block">
              Gaya & Kualitas Detil
            </label>
            <span className="text-[9px] font-mono font-bold text-red-500 bg-red-500/5 px-1.5 py-0.5 rounded border border-red-500/10">
              ENHANCED
            </span>
          </div>

          {/* Style Preset Dropdown */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
              <Palette size={12} className="text-red-400" />
              <span>Gaya Gambar (Style Preset)</span>
            </div>
            <div className="relative">
              <select
                value={stylePreset}
                onChange={(e) => setStylePreset(e.target.value)}
                className="w-full bg-[#161616] text-neutral-200 border border-neutral-800 focus:border-red-500/50 rounded-xl p-2.5 text-xs outline-none transition-all cursor-pointer appearance-none"
              >
                {stylePresets.map((sp) => (
                  <option key={sp.id} value={sp.id} className="bg-[#121212] text-neutral-200">
                    {sp.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-neutral-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
            <p className="text-[9px] text-neutral-500 italic">
              * {stylePresets.find(sp => sp.id === stylePreset)?.desc}
            </p>
          </div>

          {/* Detail Intensity Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] text-neutral-400">
              <div className="flex items-center gap-1.5">
                <Sparkles size={12} className="text-yellow-400" />
                <span>Intensitas Detail (Detail Intensity)</span>
              </div>
              <span className="font-mono font-bold text-neutral-200 bg-neutral-800 px-1.5 py-0.5 rounded text-[10px]">
                {detailLevels.find(dl => dl.value === detailIntensity)?.label}
              </span>
            </div>
            <div className="relative pt-1">
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={detailIntensity}
                onChange={(e) => setDetailIntensity(Number(e.target.value))}
                className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-red-500"
              />
              <div className="flex justify-between text-[9px] text-neutral-500 font-mono mt-1 px-1">
                <span>Low</span>
                <span>Med</span>
                <span>High</span>
                <span>Ultra</span>
                <span>Max</span>
              </div>
              <p className="text-[9px] text-neutral-500 italic mt-2">
                * {detailLevels.find(dl => dl.value === detailIntensity)?.desc}
              </p>
            </div>
          </div>
        </div>

        {/* Aspect Ratio */}
        <div className="space-y-2">
          <label className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider block">
            Rasio Aspek
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {aspectRatios.map((ar) => (
              <button
                key={ar.value}
                onClick={() => setAspectRatio(ar.value)}
                className={`py-2 text-center text-xs font-mono font-medium rounded-lg border cursor-pointer transition-all ${
                  aspectRatio === ar.value
                    ? 'bg-neutral-800 border-red-500/40 text-neutral-100'
                    : 'bg-[#161616]/40 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-300'
                }`}
                title={ar.desc}
              >
                {ar.value}
              </button>
            ))}
          </div>
          <p className="text-[9px] text-neutral-600 font-mono italic">
            * {aspectRatios.find(ar => ar.value === aspectRatio)?.desc}
          </p>
        </div>

        {/* Segmented Control Tabs for Gallery vs Prompts */}
        {(recentPrompts.length > 0 || generatedImages.length > 0) && (
          <div className="flex p-0.5 bg-neutral-900 rounded-xl border border-neutral-800/40 shrink-0">
            <button
              onClick={() => setActiveTab('gallery')}
              className={`flex-1 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'gallery'
                  ? 'bg-neutral-800 text-neutral-100 shadow'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <ImageIcon size={11} />
              <span>Galeri ({generatedImages.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('prompts')}
              className={`flex-1 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'prompts'
                  ? 'bg-neutral-800 text-neutral-100 shadow'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <History size={11} />
              <span>Prompt ({recentPrompts.length})</span>
            </button>
          </div>
        )}

        {/* Tab Content: Gallery */}
        {activeTab === 'gallery' && (
          <div className="space-y-3 pt-1">
            {generatedImages.length === 0 ? (
              <div className="text-center py-8 bg-[#161616]/20 border border-dashed border-neutral-800 rounded-xl p-4">
                <ImageIcon size={24} className="text-neutral-600 mx-auto mb-2 animate-pulse" />
                <p className="text-xs text-neutral-400 font-sans">Belum ada gambar yang digenerate.</p>
                <p className="text-[10px] text-neutral-600 font-mono mt-1 leading-relaxed">
                  Hasil gambar yang kamu buat di chat akan otomatis muncul di sini!
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono font-bold text-neutral-500 uppercase tracking-widest">
                    Koleksi Hasil Karya
                  </span>
                  <button
                    onClick={() => {
                      setGeneratedImages([]);
                      localStorage.removeItem('navix_generated_images_history');
                    }}
                    className="text-[9px] font-mono text-neutral-500 hover:text-red-400 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Trash2 size={10} />
                    <span>Hapus Galeri</span>
                  </button>
                </div>
                
                <div className="grid grid-cols-3 gap-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                  {generatedImages.map((img) => (
                    <div
                      key={img.id}
                      onClick={() => setLightboxImage(img)}
                      className="group aspect-square rounded-lg bg-[#111] border border-neutral-800/80 hover:border-neutral-700/80 transition-all overflow-hidden relative cursor-pointer"
                    >
                      <img
                        src={img.url}
                        alt={img.prompt}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                      />
                      {/* Hover action overlay */}
                      <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 z-10">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPrompt(img.prompt);
                          }}
                          className="p-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded transition"
                          title="Gunakan Prompt"
                        >
                          <Wand2 size={10} />
                        </button>
                        <a
                          href={img.url}
                          target="_blank"
                          rel="noreferrer noopener"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded transition"
                          title="Buka Penuh"
                        >
                          <ExternalLink size={10} />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab Content: Prompt History */}
        {activeTab === 'prompts' && (
          <div className="space-y-3 pt-1">
            {recentPrompts.length === 0 ? (
              <div className="text-center py-8 bg-[#161616]/20 border border-dashed border-neutral-800 rounded-xl p-4">
                <History size={24} className="text-neutral-600 mx-auto mb-2" />
                <p className="text-xs text-neutral-400 font-sans">Belum ada riwayat pencarian prompt.</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono font-bold text-neutral-500 uppercase tracking-widest">
                    Riwayat Pencarian
                  </span>
                  <button
                    onClick={() => setRecentPrompts([])}
                    className="text-[9px] font-mono text-neutral-500 hover:text-red-400 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Trash2 size={10} />
                    <span>Hapus Semua</span>
                  </button>
                </div>
                
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                  {recentPrompts.map((rp) => {
                    const presetObj = presets.find(p => p.id === rp.preset);
                    const IconComponent = presetObj?.icon || ImageIcon;
                    
                    return (
                      <div
                        key={rp.id}
                        className="group relative bg-[#161616]/40 border border-neutral-800/80 rounded-xl p-2.5 hover:border-neutral-700/80 hover:bg-[#1c1c1c]/40 transition-all text-left flex items-start gap-2.5"
                      >
                        <button
                          onClick={() => {
                            setPrompt(rp.text);
                            setSelectedPreset(rp.preset);
                            setAspectRatio(rp.aspectRatio);
                            if (rp.stylePreset) setStylePreset(rp.stylePreset);
                            if (rp.detailIntensity) setDetailIntensity(rp.detailIntensity);
                          }}
                          className="flex-1 text-left cursor-pointer min-w-0"
                        >
                          <p className="text-xs text-neutral-300 font-sans line-clamp-2 leading-relaxed break-all">
                            {rp.text}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                            <span className={`inline-flex items-center gap-1 text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-[#111] border border-neutral-800/50 ${presetObj?.color || 'text-neutral-400'}`}>
                              <IconComponent size={9} />
                              {presetObj?.name || 'Custom'}
                            </span>
                            <span className="text-[9px] font-mono text-neutral-500 bg-[#111] px-1.5 py-0.5 rounded border border-neutral-800/30">
                              Rasio: {rp.aspectRatio}
                            </span>
                            {rp.stylePreset && rp.stylePreset !== 'none' && (
                              <span className="text-[9px] font-mono text-purple-400 bg-[#111] px-1.5 py-0.5 rounded border border-neutral-800/30">
                                Style: {rp.stylePreset}
                              </span>
                            )}
                            {rp.detailIntensity && rp.detailIntensity !== 1 && (
                              <span className="text-[9px] font-mono text-yellow-400 bg-[#111] px-1.5 py-0.5 rounded border border-neutral-800/30">
                                Detail: {rp.detailIntensity}/5
                              </span>
                            )}
                          </div>
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setRecentPrompts(prev => prev.filter(p => p.id !== rp.id));
                          }}
                          className="text-neutral-600 hover:text-red-400 p-1 rounded hover:bg-neutral-800/30 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shrink-0 self-center"
                          title="Hapus"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}


      </div>

      {/* Sticky Bottom Generate Button */}
      <div className="p-4 border-t border-neutral-800 bg-[#121212] bg-gradient-to-t from-[#121212] via-[#121212]/95 to-transparent shrink-0">
        <button
          onClick={handleGenerate}
          disabled={!prompt.trim() || isLoading}
          className="w-full h-11 rounded-xl bg-neutral-100 text-neutral-950 font-bold hover:bg-neutral-200 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
              <span>Memproses...</span>
            </>
          ) : (
            <>
              <Sparkles size={16} />
              <span>Aktifkan Mesin Gambar</span>
            </>
          )}
        </button>
        <p className="text-center text-[9px] text-neutral-600 font-mono mt-2 uppercase tracking-wider">
          ⚡ Powered by Navix AI Neural Engine & SynthID
        </p>
      </div>
    </motion.div>

    <AnimatePresence>
      {lightboxImage && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 bg-black/95 backdrop-blur-md z-[100] flex flex-col items-center justify-center p-4"
        >
          {/* Top buttons overlay */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <a 
              href={lightboxImage.url} 
              target="_blank" 
              rel="noreferrer noopener" 
              onClick={(e) => e.stopPropagation()}
              className="p-2.5 bg-neutral-900/80 hover:bg-neutral-800/80 text-neutral-100 rounded-xl transition border border-neutral-800/60"
              title="Buka Tab Baru"
            >
              <ExternalLink size={18} />
            </a>
            <button 
              onClick={() => setLightboxImage(null)}
              className="p-2.5 bg-neutral-900/80 hover:bg-neutral-800/80 text-neutral-100 rounded-xl transition border border-neutral-800/60 cursor-pointer"
              title="Tutup"
            >
              <X size={18} />
            </button>
          </div>
          
          {/* Dialog Container */}
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="max-w-md w-full bg-neutral-950 border border-neutral-900 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
          >
            <div className="relative bg-[#080808] flex items-center justify-center min-h-[260px] max-h-[60vh]">
              <img 
                src={lightboxImage.url} 
                alt={lightboxImage.prompt} 
                referrerPolicy="no-referrer"
                className="max-w-full max-h-[60vh] object-contain"
              />
            </div>
            <div className="p-4 bg-neutral-900/60 border-t border-neutral-800 space-y-3.5">
              <div className="space-y-1">
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-red-500">Prompt</span>
                <p className="text-xs text-neutral-200 font-sans leading-relaxed break-words">{lightboxImage.prompt}</p>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => {
                    setPrompt(lightboxImage.prompt);
                    setLightboxImage(null);
                  }}
                  className="flex-1 py-2 rounded-lg bg-neutral-100 text-neutral-950 text-xs font-bold hover:bg-neutral-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Wand2 size={12} />
                  <span>Pakai Prompt Ini</span>
                </button>
                <button
                  onClick={() => {
                    setGeneratedImages(prev => {
                      const upd = prev.filter(p => p.id !== lightboxImage.id);
                      localStorage.setItem('navix_generated_images_history', JSON.stringify(upd));
                      return upd;
                    });
                    setLightboxImage(null);
                  }}
                  className="py-2 px-3 rounded-lg bg-neutral-900 hover:bg-red-950 hover:text-red-400 text-neutral-400 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 border border-neutral-800 cursor-pointer"
                  title="Hapus"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}
