/**
 * NAVIX OPEN-SOURCE ENGINE CORE: FASTER-WHISPER VAD & ACOUSTIC FRAME ALIGNMENT
 * Adapted from faster-whisper (https://github.com/SYSTRAN/faster-whisper)
 * License: MIT
 * 
 * Provides Voice Activity Detection (VAD), silence boundary pruning,
 * Short-Time Energy (STE), and acoustic frame segmentation.
 */

export interface SpeechSegment {
  segmentIndex: number;
  startMs: number;
  endMs: number;
  durationMs: number;
  averageEnergy: number;
  isVoiced: boolean;
}

export interface VadProcessingResult {
  totalDurationMs: number;
  speechDurationMs: number;
  silenceDurationMs: number;
  speechRatio: number;
  segments: SpeechSegment[];
  cleanBase64Data?: string;
}

export class FasterWhisperVADCore {
  /**
   * Processes PCM/WAV buffer or base64 audio and extracts voiced speech segments
   */
  public static processVad(audioBufferOrBase64: Buffer | string, sampleRate: number = 24000): VadProcessingResult {
    let buffer: Buffer;
    if (typeof audioBufferOrBase64 === 'string') {
      const cleanB64 = audioBufferOrBase64.replace(/^data:audio\/[^;]+;base64,/, '').replace(/\s+/g, '');
      buffer = Buffer.from(cleanB64, 'base64');
    } else {
      buffer = audioBufferOrBase64;
    }

    // Skip WAV header (44 bytes) if present
    let offset = 0;
    if (buffer.length > 44 && buffer.toString('ascii', 0, 4) === 'RIFF') {
      offset = 44;
    }

    const bytesPerSample = 2; // 16-bit PCM
    const totalSamples = Math.floor((buffer.length - offset) / bytesPerSample);
    const totalDurationMs = Math.round((totalSamples / sampleRate) * 1000);

    if (totalSamples <= 0) {
      return {
        totalDurationMs: 0,
        speechDurationMs: 0,
        silenceDurationMs: 0,
        speechRatio: 0,
        segments: []
      };
    }

    // Frame configuration (30ms frames)
    const frameSizeSamples = Math.floor(sampleRate * 0.03); // 30ms
    const totalFrames = Math.floor(totalSamples / frameSizeSamples);

    const segments: SpeechSegment[] = [];
    let inSpeech = false;
    let currentStartMs = 0;
    let currentEnergySum = 0;
    let currentFrameCount = 0;

    let totalSpeechDurationMs = 0;
    const energyThreshold = 500; // Energy threshold for 16-bit PCM amplitude

    for (let f = 0; f < totalFrames; f++) {
      const frameStartByte = offset + (f * frameSizeSamples * bytesPerSample);
      let frameEnergy = 0;

      for (let s = 0; s < frameSizeSamples; s++) {
        const sampleByteIndex = frameStartByte + (s * bytesPerSample);
        if (sampleByteIndex + 1 < buffer.length) {
          const sample = buffer.readInt16LE(sampleByteIndex);
          frameEnergy += Math.abs(sample);
        }
      }

      const avgFrameEnergy = frameEnergy / frameSizeSamples;
      const isFrameVoiced = avgFrameEnergy > energyThreshold;
      const frameTimeMs = Math.round((f * frameSizeSamples / sampleRate) * 1000);

      if (isFrameVoiced) {
        if (!inSpeech) {
          inSpeech = true;
          currentStartMs = frameTimeMs;
          currentEnergySum = avgFrameEnergy;
          currentFrameCount = 1;
        } else {
          currentEnergySum += avgFrameEnergy;
          currentFrameCount++;
        }
      } else {
        if (inSpeech) {
          const endMs = frameTimeMs;
          const duration = endMs - currentStartMs;
          if (duration >= 90) { // Minimum 90ms for valid speech segment
            segments.push({
              segmentIndex: segments.length + 1,
              startMs: currentStartMs,
              endMs,
              durationMs: duration,
              averageEnergy: Math.round(currentEnergySum / currentFrameCount),
              isVoiced: true
            });
            totalSpeechDurationMs += duration;
          }
          inSpeech = false;
        }
      }
    }

    // Close last segment if still open
    if (inSpeech) {
      const endMs = totalDurationMs;
      const duration = endMs - currentStartMs;
      segments.push({
        segmentIndex: segments.length + 1,
        startMs: currentStartMs,
        endMs,
        durationMs: duration,
        averageEnergy: Math.round(currentEnergySum / currentFrameCount),
        isVoiced: true
      });
      totalSpeechDurationMs += duration;
    }

    const silenceDurationMs = Math.max(0, totalDurationMs - totalSpeechDurationMs);
    const speechRatio = totalDurationMs > 0 ? parseFloat((totalSpeechDurationMs / totalDurationMs).toFixed(3)) : 0;

    return {
      totalDurationMs,
      speechDurationMs: totalSpeechDurationMs,
      silenceDurationMs,
      speechRatio,
      segments
    };
  }
}
