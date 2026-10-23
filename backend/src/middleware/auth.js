import { supabaseAnon, supabaseAdmin } from '../config/supabase.js';
import { Errors } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(Errors.unauthorized());
  }

  const token = authHeader.slice(7);

  try {
    const { data, error } = await supabaseAnon.auth.getUser(token);
    if (error || !data.user) {
      return next(Errors.unauthorized());
    }

    const userId = data.user.id;

    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('deleted_at')
      .eq('id', userId)
      .maybeSingle();

    if (profileError) {
      logger.error('Auth profile lookup failed', { message: profileError.message });
      return next(Errors.internal());
    }

    if (profileData?.deleted_at) {
      return next(Errors.accountDeleted());
    }

    req.user = data.user;
    req.userId = userId;
    return next();
  } catch (err) {
    logger.error('Auth middleware error', { message: err.message });
    return next(Errors.unauthorized());
  }
}
