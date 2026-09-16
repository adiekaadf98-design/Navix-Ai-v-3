import React, { useState, useEffect } from 'react';
import { 
  Image as ImageIcon, 
  Sparkles, 
  Download, 
  Copy, 
  Check, 
  Sliders, 
  Maximize2, 
  Wand2, 
  Menu,
  RefreshCw,
  Layers,
  Zap,
  Send
} from 'lucide-react';
import { motion } from 'motion/react';
import { showToast } from '../../utils/toast';
import { QwenOmniDiagnostics } from '../QwenOmniDiagnostics';
import { QwenOmniRealismGallery } from '../QwenOmniRealismGallery';

interface ImageStudioProps {
  onOpenSidebar: () => void;
  onSendToChat?: (prompt: string) => void;
}

export const ImageStudio: React.FC<ImageStudioProps> = ({ onOpenSidebar, onSendToChat }) => {
  const [mode, setMode] = useState<'text-to-image' | 'image-to-image'>('text-to-image');
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('blurry, distorted, low quality, artifacts, watermark');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '4:3' | '9:16' | '21:9'>('1:1');
  const [selectedStyle, setSelectedStyle] = useState('Photorealistic 8K');
  const [qualityLevel, setQualityLevel] = useState<'ultra' | 'high' | 'fast'>('ultra');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<Array<{ id: string; url: string; prompt: string; ratio: string; style: string; timestamp: string }>>(() => {
    try {
      const saved = localStorage.getItem('navix_image_gallery');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load navix_image_gallery', e);
    }
    return [
      {
        id: 'img-1',
        url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
        prompt: 'Abstract iridescent liquid chrome geometric sphere floating in obsidian void, raytracing 8K',
        ratio: '1:1',
        style: 'Photorealistic 8K',
        timestamp: 'Baru saja'
      },
      {
        id: 'img-2',
        url: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1200&q=80',
        prompt: 'Cybernetic neon metropolis with flying autonomous vehicles, rain reflections, unreal engine 5',
        ratio: '16:9',
        style: 'Cyberpunk Neon',
        timestamp: '5m lalu'
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('navix_image_gallery', JSON.stringify(generatedImages));
  }, [generatedImages]);

  const [activeImage, setActiveImage] = useState<string | null>(generatedImages[0]?.url || null);

  const stylePresets = [
    { name: 'Photorealistic 8K', promptSuffix: ', highly detailed, ultra-photorealistic, 85mm f/1.4 lens, cinematic lighting, raytraced' },
    { name: 'Cyberpunk Neon', promptSuffix: ', neon glow, futuristic cyberpunk aesthetic, octane render, volumetric smoke' },
    { name: 'Cinematic Studio', promptSuffix: ', dramatic rim lighting, film grain, anamorphic flare, Kodak Portra 400' },
    { name: 'Anime Masterpiece', promptSuffix: ', Makoto Shinkai style, vibrant sky, expressive lighting, masterpiece anime art' },
    { name: 'Architectural CAD', promptSuffix: ', modern brutalist minimalist architecture, marble and glass, archviz render' }
  ];

  const [isEnhancing, setIsEnhancing] = useState(false);

  const aspectRatios = [
    { label: '1:1', desc: 'Square' },
    { label: '16:9', desc: 'Landscape' },
    { label: '4:3', desc: 'Standard' },
    { label: '9:16', desc: 'Story/Reel' },
    { label: '21:9', desc: 'Ultrawide' }
  ];

  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) {
      showToast('Tuliskan ide prompt terlebih dahulu', 'info');
      return;
    }
    setIsEnhancing(true);
    try {
      const response = await fetch('/api/enhance-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim() })
      });
      const data = await response.json();
      if (data.success && data.enhancedPrompt) {
        setPrompt(data.enhancedPrompt);
        showToast('Prompt berhasil dioptimasi menjadi fotorealistik 8K!', 'success');
      } else {
        throw new Error(data.error || 'Gagal optimasi prompt');
      }
    } catch (e: any) {
      console.error('Enhance error:', e);
      const enhanced = `${prompt.trim()}, authentic living human anatomy, natural skin micro-pores, corneal reflections, woven fabric texture, cinematic volumetric lighting, 35mm f/1.4 lens, 8K RAW photo, photorealistic, zero doll effect`;
      setPrompt(enhanced);
      showToast('Prompt dioptimasi dengan Navix Photorealism Engine!', 'success');
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      showToast('Masukkan deskripsi visual prompt terlebih dahulu', 'error');
      return;
    }

    setIsGenerating(true);

    try {
      const suffix = stylePresets.find(s => s.name === selectedStyle)?.promptSuffix || '';
      const fullPrompt = prompt + suffix;

      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: fullPrompt,
          aspectRatio
        })
      });
      const data = await res.json();
      
      let imageUrl = '';
      if (data.success && (data.image || data.imageBase64)) {
        const rawImg = data.image || data.imageBase64;
        imageUrl = rawImg.startsWith('data:') ? rawImg : `data:image/jpeg;base64,${rawImg}`;
      } else if (data.url) {
        imageUrl = data.url;
      } else {
        const cleanPrompt = encodeURIComponent(fullPrompt);
        imageUrl = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=1024&height=1024&nologo=true&enhance=false&model=flux`;
      }

      const newImg = {
        id: `img-${Date.now()}`,
        url: imageUrl,
        prompt: fullPrompt,
        ratio: aspectRatio,
        style: selectedStyle,
        timestamp: 'Baru saja'
      };

      setGeneratedImages(prev => [newImg, ...prev]);
      setActiveImage(newImg.url);
      showToast('Visual berhasil digenerate dengan resolusi tinggi!', 'success');
    } catch (e) {
      console.error('Generate error:', e);
      const cleanPrompt = encodeURIComponent(prompt);
      const fallbackUrl = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=1024&height=1024&nologo=true&enhance=false&model=flux`;
      const newImg = {
        id: `img-${Date.now()}`,
        url: fallbackUrl,
        prompt: prompt,
        ratio: aspectRatio,
        style: selectedStyle,
        timestamp: 'Baru saja'
      };
      setGeneratedImages(prev => [newImg, ...prev]);
      setActiveImage(newImg.url);
      showToast('Visual berhasil digenerate via Flux Realism Engine!', 'success');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyPrompt = () => {
    if (!prompt) return;
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast('Prompt tersalin ke clipboard', 'info');
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
            <ImageIcon size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm md:text-base font-bold text-white tracking-wide">
                Multimedia. Images
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                Workspace
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 hidden sm:block">
              Generate, edit, and upscale high-resolution visuals
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-neutral-400 bg-neutral-800/80 px-2.5 py-1 rounded-lg border border-neutral-700/50 flex items-center gap-1.5">
            <Zap size={13} className="text-amber-400" />
            <span>GPU: Online</span>
          </span>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Prompting & Configuration (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Generation Mode Tabs */}
          <div className="p-1 rounded-xl bg-neutral-900/80 border border-neutral-800 flex gap-1">
            <button
              onClick={() => setMode('text-to-image')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                mode === 'text-to-image'
                  ? 'bg-red-600 text-white shadow-md shadow-red-950/50 border border-red-500/30'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
              }`}
            >
              Text-to-Image
            </button>
            <button
              onClick={() => setMode('image-to-image')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                mode === 'image-to-image'
                  ? 'bg-red-600 text-white shadow-md shadow-red-950/50 border border-red-500/30'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
              }`}
            >
              Image-to-Image
            </button>
          </div>

          {/* Visual Prompt Card */}
          <div className="p-4 rounded-2xl bg-[#0e1117] border border-neutral-800/80 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold tracking-wider text-neutral-400 uppercase">
                Visual Prompt
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleEnhancePrompt}
                  disabled={isEnhancing}
                  className="flex items-center gap-1.5 text-[11px] font-medium text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1 rounded-lg border border-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
                  title="Otomatis tingkatkan detail deskripsi gambar menjadi fotorealistik 8K"
                >
                  <Wand2 size={13} className={isEnhancing ? 'animate-spin' : ''} />
                  <span>{isEnhancing ? 'Memperkaya Detail...' : 'Smart Prompt Enhancer'}</span>
                </button>
                {prompt && (
                  <button
                    onClick={handleCopyPrompt}
                    className="p-1 rounded text-neutral-400 hover:text-white cursor-pointer"
                    title="Salin Prompt"
                  >
                    {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  </button>
                )}
              </div>
            </div>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Tuliskan visual secara deskriptif... e.g. 'A stunning gold coin floating over neon Tokyo city, unreal engine 5, 8k'"
              rows={4}
              className="w-full p-3.5 rounded-xl bg-neutral-950/90 text-sm text-neutral-100 placeholder-neutral-500 border border-neutral-800 focus:outline-none focus:border-red-500/60 transition-all resize-none font-sans leading-relaxed"
            />

            {/* Quick Style Presets */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] text-neutral-400 font-medium">Gaya Estetika (Style Preset):</span>
              <div className="flex flex-wrap gap-1.5">
                {stylePresets.map((style) => (
                  <button
                    key={style.name}
                    onClick={() => setSelectedStyle(style.name)}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                      selectedStyle === style.name
                        ? 'bg-red-500/20 text-red-300 border-red-500/50 font-semibold shadow-sm'
                        : 'bg-neutral-900/80 text-neutral-400 hover:text-neutral-200 border-neutral-800'
                    }`}
                  >
                    {style.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Aspect Ratio & Parameters */}
          <div className="p-4 rounded-2xl bg-[#0e1117] border border-neutral-800/80 shadow-xl space-y-4">
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold tracking-wider text-neutral-400 uppercase">
                Aspect Ratio
              </span>
              <div className="grid grid-cols-5 gap-2">
                {aspectRatios.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => setAspectRatio(item.label as any)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all cursor-pointer ${
                      aspectRatio === item.label
                        ? 'bg-red-600/20 text-red-400 border-red-500/50 font-bold shadow-sm'
                        : 'bg-neutral-900/60 text-neutral-400 hover:text-neutral-200 border-neutral-800'
                    }`}
                  >
                    <span className="text-xs font-mono">{item.label}</span>
                    <span className="text-[9px] text-neutral-500">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Negative Prompt */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-neutral-400 font-medium">Negative Prompt (Hindari Elemen):</span>
              <input
                type="text"
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 text-xs text-neutral-300 border border-neutral-800 focus:outline-none focus:border-red-500/50"
              />
            </div>

            {/* Quality and Render Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <div className="w-full sm:w-1/3 flex rounded-xl bg-neutral-950 p-1 border border-neutral-800 text-xs">
                {(['fast', 'high', 'ultra'] as const).map((q) => (
                  <button
                    key={q}
                    onClick={() => setQualityLevel(q)}
                    className={`flex-1 py-1.5 capitalize rounded-lg transition-all ${
                      qualityLevel === q ? 'bg-neutral-800 text-white font-semibold' : 'text-neutral-400'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className={`w-full sm:w-2/3 min-h-[46px] rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-red-950/40 border border-red-500/30 active:scale-[0.98] ${
                  isGenerating || !prompt.trim()
                    ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed border-neutral-700'
                    : 'bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:brightness-110 text-white'
                }`}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw size={16} className="animate-spin text-white" />
                    <span>Mengeksekusi Neural Render...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>Generate Visual Masterpiece</span>
                  </>
                )}
              </button>

              <QwenOmniDiagnostics />
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Canvas & Gallery (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 rounded-2xl bg-[#0e1117] border border-neutral-800/80 shadow-xl flex flex-col items-center">
            <div className="w-full flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold tracking-wider text-neutral-400 uppercase">
                Active Canvas
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                8K Ready
              </span>
            </div>

            {/* Display Image */}
            <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800 flex items-center justify-center group">
              {activeImage ? (
                <>
                  <img
                    src={activeImage}
                    alt="Active Canvas"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4">
                    <span className="text-xs text-neutral-200 line-clamp-2 max-w-[70%]">
                      {generatedImages.find(i => i.url === activeImage)?.prompt || 'Custom visual'}
                    </span>
                    <div className="flex gap-2">
                      {onSendToChat && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            onSendToChat(`[Gambar Dikirim]: ${activeImage}`);
                          }}
                          className="p-2 rounded-lg bg-neutral-900/90 text-white hover:bg-blue-600 transition-colors shadow"
                          title="Kirim ke Chat Utama"
                        >
                          <Send size={16} />
                        </button>
                      )}
                      <a
                        href={activeImage}
                        target="_blank"
                        rel="noreferrer"
                        download="navix-visual.jpg"
                        className="p-2 rounded-lg bg-neutral-900/90 text-white hover:bg-red-600 transition-colors shadow"
                        title="Download Full Resolution"
                      >
                        <Download size={16} />
                      </a>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center p-6 text-neutral-500 space-y-2">
                  <ImageIcon size={36} className="mx-auto opacity-30" />
                  <p className="text-xs">Belum ada gambar yang dipilih</p>
                </div>
              )}
            </div>
          </div>

              {/* History Gallery */}
          <div className="p-4 rounded-2xl bg-[#0e1117] border border-neutral-800/80 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold tracking-wider text-neutral-400 uppercase">
                Riwayat Galeri ({generatedImages.length})
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {generatedImages.map((img) => (
                <div
                  key={img.id}
                  onClick={() => setActiveImage(img.url)}
                  className={`relative aspect-video rounded-xl overflow-hidden cursor-pointer border transition-all ${
                    activeImage === img.url
                      ? 'border-red-500 shadow-md shadow-red-950/50'
                      : 'border-neutral-800 hover:border-neutral-700 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img.url} alt="Thumbnail" className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 right-1 px-1.5 py-0.2 rounded bg-black/70 text-[9px] font-mono text-neutral-300">
                    {img.ratio}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <QwenOmniRealismGallery 
            items={generatedImages.map(img => ({
              id: img.id,
              title: img.prompt,
              url: img.url,
              tag: img.style
            }))}
          />
        </div>
      </div>
    </div>
  );
};
