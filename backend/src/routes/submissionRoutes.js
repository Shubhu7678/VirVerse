import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { body } from 'express-validator';
import { createSubmission, listSubmissionActivity, listSubmissions } from '../controllers/submissionController.js';
import protect from '../middleware/auth.js';
import { handleValidation } from '../middleware/validate.js';
import { MAX_CODE_LENGTH } from '../services/executor/limits.js';

const router = Router();

const submitLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  keyGenerator: (req) => String(req.user._id),
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'You are submitting too fast. Please wait a moment.' },
});

const rules = [
  body('taskSlug').isString().notEmpty().withMessage('Task is required'),
  body('assignmentId').optional().isMongoId().withMessage('Assignment is invalid'),
  body('code')
    .isString()
    .withMessage('Code is required')
    .bail()
    .isLength({ min: 1, max: MAX_CODE_LENGTH })
    .withMessage(`Code must be between 1 and ${MAX_CODE_LENGTH} characters`),
];

router.use(protect);
router.get('/activity', listSubmissionActivity);
router.get('/', listSubmissions);
router.post('/', submitLimiter, rules, handleValidation, createSubmission);

export default router;
