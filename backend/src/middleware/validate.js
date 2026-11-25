import { body, validationResult } from 'express-validator';

const passwordRule = body('password')
  .isLength({ min: 8 })
  .withMessage('Password must be at least 8 characters')
  .matches(/[A-Za-z]/)
  .withMessage('Password must contain a letter')
  .matches(/\d/)
  .withMessage('Password must contain a number');

export const signupRules = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 80 }),
  body('email').trim().isEmail().withMessage('Enter a valid email').normalizeEmail(),
  passwordRule,
];

export const verifySignupRules = [
  body('email').trim().isEmail().withMessage('Enter a valid email').normalizeEmail(),
  body('code').trim().matches(/^\d{6}$/).withMessage('Enter the 6-digit code'),
];

export const resendSignupRules = [body('email').trim().isEmail().withMessage('Enter a valid email').normalizeEmail()];

export const forgotPasswordRules = [body('email').trim().isEmail().withMessage('Enter a valid email').normalizeEmail()];

export const resetPasswordRules = [
  body('token').isString().isLength({ min: 32, max: 200 }).withMessage('This reset link is not valid'),
  passwordRule,
];

export const studentEditRules = [
  body('name').optional().trim().notEmpty().withMessage('Name is required').isLength({ max: 80 }),
  body('email').optional().trim().isEmail().withMessage('Enter a valid email').normalizeEmail(),
];

export const loginRules = [
  body('email').trim().isEmail().withMessage('Enter a valid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

export function handleValidation(req, res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) return next();
  const errors = {};
  for (const e of result.array()) errors[e.path] ??= e.msg;
  res.status(400).json({ message: Object.values(errors)[0], errors });
}
