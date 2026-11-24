import 'server-only';
import { createHash } from 'node:crypto';
import { redisConfig, redisPipeline } from '@/lib/redis-rest';

// Throttles WRONG-password attempts at /api/admin/login: 5 failures per 15 minutes per client IP, then a 429 with
// Retry-After. Successful sign-ins do not count and clear the counter. Counters live in Redis when it is connected
// (so every serverless instance sees them) and in memory otherwise or if Redis is unreachable (so an outage can
// never lock Mariam out, and never lets guessing run unthrottled either).

export const MAX_FAILURES = 5;
export const WINDOW_SEC = 15 * 60;

export interface Allowance {
  allowed: boolean;
  retryAfterSec: number;
}

/** Fixed-window failure counter held in memory. The clock is injectable for tests. */
export class FailureCounter {
  private readonly entries = new Map<string, { count: number; resetAt: number }>();

  constructor(
    private readonly max: number,
    private readonly windowMs: number,
    private readonly now: () => number = Date.now,
    private readonly maxKeys = 5000,
  ) {}

  peek(key: string): Allowance {
    const entry = this.entries.get(key);
    if (!entry || entry.resetAt <= this.now()) return { allowed: true, retryAfterSec: 0 };
    if (entry.count < this.max) return { allowed: true, retryAfterSec: 0 };
    return { allowed: false, retryAfterSec: Math.max(1, Math.ceil((entry.resetAt - this.now()) / 1000)) };
  }

  hit(key: string): void {
    const t = this.now();
    const entry = this.entries.get(key);
    if (!entry || entry.resetAt <= t) this.entries.set(key, { count: 1, resetAt: t + this.windowMs });
    else entry.count += 1;
    if (this.entries.size > this.maxKeys) {
      for (const [k, v] of this.entries) if (v.resetAt <= t) this.entries.delete(k);
    }
  }

  clear(key: string): void {
    this.entries.delete(key);
  }
}

const memory = new FailureCounter(MAX_FAILURES, WINDOW_SEC * 1000);

/** IPs are hashed before they become a key, so the database never holds a raw address. */
export function loginKey(ip: string): string {
  return `cms:login:fail:${createHash('sha256').update(ip).digest('hex').slice(0, 24)}`;
}

export async function loginAllowance(ip: string): Promise<Allowance> {
  const key = loginKey(ip);
  const config = redisConfig();
  if (config) {
    try {
      const [count, ttl] = await redisPipeline<string | number | null>(config, [['GET', key], ['TTL', key]]);
      if (Number(count ?? 0) < MAX_FAILURES) return { allowed: true, retryAfterSec: 0 };
      const remaining = Number(ttl);
      if (remaining < 0) {
        // A counter with no expiry would lock this address out forever; give it one.
        await redisPipeline(config, [['EXPIRE', key, WINDOW_SEC]]);
        return { allowed: false, retryAfterSec: WINDOW_SEC };
      }
      return { allowed: false, retryAfterSec: Math.max(1, remaining) };
    } catch {
      // fall back to this instance's own counters
    }
  }
  return memory.peek(key);
}

export async function recordLoginFailure(ip: string): Promise<void> {
  const key = loginKey(ip);
  memory.hit(key);
  const config = redisConfig();
  if (!config) return;
  try {
    await redisPipeline(config, [['INCR', key], ['EXPIRE', key, WINDOW_SEC, 'NX']]);
  } catch {
    // The in-memory counter above still counts it.
  }
}

export async function recordLoginSuccess(ip: string): Promise<void> {
  const key = loginKey(ip);
  memory.clear(key);
  const config = redisConfig();
  if (!config) return;
  try {
    await redisPipeline(config, [['DEL', key]]);
  } catch {
    // ignore
  }
}
