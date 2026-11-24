import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

const fromRoot = (path: string) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@': fromRoot('./src'),
      // `server-only` throws unless bundled for React Server Components; tests run in plain Node.
      'server-only': fromRoot('./src/test/empty.ts'),
    },
  },
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
});
