import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { adminAuth, adminDb, isDeveloperEmail } from './auth';
import { pgClient } from '../database/pg-client';
import { logger } from '../utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'navix_default_secret_key_change_in_production';

export const DAILY_FREE_CHAT_LIMIT = parseInt(process.env.NAVIX_DAILY_FREE_LIMIT || '5', 10);

interface Identity {
  key: string;       // stable identifier used for counting
  uid?: string;
  email?: string;
  isDeveloper: boolean;
  plan?: string;
  kind: 'user' | 'ip';
}

async function resolveIdentityAsync(req: Request): Promise<Identity> {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    if (token) {
      // 1. Check Firebase ID Token first (Server-Verified Identity)
      try {
        const decoded = await adminAuth.verifyIdToken(token);
        if (decoded && (decoded.uid || decoded.email)) {
          const email = (decoded.email || '').toLowerCase().trim();
          const isDev = isDeveloperEmail(email) || (decoded as any).developer === true;
          return {
            key: `firebase:${decoded.uid}`,
            uid: decoded.uid,
            email,
            isDeveloper: isDev,
            plan: isDev ? 'developer' : 'free',
            kind: 'user'
          };
        }
      } catch (_fbErr) {
        // Not a Firebase ID token, fall back to server-issued JWT
      }

      // 2. Check Navix Server-issued JWT
      try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        const email = (decoded?.email || '').toLowerCase().trim();
        const isDev = isDeveloperEmail(email) || decoded?.role === 'developer';
        if (email) {
          return { 
            key: `user:${email}`, 
            uid: decoded?.id || email,
            email, 
            isDeveloper: isDev, 
            plan: isDev ? 'developer' : (decoded?.plan || 'free'), 
            kind: 'user' 
          };
        }
        if (decoded?.id) {
          return { 
            key: `user:${decoded.id}`, 
            uid: decoded.id,
            isDeveloper: false, 
            plan: decoded?.plan || 'free', 
            kind: 'user' 
          };
        }
      } catch (err) {
        // Invalid/expired token
      }
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

const memoryStore = new Map<string, number>();

async function getUsedCount(identity: Identity, date: string, feature: string): Promise<number> {
  // 1. Try Firestore durable cloud persistence: usage/{uid}/daily/{YYYY-MM-DD}
  if (identity.uid) {
    try {
      const docRef = adminDb.collection('usage').doc(identity.uid).collection('daily').doc(date);
      const snap = await docRef.get();
      if (snap.exists) {
        const data = snap.data();
        return Number(data?.count ?? 0);
      }
    } catch (fsErr: any) {
      logger.warn('[Quota] Firestore read failed, checking fallback DB/memory.', { error: fsErr?.message });
    }
  }

  // 2. Fallback to Postgres if configured
  try {
    const rows = await pgClient.query(
      `SELECT used_count FROM navix_usage_quota WHERE identity_key = $1 AND usage_date = $2 AND feature = $3`,
      [identity.key, date, feature]
    );
    if (rows && rows.length > 0) {
      return rows[0].used_count ?? 0;
    }
  } catch (_pgErr) {}

  // 3. Fallback to in-memory map
  return memoryStore.get(`${identity.key}:${date}:${feature}`) || 0;
}

async function incrementUsedCount(identity: Identity, date: string, feature: string): Promise<number> {
  let newCount = 1;

  // 1. Save to Firestore: usage/{uid}/daily/{YYYY-MM-DD}
  if (identity.uid) {
    try {
      const docRef = adminDb.collection('usage').doc(identity.uid).collection('daily').doc(date);
      const snap = await docRef.get();
      const current = snap.exists ? Number(snap.data()?.count ?? 0) : 0;
      newCount = current + 1;
      await docRef.set({
        count: newCount,
        date: date,
        lastUpdated: new Date().toISOString(),
        identityKey: identity.key,
        feature
      }, { merge: true });
    } catch (fsErr: any) {
      logger.warn('[Quota] Firestore write failed, using local backup.', { error: fsErr?.message });
    }
  }

  // 2. Save to Postgres if available
  try {
    const rows = await pgClient.query(
      `INSERT INTO navix_usage_quota (identity_key, usage_date, feature, used_count)
       VALUES ($1, $2, $3, 1)
       ON CONFLICT (identity_key, usage_date, feature)
       DO UPDATE SET used_count = navix_usage_quota.used_count + 1
       RETURNING used_count`,
      [identity.key, date, feature]
    );
    if (rows?.[0]?.used_count) {
      newCount = rows[0].used_count;
    }
  } catch (_pgErr) {}

  // 3. Keep in-memory cache synchronized
  const k = `${identity.key}:${date}:${feature}`;
  const currentMem = (memoryStore.get(k) || 0) + 1;
  const finalCount = Math.max(newCount, currentMem);
  memoryStore.set(k, finalCount);
  return finalCount;
}

export interface QuotaCheckResult {
  allowed: boolean;
  isDeveloper: boolean;
  used: number;
  limit: number;
  remaining: number;
  identityKind: 'user' | 'ip';
}

function getUserLimit(identity: Identity): number {
  if (identity.isDeveloper || identity.plan === 'developer') return 999999;
  if (identity.plan === 'pro') return 500;
  if (identity.plan === 'ultra') return 1000;
  return DAILY_FREE_CHAT_LIMIT;
}

export async function checkAndConsumeQuota(req: Request, feature: string = 'chat'): Promise<QuotaCheckResult> {
  const identity = await resolveIdentityAsync(req);
  const userLimit = getUserLimit(identity);

  // DEVELOPER EXCEPTION: Verified Developer gets unlimited bypass
  if (identity.isDeveloper) {
    return { allowed: true, isDeveloper: true, used: 0, limit: userLimit, remaining: 999999, identityKind: identity.kind };
  }

  const today = getTodayString();
  const usedSoFar = await getUsedCount(identity, today, feature);

  if (usedSoFar >= userLimit) {
    return { allowed: false, isDeveloper: false, used: usedSoFar, limit: userLimit, remaining: 0, identityKind: identity.kind };
  }

  const newCount = await incrementUsedCount(identity, today, feature);
  return {
    allowed: true,
    isDeveloper: false,
    used: newCount,
    limit: userLimit,
    remaining: Math.max(0, userLimit - newCount),
    identityKind: identity.kind
  };
}

export function quotaGuard(feature: string = 'chat') {
  return async (req: Request & { navixQuota?: QuotaCheckResult }, res: Response, next: NextFunction) => {
    try {
      const result = await checkAndConsumeQuota(req, feature);
      req.navixQuota = result;
      if (!result.allowed) {
        return res.status(429).json({
          error: 'DAILY_LIMIT_REACHED',
          message: `Kuota gratis harian (${result.limit}/${result.limit}) untuk fitur "${feature}" sudah habis. Coba lagi besok, atau login dengan akun developer Navix AI.`,
          limit: result.limit,
          used: result.used,
          remaining: 0
        });
      }
      next();
    } catch (err: any) {
      logger.error('[Quota] Unexpected error while checking quota', { error: err?.message });
      next();
    }
  };
}

export async function quotaStatusHandler(req: Request, res: Response) {
  const identity = await resolveIdentityAsync(req);
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
  const used = await getUsedCount(identity, today, 'chat');
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
