import { Router } from 'express';
import { supabaseAdmin, supabaseAnon } from '../config/supabase.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { AppError } from '../utils/errors.js';
import { requireString } from '../lib/validation.js';
import { success } from '../utils/response.js';

const router = Router();
router.use(authLimiter);

function credentials(body) {
  const email = requireString(body.email, 'email', { max: 254 }).toLowerCase();
  const password = requireString(body.password, 'password', { min: 8, max: 128 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new AppError('VALIDATION_ERROR', 'A valid email address is required.');
  return { email, password };
}

router.post('/signup', async (req, res, next) => {
  try {
    const { email, password } = credentials(req.body);
    const displayName = req.body.fullName === undefined ? undefined : requireString(req.body.fullName, 'fullName', { max: 100 });
    const { data, error } = await supabaseAnon.auth.signUp({
      email,
      password,
      options: { data: displayName ? { display_name: displayName, full_name: displayName } : undefined },
    });
    if (error) {
      const status = error.status === 422 ? 409 : 400;
      return next(new AppError('SIGNUP_FAILED', status === 409 ? 'An account with this email already exists.' : error.message, status));
    }
    return success(res, {
      user: data.user,
      session: data.session,
      requires_email_confirmation: data.session === null,
    }, 201);
  } catch (error) {
    return next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = credentials(req.body);
    const { data, error } = await supabaseAnon.auth.signInWithPassword({ email, password });
    if (error || !data.session) return next(new AppError('LOGIN_FAILED', 'Invalid email or password.', 401));
    return success(res, { user: data.user, session: data.session });
  } catch (error) {
    return next(error);
  }
});

router.post('/refresh', async (req, res, next) => {
  try {
    const refreshToken = requireString(req.body.refresh_token, 'refresh_token', { max: 4096 });
    const { data, error } = await supabaseAnon.auth.refreshSession({ refresh_token: refreshToken });
    if (error || !data.session) return next(new AppError('REFRESH_FAILED', 'Session expired. Please sign in again.', 401));
    return success(res, { user: data.user, session: data.session });
  } catch (error) {
    return next(error);
  }
});

router.get('/me', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
    if (!token) return next(new AppError('UNAUTHORIZED', 'Authentication required.', 401));
    const { data, error } = await supabaseAnon.auth.getUser(token);
    if (error || !data.user) return next(new AppError('UNAUTHORIZED', 'Authentication required.', 401));
    return success(res, { user: data.user });
  } catch (error) {
    return next(error);
  }
});

router.post('/logout', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
    if (!token) return next(new AppError('UNAUTHORIZED', 'Authentication required.', 401));
    const { error } = await supabaseAdmin.auth.admin.signOut(token, 'local');
    if (error) return next(new AppError('LOGOUT_FAILED', 'Could not end this session.', 401));
    return success(res, { signed_out: true });
  } catch (error) {
    return next(error);
  }
});

export default router;
