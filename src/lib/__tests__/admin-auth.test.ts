import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { installFakeRedis } from '@/test/fake-redis';
import {
  SESSION_MAX_AGE_SEC,
  checkPassword,
  clearedSessionCookie,
  createSessionToken,
  isAdminConfigured,
  sessionCookie,
  sessionCookieName,
  verifySessionToken,
} from '@/lib/admin-auth';
import { FailureCounter, MAX_FAILURES, loginAllowance, loginKey, recordLoginFailure, recordLoginSuccess } from '@/lib/admin-rate-limit';

vi.mock('next/headers', () => ({ cookies: vi.fn() }));

beforeEach(() => {
  vi.stubEnv('ADMIN_PASSWORD', 'correct horse battery staple');
  vi.stubEnv('ADMIN_SESSION_SECRET', '');
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('password check', () => {
  it('accepts only the exact configured password', () => {
    expect(checkPassword('correct horse battery staple')).toBe(true);
    expect(checkPassword('correct horse battery stapl')).toBe(false);
    expect(checkPassword('correct horse battery staple ')).toBe(false);
    expect(checkPassword('')).toBe(false);
    expect(checkPassword('x'.repeat(5000))).toBe(false);
  });

  it('refuses everything when no password is configured (an empty password never matches)', () => {
    vi.stubEnv('ADMIN_PASSWORD', '');
    expect(isAdminConfigured()).toBe(false);
    expect(checkPassword('')).toBe(false);
    expect(checkPassword('anything')).toBe(false);
    expect(verifySessionToken(createSessionToken())).toBe(false);
  });
});

describe('session tokens', () => {
  it('verifies a fresh token and rejects missing or malformed ones', () => {
    const token = createSessionToken();
    expect(verifySessionToken(token)).toBe(true);
    for (const bad of [undefined, null, '', 'abc', 'a.b.c', `${token}x`, token.split('.')[0], '.', 'e30.e30']) {
      expect(verifySessionToken(bad as string | undefined), String(bad)).toBe(false);
    }
  });

  it('rejects a tampered payload or signature', () => {
    const [payload, signature] = createSessionToken().split('.');
    const forged = Buffer.from(JSON.stringify({ v: 1, iat: 1, exp: 9_999_999_999, pf: 'x' })).toString('base64url');
    expect(verifySessionToken(`${forged}.${signature}`)).toBe(false);
    const flipped = signature.slice(0, -2) + (signature.endsWith('AA') ? 'BB' : 'AA');
    expect(verifySessionToken(`${payload}.${flipped}`)).toBe(false);
  });

  it('expires after seven days', () => {
    const issued = Date.UTC(2026, 10, 24);
    const token = createSessionToken(issued);
    expect(verifySessionToken(token, issued + 1000)).toBe(true);
    expect(verifySessionToken(token, issued + (SESSION_MAX_AGE_SEC - 5) * 1000)).toBe(true);
    expect(verifySessionToken(token, issued + (SESSION_MAX_AGE_SEC + 5) * 1000)).toBe(false);
  });

  it('rejects a token dated far in the future', () => {
    const token = createSessionToken(Date.now() + 3 * 24 * 3600 * 1000);
    expect(verifySessionToken(token)).toBe(false);
  });

  it('signs everyone out when the password changes', () => {
    const token = createSessionToken();
    vi.stubEnv('ADMIN_PASSWORD', 'a different password entirely');
    expect(verifySessionToken(token)).toBe(false);
  });

  it('uses ADMIN_SESSION_SECRET when set, and a token signed with another secret is rejected', () => {
    vi.stubEnv('ADMIN_SESSION_SECRET', 'first-secret-first-secret-first-secret');
    const token = createSessionToken();
    expect(verifySessionToken(token)).toBe(true);
    vi.stubEnv('ADMIN_SESSION_SECRET', 'second-secret-second-secret-second-sec');
    expect(verifySessionToken(token)).toBe(false);
  });
});

describe('session cookie', () => {
  it('is HttpOnly, SameSite=Lax, site-wide, and lasts seven days', () => {
    const cookie = sessionCookie('tok');
    expect(cookie).toMatchObject({ httpOnly: true, sameSite: 'lax', path: '/', maxAge: 7 * 24 * 60 * 60, value: 'tok' });
  });

  it('is Secure with the __Host- prefix in production only', () => {
    vi.stubEnv('NODE_ENV', 'development');
    expect(sessionCookie('t').secure).toBe(false);
    expect(sessionCookieName()).toBe('mk_admin');
    vi.stubEnv('NODE_ENV', 'production');
    expect(sessionCookie('t').secure).toBe(true);
    expect(sessionCookieName()).toBe('__Host-mk_admin');
  });

  it('clearing expires it immediately', () => {
    expect(clearedSessionCookie()).toMatchObject({ value: '', maxAge: 0, httpOnly: true });
  });
});

describe('FailureCounter (in-memory fallback)', () => {
  it('blocks after the maximum failures and frees the key when the window ends', () => {
    let now = 1_000_000;
    const counter = new FailureCounter(3, 60_000, () => now);
    for (let i = 0; i < 3; i++) {
      expect(counter.peek('ip').allowed).toBe(true);
      counter.hit('ip');
    }
    const blocked = counter.peek('ip');
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSec).toBe(60);
    expect(counter.peek('other').allowed).toBe(true);
    now += 59_000;
    expect(counter.peek('ip')).toEqual({ allowed: false, retryAfterSec: 1 });
    now += 2_000;
    expect(counter.peek('ip').allowed).toBe(true);
  });

  it('clear forgets a key', () => {
    const counter = new FailureCounter(1, 60_000);
    counter.hit('ip');
    expect(counter.peek('ip').allowed).toBe(false);
    counter.clear('ip');
    expect(counter.peek('ip').allowed).toBe(true);
  });
});

describe('login throttle', () => {
  it('without Redis: blocks the sixth attempt, and a success resets the count', async () => {
    const ip = '203.0.113.10';
    for (let i = 0; i < MAX_FAILURES; i++) {
      expect((await loginAllowance(ip)).allowed).toBe(true);
      await recordLoginFailure(ip);
    }
    const blocked = await loginAllowance(ip);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSec).toBeGreaterThan(0);
    await recordLoginSuccess(ip);
    expect((await loginAllowance(ip)).allowed).toBe(true);
  });

  it('with Redis: counts in a shared key, hashes the IP, expires the key, and blocks at the limit', async () => {
    vi.stubEnv('KV_REST_API_URL', 'https://fake-redis.example.test');
    vi.stubEnv('KV_REST_API_TOKEN', 't');
    const redis = installFakeRedis();
    const ip = '203.0.113.20';
    const key = loginKey(ip);
    expect(key).not.toContain(ip);

    for (let i = 0; i < MAX_FAILURES; i++) await recordLoginFailure(ip);
    expect(redis.store.get(key)?.value).toBe(String(MAX_FAILURES));
    expect(redis.store.get(key)?.expiresAt).toBeGreaterThan(Date.now());

    const blocked = await loginAllowance(ip);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSec).toBeGreaterThan(800);

    await recordLoginSuccess(ip);
    expect(redis.store.has(key)).toBe(false);
    expect((await loginAllowance(ip)).allowed).toBe(true);
  });

  it('with Redis down: falls back to the in-memory counter instead of failing open or locking out', async () => {
    vi.stubEnv('KV_REST_API_URL', 'https://fake-redis.example.test');
    vi.stubEnv('KV_REST_API_TOKEN', 't');
    const redis = installFakeRedis();
    redis.failing = true;
    const ip = '203.0.113.30';
    expect((await loginAllowance(ip)).allowed).toBe(true);
    for (let i = 0; i < MAX_FAILURES; i++) await recordLoginFailure(ip);
    expect((await loginAllowance(ip)).allowed).toBe(false);
  });
});
