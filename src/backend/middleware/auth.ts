import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { initializeApp, getApps, getApp } from 'firebase-admin/app';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore';
import { logger } from '../utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'navix_default_secret_key_change_in_production';

// Initialize Firebase Admin SDK Singleton for Server-Side Security
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'gen-lang-client-0066569741';
const FIRESTORE_DATABASE_ID = process.env.FIRESTORE_DATABASE_ID || 'ai-studio-navixai-b266e636-54a2-4475-a97c-210e018429c7';

export const adminApp = !getApps().length ? initializeApp({ projectId: FIREBASE_PROJECT_ID }) : getApp();
export const adminAuth = getAdminAuth(adminApp);
export const adminDb = getAdminFirestore(adminApp, FIRESTORE_DATABASE_ID);

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    plan?: string;
    firebaseUid?: string;
  };
}

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

/**
 * REAL developer-only gate. Must run AFTER authenticateJWT.
 * Anything that lets a caller configure/inspect the shared Gemini API key
 * pool (the "router") must go through this — never through a header any
 * client can set, and never through an unauthenticated route.
 */
export const requireDeveloper = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const email = req.user?.email;
  if (req.user?.role === 'developer' || isDeveloperEmail(email)) {
    if (req.user) req.user.role = 'developer';
    return next();
  }
  return res.status(403).json({ error: 'FORBIDDEN', message: 'Endpoint ini hanya untuk akun Google Developer Navix AI.' });
};

export const authenticateJWT = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    // 1. Try Firebase ID Token verification first (strongest auth)
    try {
      const decodedFirebase = await adminAuth.verifyIdToken(token);
      if (decodedFirebase && (decodedFirebase.email || decodedFirebase.uid)) {
        const email = (decodedFirebase.email || '').toLowerCase().trim();
        const isDev = isDeveloperEmail(email) || (decodedFirebase as any).developer === true;
        req.user = {
          id: decodedFirebase.uid,
          firebaseUid: decodedFirebase.uid,
          email: email || `${decodedFirebase.uid}@firebase.user`,
          role: isDev ? 'developer' : 'user',
          plan: isDev ? 'developer' : 'free'
        };
        return next();
      }
    } catch (_fbErr) {
      // Not a Firebase ID token or expired, try Navix server-issued JWT
    }

    // 2. Try Navix server-issued JWT
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        logger.warn('Token Verification failed', { error: err.message, ip: req.ip });
        return res.status(403).json({ error: 'Invalid or expired token' });
      }

      const decodedUser = user as any;
      if (decodedUser && decodedUser.email) {
        decodedUser.role = isDeveloperEmail(decodedUser.email) ? 'developer' : (decodedUser.role === 'developer' ? 'user' : decodedUser.role);
      }
      req.user = decodedUser;
      next();
    });
  } else {
    // If no token is provided but we require it, return 401
    if (process.env.NODE_ENV === 'production') {
       logger.warn('Unauthorized access attempt without token', { ip: req.ip });
       res.status(401).json({ error: 'Authentication token is missing' });
    } else {
       req.user = { id: 'anonymous', email: 'guest@navix.ai', role: 'guest' };
       next();
    }
  }
};
