import { vi } from 'vitest';

// An in-process stand-in for the Upstash REST API, installed over global fetch. It speaks the real wire format
// (POST {url} with a command array, POST {url}/pipeline with an array of commands), so the code under test runs
// unmodified. Supports the handful of commands the CMS uses.

interface Entry {
  value: string;
  expiresAt: number | null;
}

export interface FakeRedis {
  store: Map<string, Entry>;
  calls: { url: string; command: unknown }[];
  /** Make every request fail (HTTP 500) until set back to false. */
  failing: boolean;
  /** Last Authorization header seen. */
  lastAuth: string | null;
  uninstall: () => void;
}

export function installFakeRedis(baseUrl = 'https://fake-redis.example.test'): FakeRedis {
  const store = new Map<string, Entry>();
  const fake: FakeRedis = { store, calls: [], failing: false, lastAuth: null, uninstall: () => undefined };

  const live = (key: string): Entry | undefined => {
    const entry = store.get(key);
    if (entry && entry.expiresAt !== null && entry.expiresAt <= Date.now()) {
      store.delete(key);
      return undefined;
    }
    return entry;
  };

  const run = (command: (string | number)[]): { result?: unknown; error?: string } => {
    const [name, key, ...rest] = command.map((part, i) => (i === 0 ? String(part).toUpperCase() : String(part)));
    switch (name) {
      case 'GET':
        return { result: live(key)?.value ?? null };
      case 'SET':
        store.set(key, { value: rest[0], expiresAt: null });
        return { result: 'OK' };
      case 'DEL':
        return { result: store.delete(key) ? 1 : 0 };
      case 'INCR': {
        const next = Number(live(key)?.value ?? 0) + 1;
        store.set(key, { value: String(next), expiresAt: live(key)?.expiresAt ?? null });
        return { result: next };
      }
      case 'EXPIRE': {
        const entry = live(key);
        if (!entry) return { result: 0 };
        if (rest[1]?.toUpperCase() === 'NX' && entry.expiresAt !== null) return { result: 0 };
        entry.expiresAt = Date.now() + Number(rest[0]) * 1000;
        return { result: 1 };
      }
      case 'TTL': {
        const entry = live(key);
        if (!entry) return { result: -2 };
        return { result: entry.expiresAt === null ? -1 : Math.ceil((entry.expiresAt - Date.now()) / 1000) };
      }
      default:
        return { error: `ERR unknown command '${name}'` };
    }
  };

  const handler = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    if (!url.startsWith(baseUrl)) throw new Error(`unexpected fetch to ${url}`);
    const headers = new Headers(init?.headers);
    fake.lastAuth = headers.get('authorization');
    const body = JSON.parse(String(init?.body ?? 'null'));
    fake.calls.push({ url, command: body });
    if (fake.failing) return new Response('boom', { status: 500 });
    const path = url.slice(baseUrl.length);
    const payload = path === '/pipeline' ? (body as (string | number)[][]).map(run) : run(body);
    return new Response(JSON.stringify(payload), { status: 200, headers: { 'content-type': 'application/json' } });
  });

  vi.stubGlobal('fetch', handler);
  fake.uninstall = () => vi.unstubAllGlobals();
  return fake;
}
