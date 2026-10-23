import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { validate, validateQuery } from '../middleware/validate.js';
import { createTaskSchema, updateTaskSchema, taskQuerySchema } from '../validators/schemas.js';
import * as taskController from '../controllers/taskController.js';

const router = Router();

router.use(authenticate);
router.get('/', validateQuery(taskQuerySchema), taskController.listTasks);
router.post('/', validate(createTaskSchema), taskController.createTask);
router.get('/:id', taskController.getTask);
router.patch('/:id', validate(updateTaskSchema), taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

export default router;
