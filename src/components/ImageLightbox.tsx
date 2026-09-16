import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, ZoomIn, ZoomOut, Maximize2, Minimize2, Download, Copy, Check, 
  Sparkles, Layers, ShieldCheck, RefreshCw, Eye, Move
} from 'lucide-react';
import { mediaStore } from '../utils/mediaStorage';
import { showToast } from '../utils/toast';

export interface ImageLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  mediaKey?: string;
  src?: string;
  prompt?: string;
  alt?: string;
  aspectRatio?: string;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({
  isOpen,
  onClose,
  mediaKey,
  src,
  prompt,
  alt = 'Navix Studio High-Resolution Media',
  aspectRatio
}) => {
  const [blobUrl, setBlobUrl] = useState<string>('');
  const [rawBlob, setRawBlob] = useState<Blob | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const [fileSizeBytes, setFileSizeBytes] = useState<number>(0);
  const [mimeType, setMimeType] = useState<string>('image/png');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Load the pristine raw image byte data directly from MediaVault via mediaStore
  useEffect(() => {
    if (!isOpen) {
      if (blobUrl && blobUrl.startsWith('blob:')) {
        URL.revokeObjectURL(blobUrl);
      }
      setBlobUrl('');
      setRawBlob(null);
      setZoomLevel(1);
      setPanOffset({ x: 0, y: 0 });
      setDimensions(null);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    const loadLosslessBlob = async () => {
      try {
        let lookupKey = mediaKey;
        let sourceUrl = src || '';

        // If mediaKey wasn't passed directly, check if we can query by url or compute key
        if (!lookupKey && src) {
          const cached = await mediaStore.findMediaByUrl(src);
          if (cached) {
            lookupKey = cached.id;
          }
        }

        // Fetch original byte data from MediaVault
        const mediaResult = await mediaStore.getOriginalMediaBlob(lookupKey || sourceUrl);

        if (isMounted) {
          if (mediaResult) {
            const objectUrl = URL.createObjectURL(mediaResult.blob);
            setBlobUrl(objectUrl);
            setRawBlob(mediaResult.blob);
            setFileSizeBytes(mediaResult.sizeBytes);
            setMimeType(mediaResult.mimeType);
          } else if (sourceUrl) {
            // Fallback: direct src if blob creation wasn't possible
            setBlobUrl(sourceUrl);
          }
          setIsLoading(false);
        }
      } catch (err) {
        console.warn('ImageLightbox: Error loading lossless MediaVault blob:', err);
        if (isMounted) {
          setBlobUrl(src || '');
          setIsLoading(false);
        }
      }
    };

    loadLosslessBlob();

    return () => {
      isMounted = false;
    };
  }, [isOpen, mediaKey, src]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === '+' || e.key === '=') {
        handleZoomIn();
      } else if (e.key === '-' || e.key === '_') {
        handleZoomOut();
      } else if (e.key === '0') {
        handleResetZoom();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, zoomLevel]);

  // Mouse wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setZoomLevel(prev => Math.min(4, prev + 0.2));
    } else {
      setZoomLevel(prev => Math.max(0.25, prev - 0.2));
    }
  }, []);

  const handleZoomIn = () => setZoomLevel(prev => Math.min(4, Number((prev + 0.25).toFixed(2))));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(0.25, Number((prev - 0.25).toFixed(2))));
  const handleResetZoom = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };
  const handle100Percent = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Drag to pan when zoomed
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel <= 1) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    panStartRef.current = { ...panOffset };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPanOffset({
      x: panStartRef.current.x + dx,
      y: panStartRef.current.y + dy
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Direct lossless download
  const handleDownload = () => {
    const ext = mimeType.includes('png') ? 'png' : 'jpg';
    const filename = `navix_lossless_${Date.now()}.${ext}`;

    if (rawBlob) {
      const url = URL.createObjectURL(rawBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      showToast('Gambar kualitas penuh uncompressed berhasil diunduh', 'success');
    } else if (blobUrl) {
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast('Mengunduh gambar asli...', 'info');
    }
  };

  // Copy lossless image blob to clipboard
  const handleCopy = async () => {
    try {
      if (rawBlob && navigator.clipboard && window.ClipboardItem) {
        // If it's JPEG, some browsers require PNG in clipboard
        if (rawBlob.type === 'image/png') {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': rawBlob })
          ]);
          setCopied(true);
          showToast('Gambar lossless disalin ke papan klip', 'success');
          setTimeout(() => setCopied(false), 2000);
          return;
        }
      }
      
      // Fallback copy link/base64
      if (src) {
        await navigator.clipboard.writeText(src);
        setCopied(true);
        showToast('Data gambar disalin ke clipboard', 'success');
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.warn('Clipboard write error:', err);
      showToast('Gagal menyalin gambar secara langsung', 'error');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return 'Lossless Stream';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={containerRef}
      id="navix-image-lightbox"
      className="fixed inset-0 z-50 bg-neutral-950/95 backdrop-blur-xl flex flex-col justify-between select-none animate-in fade-in duration-200"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Top Header Bar */}
      <header className="w-full flex items-center justify-between px-4 sm:px-6 py-3.5 bg-neutral-900/90 border-b border-neutral-800 backdrop-blur-md z-20 text-white">
        {/* Left: Metadata & Lossless Badge */}
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[11px] font-mono shrink-0">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>MediaVault Raw Lossless</span>
          </div>

          <div className="hidden sm:block truncate max-w-md">
            <p className="text-xs font-semibold text-slate-100 truncate">
              {prompt || alt || 'Navix Photoreal Render'}
            </p>
            <p className="text-[10px] font-mono text-slate-400">
              {dimensions ? `${dimensions.width} × ${dimensions.height} px` : 'Resolusi Penuh'} • {formatFileSize(fileSizeBytes)} • {mimeType}
            </p>
          </div>
        </div>

        {/* Right: Action & Close Controls */}
        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <div className="flex items-center bg-neutral-800/90 rounded-lg border border-neutral-700 p-1 text-xs">
            <button
              onClick={handleZoomOut}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-neutral-700/60 rounded transition-colors"
              title="Perkecil (-)"
            >
              <ZoomOut size={15} />
            </button>
            <span className="font-mono text-[11px] px-2 text-emerald-400 min-w-[48px] text-center font-bold">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-neutral-700/60 rounded transition-colors"
              title="Perbesar (+)"
            >
              <ZoomIn size={15} />
            </button>
            <button
              onClick={handle100Percent}
              className="px-2 py-1 text-[10px] text-slate-300 hover:text-white hover:bg-neutral-700/60 rounded transition-colors border-l border-neutral-700 ml-1"
              title="100% Skala Piksel Asli"
            >
              1:1
            </button>
          </div>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="p-2 bg-neutral-800/90 hover:bg-neutral-700 text-slate-300 hover:text-white rounded-lg border border-neutral-700 transition-colors hidden sm:flex items-center gap-1.5 text-xs"
            title="Salin gambar"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            <span className="hidden md:inline">{copied ? 'Tersalin' : 'Salin'}</span>
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-2 bg-neutral-800/90 hover:bg-neutral-700 text-slate-300 hover:text-white rounded-lg border border-neutral-700 transition-colors hidden sm:flex items-center"
            title="Layar Penuh"
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>

          {/* Download Original Lossless */}
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-blue-900/40 transition-all active:scale-95"
            title="Unduh file lossless asli tanpa kompresi"
          >
            <Download size={14} />
            <span className="hidden xs:inline">Unduh HD</span>
          </button>

          {/* Close Lightbox */}
          <button
            onClick={onClose}
            className="p-2 bg-neutral-800/90 hover:bg-red-950/80 hover:text-red-300 text-slate-400 rounded-lg border border-neutral-700 transition-colors"
            title="Tutup (Esc)"
          >
            <X size={18} />
          </button>
        </div>
      </header>

      {/* Main Viewport */}
      <main 
        className="flex-1 w-full relative overflow-hidden flex items-center justify-center p-2 sm:p-6"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        style={{ cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
      >
        {isLoading ? (
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <RefreshCw size={28} className="animate-spin text-emerald-400" />
            <p className="text-xs font-mono">Mengambil data blob original dari MediaVault...</p>
          </div>
        ) : blobUrl ? (
          <div
            className="relative transition-transform duration-75 ease-out"
            style={{
              transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
              transformOrigin: 'center center'
            }}
          >
            <img
              ref={imageRef}
              src={blobUrl}
              alt={alt}
              referrerPolicy="no-referrer"
              draggable={false}
              onLoad={(e) => {
                const img = e.currentTarget;
                setDimensions({
                  width: img.naturalWidth,
                  height: img.naturalHeight
                });
              }}
              className="max-h-[82vh] max-w-[94vw] object-contain rounded-lg shadow-2xl transition-all"
              style={{
                imageRendering: 'auto'
              }}
            />
          </div>
        ) : (
          <div className="text-slate-400 text-xs">Gagal memuat gambar dari MediaVault</div>
        )}

        {/* Pan Indicator badge when zoomed */}
        {zoomLevel > 1 && (
          <div className="absolute bottom-4 left-4 bg-neutral-900/90 border border-neutral-700 px-3 py-1.5 rounded-full text-[10px] font-mono text-slate-300 flex items-center gap-1.5 backdrop-blur-md">
            <Move size={12} className="text-emerald-400" />
            <span>Tahan klik & geser untuk panning</span>
          </div>
        )}
      </main>

      {/* Bottom Technical Status Bar */}
      <footer className="w-full px-4 sm:px-6 py-2.5 bg-neutral-900/80 border-t border-neutral-800/80 backdrop-blur-md flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck size={14} className="text-emerald-400" />
          <span>Lossless Pixel-Perfect Stream</span>
          <span className="text-neutral-600">•</span>
          <span>Bypass CSS Canvas Resampling</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline">Navigasi: <kbd className="px-1.5 py-0.5 bg-neutral-800 border border-neutral-700 rounded text-[10px] text-slate-300">Esc</kbd> Tutup</span>
          <span className="hidden sm:inline"><kbd className="px-1.5 py-0.5 bg-neutral-800 border border-neutral-700 rounded text-[10px] text-slate-300">+</kbd>/<kbd className="px-1.5 py-0.5 bg-neutral-800 border border-neutral-700 rounded text-[10px] text-slate-300">-</kbd> Zoom</span>
          <span className="hidden sm:inline"><kbd className="px-1.5 py-0.5 bg-neutral-800 border border-neutral-700 rounded text-[10px] text-slate-300">0</kbd> Reset</span>
        </div>
      </footer>
    </div>
  );
};
export default ImageLightbox;
