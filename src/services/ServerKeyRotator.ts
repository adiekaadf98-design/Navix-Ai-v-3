import { GoogleGenAI } from '@google/genai';
import express from 'express';
import fs from 'fs';
import path from 'path';

const POOL_STORAGE_PATH = path.join(process.cwd(), '.server_keys_pool.json');

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

  // Parse keys from process.env, cached storage, and any custom inputs
  public refreshPool(additionalKeys: string[] = []) {
    const rawKeys: string[] = [];

    // 1. Check GEMINI_API_KEYS (comma or space or newline separated)
    if (process.env.GEMINI_API_KEYS) {
      rawKeys.push(...process.env.GEMINI_API_KEYS.split(/[\n,;]+/).map(k => k.trim()));
    }

    // 2. Check GEMINI_API_KEY (comma separated or single)
    if (process.env.GEMINI_API_KEY) {
      rawKeys.push(...process.env.GEMINI_API_KEY.split(/[\n,;]+/).map(k => k.trim()));
    }

    // 3. Check numbered env vars GEMINI_API_KEY_1 to 100
    for (let i = 1; i <= 100; i++) {
      const k = process.env[`GEMINI_API_KEY_${i}`];
      if (k) rawKeys.push(k.trim());
    }

    // 4. Load saved pool from disk if present
    try {
      if (fs.existsSync(POOL_STORAGE_PATH)) {
        const fileContent = fs.readFileSync(POOL_STORAGE_PATH, 'utf-8');
        const diskKeys = JSON.parse(fileContent);
        if (Array.isArray(diskKeys)) {
          rawKeys.push(...diskKeys);
        }
      }
    } catch (err) {
      console.warn('[SERVER KEY ROTATOR] Could not read .server_keys_pool.json:', err);
    }

    // 5. Add additional keys (like custom ones passed from frontend / settings)
    rawKeys.push(...additionalKeys);

    // Save custom keys to disk for persistence across server restarts
    if (additionalKeys.length > 0) {
      try {
        let existingDisk: string[] = [];
        if (fs.existsSync(POOL_STORAGE_PATH)) {
          const content = fs.readFileSync(POOL_STORAGE_PATH, 'utf-8');
          const parsed = JSON.parse(content);
          if (Array.isArray(parsed)) existingDisk = parsed;
        }
        const updatedDisk = Array.from(new Set([...existingDisk, ...additionalKeys]))
          .map(k => k.trim().replace(/['"\s]/g, ''))
          .filter(k => k.length > 5)
          .slice(0, 100);
        fs.writeFileSync(POOL_STORAGE_PATH, JSON.stringify(updatedDisk, null, 2));
      } catch (err) {
        console.warn('[SERVER KEY ROTATOR] Could not persist keys to .server_keys_pool.json:', err);
      }
    }

    // Clean and deduplicate up to 100 keys
    const sanitized = Array.from(new Set(
      rawKeys
        .map(k => k.trim().replace(/['"\s]/g, ''))
        .filter(k => k.length > 5)
    )).slice(0, 100);

    // Keep existing keys that are currently tracked (so we don't lose cooldown info for custom keys from previous requests)
    for (const key of sanitized) {
       if (!this.keyPool.find(k => k.key === key)) {
          this.keyPool.push({ key, status: 'active', errorCount: 0, lastUsed: Date.now() });
       }
    }
  }

  // Remove a key from pool and disk
  public removeKey(keyToRemove: string) {
    const cleaned = keyToRemove.trim().replace(/['"\s]/g, '');
    this.keyPool = this.keyPool.filter(k => k.key !== cleaned);
    try {
      if (fs.existsSync(POOL_STORAGE_PATH)) {
        const content = fs.readFileSync(POOL_STORAGE_PATH, 'utf-8');
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter(k => k !== cleaned);
          fs.writeFileSync(POOL_STORAGE_PATH, JSON.stringify(filtered, null, 2));
        }
      }
    } catch (err) {
      console.warn('[SERVER KEY ROTATOR] Could not update .server_keys_pool.json on remove:', err);
    }
  }

  // Get active keys (with auto cooldown recovery after 60 seconds)
  public getActiveKeys(requestCustomKeyHeader?: string): string[] {
    const now = Date.now();
    const candidateKeys: string[] = [];
    const customKeys: string[] = [];

    // Parse custom key header (can be single or comma-separated up to 100)
    if (requestCustomKeyHeader) {
      const parsed = requestCustomKeyHeader
        .split(/[\n,;]+/)
        .map(k => k.trim().replace(/['"\s]/g, ''))
        .filter(k => k.length > 5);
      customKeys.push(...parsed);
    }

    // Refresh environment pool and register the custom keys to track their cooldowns
    this.refreshPool(customKeys);

    // First prioritize the custom keys requested by the user, if they are active
    for (const item of this.keyPool) {
      // Auto recover
      if (item.status === 'exhausted' && item.cooldownUntil && now > item.cooldownUntil) {
        item.status = 'active';
        item.errorMsg = undefined;
      }
    }

    // Now populate candidate keys prioritizing custom keys, then fallback to env keys
    if (customKeys.length > 0) {
       for (const ck of customKeys) {
          const matched = this.keyPool.find(k => k.key === ck);
          if (matched && matched.status === 'active' && !candidateKeys.includes(matched.key)) {
             candidateKeys.push(matched.key);
          }
       }
    }
    // Always append active environment / pool keys as robust fallbacks
    for (const item of this.keyPool) {
       if (item.status === 'active' && !candidateKeys.includes(item.key)) {
          candidateKeys.push(item.key);
       }
    }

    // If candidateKeys empty (all requested/available keys exhausted), auto-reset all exhausted server keys!
    if (candidateKeys.length === 0 && this.keyPool.length > 0) {
      let resetSource = customKeys.length > 0 ? customKeys : this.keyPool.map(k => k.key);
      for (const rk of resetSource) {
         const item = this.keyPool.find(k => k.key === rk);
         if (item) {
           item.status = 'active';
           item.errorMsg = undefined;
           item.cooldownUntil = undefined;
           if (!candidateKeys.includes(item.key)) {
              candidateKeys.push(item.key);
           }
         }
      }
    }

    return candidateKeys.slice(0, 100);
  }

  public markKeyStatus(key: string, status: 'exhausted' | 'invalid', errorMsg: string) {
    const existing = this.keyPool.find(k => k.key === key);
    if (existing) {
      existing.status = status;
      existing.errorCount += 1;
      existing.errorMsg = errorMsg;
      if (status === 'exhausted') {
        // Cooldown for 60 seconds
        existing.cooldownUntil = Date.now() + 60000;
      }
    } else {
      this.keyPool.push({
        key,
        status,
        errorCount: 1,
        errorMsg,
        cooldownUntil: status === 'exhausted' ? Date.now() + 60000 : undefined
      });
    }
  }

  public isQuotaOrAuthError(err: any): { isError: boolean; type: 'exhausted' | 'invalid'; message: string; isZeroLimit?: boolean } {
    const errString = (err?.message || err?.stack || JSON.stringify(err) || '').toLowerCase();
    const status = err?.status || err?.statusCode || err?.code;

    const isZeroLimit = errString.includes('limit: 0') || errString.includes('limit:0');
    const isQuota = status === 429 || 
                    errString.includes('quota') || 
                    errString.includes('rate limit') || 
                    errString.includes('resource_exhausted') || 
                    errString.includes('limit:') ||
                    isZeroLimit;

    const isAuth = status === 401 || 
                   errString.includes('unauthenticated') || 
                   errString.includes('invalid api key') || 
                   errString.includes('api key not valid') ||
                   errString.includes('access_token_type_unsupported') ||
                   errString.includes('invalid authentication');

    const isTemporaryUnavailable = status === 503 ||
                                   errString.includes('unavailable') ||
                                   errString.includes('high demand') ||
                                   errString.includes('timed out') ||
                                   errString.includes('timeout') ||
                                   errString.includes('overloaded');

    if (isQuota || isTemporaryUnavailable) {
      let cleanMsg = isTemporaryUnavailable ? 'Model high demand / temporary unavailable (503)' : 'Quota limit exceeded (429)';
      if (isZeroLimit) {
        cleanMsg = 'Model not available on free tier quota (limit: 0)';
      }
      return { isError: true, type: 'exhausted', message: cleanMsg, isZeroLimit };
    }
    if (isAuth) {
      return { isError: true, type: 'invalid', message: 'Invalid API key or unauthorized (401)' };
    }
    return { isError: false, type: 'exhausted', message: '' };
  }

  // Wrapper to execute any Gemini action with automatic key rotation up to 100 attempts
  public async executeWithRotation<T>(
    req: express.Request | undefined,
    actionFn: (ai: GoogleGenAI, key: string) => Promise<T>
  ): Promise<T> {
    // API keys are server-owned secrets. Never accept API keys from client request headers.
    const availableKeys = this.getActiveKeys();

    const envKey = (process.env.GEMINI_API_KEY || '').trim();
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
          } else {
            console.log(`[SERVER KEY ROTATOR] Notice: ${maskedKey} has model-specific limit:0 (free tier restriction). Preserving key for standard models.`);
          }
          continue; // Try next key in rotation
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
