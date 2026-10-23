import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { validate, validateQuery } from '../middleware/validate.js';
import { createSessionSchema, sessionQuerySchema, historyQuerySchema } from '../validators/schemas.js';
import * as sessionController from '../controllers/sessionController.js';

const router = Router();

router.use(authenticate);
router.get('/', validateQuery(sessionQuerySchema), sessionController.listSessions);
router.post('/', validate(createSessionSchema), sessionController.createSession);

export default router;
