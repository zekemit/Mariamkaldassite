import 'server-only';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { cacheLife, cacheTag, revalidatePath, revalidateTag } from 'next/cache';
import { defaultSiteContent } from '@/content/defaults';
import { parseStoredContent, type SiteContent } from '@/lib/cms-schema';
import { redisCommand, redisConfig } from '@/lib/redis-rest';

// The single persistence layer for editable site content.
//
//   production  Upstash Redis / Vercel KV: one JSON document at key `cms:mariam:content`
//   local dev   data/site-content.json (seeded with the verified copy), so /admin works with no setup
//   neither     the site serves the committed defaults; saving is disabled with a clear message
//
// Every save revalidates the Next.js cache, so edits are live on the next page view with no deploy.

export const CMS_KEY = 'cms:mariam:content';
export const CMS_TAG = 'site-content';

export type StorageKind = 'redis' | 'file' | 'none';

export interface StorageStatus {
  kind: StorageKind;
  writable: boolean;
  label: string;
  detail: string;
}

export type ContentSource = 'redis' | 'file' | 'defaults';

export interface LoadedContent {
  content: SiteContent;
  /** ISO time of the last save, when storage records one. */
  updatedAt: string | null;
  source: ContentSource;
}

export class StorageError extends Error {
  constructor(
    readonly code: 'not-writable' | 'write-failed' | 'read-failed',
    message: string,
  ) {
    super(message);
    this.name = 'StorageError';
  }
}

export function dataFilePath(): string {
  return process.env.CMS_DATA_FILE?.trim() || path.join(process.cwd(), 'data', 'site-content.json');
}

export function storageStatus(): StorageStatus {
  if (redisConfig()) {
    return { kind: 'redis', writable: true, label: 'Upstash Redis', detail: 'Saved changes go live on the site immediately.' };
  }
  // Vercel's filesystem is read-only, so without Redis there is nowhere durable to save.
  if (process.env.VERCEL) {
    return {
      kind: 'none',
      writable: false,
      label: 'Not connected',
      detail: 'Saving is turned off until an Upstash Redis database is connected in Vercel. The site is showing its built-in copy.',
    };
  }
  return { kind: 'file', writable: true, label: 'Local file', detail: 'Saving to a file on this computer (development).' };
}

function decodeDocument(raw: unknown): { content: SiteContent; updatedAt: string | null } {
  const parsed: unknown = typeof raw === 'string' ? JSON.parse(raw) : raw;
  const record = parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {};
  // Redis holds { v, updatedAt, content }; the local file and hand-written values may be the bare content object.
  const inner = 'content' in record && 'v' in record ? record.content : record;
  const updatedAt = typeof record.updatedAt === 'string' ? record.updatedAt : null;
  return { content: parseStoredContent(inner, defaultSiteContent), updatedAt };
}

async function readFile(strict: boolean): Promise<LoadedContent> {
  try {
    // The seed file is shipped explicitly (outputFileTracingIncludes in next.config.ts), and CMS_DATA_FILE can point
    // anywhere, so tell the bundler not to trace the whole project for this dynamic path.
    const raw = await fs.readFile(/* turbopackIgnore: true */ dataFilePath(), 'utf8');
    return { ...decodeDocument(raw), source: 'file' };
  } catch (error) {
    const missing = (error as NodeJS.ErrnoException).code === 'ENOENT';
    if (!missing && strict) throw new StorageError('read-failed', 'The saved content file could not be read.');
    if (!missing) console.error('[cms] could not read the content file; using built-in defaults');
    return { content: structuredClone(defaultSiteContent), updatedAt: null, source: 'defaults' };
  }
}

/**
 * Reads the current content from storage (uncached).
 * `strict` is for the admin editor: if Redis is configured but unreadable it throws instead of falling back, so an
 * outage can never lead to the built-in defaults being shown for editing and then saved over Mariam's real content.
 */
export async function loadContent(options: { strict?: boolean } = {}): Promise<LoadedContent> {
  const strict = options.strict ?? false;
  const config = redisConfig();
  if (config) {
    try {
      const raw = await redisCommand<string | null>(config, ['GET', CMS_KEY]);
      if (raw !== null && raw !== undefined) return { ...decodeDocument(raw), source: 'redis' };
      // Nothing saved yet: start from the file seed (or the defaults).
      return await readFile(false);
    } catch (error) {
      if (strict) throw new StorageError('read-failed', 'Your saved content could not be loaded from the database.');
      console.error('[cms] database read failed; serving fallback content:', error instanceof Error ? error.message : error);
      return await readFile(false);
    }
  }
  return readFile(strict);
}

/**
 * What every public page renders from. Cached by Next.js and tagged `site-content`, so it is served from the cache
 * until a save invalidates it. The lifetime is long enough to stay in the static shell (shorter lifetimes turn the
 * data into a request-time hole); the tag, not the clock, is what makes edits appear immediately.
 */
export async function getSiteContent(): Promise<SiteContent> {
  'use cache';
  cacheTag(CMS_TAG);
  cacheLife({ stale: 300, revalidate: 300, expire: 86400 });
  return (await loadContent()).content;
}

async function writeFileAtomic(content: SiteContent): Promise<void> {
  const target = dataFilePath();
  const temp = `${target}.${process.pid}.tmp`;
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(temp, `${JSON.stringify(content, null, 2)}\n`, 'utf8');
  await fs.rename(temp, target);
}

/** Writes already-validated content to storage and makes the live site pick it up. */
export async function saveSiteContent(content: SiteContent): Promise<{ updatedAt: string }> {
  const status = storageStatus();
  if (!status.writable) throw new StorageError('not-writable', status.detail);

  const updatedAt = new Date().toISOString();
  const config = redisConfig();
  try {
    if (config) {
      await redisCommand(config, ['SET', CMS_KEY, JSON.stringify({ v: 1, updatedAt, content })]);
    } else {
      await writeFileAtomic(content);
    }
  } catch (error) {
    console.error('[cms] save failed:', error instanceof Error ? error.message : error);
    throw new StorageError('write-failed', 'The content could not be written to storage.');
  }

  // Expire the tagged data so the next request re-reads storage (no stale copy served), and mark every page under
  // the root layout for regeneration. Route Handlers can't call updateTag, so revalidateTag with expire: 0 it is.
  revalidateTag(CMS_TAG, { expire: 0 });
  revalidatePath('/', 'layout');
  return { updatedAt };
}

/** "Reset to Defaults": publishes the original, verified copy. */
export async function resetSiteContent(): Promise<{ updatedAt: string }> {
  return saveSiteContent(structuredClone(defaultSiteContent));
}
