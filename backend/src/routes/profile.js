import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { validate, validateQuery } from '../middleware/validate.js';
import { updateProfileSchema } from '../validators/schemas.js';
import * as profileController from '../controllers/profileController.js';

const router = Router();

router.use(authenticate);
router.get('/', profileController.getProfile);
router.patch('/', validate(updateProfileSchema), profileController.updateProfile);

export default router;
