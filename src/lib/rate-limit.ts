// Best-effort sliding-window limiter held in memory. On serverless platforms each instance keeps its own
// counters, so this blunts bursts and casual abuse; add a Vercel Firewall rate-limit rule (or a shared store
// such as Upstash Redis) if hard, global limits are ever needed.

export interface LimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSec: number;
}

export class SlidingWindowLimiter {
  private readonly hits = new Map<string, number[]>();

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
    private readonly now: () => number = Date.now,
    private readonly maxKeys = 5000,
  ) {}

  check(key: string): LimitResult {
    const t = this.now();
    const cutoff = t - this.windowMs;
    const recent = (this.hits.get(key) ?? []).filter((ts) => ts > cutoff);

    if (recent.length >= this.limit) {
      this.hits.set(key, recent);
      const retryAfterSec = Math.max(1, Math.ceil((recent[0] + this.windowMs - t) / 1000));
      return { allowed: false, remaining: 0, retryAfterSec };
    }

    recent.push(t);
    this.hits.set(key, recent);
    if (this.hits.size > this.maxKeys) this.sweep(cutoff);
    return { allowed: true, remaining: this.limit - recent.length, retryAfterSec: 0 };
  }

  private sweep(cutoff: number): void {
    for (const [key, stamps] of this.hits) {
      if (!stamps.some((ts) => ts > cutoff)) this.hits.delete(key);
    }
  }
}

/** First hop of x-forwarded-for (set by Vercel's edge), then x-real-ip. */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim() || 'unknown';
  return headers.get('x-real-ip')?.trim() || 'unknown';
}

const TEN_MINUTES = 10 * 60 * 1000;

/** Any request to the endpoint: generous, so people fixing typos are never locked out, but floods are cut off. */
export const attemptLimiter = new SlidingWindowLimiter(30, TEN_MINUTES);
/** Messages that would actually be emailed: 5 per IP per 10 minutes. */
export const sendLimiter = new SlidingWindowLimiter(5, TEN_MINUTES);
/** All visitors on this instance combined, to protect the mail quota. */
export const globalLimiter = new SlidingWindowLimiter(40, TEN_MINUTES);
