import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createSubjectSchema, updateSubjectSchema } from '../validators/schemas.js';
import * as subjectController from '../controllers/subjectController.js';

const router = Router();

router.use(authenticate);
router.get('/', subjectController.listSubjects);
router.post('/', validate(createSubjectSchema), subjectController.createSubject);
router.patch('/:id', validate(updateSubjectSchema), subjectController.updateSubject);
router.delete('/:id', subjectController.deleteSubject);

export default router;
