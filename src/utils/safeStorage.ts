/**
 * NAVIX PRO AI — SAFE LOCAL STORAGE UTILITY
 * 
 * Provides safe, crash-proof access to Web Storage.
 * Handles DOMException / SecurityError gracefully when running inside
 * mobile WebViews, cross-origin iframes, or incognito mode.
 */

const memoryFallback = new Map<string, string>();

export const safeLocalStorage = {
  getItem(key: string): string | null {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch (e) {
      // Access denied (e.g. cross-origin iframe or third-party cookies disabled)
    }
    return memoryFallback.get(key) || null;
  },

  setItem(key: string, value: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
        return;
      }
    } catch (e) {
      // Storage quota exceeded or access denied
    }
    memoryFallback.set(key, value);
  },

  removeItem(key: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
        return;
      }
    } catch (e) {
      // Access denied
    }
    memoryFallback.delete(key);
  }
};
