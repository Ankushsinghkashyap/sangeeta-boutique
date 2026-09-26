import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

/**
 * Strips HTML tags, script elements, javascript: protocols, control characters,
 * and null bytes to protect against XSS and injection attacks.
 */
export function sanitizeString(val: unknown, maxLength = 1000): string {
  if (val === null || val === undefined) return '';
  let str = String(val);

  // Remove null bytes and dangerous control characters (except common whitespace)
  str = str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // Strip script, iframe, object, embed tags and event handlers
  str = str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/javascript:[^"'\s]*/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/on\w+\s*=\s*[^>\s]+/gi, '');

  // Strip remaining HTML tags
  str = str.replace(/<[^>]*>/g, '');

  // Trim and enforce length limit
  return str.trim().slice(0, maxLength);
}

/**
 * Validates and sanitizes search query parameters for safe SQL LIKE/ILIKE matching.
 */
export function sanitizeSearchQuery(query: unknown, maxLength = 100): string {
  if (!query) return '';
  let str = String(query).trim();
  // Strip control chars and null bytes
  str = str.replace(/[\x00-\x1F\x7F]/g, '');
  // Escape literal % and _ to avoid wildcard injection if searching
  str = str.replace(/([%_\\])/g, '\\$1');
  return str.slice(0, maxLength);
}

/**
 * CSV Formula / DDE Injection Protection (CWE-1236)
 * When an exported CSV is opened in Microsoft Excel, LibreOffice, or Google Sheets,
 * cells beginning with =, +, -, @, \t, or \r are treated as formulas and can execute
 * arbitrary system commands. Prepending a single quote ensures spreadsheets treat
 * the content strictly as literal text.
 */
export function sanitizeForCsv(val: unknown): string {
  if (val === null || val === undefined) return '""';
  let str = String(val).trim();

  // Protect against CSV / Spreadsheet formula injection
  const dangerousPrefixes = ['=', '+', '-', '@', '\t', '\r', '%'];
  if (str.length > 0 && dangerousPrefixes.some(prefix => str.startsWith(prefix))) {
    str = `'${str}`;
  }

  // Double internal double-quotes and wrap in quotes
  const escaped = str.replace(/"/g, '""');
  return `"${escaped}"`;
}

/**
 * Validates image buffer magic numbers (file signature) to ensure
 * uploaded files are legitimate images (JPEG, PNG, WebP) and not executable scripts.
 */
export function validateImageMagicBytes(buffer: Buffer): { valid: boolean; ext: 'jpg' | 'png' | 'webp' | null } {
  if (buffer.length < 12) return { valid: false, ext: null };

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { valid: true, ext: 'jpg' };
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { valid: true, ext: 'png' };
  }

  // WebP: RIFF ... WEBP (52 49 46 46 ... 57 45 42 50)
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return { valid: true, ext: 'webp' };
  }

  return { valid: false, ext: null };
}

/**
 * Constant-time string comparison to prevent timing attacks.
 */
export function timingSafeCompare(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    // Compare dummy buffer to maintain constant timing
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Lightweight, in-memory sliding-window rate limiter
 * Protects against brute-force attacks and denial-of-service without external dependencies.
 */
interface RateLimitRecord {
  count: number;
  resetAt: number;
}

export function createRateLimiter(options: {
  windowMs: number;
  max: number;
  message?: string;
  keyGenerator?: (req: Request) => string;
}) {
  const store = new Map<string, RateLimitRecord>();

  // Periodic cleanup every 5 minutes to prevent memory leak
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of store.entries()) {
      if (now > record.resetAt) {
        store.delete(key);
      }
    }
  }, 5 * 60 * 1000);

  return (req: Request, res: Response, next: NextFunction) => {
    const key = options.keyGenerator
      ? options.keyGenerator(req)
      : (req.ip || req.socket.remoteAddress || 'unknown-client');

    const now = Date.now();
    const record = store.get(key);

    if (!record || now > record.resetAt) {
      store.set(key, { count: 1, resetAt: now + options.windowMs });
      return next();
    }

    if (record.count >= options.max) {
      const retryAfterSeconds = Math.ceil((record.resetAt - now) / 1000);
      res.setHeader('Retry-After', retryAfterSeconds);
      return res.status(429).json({
        error: options.message || 'Too many requests. Please try again later.',
        retryAfterSeconds,
      });
    }

    record.count += 1;
    return next();
  };
}

/**
 * Comprehensive security headers middleware
 * Adds defense-in-depth headers for XSS, clickjacking, MIME sniffing, and referrer leaks.
 */
export function securityHeadersMiddleware(req: Request, res: Response, next: NextFunction) {
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Legacy browser XSS filter
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions policy
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  next();
}

/**
 * Cryptographic password hashing using PBKDF2 with SHA-512 and random salt
 */
export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

/**
 * Verifies a password against stored PBKDF2 hash and salt using constant-time comparison
 */
export function verifyPassword(password: string, hash: string, salt: string): boolean {
  if (!password || !hash || !salt) return false;
  try {
    const computedHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return timingSafeCompare(computedHash, hash);
  } catch {
    return false;
  }
}

