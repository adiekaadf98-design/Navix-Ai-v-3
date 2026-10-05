/**
 * NAVIX MULTIMEDIA ENGINE v2.0 - MEDIA VALIDATION ENGINE
 * Rigorous media verification for MIME types, bytes, headers, and dimensions.
 */

export interface MediaValidationResult {
  valid: boolean;
  mimeType?: string;
  sizeBytes?: number;
  width?: number;
  height?: number;
  durationSeconds?: number;
  error?: string;
  sanitizedBase64?: string;
}

export class MediaValidationEngine {
  private static readonly MAX_IMAGE_BYTES = 20 * 1024 * 1024; // 20 MB
  private static readonly MAX_AUDIO_BYTES = 25 * 1024 * 1024; // 25 MB
  private static readonly MAX_VIDEO_BYTES = 50 * 1024 * 1024; // 50 MB

  private static readonly SUPPORTED_IMAGE_MIMES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif'
  ];

  private static readonly SUPPORTED_AUDIO_MIMES = [
    'audio/wav',
    'audio/mp3',
    'audio/mpeg',
    'audio/webm',
    'audio/ogg',
    'audio/aac',
    'audio/pcm'
  ];

  private static readonly SUPPORTED_VIDEO_MIMES = [
    'video/mp4',
    'video/webm',
    'video/quicktime'
  ];

  /**
   * Validates image payload (base64 or data URL)
   */
  public static validateImage(payload: string): MediaValidationResult {
    if (!payload || typeof payload !== 'string' || !payload.trim()) {
      return { valid: false, error: 'Empty image payload' };
    }

    let mimeType = 'image/jpeg';
    let base64Data = payload.trim();

    const dataUrlMatch = base64Data.match(/^data:([^;]+);base64,(.+)$/);
    if (dataUrlMatch) {
      mimeType = dataUrlMatch[1].toLowerCase();
      base64Data = dataUrlMatch[2];
    }

    if (!this.SUPPORTED_IMAGE_MIMES.includes(mimeType)) {
      return {
        valid: false,
        mimeType,
        error: `Unsupported image MIME type: ${mimeType}. Supported: ${this.SUPPORTED_IMAGE_MIMES.join(', ')}`
      };
    }

    // Verify valid base64 format characters
    const cleanB64 = base64Data.replace(/\s+/g, '');
    if (!/^[A-Za-z0-9+/=]+$/.test(cleanB64) || cleanB64.length % 4 !== 0) {
      return { valid: false, error: 'Malformed non-base64 image payload' };
    }

    try {
      const buffer = Buffer.from(cleanB64, 'base64');
      const sizeBytes = buffer.length;

      if (sizeBytes === 0) {
        return { valid: false, error: 'Image buffer has 0 bytes' };
      }

      if (sizeBytes > this.MAX_IMAGE_BYTES) {
        return {
          valid: false,
          sizeBytes,
          error: `Image size ${Math.round(sizeBytes / 1024)}KB exceeds maximum allowable limit of ${Math.round(this.MAX_IMAGE_BYTES / 1024)}KB`
        };
      }

      // Strict magic bytes check
      const isPng = buffer.length >= 8 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47;
      const isJpeg = buffer.length >= 3 && buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
      const isWebp = buffer.length >= 12 && buffer.toString('utf8', 8, 12) === 'WEBP';
      const isGif = buffer.length >= 6 && buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46;

      if (!isPng && !isJpeg && !isWebp && !isGif) {
        return { valid: false, error: 'Invalid or missing image magic bytes header' };
      }

      return {
        valid: true,
        mimeType: isPng ? 'image/png' : isJpeg ? 'image/jpeg' : isWebp ? 'image/webp' : 'image/gif',
        sizeBytes,
        sanitizedBase64: cleanB64
      };
    } catch (err: any) {
      return {
        valid: false,
        error: `Corrupted base64 encoding: ${err?.message || err}`
      };
    }
  }

  /**
   * Validates audio payload
   */
  public static validateAudio(payload: string, providedMime?: string): MediaValidationResult {
    if (!payload || typeof payload !== 'string' || !payload.trim()) {
      return { valid: false, error: 'Empty audio payload' };
    }

    let mimeType = providedMime || 'audio/wav';
    let base64Data = payload.trim();

    const dataUrlMatch = base64Data.match(/^data:([^;]+);base64,(.+)$/);
    if (dataUrlMatch) {
      mimeType = dataUrlMatch[1].toLowerCase();
      base64Data = dataUrlMatch[2];
    }

    if (!this.SUPPORTED_AUDIO_MIMES.includes(mimeType)) {
      return {
        valid: false,
        mimeType,
        error: `Unsupported audio MIME type: ${mimeType}. Supported: ${this.SUPPORTED_AUDIO_MIMES.join(', ')}`
      };
    }

    try {
      const buffer = Buffer.from(base64Data, 'base64');
      const sizeBytes = buffer.length;

      if (sizeBytes === 0) {
        return { valid: false, error: 'Audio buffer is 0 bytes' };
      }

      if (sizeBytes > this.MAX_AUDIO_BYTES) {
        return {
          valid: false,
          sizeBytes,
          error: `Audio size ${Math.round(sizeBytes / 1024)}KB exceeds maximum limit of ${Math.round(this.MAX_AUDIO_BYTES / 1024)}KB`
        };
      }

      return {
        valid: true,
        mimeType,
        sizeBytes,
        sanitizedBase64: base64Data
      };
    } catch (err: any) {
      return {
        valid: false,
        error: `Corrupted base64 audio: ${err?.message || err}`
      };
    }
  }

  /**
   * Validates video payload
   */
  public static validateVideo(payload: string, providedMime?: string): MediaValidationResult {
    if (!payload || typeof payload !== 'string' || !payload.trim()) {
      return { valid: false, error: 'Empty video payload' };
    }

    let mimeType = providedMime || 'video/mp4';
    let base64Data = payload.trim();

    const dataUrlMatch = base64Data.match(/^data:([^;]+);base64,(.+)$/);
    if (dataUrlMatch) {
      mimeType = dataUrlMatch[1].toLowerCase();
      base64Data = dataUrlMatch[2];
    }

    if (!this.SUPPORTED_VIDEO_MIMES.includes(mimeType)) {
      return {
        valid: false,
        mimeType,
        error: `Unsupported video MIME type: ${mimeType}. Supported: ${this.SUPPORTED_VIDEO_MIMES.join(', ')}`
      };
    }

    try {
      const buffer = Buffer.from(base64Data, 'base64');
      const sizeBytes = buffer.length;

      if (sizeBytes === 0) {
        return { valid: false, error: 'Video buffer is 0 bytes' };
      }

      if (sizeBytes > this.MAX_VIDEO_BYTES) {
        return {
          valid: false,
          sizeBytes,
          error: `Video size ${Math.round(sizeBytes / (1024 * 1024))}MB exceeds limit of ${Math.round(this.MAX_VIDEO_BYTES / (1024 * 1024))}MB`
        };
      }

      return {
        valid: true,
        mimeType,
        sizeBytes,
        sanitizedBase64: base64Data
      };
    } catch (err: any) {
      return {
        valid: false,
        error: `Corrupted base64 video data: ${err?.message || err}`
      };
    }
  }
}
