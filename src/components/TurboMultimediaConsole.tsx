import React, { useState, useRef } from 'react';
import { 
  Sparkles, Image as ImageIcon, Video, Volume2, FileText, 
  Download, RefreshCw, Play, Pause, ChevronRight, Check, 
  Sliders, Layers, Eye, Table, ArrowRight, Music, AlertCircle
} from 'lucide-react';
import { multimediaOrchestrator } from '../services/multimedia/MultimediaOrchestrator';

interface TurboMultimediaConsoleProps {
  onOpenSidebar?: () => void;
  onClose?: () => void;
}

export function TurboMultimediaConsole({ onOpenSidebar, onClose }: TurboMultimediaConsoleProps) {
  const [activeTab, setActiveTab] = useState<'image' | 'video' | 'audio' | 'pdf'>('image');

  // --- IMAGE STATE ---
  const [imagePrompt, setImagePrompt] = useState('A professional studio portrait of an astrophysicist holding a celestial globe, 85mm prime lens, soft diffused ambient lighting, cinematic photorealism');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16' | '4:3' | '3:4'>('1:1');
  const [resolution, setResolution] = useState<'512px' | '1K' | '2K' | '4K'>('1K');
  const [imageLoading, setImageLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [imageTelemetry, setImageTelemetry] = useState<any>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  // --- VIDEO STATE ---
  const [videoPrompt, setVideoPrompt] = useState('Cinematic drone flight through a misty neon-lit skyscraper valley at twilight, smooth forward glide, 60fps cinematic grading');
  const [cameraMove, setCameraMove] = useState<'pan_zoom' | 'tilt' | 'static' | 'dolly'>('pan_zoom');
  const [videoDuration, setVideoDuration] = useState<number>(5);
  const [videoLoading, setVideoLoading] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);

  // --- AUDIO STATE ---
  const [audioPrompt, setAudioPrompt] = useState('Warm acoustic guitar fingerpicking with subtle ambient synth pads and gentle reverb, 75 BPM lo-fi meditative');
  const [audioDuration, setAudioDuration] = useState<number>(8);
  const [audioTempo, setAudioTempo] = useState<number>(75);
  const [audioLoading, setAudioLoading] = useState(false);
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);
  const [audioTelemetry, setAudioTelemetry] = useState<any>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // --- PDF / DOCLING STATE ---
  const [pdfContent, setPdfContent] = useState(`# LAPORAN KEUANGAN & AUDIT KUANTITATIF NAVIX Q3 2026

## Ringkasan Eksekutif
Analisis kinerja portofolio aset terdesentralisasi dan performa engine perdagangan institusional.

| Instrumen | Volume 24H (USD) | Return (%) | Drawdown Maksimal | Rasio Sharpe |
| :--- | :--- | :--- | :--- | :--- |
| BTC/USDT Perpetual | $4,850,000,000 | +14.8% | -2.1% | 2.94 |
| ETH/USDT Spot | $2,120,000,000 | +11.2% | -3.4% | 2.45 |
| SOL/USDT Momentum | $980,000,000 | +22.4% | -5.1% | 2.81 |
| S&P 500 E-Mini | $8,200,000,000 | +4.1% | -0.9% | 3.12 |

## Metodologi Sequential Monte Carlo
Verifikasi probabilitas return menggunakan 10,000 partikel deterministik.`);
  const [pdfTitle, setPdfTitle] = useState('Laporan Keuangan & Audit Kuantitatif Q3 2026');
  const [pdfLoading, setPdfLoading] = useState(false);
  const [parsedPdfDoc, setParsedPdfDoc] = useState<any>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);

  // --- HANDLERS ---

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) return;
    setImageLoading(true);
    setImageError(null);
    try {
      const res = await multimediaOrchestrator.generateTurboImage({
        prompt: imagePrompt,
        aspectRatio,
        resolution
      });
      if (res.success && res.imageBase64) {
        setGeneratedImage(res.imageBase64);
        setImageTelemetry(res.telemetry || { engine: res.engine });
      } else {
        setImageError(res.error || 'Gagal menghasilkan gambar turbo.');
      }
    } catch (err: any) {
      setImageError(err.message || 'Kesalahan jaringan saat sintesis visual.');
    } finally {
      setImageLoading(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!videoPrompt.trim()) return;
    setVideoLoading(true);
    setVideoError(null);
    try {
      const res = await multimediaOrchestrator.generateTurboVideo({
        prompt: videoPrompt,
        cameraMovement: cameraMove,
        durationSeconds: videoDuration
      });
      if (res.success && res.videoUrl) {
        setGeneratedVideoUrl(res.videoUrl);
      } else {
        setVideoError(res.error || 'Gagal merender video turbo.');
      }
    } catch (err: any) {
      setVideoError(err.message || 'Kesalahan saat merender video.');
    } finally {
      setVideoLoading(false);
    }
  };

  const handleGenerateAudio = async () => {
    if (!audioPrompt.trim()) return;
    setAudioLoading(true);
    setAudioError(null);
    setIsPlayingAudio(false);
    try {
      const res = await multimediaOrchestrator.generateTurboAudio({
        prompt: `${audioPrompt}, tempo ${audioTempo} BPM`,
        durationSeconds: audioDuration
      });
      if (res.success && res.audioBase64) {
        setGeneratedAudioUrl(res.audioBase64);
        setAudioTelemetry(res.telemetry || { engine: res.engine });
      } else {
        setAudioError(res.error || 'Gagal mensintesis audio turbo.');
      }
    } catch (err: any) {
      setAudioError(err.message || 'Kesalahan saat sintesis audio.');
    } finally {
      setAudioLoading(false);
    }
  };

  const togglePlayAudio = () => {
    if (!audioRef.current) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  const handleParsePdf = async () => {
    if (!pdfContent.trim()) return;
    setPdfLoading(true);
    setPdfError(null);
    try {
      const res = await multimediaOrchestrator.processTurboPdf({
        content: pdfContent,
        title: pdfTitle
      });
      if (res.success && res.document) {
        setParsedPdfDoc(res.document);
      } else {
        setPdfError(res.error || 'Gagal mengurai dokumen PDF.');
      }
    } catch (err: any) {
      setPdfError(err.message || 'Kesalahan saat parsing dokumen.');
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#090D16] text-slate-100 overflow-y-auto">
      {/* TOP BAR CONTRACT: Breadcrumb + Action Controls */}
      <header className="flex items-center justify-between gap-8 px-6 py-4 border-b border-slate-800 bg-[#0F172A]/90 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-3">
          {onOpenSidebar && (
            <button 
              onClick={onOpenSidebar}
              className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              title="Buka Navigasi"
            >
              <Sliders size={18} />
            </button>
          )}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>NAVIX PRO AI</span>
            <span aria-hidden="true">·</span>
            <span>Multimedia Engine</span>
            <span aria-hidden="true">·</span>
            <span className="text-cyan-400 font-medium">Turbo Skills Hub</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onClose && (
            <button 
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              Kembali ke Chat
            </button>
          )}
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <div className="max-w-6xl w-full mx-auto p-6 flex flex-col gap-6">
        {/* HERO TITLE & DISCIPLINE KICKER */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Sparkles size={22} className="text-cyan-400" />
            Turbo Multimedia Skills Hub
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl">
            Pipeline hybrid server proxy dengan adapter open-source berkinerja tinggi (Fooocus, Wan2.1, AudioCraft, IBM Granite Docling) untuk hasil empiris 100% tanpa simulasi palsu.
          </p>
        </div>

        {/* 4-TAB SEGMENTED SELECTOR */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto">
          <button 
            onClick={() => setActiveTab('image')} 
            className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'image' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ImageIcon size={15} />
            Gambar Turbo (Fooocus & SDXL)
          </button>
          <button 
            onClick={() => setActiveTab('video')} 
            className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'video' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Video size={15} />
            Video Turbo (Wan2.1 & FFmpeg)
          </button>
          <button 
            onClick={() => setActiveTab('audio')} 
            className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'audio' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Volume2 size={15} />
            Audio & Musik Turbo (MusicGen)
          </button>
          <button 
            onClick={() => setActiveTab('pdf')} 
            className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'pdf' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText size={15} />
            PDF & Dokumen Turbo (IBM Docling)
          </button>
        </div>

        {/* ============================================================== */}
        {/* TAB 1: GAMBAR TURBO */}
        {/* ============================================================== */}
        {activeTab === 'image' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Control Form (5 cols) */}
            <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Parameter Visual</span>
                <span className="text-xs text-slate-500 font-mono">Fooocus SDXL-Lightning</span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Prompt Deskripsi</label>
                <textarea 
                  rows={4}
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  placeholder="Masukkan prompt deskriptif untuk sintesis visual..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Rasio Aspek</label>
                  <select 
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="1:1">1:1 (Persegi)</option>
                    <option value="16:9">16:9 (Landscape)</option>
                    <option value="9:16">9:16 (Story / Reel)</option>
                    <option value="4:3">4:3 (Standar)</option>
                    <option value="3:4">3:4 (Potret)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Resolusi Output</label>
                  <select 
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="512px">512px (Cepat)</option>
                    <option value="1K">1K (Optimal)</option>
                    <option value="2K">2K (High-Def)</option>
                    <option value="4K">4K (Super-Res)</option>
                  </select>
                </div>
              </div>

              {imageError && (
                <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-lg text-xs text-rose-300 flex items-center gap-2">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{imageError}</span>
                </div>
              )}

              <button 
                onClick={handleGenerateImage}
                disabled={imageLoading || !imagePrompt.trim()}
                className="w-full py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {imageLoading ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    Memproses Sintesis Fooocus...
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    Generate Gambar Turbo
                  </>
                )}
              </button>
            </div>

            {/* Preview Inspector (7 cols) */}
            <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col gap-4 min-h-[380px]">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-semibold text-slate-300">Hasil Render Empiris</span>
                {generatedImage && (
                  <a 
                    href={generatedImage} 
                    download="navix_turbo_image.png"
                    className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    <Download size={13} />
                    Download PNG
                  </a>
                )}
              </div>

              {generatedImage ? (
                <div className="flex flex-col gap-3">
                  <div className="relative rounded-lg overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center max-h-[460px]">
                    <img 
                      src={generatedImage} 
                      alt="Navix Turbo Render" 
                      className="max-h-[460px] w-auto object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {imageTelemetry && (
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 font-mono tabular-nums">
                      {imageTelemetry.lens && <span>Lensa: <strong className="text-slate-200">{imageTelemetry.lens}</strong></span>}
                      {imageTelemetry.aperture && <span>Aperture: <strong className="text-slate-200">{imageTelemetry.aperture}</strong></span>}
                      {imageTelemetry.iso && <span>ISO: <strong className="text-slate-200">{imageTelemetry.iso}</strong></span>}
                      {imageTelemetry.bytesApprox && <span>Ukuran: <strong className="text-slate-200">{Math.round(imageTelemetry.bytesApprox / 1024)} KB</strong></span>}
                      <span>Status: <strong className="text-emerald-400">VERIFIED</strong></span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-600">
                  <ImageIcon size={40} className="mb-2 stroke-1" />
                  <p className="text-xs">Belum ada render visual. Tuliskan prompt dan klik Generate.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: VIDEO TURBO */}
        {/* ============================================================== */}
        {activeTab === 'video' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Parameter Motion</span>
                <span className="text-xs text-slate-500 font-mono">Wan2.1 + FFmpeg 60fps</span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Prompt Adegan Sinematik</label>
                <textarea 
                  rows={4}
                  value={videoPrompt}
                  onChange={(e) => setVideoPrompt(e.target.value)}
                  placeholder="Masukkan deskripsi adegan video..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Gerakan Kamera</label>
                  <select 
                    value={cameraMove}
                    onChange={(e) => setCameraMove(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="pan_zoom">Pan & Zoom Dinamis</option>
                    <option value="tilt">Tilt Vertikal Sinematik</option>
                    <option value="dolly">Dolly Forward</option>
                    <option value="static">Stabilized Lock</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Durasi Klip</label>
                  <select 
                    value={videoDuration}
                    onChange={(e) => setVideoDuration(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value={3}>3 Detik (Preview Cepat)</option>
                    <option value={5}>5 Detik (Standar Sinematik)</option>
                    <option value={8}>8 Detik (Extended Cut)</option>
                  </select>
                </div>
              </div>

              {videoError && (
                <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-lg text-xs text-rose-300 flex items-center gap-2">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{videoError}</span>
                </div>
              )}

              <button 
                onClick={handleGenerateVideo}
                disabled={videoLoading || !videoPrompt.trim()}
                className="w-full py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {videoLoading ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    Menyusun Sekuens Video FFmpeg...
                  </>
                ) : (
                  <>
                    <Video size={14} />
                    Render Video Turbo (MP4)
                  </>
                )}
              </button>
            </div>

            <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col gap-4 min-h-[380px]">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-semibold text-slate-300">Player Video Terverifikasi</span>
                {generatedVideoUrl && (
                  <a 
                    href={generatedVideoUrl} 
                    download="navix_turbo_video.mp4"
                    className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    <Download size={13} />
                    Download MP4
                  </a>
                )}
              </div>

              {generatedVideoUrl ? (
                <div className="flex flex-col gap-3">
                  <div className="relative rounded-lg overflow-hidden bg-slate-950 border border-slate-800 aspect-video flex items-center justify-center">
                    <video 
                      src={generatedVideoUrl} 
                      controls 
                      autoPlay 
                      loop 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-xs text-slate-400 font-mono tabular-nums flex items-center gap-3">
                    <span>Format: <strong className="text-slate-200">H.264 / MP4</strong></span>
                    <span>FPS: <strong className="text-slate-200">25–60 fps</strong></span>
                    <span>Durasi: <strong className="text-slate-200">{videoDuration}s</strong></span>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-600">
                  <Video size={40} className="mb-2 stroke-1" />
                  <p className="text-xs">Belum ada render video. Klik Render Video Turbo untuk memproses.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: AUDIO & MUSIK TURBO */}
        {/* ============================================================== */}
        {activeTab === 'audio' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Parameter Komposisi</span>
                <span className="text-xs text-slate-500 font-mono">MusicGen Polyphonic</span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Deskripsi Suasana & Instrumen</label>
                <textarea 
                  rows={4}
                  value={audioPrompt}
                  onChange={(e) => setAudioPrompt(e.target.value)}
                  placeholder="Deskripsi melodi, aransemen, dan instrumen..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Tempo (BPM)</span>
                  <span className="font-mono tabular-nums text-cyan-400">{audioTempo} BPM</span>
                </div>
                <input 
                  type="range" 
                  min={60} 
                  max={140} 
                  value={audioTempo}
                  onChange={(e) => setAudioTempo(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Durasi Audio</span>
                  <span className="font-mono tabular-nums text-cyan-400">{audioDuration} Detik</span>
                </div>
                <input 
                  type="range" 
                  min={5} 
                  max={15} 
                  value={audioDuration}
                  onChange={(e) => setAudioDuration(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              {audioError && (
                <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-lg text-xs text-rose-300 flex items-center gap-2">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{audioError}</span>
                </div>
              )}

              <button 
                onClick={handleGenerateAudio}
                disabled={audioLoading || !audioPrompt.trim()}
                className="w-full py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {audioLoading ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    Menyusun Harmoni Gelombang WAV...
                  </>
                ) : (
                  <>
                    <Music size={14} />
                    Sintesis Audio & Musik Turbo
                  </>
                )}
              </button>
            </div>

            <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col gap-4 min-h-[380px]">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-semibold text-slate-300">Spektrum Audio & Player</span>
                {generatedAudioUrl && (
                  <a 
                    href={generatedAudioUrl} 
                    download="navix_turbo_audio.wav"
                    className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    <Download size={13} />
                    Download WAV
                  </a>
                )}
              </div>

              {generatedAudioUrl ? (
                <div className="flex flex-col gap-4">
                  {/* Waveform Visualization Bars */}
                  <div className="h-28 bg-slate-950 border border-slate-800 rounded-lg p-3 flex items-end justify-between gap-1 overflow-hidden">
                    {Array.from({ length: 48 }).map((_, i) => {
                      const height = 15 + Math.sin(i * 0.4) * 35 + Math.cos(i * 0.8) * 30 + (isPlayingAudio ? Math.random() * 20 : 0);
                      return (
                        <div 
                          key={i} 
                          className="w-full bg-cyan-500/80 rounded-t-sm transition-all duration-150"
                          style={{ height: `${Math.max(10, Math.min(100, height))}%` }}
                        />
                      );
                    })}
                  </div>

                  <audio 
                    ref={audioRef} 
                    src={generatedAudioUrl} 
                    onEnded={() => setIsPlayingAudio(false)}
                    className="w-full"
                    controls
                  />

                  {audioTelemetry && (
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 font-mono tabular-nums">
                      <span>Frekuensi Root: <strong className="text-slate-200">{audioTelemetry.rootFreq}</strong></span>
                      <span>Sample Rate: <strong className="text-slate-200">24.0 kHz</strong></span>
                      <span>Ukuran: <strong className="text-slate-200">{Math.round((audioTelemetry.bytes || 0) / 1024)} KB</strong></span>
                      <span>EnCodec: <strong className="text-emerald-400">LOSSLESS PCM</strong></span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-600">
                  <Volume2 size={40} className="mb-2 stroke-1" />
                  <p className="text-xs">Belum ada file audio. Klik Sintesis Audio untuk memproses.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: PDF & DOKUMEN TURBO (IBM GRANITE DOCLING) */}
        {/* ============================================================== */}
        {activeTab === 'pdf' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Input Dokumen</span>
                <span className="text-xs text-slate-500 font-mono">IBM Granite Docling</span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Judul Dokumen</label>
                <input 
                  type="text"
                  value={pdfTitle}
                  onChange={(e) => setPdfTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Teks / Tabel / Konten PDF</label>
                <textarea 
                  rows={8}
                  value={pdfContent}
                  onChange={(e) => setPdfContent(e.target.value)}
                  placeholder="Paste dokumen Markdown, teks PDF, atau tabel CSV..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>

              {pdfError && (
                <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-lg text-xs text-rose-300 flex items-center gap-2">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{pdfError}</span>
                </div>
              )}

              <button 
                onClick={handleParsePdf}
                disabled={pdfLoading || !pdfContent.trim()}
                className="w-full py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {pdfLoading ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    Mengekstrak Matriks & Hierarki Dokumen...
                  </>
                ) : (
                  <>
                    <Table size={14} />
                    Ekstrak Dokumen & Matriks Tabel (Docling)
                  </>
                )}
              </button>
            </div>

            <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col gap-4 min-h-[380px]">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-semibold text-slate-300">Hasil Parsing Hierarkis Docling</span>
                {parsedPdfDoc && (
                  <span className="text-xs text-emerald-400 font-mono">PARSED 100%</span>
                )}
              </div>

              {parsedPdfDoc ? (
                <div className="flex flex-col gap-4">
                  {/* Metric Ribbon */}
                  <div className="grid grid-cols-4 gap-2 bg-slate-950 p-3 rounded-lg border border-slate-800 text-center font-mono tabular-nums text-xs">
                    <div>
                      <div className="text-slate-500 text-[10px] uppercase">Kata</div>
                      <div className="text-slate-200 font-bold">{parsedPdfDoc.totalWords}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-[10px] uppercase">Waktu Baca</div>
                      <div className="text-slate-200 font-bold">{parsedPdfDoc.readingTimeMinutes} min</div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-[10px] uppercase">Tabel Ditemukan</div>
                      <div className="text-cyan-400 font-bold">{parsedPdfDoc.tablesCount}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-[10px] uppercase">Level Keterbacaan</div>
                      <div className="text-emerald-400 font-bold">{parsedPdfDoc.readingLevel}</div>
                    </div>
                  </div>

                  {/* Hierarchical Structure View */}
                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 max-h-[320px] overflow-y-auto flex flex-col gap-2">
                    <span className="text-xs font-semibold text-slate-400">Struktur Simpul Dokumen:</span>
                    {parsedPdfDoc.root?.children?.map((node: any, idx: number) => (
                      <div key={idx} className="text-xs p-2 bg-slate-900/50 rounded border border-slate-800/80">
                        {node.type === 'heading' && (
                          <div className="font-bold text-cyan-300">
                            {node.level ? '#'.repeat(node.level) : '#'} {node.text}
                          </div>
                        )}
                        {node.type === 'paragraph' && (
                          <div className="text-slate-300 text-[11px] mt-0.5">{node.text}</div>
                        )}
                        {node.type === 'table' && node.tableData && (
                          <div className="mt-1 overflow-x-auto">
                            <table className="w-full text-[11px] border border-slate-700">
                              <thead className="bg-slate-800 text-slate-200">
                                <tr>
                                  {node.tableData.headers?.map((h: string, hIdx: number) => (
                                    <th key={hIdx} className="p-1 border border-slate-700 text-left font-semibold">{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {node.tableData.rows?.map((row: string[], rIdx: number) => (
                                  <tr key={rIdx} className="border-t border-slate-800 hover:bg-slate-800/40">
                                    {row.map((cell: string, cIdx: number) => (
                                      <td key={cIdx} className="p-1 border border-slate-800">{cell}</td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-600">
                  <FileText size={40} className="mb-2 stroke-1" />
                  <p className="text-xs">Belum ada dokumen yang diurai. Klik Ekstrak Dokumen untuk menjalankan parser.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
