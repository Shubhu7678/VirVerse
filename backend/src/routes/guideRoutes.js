import { Router } from 'express';
import { listGuide, getGuideLesson } from '../controllers/guideController.js';
import protect from '../middleware/auth.js';

const router = Router();

router.use(protect);
router.get('/:language', listGuide);
router.get('/:language/:slug', getGuideLesson);

export default router;
