import { supabaseAdmin } from '../config/supabase.js';
import { Errors } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

const REVISION_FIELDS = 'id, user_id, subject_id, source_task_id, topic, due_date, last_reviewed_at, review_count, status, created_at, updated_at';

async function attachSubjects(items) {
  if (!items.length) return items;
  const ids = [...new Set(items.map((item) => item.subject_id).filter(Boolean))];
  if (!ids.length) return items.map((item) => ({ ...item, subject: null }));
  const { data, error } = await supabaseAdmin.from('subjects').select('id, name').in('id', ids);
  if (error) {
    logger.error('attach revision subjects DB error', { message: error.message });
    throw Errors.internal();
  }
  const subjects = new Map((data ?? []).map((subject) => [subject.id, subject]));
  return items.map((item) => ({ ...item, subject: subjects.get(item.subject_id) ?? null }));
}

export async function getRevisions(userId, filters = {}, pagination = {}) {
  let query = supabaseAdmin
    .from('revision_items')
    .select(REVISION_FIELDS, { count: 'exact' })
    .eq('user_id', userId);

  if (filters.status) query = query.eq('status', filters.status);
  if (filters.due_before) query = query.lte('due_date', filters.due_before);

  const { offset = 0, limit = 20 } = pagination;
  query = query.range(offset, offset + limit - 1).order('due_date', { ascending: true });

  const { data, error, count } = await query;
  if (error) {
    logger.error('getRevisions DB error', { message: error.message });
    throw Errors.internal();
  }
  return { items: await attachSubjects(data ?? []), total: count ?? 0 };
}

export async function getRevisionById(userId, revisionId) {
  const { data, error } = await supabaseAdmin
    .from('revision_items')
    .select(REVISION_FIELDS)
    .eq('id', revisionId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    logger.error('getRevisionById DB error', { message: error.message });
    throw Errors.internal();
  }
  return data ? (await attachSubjects([data]))[0] : null;
}

export async function createRevision(userId, payload) {
  const { data, error } = await supabaseAdmin
    .from('revision_items')
    .insert({ ...payload, user_id: userId, status: 'pending', review_count: 0 })
    .select(REVISION_FIELDS)
    .single();

  if (error) {
    logger.error('createRevision DB error', { message: error.message });
    throw Errors.internal();
  }
  return data ? (await attachSubjects([data]))[0] : null;
}

export async function updateRevision(userId, revisionId, updates) {
  const { data, error } = await supabaseAdmin
    .from('revision_items')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', revisionId)
    .eq('user_id', userId)
    .select(REVISION_FIELDS)
    .maybeSingle();

  if (error) {
    logger.error('updateRevision DB error', { message: error.message });
    throw Errors.internal();
  }
  return data ? (await attachSubjects([data]))[0] : null;
}

export async function getDueRevisions(userId, limit = 5) {
  const now = new Date().toISOString();
  const { data, error } = await supabaseAdmin
    .from('revision_items')
    .select(REVISION_FIELDS)
    .eq('user_id', userId)
    .eq('status', 'pending')
    .lte('due_date', now)
    .order('due_date', { ascending: true })
    .limit(limit);

  if (error) {
    logger.error('getDueRevisions DB error', { message: error.message });
    throw Errors.internal();
  }
  return attachSubjects(data ?? []);
}
