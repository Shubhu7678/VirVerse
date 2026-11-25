import { randomBytes, randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import PendingSignup from '../models/PendingSignup.js';
import { logActivity } from '../services/activity.js';
import { findUserByResetToken, issueResetLink } from '../services/passwordReset.js';
import { sendMail, resetEmail, verifyEmail } from '../services/mailer.js';
import { CODE_TTL_MS, RESEND_COOLDOWN_MS, MAX_ATTEMPTS, MAX_SENDS, generateCode, hashCode, codeMatches, isExpired, secondsUntilResend } from '../services/signupVerification.js';
import { setAuthCookie, clearAuthCookie } from '../utils/token.js';

const DEMO_SESSION_MS = 24 * 60 * 60 * 1000;

// Step 1: nothing is created yet. We keep the details aside and email a 6-digit code.
export async function signup(req, res) {
  const { name, email, password } = req.body;

  if (await User.exists({ email })) {
    return res
      .status(409)
      .json({ message: 'Email already registered', errors: { email: 'Email already registered' } });
  }

  const code = generateCode();
  const now = Date.now();
  await PendingSignup.findOneAndUpdate(
    { email },
    {
      name,
      passwordHash: await bcrypt.hash(password, 12),
      codeHash: hashCode(email, code),
      expiresAt: new Date(now + CODE_TTL_MS),
      attempts: 0,
      lastSentAt: new Date(now),
      sentCount: 1,
    },
    { upsert: true, new: true },
  );

  const { sent } = await deliverCode(name, email, code);
  if (!sent && process.env.NODE_ENV === 'production') {
    await PendingSignup.deleteOne({ email });
    return res.status(503).json({ message: 'We could not send the verification email. Please try again later.' });
  }
  res.status(202).json({ email, expiresInSeconds: CODE_TTL_MS / 1000, resendInSeconds: RESEND_COOLDOWN_MS / 1000 });
}

const deliverCode = (name, email, code) => {
  const { subject, text } = verifyEmail(name, code);
  return sendMail({ to: email, subject, text, type: 'signup-code' });
};

// Step 2: the right code turns the pending sign-up into a real account and signs the user in.
export async function verifySignup(req, res) {
  const { email, code } = req.body;
  const pending = await PendingSignup.findOne({ email });
  if (!pending || isExpired(pending)) {
    if (pending) await PendingSignup.deleteOne({ _id: pending._id });
    return res.status(400).json({ message: 'This code has expired. Go back and request a new one.', code: 'CODE_EXPIRED' });
  }
  if (!codeMatches(pending, code)) {
    pending.attempts += 1;
    if (pending.attempts >= MAX_ATTEMPTS) {
      await PendingSignup.deleteOne({ _id: pending._id });
      return res.status(400).json({ message: 'Too many wrong codes. Please start again.', code: 'TOO_MANY_ATTEMPTS' });
    }
    await pending.save();
    return res.status(400).json({ message: `That code is not right. ${MAX_ATTEMPTS - pending.attempts} tries left.`, code: 'WRONG_CODE' });
  }
  if (await User.exists({ email })) {
    await PendingSignup.deleteOne({ _id: pending._id });
    return res.status(409).json({ message: 'Email already registered' });
  }

  // insertMany skips the save hook, so the already-hashed password is not hashed twice.
  const [user] = await User.insertMany([{ name: pending.name, email: pending.email, password: pending.passwordHash }]);
  await PendingSignup.deleteOne({ _id: pending._id });
  await logActivity({ type: 'student.signup', target: user._id, message: `${user.name} (${user.email}) signed up` });
  setAuthCookie(res, user._id);
  res.status(201).json({ user: user.toSafeObject() });
}

export async function resendSignupCode(req, res) {
  const { email } = req.body;
  const pending = await PendingSignup.findOne({ email });
  if (!pending) return res.status(400).json({ message: 'Start the sign-up again.', code: 'CODE_EXPIRED' });
  const wait = secondsUntilResend(pending);
  if (wait > 0) return res.status(429).json({ message: `Please wait ${wait} seconds before asking for another code.`, retryAfter: wait });
  if (pending.sentCount >= MAX_SENDS) {
    await PendingSignup.deleteOne({ _id: pending._id });
    return res.status(429).json({ message: 'Too many codes requested. Please start again later.', code: 'TOO_MANY_SENDS' });
  }

  const code = generateCode();
  pending.codeHash = hashCode(email, code);
  pending.expiresAt = new Date(Date.now() + CODE_TTL_MS);
  pending.attempts = 0;
  pending.lastSentAt = new Date();
  pending.sentCount += 1;
  await pending.save();
  await deliverCode(pending.name, email, code);
  res.json({ resendInSeconds: RESEND_COOLDOWN_MS / 1000, expiresInSeconds: CODE_TTL_MS / 1000 });
}

export async function login(req, res) {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || user.isDemo || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  if (user.disabled) return res.status(403).json({ message: 'This account is disabled. Contact your admin.' });

  setAuthCookie(res, user._id);
  res.json({ user: user.toSafeObject() });
}

export function logout(_req, res) {
  clearAuthCookie(res);
  res.json({ message: 'Logged out' });
}

export function me(req, res) {
  res.json({ user: req.user.toSafeObject() });
}

export async function startDemoSession(_req, res) {
  const demoExpiresAt = new Date(Date.now() + DEMO_SESSION_MS);
  const user = await User.create({
    name: 'Demo Learner',
    email: `demo-${randomUUID()}@demo.virverse.invalid`,
    password: randomBytes(32).toString('hex'),
    isDemo: true,
    demoExpiresAt,
  });

  setAuthCookie(res, user._id, {
    maxAge: DEMO_SESSION_MS,
    expiresIn: Math.floor(DEMO_SESSION_MS / 1000),
  });
  res.set('Cache-Control', 'no-store');
  res.status(201).json({ user: user.toSafeObject() });
}

const FORGOT_MESSAGE = 'If an account exists for that email, a reset link is on its way. It works for 1 hour.';

// Always answers the same way, so the form cannot be used to find out who has an account.
export async function forgotPassword(req, res) {
  const user = await User.findOne({ email: req.body.email, isDemo: false, disabled: { $ne: true } });
  if (user) {
    const { link } = await issueResetLink(user);
    const { subject, text } = resetEmail(user.name, link);
    await sendMail({ to: user.email, subject, text, type: 'password-reset' });
  }
  res.json({ message: FORGOT_MESSAGE });
}

export async function resetPassword(req, res) {
  const user = await findUserByResetToken(req.body.token);
  if (!user || user.disabled) {
    return res.status(400).json({ message: 'This reset link is invalid or has expired. Request a new one.' });
  }
  user.password = req.body.password;
  user.passwordResetHash = null;
  user.passwordResetExpiresAt = null;
  user.passwordChangedAt = new Date();
  await user.save();
  await logActivity({ type: 'password.reset', target: user._id, message: `${user.name} reset their password` });
  clearAuthCookie(res);
  res.json({ message: 'Your password was changed. You can sign in now.' });
}
