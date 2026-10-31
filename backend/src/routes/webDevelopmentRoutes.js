import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { body, param } from 'express-validator';
import { listHtmlProgress, saveHtmlProgress } from '../controllers/webDevelopmentController.js';
import { HTML_TASK_IDS } from '../models/WebDevelopmentProgress.js';
import protect from '../middleware/auth.js';
import { handleValidation } from '../middleware/validate.js';

const router = Router();

const saveLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  keyGenerator: (req) => String(req.user._id),
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'You are saving too often. Please wait a moment.' },
});

const taskIdRule = param('taskId').isIn(HTML_TASK_IDS).withMessage('HTML task is invalid');
const saveRules = [
  body('code').optional({ values: 'undefined' }).isString().withMessage('Code must be text')
    .bail().isLength({ max: 20000 }).withMessage('Code must be 20,000 characters or fewer'),
  body('completed').optional({ values: 'undefined' }).isBoolean().withMessage('Completion status must be a boolean')
    .toBoolean(),
];

router.use(protect);
router.get('/html/progress', listHtmlProgress);
router.put('/html/progress/:taskId', saveLimiter, taskIdRule, saveRules, handleValidation, saveHtmlProgress);

export default router;
