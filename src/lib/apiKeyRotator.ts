export interface KeyItem {
  key: string;
  status: 'active' | 'exhausted' | 'invalid';
  errorCount: number;
  lastUsed?: number;
  cooldownUntil?: number;
  errorMsg?: string;
}

const STORAGE_KEYS_LIST = 'navix_gemini_api_keys';

// Load keys from localStorage with automatic cooldown recovery (60 seconds)
export function getRotationKeys(): KeyItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS_LIST);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const now = Date.now();
        let changed = false;
        
        const processed = parsed.map(k => {
          if (k.status === 'exhausted' && k.cooldownUntil && now > k.cooldownUntil) {
            changed = true;
            return {
              ...k,
              status: 'active' as const,
              errorMsg: undefined,
              cooldownUntil: undefined
            };
          }
          return k;
        });

        if (changed) {
          saveRotationKeys(processed);
        }
        return processed;
      }
    }
  } catch (err) {
    console.error('Error parsing rotation keys:', err);
  }

  // Fallback: Check if there's an old single key saved
  const oldKey = localStorage.getItem('navix_gemini_api_key');
  if (oldKey) {
    const fallbackList: KeyItem[] = [{
      key: oldKey,
      status: 'active',
      errorCount: 0,
      lastUsed: Date.now()
    }];
    saveRotationKeys(fallbackList);
    return fallbackList;
  }

  return [];
}

// Save keys to localStorage
export function saveRotationKeys(keys: KeyItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS_LIST, JSON.stringify(keys));
  } catch (err) {
    console.error('Error saving rotation keys:', err);
  }
}

// Sanitize a key
export function sanitizeApiKey(key: string): string {
  return key.trim().replace(/['"\s]/g, '').replace(/[^\x20-\x7E]/g, '');
}

// Get the first active key (or auto-recover if all keys exhausted)
export function getActiveApiKey(): string | null {
  let keys = getRotationKeys();
  let activeKeyItem = keys.find(k => k.status === 'active');
  
  if (!activeKeyItem && keys.length > 0) {
    // If all keys marked exhausted or invalid, auto-reset exhausted ones to active so rotation keeps going
    console.warn('[API KEY ROTATOR] All keys currently exhausted. Performing auto-recovery reset...');
    resetAllRotationKeys();
    keys = getRotationKeys();
    activeKeyItem = keys.find(k => k.status === 'active') || keys[0];
  }

  if (activeKeyItem) {
    activeKeyItem.lastUsed = Date.now();
    saveRotationKeys(keys);
    return activeKeyItem.key;
  }
  return null;
}

// Get all valid keys as comma-separated string for multi-key pool header (up to 100)
export function getAllActiveKeysHeader(): string | null {
  // Deliberately never expose API keys to network requests. Keys are server-owned secrets.
  return null;
}

// Mark a key with a specific status
export function updateKeyStatus(key: string, status: 'active' | 'exhausted' | 'invalid', errorMsg?: string): void {
  const keys = getRotationKeys();
  const index = keys.findIndex(k => k.key === key);
  if (index !== -1) {
    keys[index].status = status;
    if (errorMsg) {
      keys[index].errorMsg = errorMsg;
    }
    if (status !== 'active') {
      keys[index].errorCount += 1;
    }
    if (status === 'exhausted') {
      // Cooldown for 60 seconds (60000ms)
      keys[index].cooldownUntil = Date.now() + 60000;
    } else {
      keys[index].cooldownUntil = undefined;
    }
    saveRotationKeys(keys);
    console.warn(`[API KEY ROTATION] Key index ${index} (${key.substring(0, 6)}...) status changed to ${status}. Error: ${errorMsg || 'None'}`);
  }
}

// Reset all keys to active status
export function resetAllRotationKeys(): void {
  const keys = getRotationKeys();
  const updated = keys.map(k => ({
    ...k,
    status: 'active' as const,
    errorMsg: undefined,
    cooldownUntil: undefined
  }));
  saveRotationKeys(updated);
}

// Detect if response contains quota or auth errors
function isQuotaOrAuthError(status: number, responseBody: any): { isError: boolean; type: 'exhausted' | 'invalid'; message: string } {
  const bodyText = typeof responseBody === 'string' 
    ? responseBody.toLowerCase() 
    : JSON.stringify(responseBody).toLowerCase();

  const hasQuotaKeyword = bodyText.includes('quota') || 
                           bodyText.includes('rate limit') || 
                           bodyText.includes('exceeded') || 
                           bodyText.includes('429') ||
                           bodyText.includes('resource_exhausted');

  const hasAuthKeyword = bodyText.includes('unauthenticated') || 
                          bodyText.includes('invalid authentication') || 
                          bodyText.includes('401') ||
                          bodyText.includes('api key not valid') ||
                          bodyText.includes('access_token_type_unsupported');

  if (status === 429 || hasQuotaKeyword) {
    return {
      isError: true,
      type: 'exhausted',
      message: responseBody.error?.message || responseBody.error || 'Quota / Limit Habis (429)'
    };
  }

  if (status === 401 || hasAuthKeyword) {
    return {
      isError: true,
      type: 'invalid',
      message: responseBody.error?.message || responseBody.error || 'API Key Tidak Valid (401)'
    };
  }

  return { isError: false, type: 'exhausted', message: '' };
}

// Enhanced fetch wrapper with high-speed key rotation and resilient timeout guard
export async function rotateFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = new Headers(options.headers || {});
  headers.delete('x-custom-api-key');
  const token = typeof localStorage !== 'undefined' ? (localStorage.getItem('navix_auth_token') || localStorage.getItem('navix_token')) : null;
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return fetch(url, { ...options, headers, signal: options.signal || AbortSignal.timeout(90000) });
}
