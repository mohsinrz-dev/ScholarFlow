import * as profileRepo from '../repositories/profileRepository.js';
import { supabaseAdmin } from '../config/supabase.js';
import { AppError, Errors } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export async function getOrCreateProfile(userId, email) {
  let profile = await profileRepo.getProfile(userId);
  if (!profile) {
    const { data: authUser, error } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (error || !authUser.user || authUser.user.email !== email) throw Errors.notFound('Profile');
    await profileRepo.upsertProfile(userId, email);
    profile = await profileRepo.getProfile(userId);
  }
  return profile;
}

export async function updateProfile(userId, updates) {
  const profile = await profileRepo.getProfile(userId);
  if (!profile) throw Errors.notFound('Profile');
  return profileRepo.updateProfile(userId, updates);
}

export async function scheduleAccountDeletion(userId) {
  await profileRepo.softDeleteProfile(userId);
  logger.info('Account scheduled for deletion', { userId });
}

export async function recoverAccount(userId) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('deleted_at')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw Errors.internal();

  if (!data?.deleted_at) throw Errors.notFound('Deleted account');

  const deletedAt = new Date(data.deleted_at);
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  if (deletedAt < cutoff) {
    throw new AppError(
      'RECOVERY_EXPIRED',
      'The 30-day recovery window has expired. The account data has been permanently deleted.',
      410
    );
  }

  await profileRepo.restoreProfile(userId);
  logger.info('Account recovered', { userId });
}

export async function purgeExpiredAccounts() {
  const expired = await profileRepo.findExpiredDeletedProfiles();
  let purged = 0;

  for (const { id } of expired) {
    try {
      const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
      if (error) throw error;
      purged++;
      logger.info('Purged expired account', { userId: id });
    } catch (err) {
      logger.error('Failed to purge account', { userId: id, message: err.message });
    }
  }

  return purged;
}
