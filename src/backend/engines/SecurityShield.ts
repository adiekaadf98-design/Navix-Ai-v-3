import { logger } from '../utils/logger';

export class SecurityShield {
  private requestCounts: Map<string, { count: number, resetTime: number }> = new Map();
  private MAX_REQUESTS_PER_MINUTE = 120;

  validateRequest(req: any): { valid: boolean, reason?: string } {
    // 1. Rate Limiting (in-memory)
    const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
    const ipStr = Array.isArray(ip) ? ip[0] : ip;
    const now = Date.now();
    const record = this.requestCounts.get(ipStr);
    
    if (record) {
      if (now > record.resetTime) {
         this.requestCounts.set(ipStr, { count: 1, resetTime: now + 60000 });
      } else {
         record.count++;
         if (record.count > this.MAX_REQUESTS_PER_MINUTE) {
            logger.warn(`[SecurityShield] Rate limit exceeded for IP: ${ipStr}`);
            return { valid: false, reason: "Security Shield: Rate limit exceeded. Please slow down." };
         }
      }
    } else {
      this.requestCounts.set(ipStr, { count: 1, resetTime: now + 60000 });
    }

    // 2. Input Validation & Sanitization
    if (req.body?.message && req.body.message.length > 100000) {
       logger.warn(`[SecurityShield] Payload too large from IP: ${ipStr}`);
       return { valid: false, reason: "Security Shield: Payload too large. Maximum message length is 100,000 characters." };
    }

    return { valid: true };
  }
}

export const navixSecurityShield = new SecurityShield();
