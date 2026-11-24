import type { NextRequest } from 'next/server';
import { clearedSessionCookie } from '@/lib/admin-auth';
import { isAllowedOrigin, json } from '@/lib/request-guards';

/** Ends the session by expiring the cookie. Safe to call when already signed out. */
export async function POST(request: NextRequest) {
  if (!isAllowedOrigin(request)) return json({ ok: false, error: 'forbidden' }, 403);
  const response = json({ ok: true });
  response.cookies.set(clearedSessionCookie());
  return response;
}
