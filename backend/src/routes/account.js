import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import * as accountController from '../controllers/accountController.js';
import * as profileService from '../services/profileService.js';
import { success } from '../utils/response.js';
import { supabaseAnon } from '../config/supabase.js';
import { Errors } from '../utils/errors.js';

const router = Router();

router.use(authLimiter);
router.delete('/', authenticate, accountController.deleteAccount);
router.post('/recover', async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;
    if (!authorization?.startsWith('Bearer ')) return next(Errors.unauthorized());
    const { data, error } = await supabaseAnon.auth.getUser(authorization.slice(7));
    if (error || !data.user) return next(Errors.unauthorized());
    req.userId = data.user.id;
    await profileService.recoverAccount(req.userId);
    return success(res, { recovered: true });
  } catch (error) {
    return next(error);
  }
});

export default router;
