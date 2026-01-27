import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('env configuration', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should load default values when optional env vars are missing', async () => {
    process.env.DATABASE_URL = 'postgres://localhost:5432/db';
    delete process.env.NODE_ENV;
    delete process.env.PORT;

    const { env } = await import('./env');

    expect(env.nodeEnv).toBe('development');
    expect(env.port).toBe(4000);
    expect(env.databaseUrl).toBe('postgres://localhost:5432/db');
  });

  it('should use values from process.env when provided', async () => {
    process.env.NODE_ENV = 'production';
    process.env.PORT = '5000';
    process.env.DATABASE_URL = 'postgres://prod:5432/db';
    process.env.CORS_ORIGIN = 'https://example.com';

    const { env } = await import('./env');

    expect(env.nodeEnv).toBe('production');
    expect(env.port).toBe(5000);
    expect(env.databaseUrl).toBe('postgres://prod:5432/db');
    expect(env.corsOrigin).toBe('https://example.com');
  });

  it('should throw an error if required DATABASE_URL is missing', async () => {
    delete process.env.DATABASE_URL;

    await expect(import('./env')).rejects.toThrow('Missing required env var: DATABASE_URL');
  });
});
