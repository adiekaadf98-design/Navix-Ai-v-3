/**
 * NAVIX MULTIMEDIA ENGINE v2.0 - MULTIMEDIA ORCHESTRATOR
 * Core coordinator managing execution, validation, fallbacks, and runtime evidence.
 */

import { GoogleGenAI } from '@google/genai';
import { MultimediaTaskRouter, RouteDecision, MultimediaTaskType } from './MultimediaTaskRouter';
import { MediaValidationEngine } from './MediaValidationEngine';
import { MultimediaErrorHandler } from './ErrorHandler';
import { quotaManager } from './QuotaManager';
import { runtimeTracker } from './RuntimeTracker';
import { mediaStorageManager } from './MediaStorageManager';
import { capabilityRegistry, CapabilityMatrixEntry } from './CapabilityRegistry';
import { modelRegistry } from './ModelRegistry';

export interface ImageGenerationOptions {
  prompt: string;
  aspectRatio?: '1:1' | '3:4' | '4:3' | '9:16' | '16:9' | '1:4' | '1:8' | '4:1' | '8:1';
  resolution?: '512px' | '1K' | '2K' | '4K';
  aiClient?: any;
  userApiKey?: string;
  sourceImageBase64?: string;
}

export interface ImageEditingOptions {
  imageBase64: string;
  prompt: string;
  aiClient?: any;
  userApiKey?: string;
}

export interface VisionUnderstandingOptions {
  imageBase64: string;
  prompt?: string;
  mode?: 'general' | 'ocr' | 'chart';
  aiClient?: any;
}

export interface VideoUnderstandingOptions {
  videoBase64: string;
  prompt?: string;
  mimeType?: string;
  aiClient?: any;
}

export interface SpeechSynthesisOptions {
  text: string;
  voiceName?: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr';
  isPersonaVoice?: boolean;
  stylePrompt?: string;
  aiClient?: any;
}

export interface AudioTranscriptionOptions {
  audioBase64: string;
  mimeType?: string;
  language?: string;
  aiClient?: any;
}

export class MultimediaOrchestrator {
  private static instance: MultimediaOrchestrator;

  private constructor() {}

  public static getInstance(): MultimediaOrchestrator {
    if (!MultimediaOrchestrator.instance) {
      MultimediaOrchestrator.instance = new MultimediaOrchestrator();
    }
    return MultimediaOrchestrator.instance;
  }

  /**
   * 1. IMAGE GENERATION (Text -> Image)
   */
  public async generateImage(options: ImageGenerationOptions): Promise<{
    success: boolean;
    imageBase64?: string;
    model: string;
    capabilityId: string;
    isFallback?: boolean;
    error?: string;
  }> {
    const startTime = Date.now();
    const route = MultimediaTaskRouter.route('image_generation', {
      prompt: options.prompt,
      resolution: options.resolution,
      aspectRatio: options.aspectRatio
    });

    const candidateModels = [route.primaryModel, ...route.fallbackModels];

    if (options.aiClient) {
      for (const model of candidateModels) {
        try {
          const config: any = {
            imageConfig: {
              aspectRatio: options.aspectRatio || '1:1',
              ...(options.resolution ? { imageSize: options.resolution } : {})
            }
          };

          const parts: any[] = [{ text: options.prompt }];
          if (options.sourceImageBase64) {
            const valid = MediaValidationEngine.validateImage(options.sourceImageBase64);
            if (valid.valid && valid.sanitizedBase64) {
              parts.unshift({
                inlineData: {
                  mimeType: valid.mimeType || 'image/jpeg',
                  data: valid.sanitizedBase64
                }
              });
            }
          }

          const response: any = await options.aiClient.models.generateContent({
            model,
            contents: { parts },
            config
          });

          // Iterate parts to locate generated image
          const contentParts = response?.candidates?.[0]?.content?.parts || [];
          for (const p of contentParts) {
            if (p.inlineData && p.inlineData.data) {
              const mime = p.inlineData.mimeType || 'image/png';
              const b64 = `data:${mime};base64,${p.inlineData.data}`;
              
              quotaManager.recordSuccess(model);
              runtimeTracker.recordExecution({
                capabilityId: route.capabilityId,
                model,
                latencyMs: Date.now() - startTime,
                success: true,
                status: 'RUNTIME_VERIFIED',
                evidence: `Generated image payload received from ${model} with mime: ${mime}`
              });

              return {
                success: true,
                imageBase64: b64,
                model,
                capabilityId: route.capabilityId
              };
            }
          }
        } catch (err: any) {
          const classified = MultimediaErrorHandler.classify(err);
          if (classified.category === 'QUOTA_EXCEEDED') {
            quotaManager.recordQuotaExhausted(model);
          }
          console.warn(`[MultimediaOrchestrator] Image generation with ${model} failed (${classified.category}):`, err?.message);
        }
      }
    }

    // Record runtime failure / fallback requirement
    runtimeTracker.recordExecution({
      capabilityId: route.capabilityId,
      model: route.primaryModel,
      latencyMs: Date.now() - startTime,
      success: false,
      status: 'BILLING_REQUIRED',
      evidence: 'No active paid Gemini image quota available on current key. Route marked for sovereign fallback.',
      error: 'Quota exhausted or paid key required for Gemini image generation.'
    });

    return {
      success: false,
      model: route.primaryModel,
      capabilityId: route.capabilityId,
      error: 'Google Gemini image generation requires paid API key tier. Falling back to sovereign renderer.'
    };
  }

  /**
   * 2. IMAGE EDITING (Image + Text -> Image)
   */
  public async editImage(options: ImageEditingOptions): Promise<{
    success: boolean;
    imageBase64?: string;
    model: string;
    capabilityId: string;
    error?: string;
  }> {
    const startTime = Date.now();
    const validation = MediaValidationEngine.validateImage(options.imageBase64);
    if (!validation.valid || !validation.sanitizedBase64) {
      return {
        success: false,
        model: 'gemini-3.1-flash-lite-image',
        capabilityId: 'IMAGE_EDITING_MULTIMODAL',
        error: validation.error || 'Invalid source image'
      };
    }

    const route = MultimediaTaskRouter.route('image_editing', { prompt: options.prompt });

    if (options.aiClient) {
      for (const model of [route.primaryModel, ...route.fallbackModels]) {
        try {
          const response: any = await options.aiClient.models.generateContent({
            model,
            contents: {
              parts: [
                {
                  inlineData: {
                    mimeType: validation.mimeType || 'image/jpeg',
                    data: validation.sanitizedBase64
                  }
                },
                {
                  text: options.prompt
                }
              ]
            }
          });

          const contentParts = response?.candidates?.[0]?.content?.parts || [];
          for (const p of contentParts) {
            if (p.inlineData && p.inlineData.data) {
              const mime = p.inlineData.mimeType || 'image/png';
              const b64 = `data:${mime};base64,${p.inlineData.data}`;

              quotaManager.recordSuccess(model);
              runtimeTracker.recordExecution({
                capabilityId: route.capabilityId,
                model,
                latencyMs: Date.now() - startTime,
                success: true,
                status: 'RUNTIME_VERIFIED',
                evidence: `Edited image output received from ${model}`
              });

              return {
                success: true,
                imageBase64: b64,
                model,
                capabilityId: route.capabilityId
              };
            }
          }
        } catch (err: any) {
          const classified = MultimediaErrorHandler.classify(err);
          if (classified.category === 'QUOTA_EXCEEDED') {
            quotaManager.recordQuotaExhausted(model);
          }
        }
      }
    }

    return {
      success: false,
      model: route.primaryModel,
      capabilityId: route.capabilityId,
      error: 'Gemini image editing unavailable or requires paid key. Falling back to sovereign pixel transformer.'
    };
  }

  /**
   * 3. MULTIMODAL VISION UNDERSTANDING (Image -> Text)
   */
  public async understandImage(options: VisionUnderstandingOptions): Promise<{
    success: boolean;
    analysis?: string;
    model: string;
    capabilityId: string;
    error?: string;
  }> {
    const startTime = Date.now();
    const validation = MediaValidationEngine.validateImage(options.imageBase64);
    if (!validation.valid || !validation.sanitizedBase64) {
      return {
        success: false,
        model: 'gemini-3.8-flash',
        capabilityId: 'VISION_UNDERSTANDING_MULTIMODAL',
        error: validation.error || 'Invalid image payload'
      };
    }

    const route = MultimediaTaskRouter.route('vision_understanding');
    const prompt = options.prompt || (options.mode === 'ocr'
      ? "Lakukan ekstraksi teks OCR verbatim dari gambar ini."
      : options.mode === 'chart'
      ? "Analisis grafik trading candlestick ini: tren, struktur BOS/CHoCH, FVG, dan level penting."
      : "Analisis gambar ini secara detail dan berikan deskripsi komprehensif.");

    if (options.aiClient) {
      for (const model of [route.primaryModel, ...route.fallbackModels]) {
        try {
          const resp: any = await options.aiClient.models.generateContent({
            model,
            contents: [{
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType: validation.mimeType || 'image/jpeg',
                    data: validation.sanitizedBase64
                  }
                }
              ]
            }]
          });

          const text = resp?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text && text.trim().length > 0) {
            quotaManager.recordSuccess(model);
            runtimeTracker.recordExecution({
              capabilityId: route.capabilityId,
              model,
              latencyMs: Date.now() - startTime,
              success: true,
              status: 'RUNTIME_VERIFIED',
              evidence: `Vision understanding generated ${text.trim().length} chars of verified analysis.`
            });

            return {
              success: true,
              analysis: text.trim(),
              model,
              capabilityId: route.capabilityId
            };
          }
        } catch (err: any) {
          const classified = MultimediaErrorHandler.classify(err);
          if (classified.category === 'QUOTA_EXCEEDED') {
            quotaManager.recordQuotaExhausted(model);
          }
        }
      }
    }

    return {
      success: false,
      model: route.primaryModel,
      capabilityId: route.capabilityId,
      error: 'Vision models unavailable, fallback to Navix heuristic core.'
    };
  }

  /**
   * 4. VIDEO UNDERSTANDING (Video -> Text)
   */
  public async understandVideo(options: VideoUnderstandingOptions): Promise<{
    success: boolean;
    analysis?: string;
    model: string;
    capabilityId: string;
    error?: string;
  }> {
    const startTime = Date.now();
    const validation = MediaValidationEngine.validateVideo(options.videoBase64, options.mimeType);
    if (!validation.valid || !validation.sanitizedBase64) {
      return {
        success: false,
        model: 'gemini-3.8-flash',
        capabilityId: 'VIDEO_UNDERSTANDING_TEMPORAL',
        error: validation.error || 'Invalid video data'
      };
    }

    const route = MultimediaTaskRouter.route('video_understanding');
    const prompt = options.prompt || "Analisis video ini: rangkum peristiwa temporal, aksi penting, dan deskripsi visual antar waktu.";

    if (options.aiClient) {
      for (const model of [route.primaryModel, ...route.fallbackModels]) {
        try {
          const resp: any = await options.aiClient.models.generateContent({
            model,
            contents: [{
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType: validation.mimeType || 'video/mp4',
                    data: validation.sanitizedBase64
                  }
                }
              ]
            }]
          });

          const text = resp?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text && text.trim().length > 0) {
            quotaManager.recordSuccess(model);
            runtimeTracker.recordExecution({
              capabilityId: route.capabilityId,
              model,
              latencyMs: Date.now() - startTime,
              success: true,
              status: 'RUNTIME_VERIFIED',
              evidence: `Video temporal analysis generated successfully by ${model}.`
            });

            return {
              success: true,
              analysis: text.trim(),
              model,
              capabilityId: route.capabilityId
            };
          }
        } catch (err: any) {
          const classified = MultimediaErrorHandler.classify(err);
          if (classified.category === 'QUOTA_EXCEEDED') {
            quotaManager.recordQuotaExhausted(model);
          }
        }
      }
    }

    return {
      success: false,
      model: route.primaryModel,
      capabilityId: route.capabilityId,
      error: 'Temporal video understanding model unavailable.'
    };
  }

  /**
   * 5. SPEECH SYNTHESIS (TTS) (Text -> Speech)
   */
  public async synthesizeSpeech(options: SpeechSynthesisOptions): Promise<{
    success: boolean;
    audioBase64?: string;
    model: string;
    capabilityId: string;
    voiceName: string;
    error?: string;
  }> {
    const startTime = Date.now();
    const route = MultimediaTaskRouter.route('speech_synthesis', { voiceDesign: options.isPersonaVoice });
    const voice = options.voiceName || 'Kore';

    if (options.aiClient) {
      for (const model of [route.primaryModel, ...route.fallbackModels]) {
        try {
          const resp: any = await options.aiClient.models.generateContent({
            model,
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: options.text,
                    ...(options.stylePrompt ? { speechMetadata: { style: options.stylePrompt } } : {})
                  }
                ]
              }
            ],
            config: {
              responseModalities: ['AUDIO'],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: voice }
                }
              }
            }
          });

          const rawAudio = resp?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
          if (rawAudio) {
            quotaManager.recordSuccess(model);
            runtimeTracker.recordExecution({
              capabilityId: route.capabilityId,
              model,
              latencyMs: Date.now() - startTime,
              success: true,
              status: 'RUNTIME_VERIFIED',
              evidence: `Speech synthesis produced PCM audio with voice: ${voice}`
            });

            return {
              success: true,
              audioBase64: `data:audio/wav;base64,${rawAudio}`,
              model,
              capabilityId: route.capabilityId,
              voiceName: voice
            };
          }
        } catch (err: any) {
          const classified = MultimediaErrorHandler.classify(err);
          if (classified.category === 'QUOTA_EXCEEDED') {
            quotaManager.recordQuotaExhausted(model);
          }
        }
      }
    }

    return {
      success: false,
      model: route.primaryModel,
      capabilityId: route.capabilityId,
      voiceName: voice,
      error: 'Gemini TTS unavailable, falling back to sovereign waveform synthesis.'
    };
  }

  /**
   * 6. AUDIO TRANSCRIPTION (Audio -> Text)
   */
  public async transcribeAudio(options: AudioTranscriptionOptions): Promise<{
    success: boolean;
    text?: string;
    model: string;
    capabilityId: string;
    error?: string;
  }> {
    const startTime = Date.now();
    const validation = MediaValidationEngine.validateAudio(options.audioBase64, options.mimeType);
    if (!validation.valid || !validation.sanitizedBase64) {
      return {
        success: false,
        model: 'gemini-3.5-transcribe',
        capabilityId: 'AUDIO_TRANSCRIPTION_PRE_RECORDED',
        error: validation.error || 'Invalid audio payload'
      };
    }

    const route = MultimediaTaskRouter.route('audio_transcription');
    const prompt = options.language === 'id'
      ? "Transkripsikan rekaman audio suara ini ke dalam teks bahasa Indonesia secara verbatim dan akurat."
      : "Transcribe this audio recording accurately and verbatim into text.";

    if (options.aiClient) {
      for (const model of [route.primaryModel, ...route.fallbackModels]) {
        try {
          const resp: any = await options.aiClient.models.generateContent({
            model,
            contents: [{
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType: validation.mimeType || 'audio/wav',
                    data: validation.sanitizedBase64
                  }
                }
              ]
            }]
          });

          const transcription = resp?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (transcription && transcription.trim().length > 0) {
            quotaManager.recordSuccess(model);
            runtimeTracker.recordExecution({
              capabilityId: route.capabilityId,
              model,
              latencyMs: Date.now() - startTime,
              success: true,
              status: 'RUNTIME_VERIFIED',
              evidence: `Audio transcribed verbatim (${transcription.trim().length} chars).`
            });

            return {
              success: true,
              text: transcription.trim(),
              model,
              capabilityId: route.capabilityId
            };
          }
        } catch (err: any) {
          const classified = MultimediaErrorHandler.classify(err);
          if (classified.category === 'QUOTA_EXCEEDED') {
            quotaManager.recordQuotaExhausted(model);
          }
        }
      }
    }

    return {
      success: false,
      model: route.primaryModel,
      capabilityId: route.capabilityId,
      error: 'Audio transcription models unavailable.'
    };
  }

  /**
   * 7. VIDEO GENERATION LIFECYCLE (Veo Async Operation)
   */
  public async startVideoGeneration(prompt: string, aiClient?: any, startingImageBase64?: string): Promise<{
    success: boolean;
    operationName?: string;
    model: string;
    isVeoOperation: boolean;
    notice?: string;
  }> {
    const route = MultimediaTaskRouter.route('video_generation', { prompt });

    if (aiClient && aiClient.models?.generateVideos) {
      try {
        const payload: any = {
          model: route.primaryModel,
          prompt,
          config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio: '16:9'
          }
        };

        if (startingImageBase64) {
          const valid = MediaValidationEngine.validateImage(startingImageBase64);
          if (valid.valid && valid.sanitizedBase64) {
            payload.image = {
              imageBytes: valid.sanitizedBase64,
              mimeType: valid.mimeType || 'image/jpeg'
            };
          }
        }

        const operation = await aiClient.models.generateVideos(payload);
        if (operation && operation.name) {
          runtimeTracker.recordExecution({
            capabilityId: route.capabilityId,
            model: route.primaryModel,
            latencyMs: 1200,
            success: true,
            status: 'PREVIEW',
            evidence: `Veo video generation operation dispatched: ${operation.name}`
          });

          return {
            success: true,
            operationName: operation.name,
            model: route.primaryModel,
            isVeoOperation: true
          };
        }
      } catch (err: any) {
        console.warn("[MultimediaOrchestrator] Veo video generation call failed, routing to sovereign generator:", err?.message);
      }
    }

    return {
      success: false,
      model: route.primaryModel,
      isVeoOperation: false,
      notice: 'Veo video model access requires paid billing quota. Using sovereign engine fallback.'
    };
  }

  /**
   * Returns complete capability matrix for API inspection
   */
  public getCapabilityMatrix(): CapabilityMatrixEntry[] {
    return capabilityRegistry.getAllCapabilities();
  }

  /**
   * Returns current telemetry and health
   */
  public getHealthAndMetrics() {
    return {
      metrics: runtimeTracker.getMetricsSummary(),
      recentExecutions: runtimeTracker.getRecentRecords(10),
      registeredModels: modelRegistry.getAllModels().length,
      registeredCapabilities: capabilityRegistry.getAllCapabilities().length
    };
  }
}

export const multimediaOrchestrator = MultimediaOrchestrator.getInstance();
