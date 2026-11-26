import { Router } from 'express';
import { listTasks, overview, getTask, getTaskSolution } from '../controllers/taskController.js';
import protect from '../middleware/auth.js';

const router = Router();

router.use(protect);
router.get('/', listTasks);
router.get('/overview', overview);
router.get('/:slug/solution', getTaskSolution);
router.get('/:slug', getTask);

export default router;
