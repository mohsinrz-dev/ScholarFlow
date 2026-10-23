import { z } from 'zod';

const schema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(8080),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  FRONTEND_ORIGIN: z.string().default('http://localhost:5173').transform((value) => value.split(',').map((origin) => origin.trim()).filter(Boolean)).refine((origins) => origins.length > 0 && origins.every((origin) => { try { return ['http:', 'https:'].includes(new URL(origin).protocol) && !origin.includes('*') } catch { return false } }), 'FRONTEND_ORIGIN must contain exact HTTP(S) origins.'),
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  AI_PROVIDER_API_KEY: z.string().optional(),
  AI_PROVIDER_BASE_URL: z.string().url().optional(),
  AI_MODEL: z.string().default('gpt-4o-mini'),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const missing = parsed.error.issues.map((i) => i.path.join('.'));
  console.error('[config] Invalid environment variables:', missing.join(', '));
  process.exit(1);
}

export const env = parsed.data;
