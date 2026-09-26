import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';
import { DecodedIdToken } from 'firebase-admin/auth';

export interface AuthRequest extends Request {
  token?: string;
  user?: Partial<DecodedIdToken> & {
    uid: string;
    email?: string;
    name?: string;
    role?: string;
  };
}

// In-memory admin session storage for username/password sessions
export const adminSessions = new Map<string, { email: string; name: string; role: string; expiresAt: number }>();

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid authorization token' });
  }

  const token = authHeader.split('Bearer ')[1].trim();
  req.token = token;

  // Check if it's an admin session token
  const session = adminSessions.get(token);
  if (session) {
    if (Date.now() > session.expiresAt) {
      adminSessions.delete(token);
      return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }
    req.user = {
      uid: 'admin-' + session.email,
      email: session.email,
      name: session.name,
      role: session.role,
    };
    return next();
  }

  // Otherwise, attempt Firebase ID Token verification
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = {
      ...decodedToken,
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name || decodedToken.email?.split('@')[0],
      role: 'admin',
    };
    return next();
  } catch (error) {
    console.error('Error verifying auth token:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }
};
