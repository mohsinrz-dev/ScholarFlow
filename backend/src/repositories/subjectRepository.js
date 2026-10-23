import { supabaseAdmin } from '../config/supabase.js';
import { Errors } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export async function getSubjects(userId) {
  const { data, error } = await supabaseAdmin
    .from('subjects')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    logger.error('getSubjects DB error', { message: error.message });
    throw Errors.internal();
  }
  return data ?? [];
}

export async function getSubjectById(userId, subjectId) {
  const { data, error } = await supabaseAdmin
    .from('subjects')
    .select('*')
    .eq('id', subjectId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    logger.error('getSubjectById DB error', { message: error.message });
    throw Errors.internal();
  }
  return data;
}

export async function createSubject(userId, payload) {
  const { data, error } = await supabaseAdmin
    .from('subjects')
    .insert({ ...payload, user_id: userId })
    .select('*')
    .single();

  if (error) {
    logger.error('createSubject DB error', { message: error.message });
    throw Errors.internal();
  }
  return data;
}

export async function updateSubject(userId, subjectId, updates) {
  const { data, error } = await supabaseAdmin
    .from('subjects')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', subjectId)
    .eq('user_id', userId)
    .select('*')
    .single();

  if (error) {
    if (error.code === 'PGRST116') throw Errors.notFound('Subject');
    logger.error('updateSubject DB error', { message: error.message });
    throw Errors.internal();
  }
  return data;
}

export async function deleteSubject(userId, subjectId) {
  const { error, count } = await supabaseAdmin
    .from('subjects')
    .delete({ count: 'exact' })
    .eq('id', subjectId)
    .eq('user_id', userId);

  if (error) {
    logger.error('deleteSubject DB error', { message: error.message });
    throw Errors.internal();
  }
  return count;
}
