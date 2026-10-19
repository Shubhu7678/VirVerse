import { Router } from 'express';
import { listTasks, getTask } from '../controllers/taskController.js';
import protect from '../middleware/auth.js';

const router = Router();

router.use(protect);
router.get('/', listTasks);
router.get('/:slug', getTask);

export default router;
