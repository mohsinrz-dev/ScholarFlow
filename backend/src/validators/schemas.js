import { z } from 'zod';

export const updateProfileSchema = z.object({
  display_name: z.string().min(1).max(100).optional(),
  preferred_language: z.enum(['en', 'hi']).optional(),
  timezone: z.string().max(64).optional(),
  learning_preferences: z.record(z.unknown()).optional(),
});

export const createSubjectSchema = z.object({
  name: z.string().min(1).max(150),
  description: z.string().max(1000).optional(),
  target_hours: z.number().positive().max(10000).optional(),
});

export const updateSubjectSchema = createSubjectSchema.partial();

export const createTaskSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
  notes: z.string().max(2000).optional(),
  topic: z.string().max(255).optional(),
  subject_id: z.string().uuid().optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  status: z.enum(['pending', 'in_progress', 'completed']).default('pending'),
  due_date: z.string().datetime({ offset: true }).optional(),
  estimated_duration: z.number().int().positive().max(1440).optional(),
  estimated_minutes: z.number().int().positive().max(1440).optional(),
});

export const updateTaskSchema = createTaskSchema.partial();

export const taskQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  status: z.enum(['pending', 'in_progress', 'completed']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  subject_id: z.string().uuid().optional(),
  due_before: z.string().datetime({ offset: true }).optional(),
  due_after: z.string().datetime({ offset: true }).optional(),
});

export const createSessionSchema = z.object({
  subject_id: z.string().uuid().optional(),
  task_id: z.string().uuid().optional(),
  topic: z.string().max(255).optional(),
  started_at: z.string().datetime({ offset: true }),
  ended_at: z.string().datetime({ offset: true }),
  notes: z.string().max(2000).optional(),
}).strict().refine(
  (d) => new Date(d.ended_at) > new Date(d.started_at),
  { message: 'ended_at must be after started_at', path: ['ended_at'] }
).refine(
  (d) => {
    const durationMs = new Date(d.ended_at) - new Date(d.started_at);
    return durationMs <= 24 * 60 * 60 * 1000;
  },
  { message: 'Session duration cannot exceed 24 hours', path: ['ended_at'] }
);

export const sessionQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  subject_id: z.string().uuid().optional(),
  from: z.string().datetime({ offset: true }).optional(),
  to: z.string().datetime({ offset: true }).optional(),
});

export const createRevisionSchema = z.object({
  topic: z.string().min(1).max(255),
  subject_id: z.string().uuid().optional(),
  source_task_id: z.string().uuid().optional(),
  due_date: z.string().datetime({ offset: true }).optional(),
});

export const updateRevisionSchema = z.object({
  status: z.enum(['pending', 'reviewed', 'skipped']).optional(),
  due_date: z.string().datetime({ offset: true }).optional(),
});

export const revisionQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  status: z.enum(['pending', 'reviewed', 'skipped']).optional(),
  due_before: z.string().datetime({ offset: true }).optional(),
});

export const aiTutorSchema = z.object({
  message: z.string().min(1).max(4000),
  subject: z.string().max(150).optional(),
  language: z.enum(['en', 'hi']).default('en'),
  conversation_id: z.string().uuid().optional(),
  learning_mode: z.enum(['explain', 'quiz', 'step_by_step', 'follow_up']).default('explain'),
});

export const analyticsQuerySchema = z.object({
  from: z.string().datetime({ offset: true }).optional(),
  to: z.string().datetime({ offset: true }).optional(),
  timezone: z.string().max(64).optional(),
});

export const historyQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  subject_id: z.string().uuid().optional(),
  from: z.string().datetime({ offset: true }).optional(),
  to: z.string().datetime({ offset: true }).optional(),
});
