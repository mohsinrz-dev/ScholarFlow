import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { validateQuery } from '../middleware/validate.js';
import { historyQuerySchema } from '../validators/schemas.js';
import * as sessionController from '../controllers/sessionController.js';

const router = Router();

router.use(authenticate);
router.get('/', validateQuery(historyQuerySchema), sessionController.getHistory);

export default router;
