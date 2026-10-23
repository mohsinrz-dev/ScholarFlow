import { supabaseAdmin } from '../config/supabase.js';
import { Errors } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

const SESSION_FIELDS = 'id, user_id, subject_id, task_id, topic, started_at, ended_at, duration_minutes, notes, created_at, subject:subjects(name)';

export async function getSessions(userId, filters = {}, pagination = {}) {
  let query = supabaseAdmin
    .from('study_sessions')
    .select(SESSION_FIELDS, { count: 'exact' })
    .eq('user_id', userId);

  if (filters.subject_id) query = query.eq('subject_id', filters.subject_id);
  if (filters.from) query = query.gte('started_at', filters.from);
  if (filters.to) query = query.lte('started_at', filters.to);

  const { offset = 0, limit = 20 } = pagination;
  query = query.range(offset, offset + limit - 1).order('started_at', { ascending: false });

  const { data, error, count } = await query;
  if (error) {
    logger.error('getSessions DB error', { message: error.message });
    throw Errors.internal();
  }
  return { items: data ?? [], total: count ?? 0 };
}

export async function createSession(userId, payload) {
  const durationMs = new Date(payload.ended_at) - new Date(payload.started_at);
  const duration_minutes = Math.max(1, Math.round(durationMs / 60000));

  const { data, error } = await supabaseAdmin
    .from('study_sessions')
    .insert({ ...payload, user_id: userId, duration_minutes })
    .select(SESSION_FIELDS)
    .single();

  if (error) {
    logger.error('createSession DB error', { message: error.message });
    throw Errors.internal();
  }
  return data;
}

export async function getRecentSessions(userId, limit = 5) {
  const { data, error } = await supabaseAdmin
    .from('study_sessions')
    .select(SESSION_FIELDS)
    .eq('user_id', userId)
    .order('started_at', { ascending: false })
    .limit(limit);

  if (error) {
    logger.error('getRecentSessions DB error', { message: error.message });
    throw Errors.internal();
  }
  return data ?? [];
}

export async function getSessionStats(userId, from, to) {
  let query = supabaseAdmin
    .from('study_sessions')
    .select('duration_minutes, subject_id, started_at')
    .eq('user_id', userId);

  if (from) query = query.gte('started_at', from);
  if (to) query = query.lte('started_at', to);

  const pageSize = 1000;
  const sessions = [];
  let offset = 0;
  while (true) {
    const { data, error } = await query.range(offset, offset + pageSize - 1);
    if (error) {
      logger.error('getSessionStats DB error', { message: error.message });
      throw Errors.internal();
    }
    const page = data ?? [];
    sessions.push(...page);
    if (page.length < pageSize) break;
    offset += pageSize;
  }
  return sessions;
}
