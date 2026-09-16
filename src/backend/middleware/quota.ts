import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { pgClient } from '../database/pg-client';
import { logger } from '../utils/logger';

/**
 * REAL server-side quota enforcement.
 *
 * IMPORTANT CONTEXT FOR MAINTAINERS:
 * Previously, the "5 chats/day for free users" rule only existed in
 * `src/services/quotaService.ts`, which reads/writes `localStorage` in the
 * browser. That is NOT real enforcement — any user can bypass it by
 * clearing site data, using incognito mode, or calling the API directly
 * (curl/Postman) since the server never checked anything. This file is the
 * actual enforcement point: every request to a metered endpoint is checked
 * and counted here, server-side, before any Gemini API call is made.
 *
 * Identity resolution:
 *  - If the request carries a valid JWT (Authorization: Bearer <token>),
 *    we use the authenticated user's email/id. This is durable across
 *    devices and cannot be bypassed by clearing browser storage.
 *  - Otherwise we fall back to the caller's IP address. This is weaker
 *    (shared NAT/proxies), but it is still a real, server-enforced limit
 *    instead of a purely cosmetic one.
 *
 * Developer bypass:
 *  - Only emails listed in NAVIX_DEVELOPER_EMAILS (comma-separated) get
 *    unlimited access. This is the "akun Google Developer Navix AI" account.
 *    Everyone else (including any other Google login) is a metered consumer.
 */

const JWT_SECRET = process.env.JWT_SECRET || 'navix_default_secret_key_change_in_production';

export const DAILY_FREE_CHAT_LIMIT = parseInt(process.env.NAVIX_DAILY_FREE_LIMIT || '5', 10);

const DEFAULT_DEVELOPER_EMAILS = ['adiekaadf98@gmail.com', 'adieka.github@gmail.com'];

function getDeveloperEmails(): string[] {
  const fromEnv = (process.env.NAVIX_DEVELOPER_EMAILS || '')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);
  return fromEnv.length > 0 ? fromEnv : DEFAULT_DEVELOPER_EMAILS;
}

export function isDeveloperEmail(email?: string | null): boolean {
  if (!email) return false;
  return getDeveloperEmails().includes(email.toLowerCase().trim());
}

interface Identity {
  key: string;       // stable identifier used for counting
  email?: string;
  isDeveloper: boolean;
  plan?: string;
  kind: 'user' | 'ip';
}

function resolveIdentity(req: Request): Identity {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      const email = decoded?.email as string | undefined;
      if (email) {
        return { key: `user:${email.toLowerCase()}`, email, isDeveloper: isDeveloperEmail(email), plan: decoded?.plan || 'free', kind: 'user' };
      }
      if (decoded?.id) {
        return { key: `user:${decoded.id}`, isDeveloper: false, plan: decoded?.plan || 'free', kind: 'user' };
      }
    } catch (err) {
      // Invalid/expired token -> treat as anonymous, do not throw here.
      // The route's own auth middleware (if any) is responsible for hard-rejecting bad tokens.
    }
  }

  const ip = (req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || 'unknown')
    .split(',')[0]
    .trim();
  return { key: `ip:${ip}`, isDeveloper: false, plan: 'free', kind: 'ip' };
}

function getTodayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

let tableEnsured = false;
async function ensureTable(): Promise<boolean> {
  if (tableEnsured) return true;
  try {
    await pgClient.query(`
      CREATE TABLE IF NOT EXISTS navix_usage_quota (
        identity_key TEXT NOT NULL,
        usage_date TEXT NOT NULL,
        feature TEXT NOT NULL DEFAULT 'chat',
        used_count INTEGER NOT NULL DEFAULT 0,
        PRIMARY KEY (identity_key, usage_date, feature)
      )
    `);
    tableEnsured = true;
    return true;
  } catch (err) {
    logger.info('[Quota] Postgres not configured; falling back to in-memory quota.');
    return false;
  }
}

// In-memory fallback ONLY used when Postgres is not configured. This is
// honestly weaker (resets on process restart / not shared across
// horizontally-scaled instances), and we log that clearly rather than
// silently pretending it's as durable as the DB-backed path.
const memoryStore = new Map<string, number>();

async function getUsedCount(identityKey: string, date: string, feature: string): Promise<number> {
  const dbReady = await ensureTable();
  if (dbReady) {
    try {
      const rows = await pgClient.query(
        `SELECT used_count FROM navix_usage_quota WHERE identity_key = $1 AND usage_date = $2 AND feature = $3`,
        [identityKey, date, feature]
      );
      return rows?.[0]?.used_count ?? 0;
    } catch (err) {
      logger.warn('[Quota] DB read failed, falling back to memory for this request.', { error: (err as any)?.message });
    }
  }
  return memoryStore.get(`${identityKey}:${date}:${feature}`) || 0;
}

async function incrementUsedCount(identityKey: string, date: string, feature: string): Promise<number> {
  const dbReady = await ensureTable();
  if (dbReady) {
    try {
      const rows = await pgClient.query(
        `INSERT INTO navix_usage_quota (identity_key, usage_date, feature, used_count)
         VALUES ($1, $2, $3, 1)
         ON CONFLICT (identity_key, usage_date, feature)
         DO UPDATE SET used_count = navix_usage_quota.used_count + 1
         RETURNING used_count`,
        [identityKey, date, feature]
      );
      return rows?.[0]?.used_count ?? 1;
    } catch (err) {
      logger.warn('[Quota] DB write failed, falling back to memory for this request.', { error: (err as any)?.message });
    }
  }
  const k = `${identityKey}:${date}:${feature}`;
  const next = (memoryStore.get(k) || 0) + 1;
  memoryStore.set(k, next);
  return next;
}

export interface QuotaCheckResult {
  allowed: boolean;
  isDeveloper: boolean;
  used: number;
  limit: number;
  remaining: number;
  identityKind: 'user' | 'ip';
}


function getUserLimit(identity) {
  if (identity.isDeveloper || identity.plan === 'developer') return 999999;
  if (identity.plan === 'pro') return 500;
  if (identity.plan === 'ultra') return 1000;
  return DAILY_FREE_CHAT_LIMIT;
}

export async function checkAndConsumeQuota(req: Request, feature: string = 'chat'): Promise<QuotaCheckResult> {
  const identity = resolveIdentity(req);
  const userLimit = getUserLimit(identity);

  if (identity.isDeveloper) {
    return { allowed: true, isDeveloper: true, used: 0, limit: userLimit, remaining: 999999, identityKind: identity.kind };
  }

  const today = getTodayString();
  const usedSoFar = await getUsedCount(identity.key, today, feature);

  if (usedSoFar >= userLimit) {
    return { allowed: false, isDeveloper: false, used: usedSoFar, limit: userLimit, remaining: 0, identityKind: identity.kind };
  }

  const newCount = await incrementUsedCount(identity.key, today, feature);
  return {
    allowed: true,
    isDeveloper: false,
    used: newCount,
    limit: userLimit,
    remaining: Math.max(0, userLimit - newCount),
    identityKind: identity.kind
  };
}

/**
 * Express middleware: rejects the request with 429 if the free daily quota
 * for this identity is exhausted. On success it also consumes one unit of
 * quota (so the check and the increment are atomic from the route's
 * perspective) and attaches `req.navixQuota` for the handler/response to use.
 */
export function quotaGuard(feature: string = 'chat') {
  return async (req: Request & { navixQuota?: QuotaCheckResult }, res: Response, next: NextFunction) => {
    try {
      const result = await checkAndConsumeQuota(req, feature);
      req.navixQuota = result;
      if (!result.allowed) {
        return res.status(429).json({
          error: 'DAILY_FREE_LIMIT_REACHED',
          message: `Kuota gratis harian (${result.limit}/${result.limit}) untuk fitur "${feature}" sudah habis. Coba lagi besok, atau login dengan akun developer Navix AI.`,
          limit: result.limit,
          used: result.used,
          remaining: 0
        });
      }
      next();
    } catch (err: any) {
      logger.error('[Quota] Unexpected error while checking quota', { error: err?.message });
      // Fail open on unexpected infra errors so a quota-system bug never
      // takes the whole product down, but log loudly so it gets fixed.
      next();
    }
  };
}

/**
 * GET /api/quota/status — lets the frontend show the REAL server-side
 * remaining count instead of trusting its own localStorage guess.
 */
export async function quotaStatusHandler(req: Request, res: Response) {
  const identity = resolveIdentity(req);
  const userLimit = getUserLimit(identity);
  if (identity.isDeveloper) {
    return res.json({
      isDeveloper: true,
      limit: userLimit,
      used: 0,
      remaining: 999999,
      message: 'Akses Penuh Developer (Unlimited)'
    });
  }
  const today = getTodayString();
  const used = await getUsedCount(identity.key, today, 'chat');
  const remaining = Math.max(0, userLimit - used);
  return res.json({
    isDeveloper: false,
    limit: userLimit,
    used,
    remaining,
    message: remaining > 0
      ? `Tersedia: ${remaining}/${userLimit} request hari ini`
      : `Kuota (${userLimit}/${userLimit}) telah habis`
  });
}
