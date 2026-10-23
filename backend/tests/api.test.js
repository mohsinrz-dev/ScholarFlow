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
    AI_MODEL: 'gpt-4o-mini',
  },
}));

const MOCK_USER_ID = '00000000-0000-0000-0000-000000000001';
const OTHER_USER_ID = '00000000-0000-0000-0000-000000000002';

const mockSubjects = [];
const mockTasks = [];

vi.mock('../src/config/supabase.js', () => {
  const buildChain = (result) => {
    const chain = {
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      neq: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue(result),
      single: vi.fn().mockResolvedValue(result),
    };
    chain.select.mockImplementation(() => ({ ...chain, count: 'exact' }));
    return chain;
  };

  return {
    supabaseAnon: {
      auth: { getUser: vi.fn() },
    },
    supabaseAdmin: {
      from: vi.fn(() => buildChain({ data: null, error: null, count: 0 })),
      rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
      auth: { admin: { deleteUser: vi.fn().mockResolvedValue({ error: null }) } },
    },
  };
});

const { default: app } = await import('../src/app.js');
const { supabaseAnon, supabaseAdmin } = await import('../src/config/supabase.js');

function setupAuth(userId = MOCK_USER_ID) {
  supabaseAnon.auth.getUser.mockResolvedValue({
    data: { user: { id: userId, email: `${userId}@test.com` } },
    error: null,
  });

  supabaseAdmin.from.mockImplementation((table) => {
    const chain = {
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      neq: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
    };

    if (table === 'profiles') {
      chain.maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
      chain.single = vi.fn().mockResolvedValue({
        data: { id: userId, display_name: 'Test', preferred_language: 'en', timezone: 'UTC', learning_preferences: {}, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        error: null,
      });
    } else {
      chain.maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null, count: 0 });
      chain.single = vi.fn().mockResolvedValue({ data: null, error: null });
    }

    return chain;
  });
}

describe('Task validation', () => {
  beforeEach(() => setupAuth());

  it('returns 422 when title is missing', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', 'Bearer valid-token')
      .send({ priority: 'high' });
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 422 when priority is invalid', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', 'Bearer valid-token')
      .send({ title: 'Test Task', priority: 'urgent' });
    expect(res.status).toBe(422);
  });

  it('returns 422 when status is invalid', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', 'Bearer valid-token')
      .send({ title: 'Test Task', status: 'done' });
    expect(res.status).toBe(422);
  });

  it('returns 422 when estimated_duration exceeds 1440', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', 'Bearer valid-token')
      .send({ title: 'Test Task', estimated_duration: 2000 });
    expect(res.status).toBe(422);
  });
});

describe('Session validation', () => {
  beforeEach(() => setupAuth());

  it('returns 422 when ended_at is before started_at', async () => {
    const res = await request(app)
      .post('/api/study-sessions')
      .set('Authorization', 'Bearer valid-token')
      .send({
        started_at: '2024-01-01T10:00:00Z',
        ended_at: '2024-01-01T09:00:00Z',
      });
    expect(res.status).toBe(422);
  });

  it('returns 422 when session duration exceeds 24 hours', async () => {
    const res = await request(app)
      .post('/api/study-sessions')
      .set('Authorization', 'Bearer valid-token')
      .send({
        started_at: '2024-01-01T00:00:00Z',
        ended_at: '2024-01-02T01:00:00Z',
      });
    expect(res.status).toBe(422);
  });

  it('returns 422 when started_at is missing', async () => {
    const res = await request(app)
      .post('/api/study-sessions')
      .set('Authorization', 'Bearer valid-token')
      .send({ ended_at: '2024-01-01T10:00:00Z' });
    expect(res.status).toBe(422);
  });
});

describe('AI tutor when not configured', () => {
  beforeEach(() => setupAuth());

  it('returns 503 AI_SERVICE_NOT_CONFIGURED when no API key is set', async () => {
    const res = await request(app)
      .post('/api/ai/tutor')
      .set('Authorization', 'Bearer valid-token')
      .send({ message: 'Explain photosynthesis', language: 'en', learning_mode: 'explain' });

    expect(res.status).toBe(503);
    expect(res.body.error.code).toBe('AI_SERVICE_NOT_CONFIGURED');
  });
});

describe('AI tutor message validation', () => {
  beforeEach(() => setupAuth());

  it('returns 422 when message is empty', async () => {
    const res = await request(app)
      .post('/api/ai/tutor')
      .set('Authorization', 'Bearer valid-token')
      .send({ message: '', language: 'en' });
    expect(res.status).toBe(422);
  });

  it('returns 422 when language is unsupported', async () => {
    const res = await request(app)
      .post('/api/ai/tutor')
      .set('Authorization', 'Bearer valid-token')
      .send({ message: 'Hello', language: 'fr' });
    expect(res.status).toBe(422);
  });
});

describe('Analytics with empty data', () => {
  beforeEach(() => {
    setupAuth();
    supabaseAdmin.from.mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      neq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      single: vi.fn().mockResolvedValue({ data: { id: MOCK_USER_ID }, error: null }),
      data: [],
      error: null,
      count: 0,
      then: (resolve) => resolve({ data: [], error: null, count: 0 }),
    }));
  });

  it('returns 200 with zero values for new account', async () => {
    const res = await request(app)
      .get('/api/analytics')
      .set('Authorization', 'Bearer valid-token');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('Account deletion', () => {
  beforeEach(() => setupAuth());

  it('requires authentication', async () => {
    const res = await request(app).delete('/api/account');
    expect(res.status).toBe(401);
  });
});
