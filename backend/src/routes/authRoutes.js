import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { signup, verifySignup, resendSignupCode, login, logout, me, startDemoSession, forgotPassword, resetPassword } from '../controllers/authController.js';
import protect from '../middleware/auth.js';
import { signupRules, loginRules, forgotPasswordRules, resetPasswordRules, verifySignupRules, resendSignupRules, handleValidation } from '../middleware/validate.js';

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

const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many sign-up attempts. Please try again later.' },
});

const resetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many reset requests. Please try again in an hour.' },
});

router.post('/forgot-password', resetLimiter, forgotPasswordRules, handleValidation, forgotPassword);
router.post('/reset-password', authLimiter, resetPasswordRules, handleValidation, resetPassword);
router.post('/signup', signupLimiter, signupRules, handleValidation, signup);
router.post('/signup/verify', authLimiter, verifySignupRules, handleValidation, verifySignup);
router.post('/signup/resend', signupLimiter, resendSignupRules, handleValidation, resendSignupCode);
router.post('/login', authLimiter, loginRules, handleValidation, login);
router.post('/logout', logout);
router.post('/demo', demoLimiter, startDemoSession);
router.get('/me', protect, me);

export default router;
