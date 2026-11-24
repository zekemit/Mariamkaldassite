import { mkdtempSync, readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { installFakeRedis, type FakeRedis } from '@/test/fake-redis';

// next/cache only works inside the Next.js runtime; replace it with spies so we can assert on revalidation.
const cache = vi.hoisted(() => ({
  revalidateTag: vi.fn(),
  revalidatePath: vi.fn(),
  cacheTag: vi.fn(),
  cacheLife: vi.fn(),
}));
vi.mock('next/cache', () => cache);

import { defaultSiteContent } from '@/content/defaults';
import { siteContentSchema, type SiteContent } from '@/lib/cms-schema';
import {
  CMS_KEY,
  CMS_TAG,
  StorageError,
  getSiteContent,
  loadContent,
  resetSiteContent,
  saveSiteContent,
  storageStatus,
} from '@/lib/cms-storage';
import { redisConfig } from '@/lib/redis-rest';

const REDIS_ENV = { KV_REST_API_URL: 'https://fake-redis.example.test', KV_REST_API_TOKEN: 'secret-token' };
const edited = (): SiteContent => ({ ...structuredClone(defaultSiteContent), hero: { ...defaultSiteContent.hero, headline: 'Edited headline.' } });

let dir: string;
let file: string;

beforeEach(() => {
  dir = mkdtempSync(path.join(os.tmpdir(), 'cms-test-'));
  file = path.join(dir, 'site-content.json');
  vi.stubEnv('CMS_DATA_FILE', file);
  for (const name of ['KV_REST_API_URL', 'KV_REST_API_TOKEN', 'UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN', 'VERCEL']) {
    vi.stubEnv(name, '');
  }
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
  Object.values(cache).forEach((spy) => spy.mockClear());
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('redisConfig', () => {
  it('accepts either variable pair and trims a trailing slash', () => {
    expect(redisConfig({ KV_REST_API_URL: 'https://a.upstash.io/', KV_REST_API_TOKEN: 't' })).toEqual({ url: 'https://a.upstash.io', token: 't' });
    expect(redisConfig({ UPSTASH_REDIS_REST_URL: 'https://b.upstash.io', UPSTASH_REDIS_REST_TOKEN: 'u' })).toEqual({ url: 'https://b.upstash.io', token: 'u' });
  });

  it('prefers the KV pair and never mixes a URL with another pair’s token', () => {
    expect(
      redisConfig({
        KV_REST_API_URL: 'https://kv.example',
        KV_REST_API_TOKEN: 'kv-token',
        UPSTASH_REDIS_REST_URL: 'https://up.example',
        UPSTASH_REDIS_REST_TOKEN: 'up-token',
      }),
    ).toEqual({ url: 'https://kv.example', token: 'kv-token' });
    expect(redisConfig({ KV_REST_API_URL: 'https://kv.example', UPSTASH_REDIS_REST_TOKEN: 'up-token' })).toBeNull();
  });

  it('rejects missing, blank, non-https and malformed values (loopback http is allowed for tests)', () => {
    expect(redisConfig({})).toBeNull();
    expect(redisConfig({ KV_REST_API_URL: 'https://x.example', KV_REST_API_TOKEN: '  ' })).toBeNull();
    expect(redisConfig({ KV_REST_API_URL: 'http://evil.example', KV_REST_API_TOKEN: 't' })).toBeNull();
    expect(redisConfig({ KV_REST_API_URL: 'not a url', KV_REST_API_TOKEN: 't' })).toBeNull();
    expect(redisConfig({ KV_REST_API_URL: 'http://127.0.0.1:9999', KV_REST_API_TOKEN: 't' })).not.toBeNull();
  });
});

describe('storageStatus', () => {
  it('reports the active store and whether saving is possible', () => {
    expect(storageStatus()).toMatchObject({ kind: 'file', writable: true });
    vi.stubEnv('VERCEL', '1');
    expect(storageStatus()).toMatchObject({ kind: 'none', writable: false });
    for (const [k, v] of Object.entries(REDIS_ENV)) vi.stubEnv(k, v);
    expect(storageStatus()).toMatchObject({ kind: 'redis', writable: true });
  });
});

describe('local file storage (no Redis)', () => {
  it('serves the built-in defaults when no file exists yet', async () => {
    const loaded = await loadContent();
    expect(loaded.source).toBe('defaults');
    expect(loaded.content).toEqual(defaultSiteContent);
  });

  it('saves to the file, reads it back, and revalidates the cache', async () => {
    const result = await saveSiteContent(edited());
    expect(result.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);

    const onDisk = JSON.parse(readFileSync(file, 'utf8'));
    expect(onDisk.hero.headline).toBe('Edited headline.');
    expect(siteContentSchema.safeParse(onDisk).success).toBe(true);
    expect(readdirSync(dir)).toEqual(['site-content.json']); // temp file was renamed away

    const loaded = await loadContent();
    expect(loaded.source).toBe('file');
    expect(loaded.content.hero.headline).toBe('Edited headline.');

    expect(cache.revalidateTag).toHaveBeenCalledWith(CMS_TAG, { expire: 0 });
    expect(cache.revalidatePath).toHaveBeenCalledWith('/', 'layout');
  });

  it('getSiteContent is tagged for revalidation and returns the saved content', async () => {
    await saveSiteContent(edited());
    const content = await getSiteContent();
    expect(content.hero.headline).toBe('Edited headline.');
    expect(cache.cacheTag).toHaveBeenCalledWith(CMS_TAG);
    // A lifetime short enough to leave the static shell would turn every page into a request-time hole.
    const life = cache.cacheLife.mock.calls[0][0] as { stale: number; revalidate: number; expire: number };
    expect(life.stale).toBeGreaterThanOrEqual(300);
    expect(life.revalidate).toBeGreaterThan(0);
    expect(life.expire).toBeGreaterThanOrEqual(300);
  });

  it('keeps valid sections and falls back per-section when the file has bad or missing parts', async () => {
    const broken = JSON.parse(JSON.stringify(edited()));
    broken.announcement.linkLabel = 'Go';
    broken.announcement.linkUrl = 'javascript:alert(1)';
    delete broken.faq;
    writeFileSync(file, JSON.stringify(broken));
    const { content } = await loadContent();
    expect(content.hero.headline).toBe('Edited headline.');
    expect(content.announcement).toEqual(defaultSiteContent.announcement);
    expect(content.faq).toEqual(defaultSiteContent.faq);
  });

  it('survives a corrupt file (public read) but refuses it in strict mode (admin read)', async () => {
    writeFileSync(file, '{ this is not json');
    expect((await loadContent()).source).toBe('defaults');
    await expect(loadContent({ strict: true })).rejects.toBeInstanceOf(StorageError);
  });

  it('resets to the original verified copy', async () => {
    await saveSiteContent(edited());
    await resetSiteContent();
    expect((await loadContent()).content).toEqual(defaultSiteContent);
  });
});

describe('without any writable storage (Vercel, Upstash not connected)', () => {
  it('refuses to save, says why, and does not touch the cache', async () => {
    vi.stubEnv('VERCEL', '1');
    await expect(saveSiteContent(edited())).rejects.toMatchObject({ name: 'StorageError', code: 'not-writable' });
    expect(existsSync(file)).toBe(false);
    expect(cache.revalidateTag).not.toHaveBeenCalled();
    expect(cache.revalidatePath).not.toHaveBeenCalled();
  });

  it('still serves the built-in content to visitors', async () => {
    vi.stubEnv('VERCEL', '1');
    expect((await loadContent()).content).toEqual(defaultSiteContent);
  });
});

describe('Upstash Redis storage', () => {
  let redis: FakeRedis;
  beforeEach(() => {
    for (const [k, v] of Object.entries(REDIS_ENV)) vi.stubEnv(k, v);
    redis = installFakeRedis();
  });

  it('writes one JSON document at cms:mariam:content with the bearer token, then revalidates', async () => {
    await saveSiteContent(edited());
    const stored = redis.store.get(CMS_KEY);
    expect(stored).toBeDefined();
    const doc = JSON.parse(stored!.value);
    expect(doc.v).toBe(1);
    expect(doc.content.hero.headline).toBe('Edited headline.');
    expect(doc.updatedAt).toMatch(/^\d{4}-/);
    expect(redis.lastAuth).toBe('Bearer secret-token');
    expect(existsSync(file)).toBe(false); // Redis mode never writes the local file
    expect(cache.revalidateTag).toHaveBeenCalledWith(CMS_TAG, { expire: 0 });
    expect(cache.revalidatePath).toHaveBeenCalledWith('/', 'layout');
  });

  it('round-trips through Redis and reports the save time', async () => {
    const { updatedAt } = await saveSiteContent(edited());
    const loaded = await loadContent();
    expect(loaded.source).toBe('redis');
    expect(loaded.updatedAt).toBe(updatedAt);
    expect(loaded.content.hero.headline).toBe('Edited headline.');
  });

  it('starts from the file seed (or defaults) when nothing has been saved yet', async () => {
    expect((await loadContent()).source).toBe('defaults');
    writeFileSync(file, JSON.stringify(edited()));
    const loaded = await loadContent();
    expect(loaded.source).toBe('file');
    expect(loaded.content.hero.headline).toBe('Edited headline.');
  });

  it('accepts a bare content object written straight into Redis', async () => {
    redis.store.set(CMS_KEY, { value: JSON.stringify(edited()), expiresAt: null });
    expect((await loadContent()).content.hero.headline).toBe('Edited headline.');
  });

  it('public reads fall back when Redis is down; admin (strict) reads refuse', async () => {
    await saveSiteContent(edited());
    redis.failing = true;
    expect((await loadContent()).content).toEqual(defaultSiteContent);
    await expect(loadContent({ strict: true })).rejects.toMatchObject({ name: 'StorageError', code: 'read-failed' });
  });

  it('a failed write throws, never revalidates, and never leaks the token or URL', async () => {
    redis.failing = true;
    const error = await saveSiteContent(edited()).catch((e: unknown) => e);
    expect(error).toMatchObject({ name: 'StorageError', code: 'write-failed' });
    expect(String((error as Error).message)).not.toMatch(/secret-token|fake-redis/);
    const logged = (console.error as unknown as { mock: { calls: unknown[][] } }).mock.calls.flat().join(' ');
    expect(logged).not.toMatch(/secret-token|fake-redis/);
    expect(cache.revalidateTag).not.toHaveBeenCalled();
    expect(cache.revalidatePath).not.toHaveBeenCalled();
  });
});
