/**
 * NAVIX MULTIMEDIA ENGINE v2.0 - TASK ROUTER
 * Routes user requests to appropriate models, capabilities, and fallback paths.
 */

import { modelRegistry, ModelMetadata } from './ModelRegistry';
import { capabilityRegistry, CapabilityMatrixEntry } from './CapabilityRegistry';
import { quotaManager } from './QuotaManager';

export type MultimediaTaskType = 
  | 'image_generation'
  | 'image_editing'
  | 'vision_understanding'
  | 'video_generation'
  | 'video_understanding'
  | 'speech_synthesis'
  | 'audio_transcription'
  | 'music_generation'
  | 'live_stream';

export interface RouteDecision {
  taskType: MultimediaTaskType;
  capabilityId: string;
  primaryModel: string;
  fallbackModels: string[];
  requiresPaidKey: boolean;
  requiresPolling: boolean;
  targetMimeType?: string;
  notes: string;
}

export class MultimediaTaskRouter {
  public static route(
    taskType: MultimediaTaskType,
    params?: {
      prompt?: string;
      highQuality?: boolean;
      voiceDesign?: boolean;
      aspectRatio?: string;
      resolution?: string;
      hasImageAttachment?: boolean;
      hasAudioAttachment?: boolean;
      hasVideoAttachment?: boolean;
    }
  ): RouteDecision {
    switch (taskType) {
      case 'image_generation': {
        const isHq = params?.highQuality || params?.resolution === '4K' || params?.resolution === '2K';
        const primary = isHq ? 'gemini-3.1-flash-image' : 'gemini-3.1-flash-lite-image';
        const capabilityId = isHq ? 'IMAGE_GENERATION_HIGH_RES' : 'IMAGE_GENERATION_STANDARD';
        const available = quotaManager.getAvailableFallback(primary, ['gemini-3.1-flash-lite-image', 'gemini-3.1-flash-image']);

        return {
          taskType,
          capabilityId,
          primaryModel: available,
          fallbackModels: ['gemini-3.1-flash-lite-image', 'gemini-3.1-flash-image'],
          requiresPaidKey: true,
          requiresPolling: false,
          notes: 'Standard / HQ Nano Banana image generation with sovereign fallback.'
        };
      }

      case 'image_editing': {
        return {
          taskType,
          capabilityId: 'IMAGE_EDITING_MULTIMODAL',
          primaryModel: 'gemini-3.1-flash-lite-image',
          fallbackModels: ['gemini-3.1-flash-image'],
          requiresPaidKey: true,
          requiresPolling: false,
          notes: 'Multimodal image editing with text instructions.'
        };
      }

      case 'vision_understanding': {
        const available = quotaManager.getAvailableFallback('gemini-3.8-flash', ['gemini-3.8-flash', 'gemini-3.1-flash-lite']);
        return {
          taskType,
          capabilityId: 'VISION_UNDERSTANDING_MULTIMODAL',
          primaryModel: available,
          fallbackModels: ['gemini-3.1-flash-lite'],
          requiresPaidKey: false,
          requiresPolling: false,
          notes: 'Deep multimodal image, chart, and OCR analysis.'
        };
      }

      case 'video_understanding': {
        return {
          taskType,
          capabilityId: 'VIDEO_UNDERSTANDING_TEMPORAL',
          primaryModel: 'gemini-3.8-flash',
          fallbackModels: ['gemini-3.1-flash-lite'],
          requiresPaidKey: false,
          requiresPolling: false,
          notes: 'Temporal video file analysis with frame inspection.'
        };
      }

      case 'video_generation': {
        const isPro = params?.resolution === '4K' || (params?.prompt && params.prompt.includes('extend'));
        const primary = isPro ? 'veo-3.1-generate-preview' : 'veo-3.1-lite-generate-preview';
        const capabilityId = isPro ? 'VIDEO_GENERATION_PRO' : 'VIDEO_GENERATION_GENERAL';
        return {
          taskType,
          capabilityId,
          primaryModel: primary,
          fallbackModels: ['veo-3.1-lite-generate-preview'],
          requiresPaidKey: true,
          requiresPolling: true,
          notes: 'Veo Video generation with 3-step async operation pattern.'
        };
      }

      case 'speech_synthesis': {
        const isPersona = params?.voiceDesign === true;
        const primary = isPersona ? 'gemini-3.8-flash-tts' : 'gemini-3.8-flash-lite-tts';
        const capabilityId = isPersona ? 'SPEECH_SYNTHESIS_PERSONA' : 'SPEECH_SYNTHESIS_STANDARD';
        return {
          taskType,
          capabilityId,
          primaryModel: primary,
          fallbackModels: ['gemini-3.8-flash-lite-tts'],
          requiresPaidKey: false,
          requiresPolling: false,
          notes: 'Acoustic TTS synthesis with 24000Hz PCM audio.'
        };
      }

      case 'audio_transcription': {
        return {
          taskType,
          capabilityId: 'AUDIO_TRANSCRIPTION_PRE_RECORDED',
          primaryModel: 'gemini-3.5-transcribe',
          fallbackModels: ['gemini-3.8-flash', 'gemini-3.1-flash-lite'],
          requiresPaidKey: false,
          requiresPolling: false,
          notes: 'Verbatim pre-recorded audio transcription.'
        };
      }

      case 'music_generation': {
        return {
          taskType,
          capabilityId: 'MUSIC_GENERATION_STUDIO',
          primaryModel: 'lyria-3-clip-preview',
          fallbackModels: ['lyria-3-pro-preview'],
          requiresPaidKey: true,
          requiresPolling: false,
          notes: 'Lyria music synthesis with sovereign audio studio fallback.'
        };
      }

      case 'live_stream': {
        return {
          taskType,
          capabilityId: 'LIVE_MULTIMODAL_CONVERSATION',
          primaryModel: 'gemini-3.8-live',
          fallbackModels: ['gemini-3.8-live-extended-thinking'],
          requiresPaidKey: false,
          requiresPolling: false,
          notes: 'Live bidirectional audio and visual conversation.'
        };
      }

      default:
        throw new Error(`Unknown multimedia task type: ${taskType}`);
    }
  }
}
