import { checkSpam, validateContact } from '@/lib/contact-schema';
import { sendContactEmail } from '@/lib/mailer';
import { attemptLimiter, clientIp, globalLimiter, sendLimiter } from '@/lib/rate-limit';
import { isAllowedOrigin, json } from '@/lib/request-guards';

const MAX_BODY_BYTES = 20_000;

export async function POST(request: Request) {
  if (!isAllowedOrigin(request)) return json({ ok: false, error: 'forbidden' }, 403);

  const type = request.headers.get('content-type') ?? '';
  if (!type.includes('application/json')) return json({ ok: false, error: 'unsupported_media_type' }, 415);

  const declared = Number(request.headers.get('content-length') ?? 0);
  if (declared > MAX_BODY_BYTES) return json({ ok: false, error: 'too_large' }, 413);

  const ip = clientIp(request.headers);
  const attempt = attemptLimiter.check(ip);
  if (!attempt.allowed) {
    return json({ ok: false, error: 'rate_limited', retryAfter: attempt.retryAfterSec }, 429, {
      'Retry-After': String(attempt.retryAfterSec),
    });
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) return json({ ok: false, error: 'too_large' }, 413);

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return json({ ok: false, error: 'invalid_json' }, 400);
  }

  const result = validateContact(body);
  if (!result.success) return json({ ok: false, error: 'validation', fieldErrors: result.fieldErrors }, 400);

  // Bots get the same success response as people, and nothing is sent.
  if (checkSpam(result.data).spam) return json({ ok: true });

  // Strict limits apply only to messages that would really be emailed.
  const mine = sendLimiter.check(ip);
  const everyone = globalLimiter.check('all');
  if (!mine.allowed || !everyone.allowed) {
    const retryAfter = Math.max(mine.retryAfterSec, everyone.retryAfterSec);
    return json({ ok: false, error: 'rate_limited', retryAfter }, 429, { 'Retry-After': String(retryAfter) });
  }

  const sent = await sendContactEmail(result.data);
  if (!sent.ok) {
    return json({ ok: false, error: sent.reason === 'not-configured' ? 'unavailable' : 'send_failed' }, 503);
  }
  return json({ ok: true });
}
