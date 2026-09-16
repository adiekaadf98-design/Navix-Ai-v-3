import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'navix_default_secret_key_change_in_production';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
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

export const authenticateJWT = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        logger.warn('JWT Verification failed', { error: err.message, ip: req.ip });
        return res.status(403).json({ error: 'Invalid or expired token' });
      }

      const decodedUser = user as any;
      if (decodedUser && decodedUser.email) {
        // Never trust a client-supplied/self-reported "role" claim alone —
        // re-derive developer status server-side from the allowlist so a
        // tampered or stale token can't grant developer/unlimited access.
        decodedUser.role = isDeveloperEmail(decodedUser.email) ? 'developer' : (decodedUser.role === 'developer' ? 'user' : decodedUser.role);
      }
      req.user = decodedUser;
      next();
    });
  } else {
    // If no token is provided but we require it, return 401
    // For preview environments, we might want to allow anonymous access if strictly needed
    if (process.env.NODE_ENV === 'production') {
       logger.warn('Unauthorized access attempt without token', { ip: req.ip });
       res.status(401).json({ error: 'Authentication token is missing' });
    } else {
       // In dev/preview, assign a default anonymous user if no token
       req.user = { id: 'anonymous', email: 'guest@navix.ai', role: 'guest' };
       next();
    }
  }
};
