import { NextResponse } from 'next/server';
import { SITE } from '@/content/site';

// Small helpers shared by the JSON API routes (/api/contact and /api/admin/*).

/** JSON response that no cache (browser, CDN) may keep. */
export function json(body: Record<string, unknown>, status = 200, headers?: Record<string, string>): NextResponse {
  return NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store', ...headers } });
}

/**
 * Same-origin only. The site's own pages post to these routes, so the Origin header must be present and match the
 * host that received the request (or the canonical site). A missing Origin is refused too: browsers always send it
 * on cross-site POSTs, and none of these routes serve non-browser clients.
 */
export function isAllowedOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return false;
  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    return false;
  }
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
  const canonical = new URL(SITE.url).host;
  const apex = canonical.replace(/^www\./, '');
  return originHost === host || originHost === canonical || originHost === apex || originHost === `www.${apex}`;
}

export type BodyResult = { ok: true; value: unknown } | { ok: false; response: NextResponse };

/** Reads a size-capped JSON body, answering 415 / 413 / 400 itself so routes can just return the response. */
export async function readJsonBody(request: Request, maxBytes: number): Promise<BodyResult> {
  const type = request.headers.get('content-type') ?? '';
  if (!type.includes('application/json')) return { ok: false, response: json({ ok: false, error: 'unsupported_media_type' }, 415) };

  const declared = Number(request.headers.get('content-length') ?? 0);
  if (declared > maxBytes) return { ok: false, response: json({ ok: false, error: 'too_large' }, 413) };

  const raw = await request.text();
  if (raw.length > maxBytes) return { ok: false, response: json({ ok: false, error: 'too_large' }, 413) };
  try {
    return { ok: true, value: JSON.parse(raw) };
  } catch {
    return { ok: false, response: json({ ok: false, error: 'invalid_json' }, 400) };
  }
}
