import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { prisma } from './prisma';
import { UserRole } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'campus360-jwt-secret-key-enterprise-2026-v1';
const COOKIE_NAME = 'campus360_session';

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department: string | null;
  avatarUrl: string | null;
}

// Generate secure signature for session token
export function signToken(payload: object): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 })).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

// Verify session token
export function verifyToken(token: string): any | null {
  try {
    const [header, body, signature] = token.split('.');
    if (!header || !body || !signature) return null;

    const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
    if (signature !== expectedSig) return null;

    const decoded = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8'));
    if (decoded.exp && Date.now() > decoded.exp) return null;

    return decoded;
  } catch {
    return null;
  }
}

// Get current session from Next.js headers/cookies
export async function getCurrentUser(): Promise<UserSession | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const decoded = verifyToken(token);
    if (!decoded || !decoded.id) return null;

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        department: true,
        avatarUrl: true,
      },
    });

    return user;
  } catch {
    return null;
  }
}

// Helper to authenticate request in route handlers
export async function authenticateRequest(req: NextRequest): Promise<UserSession | null> {
  try {
    let token = req.cookies.get(COOKIE_NAME)?.value;
    if (!token) {
      const authHeader = req.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) return null;
    const decoded = verifyToken(token);
    if (!decoded?.id) return null;

    return await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        department: true,
        avatarUrl: true,
      },
    });
  } catch {
    return null;
  }
}

// Check role permissions
export function hasPermission(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  if (userRole === UserRole.SYSTEM_ADMIN) return true; // Superuser override
  return allowedRoles.includes(userRole);
}

export { COOKIE_NAME };

