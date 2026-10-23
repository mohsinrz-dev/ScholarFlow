import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

vi.mock('../src/config/env.js', () => ({
  env: {
    PORT: 3000,
    NODE_ENV: 'test',
    FRONTEND_ORIGIN: 'http://localhost:5173',
    SUPABASE_URL: 'https://test.supabase.co',
    SUPABASE_ANON_KEY: 'test-anon-key',
    SUPABASE_SERVICE_ROLE_KEY: 'test-service-key',
    AI_PROVIDER_API_KEY: undefined,
    AI_PROVIDER_BASE_URL: undefined,
    AI_MODEL: 'gpt-4o-mini',
  },
}));

vi.mock('../src/config/supabase.js', () => ({
  supabaseAnon: {
    auth: {
      getUser: vi.fn(),
    },
  },
  supabaseAdmin: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
    auth: {
      admin: {
        deleteUser: vi.fn().mockResolvedValue({ error: null }),
      },
    },
  },
}));

const { default: app } = await import('../src/app.js');
const { supabaseAnon, supabaseAdmin } = await import('../src/config/supabase.js');

describe('GET /api/health', () => {
  it('returns 200 with status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('ok');
    expect(res.body.data.timestamp).toBeDefined();
  });
});

describe('Authentication', () => {
  it('returns 401 when Authorization header is missing', async () => {
    const res = await request(app).get('/api/profile');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('returns 401 when token is invalid', async () => {
    supabaseAnon.auth.getUser.mockResolvedValue({ data: { user: null }, error: { message: 'Invalid token' } });
    const res = await request(app).get('/api/profile').set('Authorization', 'Bearer bad-token');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('returns 401 when Authorization header is malformed (no Bearer prefix)', async () => {
    const res = await request(app).get('/api/profile').set('Authorization', 'Token abc123');
    expect(res.status).toBe(401);
  });
});

describe('404 handler', () => {
  it('returns 404 for unknown endpoints', async () => {
    const res = await request(app).get('/api/nonexistent');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});
