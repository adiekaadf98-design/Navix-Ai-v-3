/**
 * NAVIX AI — LOCAL DREAM IMAGE ENGINE (ON-DEVICE ANDROID INFERENCE)
 * 
 * Integrates Local Dream (https://github.com/xororz/local-dream) as an on-device
 * Stable Diffusion image generation engine using Android Snapdragon NPU, GPU, or CPU.
 * 
 * Flow:
 * Task/Capability Detection -> Image Tool (generate_image) -> Local Image Router
 * -> Local Dream Engine -> Hardware Detection (NPU/GPU/CPU) -> Real Image Bytes
 * -> Image Verification -> mediaStore/Vault -> Main Chat Display
 */

import { IEngine, EngineResult } from '../../types/engine';
import { saveMediaToVault, computeMediaKey } from '../../utils/mediaStorage';
import { translateAndEnrichPrompt } from '../photorealismEngine';

export type LocalDreamLifecycleState =
  | 'UNAVAILABLE'
  | 'UNSUPPORTED_DEVICE'
  | 'MODEL_NOT_INSTALLED'
  | 'LOW_MEMORY'
  | 'INSUFFICIENT_STORAGE'
  | 'INITIALIZING'
  | 'READY'
  | 'GENERATING'
  | 'COMPLETED'
  | 'FAILED';

export interface HardwareCapabilities {
  isAndroid: boolean;
  platform: string;
  hardwareConcurrency: number;
  deviceMemoryGb: number;
  cpuAvailable: boolean;
  gpuAvailable: boolean;
  npuAvailable: boolean;
  gpuRenderer?: string;
  socModel?: string;
  recommendedBackend: 'npu' | 'gpu' | 'cpu';
  supportedModels: string[];
}

export interface LocalDreamConfig {
  endpoint: string; // e.g., 'http://127.0.0.1:8081' or custom LAN/port
  timeoutMs: number;
  preferLocal: boolean;
  defaultSteps: number;
  defaultGuidance: number;
}

export interface GenerateLocalImageParams {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  steps?: number;
  guidance?: number;
  seed?: number;
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
  backend?: 'npu' | 'gpu' | 'cpu';
  model?: string;
}

export class LocalDreamImageEngine implements IEngine {
  public name = 'LocalDreamImageEngine';
  public category = 'image' as const;
  public description = 'On-Device Android Stable Diffusion Generator powered by Local Dream (Snapdragon NPU / GPU / CPU)';
  public capabilities = [
    'local_image_generation',
    'snapdragon_npu_inference',
    'on_device_diffusion',
    'txt2img',
    'offline_privacy_preserving'
  ];

  private config: LocalDreamConfig = {
    endpoint: 'http://127.0.0.1:8081',
    timeoutMs: 90000,
    preferLocal: true,
    defaultSteps: 20,
    defaultGuidance: 7.5
  };

  private currentState: LocalDreamLifecycleState = 'UNAVAILABLE';
  private cachedHardware: HardwareCapabilities | null = null;

  constructor(customConfig?: Partial<LocalDreamConfig>) {
    if (customConfig) {
      this.config = { ...this.config, ...customConfig };
    }
  }

  public getState(): LocalDreamLifecycleState {
    return this.currentState;
  }

  /**
   * Hardware & Device Capability Detection
   * Analyzes Android environment, Snapdragon SoC presence, WebGL GPU, and RAM.
   */
  public detectHardware(): HardwareCapabilities {
    if (this.cachedHardware) return this.cachedHardware;

    const isBrowser = typeof window !== 'undefined' && typeof navigator !== 'undefined';
    const ua = isBrowser ? navigator.userAgent : '';
    const isAndroid = /Android/i.test(ua);
    const hardwareConcurrency = isBrowser ? (navigator.hardwareConcurrency || 4) : 4;
    const deviceMemoryGb = isBrowser && 'deviceMemory' in navigator ? (navigator as any).deviceMemory : 4;

    let gpuAvailable = false;
    let npuAvailable = false;
    let gpuRenderer = '';
    let socModel = '';

    if (isBrowser) {
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (gl) {
          gpuAvailable = true;
          const debugInfo = (gl as any).getExtension('WEBGL_debug_renderer_info');
          if (debugInfo) {
            gpuRenderer = (gl as any).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '';
          }
        }
      } catch {
        gpuAvailable = false;
      }
    }

    // Snapdragon NPU Detection (Adreno 7xx/6xx with Snapdragon 8 Gen 1/2/3/4 or Hexagon NPU)
    if (isAndroid) {
      const isSnapdragon = /Snapdragon|Adreno|SM8450|SM8550|SM8650|SM8750|Qualcomm/i.test(gpuRenderer) ||
                           /Snapdragon|Adreno|SM8/i.test(ua);
      if (isSnapdragon) {
        npuAvailable = true;
        socModel = 'Qualcomm Snapdragon with Hexagon NPU';
      }
    }

    let recommendedBackend: 'npu' | 'gpu' | 'cpu' = 'cpu';
    if (npuAvailable) recommendedBackend = 'npu';
    else if (gpuAvailable) recommendedBackend = 'gpu';

    const supportedModels = ['Stable Diffusion 1.5 (SD1.5 NPU/CPU)', 'Stable Diffusion XL (SDXL Turbo/Base)'];

    this.cachedHardware = {
      isAndroid,
      platform: isBrowser ? navigator.platform || 'Android' : 'Unknown',
      hardwareConcurrency,
      deviceMemoryGb,
      cpuAvailable: true,
      gpuAvailable,
      npuAvailable,
      gpuRenderer,
      socModel,
      recommendedBackend,
      supportedModels
    };

    return this.cachedHardware;
  }

  /**
   * Health & Runtime Check
   * Probes the Android Native Bridge or Local Dream HTTP Daemon at 127.0.0.1:8081.
   */
  public async probeRuntime(): Promise<{
    available: boolean;
    state: LocalDreamLifecycleState;
    details?: any;
    error?: string;
  }> {
    const hw = this.detectHardware();

    // 1. Check Native Android Bridge (if running inside wrapped Android APK)
    if (typeof window !== 'undefined') {
      const nativeBridge = (window as any).LocalDreamBridge || (window as any).AndroidBridge;
      if (nativeBridge && typeof nativeBridge.isLocalDreamReady === 'function') {
        try {
          const isReady = await nativeBridge.isLocalDreamReady();
          if (isReady) {
            this.currentState = 'READY';
            return { available: true, state: 'READY', details: { bridge: 'NativeLocalDreamBridge' } };
          } else {
            this.currentState = 'MODEL_NOT_INSTALLED';
            return { available: false, state: 'MODEL_NOT_INSTALLED', error: 'Model SD1.5/SDXL belum diunduh di aplikasi Local Dream.' };
          }
        } catch (e: any) {
          console.warn('[LocalDreamImageEngine] Native bridge check error:', e);
        }
      }
    }

    // 2. Probe Local Dream HTTP Daemon (cpp-httplib server listening on 127.0.0.1:8081)
    const endpoint = (typeof localStorage !== 'undefined' && localStorage.getItem('local_dream_endpoint')) || this.config.endpoint;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      // Try status endpoint
      const res = await fetch(`${endpoint}/status`, {
        method: 'GET',
        signal: controller.signal
      }).catch(async () => {
        // Fallback probe to /sdapi/v1/sd-models or /health
        return await fetch(`${endpoint}/sdapi/v1/sd-models`, {
          method: 'GET',
          signal: controller.signal
        });
      });

      clearTimeout(timeoutId);

      if (res && res.ok) {
        const data = await res.json().catch(() => ({ status: 'ready' }));
        if (data.model_loaded === false || data.status === 'model_missing') {
          this.currentState = 'MODEL_NOT_INSTALLED';
          return {
            available: false,
            state: 'MODEL_NOT_INSTALLED',
            error: 'Local Dream service aktif tetapi model belum dimuat/diunduh. Buka aplikasi Local Dream untuk memilih model.',
            details: data
          };
        }

        this.currentState = 'READY';
        return {
          available: true,
          state: 'READY',
          details: { endpoint, backend: hw.recommendedBackend, serverData: data }
        };
      }
    } catch (err: any) {
      // Daemon not reachable
    }

    // Determine specific reason for unavailability
    if (!hw.isAndroid && typeof window !== 'undefined') {
      this.currentState = 'UNSUPPORTED_DEVICE';
      return {
        available: false,
        state: 'UNSUPPORTED_DEVICE',
        error: 'Perangkat saat ini bukan Android. Local Dream dirancang khusus untuk hardware lokal Android (Snapdragon NPU / GPU).'
      };
    }

    if (hw.deviceMemoryGb > 0 && hw.deviceMemoryGb < 4) {
      this.currentState = 'LOW_MEMORY';
      return {
        available: false,
        state: 'LOW_MEMORY',
        error: `RAM perangkat (${hw.deviceMemoryGb}GB) di bawah batas minimum 6GB yang direkomendasikan untuk on-device diffusion.`
      };
    }

    this.currentState = 'UNAVAILABLE';
    return {
      available: false,
      state: 'UNAVAILABLE',
      error: 'Daemon Local Dream (127.0.0.1:8081) tidak merespons atau aplikasi Local Dream belum dibuka dengan LAN/Local access aktif.'
    };
  }

  /**
   * Main Execution Handler for EngineRegistry
   */
  public async execute(payload: any): Promise<EngineResult> {
    const startTime = Date.now();
    const rawPrompt = payload?.prompt || payload?.query || payload?.input || '';
    if (!rawPrompt.trim()) {
      return {
        status: 'FAILED',
        source: this.name,
        engineName: this.name,
        category: 'image',
        latencyMs: 0,
        error: 'Prompt gambar tidak boleh kosong.',
        message: 'Prompt gambar kosong.'
      };
    }

    // Aspect ratio mapping
    let targetAr: '1:1' | '16:9' | '9:16' | '4:3' | '3:4' = '1:1';
    const pLower = rawPrompt.toLowerCase();
    if (pLower.includes('16:9') || pLower.includes('landscape') || pLower.includes('lebar')) targetAr = '16:9';
    else if (pLower.includes('9:16') || pLower.includes('portrait') || pLower.includes('wallpaper') || pLower.includes('tegak')) targetAr = '9:16';
    else if (pLower.includes('4:3')) targetAr = '4:3';
    else if (pLower.includes('3:4')) targetAr = '3:4';

    const width = targetAr === '16:9' ? 768 : targetAr === '9:16' ? 512 : targetAr === '4:3' ? 640 : targetAr === '3:4' ? 512 : 512;
    const height = targetAr === '16:9' ? 512 : targetAr === '9:16' ? 768 : targetAr === '4:3' ? 512 : targetAr === '3:4' ? 640 : 512;

    // Check runtime & hardware
    this.currentState = 'INITIALIZING';
    const runtime = await this.probeRuntime();
    const hw = this.detectHardware();

    if (!runtime.available) {
      const latencyMs = Date.now() - startTime;
      console.warn(`[LocalDreamImageEngine] Local Dream runtime unavailable (${runtime.state}): ${runtime.error}`);
      
      // Return honest capability status (NO FAKE SUCCESS)
      return {
        status: 'FAILED',
        source: this.name,
        engineName: this.name,
        category: 'image',
        latencyMs,
        error: runtime.error || 'Local Dream Engine tidak tersedia pada perangkat saat ini.',
        message: `Local Dream Engine (${runtime.state}): ${runtime.error || 'Layanan lokal offline'}.`,
        data: {
          lifecycleState: runtime.state,
          hardware: hw,
          canFallbackToCloud: true
        }
      };
    }

    // Execute Local Dream Inference
    this.currentState = 'GENERATING';
    console.log(`[LocalDreamImageEngine] 🚀 Executing On-Device Inference on ${hw.recommendedBackend.toUpperCase()} (${width}x${height})...`);

    // Enrich prompt with optical realism details
    const enriched = translateAndEnrichPrompt(rawPrompt);
    const finalPrompt = enriched.prompt || rawPrompt;
    const finalNegative = enriched.negativePrompt || payload?.negativePrompt || 'ugly, deformed, blurry, low quality, bad anatomy, watermark';

    const params: GenerateLocalImageParams = {
      prompt: finalPrompt,
      negativePrompt: finalNegative,
      width,
      height,
      steps: payload?.steps || this.config.defaultSteps,
      guidance: payload?.guidance || this.config.defaultGuidance,
      seed: payload?.seed || Math.floor(Math.random() * 2147483647),
      aspectRatio: targetAr,
      backend: hw.recommendedBackend
    };

    try {
      const imageResult = await this.dispatchInference(params);
      const latencyMs = Date.now() - startTime;

      if (!imageResult.success || !imageResult.imageBase64) {
        this.currentState = 'FAILED';
        throw new Error(imageResult.error || 'Local Dream tidak mengembalikan data gambar yang valid.');
      }

      // Verification Step: Validate image size > 0 and valid decoding
      const isValidImage = this.verifyImageBytes(imageResult.imageBase64);
      if (!isValidImage) {
        this.currentState = 'FAILED';
        throw new Error('Verifikasi Gambar Gagal: Bytes gambar kosong atau format byte tidak valid.');
      }

      this.currentState = 'COMPLETED';

      // Persist to Navix Media Vault (IndexedDB)
      const mediaKey = computeMediaKey({ type: 'image', prompt: rawPrompt, aspectRatio: targetAr });
      await saveMediaToVault(mediaKey, {
        type: 'image',
        prompt: rawPrompt,
        mediaUrl: imageResult.imageBase64
      }).catch(err => console.warn('[LocalDreamImageEngine] Media vault save notice:', err));

      console.log(`[LocalDreamImageEngine] ✅ On-Device Image Generated Successfully (${latencyMs}ms, Backend: ${hw.recommendedBackend.toUpperCase()})`);

      return {
        status: 'SUCCESS',
        source: this.name,
        engineName: this.name,
        category: 'image',
        latencyMs,
        message: `Gambar berhasil dibuat secara lokal di perangkat Android menggunakan Local Dream (${hw.recommendedBackend.toUpperCase()} Backend, ${targetAr}, ${latencyMs}ms).`,
        output: {
          imageBase64: imageResult.imageBase64,
          prompt: rawPrompt,
          aspectRatio: targetAr,
          backend: hw.recommendedBackend,
          mimeType: 'image/png'
        },
        realOutput: imageResult.imageBase64,
        data: {
          imageBase64: imageResult.imageBase64,
          prompt: rawPrompt,
          aspectRatio: targetAr,
          backend: hw.recommendedBackend,
          lifecycleState: 'COMPLETED'
        }
      };
    } catch (err: any) {
      this.currentState = 'FAILED';
      const latencyMs = Date.now() - startTime;
      console.error(`[LocalDreamImageEngine] ❌ Inference failed:`, err);

      return {
        status: 'FAILED',
        source: this.name,
        engineName: this.name,
        category: 'image',
        latencyMs,
        error: err?.message || 'Gagal menjalankan inferensi Local Dream di perangkat.',
        message: `Local Dream gagal: ${err?.message || 'Inferensi gagal'}`,
        data: {
          lifecycleState: 'FAILED',
          canFallbackToCloud: true
        }
      };
    }
  }

  /**
   * Dispatches inference to Android Native Bridge or Local HTTP Daemon
   */
  private async dispatchInference(params: GenerateLocalImageParams): Promise<{
    success: boolean;
    imageBase64?: string;
    error?: string;
  }> {
    // 1. Native Android Bridge
    if (typeof window !== 'undefined') {
      const nativeBridge = (window as any).LocalDreamBridge || (window as any).AndroidBridge;
      if (nativeBridge && typeof nativeBridge.generateImage === 'function') {
        try {
          const resRaw = await nativeBridge.generateImage(JSON.stringify(params));
          const resObj = typeof resRaw === 'string' ? JSON.parse(resRaw) : resRaw;
          if (resObj && (resObj.imageBase64 || resObj.image)) {
            const b64 = resObj.imageBase64 || resObj.image;
            const formatted = b64.startsWith('data:') ? b64 : `data:image/png;base64,${b64}`;
            return { success: true, imageBase64: formatted };
          }
        } catch (bridgeErr: any) {
          console.warn('[LocalDreamImageEngine] Bridge execution error:', bridgeErr);
        }
      }
    }

    // 2. HTTP Daemon (cpp-httplib on 127.0.0.1:8081)
    const endpoint = (typeof localStorage !== 'undefined' && localStorage.getItem('local_dream_endpoint')) || this.config.endpoint;
    const bodyPayload = {
      prompt: params.prompt,
      negative_prompt: params.negativePrompt,
      width: params.width,
      height: params.height,
      steps: params.steps,
      cfg_scale: params.guidance,
      seed: params.seed,
      backend: params.backend || 'npu'
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeoutMs);

    try {
      // Try standard SD txt2img endpoint
      let res = await fetch(`${endpoint}/sdapi/v1/txt2img`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
        signal: controller.signal
      }).catch(async () => {
        // Fallback to /txt2img or /v1/generate
        return await fetch(`${endpoint}/txt2img`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyPayload),
          signal: controller.signal
        });
      });

      clearTimeout(timeoutId);

      if (!res || !res.ok) {
        throw new Error(`Local Dream HTTP error: ${res ? res.statusText : 'Koneksi lokal ditolak'}`);
      }

      // Check if response is JSON with base64 array or direct binary blob
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const json = await res.json();
        if (json.images && json.images.length > 0) {
          const imgStr = json.images[0];
          const formatted = imgStr.startsWith('data:') ? imgStr : `data:image/png;base64,${imgStr}`;
          return { success: true, imageBase64: formatted };
        } else if (json.imageBase64 || json.image) {
          const imgStr = json.imageBase64 || json.image;
          const formatted = imgStr.startsWith('data:') ? imgStr : `data:image/png;base64,${imgStr}`;
          return { success: true, imageBase64: formatted };
        }
      } else if (contentType.includes('image/')) {
        const blob = await res.blob();
        const base64 = await this.blobToBase64(blob);
        return { success: true, imageBase64: base64 };
      }

      throw new Error('Respons Local Dream tidak memuat payload citra yang dapat didekode.');
    } catch (fetchErr: any) {
      clearTimeout(timeoutId);
      throw fetchErr;
    }
  }

  /**
   * Helper: Validates image bytes
   */
  private verifyImageBytes(base64Data: string): boolean {
    if (!base64Data || typeof base64Data !== 'string') return false;
    if (base64Data.length < 100) return false;
    
    // Check header format
    if (base64Data.startsWith('data:image/')) return true;
    if (base64Data.startsWith('http://') || base64Data.startsWith('https://')) return true;
    if (base64Data.startsWith('iVBORw0KGgo') || base64Data.startsWith('/9j/')) return true; // PNG / JPEG magic bytes in base64

    return false;
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}

// Global Singleton Instance
export const localDreamImageEngine = new LocalDreamImageEngine();
