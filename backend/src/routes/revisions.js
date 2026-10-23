import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { validate, validateQuery } from '../middleware/validate.js';
import { createRevisionSchema, updateRevisionSchema, revisionQuerySchema } from '../validators/schemas.js';
import * as revisionController from '../controllers/revisionController.js';

const router = Router();

router.use(authenticate);
router.get('/', validateQuery(revisionQuerySchema), revisionController.listRevisions);
router.post('/', validate(createRevisionSchema), revisionController.createRevision);
router.patch('/:id', validate(updateRevisionSchema), revisionController.updateRevision);

export default router;
