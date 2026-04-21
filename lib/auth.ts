import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import type { JWTPayload } from '@/types';

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'ariz-joias-secret-key-2025-luxury'
);

const COOKIE_NAME = 'ariz_session';

export async function signToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function hashPassword(password: string): string {
  // Simple hash for demo purposes — swap for bcrypt in production
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return `hash_${Math.abs(hash)}_${password.length}`;
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

export const COOKIE_NAME_EXPORT = COOKIE_NAME;
