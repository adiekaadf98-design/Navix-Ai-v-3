/**
 * NAVIX MULTIMEDIA ENGINE v2.0 - MEDIA STORAGE MANAGER
 * Manages server-side media assets, caching, and safe retrieval.
 * Safe for both browser and Node.js environments.
 */

export interface StoredMediaMetadata {
  id: string;
  category: 'image' | 'video' | 'audio';
  mimeType: string;
  fileName: string;
  sizeBytes: number;
  createdAt: number;
  uri?: string;
  isSyntheticMotion?: boolean;
}

export class MediaStorageManager {
  private static instance: MediaStorageManager;
  private tempDir: string = '';
  private metadataCache: Map<string, StoredMediaMetadata> = new Map();
  private memoryVault: Map<string, Uint8Array | string> = new Map();

  private constructor() {
    if (typeof window === 'undefined' && typeof process !== 'undefined' && process.cwd) {
      try {
        import('path').then(p => {
          this.tempDir = p.join(process.cwd(), 'tmp', 'multimedia');
          this.ensureDirectory();
        }).catch(() => {});
      } catch {
        // Safe fallback in browser/restricted environments
      }
    }
  }

  public static getInstance(): MediaStorageManager {
    if (!MediaStorageManager.instance) {
      MediaStorageManager.instance = new MediaStorageManager();
    }
    return MediaStorageManager.instance;
  }

  private async ensureDirectory(): Promise<void> {
    if (typeof window !== 'undefined' || typeof process === 'undefined') return;
    try {
      const fs = await import('fs');
      if (this.tempDir && !fs.existsSync(this.tempDir)) {
        fs.mkdirSync(this.tempDir, { recursive: true });
      }
    } catch (err) {
      console.warn('[MediaStorageManager] Could not initialize tmp directory:', err);
    }
  }

  public saveBuffer(
    id: string,
    buffer: any,
    category: 'image' | 'video' | 'audio',
    mimeType: string,
    extra?: { isSyntheticMotion?: boolean }
  ): StoredMediaMetadata {
    const ext = mimeType.split('/')[1] || (category === 'image' ? 'jpg' : category === 'video' ? 'mp4' : 'wav');
    const fileName = `${id}.${ext}`;
    const sizeBytes = buffer ? (buffer.length || buffer.byteLength || 0) : 0;

    if (typeof window === 'undefined' && typeof process !== 'undefined' && this.tempDir) {
      try {
        import('fs').then(fs => {
          import('path').then(p => {
            const filePath = p.join(this.tempDir, fileName);
            fs.writeFileSync(filePath, buffer);
          });
        }).catch(() => {});
      } catch {
        // fallback
      }
    } else {
      this.memoryVault.set(id, buffer);
    }

    const meta: StoredMediaMetadata = {
      id,
      category,
      mimeType,
      fileName,
      sizeBytes,
      createdAt: Date.now(),
      uri: `/api/multimedia/asset/${id}`,
      isSyntheticMotion: extra?.isSyntheticMotion
    };

    this.metadataCache.set(id, meta);
    return meta;
  }

  public getFilePath(id: string): string | null {
    const meta = this.metadataCache.get(id);
    if (!meta) return null;
    return meta.uri || null;
  }

  public getMetadata(id: string): StoredMediaMetadata | undefined {
    return this.metadataCache.get(id);
  }

  public cleanupOlderThan(maxAgeMs: number = 3600000): void {
    const now = Date.now();
    for (const [id, meta] of this.metadataCache.entries()) {
      if (now - meta.createdAt > maxAgeMs) {
        this.metadataCache.delete(id);
        this.memoryVault.delete(id);
      }
    }
  }
}

export const mediaStorageManager = MediaStorageManager.getInstance();
