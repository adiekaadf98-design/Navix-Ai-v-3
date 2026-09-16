import { AuthUser, AuthService } from './auth';

export const DAILY_FREE_CHAT_LIMIT = 5;

export interface QuotaStatus {
  isDeveloper: boolean;
  plan: string;
  credits: number;
  dailyFreeLimit: number;
  dailyFreeUsed: number;
  remainingToday: number;
  isUnlimited: boolean;
  canChat: boolean;
  message?: string;
  source: 'server' | 'local-estimate';
}

/**
 * HONESTY NOTE: this used to be the ONLY place the "5 chats/day" rule was
 * enforced, and it only wrote to `localStorage` -- trivially bypassed by
 * clearing site data, incognito mode, or calling the API directly. The
 * REAL enforcement now lives server-side in
 * `src/backend/middleware/quota.ts` (checked on every request to
 * /api/chat, /api/generate-image, /api/generate-video/start,
 * /api/generate-music, /api/edit-image, /api/edit-video,
 * /api/composite-image). Even if this file is bypassed entirely, the
 * server will still reject the request with HTTP 429 once the real daily
 * limit is hit.
 *
 * This file now exists only to give the UI a fast, optimistic display of
 * "how many chats do I have left" without waiting on a network round trip
 * for every keystroke. Whenever possible, prefer `fetchServerQuotaStatus`,
 * which asks the server for the real number.
 */

const getTodayString = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

async function fetchServerQuotaStatus(): Promise<QuotaStatus | null> {
  try {
    const token = AuthService.getToken();
    const res = await fetch('/api/quota/status', {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      isDeveloper: !!data.isDeveloper,
      plan: data.isDeveloper ? 'developer' : 'free',
      credits: 0,
      dailyFreeLimit: data.limit,
      dailyFreeUsed: data.used,
      remainingToday: data.remaining,
      isUnlimited: !!data.isDeveloper,
      canChat: data.isDeveloper || data.remaining > 0,
      message: data.message,
      source: 'server'
    };
  } catch {
    return null;
  }
}

const localEstimate = (user: AuthUser | null): QuotaStatus => {
  const isDeveloper = user?.role === 'developer';
  if (isDeveloper) {
    return {
      isDeveloper: true, plan: 'developer', credits: 999999,
      dailyFreeLimit: DAILY_FREE_CHAT_LIMIT, dailyFreeUsed: 0, remainingToday: 999999,
      isUnlimited: true, canChat: true, message: 'Akses Penuh Developer (Unlimited)', source: 'local-estimate'
    };
  }

  const today = getTodayString();
  const storedDate = localStorage.getItem('navix_daily_chat_date') || '';
  let dailyUsed = parseInt(localStorage.getItem('navix_daily_chat_count') || '0', 10);
  if (storedDate !== today) {
    dailyUsed = 0;
  }
  const remainingFree = Math.max(0, DAILY_FREE_CHAT_LIMIT - dailyUsed);
  return {
    isDeveloper: false, plan: 'free', credits: 0,
    dailyFreeLimit: DAILY_FREE_CHAT_LIMIT, dailyFreeUsed: dailyUsed, remainingToday: remainingFree,
    isUnlimited: false, canChat: remainingFree > 0,
    message: remainingFree > 0
      ? `Free Tier: ~${remainingFree}/${DAILY_FREE_CHAT_LIMIT} chat gratis hari ini (estimasi lokal)`
      : `Kuota Gratis Harian tampaknya habis (estimasi lokal)`,
    source: 'local-estimate'
  };
};

export const QuotaService = {
  /**
   * Best available status: tries the server first (real, authoritative),
   * falls back to the local optimistic estimate if offline/unreachable.
   */
  getQuotaStatus: async (user: AuthUser | null): Promise<QuotaStatus> => {
    const serverStatus = await fetchServerQuotaStatus();
    if (serverStatus) {
      localStorage.setItem('navix_daily_chat_date', getTodayString());
      localStorage.setItem('navix_daily_chat_count', String(serverStatus.dailyFreeUsed));
      return serverStatus;
    }
    return localEstimate(user);
  },

  /**
   * Synchronous, instant estimate for first paint (e.g. disabling the send
   * button before the network call resolves). NOT the source of truth --
   * the actual request will still be rejected server-side if this guess
   * is wrong (e.g. stale/cleared localStorage).
   */
  getQuotaStatusSync: (user: AuthUser | null): QuotaStatus => localEstimate(user),

  /**
   * The server increments its own counter as part of handling the actual
   * /api/chat (etc.) request -- see quotaGuard() in
   * src/backend/middleware/quota.ts. This function just keeps the local
   * optimistic cache roughly in sync for instant UI feedback; it does not
   * grant or deny anything by itself anymore.
   */
  bumpLocalEstimate: (user: AuthUser | null) => {
    if (user?.role === 'developer') return;
    const today = getTodayString();
    const storedDate = localStorage.getItem('navix_daily_chat_date') || '';
    let dailyUsed = parseInt(localStorage.getItem('navix_daily_chat_count') || '0', 10);
    if (storedDate !== today) dailyUsed = 0;
    dailyUsed += 1;
    localStorage.setItem('navix_daily_chat_date', today);
    localStorage.setItem('navix_daily_chat_count', String(dailyUsed));
  }
};
