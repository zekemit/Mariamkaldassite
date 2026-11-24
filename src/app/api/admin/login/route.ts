import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { checkPassword, createSessionToken, isAdminConfigured, sessionCookie } from '@/lib/admin-auth';
import { loginAllowance, recordLoginFailure, recordLoginSuccess } from '@/lib/admin-rate-limit';
import { isAllowedOrigin, json, readJsonBody } from '@/lib/request-guards';
import { clientIp } from '@/lib/rate-limit';

const bodySchema = z.strictObject({ password: z.string().min(1).max(200) });

/** A short, constant pause after a wrong password; with the 5-per-15-minutes limit it makes guessing impractical. */
const FAILURE_DELAY_MS = 350;
const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(request: NextRequest) {
  if (!isAllowedOrigin(request)) return json({ ok: false, error: 'forbidden' }, 403);

  const body = await readJsonBody(request, 2_000);
  if (!body.ok) return body.response;

  // Without ADMIN_PASSWORD nobody can sign in. Say so plainly instead of pretending a password was wrong.
  if (!isAdminConfigured()) return json({ ok: false, error: 'not_configured' }, 503);

  const ip = clientIp(request.headers);
  const allowance = await loginAllowance(ip);
  if (!allowance.allowed) {
    return json({ ok: false, error: 'rate_limited', retryAfter: allowance.retryAfterSec }, 429, {
      'Retry-After': String(allowance.retryAfterSec),
    });
  }

  const parsed = bodySchema.safeParse(body.value);
  if (!parsed.success) return json({ ok: false, error: 'invalid_request' }, 400);

  if (!checkPassword(parsed.data.password)) {
    await recordLoginFailure(ip);
    await pause(FAILURE_DELAY_MS);
    return json({ ok: false, error: 'invalid_credentials' }, 401);
  }

  await recordLoginSuccess(ip);
  const response = json({ ok: true });
  response.cookies.set(sessionCookie(createSessionToken()));
  return response;
}
