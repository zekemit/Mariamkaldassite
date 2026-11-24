import { describe, expect, it } from 'vitest';
import { MIN_FILL_MS, checkSpam, singleLine, validateContact } from '@/lib/contact-schema';
import { SlidingWindowLimiter, clientIp } from '@/lib/rate-limit';
import { buildMessage, escapeHtml, selectProvider } from '@/lib/mailer';

const valid = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  topic: 'coaching',
  message: 'I would like to talk about my next step.',
  company: '',
  startedAt: 1_000_000,
};

describe('contact validation', () => {
  it('accepts a complete, well-formed message', () => {
    const result = validateContact(valid);
    expect(result.success).toBe(true);
  });

  it('rejects bad email, short message and unknown topic with field-level messages', () => {
    const result = validateContact({ ...valid, email: 'nope', message: 'hi', topic: 'spam' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(Object.keys(result.fieldErrors).sort()).toEqual(['email', 'message', 'topic']);
    }
  });

  it('collapses line breaks in single-line fields so they cannot reach an email header', () => {
    const result = validateContact({ ...valid, name: 'Eve\r\nBcc: attacker@example.com' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.name).toBe('Eve Bcc: attacker@example.com');
    expect(singleLine('a\nb\tc')).toBe('a b c');
  });

  it('strips control characters but keeps newlines in the message', () => {
    const result = validateContact({ ...valid, message: 'Line one\u0000\nLine two is here' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.message).toBe('Line one\nLine two is here');
  });

  it('rejects oversized input', () => {
    const result = validateContact({ ...valid, message: 'x'.repeat(5001) });
    expect(result.success).toBe(false);
  });
});

describe('spam checks', () => {
  const now = 1_000_000 + MIN_FILL_MS + 1;

  it('passes a human-paced submission', () => {
    expect(checkSpam({ company: '', startedAt: 1_000_000 }, now)).toEqual({ spam: false });
  });

  it('flags a filled honeypot', () => {
    expect(checkSpam({ company: 'Acme', startedAt: 1_000_000 }, now)).toEqual({ spam: true, reason: 'honeypot' });
  });

  it('flags a missing timestamp, an instant submit, and a stale form', () => {
    expect(checkSpam({ company: '' }, now)).toEqual({ spam: true, reason: 'missing-timestamp' });
    expect(checkSpam({ company: '', startedAt: 1_000_000 }, 1_000_100)).toEqual({ spam: true, reason: 'too-fast' });
    expect(checkSpam({ company: '', startedAt: 1_000_000 }, 1_000_000 + 25 * 3600 * 1000)).toEqual({
      spam: true,
      reason: 'too-old',
    });
  });
});

describe('rate limiting', () => {
  it('allows up to the limit, then blocks with a retry hint, then recovers', () => {
    let t = 0;
    const limiter = new SlidingWindowLimiter(3, 60_000, () => t);
    expect(limiter.check('ip').allowed).toBe(true);
    expect(limiter.check('ip').allowed).toBe(true);
    const third = limiter.check('ip');
    expect(third.allowed).toBe(true);
    expect(third.remaining).toBe(0);

    const blocked = limiter.check('ip');
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSec).toBe(60);

    t = 61_000;
    expect(limiter.check('ip').allowed).toBe(true);
  });

  it('tracks keys independently', () => {
    const limiter = new SlidingWindowLimiter(1, 60_000, () => 0);
    expect(limiter.check('a').allowed).toBe(true);
    expect(limiter.check('b').allowed).toBe(true);
    expect(limiter.check('a').allowed).toBe(false);
  });

  it('reads the client IP from forwarding headers', () => {
    expect(clientIp(new Headers({ 'x-forwarded-for': '203.0.113.9, 10.0.0.1' }))).toBe('203.0.113.9');
    expect(clientIp(new Headers({ 'x-real-ip': '198.51.100.4' }))).toBe('198.51.100.4');
    expect(clientIp(new Headers())).toBe('unknown');
  });
});

describe('mailer', () => {
  it('prefers Resend, then SMTP, then dry-run in development, and reports "none" in production', () => {
    expect(selectProvider({ RESEND_API_KEY: 'k', SMTP_HOST: 'h', SMTP_USER: 'u', SMTP_PASS: 'p' }, 'production')).toBe('resend');
    expect(selectProvider({ SMTP_HOST: 'h', SMTP_USER: 'u', SMTP_PASS: 'p' }, 'production')).toBe('smtp');
    expect(selectProvider({}, 'development')).toBe('dry-run');
    expect(selectProvider({ CONTACT_DRY_RUN: '1' }, 'production')).toBe('dry-run');
    expect(selectProvider({}, 'production')).toBe('none');
  });

  it('routes to me@mariamkaldas.com by default, replies to the visitor, and escapes HTML', () => {
    const message = buildMessage(
      { name: 'Eve <b>', email: 'eve@example.com', topic: 'team', message: '<script>alert(1)</script>' },
      'resend',
      {},
      new Date('2026-01-01T00:00:00Z'),
    );
    expect(message.to).toBe('me@mariamkaldas.com');
    expect(message.replyTo).toBe('eve@example.com');
    expect(message.subject).toContain('Coaching or MBTI for my team');
    expect(message.subject).not.toMatch(/[\r\n]/);
    expect(message.html).not.toContain('<script>');
    expect(message.html).toContain('&lt;script&gt;');
    expect(escapeHtml(`"&'`)).toBe('&quot;&amp;&#39;');
  });

  it('honours CONTACT_TO_EMAIL and CONTACT_FROM_EMAIL', () => {
    const message = buildMessage(
      { name: 'A', email: 'a@example.com', topic: 'other', message: 'Hello there, friend.' },
      'smtp',
      { CONTACT_TO_EMAIL: 'inbox@example.com', CONTACT_FROM_EMAIL: 'Site <site@example.com>' },
    );
    expect(message.to).toBe('inbox@example.com');
    expect(message.from).toBe('Site <site@example.com>');
  });
});
