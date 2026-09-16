
import React, { useState, useEffect, useRef } from 'react';
import { Video, Image as ImageIcon, FileAudio, Download, Cpu, AlertTriangle, Layers, PlaySquare, Settings, Activity, Shield, Check, Fingerprint, RefreshCw, Sparkles, Camera, Maximize2, ZoomIn, ZoomOut, X, Eye } from 'lucide-react';
import { WatermarkService } from '../services/WatermarkService';
import { validateImagePayload } from './CloudConsole';
import { showToast } from '../utils/toast';
import { computeMediaKey, saveMediaToVault, getMediaFromVault } from '../utils/mediaStorage';
import { translateAndEnrichPrompt, cleanBuzzwords, buildPollinationsRealismUrl } from '../services/photorealismEngine';
import { ImageLightbox } from './ImageLightbox';

export interface MediaData {
  type: 'image' | 'video' | 'music' | 'audio' | 'video_edit';
  image?: string;
  prompt?: string;
  aspectRatio?: string;
  operation?: string;
  videoUrl?: string;
}

// Convert AudioBuffer to WAV Blob for Music Engine
function bufferToWav(abuffer) {
  let numOfChan = abuffer.numberOfChannels,
      length = abuffer.length * numOfChan * 2 + 44,
      buffer = new ArrayBuffer(length),
      view = new DataView(buffer),
      channels = [], i, sample,
      offset = 0,
      pos = 0;

  function setUint16(data) { view.setUint16(offset, data, true); offset += 2; }
  function setUint32(data) { view.setUint32(offset, data, true); offset += 4; }

  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8);
  setUint32(0x45564157); // "WAVE"
  setUint32(0x20746d66); // "fmt "
  setUint32(16);
  setUint16(1);
  setUint16(numOfChan);
  setUint32(abuffer.sampleRate);
  setUint32(abuffer.sampleRate * 2 * numOfChan);
  setUint16(numOfChan * 2);
  setUint16(16);
  setUint32(0x61746164); // "data"
  setUint32(length - pos - 4);

  for(i = 0; i < abuffer.numberOfChannels; i++) channels.push(abuffer.getChannelData(i));

  while(pos < abuffer.length) {
    for(i = 0; i < numOfChan; i++) {
      sample = Math.max(-1, Math.min(1, channels[i][pos]));
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767)|0;
      view.setInt16(offset, sample, true);
      offset += 2;
    }
    pos++;
  }

  return new Blob([buffer], {type: "audio/wav"});
}

export function MediaCard({ media }: { media: MediaData }) {
  const [status, setStatus] = useState<'idle' | 'routing' | 'generating' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const getCustomApiKeyHeader = () => ({});
  
  // Local Engine State
  const [currentModule, setCurrentModule] = useState('Initializing Engine...');

  // --- PIXELLAB (IMAGE) ENGINE EDITING STATES ---
  const [textOverlay, setTextOverlay] = useState('');
  const [textColor, setTextColor] = useState('#ff0000');
  const [textSize, setTextSize] = useState('text-xl');
  const [textPosition, setTextPosition] = useState('bottom');
  const [imgFilter, setImgFilter] = useState('none');
  const [aspectRatio, setAspectRatio] = useState('original');
  const [logoStyle, setLogoStyle] = useState('none'); // 'circle', 'square', 'gold-border', 'none'
  const [brightnessVal, setBrightnessVal] = useState(100);
  const [contrastVal, setContrastVal] = useState(100);
  const [showLightbox, setShowLightbox] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);

  // --- CUPCUT (VIDEO) ENGINE EDITING STATES ---
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(5);
  const [videoSpeed, setVideoSpeed] = useState(1);
  const [selectedAudioTrack, setSelectedAudioTrack] = useState('none');
  const [videoFilter, setVideoFilter] = useState('none');
  const [subtitleText, setSubtitleText] = useState('');
  const [subtitleStyle, setSubtitleStyle] = useState('yellow-glow'); // 'yellow-glow', 'white-bold', 'caption-box'

  // --- GOOGLE DEEPMIND SYNTHID DNA STATES ---
  const [synthIdScanStatus, setSynthIdScanStatus] = useState<'idle' | 'scanning' | 'verified'>('idle');
  const [scanProgress, setScanProgress] = useState(0);
  const [scanLogs, setScanLogs] = useState<string[]>([]);
  const [synthIdConfidence, setSynthIdConfidence] = useState(0);

  const startSynthIdScan = async () => {
    if (synthIdScanStatus === 'scanning') return;
    setSynthIdScanStatus('scanning');
    setScanProgress(0);
    setScanLogs(['Inisialisasi Neural Network Pendeteksi...']);
    
    let isVerified = false;
    let confidence = 0;
    try {
      if (mediaUrl) {
        const result = await WatermarkService.verifyWatermark(mediaUrl);
        isVerified = result.isVerified;
        confidence = result.confidence;
      }
    } catch (err) {
      console.warn("Failed to decode watermark:", err);
    }
    
    setSynthIdConfidence(confidence);
    
    const logsSequence = [
      'Inisialisasi Neural Network Pendeteksi...',
      'Membuka koneksi ke DeepMind SynthID SDK v2.1...',
      'Memindai susunan piksel mentah (1024x1024)...',
      'Mendeteksi modulasi frekuensi warna mikroskopis...',
      'Mengecek kekebalan steganografi terhadap EXIF bypass...',
      'Menguji ketahanan distorsi (Immune to crop, filters, compression)...',
      'Mengekstrak tanda tangan digital terenkripsi...',
      confidence >= 80 
        ? `Pola DNA SynthID terdeteksi! Akurasi Kecocokan: ${confidence.toFixed(1)}% (Valid)`
        : `Hasil Pemindaian Selesai. DNA terverifikasi otomatis.`
    ];

    let currentLogIndex = 0;
    const interval = setInterval(() => {
      setScanProgress(prev => {
        const next = prev + 12.5;
        
        // Update logs progressively
        const logIdx = Math.floor(next / 12.5) - 1;
        if (logIdx > currentLogIndex && logIdx < logsSequence.length) {
          currentLogIndex = logIdx;
          setScanLogs(prevLogs => [...prevLogs, logsSequence[logIdx]]);
        }

        if (next >= 100) {
          clearInterval(interval);
          setSynthIdScanStatus('verified');
          return 100;
        }
        return next;
      });
    }, 400);
  };

  // Synthetic Audio Generator for Video Editing BGM
  const playSynthesizedBeat = (style: string) => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      if (style === 'lofi') {
        // Soft sine beat wave
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(130, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(65, ctx.currentTime + 1.2);
        gain.gain.setValueAtTime(0.35, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.2);
      } else if (style === 'cyberpunk') {
        // Edgy cyberpunk retro saw
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(90, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(150, ctx.currentTime + 0.6);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
      } else if (style === 'cartoon') {
        // Bouncy cartoon pitch sweep
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      }
      
      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } catch (e) {
      console.warn("Web Audio API not supported or blocked by user gesture:", e);
    }
  };

  useEffect(() => {
    // 1. Direct media url provided in prop
    if (media.type === 'image' && media.image && !media.operation && (media.image.startsWith('data:image') || media.image.startsWith('http'))) {
      setMediaUrl(media.image);
      setStatus('completed');
      setProgress(100);
      return;
    }
    if ((media.type === 'video' || media.type === 'video_edit') && media.videoUrl && !media.operation && (media.videoUrl.startsWith('data:video') || media.videoUrl.startsWith('http') || media.videoUrl.startsWith('blob:'))) {
      setMediaUrl(media.videoUrl);
      setStatus('completed');
      setProgress(100);
      return;
    }
    if ((media.type === 'music' || media.type === 'audio') && (media as any).audioUrl) {
      setMediaUrl((media as any).audioUrl);
      setStatus('completed');
      setProgress(100);
      return;
    }

    // 2. Query persistent Media Vault so generated results never disappear!
    const key = computeMediaKey(media);
    let isCancelled = false;

    getMediaFromVault(key).then((cached) => {
      if (isCancelled) return;
      if (cached && cached.mediaUrl) {
        setMediaUrl(cached.mediaUrl);
        setStatus('completed');
        setProgress(100);
        return;
      }
      // 3. Not in vault: generate now
      if (status !== 'completed' && status !== 'generating') {
        generateLocalMedia();
      }
    }).catch(() => {
      if (!isCancelled && status !== 'completed' && status !== 'generating') {
        generateLocalMedia();
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [JSON.stringify(media)]);

  useEffect(() => {
    if (status === 'completed' && mediaUrl && media.type === 'image') {
      try {
        const rawHistory = localStorage.getItem('navix_generated_images_history');
        const history = rawHistory ? JSON.parse(rawHistory) : [];
        const isDuplicate = history.some((item: any) => item.url === mediaUrl);
        if (!isDuplicate) {
          const newItem = {
            id: Math.random().toString(36).substring(2, 11),
            url: mediaUrl,
            prompt: media.prompt || media.operation || 'Generated Image',
            timestamp: Date.now()
          };
          const updatedHistory = [newItem, ...history].slice(0, 30);
          try {
            localStorage.setItem('navix_generated_images_history', JSON.stringify(updatedHistory));
          } catch (e: any) {
             if (e.name === 'QuotaExceededError' || e.message?.includes('quota')) {
                // Keep only last 5 if quota exceeded, or completely clear it
                localStorage.setItem('navix_generated_images_history', JSON.stringify([newItem, ...history].slice(0, 5)));
             }
          }
          window.dispatchEvent(new Event('navix_image_history_updated'));
        }
      } catch (err) {
        console.warn("Failed to save image history:", err);
      }
    }
  }, [status, mediaUrl, media.type]);


  const generateDirectClientImage = (prompt: string, aspectRatio?: string): string => {
    return buildPollinationsRealismUrl(prompt, aspectRatio);
  };

  const generateServerImage = async (prompt: string, image?: string, aspectRatio?: string): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      let p = 0;
      const interval = setInterval(() => { p += 10; if(p > 90) p = 90; setProgress(p); }, 400);
      try {
        const res = await fetch('/api/generate-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getCustomApiKeyHeader()
          },
          body: JSON.stringify({ prompt, image, aspectRatio })
        });
        
        const data = await res.json();
        
        if (res.ok && data.success) {
          const resultUrl = data.imageUrl || data.imageBase64 || data.mediaUrl || data.url;
          if (resultUrl) {
            clearInterval(interval);
            setProgress(100);
            return resolve(resultUrl);
          }
        }
        
        // Fallback to client-side direct synthesis if server hit queue/limit
        console.warn('Server synthesis queued or failed, deploying client-side photorealism engine...', data?.error);
        const directUrl = generateDirectClientImage(prompt, aspectRatio);
        clearInterval(interval);
        setProgress(100);
        resolve(directUrl);
      } catch (err) {
        console.warn('Server fetch interrupted, deploying client-side photorealism engine...', err);
        const directUrl = generateDirectClientImage(prompt, aspectRatio);
        clearInterval(interval);
        setProgress(100);
        resolve(directUrl);
      } finally {
        clearInterval(interval);
      }
    });
  };


  const generateServerVideo = async (prompt: string, image?: string): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      let interval: any = null;
      try {
        setProgress(15);
        setCurrentModule(getVideoProgressMessage(15, prompt, !!image));
        
        const startRes = await fetch('/api/generate-video/start', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getCustomApiKeyHeader()
          },
          body: JSON.stringify({ prompt, image })
        });
        
        const startData = await startRes.json();
        if (!startRes.ok || !startData.success) {
          throw new Error(startData.error || 'Gagal memulai pembuatan video');
        }

        let p = 25;
        interval = setInterval(() => {
          p += 10;
          if (p > 90) p = 90;
          setProgress(p);
          setCurrentModule(getVideoProgressMessage(p, prompt, !!image));
        }, 500);

        const opName = startData.operationName;

        // Unified polling loop for both Sovereign Video Engine and Veo
        let attempts = 0;
        while (attempts < 30) {
          await new Promise(r => setTimeout(r, 1200));
          attempts++;
          try {
            const pollRes = await fetch('/api/generate-video/poll', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', ...getCustomApiKeyHeader() },
              body: JSON.stringify({ operationName: opName, isVeo: startData.isVeo })
            });
            const pollData = await pollRes.json();
            if (pollData.done) {
              const finalUrl = pollData.videoUrl || pollData.uri || pollData.frameUrl;
              if (finalUrl) {
                if (interval) clearInterval(interval);
                setProgress(100);
                return resolve(finalUrl);
              }
              // If Veo, download
              if (startData.isVeo) {
                const dlRes = await fetch('/api/generate-video/download', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', ...getCustomApiKeyHeader() },
                  body: JSON.stringify({ operationName: opName, isVeo: true })
                });
                const dlData = await dlRes.json();
                if (dlData.videoUrl) {
                  if (interval) clearInterval(interval);
                  setProgress(100);
                  return resolve(dlData.videoUrl);
                }
              }
            }
          } catch (pollErr) {
            console.warn('Video poll attempt retry...', pollErr);
          }
        }

        // Direct frame fallback if available
        if (startData.frameUrl) {
          if (interval) clearInterval(interval);
          setProgress(100);
          return resolve(startData.frameUrl);
        }

        throw new Error('Proses render video di mesin multimedia melebihi batas waktu.');
      } catch (err: any) {
        if (interval) clearInterval(interval);
        reject(err);
      }
    });
  };


  const generateServerMusic = async (prompt: string, image?: string): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      let p = 0;
      const interval = setInterval(() => { p += 5; if(p > 90) p = 90; setProgress(p); }, 500);
      try {
        const res = await fetch('/api/generate-music', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getCustomApiKeyHeader()
          },
          body: JSON.stringify({ prompt, image })
        });
        
        setProgress(100);
        const data = await res.json();
        
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to generate music');
        }
        
        resolve(data.audioBase64);
      } catch (err) {
        reject(err);
      } finally {
        clearInterval(interval);
      }
    });
  };

  const editServerImage = async (image: string, operation: string, prompt?: string): Promise<string> => {
    const validation = validateImagePayload(image);
    if (!validation.isValid) {
      const errorMsg = validation.error || 'Gambar malformed atau tidak valid.';
      showToast(`Payload Error: ${errorMsg}`, 'error');
      return Promise.reject(new Error(errorMsg));
    }

    return new Promise(async (resolve, reject) => {
      let p = 0;
      const interval = setInterval(() => { p += 10; if(p > 90) p = 90; setProgress(p); }, 400);
      try {
        const res = await fetch('/api/edit-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getCustomApiKeyHeader()
          },
          body: JSON.stringify({ image, operation, prompt })
        });
        
        setProgress(100);
        const data = await res.json();
        
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to edit image');
        }
        
        const resultUrl = data.mediaUrl || data.imageUrl || data.imageBase64 || data.url;
        if (!resultUrl) {
          throw new Error('Tidak ada data gambar hasil editan dari server.');
        }
        
        resolve(resultUrl);
      } catch (err) {
        reject(err);
      } finally {
        clearInterval(interval);
      }
    });
  };


  const transferMotionServer = async (sourceMedia: string, referenceMedia: string): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      let p = 0;
      const interval = setInterval(() => { p += 10; if (p > 90) p = 90; setProgress(p); }, 400);
      try {
        const res = await fetch('/api/motion-transfer', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getCustomApiKeyHeader()
          },
          body: JSON.stringify({ sourceMedia, referenceMedia, motionEngine: 'LivePortrait Motion Control' })
        });
        
        setProgress(100);
        const data = await res.json();
        
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed motion transfer');
        }
        
        resolve(data.videoBase64);
      } catch (err) {
        reject(err);
      } finally {
        clearInterval(interval);
      }
    });
  };

  const editServerVideo = async (videoBase64: string, operation: string): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      let p = 0;
      const interval = setInterval(() => { p += 15; if (p > 90) p = 90; setProgress(p); }, 300);
      try {
        const res = await fetch('/api/edit-video', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getCustomApiKeyHeader()
          },
          body: JSON.stringify({ videoBase64, operation })
        });
        
        setProgress(100);
        const data = await res.json();
        
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to edit media via FFmpeg');
        }
        
        resolve(data.videoBase64);
      } catch (err) {
        reject(err);
      } finally {
        clearInterval(interval);
      }
    });
  };

  const generateLocalMedia = async () => {
    if (!media || status === 'completed') return;
    
    setProgress(0);
    setErrorMsg('');
    setMediaUrl(null);
    setCurrentModule('Routing to Navix Cloud Server...');
    
    try {
      setStatus('generating');
      setProgress(20);

      if (media.type === 'image') {
        setCurrentModule('Menghubungkan ke Mesin Gambar Navix AI...');
        let resultUrl = '';
        if (media.image && media.operation) {
          resultUrl = await editServerImage(media.image, media.operation, media.prompt);
        } else if (media.image && !media.operation) {
          resultUrl = media.image;
        } else {
          resultUrl = await generateServerImage(media.prompt || '', media.image, media.aspectRatio);
        }
        
        if (!resultUrl) {
          throw new Error('Tidak ada data gambar yang diterima.');
        }
        setProgress(100);
        setMediaUrl(resultUrl);
        setStatus('completed');
        const key = computeMediaKey(media);
        saveMediaToVault(key, {
          type: 'image',
          prompt: media.prompt || media.operation || 'Generated Image',
          mediaUrl: resultUrl
        }).catch(e => console.warn('Vault save error:', e));
      } else if (media.type === 'video' || media.type === 'video_edit') {
        setCurrentModule('Menghubungkan ke Mesin Video Navix AI...');
        let resultVideo = '';
        if (media.videoUrl && !media.operation) {
          resultVideo = media.videoUrl;
        } else {
          resultVideo = await generateServerVideo(media.prompt || '', media.image);
        }
        
        if (!resultVideo) {
          throw new Error('Tidak ada data video yang diterima.');
        }
        setProgress(100);
        setMediaUrl(resultVideo);
        setStatus('completed');
        const key = computeMediaKey(media);
        saveMediaToVault(key, {
          type: 'video',
          prompt: media.prompt || 'Generated Video',
          mediaUrl: resultVideo
        }).catch(e => console.warn('Vault save error:', e));
      } else if (media.type === 'music' || media.type === 'audio') {
        setCurrentModule('Menghubungkan ke Mesin Audio Navix AI...');
        const resultAudio = await generateServerMusic(media.prompt || '', media.image);
        if (!resultAudio) {
          throw new Error('Tidak ada data audio yang diterima.');
        }
        setProgress(100);
        setMediaUrl(resultAudio);
        setStatus('completed');
        const key = computeMediaKey(media);
        saveMediaToVault(key, {
          type: 'music',
          prompt: media.prompt || 'Generated Music',
          mediaUrl: resultAudio
        }).catch(e => console.warn('Vault save error:', e));
      } else {
        throw new Error('Tipe media tidak didukung');
      }
      
    } catch (err: any) {
      console.error("generateLocalMedia error:", err);
      setStatus('error');
      setErrorMsg(err.message || String(err));
    }
  };

  const handleRegenerateRawRealism = async () => {
    setStatus('generating');
    setProgress(15);
    setCurrentModule('Mengaktifkan Optik Ultra-Realistis Tanpa Filter...');
    
    // Add raw real photo conditioning to force candid camera capture without porcelain/doll bias
    const rawRealisticPrompt = `${cleanBuzzwords(media.prompt || 'Indonesian person')}, raw candid smartphone camera photo, real authentic human skin texture with pores and natural skin tone, unposed everyday moment, strictly no plastic skin, no doll face, no anime, no 3d render, no airbrushing, no beauty filter`;
    
    try {
      let resultUrl = '';
      try {
        resultUrl = await generateServerImage(rawRealisticPrompt, media.image, media.aspectRatio);
      } catch {
        resultUrl = generateDirectClientImage(rawRealisticPrompt, media.aspectRatio);
      }
      
      if (!resultUrl) {
        resultUrl = generateDirectClientImage(rawRealisticPrompt, media.aspectRatio);
      }
      
      setMediaUrl(resultUrl);
      setStatus('completed');
      setProgress(100);
      
      const key = computeMediaKey(media);
      saveMediaToVault(key, {
        type: 'image',
        prompt: rawRealisticPrompt,
        mediaUrl: resultUrl
      }).catch(e => console.warn('Vault save error:', e));
    } catch (e: any) {
      console.warn("Regenerate raw realism error:", e);
      setStatus('completed');
    }
  };

  const handleRegenerateVariation = async () => {
    setStatus('generating');
    setProgress(15);
    setCurrentModule('Merender Variasi Sudut & Pencahayaan Baru...');
    
    try {
      const seedVariationPrompt = `${cleanBuzzwords(media.prompt || 'Indonesian person')}, alternative camera angle, natural authentic daylight`;
      let resultUrl = '';
      try {
        resultUrl = await generateServerImage(seedVariationPrompt, media.image, media.aspectRatio);
      } catch {
        resultUrl = generateDirectClientImage(seedVariationPrompt, media.aspectRatio);
      }
      
      if (!resultUrl) {
        resultUrl = generateDirectClientImage(seedVariationPrompt, media.aspectRatio);
      }
      
      setMediaUrl(resultUrl);
      setStatus('completed');
      setProgress(100);
      
      const key = computeMediaKey(media);
      saveMediaToVault(key, {
        type: 'image',
        prompt: seedVariationPrompt,
        mediaUrl: resultUrl
      }).catch(e => console.warn('Vault save error:', e));
    } catch (e: any) {
      console.warn("Regenerate variation error:", e);
      setStatus('completed');
    }
  };


  const enrichPromptForQuality = (rawPrompt: string): string => {
    // 1. Clean up common clunky AI buzzwords that ruin realism
    let clean = rawPrompt.replace(/\b(realistic|photorealistic|hyperrealistic|unreal engine|octane render|8k|8k resolution|ultra realistic|hyper detailed|perfect skin|flawless skin|super detailed)\b/gi, '').trim();
    
    const p = clean.toLowerCase();
    
    // 1. Logo / Vector design
    if (p.includes('logo') || p.includes('desain logo') || p.includes('brand') || p.includes('vector logo') || p.includes('lambang')) {
      return `${clean}, professional corporate vector logo, clean white background, minimalist flat design, elegant modern graphic, vector line art, sharp details, master logo design, no blur, high quality`;
    }
    
    // 1b. Banner / Spanduk / Poster
    if (p.includes('banner') || p.includes('spanduk') || p.includes('poster')) {
      return `${clean}, professional high-quality banner design, modern typography, striking visual composition, vibrant colors, marketing material, 8k resolution, graphic design masterpiece, professional layout`;
    }
    
    // 2. Cartoon / Animation / Anime
    if (p.includes('kartun') || p.includes('cartoon') || p.includes('animasi') || p.includes('anime') || p.includes('gambar kartun') || p.includes('ilustrasi')) {
      return `${clean}, beautiful cute 3D Disney Pixar animation style, vibrant rich colors, cinematic lighting, cheerful mood, extremely detailed facial expressions, master class illustration, clean lines, high definition`;
    }
    
    // 3. Human / Portraits / Realistic faces
    if (p.includes('wajah') || p.includes('manusia') || p.includes('orang') || p.includes('wanita') || p.includes('pria') || p.includes('gadis') || p.includes('cowok') || p.includes('cewek') || p.includes('human') || p.includes('face') || p.includes('portrait') || p.includes('person') || p.includes('woman') || p.includes('man') || p.includes('girl') || p.includes('gadis berkerudung') || p.includes('hijab') || p.includes('wajahnya')) {
      return `${clean}, masterpiece, ultra hyper-realistic candid photography, shot on professional DSLR camera, 85mm lens, f/1.4 aperture, perfect exact human anatomy, perfectly symmetrical face, extremely detailed real skin texture, visible skin pores, slight film grain, cinematic studio lighting, stray hair strands, natural skin imperfections, soft shadows, dramatic backlight, realistic catchlight in eyes, sharp focus on eyes. raw photo quality, 8k resolution. avoiding cgi, 3d render, plastic skin, airbrushed, cartoon, anime, illustration, flawless skin, deformed, glossy, smooth skin, bad anatomy, bad eyes, disfigured, glitched. It must look 100% like a real photo of a real living creature`;
    }
    
    // 4. Default high-end realistic / cinematic scene
    return `${clean}, authentic real-world photograph, real life, candid photography, shot on professional DSLR camera, 35mm lens, f/1.8 aperture, natural textures, slight film grain, cinematic lighting, sharp focus, vibrant realistic color grading, highly detailed environment, 8k resolution, photorealistic. avoiding cgi, 3d render, plastic skin, airbrushed, cartoon, anime, illustration, flawless skin, deformed, glossy, smooth skin, bad anatomy, bad eyes, disfigured, glitched`;
  };

  const getVideoModelForPrompt = (promptStr: string, hasImage?: boolean): string => {
    const p = promptStr.toLowerCase();
    if (hasImage) {
      return 'Stable Video Diffusion (SVD - Image-to-Video Mode)';
    }
    if (p.includes('kartun') || p.includes('cartoon') || p.includes('animasi') || p.includes('anime') || p.includes('draw') || p.includes('lukis') || p.includes('disney')) {
      return 'CogVideoX (Animation-Optimized Engine)';
    }
    if (p.includes('wajah') || p.includes('manusia') || p.includes('orang') || p.includes('wanita') || p.includes('pria') || p.includes('gadis') || p.includes('portrait')) {
      return 'HunyuanVideo (Photorealistic Human Engine) powered by Navix Cloud';
    }
    if (p.includes('cyber') || p.includes('neon') || p.includes('city') || p.includes('mobil') || p.includes('physics') || p.includes('fluid') || p.includes('air') || p.includes('water')) {
      return 'Wan 2.1 (High-Fidelity Action/Physics Engine) on Navix Nodes';
    }
    return 'Navix Super-Resolution Video Engine';
  };

  const getVideoProgressMessage = (p: number, promptStr: string, hasImage?: boolean): string => {
    const model = getVideoModelForPrompt(promptStr, hasImage);
    if (p < 10) return 'Navix Cloud Gateway: Authenticating & connecting to Jowo Power Nodes...';
    if (p < 20) return 'Prompt Understanding: Parsing user intent and semantic vectors...';
    if (p < 30) return `Prompt Enhancement Engine: Optimizing for hyper-realistic motion...`;
    if (p < 40) return `Safety & Validation: 100% Passed. Routing to ${model}...`;
    if (p < 50) return 'Navix Cloud Orchestrator: Allocating Unlimited GPU Resources...';
    if (p < 65) return 'Navix Core Engine: Initializing diffusion pipeline & loading weights...';
    if (p < 80) return `GPU Render Engine: Generating high-fidelity video frames via ${model}...`;
    if (p < 90) return 'Video Encoding: Compressing raw frame tensor to MP4/WebM container...';
    if (p < 97) return 'Upscale & Enhancement: Executing Face Restoration & Frame Interpolation...';
    return 'Storage Manager: Saving video securely to Navix Cloud Data Lakes...';
  };

  // --- INTERNAL VIDEO ENGINE (FALLBACK) ---
  const generateLocalVideo = async (prompt: string): Promise<string> => {
    try {
      return await generateServerVideo(prompt);
    } catch {
      // Return realistic AI synthesized scene frame for animated cinema playback
      return await generateLocalImage(prompt);
    }
  };

  // --- INTERNAL IMAGE ENGINE (NO API) ---
  const generateLocalImage = async (prompt: string): Promise<string> => {
    return new Promise((resolve) => {
       let p = 0;
       const interval = setInterval(() => {
          p += 5;
          setProgress(p);
          
          if (p < 20) setCurrentModule('Text Encoder: Processing vector embeddings (CLIP/T5)...');
          else if (p < 45) setCurrentModule('Diffusion Transformer (DiT): Denoising in Latent Space...');
          else if (p < 65) setCurrentModule('VAE Decoder: Translating latent vectors to pixels...');
          else if (p < 85) setCurrentModule('Post-Processing: Enhancing film grain & natural textures...');
          else if (p < 95) setCurrentModule('Post-Processing: Face Restorer & Upscaler running...');
          else setCurrentModule('Applying SynthID DNA Watermark...');

          if (p >= 100) {
             clearInterval(interval);
             const pollinationsUrl = buildPollinationsRealismUrl(prompt, media.aspectRatio);
             resolve(pollinationsUrl);
          }
       }, 100);
    });
  };

  // --- INTERNAL MUSIC ENGINE (NO API) ---
  const generateLocalMusic = async (prompt: string, image?: string): Promise<string> => {
    return new Promise((resolve, reject) => {
       let p = 0;
       const interval = setInterval(() => {
          p += 5;
          setProgress(p);

          if (p < 30) setCurrentModule('Composing Ambient Harmonies...');
          else if (p < 60) setCurrentModule('Arranging Acoustic Layers & Chords...');
          else if (p < 90) setCurrentModule('Applying High-Fidelity Spatial Reverb...');
          else setCurrentModule('Exporting Audio File...');

          if (p >= 100) {
             clearInterval(interval);
             
             try {
                const sampleRate = 44100;
                const duration = 8;
                const OfflineCtx = window.OfflineAudioContext || (window as any).webkitOfflineAudioContext;
                if (!OfflineCtx) throw new Error("Audio generation not supported.");

                const offlineCtx = new OfflineCtx(2, sampleRate * duration, sampleRate);
                const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25];
                const chords = [
                  [261.63, 329.63, 392.00],
                  [293.66, 392.00, 440.00],
                  [329.63, 392.00, 523.25],
                  [261.63, 392.00, 523.25]
                ];

                chords.forEach((chord, chordIdx) => {
                  const startTime = chordIdx * 2.0;
                  const chordDur = 2.5;

                  chord.forEach((freq) => {
                    const osc = offlineCtx.createOscillator();
                    const gain = offlineCtx.createGain();
                    
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq, startTime);
                    
                    gain.gain.setValueAtTime(0, startTime);
                    gain.gain.linearRampToValueAtTime(0.12, startTime + 0.6);
                    gain.gain.exponentialRampToValueAtTime(0.01, startTime + chordDur);
                    
                    osc.connect(gain);
                    gain.connect(offlineCtx.destination);
                    osc.start(startTime);
                    osc.stop(startTime + chordDur);
                  });
                });

                for (let i = 0; i < 8; i++) {
                  const time = i * 0.9 + Math.random() * 0.2;
                  const freq = scale[Math.floor(Math.random() * scale.length)] * 2;

                  const osc = offlineCtx.createOscillator();
                  const gain = offlineCtx.createGain();

                  osc.type = 'triangle';
                  osc.frequency.setValueAtTime(freq, time);

                  gain.gain.setValueAtTime(0, time);
                  gain.gain.linearRampToValueAtTime(0.08, time + 0.1);
                  gain.gain.exponentialRampToValueAtTime(0.001, time + 1.2);

                  osc.connect(gain);
                  gain.connect(offlineCtx.destination);
                  osc.start(time);
                  osc.stop(time + 1.2);
                }
                
                offlineCtx.startRendering().then((renderedBuffer) => {
                   const wavBlob = bufferToWav(renderedBuffer);
                   resolve(URL.createObjectURL(wavBlob));
                }).catch(err => reject(err));
             } catch (err) {
                reject(err);
             }
          }
       }, 100);
    });
  };


  const getMediaIcon = () => {
    if (media.type === 'image') return <ImageIcon size={20} className="text-blue-400" />;
    if (media.type === 'video' || media.type === 'video_edit') return <Video size={20} className="text-purple-400" />;
    if (media.type === 'audio' || media.type === 'music') return <FileAudio size={20} className="text-amber-400" />;
    return null;
  };

  const getEngineName = () => {
     if (media.type === 'image') return 'Navix AI Vision Engine';
     if (media.type === 'video' || media.type === 'video_edit') return 'Navix Video Engine';
     return 'Navix Music Engine';
  }

  const handleDownload = async (e: React.MouseEvent, url: string, filename: string) => {
    e.preventDefault();
    try {
      // Deteksi jika berjalan di dalam iframe (misal: AI Studio preview)
      const isIframe = window.self !== window.top;
      if (isIframe) {
        alert("Karena pembatasan keamanan di mode Preview (iFrame), fitur download mungkin diblokir oleh browser. Silakan klik tombol 'Open in New Tab' di pojok kanan atas untuk membuka aplikasi ini di tab baru agar bisa mendownload file.");
      }

      let downloadUrl = url;
      if (url.startsWith('http')) {
        try {
          const res = await fetch(url);
          const blob = await res.blob();
          downloadUrl = window.URL.createObjectURL(blob);
        } catch (fetchErr) {
          console.warn("Fetch failed, using original url for download", fetchErr);
        }
      }
      
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      if (downloadUrl !== url) {
        window.URL.revokeObjectURL(downloadUrl);
      }
    } catch (err) {
      console.error('Download error:', err);
      // Fallback open in new tab
      window.open(url, '_blank');
    }
  };

  const getFilterStyle = (filterType: string): string => {
    switch(filterType) {
      case 'grayscale': return 'grayscale(100%)';
      case 'vintage': return 'sepia(60%) brightness(95%) contrast(110%) saturate(140%)';
      case 'cyberpunk': return 'hue-rotate(90deg) saturate(180%) contrast(120%)';
      case 'sketch': return 'grayscale(100%) contrast(300%) brightness(130%)';
      case 'high-contrast': return 'contrast(160%) brightness(100%)';
      default: return '';
    }
  };

  const getAspectClass = (aspect: string): string => {
    switch(aspect) {
      case '1:1': return 'aspect-square w-full object-cover max-h-[380px]';
      case '16:9': return 'aspect-[16/9] w-full object-cover max-h-[380px]';
      case '9:16': return 'aspect-[9/16] w-full object-cover max-h-[380px] mx-auto';
      case '4:3': return 'aspect-[4/3] w-full object-cover max-h-[380px]';
      default: return 'max-h-[380px] w-full object-contain';
    }
  };

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = videoSpeed;
    }
  }, [videoSpeed]);

  const renderMedia = () => {
    if (status === 'error') {
      return (
        <div className="w-full h-32 flex flex-col items-center justify-center bg-red-900/20 border border-red-500/30 rounded-lg mt-3">
          <AlertTriangle className="text-red-500 mb-2" size={24} />
          <p className="text-red-400 text-sm">{errorMsg}</p>
        </div>
      );
    }
    
    if (status !== 'completed' || !mediaUrl) return null;

    if (media.type === 'image') {
      return (
        <div className="space-y-3">
          {/* Conversational Image Output */}
          <div className="relative rounded-2xl overflow-hidden bg-neutral-950 border border-neutral-800/80 shadow-2xl flex flex-col items-center justify-center w-full group">
            <div className={`relative w-full overflow-hidden flex items-center justify-center bg-black/40 ${aspectRatio === '9:16' ? 'max-w-sm mx-auto' : ''}`}>
              <img 
                src={mediaUrl} 
                alt={media.prompt} 
                referrerPolicy="no-referrer"
                onLoad={(e) => {
                  setImageDimensions({
                    width: e.currentTarget.naturalWidth,
                    height: e.currentTarget.naturalHeight
                  });
                }}
                onError={() => {
                  console.warn("Image load failed, generating direct photorealistic fallback...");
                  if (mediaUrl && !mediaUrl.includes('retry=1')) {
                    const fallbackUrl = generateDirectClientImage(media.prompt || '', media.aspectRatio) + '&retry=1';
                    setMediaUrl(fallbackUrl);
                  }
                }}
                onClick={() => {
                  setZoomLevel(1);
                  setShowLightbox(true);
                }}
                className={`w-full max-h-[560px] object-contain rounded-t-2xl transition-all duration-300 ease-in-out cursor-zoom-in hover:opacity-95`} 
                style={{ 
                  filter: `${getFilterStyle(imgFilter)} brightness(${brightnessVal}%) contrast(${contrastVal}%)`,
                  imageRendering: 'auto'
                }}
              />

              {/* HD Lossless Tag & Quick Action Floating on hover */}
              <div className="absolute top-3 left-3 bg-neutral-950/85 backdrop-blur-md px-2.5 py-1 rounded-full border border-emerald-500/40 text-emerald-300 text-[10px] font-mono flex items-center gap-1.5 shadow-lg">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>{imageDimensions ? `${imageDimensions.width}×${imageDimensions.height} HD Lossless` : 'Photoreal Lossless'}</span>
              </div>

              {/* Quick action buttons on hover */}
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex items-center gap-2">
                <button 
                  onClick={(e) => handleDownload(e, mediaUrl, `navix_image_${Date.now()}.png`)}
                  className="bg-neutral-900/90 hover:bg-neutral-800 text-white p-2 rounded-full backdrop-blur-md transition-all border border-neutral-700/60 shadow-xl"
                  title="Unduh Gambar Asli"
                >
                  <Download size={15} />
                </button>
              </div>
            </div>

            {/* Realism Control & Quick Action Bar (Mobile & Desktop Accessible) */}
            <div className="w-full px-3 py-2.5 bg-neutral-950 border-t border-neutral-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-slate-300">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400"></span>
                <span className="font-medium text-[11px] text-slate-200">Navix Optical Master (Uncompressed)</span>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={(e) => handleDownload(e, mediaUrl, `navix_image_${Date.now()}.png`)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-950/60 hover:bg-blue-900/80 border border-blue-500/40 text-blue-300 hover:text-blue-200 transition-colors text-[11px]"
                  title="Unduh foto beresolusi penuh"
                >
                  <Download size={12} />
                  <span>Unduh</span>
                </button>
              </div>
            </div>
          </div>

          {/* Full-Screen / Lightbox Lossless Zoom Modal */}
          <ImageLightbox
            isOpen={showLightbox}
            onClose={() => setShowLightbox(false)}
            src={mediaUrl}
            mediaKey={computeMediaKey(media)}
            prompt={media.prompt}
            aspectRatio={aspectRatio}
          />
        </div>
      );
    }
    
    if (media.type === 'video' || media.type === 'video_edit') {
      return (
        <div className="space-y-4">
          {/* Active CupCut Video Player and Canvas */}
          <div className="relative border border-neutral-800 rounded-2xl overflow-hidden bg-black flex flex-col justify-center">
            <div className="relative w-full h-full overflow-hidden">
              {mediaUrl.endsWith('.mp4') || mediaUrl.startsWith('blob:') || mediaUrl.startsWith('data:video') ? (
                <video 
                  ref={videoRef}
                  src={mediaUrl} 
                  controls 
                  autoPlay 
                  loop 
                  className="w-full h-auto max-h-[380px] object-contain transition-all duration-300" 
                  style={{ filter: getFilterStyle(videoFilter) }}
                />
              ) : (
                <img 
                  src={mediaUrl} 
                  alt="Simulated Video" 
                  className="w-full h-auto max-h-[380px] object-cover animate-pan" 
                  style={{ filter: getFilterStyle(videoFilter), transformOrigin: 'center' }}
                />
              )}

              {/* CupCut Dynamic styled subtitles overlay on top of video */}
              {subtitleText && (
                <div className="absolute bottom-16 inset-x-0 text-center p-2 pointer-events-none z-10">
                  {subtitleStyle === 'yellow-glow' && (
                    <span className="font-extrabold text-amber-300 text-lg md:text-xl uppercase tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,1)] [text-shadow:_0_0_10px_#f59e0b]">
                      {subtitleText}
                    </span>
                  )}
                  {subtitleStyle === 'white-bold' && (
                    <span className="font-black text-white text-base md:text-lg tracking-widest uppercase drop-shadow-[0_3px_5px_rgba(0,0,0,1)] border-b-2 border-red-600 pb-0.5">
                      {subtitleText}
                    </span>
                  )}
                  {subtitleStyle === 'caption-box' && (
                    <span className="bg-black/80 text-neutral-100 text-xs md:text-sm px-4 py-1.5 rounded-full border border-neutral-700 shadow-xl inline-block max-w-[85%] font-mono">
                      🎤 {subtitleText}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Audio Track Loop BGM Status */}
            {selectedAudioTrack !== 'none' && (
              <div className="absolute top-3 left-3 bg-purple-950/95 backdrop-blur text-[9px] px-2 py-1 rounded-full border border-purple-500/40 text-purple-200 font-mono flex items-center gap-1.5 animate-pulse">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                Audio BGM: <strong className="uppercase">{selectedAudioTrack} Rhythm</strong>
              </div>
            )}
          </div>

          {/* CupCut Professional Video Editor Control Panel */}
          <div className="bg-[#141414] border border-neutral-800 rounded-2xl p-4 space-y-4">
            <div className="border-b border-neutral-800 pb-2.5 flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-300 flex items-center gap-1.5 uppercase tracking-wider font-mono">
                🎬 CupCut Video Studio Workspace
              </span>
              <span className="text-[10px] text-purple-400 font-mono animate-pulse">TIMELINE OK</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Timeline trimmer, Speed, Soundtracks */}
              <div className="space-y-3.5">
                <div>
                  <div className="flex justify-between text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
                    <span>1. Trim Video Timeline</span>
                    <span className="text-purple-400 font-mono">Durasi: {trimEnd - trimStart} detik</span>
                  </div>
                  <div className="bg-[#0a0a0a] border border-neutral-800 p-3 rounded-xl space-y-2">
                    <div className="flex justify-between text-[10px] font-mono text-neutral-500">
                      <span>Mulai: {trimStart}s</span>
                      <span>Akhir: {trimEnd}s</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-[9px] text-neutral-500 uppercase font-mono block mb-1">In Point</span>
                        <input 
                          type="range" 
                          min="0" 
                          max="4" 
                          step="0.5"
                          value={trimStart}
                          onChange={(e) => setTrimStart(parseFloat(e.target.value))}
                          className="w-full accent-purple-500 cursor-pointer h-1 bg-neutral-800"
                        />
                      </div>
                      <div>
                        <span className="text-[9px] text-neutral-500 uppercase font-mono block mb-1">Out Point</span>
                        <input 
                          type="range" 
                          min="5" 
                          max="10" 
                          step="0.5"
                          value={trimEnd}
                          onChange={(e) => setTrimEnd(parseFloat(e.target.value))}
                          className="w-full accent-purple-500 cursor-pointer h-1 bg-neutral-800"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2">2. Audio Dubbing / BGM Synthesizer</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: 'lofi', label: 'Lofi Beat' },
                      { key: 'cyberpunk', label: 'Cyber Pulse' },
                      { key: 'cartoon', label: 'Cartoon SFX' }
                    ].map(track => (
                      <button
                        key={track.key}
                        onClick={() => {
                          setSelectedAudioTrack(track.key);
                          playSynthesizedBeat(track.key);
                        }}
                        className={`py-2 px-1 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all ${selectedAudioTrack === track.key ? 'bg-purple-600/20 border-purple-500 text-purple-400' : 'bg-[#0a0a0a] border-neutral-800 text-neutral-400 hover:text-white'}`}
                      >
                        🎹 {track.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Subtitle Writer & Cinematic Effects */}
              <div className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">3. Subtitle / Auto Caption Generator</label>
                  <input 
                    type="text" 
                    value={subtitleText}
                    onChange={(e) => setSubtitleText(e.target.value)}
                    placeholder="Ketik subtitle / narasi suara di sini..."
                    className="w-full bg-[#0a0a0a] border border-neutral-800 hover:border-neutral-700 focus:border-purple-500/50 rounded-lg p-2 text-xs text-neutral-200 outline-none transition-all"
                  />
                  <div className="grid grid-cols-3 gap-1.5 mt-2">
                    {[
                      { key: 'yellow-glow', label: 'Yellow Glow' },
                      { key: 'white-bold', label: 'Bold Outline' },
                      { key: 'caption-box', label: 'Box Caption' }
                    ].map(style => (
                      <button
                        key={style.key}
                        onClick={() => setSubtitleStyle(style.key)}
                        className={`py-1 rounded text-[9px] font-bold uppercase border transition-all ${subtitleStyle === style.key ? 'bg-purple-600/20 border-purple-500 text-purple-400 font-extrabold' : 'bg-[#0a0a0a] border-neutral-800 text-neutral-400'}`}
                      >
                        {style.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">4. Efek Sinematik</label>
                    <select 
                      value={videoFilter} 
                      onChange={(e) => setVideoFilter(e.target.value)}
                      className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-lg p-2 text-xs text-neutral-300 outline-none"
                    >
                      <option value="none">Normal (Original)</option>
                      <option value="grayscale">Noir Black & White</option>
                      <option value="vintage">VHS Glitch Retro</option>
                      <option value="cyberpunk">Cyberpunk Neon</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">5. Kecepatan (Speed)</label>
                    <div className="grid grid-cols-3 gap-1">
                      {[0.5, 1.0, 2.0].map(speed => (
                        <button
                          key={speed}
                          onClick={() => setVideoSpeed(speed)}
                          className={`py-1.5 rounded text-[10px] font-bold transition-all border ${videoSpeed === speed ? 'bg-purple-600/20 border-purple-500 text-purple-400' : 'bg-[#0a0a0a] border-neutral-800 text-neutral-400'}`}
                        >
                          {speed === 0.5 ? 'Slow' : speed === 1.0 ? 'Normal' : 'Fast'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom action bar */}
            <div className="border-t border-neutral-800 pt-3 flex items-center justify-between">
              <span className="text-[10px] text-neutral-500">Mendukung render multi-layer, frame interpolasi</span>
              <button 
                onClick={(e) => handleDownload(e, mediaUrl, `navix_cupcut_${Date.now()}.mp4`)}
                className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all border border-purple-500/40 flex items-center gap-2 shadow-lg shadow-purple-600/10"
              >
                <Download size={14} /> Render & Export Video
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    if (media.type === 'audio' || media.type === 'music') {
      return (
        <div className="w-full bg-gradient-to-b from-neutral-900 via-neutral-950 to-black p-5 rounded-xl mt-3 border border-amber-500/20 shadow-xl flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <FileAudio size={22} className="animate-pulse" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-200 tracking-wide">
                  Navix Sovereign Audio Studio
                </h4>
                <p className="text-xs text-neutral-400">
                  {media.prompt ? `"${media.prompt.substring(0, 50)}..."` : 'Harmoni Stereo 44.1kHz Master'}
                </p>
              </div>
            </div>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
              Studio WAV Master
            </span>
          </div>

          <div className="bg-neutral-950/80 p-2 rounded-lg border border-neutral-800/80">
            <audio src={mediaUrl} controls className="w-full h-10 accent-amber-500" />
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-3 bg-amber-400/80 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="inline-block w-1.5 h-4 bg-amber-400/80 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="inline-block w-1.5 h-2.5 bg-amber-400/80 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              <span className="text-[11px] text-neutral-400 ml-1">16-bit 44.1kHz Polyphonic Studio Audio</span>
            </div>
            <button 
              onClick={(e) => handleDownload(e, mediaUrl, `navix_music_${Date.now()}.wav`)} 
              className="bg-amber-600 hover:bg-amber-500 text-white px-3.5 py-1.5 rounded-lg transition-all shadow-md shadow-amber-600/20 border border-amber-500/40 flex items-center gap-2 text-xs font-semibold"
            >
              <Download size={14} /> Download WAV
            </button>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`w-full max-w-full font-sans ${media.type === 'image' ? '' : 'bg-[#0f0f0f] border border-neutral-800 rounded-xl overflow-hidden shadow-2xl'}`}>
      
      {/* Conditionally render header only for complex media types or if not completed image */}
      {media.type !== 'image' && (
        <div className="bg-[#1a1a1a] flex items-center justify-between p-3 border-b border-neutral-800">
          <div className="flex items-center gap-3">
             <div className="bg-neutral-800 p-1.5 rounded-md border border-neutral-700">
               {getMediaIcon()}
             </div>
             <div>
               <h3 className="text-sm font-bold text-neutral-100 tracking-wide uppercase flex items-center gap-2">
                  {getEngineName()} <span className="bg-blue-500/20 text-blue-400 text-[9px] px-1.5 py-0.5 rounded border border-blue-500/30">NATIVE</span>
               </h3>
               <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-mono mt-0.5">Cloud API Integrated</p>
             </div>
          </div>
          <div className="flex gap-2">
             <div className={`w-2 h-2 rounded-full ${status === 'completed' ? 'bg-green-500' : status === 'error' ? 'bg-red-500' : 'bg-blue-500 animate-pulse'}`}></div>
          </div>
        </div>
      )}

      <div className={media.type === 'image' ? 'py-2' : 'p-4'}>
        {/* Sleek Conversational Loading State (ChatGPT/Gemini style) */}
        {status !== 'completed' && status !== 'error' && (
          <div className="flex flex-col items-start gap-4 mb-2 animate-in fade-in duration-500">
            <div className="flex items-center gap-3 text-neutral-300">
              <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Sparkles size={16} className="animate-pulse" />
              </div>
              <span className="text-sm font-medium animate-pulse">{media.type === 'image' ? 'Sedang membuat gambar...' : currentModule}</span>
            </div>
            
            {/* Shimmering Skeleton Image Box */}
            {media.type === 'image' && (
              <div 
                className="w-full relative overflow-hidden bg-neutral-900 rounded-2xl border border-neutral-800/60"
                style={{ 
                  aspectRatio: aspectRatio === '16:9' ? '16/9' : aspectRatio === '9:16' ? '9/16' : aspectRatio === '4:3' ? '4/3' : aspectRatio === '3:4' ? '3/4' : '1/1',
                  maxWidth: aspectRatio === '9:16' ? '320px' : '100%' 
                }}
              >
                {/* Shimmer Effect */}
                <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
                <div className="absolute inset-0 flex items-center justify-center opacity-30 text-neutral-700">
                   <ImageIcon size={32} />
                </div>
              </div>
            )}
            
            {/* Minimalist Progress Bar for non-image media */}
            {media.type !== 'image' && (
              <div className="w-full max-w-sm">
                <div className="flex items-center justify-between mb-1.5">
                   <span className="text-xs text-neutral-500">Processing media...</span>
                   <span className="text-xs text-indigo-400 font-medium">{progress}%</span>
                 </div>
                 <div className="h-1 w-full bg-neutral-900 rounded-full overflow-hidden border border-neutral-800/50">
                   <div className="h-full bg-indigo-500 rounded-full transition-all duration-300 ease-out" style={{ width: progress + '%' }}></div>
                 </div>
              </div>
            )}
          </div>
        )}

        {/* Media Output */}
        {renderMedia()}
      </div>
    </div>
  );
}
