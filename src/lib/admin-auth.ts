import 'server-only';
import { createHash, createHmac, scryptSync, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

// Admin sign-in for /admin. One shared password (ADMIN_PASSWORD) is the only secret Mariam needs to know.
//
//  - The password is compared with crypto.timingSafeEqual over SHA-256 digests (equal length, constant time).
//  - A successful sign-in sets a stateless session cookie: an HMAC-SHA256-signed token with an expiry.
//    HttpOnly (no script can read it), SameSite=Lax, Secure in production, valid for 7 days.
//  - The token carries a fingerprint of the current password, so changing ADMIN_PASSWORD signs everyone out.
//  - The signing key comes from ADMIN_SESSION_SECRET when set; otherwise it is derived from the password with scrypt.

export const SESSION_MAX_AGE_SEC = 7 * 24 * 60 * 60;
const TOKEN_VERSION = 1;
const LABEL = 'mariam-admin-session-v1';

const isProduction = () => process.env.NODE_ENV === 'production';

/** "__Host-" pins the cookie to this exact host over HTTPS with Path=/ (production only, since it requires Secure). */
export function sessionCookieName(): string {
  return isProduction() ? '__Host-mk_admin' : 'mk_admin';
}

export function adminPassword(): string {
  return process.env.ADMIN_PASSWORD ?? '';
}

export function isAdminConfigured(): boolean {
  return adminPassword().length > 0;
}

const sha256 = (value: string) => createHash('sha256').update(value).digest();

/** True when `input` equals ADMIN_PASSWORD. Always false when no password is configured. */
export function checkPassword(input: string): boolean {
  const expected = adminPassword();
  if (!expected) return false;
  // Hashing first gives both sides the same length, which timingSafeEqual requires, and hides the real length.
  return timingSafeEqual(sha256(input), sha256(expected));
}

let keyCache: { source: string; key: Buffer } | null = null;

function signingKey(): Buffer {
  const secret = process.env.ADMIN_SESSION_SECRET?.trim();
  const source = secret ? `secret:${secret}` : `password:${adminPassword()}`;
  if (keyCache?.source === source) return keyCache.key;
  const key = secret ? createHmac('sha256', LABEL).update(secret).digest() : scryptSync(adminPassword(), LABEL, 32);
  keyCache = { source, key };
  return key;
}

const b64 = (buffer: Buffer) => buffer.toString('base64url');
const sign = (payload: string) => createHmac('sha256', signingKey()).update(payload).digest();
const passwordFingerprint = () => b64(createHmac('sha256', signingKey()).update(`pw|${adminPassword()}`).digest()).slice(0, 22);

function safeEqual(a: Buffer, b: Buffer): boolean {
  return a.length === b.length && timingSafeEqual(a, b);
}

export function createSessionToken(now = Date.now()): string {
  const iat = Math.floor(now / 1000);
  const payload = b64(Buffer.from(JSON.stringify({ v: TOKEN_VERSION, iat, exp: iat + SESSION_MAX_AGE_SEC, pf: passwordFingerprint() })));
  return `${payload}.${b64(sign(payload))}`;
}

export function verifySessionToken(token: string | undefined | null, now = Date.now()): boolean {
  if (!token || !isAdminConfigured()) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [payload, signature] = parts;

  let provided: Buffer;
  try {
    provided = Buffer.from(signature, 'base64url');
  } catch {
    return false;
  }
  if (!safeEqual(provided, sign(payload))) return false;

  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { v?: unknown; iat?: unknown; exp?: unknown; pf?: unknown };
    const seconds = Math.floor(now / 1000);
    if (data.v !== TOKEN_VERSION || typeof data.iat !== 'number' || typeof data.exp !== 'number' || typeof data.pf !== 'string') return false;
    if (data.exp <= seconds || data.iat > seconds + 60) return false;
    return safeEqual(Buffer.from(data.pf), Buffer.from(passwordFingerprint()));
  } catch {
    return false;
  }
}

export interface SessionCookie {
  name: string;
  value: string;
  httpOnly: true;
  secure: boolean;
  sameSite: 'lax';
  path: '/';
  maxAge: number;
}

export function sessionCookie(token: string): SessionCookie {
  return { name: sessionCookieName(), value: token, httpOnly: true, secure: isProduction(), sameSite: 'lax', path: '/', maxAge: SESSION_MAX_AGE_SEC };
}

export function clearedSessionCookie(): SessionCookie {
  return { ...sessionCookie(''), maxAge: 0 };
}

/** For Route Handlers: reads the session from the incoming request's cookies. */
export function requestHasAdminSession(request: { cookies: { get(name: string): { value: string } | undefined } }): boolean {
  return verifySessionToken(request.cookies.get(sessionCookieName())?.value);
}

/** For Server Components: reads the session from the request's cookie jar (needs a <Suspense> boundary above it). */
export async function hasAdminSession(): Promise<boolean> {
  const jar = await cookies();
  return verifySessionToken(jar.get(sessionCookieName())?.value);
}
