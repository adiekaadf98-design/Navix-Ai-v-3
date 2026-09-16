import React, { useState } from 'react';
import { 
  Video, 
  Film, 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  Download, 
  Sliders, 
  Menu, 
  Zap, 
  Clapperboard, 
  Eye, 
  Layers,
  Send
} from 'lucide-react';
import { motion } from 'motion/react';
import { showToast } from '../../utils/toast';

interface VideoStudioProps {
  onOpenSidebar: () => void;
  onSendToChat?: (prompt: string) => void;
}

export const VideoStudio: React.FC<VideoStudioProps> = ({ onOpenSidebar, onSendToChat }) => {
  const [pipelineMode, setPipelineMode] = useState<'text-to-video' | 'image-to-video' | 'motion-transfer'>('text-to-video');
  const [dynamicPrompt, setDynamicPrompt] = useState('');
  const [cameraMotion, setCameraMotion] = useState('Dolly Zoom');
  const [duration, setDuration] = useState<'5s' | '10s' | '15s'>('5s');
  const [resolution, setResolution] = useState<'1080p UHD' | '4K Cinema'>('1080p UHD');
  const [fps, setFps] = useState<'24fps' | '30fps' | '60fps'>('24fps');
  const [isRendering, setIsRendering] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);

  const sampleVideos = [
    {
      id: 'vid-1',
      title: 'Matrix Stream Cybernetic Ocean',
      prompt: 'Slow pan, glowing cybernetic ocean with matrix streams, UHD resolution, 24fps cinema',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-screens-with-code-31913-large.mp4',
      camera: 'Dolly Zoom',
      duration: '5s',
      date: 'Baru saja'
    },
    {
      id: 'vid-2',
      title: 'Golden Particle Nebula Orbit',
      prompt: 'Orbit 360, glowing golden particles forming neural plexus in interstellar deep space',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-glowing-lines-in-motion-32986-large.mp4',
      camera: 'Orbit 360',
      duration: '10s',
      date: '10m lalu'
    }
  ];

  const [activeVideo, setActiveVideo] = useState(sampleVideos[0]);

  const cameraPresets = ['Pan Left', 'Dolly Zoom', 'Orbit 360', 'Drone High Angle', 'FPV Hyperlapse'];

  const handleStartRender = async () => {
    if (!dynamicPrompt.trim()) {
      showToast('Masukkan deskripsi prompt video terlebih dahulu', 'error');
      return;
    }

    setIsRendering(true);

    try {
      showToast('Memulai perenderan video Sovereign...', 'info');
      const startRes = await fetch('/api/generate-video/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: dynamicPrompt })
      });
      const startData = await startRes.json();
      if (!startRes.ok || !startData.success) {
        throw new Error(startData.error || 'Gagal memulai perenderan video');
      }

      const opName = startData.operationName;
      let videoUrl = '';
      let attempts = 0;

      while (attempts < 25) {
        await new Promise(r => setTimeout(r, 1500));
        attempts++;
        try {
          const pollRes = await fetch('/api/generate-video/poll', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ operationName: opName })
          });
          const pollData = await pollRes.json();
          if (pollData.done) {
            videoUrl = pollData.videoUrl || pollData.uri || pollData.frameUrl;
            break;
          }
        } catch (pollErr) {
          console.warn('Poll attempt error', pollErr);
        }
      }

      if (!videoUrl) {
        throw new Error('Timeout menunggu hasil render video.');
      }

      const newClip = {
        id: `vid-${Date.now()}`,
        title: dynamicPrompt.slice(0, 32) + '...',
        prompt: dynamicPrompt,
        url: videoUrl,
        camera: cameraMotion,
        duration: duration,
        date: 'Baru saja'
      };

      setActiveVideo(newClip);
      showToast('Klip video sinematik berhasil dirender dengan neural pipeline!', 'success');
    } catch (e: any) {
      console.warn('Video render error:', e);
      showToast(e.message || 'Gagal merender video. Silakan coba kembali.', 'error');
    } finally {
      setIsRendering(false);
    }
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
          <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <Video size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm md:text-base font-bold text-white tracking-wide">
                Multimedia. Videos
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                Workspace
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 hidden sm:block">
              Generate neural cinematic clips, animate images, and transfer motions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-neutral-400 bg-neutral-800/80 px-2.5 py-1 rounded-lg border border-neutral-700/50 flex items-center gap-1.5">
            <Zap size={13} className="text-rose-400" />
            <span>Neural GPU v2</span>
          </span>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Prompting & Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Pipeline Mode Tabs */}
          <div className="p-1 rounded-xl bg-neutral-900/80 border border-neutral-800 flex flex-wrap gap-1">
            <button
              onClick={() => setPipelineMode('text-to-video')}
              className={`flex-1 min-w-[120px] py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                pipelineMode === 'text-to-video'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-950/50 border border-rose-500/30'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
              }`}
            >
              Text-to-Video
            </button>
            <button
              onClick={() => setPipelineMode('image-to-video')}
              className={`flex-1 min-w-[120px] py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                pipelineMode === 'image-to-video'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-950/50 border border-rose-500/30'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
              }`}
            >
              Image-to-Video
            </button>
            <button
              onClick={() => setPipelineMode('motion-transfer')}
              className={`flex-1 min-w-[140px] py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                pipelineMode === 'motion-transfer'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-950/50 border border-rose-500/30'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
              }`}
            >
              Motion Transfer (Actor)
            </button>
          </div>

          {/* Dynamic Prompt Card */}
          <div className="p-4 rounded-2xl bg-[#0e1117] border border-neutral-800/80 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold tracking-wider text-neutral-400 uppercase">
                Dynamic Prompt
              </span>
              <span className="text-[10px] font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                Physics Engine On
              </span>
            </div>

            <textarea
              value={dynamicPrompt}
              onChange={(e) => setDynamicPrompt(e.target.value)}
              placeholder="Tuliskan aksi/kamera secara dinamis... e.g. 'Slow pan, glowing cybernetic ocean with matrix streams, UHD resolution'"
              rows={4}
              className="w-full p-3.5 rounded-xl bg-neutral-950/90 text-sm text-neutral-100 placeholder-neutral-500 border border-neutral-800 focus:outline-none focus:border-rose-500/60 transition-all resize-none font-sans leading-relaxed"
            />

            {/* Camera Motion Presets */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] text-neutral-400 font-medium">Gerakan Kamera (Camera Motion):</span>
              <div className="flex flex-wrap gap-1.5">
                {cameraPresets.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setCameraMotion(preset)}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                      cameraMotion === preset
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 font-semibold shadow-sm'
                        : 'bg-neutral-900/80 text-neutral-400 hover:text-neutral-200 border-neutral-800'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Video Parameters & Render Button */}
          <div className="p-4 rounded-2xl bg-[#0e1117] border border-neutral-800/80 shadow-xl space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Duration */}
              <div className="space-y-1">
                <span className="text-[11px] text-neutral-400 font-medium">Durasi Klip:</span>
                <div className="flex rounded-lg bg-neutral-950 p-1 border border-neutral-800">
                  {(['5s', '10s', '15s'] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() => setDuration(d)}
                      className={`flex-1 py-1 rounded text-xs transition-all ${
                        duration === d ? 'bg-neutral-800 text-white font-bold' : 'text-neutral-500'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Resolution */}
              <div className="space-y-1">
                <span className="text-[11px] text-neutral-400 font-medium">Resolusi:</span>
                <div className="flex rounded-lg bg-neutral-950 p-1 border border-neutral-800">
                  {(['1080p UHD', '4K Cinema'] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setResolution(r)}
                      className={`flex-1 py-1 rounded text-xs transition-all ${
                        resolution === r ? 'bg-neutral-800 text-white font-bold' : 'text-neutral-500'
                      }`}
                    >
                      {r.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* FPS */}
              <div className="space-y-1">
                <span className="text-[11px] text-neutral-400 font-medium">Frame Rate:</span>
                <div className="flex rounded-lg bg-neutral-950 p-1 border border-neutral-800">
                  {(['24fps', '30fps', '60fps'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFps(f)}
                      className={`flex-1 py-1 rounded text-xs transition-all ${
                        fps === f ? 'bg-neutral-800 text-white font-bold' : 'text-neutral-500'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleStartRender}
              disabled={isRendering || !dynamicPrompt.trim()}
              className={`w-full min-h-[46px] rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-rose-950/40 border border-rose-500/30 active:scale-[0.98] ${
                isRendering || !dynamicPrompt.trim()
                  ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed border-neutral-700'
                  : 'bg-gradient-to-r from-rose-600 via-red-600 to-rose-600 hover:brightness-110 text-white'
              }`}
            >
              {isRendering ? (
                <>
                  <RotateCcw size={16} className="animate-spin text-white" />
                  <span>Merender Neural Cinematic Frames (0% - 100%)...</span>
                </>
              ) : (
                <>
                  <Clapperboard size={16} />
                  <span>Render Neural Cinematic Clip</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Video Player Canvas & History (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 rounded-2xl bg-[#0e1117] border border-neutral-800/80 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold tracking-wider text-neutral-400 uppercase">
                Neural Video Player
              </span>
              <span className="text-[10px] font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                {activeVideo.camera}
              </span>
            </div>

            {/* Video Player Box */}
            <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-neutral-800 group flex items-center justify-center">
              <video
                src={activeVideo.url}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />

              {/* Video Overlay Info */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                <span className="text-xs font-medium text-white truncate">{activeVideo.title}</span>
                <span className="text-[10px] text-neutral-400 truncate">{activeVideo.prompt}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 text-xs text-neutral-400">
              <span>Durasi: {activeVideo.duration}</span>
              <div className="flex gap-4">
                {onSendToChat && (
                  <button
                    onClick={() => onSendToChat(`[Video Dikirim]: ${activeVideo.prompt}\nURL: ${activeVideo.url}`)}
                    className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                  >
                    <Send size={13} />
                    <span>Kirim</span>
                  </button>
                )}
                <a
                  href={activeVideo.url}
                  target="_blank"
                  rel="noreferrer"
                  download="navix-clip.mp4"
                  className="flex items-center gap-1 text-rose-400 hover:text-rose-300 transition-colors"
                >
                  <Download size={13} />
                  <span>Download MP4</span>
                </a>
              </div>
            </div>
          </div>

          {/* Rendered Clips Gallery */}
          <div className="p-4 rounded-2xl bg-[#0e1117] border border-neutral-800/80 shadow-xl space-y-3">
            <span className="text-xs font-mono font-bold tracking-wider text-neutral-400 uppercase">
              Klip Tersimpan ({sampleVideos.length})
            </span>
            <div className="space-y-2">
              {sampleVideos.map((vid) => (
                <div
                  key={vid.id}
                  onClick={() => setActiveVideo(vid)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    activeVideo.id === vid.id
                      ? 'bg-rose-500/10 border-rose-500/50 text-white'
                      : 'bg-neutral-900/50 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="w-8 h-8 rounded-lg bg-neutral-950 flex items-center justify-center shrink-0 text-rose-400">
                      <Play size={14} className="fill-current" />
                    </div>
                    <div className="truncate text-left">
                      <p className="text-xs font-medium truncate">{vid.title}</p>
                      <p className="text-[10px] text-neutral-500">{vid.camera} • {vid.duration}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-500 shrink-0">{vid.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
