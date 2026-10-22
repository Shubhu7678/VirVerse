import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { signup, login, logout, me, demoCredentials } from '../controllers/authController.js';
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

router.post('/signup', authLimiter, signupRules, handleValidation, signup);
router.post('/login', authLimiter, loginRules, handleValidation, login);
router.post('/logout', logout);
router.get('/demo-credentials', authLimiter, demoCredentials);
router.get('/me', protect, me);

export default router;
