import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { validateQuery } from '../middleware/validate.js';
import { analyticsQuerySchema } from '../validators/schemas.js';
import * as analyticsController from '../controllers/analyticsController.js';

const router = Router();

router.use(authenticate);
router.get('/', validateQuery(analyticsQuerySchema), analyticsController.getAnalytics);

export default router;
