import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { signup, login, logout, me, startDemoSession } from '../controllers/authController.js';
import protect from '../middleware/auth.js';
import { signupRules, loginRules, handleValidation } from '../middleware/validate.js';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts, please try again later' },
});

const demoLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many demo sessions started. Please try again later.' },
});

router.post('/signup', authLimiter, signupRules, handleValidation, signup);
router.post('/login', authLimiter, loginRules, handleValidation, login);
router.post('/logout', logout);
router.post('/demo', demoLimiter, startDemoSession);
router.get('/me', protect, me);

export default router;
