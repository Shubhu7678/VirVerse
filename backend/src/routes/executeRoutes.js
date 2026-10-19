import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { body } from 'express-validator';
import { createInteractiveRunnerTicket, execute } from '../controllers/executeController.js';
import protect from '../middleware/auth.js';
import { handleValidation } from '../middleware/validate.js';
import { MAX_CODE_LENGTH, MAX_STDIN_LENGTH } from '../services/executor/limits.js';

const router = Router();

const runLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  keyGenerator: (req) => String(req.user._id),
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'You are running code too fast. Please wait a moment.' },
});

const rules = [
  body('code')
    .isString()
    .withMessage('Code is required')
    .bail()
    .isLength({ min: 1, max: MAX_CODE_LENGTH })
    .withMessage(`Code must be between 1 and ${MAX_CODE_LENGTH} characters`),
  body('stdin').optional().isString().isLength({ max: MAX_STDIN_LENGTH }).withMessage('Input is too long'),
];

router.post('/', protect, runLimiter, rules, handleValidation, execute);
router.post('/interactive-ticket', protect, runLimiter, createInteractiveRunnerTicket);

export default router;
