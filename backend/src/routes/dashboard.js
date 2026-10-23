import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import * as analyticsController from '../controllers/analyticsController.js';

const router = Router();

router.use(authenticate);
router.get('/', analyticsController.getDashboard);

export default router;
