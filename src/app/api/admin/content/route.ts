import type { NextRequest } from 'next/server';
import { requestHasAdminSession } from '@/lib/admin-auth';
import { issuesToFieldErrors, siteContentSchema } from '@/lib/cms-schema';
import { StorageError, loadContent, resetSiteContent, saveSiteContent, storageStatus } from '@/lib/cms-storage';
import { isAllowedOrigin, json, readJsonBody } from '@/lib/request-guards';

// The admin content API. Every method requires the signed session cookie; every change must come from this site's
// own pages (same-origin) and is validated against the zod schema before anything is written.

const MAX_BODY_BYTES = 400_000;

const unauthorized = () => json({ ok: false, error: 'unauthorized' }, 401);

function storageFailure(error: unknown) {
  if (error instanceof StorageError) {
    if (error.code === 'not-writable') return json({ ok: false, error: 'storage_not_configured', message: error.message }, 503);
    return json({ ok: false, error: 'storage_failed', message: error.message }, 502);
  }
  console.error('[admin] unexpected error:', error instanceof Error ? error.message : error);
  return json({ ok: false, error: 'server_error' }, 500);
}

/** The current saved content, for the editor. */
export async function GET(request: NextRequest) {
  if (!requestHasAdminSession(request)) return unauthorized();
  try {
    const loaded = await loadContent({ strict: true });
    return json({ ok: true, content: loaded.content, updatedAt: loaded.updatedAt, source: loaded.source, storage: storageStatus() });
  } catch (error) {
    return storageFailure(error);
  }
}

/** "Save & Publish Changes": validate, store, revalidate the live site. */
export async function PUT(request: NextRequest) {
  if (!requestHasAdminSession(request)) return unauthorized();
  if (!isAllowedOrigin(request)) return json({ ok: false, error: 'forbidden' }, 403);

  const body = await readJsonBody(request, MAX_BODY_BYTES);
  if (!body.ok) return body.response;

  const parsed = siteContentSchema.safeParse(body.value);
  if (!parsed.success) {
    return json({ ok: false, error: 'validation', fieldErrors: issuesToFieldErrors(parsed.error.issues) }, 422);
  }

  try {
    const { updatedAt } = await saveSiteContent(parsed.data);
    return json({ ok: true, updatedAt, content: parsed.data });
  } catch (error) {
    return storageFailure(error);
  }
}

/** "Reset to Defaults": publishes the original, verified copy. */
export async function DELETE(request: NextRequest) {
  if (!requestHasAdminSession(request)) return unauthorized();
  if (!isAllowedOrigin(request)) return json({ ok: false, error: 'forbidden' }, 403);
  try {
    const { updatedAt } = await resetSiteContent();
    const loaded = await loadContent({ strict: true });
    return json({ ok: true, updatedAt, content: loaded.content });
  } catch (error) {
    return storageFailure(error);
  }
}
