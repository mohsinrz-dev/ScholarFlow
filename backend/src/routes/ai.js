import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rateLimiter.js';
import { validate } from '../middleware/validate.js';
import { aiTutorSchema } from '../validators/schemas.js';
import * as aiController from '../controllers/aiController.js';

const router = Router();

router.use(authenticate);
router.post('/tutor', aiLimiter, validate(aiTutorSchema), aiController.tutorMessage);
router.get('/conversations', aiController.listConversations);
router.get('/conversations/:id', aiController.getConversation);
router.delete('/conversations/:id', aiController.deleteConversation);

export default router;
