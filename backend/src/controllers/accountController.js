import { success } from '../utils/response.js';
import * as profileService from '../services/profileService.js';
import { Errors } from '../utils/errors.js';
import { supabaseAdmin } from '../config/supabase.js';

export async function deleteAccount(req, res, next) {
  try {
    await profileService.scheduleAccountDeletion(req.userId);
    const token = req.headers.authorization.slice(7);
    const { error } = await supabaseAdmin.auth.admin.signOut(token, 'local');
    if (error) throw Errors.internal();
    return success(res, {
      message: 'Your account has been scheduled for deletion and can be recovered within 30 days.',
      recoverable_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });
  } catch (err) {
    return next(err);
  }
}
