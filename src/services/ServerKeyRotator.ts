import { GoogleGenAI } from '@google/genai';

export interface ServerKeyItem {
  key: string;
  status: 'active' | 'exhausted' | 'invalid';
  errorCount: number;
  lastUsed?: number;
  cooldownUntil?: number;
  errorMsg?: string;
}

class ServerKeyRotatorManager {
  private keyPool: ServerKeyItem[] = [];

  constructor() {
    this.refreshPool();
  }

  // Parse keys safely from environment or storage
  public refreshPool(additionalKeys: string[] = []) {
    const rawKeys: string[] = [];

    if (typeof process !== 'undefined' && process.env) {
      // 1. Check GEMINI_API_KEYS
      if (process.env.GEMINI_API_KEYS) {
        rawKeys.push(...process.env.GEMINI_API_KEYS.split(/[\n,;]+/).map(k => k.trim()));
      }

      // 2. Check GEMINI_API_KEY
      if (process.env.GEMINI_API_KEY) {
        rawKeys.push(...process.env.GEMINI_API_KEY.split(/[\n,;]+/).map(k => k.trim()));
      }

      // 3. Check numbered env vars GEMINI_API_KEY_1 to 100
      for (let i = 1; i <= 100; i++) {
        const k = process.env[`GEMINI_API_KEY_${i}`];
        if (k) rawKeys.push(k.trim());
      }
    }

    // 4. Add additional keys
    rawKeys.push(...additionalKeys);

    const validKeys = Array.from(new Set(rawKeys))
      .map(k => k.trim().replace(/['"\s]/g, ''))
      .filter(k => k.length > 10);

    for (const key of validKeys) {
      if (!this.keyPool.some(item => item.key === key)) {
        this.keyPool.push({
          key,
          status: 'active',
          errorCount: 0
        });
      }
    }

    if (this.keyPool.length === 0 && typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) {
      this.keyPool.push({
        key: process.env.GEMINI_API_KEY.trim(),
        status: 'active',
        errorCount: 0
      });
    }
  }

  public getActiveKeys(customKey?: string): string[] {
    this.checkCooldowns();
    const active = this.keyPool
      .filter(k => k.status === 'active')
      .map(k => k.key);

    if (customKey && customKey.trim().length > 10) {
      return [customKey.trim(), ...active.filter(k => k !== customKey.trim())];
    }

    if (active.length === 0 && typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) {
      return [process.env.GEMINI_API_KEY.trim()];
    }

    return active;
  }

  private checkCooldowns() {
    const now = Date.now();
    for (const item of this.keyPool) {
      if (item.status === 'exhausted' && item.cooldownUntil && now >= item.cooldownUntil) {
        item.status = 'active';
        item.errorCount = 0;
        item.cooldownUntil = undefined;
        item.errorMsg = undefined;
      }
    }
  }

  public markKeyStatus(key: string, type: 'quota' | 'invalid' | 'rate_limit' | 'exhausted', errorMsg?: string) {
    const item = this.keyPool.find(k => k.key === key);
    if (!item) return;

    item.errorCount += 1;
    item.errorMsg = errorMsg;

    if (type === 'invalid') {
      item.status = 'invalid';
    } else if (type === 'quota' || type === 'rate_limit' || type === 'exhausted') {
      item.status = 'exhausted';
      item.cooldownUntil = Date.now() + 60 * 1000;
    }
  }

  private isQuotaOrAuthError(err: any): { isError: boolean; type: 'quota' | 'invalid' | 'rate_limit'; message: string; isZeroLimit: boolean } {
    const msg = String(err?.message || err || '').toLowerCase();
    const status = err?.status || err?.statusCode || 0;

    const isZeroLimit = msg.includes('limit: 0') || msg.includes('quota exceeded for metric');

    if (status === 429 || msg.includes('resource_exhausted') || msg.includes('quota') || msg.includes('rate limit')) {
      return { isError: true, type: 'quota', message: err?.message || 'Quota Exhausted', isZeroLimit };
    }
    if (status === 401 || status === 403 || msg.includes('api_key_invalid') || msg.includes('permission_denied') || msg.includes('unauthorized') || msg.includes('api key not valid')) {
      return { isError: true, type: 'invalid', message: err?.message || 'Invalid API Key', isZeroLimit: false };
    }
    return { isError: false, type: 'quota', message: '', isZeroLimit: false };
  }

  public async executeWithRotation<T>(
    reqOrKey: any,
    actionFn: (ai: GoogleGenAI, apiKey: string) => Promise<T>
  ): Promise<T> {
    const availableKeys = this.getActiveKeys();

    const envKey = (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY || '').trim();
    if (envKey && !availableKeys.includes(envKey)) {
      availableKeys.push(envKey);
    }

    if (availableKeys.length === 0) {
      throw new Error('No valid Gemini API key available in Server Key Rotator pool.');
    }

    let lastError: any = null;
    const maxAttempts = Math.min(availableKeys.length, 100);

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const apiKey = availableKeys[attempt];
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "x-goog-api-key": apiKey,
            "User-Agent": "aistudio-build",
          },
        },
      });

      try {
        const result = await actionFn(ai, apiKey);
        return result;
      } catch (err: any) {
        lastError = err;
        const errInfo = this.isQuotaOrAuthError(err);
        if (errInfo.isError) {
          const maskedKey = apiKey.length > 8 ? `${apiKey.substring(0, 6)}...${apiKey.slice(-3)}` : 'Key';
          console.log(`[SERVER KEY ROTATOR] ${maskedKey} (${errInfo.type}: ${errInfo.message}). Switching to key index ${attempt + 1}...`);
          if (!errInfo.isZeroLimit) {
            this.markKeyStatus(apiKey, errInfo.type, errInfo.message);
          }
          continue;
        }
        throw err;
      }
    }

    throw lastError || new Error('All available API keys failed after max rotation attempts.');
  }

  public getStats() {
    return {
      totalKeys: this.keyPool.length,
      activeKeys: this.keyPool.filter(k => k.status === 'active').length,
      exhaustedKeys: this.keyPool.filter(k => k.status === 'exhausted').length,
      invalidKeys: this.keyPool.filter(k => k.status === 'invalid').length,
      keys: this.keyPool.map(k => ({
        keyMasked: k.key.substring(0, 6) + '...' + k.key.slice(-4),
        status: k.status,
        errorCount: k.errorCount,
        errorMsg: k.errorMsg
      }))
    };
  }
}

export const serverKeyRotator = new ServerKeyRotatorManager();
