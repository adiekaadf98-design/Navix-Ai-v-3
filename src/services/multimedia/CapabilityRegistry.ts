/**
 * NAVIX MULTIMEDIA ENGINE v2.0 - CAPABILITY REGISTRY & MATRIX
 * Formulates official capabilities and access requirements
 */

import { ModelStatus } from './ModelRegistry';

export interface CapabilityMatrixEntry {
  capabilityId: string;
  name: string;
  category: string;
  model: string;
  apiMethod: string;
  inputFormat: string;
  outputFormat: string;
  accessRequirement: 'DEFAULT_KEY' | 'PAID_USER_KEY' | 'SPECIAL_ACCESS';
  billingRequired: boolean;
  status: ModelStatus;
  fallbackStrategy: string;
}

export class CapabilityRegistry {
  private static instance: CapabilityRegistry;
  private entries: Map<string, CapabilityMatrixEntry> = new Map();

  private constructor() {
    this.initMatrix();
  }

  public static getInstance(): CapabilityRegistry {
    if (!CapabilityRegistry.instance) {
      CapabilityRegistry.instance = new CapabilityRegistry();
    }
    return CapabilityRegistry.instance;
  }

  private initMatrix(): void {
    const list: CapabilityMatrixEntry[] = [
      {
        capabilityId: 'IMAGE_GENERATION_STANDARD',
        name: 'Standard Visual Synthesis',
        category: 'Image',
        model: 'gemini-3.1-flash-lite-image',
        apiMethod: 'ai.models.generateContent',
        inputFormat: 'text (prompt) + optional imageConfig (aspectRatio)',
        outputFormat: 'image/png or image/jpeg base64 inlineData',
        accessRequirement: 'PAID_USER_KEY',
        billingRequired: true,
        status: 'PUBLICLY_VERIFIED',
        fallbackStrategy: 'Sovereign Photorealism Engine (Wikimedia open-license reference / direct realism pipeline)'
      },
      {
        capabilityId: 'IMAGE_GENERATION_HIGH_RES',
        name: 'High-Res 4K Visual Synthesis with Search',
        category: 'Image',
        model: 'gemini-3.1-flash-image',
        apiMethod: 'ai.models.generateContent',
        inputFormat: 'text (prompt) + imageSize (512px, 1K, 2K, 4K) + googleSearch',
        outputFormat: 'image/png or image/jpeg base64 inlineData',
        accessRequirement: 'PAID_USER_KEY',
        billingRequired: true,
        status: 'PUBLICLY_VERIFIED',
        fallbackStrategy: 'gemini-3.1-flash-lite-image -> Sovereign Photorealism Engine'
      },
      {
        capabilityId: 'IMAGE_EDITING_MULTIMODAL',
        name: 'Image Modification & Transformation',
        category: 'Image',
        model: 'gemini-3.1-flash-lite-image',
        apiMethod: 'ai.models.generateContent',
        inputFormat: 'image/jpeg or image/png base64 + text edit instruction',
        outputFormat: 'image/png or image/jpeg base64 inlineData',
        accessRequirement: 'PAID_USER_KEY',
        billingRequired: true,
        status: 'PUBLICLY_VERIFIED',
        fallbackStrategy: 'Sovereign PixelEngine transformation (filters, enhancements, canvas ops)'
      },
      {
        capabilityId: 'VISION_UNDERSTANDING_MULTIMODAL',
        name: 'Deep Multimodal Image & Document Analysis',
        category: 'Vision',
        model: 'gemini-3.8-flash',
        apiMethod: 'ai.models.generateContent',
        inputFormat: 'image base64 (jpeg, png, webp) + text query',
        outputFormat: 'text (structured analysis, OCR, or chart metrics)',
        accessRequirement: 'DEFAULT_KEY',
        billingRequired: false,
        status: 'RUNTIME_VERIFIED',
        fallbackStrategy: 'gemini-3.1-flash-lite -> Navix Vision Engine Heuristics Core'
      },
      {
        capabilityId: 'VIDEO_UNDERSTANDING_TEMPORAL',
        name: 'Temporal Video Understanding & Frame Deconstruction',
        category: 'Vision',
        model: 'gemini-3.8-flash',
        apiMethod: 'ai.models.generateContent',
        inputFormat: 'video/mp4 base64 inlineData or File API URI + text prompt',
        outputFormat: 'text (temporal event summary, frame-by-frame breakdown)',
        accessRequirement: 'DEFAULT_KEY',
        billingRequired: false,
        status: 'RUNTIME_VERIFIED',
        fallbackStrategy: 'Sample key frames to vision understanding'
      },
      {
        capabilityId: 'VIDEO_GENERATION_GENERAL',
        name: 'AI Video Clip Generation (Veo Lite)',
        category: 'Video',
        model: 'veo-3.1-lite-generate-preview',
        apiMethod: 'ai.models.generateVideos (Async Operation)',
        inputFormat: 'text (prompt) + optional starting image + aspectRatio + resolution (720p/1080p)',
        outputFormat: 'video/mp4 stream via operation polling',
        accessRequirement: 'PAID_USER_KEY',
        billingRequired: true,
        status: 'PREVIEW',
        fallbackStrategy: 'Sovereign Image-Motion Engine (FFmpeg Ken Burns motion render with honest notice)'
      },
      {
        capabilityId: 'VIDEO_GENERATION_PRO',
        name: 'Pro 4K Video Generation & Extension (Veo Pro)',
        category: 'Video',
        model: 'veo-3.1-generate-preview',
        apiMethod: 'ai.models.generateVideos (Async Operation)',
        inputFormat: 'text (prompt) + up to 3 reference images + 4K config',
        outputFormat: 'video/mp4 stream via operation polling',
        accessRequirement: 'PAID_USER_KEY',
        billingRequired: true,
        status: 'PREVIEW',
        fallbackStrategy: 'veo-3.1-lite-generate-preview -> Sovereign Image-Motion Engine'
      },
      {
        capabilityId: 'SPEECH_SYNTHESIS_STANDARD',
        name: 'High-Throughput Speech Synthesis (TTS)',
        category: 'Audio',
        model: 'gemini-3.8-flash-lite-tts',
        apiMethod: 'ai.models.generateContent',
        inputFormat: 'text prompt + speechConfig (voiceName: Kore, Puck, Charon, etc.)',
        outputFormat: 'audio/wav PCM base64 (24000 Hz sample rate)',
        accessRequirement: 'DEFAULT_KEY',
        billingRequired: false,
        status: 'PUBLICLY_VERIFIED',
        fallbackStrategy: 'Navix Sovereign Acoustic Waveform Synthesizer'
      },
      {
        capabilityId: 'SPEECH_SYNTHESIS_PERSONA',
        name: 'Voice Design & Dual-Speaker Screenplay TTS',
        category: 'Audio',
        model: 'gemini-3.8-flash-tts',
        apiMethod: 'ai.models.generateContent',
        inputFormat: 'script text with speaker tags and voice design directives',
        outputFormat: 'audio/wav PCM base64 (24000 Hz sample rate)',
        accessRequirement: 'DEFAULT_KEY',
        billingRequired: false,
        status: 'PUBLICLY_VERIFIED',
        fallbackStrategy: 'gemini-3.8-flash-lite-tts -> Sovereign Acoustic Waveform Synthesizer'
      },
      {
        capabilityId: 'AUDIO_TRANSCRIPTION_PRE_RECORDED',
        name: 'Verbatim Speech-to-Text Transcription',
        category: 'Audio',
        model: 'gemini-3.5-transcribe',
        apiMethod: 'ai.models.generateContent',
        inputFormat: 'audio/mp3, audio/wav, audio/webm base64 inlineData',
        outputFormat: 'text verbatim transcription',
        accessRequirement: 'DEFAULT_KEY',
        billingRequired: false,
        status: 'PUBLICLY_VERIFIED',
        fallbackStrategy: 'gemini-3.8-flash -> gemini-3.1-flash-lite -> Navix Acoustic Decoder'
      },
      {
        capabilityId: 'MUSIC_GENERATION_STUDIO',
        name: 'Autonomous Instrumental Music & Song Generation',
        category: 'Audio',
        model: 'lyria-3-clip-preview',
        apiMethod: 'ai.models.generateContentStream',
        inputFormat: 'text musical prompt + optional genre / instrument descriptors',
        outputFormat: 'audio/wav binary chunks via streaming',
        accessRequirement: 'PAID_USER_KEY',
        billingRequired: true,
        status: 'PREVIEW',
        fallbackStrategy: 'Navix Sovereign Audio Studio (Algorithmic procedural synthesis + structured lyrics)'
      },
      {
        capabilityId: 'LIVE_MULTIMODAL_CONVERSATION',
        name: 'Real-Time Conversational Voice & Video Stream',
        category: 'Live',
        model: 'gemini-3.8-live',
        apiMethod: 'ai.live.connect (WebSocket)',
        inputFormat: 'audio/pcm (16000 Hz) + optional video frames',
        outputFormat: 'audio/pcm (24000 Hz) real-time stream',
        accessRequirement: 'DEFAULT_KEY',
        billingRequired: false,
        status: 'PUBLICLY_VERIFIED',
        fallbackStrategy: 'Fallback to REST audio synthesis & transcription loop'
      }
    ];

    for (const item of list) {
      this.entries.set(item.capabilityId, item);
    }
  }

  public getCapability(id: string): CapabilityMatrixEntry | undefined {
    return this.entries.get(id);
  }

  public getAllCapabilities(): CapabilityMatrixEntry[] {
    return Array.from(this.entries.values());
  }

  public getCapabilitiesByCategory(category: string): CapabilityMatrixEntry[] {
    return this.getAllCapabilities().filter(c => c.category.toLowerCase() === category.toLowerCase());
  }
}

export const capabilityRegistry = CapabilityRegistry.getInstance();
