import { supabaseAdmin } from '../config/supabase.js';
import { Errors } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export async function getProfile(userId) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('id, display_name, preferred_language, timezone, learning_preferences, created_at, updated_at')
    .eq('id', userId)
    .is('deleted_at', null)
    .maybeSingle();

  if (error) {
    logger.error('getProfile DB error', { message: error.message });
    throw Errors.internal();
  }
  return data;
}

export async function upsertProfile(userId, email) {
  const { data, error } = await supabaseAdmin.rpc('upsert_profile_safe', {
    p_user_id: userId,
    p_email: email,
  });

  if (error) {
    logger.error('upsertProfile DB error', { message: error.message });
    throw Errors.internal();
  }
  return data;
}

export async function updateProfile(userId, updates) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .is('deleted_at', null)
    .select('id, display_name, preferred_language, timezone, learning_preferences, created_at, updated_at')
    .single();

  if (error) {
    logger.error('updateProfile DB error', { message: error.message });
    throw Errors.internal();
  }
  return data;
}

export async function softDeleteProfile(userId) {
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) {
    logger.error('softDeleteProfile DB error', { message: error.message });
    throw Errors.internal();
  }
}

export async function restoreProfile(userId) {
  const { error, data } = await supabaseAdmin
    .from('profiles')
    .update({ deleted_at: null, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select('id');

  if (error) {
    logger.error('restoreProfile DB error', { message: error.message });
    throw Errors.internal();
  }
  if (!data?.length) throw Errors.notFound('Deleted account');
}

export async function findExpiredDeletedProfiles() {
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .lt('deleted_at', cutoff)
    .not('deleted_at', 'is', null);

  if (error) {
    logger.error('findExpiredDeletedProfiles DB error', { message: error.message });
    return [];
  }
  return data ?? [];
}
