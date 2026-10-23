import { supabaseAdmin } from '../config/supabase.js';
import { Errors } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

const TASK_FIELDS = 'id, user_id, subject_id, title, description, topic, priority, status, due_date, estimated_duration, completed_at, created_at, updated_at, subject:subjects(name)';

function normalizeTask(task) {
  return task ? { ...task, estimated_minutes: task.estimated_duration } : task;
}

export async function getTasks(userId, filters = {}, pagination = {}) {
  let query = supabaseAdmin
    .from('study_tasks')
    .select(TASK_FIELDS, { count: 'exact' })
    .eq('user_id', userId);

  if (filters.status) query = query.eq('status', filters.status);
  if (filters.priority) query = query.eq('priority', filters.priority);
  if (filters.subject_id) query = query.eq('subject_id', filters.subject_id);
  if (filters.due_before) query = query.lte('due_date', filters.due_before);
  if (filters.due_after) query = query.gte('due_date', filters.due_after);

  const { offset = 0, limit = 20 } = pagination;
  query = query.range(offset, offset + limit - 1).order('created_at', { ascending: false });

  const { data, error, count } = await query;
  if (error) {
    logger.error('getTasks DB error', { message: error.message });
    throw Errors.internal();
  }
  return { items: (data ?? []).map(normalizeTask), total: count ?? 0 };
}

export async function getTaskById(userId, taskId) {
  const { data, error } = await supabaseAdmin
    .from('study_tasks')
    .select(TASK_FIELDS)
    .eq('id', taskId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    logger.error('getTaskById DB error', { message: error.message });
    throw Errors.internal();
  }
  return normalizeTask(data);
}

export async function createTask(userId, payload) {
  const { data, error } = await supabaseAdmin
    .from('study_tasks')
    .insert({ ...payload, user_id: userId })
    .select(TASK_FIELDS)
    .single();

  if (error) {
    logger.error('createTask DB error', { message: error.message });
    throw Errors.internal();
  }
  return normalizeTask(data);
}

export async function updateTask(userId, taskId, updates) {
  const { data, error } = await supabaseAdmin
    .from('study_tasks')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', taskId)
    .eq('user_id', userId)
    .select(TASK_FIELDS)
    .maybeSingle();

  if (error) {
    logger.error('updateTask DB error', { message: error.message });
    throw Errors.internal();
  }
  return normalizeTask(data);
}

export async function deleteTask(userId, taskId) {
  const { error, count } = await supabaseAdmin
    .from('study_tasks')
    .delete({ count: 'exact' })
    .eq('id', taskId)
    .eq('user_id', userId);

  if (error) {
    logger.error('deleteTask DB error', { message: error.message });
    throw Errors.internal();
  }
  return count;
}

export async function getTasksDueToday(userId, timezone = 'UTC') {
  const now = new Date();
  let parts;
  try {
    parts = new Intl.DateTimeFormat('en-US', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  } catch {
    parts = new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
    timezone = 'UTC';
  }
  const date = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  const localDate = new Date(Number(date.year), Number(date.month) - 1, Number(date.day));
  const toUtc = (day) => {
    const desired = Date.UTC(day.getFullYear(), day.getMonth(), day.getDate());
    let candidate = desired;
    for (let attempt = 0; attempt < 2; attempt++) {
      const rendered = new Date(new Date(candidate).toLocaleString('en-US', { timeZone: timezone }));
      const renderedAsUtc = Date.UTC(rendered.getFullYear(), rendered.getMonth(), rendered.getDate(), rendered.getHours(), rendered.getMinutes());
      candidate += desired - renderedAsUtc;
    }
    return new Date(candidate);
  };
  const startOfDay = toUtc(localDate);
  const endOfDay = toUtc(new Date(localDate.getFullYear(), localDate.getMonth(), localDate.getDate() + 1));

  const { data, error } = await supabaseAdmin
    .from('study_tasks')
    .select(TASK_FIELDS)
    .eq('user_id', userId)
    .neq('status', 'completed')
    .gte('due_date', startOfDay.toISOString())
    .lt('due_date', endOfDay.toISOString())
    .order('due_date', { ascending: true })
    .limit(1000);

  if (error) {
    logger.error('getTasksDueToday DB error', { message: error.message });
    throw Errors.internal();
  }
  return (data ?? []).map(normalizeTask);
}

export async function getUpcomingTasks(userId, days = 7) {
  const from = new Date().toISOString();
  const to = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabaseAdmin
    .from('study_tasks')
    .select(TASK_FIELDS)
    .eq('user_id', userId)
    .neq('status', 'completed')
    .gte('due_date', from)
    .lte('due_date', to)
    .order('due_date', { ascending: true })
    .limit(10);

  if (error) {
    logger.error('getUpcomingTasks DB error', { message: error.message });
    throw Errors.internal();
  }
  return (data ?? []).map(normalizeTask);
}
