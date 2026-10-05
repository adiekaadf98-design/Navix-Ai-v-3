/**
 * NAVIX MULTIMEDIA ENGINE v2.0 - MODEL REGISTRY
 * Standardized Google Gemini & Multimedia Ecosystem Models
 * Reference: ai.google.dev / Google AI Studio Documentation (Audited Aug 2026)
 */

export type Modality = 'text' | 'image' | 'video' | 'audio' | 'speech';

export type ModelStatus = 
  | 'PUBLICLY_VERIFIED'
  | 'RUNTIME_VERIFIED'
  | 'PREVIEW'
  | 'EXPERIMENTAL'
  | 'DEPRECATED'
  | 'BILLING_REQUIRED'
  | 'PROJECT_RESTRICTED'
  | 'UNKNOWN';

export interface ModelMetadata {
  id: string;
  officialName: string;
  provider: 'google';
  sdk: '@google/genai';
  category: 'image_generation' | 'image_editing' | 'video_generation' | 'vision_understanding' | 'audio_transcription' | 'speech_synthesis' | 'music_generation' | 'live_streaming';
  inputModalities: Modality[];
  outputModalities: Modality[];
  requiresPaidKey: boolean;
  maxResolution?: string;
  supportedAspectRatios?: string[];
  maxDurationSeconds?: number;
  status: ModelStatus;
  notes: string;
}

export class ModelRegistry {
  private static instance: ModelRegistry;
  private models: Map<string, ModelMetadata> = new Map();

  private constructor() {
    this.registerOfficialModels();
  }

  public static getInstance(): ModelRegistry {
    if (!ModelRegistry.instance) {
      ModelRegistry.instance = new ModelRegistry();
    }
    return ModelRegistry.instance;
  }

  private registerOfficialModels(): void {
    // 1. Image Generation & Editing
    this.register({
      id: 'gemini-3.1-flash-lite-image',
      officialName: 'Nano Banana Lite (Gemini 3.1 Flash-Lite Image)',
      provider: 'google',
      sdk: '@google/genai',
      category: 'image_generation',
      inputModalities: ['text', 'image'],
      outputModalities: ['image'],
      requiresPaidKey: true,
      maxResolution: '1K',
      supportedAspectRatios: ['1:1', '3:4', '4:3', '9:16', '16:9'],
      status: 'PUBLICLY_VERIFIED',
      notes: 'Default image generation and editing model. Requires user API key via paid_model_flow.'
    });

    this.register({
      id: 'gemini-3.1-flash-image',
      officialName: 'Nano Banana 2 (Gemini 3.1 Flash Image)',
      provider: 'google',
      sdk: '@google/genai',
      category: 'image_generation',
      inputModalities: ['text', 'image'],
      outputModalities: ['image'],
      requiresPaidKey: true,
      maxResolution: '4K',
      supportedAspectRatios: ['1:1', '3:4', '4:3', '9:16', '16:9', '1:4', '1:8', '4:1', '8:1'],
      status: 'PUBLICLY_VERIFIED',
      notes: 'High-quality image generation with 512px, 1K, 2K, 4K resolutions and Google Search grounding.'
    });

    this.register({
      id: 'gemini-3-pro-image',
      officialName: 'Nano Banana Pro (Gemini 3 Pro Image)',
      provider: 'google',
      sdk: '@google/genai',
      category: 'image_generation',
      inputModalities: ['text', 'image'],
      outputModalities: ['image'],
      requiresPaidKey: true,
      maxResolution: '4K',
      supportedAspectRatios: ['1:1', '3:4', '4:3', '9:16', '16:9', '1:4', '1:8', '4:1', '8:1'],
      status: 'PUBLICLY_VERIFIED',
      notes: 'Flagship studio pro image rendering with webSearch integration.'
    });

    // 2. Video Generation
    this.register({
      id: 'veo-3.1-lite-generate-preview',
      officialName: 'Veo Lite (Veo 3.1 Lite Generate Preview)',
      provider: 'google',
      sdk: '@google/genai',
      category: 'video_generation',
      inputModalities: ['text', 'image'],
      outputModalities: ['video'],
      requiresPaidKey: true,
      maxResolution: '1080p',
      supportedAspectRatios: ['16:9', '9:16'],
      maxDurationSeconds: 6,
      status: 'PREVIEW',
      notes: 'General video generation model supporting 720p and 1080p. Async polling operation.'
    });

    this.register({
      id: 'veo-3.1-generate-preview',
      officialName: 'Veo Pro (Veo 3.1 Generate Preview)',
      provider: 'google',
      sdk: '@google/genai',
      category: 'video_generation',
      inputModalities: ['text', 'image'],
      outputModalities: ['video'],
      requiresPaidKey: true,
      maxResolution: '4K',
      supportedAspectRatios: ['16:9', '9:16'],
      maxDurationSeconds: 15,
      status: 'PREVIEW',
      notes: 'Flagship video generation supporting 4K, video extensions (+7s), and up to 3 reference images.'
    });

    // 3. Multimodal Vision & Video Understanding
    this.register({
      id: 'gemini-3.8-flash',
      officialName: 'Gemini 3.8 Flash (Multimodal Vision & Video Understanding)',
      provider: 'google',
      sdk: '@google/genai',
      category: 'vision_understanding',
      inputModalities: ['text', 'image', 'video', 'audio'],
      outputModalities: ['text'],
      requiresPaidKey: false,
      status: 'RUNTIME_VERIFIED',
      notes: 'Authoritative model for chart OCR, image deconstruction, and video file understanding.'
    });

    this.register({
      id: 'gemini-3.1-flash-lite',
      officialName: 'Gemini 3.1 Flash-Lite (Fast Multimodal Vision)',
      provider: 'google',
      sdk: '@google/genai',
      category: 'vision_understanding',
      inputModalities: ['text', 'image', 'video'],
      outputModalities: ['text'],
      requiresPaidKey: false,
      status: 'RUNTIME_VERIFIED',
      notes: 'Low-latency, cost-optimized tier for basic visual recognition and quick failover.'
    });

    // 4. Audio Transcription
    this.register({
      id: 'gemini-3.5-transcribe',
      officialName: 'Gemini 3.5 Transcribe',
      provider: 'google',
      sdk: '@google/genai',
      category: 'audio_transcription',
      inputModalities: ['audio'],
      outputModalities: ['text'],
      requiresPaidKey: false,
      status: 'PUBLICLY_VERIFIED',
      notes: 'Dedicated pre-recorded audio transcription model with multi-language verbatim accuracy.'
    });

    this.register({
      id: 'gemini-3.5-transcribe-live',
      officialName: 'Gemini 3.5 Transcribe Live',
      provider: 'google',
      sdk: '@google/genai',
      category: 'audio_transcription',
      inputModalities: ['audio'],
      outputModalities: ['text'],
      requiresPaidKey: false,
      status: 'PREVIEW',
      notes: 'Real-time live audio streaming transcription and bidirectional speech translation.'
    });

    // 5. Speech Synthesis (TTS)
    this.register({
      id: 'gemini-3.8-flash-lite-tts',
      officialName: 'Gemini 3.8 Flash-Lite TTS',
      provider: 'google',
      sdk: '@google/genai',
      category: 'speech_synthesis',
      inputModalities: ['text'],
      outputModalities: ['speech'],
      requiresPaidKey: false,
      status: 'PUBLICLY_VERIFIED',
      notes: 'Standard high-throughput TTS supporting prebuilt voices (Kore, Puck, Charon, Fenrir, Zephyr).'
    });

    this.register({
      id: 'gemini-3.8-flash-tts',
      officialName: 'Gemini 3.8 Flash TTS (Voice Design & Multi-Speaker)',
      provider: 'google',
      sdk: '@google/genai',
      category: 'speech_synthesis',
      inputModalities: ['text'],
      outputModalities: ['speech'],
      requiresPaidKey: false,
      status: 'PUBLICLY_VERIFIED',
      notes: 'Flagship audio model for custom voice persona design, dual-speaker screenplays, and natural backchanneling.'
    });

    // 6. Music Generation
    this.register({
      id: 'lyria-3-clip-preview',
      officialName: 'Lyria Clip (Lyria 3 Clip Preview)',
      provider: 'google',
      sdk: '@google/genai',
      category: 'music_generation',
      inputModalities: ['text', 'image'],
      outputModalities: ['audio'],
      requiresPaidKey: true,
      maxDurationSeconds: 30,
      status: 'PREVIEW',
      notes: 'Generates up to 30-second audio clips with lyrics and metadata streaming.'
    });

    this.register({
      id: 'lyria-3-pro-preview',
      officialName: 'Lyria Pro (Lyria 3 Pro Preview)',
      provider: 'google',
      sdk: '@google/genai',
      category: 'music_generation',
      inputModalities: ['text', 'image'],
      outputModalities: ['audio'],
      requiresPaidKey: true,
      status: 'PREVIEW',
      notes: 'Full-length music generation with dynamic audio/wav streaming.'
    });

    // 7. Live Sessions
    this.register({
      id: 'gemini-3.8-live',
      officialName: 'Gemini 3.8 Live (Native Audio/Video Stream)',
      provider: 'google',
      sdk: '@google/genai',
      category: 'live_streaming',
      inputModalities: ['audio', 'video'],
      outputModalities: ['audio'],
      requiresPaidKey: false,
      status: 'PUBLICLY_VERIFIED',
      notes: 'Low-latency real-time bidirectional WebSocket conversational voice session.'
    });

    this.register({
      id: 'gemini-3.8-live-extended-thinking',
      officialName: 'Gemini 3.8 Live Extended Thinking',
      provider: 'google',
      sdk: '@google/genai',
      category: 'live_streaming',
      inputModalities: ['audio', 'video'],
      outputModalities: ['audio'],
      requiresPaidKey: false,
      status: 'PREVIEW',
      notes: 'Live voice conversation requiring complex reasoning and multi-step tool calls.'
    });
  }

  public register(meta: ModelMetadata): void {
    this.models.set(meta.id, meta);
  }

  public getModel(modelId: string): ModelMetadata | undefined {
    return this.models.get(modelId);
  }

  public getAllModels(): ModelMetadata[] {
    return Array.from(this.models.values());
  }

  public getModelsByCategory(category: ModelMetadata['category']): ModelMetadata[] {
    return this.getAllModels().filter(m => m.category === category);
  }

  public isModelDeprecated(modelId: string): boolean {
    const deprecated = [
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-pro',
      'gemini-2.0-flash',
      'gemini-2.0-pro',
      'gemini-2.0-flash-thinking'
    ];
    return deprecated.includes(modelId);
  }
}

export const modelRegistry = ModelRegistry.getInstance();
