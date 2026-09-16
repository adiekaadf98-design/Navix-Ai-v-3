// IndexedDB Persistent Vault for Navix AI Multimedia Assets
// Prevents media from disappearing across renders, sessions, and reloads

const DB_NAME = 'NavixMediaVault';
const DB_VERSION = 1;
const STORE_NAME = 'media_items';

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      console.warn('IndexedDB open error:', request.error);
      reject(request.error);
    };
  });

  return dbPromise;
}

export function computeMediaKey(media: { type: string; prompt?: string; image?: string; aspectRatio?: string; operation?: string }): string {
  const cleanPrompt = (media.prompt || '').trim().toLowerCase();
  const type = media.type || 'image';
  const op = media.operation || '';
  const ar = media.aspectRatio || '1:1';
  
  // Create a stable deterministic hash
  let hash = 0;
  const str = `${type}:${op}:${ar}:${cleanPrompt}`;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return `navix_media_${type}_${Math.abs(hash)}`;
}

export interface CachedMediaItem {
  id: string;
  type: string;
  prompt: string;
  mediaUrl: string;
  createdAt: number;
}

// In-memory quick lookup cache
const memoryCache = new Map<string, CachedMediaItem>();

export async function saveMediaToVault(key: string, data: { type: string; prompt: string; mediaUrl: string }): Promise<void> {
  const item: CachedMediaItem = {
    id: key,
    type: data.type,
    prompt: data.prompt,
    mediaUrl: data.mediaUrl,
    createdAt: Date.now()
  };

  // 1. Memory cache
  memoryCache.set(key, item);

  // 2. IndexedDB
  try {
    const db = await getDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(item);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (idbErr) {
    // Fallback: If IndexedDB fails, save small items to localStorage
    try {
      if (item.mediaUrl.length < 500000) {
        localStorage.setItem(`vault_${key}`, JSON.stringify(item));
      }
    } catch (lsErr) {
      console.warn('Storage fallback error:', lsErr);
    }
  }

  // 3. Dispatch global event so components know media is persisted
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('navix_media_saved', { detail: item }));
  }

  // 4. Cloud Firestore Vault Sync (Never lost across devices or sessions)
  try {
    import('../services/firestoreSync').then(({ firestoreSync }) => {
      firestoreSync.saveMediaVaultItem({
        id: key,
        type: data.type,
        prompt: data.prompt,
        mediaUrl: data.mediaUrl,
        createdAt: item.createdAt
      }).catch((err) => {
        console.warn('Firestore cloud vault sync notice:', err);
      });
    }).catch(() => {});
  } catch {
    // Non-blocking offline fallback
  }
}

export async function getMediaFromVault(key: string): Promise<CachedMediaItem | null> {
  // 1. Check memory cache first (instant)
  if (memoryCache.has(key)) {
    return memoryCache.get(key)!;
  }

  // 2. Check IndexedDB
  try {
    const db = await getDB();
    const item = await new Promise<CachedMediaItem | null>((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });

    if (item) {
      memoryCache.set(key, item);
      return item;
    }
  } catch (idbErr) {
    // Fallback to localStorage
    try {
      const raw = localStorage.getItem(`vault_${key}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        memoryCache.set(key, parsed);
        return parsed;
      }
    } catch {
      // ignore
    }
  }

  return null;
}

// Helper to convert base64 or remote image URL to raw uncompressed Blob
export async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  if (dataUrl.startsWith('data:')) {
    const parts = dataUrl.split(',');
    const mimeMatch = parts[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const binary = atob(parts[1]);
    const array = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      array[i] = binary.charCodeAt(i);
    }
    return new Blob([array], { type: mime });
  }

  // Fetch directly as blob from network/CDN
  const response = await fetch(dataUrl);
  return await response.blob();
}

export const mediaStore = {
  getDB,
  computeMediaKey,
  saveMediaToVault,
  getMediaFromVault,
  dataUrlToBlob,

  // Direct In-Memory Object URL mapping cache for zero-compression instant rendering
  _blobUrlCache: new Map<string, string>(),

  async getMediaBlobObjectUrl(keyOrUrl: string): Promise<string | null> {
    if (!keyOrUrl) return null;

    // If already a blob URL, pass through
    if (keyOrUrl.startsWith('blob:')) {
      return keyOrUrl;
    }

    // Check active Object URL cache
    if (this._blobUrlCache.has(keyOrUrl)) {
      return this._blobUrlCache.get(keyOrUrl)!;
    }

    // Retrieve original uncompressed media blob from MediaVault
    const mediaResult = await this.getOriginalMediaBlob(keyOrUrl);
    if (!mediaResult || !mediaResult.blob) {
      return keyOrUrl; // Fallback to raw URL/base64 if blob creation fails
    }

    // Create a pristine uncompressed browser Object URL
    const objectUrl = URL.createObjectURL(mediaResult.blob);
    this._blobUrlCache.set(keyOrUrl, objectUrl);

    // If a vault item exists, also cache under its vault ID
    if (mediaResult.originalUrl && mediaResult.originalUrl !== keyOrUrl) {
      this._blobUrlCache.set(mediaResult.originalUrl, objectUrl);
    }

    return objectUrl;
  },

  revokeMediaBlobObjectUrl(keyOrUrl: string): void {
    if (this._blobUrlCache.has(keyOrUrl)) {
      const url = this._blobUrlCache.get(keyOrUrl);
      if (url && url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
      this._blobUrlCache.delete(keyOrUrl);
    }
  },

  async getOriginalMediaBlob(keyOrUrl: string): Promise<{ blob: Blob; mimeType: string; sizeBytes: number; originalUrl: string } | null> {
    if (!keyOrUrl) return null;

    let targetUrl = keyOrUrl;
    // 1. Check if key exists in vault
    if (!keyOrUrl.startsWith('data:') && !keyOrUrl.startsWith('http://') && !keyOrUrl.startsWith('https://')) {
      const item = await getMediaFromVault(keyOrUrl);
      if (item && item.mediaUrl) {
        targetUrl = item.mediaUrl;
      }
    }

    try {
      const blob = await dataUrlToBlob(targetUrl);
      return {
        blob,
        mimeType: blob.type || 'image/jpeg',
        sizeBytes: blob.size,
        originalUrl: targetUrl
      };
    } catch (err) {
      console.warn('mediaStore failed to resolve raw blob:', err);
      return null;
    }
  },

  async findMediaByUrl(url: string): Promise<CachedMediaItem | null> {
    for (const item of memoryCache.values()) {
      if (item.mediaUrl === url) return item;
    }
    return null;
  }
};

