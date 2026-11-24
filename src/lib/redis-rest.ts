import 'server-only';

// A minimal client for the Upstash Redis REST API (the same API Vercel KV exposes), so the admin portal needs no
// extra dependency. Only what the portal uses: single commands and pipelines.
// https://upstash.com/docs/redis/features/restapi

export interface RedisConfig {
  url: string;
  token: string;
}

type Env = Record<string, string | undefined>;

/** A loopback http URL is allowed so tests can point at a local fake; everything real must be https. */
function cleanUrl(value: string | undefined): string | null {
  const raw = value?.trim();
  if (!raw) return null;
  try {
    const url = new URL(raw);
    const loopback = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
    if (url.protocol !== 'https:' && !(url.protocol === 'http:' && loopback)) return null;
    return raw.replace(/\/+$/, '');
  } catch {
    return null;
  }
}

/**
 * Vercel KV / the Upstash integration on Vercel set KV_REST_API_URL + KV_REST_API_TOKEN; a database created at
 * upstash.com gives UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN. A URL is only ever paired with the token
 * from its own pair, so a stray variable can never send one service's token to another's host.
 */
export function redisConfig(env: Env = process.env): RedisConfig | null {
  const pairs: [string | undefined, string | undefined][] = [
    [env.KV_REST_API_URL, env.KV_REST_API_TOKEN],
    [env.UPSTASH_REDIS_REST_URL, env.UPSTASH_REDIS_REST_TOKEN],
  ];
  for (const [rawUrl, rawToken] of pairs) {
    const url = cleanUrl(rawUrl);
    const token = rawToken?.trim();
    if (url && token) return { url, token };
  }
  return null;
}

export class RedisError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RedisError';
  }
}

type Command = (string | number)[];
interface Reply<T> {
  result?: T;
  error?: string;
}

async function post<T>(config: RedisConfig, path: string, body: unknown, timeoutMs: number): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${config.url}${path}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${config.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (error) {
    // Never include the URL or token in the message; it can end up in logs.
    throw new RedisError(`Redis request failed (${error instanceof Error ? error.name : 'network error'})`);
  }
  if (!response.ok) throw new RedisError(`Redis responded with HTTP ${response.status}`);
  try {
    return (await response.json()) as T;
  } catch {
    throw new RedisError('Redis returned a response that was not JSON');
  }
}

export async function redisCommand<T = unknown>(config: RedisConfig, command: Command, timeoutMs = 4000): Promise<T> {
  const reply = await post<Reply<T>>(config, '', command, timeoutMs);
  if (reply.error) throw new RedisError(`Redis error: ${reply.error}`);
  return reply.result as T;
}

export async function redisPipeline<T = unknown>(config: RedisConfig, commands: Command[], timeoutMs = 4000): Promise<T[]> {
  const replies = await post<Reply<T>[]>(config, '/pipeline', commands, timeoutMs);
  if (!Array.isArray(replies) || replies.length !== commands.length) throw new RedisError('Redis pipeline returned an unexpected reply');
  return replies.map((reply) => {
    if (reply.error) throw new RedisError(`Redis error: ${reply.error}`);
    return reply.result as T;
  });
}
