import { mkdtempSync, existsSync, readFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const cache = vi.hoisted(() => ({
  revalidateTag: vi.fn(),
  revalidatePath: vi.fn(),
  cacheTag: vi.fn(),
  cacheLife: vi.fn(),
}));
vi.mock('next/cache', () => cache);
vi.mock('next/headers', () => ({ cookies: vi.fn() }));

import { POST as login } from '@/app/api/admin/login/route';
import { POST as logout } from '@/app/api/admin/logout/route';
import { DELETE, GET, PUT } from '@/app/api/admin/content/route';
import { defaultSiteContent } from '@/content/defaults';
import { createSessionToken, sessionCookieName } from '@/lib/admin-auth';
import type { SiteContent } from '@/lib/cms-schema';

const ORIGIN = 'http://localhost:3000';
const PASSWORD = 'correct horse battery staple';
let ip = 0;
let file: string;

function req(method: string, url: string, init: { body?: unknown; cookie?: string; origin?: string | null; type?: string | null; ip?: string } = {}) {
  const headers: Record<string, string> = { host: 'localhost:3000', 'x-forwarded-for': init.ip ?? `198.51.100.${++ip}` };
  if (init.origin !== null) headers.origin = init.origin ?? ORIGIN;
  if (init.type !== null) headers['content-type'] = init.type ?? 'application/json';
  if (init.cookie) headers.cookie = init.cookie;
  return new NextRequest(`${ORIGIN}${url}`, {
    method,
    headers,
    body: init.body === undefined ? undefined : typeof init.body === 'string' ? init.body : JSON.stringify(init.body),
  });
}

const authed = () => `${sessionCookieName()}=${createSessionToken()}`;
const edited = (): SiteContent => ({ ...structuredClone(defaultSiteContent), hero: { ...defaultSiteContent.hero, headline: 'A brand new headline.' } });

beforeEach(() => {
  file = path.join(mkdtempSync(path.join(os.tmpdir(), 'cms-api-')), 'site-content.json');
  vi.stubEnv('CMS_DATA_FILE', file);
  vi.stubEnv('ADMIN_PASSWORD', PASSWORD);
  vi.stubEnv('ADMIN_SESSION_SECRET', '');
  for (const name of ['KV_REST_API_URL', 'KV_REST_API_TOKEN', 'UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN', 'VERCEL']) vi.stubEnv(name, '');
  Object.values(cache).forEach((spy) => spy.mockClear());
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('POST /api/admin/login', () => {
  it('signs in with the right password and sets a signed, HttpOnly, SameSite=Lax, 7-day cookie', async () => {
    const response = await login(req('POST', '/api/admin/login', { body: { password: PASSWORD } }));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    const setCookie = response.headers.get('set-cookie') ?? '';
    expect(setCookie).toContain(`${sessionCookieName()}=`);
    expect(setCookie).toMatch(/HttpOnly/i);
    expect(setCookie).toMatch(/SameSite=lax/i);
    expect(setCookie).toMatch(/Max-Age=604800/);
    expect(setCookie).toMatch(/Path=\//);
    expect(setCookie).not.toMatch(/Secure/i); // not production
    expect(response.headers.get('cache-control')).toBe('no-store');
  });

  it('marks the cookie Secure (and __Host- prefixed) in production', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const response = await login(req('POST', '/api/admin/login', { body: { password: PASSWORD } }));
    const setCookie = response.headers.get('set-cookie') ?? '';
    expect(setCookie).toMatch(/^__Host-mk_admin=/);
    expect(setCookie).toMatch(/Secure/i);
    expect(setCookie).toMatch(/HttpOnly/i);
  });

  it('answers a wrong password with a generic 401 and no cookie', async () => {
    const response = await login(req('POST', '/api/admin/login', { body: { password: 'nope' } }));
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ ok: false, error: 'invalid_credentials' });
    expect(response.headers.get('set-cookie')).toBeNull();
  });

  it('throttles repeated failures per IP (429 + Retry-After) without affecting other IPs', async () => {
    const attacker = '192.0.2.77';
    for (let i = 0; i < 5; i++) {
      expect((await login(req('POST', '/api/admin/login', { body: { password: `guess${i}` }, ip: attacker }))).status).toBe(401);
    }
    const blocked = await login(req('POST', '/api/admin/login', { body: { password: PASSWORD }, ip: attacker }));
    expect(blocked.status).toBe(429);
    expect(Number(blocked.headers.get('retry-after'))).toBeGreaterThan(0);
    expect(blocked.headers.get('set-cookie')).toBeNull(); // even the right password is refused while throttled

    const other = await login(req('POST', '/api/admin/login', { body: { password: PASSWORD }, ip: '192.0.2.78' }));
    expect(other.status).toBe(200);
  }, 15_000);

  it('says "not configured" (503) when ADMIN_PASSWORD is unset, and never signs anyone in', async () => {
    vi.stubEnv('ADMIN_PASSWORD', '');
    for (const password of ['', 'anything']) {
      const response = await login(req('POST', '/api/admin/login', { body: { password } }));
      expect(response.status).toBe(503);
      expect((await response.json()).error).toBe('not_configured');
      expect(response.headers.get('set-cookie')).toBeNull();
    }
  });

  it('rejects cross-site requests, wrong content types, bad JSON, extra fields and oversized bodies', async () => {
    expect((await login(req('POST', '/api/admin/login', { body: { password: PASSWORD }, origin: 'https://evil.example' }))).status).toBe(403);
    expect((await login(req('POST', '/api/admin/login', { body: { password: PASSWORD }, origin: null }))).status).toBe(403);
    expect((await login(req('POST', '/api/admin/login', { body: 'password=x', type: 'application/x-www-form-urlencoded' }))).status).toBe(415);
    expect((await login(req('POST', '/api/admin/login', { body: '{not json' }))).status).toBe(400);
    expect((await login(req('POST', '/api/admin/login', { body: { password: PASSWORD, extra: 1 } }))).status).toBe(400);
    expect((await login(req('POST', '/api/admin/login', { body: { password: 'x'.repeat(5000) } }))).status).toBe(413);
  });
});

describe('POST /api/admin/logout', () => {
  it('expires the cookie', async () => {
    const response = await logout(req('POST', '/api/admin/logout', { cookie: authed() }));
    expect(response.status).toBe(200);
    const setCookie = response.headers.get('set-cookie') ?? '';
    expect(setCookie).toMatch(new RegExp(`${sessionCookieName()}=;`));
    expect(setCookie).toMatch(/Max-Age=0/);
  });

  it('is same-origin only', async () => {
    expect((await logout(req('POST', '/api/admin/logout', { origin: 'https://evil.example' }))).status).toBe(403);
  });
});

describe('/api/admin/content requires a valid session', () => {
  it.each([
    ['GET', () => GET(req('GET', '/api/admin/content', { type: null, origin: null }))],
    ['PUT', () => PUT(req('PUT', '/api/admin/content', { body: edited() }))],
    ['DELETE', () => DELETE(req('DELETE', '/api/admin/content', { type: null }))],
    ['PUT with a forged cookie', () => PUT(req('PUT', '/api/admin/content', { body: edited(), cookie: `${sessionCookieName()}=forged.token` }))],
  ])('%s without a session returns 401 and changes nothing', async (_name, call) => {
    const response = await call();
    expect(response.status).toBe(401);
    expect(existsSync(file)).toBe(false);
    expect(cache.revalidatePath).not.toHaveBeenCalled();
  });
});

describe('/api/admin/content', () => {
  it('GET returns the current content and storage status', async () => {
    const response = await GET(req('GET', '/api/admin/content', { cookie: authed(), type: null, origin: null }));
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.content.hero.headline).toBe(defaultSiteContent.hero.headline);
    expect(body.storage).toMatchObject({ kind: 'file', writable: true });
  });

  it('PUT validates, saves, and revalidates the live site', async () => {
    const response = await PUT(req('PUT', '/api/admin/content', { body: edited(), cookie: authed() }));
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.content.hero.headline).toBe('A brand new headline.');
    expect(JSON.parse(readFileSync(file, 'utf8')).hero.headline).toBe('A brand new headline.');
    expect(cache.revalidatePath).toHaveBeenCalledWith('/', 'layout');
    expect(cache.revalidateTag).toHaveBeenCalledWith('site-content', { expire: 0 });
  });

  it('PUT returns per-field errors (422) and writes nothing when validation fails', async () => {
    const bad = edited();
    bad.hero.headline = '';
    bad.settings.email = 'nope';
    const response = await PUT(req('PUT', '/api/admin/content', { body: bad, cookie: authed() }));
    const body = await response.json();
    expect(response.status).toBe(422);
    expect(body.fieldErrors['hero.headline']).toBeDefined();
    expect(body.fieldErrors['settings.email']).toBeDefined();
    expect(existsSync(file)).toBe(false);
    expect(cache.revalidatePath).not.toHaveBeenCalled();
  });

  it('PUT rejects javascript:, data: and other unsafe URLs (XSS) in links and images', async () => {
    const attempts: [string, (c: SiteContent) => void][] = [
      ['announcement.linkUrl', (c) => ((c.announcement.enabled = true), (c.announcement.text = 'Hi'), (c.announcement.linkLabel = 'Go'), (c.announcement.linkUrl = 'javascript:alert(document.cookie)'))],
      ['popup.ctaUrl', (c) => ((c.popup.ctaMode = 'url'), (c.popup.ctaUrl = 'JaVaScRiPt:alert(1)'))],
      ['popup.imageUrl', (c) => (c.popup.imageUrl = 'data:image/svg+xml,<svg onload=alert(1)>')],
      ['hero.portraitSrc', (c) => (c.hero.portraitSrc = 'javascript:alert(1)')],
      ['settings.linkedin', (c) => (c.settings.linkedin = 'javascript:alert(1)')],
      ['about.credentials.0.href', (c) => (c.about.credentials[0].href = '//evil.example/phish')],
    ];
    for (const [field, mutate] of attempts) {
      const content = edited();
      mutate(content);
      const response = await PUT(req('PUT', '/api/admin/content', { body: content, cookie: authed() }));
      expect(response.status, field).toBe(422);
      expect(Object.keys((await response.json()).fieldErrors), field).toContain(field);
    }
    expect(existsSync(file)).toBe(false);
  });

  it('PUT rejects unknown fields, and cross-site or non-JSON requests', async () => {
    const withExtra = { ...edited(), admin: true };
    expect((await PUT(req('PUT', '/api/admin/content', { body: withExtra, cookie: authed() }))).status).toBe(422);
    expect((await PUT(req('PUT', '/api/admin/content', { body: edited(), cookie: authed(), origin: 'https://evil.example' }))).status).toBe(403);
    expect((await PUT(req('PUT', '/api/admin/content', { body: 'x', cookie: authed(), type: 'text/plain' }))).status).toBe(415);
    expect((await PUT(req('PUT', '/api/admin/content', { body: '{oops', cookie: authed() }))).status).toBe(400);
    expect((await PUT(req('PUT', '/api/admin/content', { body: 'x'.repeat(500_000), cookie: authed() }))).status).toBe(413);
  });

  it('PUT explains when storage is not connected (production without Upstash)', async () => {
    vi.stubEnv('VERCEL', '1');
    const response = await PUT(req('PUT', '/api/admin/content', { body: edited(), cookie: authed() }));
    const body = await response.json();
    expect(response.status).toBe(503);
    expect(body.error).toBe('storage_not_configured');
    expect(body.message).toMatch(/Upstash/);
    expect(cache.revalidatePath).not.toHaveBeenCalled();
  });

  it('DELETE resets to the verified defaults', async () => {
    await PUT(req('PUT', '/api/admin/content', { body: edited(), cookie: authed() }));
    const response = await DELETE(req('DELETE', '/api/admin/content', { cookie: authed(), type: null }));
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.content).toEqual(defaultSiteContent);
    expect(JSON.parse(readFileSync(file, 'utf8')).hero.headline).toBe(defaultSiteContent.hero.headline);
  });
});
