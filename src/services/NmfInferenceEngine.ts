import fs from 'fs';
import path from 'path';

export interface NmfVisualConditioning {
  focalLength: number;
  fStop: number;
  iso: number;
  microTexture: number;
  skinTone: number;
  lightingIntensity: number;
  depthOfField: number;
  saturation: number;
}

export interface NmfAudioConditioning {
  rootFreq: number;
  tempoBpm: number;
  polyphonyDensity: number;
  harmonicDepth: number;
  reverbDecay: number;
  resonance: number;
  envelopeDecay: number;
  spectralTilt: number;
}

export interface NmfVideoConditioning {
  motionVectorX: number;
  motionVectorY: number;
  temporalContinuity: number;
  fps: number;
  shutterSpeed: number;
  cameraPan: number;
  zoomVelocity: number;
  dynamicRange: number;
}

export class NavixMultimediaFoundationInference {
  private checkpoint: any = null;
  private isLoaded = false;

  private VOCAB: Record<string, number> = {
    "<PAD>": 0, "<UNK>": 1, "<BOS>": 2, "<EOS>": 3,
    "foto": 4, "wajah": 5, "manusia": 6, "wanita": 7, "pria": 8, "anak": 9, "orang": 10, "tua": 11,
    "pemandangan": 12, "gunung": 13, "pantai": 14, "laut": 15, "hutan": 16, "kota": 17, "malam": 18,
    "matahari": 19, "senja": 20, "hujan": 21, "hewan": 22, "kucing": 23, "harimau": 24, "burung": 25,
    "realistis": 26, "alami": 27, "studio": 28, "potret": 29, "lensa": 30, "close-up": 31, "bokeh": 32,
    "pencahayaan": 33, "lembut": 34, "tajam": 35, "detail": 36, "pori-pori": 37, "kulit": 38, "tekstur": 39,
    "sinematik": 40, "sinar": 41, "emas": 42, "terang": 43, "gelap": 44, "kontras": 45,
    "musik": 46, "lagu": 47, "melodi": 48, "suara": 49, "tenang": 50, "santai": 51, "piano": 52,
    "akustik": 53, "gitar": 54, "biola": 55, "orkestra": 56, "cepat": 57, "lambat": 58, "ritme": 59,
    "akord": 60, "harmoni": 61, "nada": 62, "lofi": 63, "ambient": 64, "meditasi": 65, "beat": 66,
    "video": 67, "gerakan": 68, "kamera": 69, "pan": 70, "zoom": 71, "dolly": 72, "jalan": 73,
    "lari": 74, "terbang": 75, "mengalir": 76, "dinamis": 78, "waktu": 79, "timelapse": 80
  };

  private scales: Record<string, [number, number][]> = {
    visual: [[16.0, 105.0], [1.4, 11.0], [50.0, 800.0], [0.0, 1.0], [0.0, 1.0], [0.0, 1.0], [0.0, 1.0], [0.0, 1.0]],
    audio: [[150.0, 500.0], [40.0, 160.0], [0.0, 1.0], [0.0, 1.0], [0.0, 1.0], [0.0, 1.0], [0.0, 1.0], [-1.0, 1.0]],
    video: [[0.0, 1.0], [0.0, 1.0], [0.0, 1.0], [24.0, 60.0], [0.001, 1.0], [0.0, 1.0], [0.0, 1.0], [0.0, 1.0]]
  };

  constructor() {
    this.loadCheckpoint();
  }

  private loadCheckpoint() {
    try {
      const ckptPath = path.join(process.cwd(), 'nmf_engine', 'nmf_adapter_checkpoint_v1.json');
      if (fs.existsSync(ckptPath)) {
        const raw = fs.readFileSync(ckptPath, 'utf8');
        this.checkpoint = JSON.parse(raw);
        this.isLoaded = true;
        console.log(`[NMF Engine] Trained checkpoint loaded successfully (Improvement: ${this.checkpoint?.metadata?.improvement_percentage}%)`);
      }
    } catch (e: any) {
      console.warn(`[NMF Engine] Failed to load checkpoint:`, e.message);
    }
  }

  private tokenize(text: string): number[] {
    const clean = text.toLowerCase().replace(/[,.-]/g, ' ');
    const tokens: number[] = [];
    for (const w of clean.split(/\s+/)) {
      if (w.trim()) {
        tokens.push(this.VOCAB[w] !== undefined ? this.VOCAB[w] : this.VOCAB["<UNK>"]);
      }
    }
    return tokens.length ? tokens : [this.VOCAB["<UNK>"]];
  }

  private forward(tokens: number[], modality: 'visual' | 'audio' | 'video'): number[] {
    if (!this.isLoaded || !this.checkpoint) {
      return [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5];
    }

    const { weights, architecture } = this.checkpoint;
    const embedDim = architecture.embed_dim;
    const latentDim = architecture.latent_dim;
    const outputDim = architecture.output_dim;

    // 1. Mean Pooling Embeddings
    const embed = new Array(embedDim).fill(0);
    for (const t of tokens) {
      const idx = t < weights.embed_table.length ? t : this.VOCAB["<UNK>"];
      const row = weights.embed_table[idx];
      for (let d = 0; d < embedDim; d++) {
        embed[d] += row[d];
      }
    }
    for (let d = 0; d < embedDim; d++) {
      embed[d] /= tokens.length;
    }

    // 2. Shared Latent Projection (Leaky ReLU)
    const latent = new Array(latentDim).fill(0);
    for (let j = 0; j < latentDim; j++) {
      let s = weights.b_proj1[j];
      for (let i = 0; i < embedDim; i++) {
        s += embed[i] * weights.W_proj1[i][j];
      }
      latent[j] = s > 0 ? s : 0.01 * s;
    }

    // 3. Modality Head
    let W_head = weights.W_visual;
    let b_head = weights.b_visual;
    if (modality === 'audio') {
      W_head = weights.W_audio;
      b_head = weights.b_audio;
    } else if (modality === 'video') {
      W_head = weights.W_video;
      b_head = weights.b_video;
    }

    const out = new Array(outputDim).fill(0);
    for (let k = 0; k < outputDim; k++) {
      let s = b_head[k];
      for (let j = 0; j < latentDim; j++) {
        s += latent[j] * W_head[j][k];
      }
      const clamped = Math.max(-20, Math.min(20, s));
      out[k] = 1.0 / (1.0 + Math.exp(-clamped));
    }

    // 4. Denormalize
    const bounds = this.scales[modality];
    const denorm = new Array(outputDim).fill(0);
    for (let k = 0; k < outputDim; k++) {
      const [low, high] = bounds[k];
      denorm[k] = out[k] * (high - low) + low;
    }

    return denorm;
  }

  public getVisualConditioning(text: string): NmfVisualConditioning {
    const tokens = this.tokenize(text);
    const v = this.forward(tokens, 'visual');
    return {
      focalLength: Math.round(v[0]),
      fStop: parseFloat(v[1].toFixed(1)),
      iso: Math.round(v[2]),
      microTexture: parseFloat(v[3].toFixed(2)),
      skinTone: parseFloat(v[4].toFixed(2)),
      lightingIntensity: parseFloat(v[5].toFixed(2)),
      depthOfField: parseFloat(v[6].toFixed(2)),
      saturation: parseFloat(v[7].toFixed(2))
    };
  }

  public getAudioConditioning(text: string): NmfAudioConditioning {
    const tokens = this.tokenize(text);
    const a = this.forward(tokens, 'audio');
    return {
      rootFreq: parseFloat(a[0].toFixed(2)),
      tempoBpm: Math.round(a[1]),
      polyphonyDensity: parseFloat(a[2].toFixed(2)),
      harmonicDepth: parseFloat(a[3].toFixed(2)),
      reverbDecay: parseFloat(a[4].toFixed(2)),
      resonance: parseFloat(a[5].toFixed(2)),
      envelopeDecay: parseFloat(a[6].toFixed(2)),
      spectralTilt: parseFloat(a[7].toFixed(2))
    };
  }

  public getVideoConditioning(text: string): NmfVideoConditioning {
    const tokens = this.tokenize(text);
    const vd = this.forward(tokens, 'video');
    return {
      motionVectorX: parseFloat(vd[0].toFixed(2)),
      motionVectorY: parseFloat(vd[1].toFixed(2)),
      temporalContinuity: parseFloat(vd[2].toFixed(2)),
      fps: Math.round(vd[3]),
      shutterSpeed: parseFloat(vd[4].toFixed(3)),
      cameraPan: parseFloat(vd[5].toFixed(2)),
      zoomVelocity: parseFloat(vd[6].toFixed(2)),
      dynamicRange: parseFloat(vd[7].toFixed(2))
    };
  }

  public getModelStatus() {
    return {
      isLoaded: this.isLoaded,
      modelName: this.checkpoint?.metadata?.model_name || "NMF Offline Baseline",
      trainingMetrics: this.checkpoint?.metadata || null
    };
  }
}

export const nmfEngine = new NavixMultimediaFoundationInference();
