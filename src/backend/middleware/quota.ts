import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { adminAuth, adminDb, isDeveloperIdentity, isDeveloperEmail } from './auth';
import { logger } from '../utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'navix_default_secret_key_change_in_production';

export const GLOBAL_DAILY_LIMIT = parseInt(process.env.NAVIX_DAILY_FREE_LIMIT || '5', 10);
export const DAILY_FREE_CHAT_LIMIT = GLOBAL_DAILY_LIMIT;

export interface Identity {
  key: string;
  uid: string;
  email?: string;
  isDeveloper: boolean;
  role: 'developer' | 'user';
  kind: 'user' | 'ip';
}

export async function resolveIdentityAsync(req: Request): Promise<Identity> {
  const reqUser = (req as any).user;
  if (reqUser && reqUser.id) {
    const isDev = reqUser.role === 'developer' || isDeveloperEmail(reqUser.email);
    return {
      key: `user:${reqUser.id}`,
      uid: reqUser.firebaseUid || reqUser.id,
      email: reqUser.email,
      isDeveloper: isDev,
      role: isDev ? 'developer' : 'user',
      kind: 'user'
    };
  }

  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    if (token) {
      // 1. Firebase ID token verification (Primary Authority)
      try {
        const decoded = await adminAuth.verifyIdToken(token);
        if (decoded?.uid) {
          const email = String(decoded.email || '').trim().toLowerCase();
          const isDev = isDeveloperIdentity(decoded);
          return {
            key: `firebase:${decoded.uid}`,
            uid: decoded.uid,
            email: email || `${decoded.uid}@firebase.user`,
            isDeveloper: isDev,
            role: isDev ? 'developer' : 'user',
            kind: 'user'
          };
        }
      } catch (_) {}

      // 2. Server-issued JWT fallback
      try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        const email = String(decoded?.email || '').trim().toLowerCase();
        const isDev = isDeveloperIdentity(decoded);
        const uid = decoded?.id || decoded?.firebaseUid || decoded?.uid || email || 'unknown';
        return {
          key: `jwt:${uid}`,
          uid: String(uid),
          email,
          isDeveloper: isDev,
          role: isDev ? 'developer' : 'user',
          kind: 'user'
        };
      } catch (_) {}
    }
  }

  const ip = (req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || 'unknown')
    .split(',')[0]
    .trim();
  return {
    key: `ip:${ip}`,
    uid: `ip_${ip.replace(/[^a-zA-Z0-9]/g, '_')}`,
    isDeveloper: false,
    role: 'user',
    kind: 'ip'
  };
}

export function getTodayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const memoryQuotaStore = new Map<string, number>();

export interface QuotaCheckResult {
  allowed: boolean;
  isDeveloper: boolean;
  role: 'developer' | 'user';
  limit: number | 'unlimited';
  total_usage: number;
  remaining: number;
}

let firestoreQuotaAvailable = true;
let nextFirestoreQuotaCheckTime = 0;

export async function checkAndConsumeGlobalQuota(req: Request, actionName: string = 'global_action'): Promise<QuotaCheckResult> {
  const identity = await resolveIdentityAsync(req);

  // DEVELOPER: Unlimited usage, bypass transaction
  if (identity.isDeveloper || identity.role === 'developer') {
    return {
      allowed: true,
      isDeveloper: true,
      role: 'developer',
      limit: 'unlimited',
      total_usage: 0,
      remaining: 999999
    };
  }

  const date = getTodayString();
  const limit = GLOBAL_DAILY_LIMIT;

  const now = Date.now();
  if (firestoreQuotaAvailable || now > nextFirestoreQuotaCheckTime) {
    // Use Firestore transaction for non-developer atomic global quota
    try {
      const docRef = adminDb.collection('usage').doc(identity.uid).collection('daily').doc(date);
      const result = await adminDb.runTransaction(async (t) => {
        const snap = await t.get(docRef);
        const data = snap.data();
        const current = snap.exists ? Number(data?.total_usage ?? data?.count ?? 0) : 0;

        if (current >= limit) {
          return { allowed: false, total_usage: current };
        }

        const next = current + 1;
        t.set(docRef, {
          total_usage: next,
          count: next,
          date,
          lastUpdated: new Date().toISOString(),
          lastAction: actionName,
          identityKey: identity.key
        }, { merge: true });

        return { allowed: true, total_usage: next };
      });

      firestoreQuotaAvailable = true;
      return {
        allowed: result.allowed,
        isDeveloper: false,
        role: 'user',
        limit,
        total_usage: result.total_usage,
        remaining: Math.max(0, limit - result.total_usage)
      };
    } catch (fsErr: any) {
      firestoreQuotaAvailable = false;
      nextFirestoreQuotaCheckTime = Date.now() + 300000; // recheck in 5 minutes
      logger.warn('[Quota] Firestore transaction failed, falling back to local atomic memory', { error: fsErr?.message });
    }
  }

  const memKey = `${identity.uid}:${date}`;
  const currentMem = memoryQuotaStore.get(memKey) || 0;
  if (currentMem >= limit) {
    return {
      allowed: false,
      isDeveloper: false,
      role: 'user',
      limit,
      total_usage: currentMem,
      remaining: 0
    };
  }
  const nextMem = currentMem + 1;
  memoryQuotaStore.set(memKey, nextMem);
  return {
    allowed: true,
    isDeveloper: false,
    role: 'user',
    limit,
    total_usage: nextMem,
    remaining: Math.max(0, limit - nextMem)
  };
}

/**
 * Express middleware requiring global 5/day quota.
 * Returns HTTP 429 when quota exceeded.
 */
export function requireGlobalQuota(actionName: string = 'action') {
  return async (req: Request & { navixQuota?: QuotaCheckResult }, res: Response, next: NextFunction) => {
    try {
      const result = await checkAndConsumeGlobalQuota(req, actionName);
      req.navixQuota = result;

      if (!result.allowed) {
        return res.status(429).json({
          error: 'GLOBAL_DAILY_LIMIT_EXCEEDED',
          limit: result.limit,
          total_usage: result.total_usage,
          remaining: 0,
          message: 'Batas 5 penggunaan harian telah tercapai. Coba lagi besok atau gunakan akun Developer.'
        });
      }

      next();
    } catch (err: any) {
      logger.error('[Quota] Error checking global quota:', { error: err?.message });
      next();
    }
  };
}

// Backward-compatible alias for existing route definitions
export const quotaGuard = requireGlobalQuota;
export const checkAndConsumeQuota = checkAndConsumeGlobalQuota;

/**
 * Endpoint status quota handler: GET /api/quota/status
 */
export async function quotaStatusHandler(req: Request, res: Response) {
  try {
    const identity = await resolveIdentityAsync(req);

    if (identity.isDeveloper || identity.role === 'developer') {
      return res.json({
        role: 'developer',
        limit: 'unlimited',
        total_usage: 0,
        remaining: 999999,
        isDeveloper: true,
        message: 'Akses Penuh Developer (Unlimited)'
      });
    }

    const date = getTodayString();
    let totalUsage = 0;

    try {
      const docRef = adminDb.collection('usage').doc(identity.uid).collection('daily').doc(date);
      const snap = await docRef.get();
      if (snap.exists) {
        const data = snap.data();
        totalUsage = Number(data?.total_usage ?? data?.count ?? 0);
      }
    } catch (_) {
      const memKey = `${identity.uid}:${date}`;
      totalUsage = memoryQuotaStore.get(memKey) || 0;
    }

    const limit = GLOBAL_DAILY_LIMIT;
    const remaining = Math.max(0, limit - totalUsage);

    return res.json({
      role: 'user',
      limit,
      total_usage: totalUsage,
      remaining,
      isDeveloper: false,
      message: remaining > 0
        ? `Tersedia: ${remaining}/${limit} penggunaan hari ini`
        : 'Batas 5 penggunaan harian telah tercapai. Coba lagi besok atau gunakan akun Developer.'
    });
  } catch (err: any) {
    logger.error('[Quota Status Error]:', { error: err?.message });
    return res.status(500).json({ error: 'Failed to fetch quota status' });
  }
}
